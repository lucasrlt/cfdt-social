import Post from "../models/Post";
import User from "../models/User";
import {
  delete_file,
  get_filepath,
  RenderableError,
  send_notification,
} from "../utils";
import strings from "../../strings.json";

export const create_new_post = async (npa, content, medias, poll) => {
  console.log("Hein", content);
  if (!content) {
    throw RenderableError(strings.errors.POST_EMPTY);
  }

  const author = await User.findByNpa(npa);

  const post = new Post({
    author,
    content: content.trim(),
    medias,
    poll,
  });

  const saved = await post.save();

  const new_post = {
    _id: saved._id,
    content: saved.content,
    dateCreated: saved.dateCreated,
    author,
    commentsCount: 0,
    likesCount: 0,
    isLiked: false,
    isAuthor: true,
    medias: saved.medias,
    poll,
  };
  if (new_post.poll) {
    new_post.poll.votesCount = 0;
  }

  if (author.is_admin) {
    let push_tokens = await User.find(
      {
        $and: [
          { notification_token: { $ne: null } },
          { notification_token: { $ne: "" } },
          { notification_token: { $ne: author.notification_token } },
        ],
      },
      "notification_token"
    );
    push_tokens = push_tokens.map((user) => user.notification_token);

    const message = {
      title: "Nouvelle publication CFDT",
      body: "Le syndicat CFDT Rhône a publié du contenu.",
    };

    send_notification(push_tokens, message);
  }

  return new_post;
};

export const get_all_posts = async (npa, options) => {
  const user = await User.findByNpa(npa);

  const lookup_step = [
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $project: {
        author: {
          last_name: 0,
          name: 0,
          password: 0,
          email: 0,
          npa: 0,
          hasLoggedIn: 0,
          should_reset_password: 0,
          _v: 0,
        },
      },
    },
    {
      $match: options.selfOnly
        ? { "author._id": user._id, "author.is_banned": { $ne: true } }
        : {
            "author.is_admin": options.adminOnly ? true : { $ne: true },
            "author.is_banned": { $ne: true },
          },
    },
  ];

  const poll_step = [
    {
      $addFields: {
        "poll.userAnswerTmp": {
          $cond: [
            { $ifNull: ["$poll.answers", false] },
            {
              $filter: {
                input: "$poll.answers",
                as: "answers",
                cond: { $eq: ["$$answers.user", user._id] },
              },
            },
            "$false",
          ],
        },
        "poll.votesCount": {
          $cond: [
            { $ifNull: ["$poll.answers", false] },
            { $size: "$poll.answers" },
            "$false",
          ],
        },
      },
    },
    {
      $addFields: {
        "poll.userAnswer": {
          $cond: [
            { $ifNull: ["$poll.answers", false] },
            { $arrayElemAt: ["$poll.userAnswerTmp", 0] },
            "$false",
          ],
        },
      },
    },
  ];

  const project_step = [
    {
      $project: {
        content: "$content",
        dateCreated: "$dateCreated",
        author: { $arrayElemAt: ["$author", 0] },
        medias: "$medias",
        commentsCount: { $size: "$comments" },
        likesCount: { $size: "$likes" },
        poll: "$poll",
        isLiked: { $cond: [{ $in: [user._id, "$likes"] }, true, false] },
      },
    },
    {
      $project: {
        content: 1,
        dateCreated: 1,
        author: 1,
        medias: 1,
        commentsCount: 1,
        likesCount: 1,
        poll: 1,
        isLiked: 1,
        isAuthor: {
          $cond: [{ $eq: [user._id, "$author._id"] }, true, false],
        },
      },
    },
    { $unset: ["poll.answers", "poll.userAnswerTmp", "poll.userAnswer.user"] },
  ];

  const sort_step = [
    {
      $sort: {
        [options.sort === "recent"
          ? "dateCreated"
          : options.sort === "hot"
          ? "likesCount"
          : "commentsCount"]: -1,
        _id: 1,
      },
    },
  ];

  const pagination_step = [
    { $skip: options.page * options.pageSize },
    { $limit: options.pageSize },
  ];

  const posts = await Post.aggregate([
    ...lookup_step,
    ...poll_step,
    ...project_step,
    ...sort_step,
    ...pagination_step,
  ]);

  return posts;
};

export const like_post = async (npa, post_id) => {
  const user = await User.findByNpa(npa);
  const post = await Post.findById(post_id);

  let cmd = post.likes.includes(user._id) ? "$pull" : "$push";
  return await post.update({ [cmd]: { likes: user._id } });
};

export const delete_post = async (npa, post_id) => {
  const user = await User.findByNpa(npa);
  const post = await Post.findById(post_id);

  post.medias.forEach((media) => {
    delete_file(get_filepath(media.uri));
  });

  if (user.is_admin || String(post.author) === String(user._id)) {
    return await Post.deleteOne({ _id: post._id });
  } else {
    throw { status: 403 };
  }
};

export const add_comment = async (npa, post_id, content) => {
  const author = await User.findByNpa(npa);

  if (!content) throw RenderableError(strings.errors.POST_EMPTY);

  const comment = { author, content: content.trim() };

  const res = await Post.updateOne(
    { _id: post_id },
    { $push: { comments: comment } }
  );

  return res;
};

export const get_comments = async (post_id) => {
  const post = await Post.findById(post_id, "comments").populate(
    "comments.author",
    "username avatar_uri is_banned is_admin"
  );

  const sorted = post.comments
    .filter((c) => !c.author.is_banned)
    .sort((a, b) => b.dateCreated - a.dateCreated);

  return sorted;
};

export const poll_vote = async (npa, post_id, option) => {
  const user = await User.findByNpa(npa);
  const post = await Post.findById(post_id);

  if (post.poll.options.length > option) {
    post.poll.answers.push({ user: user._id, answer: option });
    post.poll.options[option].votesCount++;
    post.markModified("poll");

    await post.save();

    post.poll.votesCount = post.poll.answers.length;
    post.poll.userAnswer = { answer: option };

    return post.poll;
  } else {
    throw { status: 403 };
  }
};

export const delete_comment = async (npa, post_id, comment_id) => {
  const user = await User.findByNpa(npa, "_id is_admin");
  const post = await Post.findById(post_id, "comments");

  let comment = post.comments.findIndex((c) => String(c._id) === comment_id);
  if (comment !== -1) {
    comment = post.comments[comment];

    if (!(user.is_admin || String(user._id) === String(comment.author))) {
      console.log("Salut");
      throw { status: 403 };
    }

    await post.update({ $pull: { comments: { _id: comment_id } } });
  }
};
