const mongoose = require("mongoose");

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
    createdAt: String,
    content: String,
    likes: Array
});

commentSchema.pre("save", (next) => {
    const date = new Date();
    const dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/"
                     + date.getFullYear();
    this.createdAt = dateString;
});

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;