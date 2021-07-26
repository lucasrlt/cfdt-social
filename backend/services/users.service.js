import User from "../models/User";
import strings from "../strings.json";
import {
  check_password,
  generate_jwt,
  generate_password,
  hash_password,
  RenderableError,
} from "../utils";
import { sendPassword } from "../utils/mailer";

// CSV field names
const NPA_FIELD = "NPA de l'adh�rent"; // unique key
const SURNAME_FIELD = "Nom de l'adh�rent";
const NAME_FIELD = "Pr�nom de l'adh�rent";
const EMAIL_FIELD = "Email personnel";

// All the fields that have to be updated if changed in the csv
const UPDATABLE_FIELDS = [SURNAME_FIELD, NAME_FIELD, EMAIL_FIELD];

/**
 * Fetch all users from @csv_data and import them to the mongo database.
 * @returns {Number} Num of users added
 **/
export async function synchronize_users_from_csv(csv_data) {
  let users_added = 0;

  const promises = csv_data.map(async (row) => {
    const existing_user = await User.findOne({ npa: row[NPA_FIELD] });

    if (!existing_user) {
      users_added++;

      return User.create({
        last_name: row[SURNAME_FIELD],
        name: row[NAME_FIELD],
        npa: row[NPA_FIELD],
        email: row[EMAIL_FIELD],
        username: row[NAME_FIELD] + " " + row[SURNAME_FIELD],
      });
    } else {
      // If one of the fields has changed, update it
      const fields_to_update = UPDATABLE_FIELDS.filter(
        (field) => row[field] !== existing_user[field]
      );
      if (fields_to_update.length > 0) {
        return existing_user.update({
          last_name: row[SURNAME_FIELD],
          name: row[NAME_FIELD],
          email: row[EMAIL_FIELD],
        });
      }
    }
  });

  await Promise.all(promises);

  return users_added;
}

/**
 * Return wether the given user exists in the database.
 * @param {String} npa NPA of the user
 * @returns {Boolean}
 */
export async function has_logged_in(npa) {
  const user = await User.findByNpa(npa);
  return user !== null && user.password !== undefined; // TOFIX
}

/**
 * When a user has not logged in, if it has an email
 * generate a random password, otherwise return an error.
 * @param {String} npa NPA of the user
 * @returns {Promise}
 */
export async function first_register(npa) {
  const user = await User.findByNpa(npa);
  if (user === null) throw RenderableError(strings.errors.LOGIN_NO_USER);
  if (!user.email)
    throw RenderableError(strings.errors.FIRST_REGISTER_NO_EMAIL);

  const password = generate_password();
  sendPassword(user.email, user.username, password);

  const hash = await hash_password(password);
  return user.update({ password: hash });
}

/**
 * Log in the user with NPA and password
 * @returns JWT if the user is logged in, otherwise return an error.
 */
export async function login(npa, password) {
  const user = await User.findByNpa(npa);
  if (user !== null) {
    const is_matching = await check_password(password, user.password);
    if (is_matching) {
      const { username, npa, hasLoggedIn, avatar_uri, is_admin } = user;

      return {
        jwt: generate_jwt({ username, npa, avatar_uri, is_admin }),
        isFirstLogin: !hasLoggedIn,
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
 */
export async function setup_profile(npa, password, username, avatar_uri) {
  const user = await User.findByNpa(npa);
  if (user !== null) {
    if (!username || username.length < 3) {
      throw RenderableError(strings.errors.USERNAME_TOO_SHORT);
    } else if (!password || password.length < 1) {
      throw RenderableError(strings.errors.PASSWORD_TOO_SHORT);
    }

    const hash = await hash_password(password);
    await user.update({
      username,
      hasLoggedIn: true,
      password: hash,
      avatar_uri,
    });

    return generate_jwt({ username, npa, avatar_uri, is_admin: user.is_admin });
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
    });
  }
}
