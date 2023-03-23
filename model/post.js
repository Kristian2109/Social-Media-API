const mongoose = require("mongoose");
const { currentDateString } = require("./dataFunctions");

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
    createdAt: {
        type: String,
        default: currentDateString
    },
    likes: Array,
    photo: Buffer
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

postSchema.virtual("postedBy", {
    ref: "User",
    localField: "userId",
    foreignField: "_id",
    justOne: true
});

postSchema.virtual("comments", {
    ref: "Comment",
    localField: "_id",
    foreignField: "postId",
    justOne: false
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
