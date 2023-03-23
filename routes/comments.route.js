const Post = require("../model/post");
const User = require("../model/user");
const Comment = require("../model/comment");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyAuth");
const { authorize } = require("../middleware/permissions");

router.post("/add-comment/:postId", verifyToken, async (req, res) => {
    try {
        const { content, title } = req.body;
        if (!content || !title) {
            return res.status(400).json({error: "Missing data!", success: false});
        }

        const isPostExisting = await Post.exists({_id: req.params.postId});
        if (!isPostExisting) {
            return res.status(400).json({error: "Unexisting post", success: false});
        }

        const newComment = new Comment({
            title,
            content,
            userId: req.user.id,
            postId: req.params.postId
        });

        await newComment.save();

        return res.status(200).json({success: true, comment: newComment});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

router.patch("/modify-comment/:userId/:commentId", verifyToken, authorize, async (req, res) => {
    try {
        const { title, content } = req.body; 
        const isUserExisting = await User.exists({_id: req.params.userId});
        if (!isUserExisting) {
            return res.status(400).json({error: "Unexisting user", success: false});
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(400).json({error: "Unexisting comment", success: false});
        } 

        if (title) comment.title = title;
        if (content) comment.content = content;

        await comment.save();
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

router.patch("like-comment/:commentId", verifyToken, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(400).json({error: "Unexisting comment", success: false});
        }

        if (comment.likes.indexOf(req.user.id) >= 0) {
            return res.status(400).json({error: "Comment already liked", success: false});
        }

        comment.likes.push(req.user.id);
        comment.save();
        return res.status(200).json({msg: "Comment liked", success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

router.patch("unlike-comment/:userId/:commentId", verifyToken, authorize, async (req, res) => {
    try {
        const isUserExisting = await User.exists({_id: req.params.userId});
        if (!isUserExisting) {
            return res.status(400).json({error: "Unexisting user", success: false});
        }

        const comment = await Comment.findById(req.params.commentId);
        if (!comment) {
            return res.status(400).json({error: "Unexisting comment", success: false});
        }

        comment.likes = comment.likes.filter(id => id === req.params.userId);
        await comment.save();
        return res.status(200).json({msg: "Comment unliked", success: true});
        
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

module.exports = router;