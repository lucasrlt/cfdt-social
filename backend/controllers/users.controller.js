import { check_file_size, parse_csv, store_file } from "../utils";
import * as usersService from "../services/users.service";
import path from "path";
import strings from "../strings.json";
import User from "../models/User";
import fs from "fs";

//////////////
//// USER SYNC
//////////////

export const getUserSync = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/sync_users.html"));
};

/**
 * POST /users/sync
 * Retrieve req.files.sync_file, parse it, and add new
 * users to the database.
 */
export const postUserSync = (req, res, next) => {
  const { sync_file } = req.files;
  if (!sync_file) {
    res.redirect(req.baseUrl + req.url);
  }

  try {
    var file = req.files.sync_file;
    const filename = store_file(file);
    const filepath = path.join(process.env.UPLOAD_PATH, filename);

    // Parse csv file
    parse_csv(filepath, async (results) => {
      const users_added = await usersService.synchronize_users_from_csv(
        results
      );
      fs.unlink(filepath, () => {});

      res.send("Adhérents ajoutés: " + users_added);
    });
  } catch (err) {
    next(err);
  }
};

//////////////
//// USER LOGIN/REGISTRATION
//////////////

/**
 * Returns true if the user has a password registered.
 * Called when an user enters NPA in the app, if the user is not registered
 * and has a mail adress, then generate a password for him.
 * @param {String} query.param.npa The user's npa
 */
export const hasLoggedIn = async (req, res, next) => {
  const { query } = req;

  try {
    if (query.npa) {
      const has_logged_in = await usersService.has_logged_in(query.npa);

      if (!has_logged_in) {
        await usersService.first_register(query.npa);
        return res.json(false);
      }

      res.json(has_logged_in);
    } else {
      res.status(403).send(strings.errors.EMPTY_FIELD);
    }
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { npa } = req.query;
    const has_logged_in = await usersService.has_logged_in(npa);

    if (has_logged_in) {
      await usersService.first_register(npa);
      return res.json(false);
    } else {
      return res.status(403).send(strings.errors.EMPTY_FIELD);
    }
  } catch (err) {
    next(err);
  }
};

/**
 * Tries to login the user with using a NPA and a password.
 * If it succeeds, generate and returns the generated jwt.
 * @param {String} req.body.npa The user's npa
 * @param {String} req.body.password The user's password
 */
export const postLogin = async (req, res, next) => {
  const { npa, password, notification_token } = req.body;

  try {
    const { jwt, isFirstLogin } = await usersService.login(
      npa,
      password,
      notification_token
    );

    res.json({ jwt, isFirstLogin });
  } catch (err) {
    next(err);
  }
};

/**
 * Change the password of the user.
 * Called after user's first connection.
 */
export const postSetupProfile = async (req, res, next) => {
  const { password, username, avatar_uri } = req.body;
  const { npa } = req.user;

  let avatar_path = null;
  if (req.files && req.files.avatar) {
    let avatar = req.files.avatar;
    if (!check_file_size(avatar, 5)) {
      return res.status(403).send(strings.errors.FILE_TOO_BIG.replace("[]", 5));
    }

    avatar_path = store_file(avatar);
  }

  try {
    const jwt = await usersService.setup_profile(
      npa,
      password,
      username,
      avatar_path
    );

    res.json({ jwt });
  } catch (err) {
    console.log(err);
    next(err);
  }
};

export const postUpdateProfile = async (req, res, next) => {
  const { username } = req.body;
  const { npa } = req.user;

  let avatar_path = null;
  if (req.files && req.files.avatar) {
    let avatar = req.files.avatar;
    if (!check_file_size(avatar, 5)) {
      return res.status(403).send(strings.errors.FILE_TOO_BIG.replace("[]", 5));
    }

    avatar_path = store_file(avatar);
  }

  try {
    const jwt = await usersService.update_profile(npa, username, avatar_path);
    res.json({ jwt });
  } catch (err) {
    next(err);
  }
};

/**
 * Returns the file requested
 * TODO: replace with nginx
 */
export const getAvatar = async (req, res, next) => {
  const { file } = req.query;
  if (file.includes("..") || file.includes(".csv")) return res.sendStatus(403);
  res.sendFile(path.join(process.env.UPLOAD_PATH + req.query.file));
};

export const getAllUsers = async (req, res, next) => {
  try {
    const { npa } = req.user;

    const users = await usersService.get_all_users(npa);
    res.json(users);
  } catch (err) {
    next(err);
  }
};

export const getRemoveToken = async (req, res, next) => {
  try {
    const { npa } = req.user;

    const users = await usersService.remove_token(npa);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};
