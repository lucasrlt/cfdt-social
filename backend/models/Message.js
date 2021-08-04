import mongoose, { Schema } from "mongoose";

// Create a new Mongoose UserSchema with a number and name field
const MessageSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: "users", required: true },
  to: { type: Schema.Types.ObjectId, ref: "users", required: true },
  encMessage: { type: String, required: true },
  iv: { type: String, required: true },
  created: { type: Date, default: Date.now },
  conversation: { type: String, required: true },
});

export default mongoose.model("messages", MessageSchema);
