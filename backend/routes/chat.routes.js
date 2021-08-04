import express, { Router } from "express";
import * as controller from "../controllers/chat.controller";
import { jwtVerify } from "../utils";

let router = Router();

router.post("/new", jwtVerify, controller.postNewMessage);
router.get("/conversations", jwtVerify, controller.getAllConversations);
router.get("/all", jwtVerify, controller.getAllMessages);

module.exports = router;
