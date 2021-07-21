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
});

UserSchema.statics.findByNpa = function (npa) {
  return this.findOne({ npa });
};

export default mongoose.model("users", UserSchema);
