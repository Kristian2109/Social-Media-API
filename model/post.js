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

function currentDateString() {
    const date = new Date();
    return  date.getFullYear() + "/"+ (date.getMonth() + 1) + "/" +
            date.getDate() + "/" + date.getHours() + "/" + date.getMinutes();
}

// postSchema.pre('save', async (next) => {
//     const date = new Date();
//     const dateString = 
//     this.createdAt = dateString;
//     next();
// });

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
