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
});

router.get("/user", authUser, async (req, res) => {
    try {
        const userData = await User.findById(req.user.id).populate("posts");
        res.status(200).json({userData, success: true});

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

router.delete("/delete-user", authUser, async (req, res) => {
    try {
        const userIdToDelete = req.body.idToDelete;
        if (userIdToDelete === req.user.id) {
            await User.findByIdAndDelete(userIdToDelete);
            return res.status(200).json({ success: true });
        }
    } catch (error) {
        console.log(error.message);
        res.status(200).json({ success: false });
    }
});

router.get("/follow-user", authUser, async (req, res) => {

    try {
        const userIdToFollow = req.body.idToFollow;

        const followed = await User.findById(userIdToFollow);
        if (followed.followers.indexOf(req.user.id) >= 0) {
            return res.status(400).json({error: "You have followed the user", success: false});
        }

        followed.followers.push(req.user.id);
        await followed.save();

        if (!followed) {
            return res.status(401).json({error: "The user you want to follow doesn't exist.", success: false});
        }
    
        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                following: userIdToFollow
            }
        });
    
        res.status(200).json({success: true});
    } catch (error) {
        res.status(400).json({success: false});
    }
});

router.get("/unfollow-user", authUser, async (req, res) => {
    try {
        const userIdToUnFollow = req.body.idToUnfollow;
        const unfollowed = await User.findByIdAndUpdate(userIdToUnFollow, {
            $pull: {
                followers: req.user.id
            }
        });

        if (!unfollowed) {
            return res.status(401).json({error: "The user you want to unfollow doesn't exist.", success: false});
        }
    
        await User.findByIdAndUpdate(req.user.id, {
            $pull: {
                following: userIdToUnFollow
            }
        });
    
        res.status(200).json({success: true});
    } catch (error) {
        console.log(error.message);
        res.status(400).json({success: false});
    }
});

module.exports = router;

