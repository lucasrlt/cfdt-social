import mongoose, { Schema } from "mongoose";

// Create a new Mongoose UserSchema with a number and name field
const UserSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  npa: {
    type: Number,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  hasLoggedIn: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: false,
  },
  avatar_uri: {
    type: String,
    required: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  is_banned: {
    type: Boolean,
    default: false,
  },
  notification_token: {
    type: String,
    default: "",
  },
});

UserSchema.statics.findByNpa = function (npa, filter = "") {
  return this.findOne({ npa }, filter);
};

export default mongoose.model("users", UserSchema);
