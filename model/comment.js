const mongoose = require("mongoose");
const { currentDateString } = require("./dateFunction");

const commentSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true
    },
    title: String,
    createdAt: {
      type: String,
      default: currentDateString
  },
    content: String,
    likes: Array,
    image: Buffer
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;