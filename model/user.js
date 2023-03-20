const mongoose = require("mongoose");

const ROLES = {
    ADMIN: "Admin",
    USER: "User"
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email : {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    age: {
        type: Number,
        min: 12,
        max: 112
    },
    role: {
        type: String,
        default: "User"
    },
    refreshTokenJWT: String,
    followers: Array,
    following: Array,
    createdAt: String,
    profilePicture: Buffer
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.pre("save", (next) => {
    const date = new Date();
    const dateString = date.getDate() + "/" + (date.getMonth() + 1) + "/"
                     + date.getFullYear();
    this.createdAt = dateString;
    next();
});

userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "userId",
    justOne: false
});

const User = mongoose.model("User", userSchema);

module.exports = User;

