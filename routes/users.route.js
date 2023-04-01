const User = require("../model/user");
const router = require("express").Router();
const authUser = require("../middleware/verifyAuth");
const { authorize } = require("../middleware/permissions");
const { getOrSetCache, updateCache, deleteCache } = require("../redis/redisFunctions");

router.patch("/edit-user/:userId", authUser, authorize, async (req, res) => {
    const userId = req.params.userId;
    const { name, email, password } = req.body;

    const user = await User.findById(userId);

    if (name) user.name = name;
    if (email) user.email = email;
    if (password) user.password = password;

    await user.save();
    await updateCache(`user:${user._id}`, () => user);
    return res.status(200).json({msg: "User edited!", success: true});
});

router.get("/user/:userId", authUser, authorize, async (req, res) => {
    try {
        const userData = await getOrSetCache(`user:${req.params.userId}`, async () => {
            return await User.findById(req.params.userId).populate("posts");
        });

        if (!userData) return res.status(401).json({error: "Not such user ID!", success: false});

        return res.status(200).json({userData, success: true});

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

router.delete("/delete-user/:userId", authUser, authorize, async (req, res) => {
    try {
        const userIdToDelete = req.params.userId;
        const deletedUser = await User.findByIdAndDelete(userIdToDelete);
        if (!deletedUser) {
            return res.status(400).json({error: "False user id!", success: false});
        }

        await deleteCache(`user:${deletedUser._id}`);
        return res.status(200).json({success: true, deletedUser});
    } catch (error) {
        console.log(error.message);
        return res.status(200).json({ success: false });
    }
});

router.get("/follow-user/:userId", authUser, async (req, res) => {
    try {
        const userIdToFollow = req.params.userId;

        const followed = await User.findById(userIdToFollow);
        if (followed.followers.indexOf(req.user.id) >= 0) {
            return res.status(400).json({error: "You have followed the user", success: false});
        }

        followed.followers.push(req.user.id);
        await followed.save();

        if (!followed) {
            return res.status(401).json({error: "The user you want to follow doesn't exist.", success: false});
        }
    
        const currentUser = await User.findByIdAndUpdate(req.user.id, {
            $push: {
                following: userIdToFollow
            }
        });
    
        await updateCache(`user:${req.user.id}`, () => currentUser);
        await updateCache(`user:${userIdToFollow}`, () => followed);
        return res.status(200).json({success: true});
    } catch (error) {
        return res.status(400).json({success: false});
    }
});

router.get("/unfollow-user/:userId", authUser, async (req, res) => {
    try {
        const userIdToUnFollow = req.params.userId;
        const unfollowed = await User.findByIdAndUpdate(userIdToUnFollow, {
            $pull: {
                followers: req.user.id
            }
        });

        if (!unfollowed) {
            return res.status(401).json({error: "The user you want to unfollow doesn't exist.", success: false});
        }
    
        const current = await User.findByIdAndUpdate(req.user.id, {
            $pull: {
                following: userIdToUnFollow
            }
        });
    
        await updateCache(`user:${req.user.id}`, () => currentUser);
        await updateCache(`user:${userIdToUnFollow}`, () => unfollowed);
        return res.status(200).json({success: true});
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({success: false});
    }
});

module.exports = router;