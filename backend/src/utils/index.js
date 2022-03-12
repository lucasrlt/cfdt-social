import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import csv from "csv-parser";
import Expo from "expo-server-sdk";
import User from "../models/User";
import strings from "../../strings.json";

export const RenderableError = (message) => ({
  renderable: true,
  message,
});

export const parse_csv = (path, callback, separator = ";") => {
  const results = [];
  fs.createReadStream(path, { encoding: "latin1" })
    .pipe(
      csv({
        separator,
      })
    )
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", async () => {
      callback(results);
    });
};

export const hash_password = (password, callback) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });
};

export const check_password = (password, hash, callback) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
};

export const generate_password = () => {
  var pwdChars = "0123456789ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz";
  var pwdLen = 12;
  var randPassword = Array(pwdLen)
    .fill(pwdChars)
    .map(function (x) {
      return x[Math.floor(Math.random() * x.length)];
    })
    .join("");
  return randPassword;
};

export const generate_jwt = (user) => {
  return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: 31556926 });
};

export const jwtVerify = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.sendStatus(403);
  }

  const token = header.split(" ")[1];
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) res.sendStatus(500);
    else {
      const user_db = await User.findOne({ _id: user._id });
      if (
        req.url !== "/removeNotificationToken" &&
        (user_db.is_banned || user_db.is_archived)
      )
        res.status(403).send(strings.errors.USER_BANNED);
      else {
        req.user = user_db;
        next();
      }
    }
  });
};

export const generate_random_id = (length) => {
  var result = "";
  var characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const store_file = (file, keep_name = false) => {
  const id = generate_random_id(128);

  let file_split = file.name.split(".");
  const extension = file_split[file_split.length - 1];

  let filename = id + "." + (keep_name ? file_split[0] + "." : "") + extension;

  file.mv(path.join(process.env.UPLOAD_PATH, filename));

  return filename;
};

export const delete_file = async (file) => {
  await fs.unlink(file, () => {});
};

export const check_file_size = (file, max_size) => {
  if (file.size / 1e6 > max_size) {
    return false;
  }
  return true;
};

export const get_filepath = (filename) => {
  return path.join(process.env.UPLOAD_PATH, filename);
};

export const encrypt_message = (message) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", process.env.MSG_AES, iv);

  let encrypted = cipher.update(message);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return { iv: iv.toString("hex"), encrypted: encrypted.toString("hex") };
};

export const decrypt_message = (encrypted, iv) => {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.MSG_AES,
    Buffer.from(iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(encrypted, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]).toString();

  return decrypted;
};

export const get_unique_hash = (id1, id2) => {
  const first_id = id1 < id2 ? id1 : id2;
  const second_id = id1 < id2 ? id2 : id1;

  const id = crypto
    .createHash("sha256")
    .update(first_id + second_id)
    .digest("hex");

  return id;
};

export const send_notification = async (pushTokens, message) => {
  let expo = new Expo();
  const { title, body } = message;
  const messages = pushTokens.map((to) => ({ title, body, to }));

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];
  const ticket_push_tokens = {};

  for (let chunk of chunks) {
    try {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);

      ticketChunk.forEach((c, idx) => (ticket_push_tokens[c.id] = chunk[idx]));
    } catch (err) {
      console.log(err);
    }
  }

  let receiptIds = [];
  for (let ticket of tickets) {
    if (ticket.id) {
      receiptIds.push(ticket.id);
    }
  }

  let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
  (async () => {
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === "ok") {
            continue;
          } else if (status === "error") {
            if (details && details.error === "DeviceNotRegistered") {
              console.log(
                "User uninstalled, removing: ",
                ticket_push_tokens[receiptId]
              );

              // Remove the push token from the database
              await User.updateMany(
                { notification_token: ticket_push_tokens[receiptId].to },
                { $set: { notification_token: "" } }
              );
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  })();
};
