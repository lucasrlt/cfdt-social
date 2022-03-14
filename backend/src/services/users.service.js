import User from "../models/User";
import strings from "../../strings.json";
import {
  check_password,
  generate_jwt,
  generate_password,
  hash_password,
  RenderableError,
} from "../utils";
import { sendPassword } from "../utils/mailer";

// CSV field names
const NPA_FIELD = "NPA de l'adhérent"; // unique key
const SURNAME_FIELD = "Nom de l'adhérent";
const NAME_FIELD = "Prénom de l'adhérent";
const EMAIL_FIELD = "Email personnel";

// All the fields that have to be updated if changed in the csv
const UPDATABLE_FIELDS = [SURNAME_FIELD, NAME_FIELD, EMAIL_FIELD];
const UPDATABLE_FIELDS_DB = ["last_name", "name", "email"];

const ADMIN_ACCOUNT = {
  [NPA_FIELD]: 111111111,
  [SURNAME_FIELD]: "Services 69",
  [NAME_FIELD]: "CFDT",
  [EMAIL_FIELD]: "cfdt.services69.app@gmail.com",
  is_admin: true,
};

/**
 * Fetch all users from @csv_data and import them to the mongo database.
 * @returns {Number} Num of users added
 **/
export async function synchronize_users_from_csv(csv_data) {
  let users_added = 0;
  let users_updated = 0;

  const mapped_npas = [];
  csv_data.push(ADMIN_ACCOUNT);
  const promises = csv_data.map(async (row) => {
    const existing_user = await User.findOne({ npa: row[NPA_FIELD] });
    mapped_npas.push(parseInt(row[NPA_FIELD]));

    if (!existing_user) {
      users_added++;

      return User.create({
        last_name: row[SURNAME_FIELD],
        name: row[NAME_FIELD],
        npa: row[NPA_FIELD],
        email: row[EMAIL_FIELD],
        username: row[NAME_FIELD] + " " + row[SURNAME_FIELD],
        is_admin: row.is_admin,
      });
    } else {
      // If one of the fields has changed, update it
      const fields_to_update = UPDATABLE_FIELDS.filter(
        (field, idx) => row[field] !== existing_user[UPDATABLE_FIELDS_DB[idx]]
      );

      // console.log(row[UPDATABLE_FIELDS[0]], existring_user[]);

      if (fields_to_update.length > 0) {
        users_updated++;

        return existing_user.update({
          $set: {
            last_name: row[SURNAME_FIELD],
            name: row[NAME_FIELD],
            email: row[EMAIL_FIELD],
          },
        });
      }
    }

    mapped_npas.push(123);

    await User.updateMany(
      { npa: { $in: mapped_npas } },
      { $set: { is_archived: false } }
    );

    await User.updateMany(
      { npa: { $nin: mapped_npas } },
      { $set: { is_archived: true } }
    );
  });

  await Promise.all(promises);

  return { users_added, users_updated };
}

/**
 * Return wether the given user exists in the database.
 * @param {String} npa NPA of the user
 * @returns {Boolean}
 */
export async function has_logged_in(npa) {
  const user = await User.findByNpa(npa);
  return user !== null && user.password !== undefined && user.password !== null; // TOFIX
}

/**
 * When a user has not logged in, if it has an email
 * generate a random password, otherwise return an error.
 * @param {String} npa NPA of the user
 * @returns {Promise}
 */
export async function first_register(npa, is_reset) {
  const user = await User.findByNpa(npa);
  if (user === null) throw RenderableError(strings.errors.LOGIN_NO_USER);
  if (!user.email)
    throw RenderableError(strings.errors.FIRST_REGISTER_NO_EMAIL);

  const password = generate_password();
  try {
    const email_sent = await sendPassword(user.email, user.username, password);
    if (!email_sent) throw RenderableError(strings.errors.EMAIL_ERROR);
  } catch (err) {
    console.log("[MAILING ERROR]", err);
    throw RenderableError(strings.errors.EMAIL_ERROR);
  }

  const hash = await hash_password(password);
  const options = { password: hash, should_reset_password: is_reset === true };
  return user.update(options);
}

/**
 * Log in the user with NPA and password
 * @returns JWT if the user is logged in, otherwise return an error.
 */
export async function login(npa, password, notification_token) {
  const user = await User.findByNpa(npa);
  if (user !== null) {
    const is_matching = await check_password(password, user.password);
    if (is_matching) {
      const { username, npa, hasLoggedIn, avatar_uri, is_admin, _id } = user;
      if (user.is_banned || user.is_archived) {
        throw RenderableError(strings.errors.USER_BANNED);
      }

      // Update notification token
      const prev_user = await User.updateOne(
        { notification_token },
        { $set: { notification_token: "" } }
      );

      user.notification_token = notification_token;
      await user.save();

      return {
        jwt: generate_jwt({
          username,
          npa,
          avatar_uri,
          is_admin,
          _id,
          notification_token,
        }),
        isFirstLogin: !hasLoggedIn,
        shouldResetPassword: user.should_reset_password,
      };
    } else {
      throw RenderableError(strings.errors.LOGIN_INVALID_PASSWORD);
    }
  } else {
    throw RenderableError(strings.errors.LOGIN_NO_USER);
  }
}

/**
 * Needs to be called on an authed route.
 * Change the password of the user, add a profile pic if given, and saves username
 * @password_only only change the password of the user, no username/avatar (used after password reset)
 */
export async function setup_profile(
  npa,
  password,
  username,
  avatar_uri,
  password_only
) {
  const user = await User.findByNpa(npa);
  if (user !== null) {
    if (!password_only && (!username || username.length < 3)) {
      throw RenderableError(strings.errors.USERNAME_TOO_SHORT);
    } else if (!password || password.length < 10) {
      throw RenderableError(strings.errors.PASSWORD_TOO_SHORT);
    }

    const hash = await hash_password(password);
    const options = password_only
      ? { password: hash, should_reset_password: false }
      : {
          username,
          hasLoggedIn: true,
          password: hash,
          avatar_uri,
        };

    await user.update(options);

    return generate_jwt({
      username: username || user.username,
      npa,
      avatar_uri: avatar_uri || user.avatar_uri,
      is_admin: user.is_admin,
      _id: user._id,
      notification_token: user.notification_token,
    });
  }
}

/**
 * Update the username and avatar of a profile,
 * and returns the new JWT
 */
export async function update_profile(npa, username, avatar_uri) {
  const user = await User.findByNpa(npa);
  if (user !== null) {
    if (!username || username.length < 3) {
      throw RenderableError(strings.errors.USERNAME_TOO_SHORT);
    }

    const fields = {
      username,
    };
    if (avatar_uri) fields.avatar_uri = avatar_uri;

    await user.update(fields);

    return generate_jwt({
      username,
      npa,
      avatar_uri: avatar_uri || user.avatar_uri,
      is_admin: user.is_admin,
      _id: user._id,
    });
  }
}

export async function get_all_users(npa) {
  const asking = await User.findByNpa(npa, "_id");
  const users = await User.find(
    { hasLoggedIn: true, _id: { $ne: asking._id }, is_banned: { $ne: true } },
    "_id username avatar_uri"
  );

  return users;
}

export async function remove_token(npa) {
  return await User.updateOne({ npa }, { $set: { notification_token: "" } });
}

export async function ban_user(npa, user_id) {
  const sender = await User.findByNpa(npa, "is_admin");
  if (!sender || !sender.is_admin) {
    throw { status: 403 };
  }

  const user = await User.findById(user_id, "is_admin");
  if (user.is_admin) {
    throw { status: 403 };
  }

  await User.updateOne({ _id: user_id }, { $set: { is_banned: true } });
  return true;
}
