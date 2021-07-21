var express = require("express");
var path = require("path");

import * as controller from "../controllers/users.controller";
import { jwtVerify } from "../utils";

var router = express.Router();

// User sync
router.get("/sync", controller.getUserSync);
router.post("/sync", controller.postUserSync);

// User registration/login
router.get("/hasLoggedIn", controller.hasLoggedIn);
router.post("/login", controller.postLogin);
router.post("/setupProfile", jwtVerify, controller.postSetupProfile);
router.get("/avatar", controller.getAvatar);

module.exports = router;
