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
  medias: {
    type: [
      {
        type: {
          type: String,
          required: true,
          enum: ["Images", "Videos", "poll"],
        },
        /**
         * The content field should contain, for each type of media:
         * - "image" => { uri: String }
         * - "video" => { uri: String }
         * - "poll" => { question: String, options: [String], answers: [{ user: ObjectId, answer: Number }] }
         * Medias are identified in the content string with "[[[type]]]"
         */
        uri: {
          type: String,
          default: "",
        },
      },
    ],
  },
});

export default mongoose.model("posts", PostSchema);
