import mongoose from "mongoose";

// models/Post.js

const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  caption: String,
  post_url: String,
  likes: {
    type: Array,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type:{
    type:String,
    default:"image"
  }

});

const Post = mongoose.model("Post", postSchema);
export default Post;
