import crypto from "crypto";
import Message from "../models/Message";
import User from "../models/User";
import {
  decrypt_message,
  encrypt_message,
  get_unique_hash,
  send_notification,
} from "../utils";

// Encrypt and store the message
export const new_message = async (from_npa, to, message) => {
  if (!message) throw { status: 403 };

  const from = await User.findByNpa(from_npa, "_id");
  const toDb = await User.findById(to, "notification_token username");

  const { iv, encrypted: encMessage } = encrypt_message(message.trim());

  const message_db = new Message({
    from: from._id,
    to,
    encMessage,
    iv: iv.toString("hex"),
    conversation: get_unique_hash(from._id, to),
  });

  const res = await message_db.save();

  if (toDb.notification_token) {
    send_notification([toDb.notification_token], {
      title: from.username,
      body: message.substring(0, 255),
    });
  }

  return { message, dateCreated: res.created, _id: res._id };
};

export const get_all_conversations = async (npa) => {
  const user = await User.findByNpa(npa, "_id");

  const excluded_fields = {
    last_name: 0,
    name: 0,
    email: 0,
    password: 0,
    hasLoggedIn: 0,
    npa: 0,
    is_admin: 0,
  };
  const conversation_messages = await Message.aggregate([
    { $match: { $or: [{ from: user._id }, { to: user._id }] } },
    { $sort: { dateCreated: -1 } },
    { $group: { _id: "$conversation", doc: { $last: "$$ROOT" } } },
    {
      $lookup: {
        from: "users",
        localField: "doc.from",
        foreignField: "_id",
        as: "doc.from",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "doc.to",
        foreignField: "_id",
        as: "doc.to",
      },
    },
    {
      $project: {
        "doc.from": excluded_fields,
        "doc.to": excluded_fields,
      },
    },
    {
      $sort: { "doc.created": -1 },
    },
  ]);

  const result = conversation_messages.map(({ doc }) => {
    const withUser =
      String(doc.from[0]._id) === String(user._id) ? doc.to[0] : doc.from[0];
    const decrypted = decrypt_message(doc.encMessage, doc.iv);

    return {
      withUser,
      message: decrypted,
      lastUpdate: doc.created,
    };
  });

  return result;
};

export const get_all_messages = async (withUserId, npa) => {
  const user = await User.findByNpa(npa, "_id");

  const messages = await Message.find(
    {
      conversation: get_unique_hash(user._id, withUserId),
    },
    { conversation: 0 }
  );

  const result = messages.map((msg) => ({
    _id: msg._id,
    message: decrypt_message(msg.encMessage, msg.iv),
    from: msg.from,
    to: msg.to,
    created: msg.created,
  }));

  return result.sort((a, b) => b.created - a.created);
};
