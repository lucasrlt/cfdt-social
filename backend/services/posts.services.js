import Post from "../models/Post";
import User from "../models/User";
import { delete_file, get_filepath, RenderableError } from "../utils";
import strings from "../strings.json";

export const create_new_post = async (npa, content, medias) => {
  if (!content) {
    throw new RenderableError(strings.errors.POST_EMPTY);
  }

  const author = await User.findByNpa(npa);

  console.log(medias);
  const post = new Post({
    author,
    content,
    medias,
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
  };

  return new_post;
};

export const get_all_posts = async (npa) => {
  const user = await User.findByNpa(npa);
  const posts = await Post.aggregate([
    {
      $project: {
        content: "$content",
        dateCreated: "$dateCreated",
        author: "$author",
        medias: "$medias",
        commentsCount: { $size: "$comments" },
        likesCount: { $size: "$likes" },
        isLiked: { $cond: [{ $in: [user._id, "$likes"] }, true, false] },
        isAuthor: { $cond: [{ $eq: [user._id, "$author"] }, true, false] },
      },
    },
  ]);

  const populated = await Post.populate(posts, {
    path: "author",
    select: "username avatar_uri is_admin",
  });

  const sorted = populated.sort((a, b) => b.dateCreated - a.dateCreated);

  return populated;
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
    console.log("Deleting: ", get_filepath(media.uri));
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

  const comment = { author, content };

  const res = await Post.updateOne(
    { _id: post_id },
    { $push: { comments: comment } }
  );

  console.log("Updated: ", res);
  return res;
};

export const get_comments = async (post_id) => {
  const post = await Post.findById(post_id, "comments").populate(
    "comments.author",
    "username avatar_uri"
  );

  const sorted = post.comments.sort((a, b) => b.dateCreated - a.dateCreated);

  return sorted;
};
