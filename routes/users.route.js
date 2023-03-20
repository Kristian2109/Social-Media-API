require("dotenv").config();

const jwt = require("jsonwebtoken")
const User = require("../model/user");
const router = require("express").Router();
const authUser = require("../middleware/verifyAuth");

router.post("/edit-user", authUser, async (req, res) => {
    const userId = req.user.id;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    return res.status(200).json({msg: "User edited!", success: true});
})

