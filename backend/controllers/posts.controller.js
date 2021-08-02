import { NotExtended } from "http-errors";
import * as postsService from "../services/posts.services";
import strings from "../strings.json";
import { check_file_size, store_file } from "../utils";

export const postNewPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { npa } = req.user;

    // Handles media upload
    let medias = req.files ? req.files.medias : [];
    if (!medias.length) medias = [medias];

    const files = [];

    for (let media of medias) {
      const type =
        media.mimetype.split("/")[0] === "video" ? "Videos" : "Images";
      const max_size = type === "Images" ? 5 : 50;
      if (!check_file_size(media.size, max_size)) {
        return res
          .status(413)
          .send(strings.errors.FILE_TOO_BIG.replace("{}", max_size));
      }

      files.push({ type, uri: store_file(media) });
    }

    const post = await postsService.create_new_post(npa, text, files);
    res.json(post);
  } catch (err) {
    next(err);
  }
};

export const getAllPosts = async (req, res, next) => {
  try {
    const { admin } = req.query;

    const posts = await postsService.get_all_posts(req.user.npa);

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
