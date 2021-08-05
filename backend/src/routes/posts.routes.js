import express, { Router } from "express";
import * as controller from "../controllers/posts.controller";
import { jwtVerify } from "../utils";

let router = Router();

router.post("/new", jwtVerify, controller.postNewPost);
router.get("/all", jwtVerify, controller.getAllPosts);
router.post("/like", jwtVerify, controller.postLikePost);
router.post("/delete", jwtVerify, controller.deletePost);

router.post("/newComment", jwtVerify, controller.postNewComment);
router.get("/allComments", jwtVerify, controller.getAllComments);
router.post("/pollVote", jwtVerify, controller.postPollVote);
module.exports = router;
