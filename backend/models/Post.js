import mongoose, { Schema } from "mongoose";

const PostSchema = new Schema({
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "users", required: true },
  dateCreated: { type: String, default: Date.now },
  likes: { type: [Schema.Types.ObjectId], ref: "users", default: [] },
  comments: {
    type: [
      {
        content: { type: String, required: true },
        author: { type: Schema.Types.ObjectId, ref: "users", required: true },
        dateCreated: { type: String, default: Date.now },
      },
    ],
    default: [],
  },
});

export default mongoose.model("posts", PostSchema);
