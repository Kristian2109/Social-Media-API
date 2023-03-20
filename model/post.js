const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    title: {
        type: String,
        required: true
    },
    content: String,
    createdAt: String,
    likes: Array,
    photo: Buffer
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

postSchema.pre("save", (next) => {
    const date = new Date();
    const dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/"
                     + date.getFullYear();
    this.createdAt = dateString;
});

postSchema.virtual("postedBy", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

postSchema.pre("save", (next) => {
    const date = new Date();
    const dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/"
                     + date.getFullYear();
    this.createdAt = dateString;
});

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
    justOne: false
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
