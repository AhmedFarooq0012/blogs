import mongoose from "mongoose";
const postSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  image: { type: String },
  status: {
    type: String,
    enum: ["Draft", "Published"],
    default: "Draft",
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId,
     ref: "User",
      required: true 
    },
    likes:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    }],
},{ timestamps: true });

const Post = mongoose.models.Post || mongoose.model("Post", postSchema);
export default Post;
