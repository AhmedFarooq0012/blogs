import mongoose from "mongoose";
const CommentSchema = new mongoose.Schema(
  {
    commentText: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  { timestamps: true },
);
const Comment =
  mongoose.models.Comment || mongoose.model("Comment", CommentSchema);
export default Comment;