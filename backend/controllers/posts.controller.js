import { NotExtended } from "http-errors";
import * as postsService from "../services/posts.services";
import strings from "../strings.json";

export const postNewPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const { npa } = req.user;

    const post = await postsService.create_new_post(npa, text);
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
