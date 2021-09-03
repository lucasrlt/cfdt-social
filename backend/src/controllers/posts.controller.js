import { NotExtended } from "http-errors";
import * as postsService from "../services/posts.services";
import strings from "../../strings.json";
import { check_file_size, store_file } from "../utils";

export const postNewPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { npa, is_admin } = req.user;

    console.log("Duuuh", text);
    const poll = JSON.parse(req.body.poll);
    if (poll && !is_admin) return res.sendStatus(403);
    if (poll) poll.options.forEach((opt) => (opt.votesCount = 0));

    // Handles media upload
    let medias = req.files ? req.files.medias : [];
    if (medias.length === undefined) medias = [medias];

    // Handle media storage
    const files = [];
    for (let media of medias) {
      const type =
        media.mimetype.split("/")[0] === "video" ? "Videos" : "Images";
      if (type === "video" && !is_admin) {
        return res.sendStatus(403);
      }

      const max_size = type === "Images" ? 5 : 50;
      if (!check_file_size(media, max_size)) {
        return res
          .status(413)
          .send(strings.errors.FILE_TOO_BIG.replace("{}", max_size));
      }

      files.push({ type, uri: store_file(media) });
    }

    const post = await postsService.create_new_post(npa, text, files, poll);
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const { adminOnly, sort, pageSize, page, selfOnly } = req.query;

    const posts = await postsService.get_all_posts(req.user.npa, {
      adminOnly,
      selfOnly,
      sort: sort || "recent",
      pageSize: Number(pageSize) || 10,
      page: Number(page) || 0,
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

export const postLikePost = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { npa } = req.user;

    await postsService.like_post(npa, id);

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.body;
    const { npa } = req.user;

    await postsService.delete_post(npa, id);

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const postNewComment = async (req, res, next) => {
  try {
    const { post_id, content } = req.body;
    const { npa } = req.user;

    const r = await postsService.add_comment(npa, post_id, content);
    res.status(200).json(r);
  } catch (err) {
    next(err);
  }
};

export const getAllComments = async (req, res, next) => {
  try {
    const { post_id } = req.query;

    const comments = await postsService.get_comments(post_id);
    res.status(200).json(comments);
  } catch (err) {
    next(err);
  }
};

export const postPollVote = async (req, res, next) => {
  try {
    const { post_id, option } = req.body;
    const { npa } = req.user;

    const poll = await postsService.poll_vote(npa, post_id, option);

    res.status(200).json(poll);
  } catch (err) {
    next(err);
  }
};

export const postDeleteComment = async (req, res, next) => {
  try {
    const { npa } = req.user;
    const { post_id, comment_id } = req.body;

    await postsService.delete_comment(npa, post_id, comment_id);

    return res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};
