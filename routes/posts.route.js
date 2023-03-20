const Post = require("../model/post");
const User = require("../model/user");
const router = require("express").Router();
const authUser = require("../middleware/verifyAuth");

// POST | /api/v1/create-post | current user adds a post | private | bcrypt, jwt
router.post("/create-post", authUser, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(401).json({error: "Unfilled data", success: false});
        }
        const newPost = new Post({
            userId: req.user.id,
            title, 
            content
        });

        await newPost.save();
        res.status(200).json({msg: "Post created!", success: true});
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

router.get("/posts-following", authUser, async (req, res) => {
    try {
        const currentUser = await User.findById(req.user.id);
        const currentUserFollowing = currentUser.following;
        const postsOfFollowing = await Post.find({
            userId: currentUserFollowing
        });

        return res.status(200).json({posts: postsOfFollowing});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(400);
    }
});

router.patch("/modify-post/:postId", authUser, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.postId);
    
        if (!post) {
            return res.status(401).json({error: "Invalid post id"});
        }
        if (title) post.title = title;
        if (content) post.content = content;

        await post.save();
        res.status(200).json({post, success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
})

module.exports = router;