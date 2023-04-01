const mongoose = require("mongoose");

const { ROLES } = require("../middleware/permissions");
const { currentDateString } = require("./dateFunction");

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
        default: ROLES.USER,
    },
    refreshTokenJWT: {
        type: String,
        select: false
    },
    createdAt: {
        type: String,
        default: currentDateString
    },
    followers: Array,
    following: Array,
    profilePicture: Buffer
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

userSchema.virtual("posts", {
    ref: "Post",
    localField: "_id",
    foreignField: "userId",
    justOne: false
});

const User = mongoose.model("User", userSchema);

module.exports = User;

