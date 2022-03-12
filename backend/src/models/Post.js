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
    // list of images and videos in the publication
    type: [
      {
        type: {
          type: String,
          required: true,
          enum: ["Images", "Videos", "Documents", "poll"],
        },
        /**
         * The content field should contain, for each type of media:
         * - "image" => { uri: String }
         * - "video" => { uri: String }
         * - "document" => { uri: String, name: String }
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
  poll: {
    type: {
      question: { type: String, required: true },
      options: {
        type: [
          {
            title: { type: String, required: true },
            votesCount: { type: Number, required: true, default: 0 },
          },
        ],
        required: true,
      },
      answers: {
        type: [
          {
            user: { type: Schema.Types.ObjectId, ref: "users", required: true },
            answer: { type: Number, required: true },
          },
        ],
        default: [],
      },
    },
  },
});

export default mongoose.model("posts", PostSchema);
