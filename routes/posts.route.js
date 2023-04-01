const Post = require("../model/post");
const User = require("../model/user");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyAuth");
const { authorize } = require("../middleware/permissions");
const { getOrSetCache, updateCache } = require("../redis/redisFunctions");

// POST | /api/v1/posts/:postId | get a post with all comments | private
router.get("/posts/:postId", verifyToken, async (req, res) => {
    try {
        const post = await getOrSetCache(`post:${req.params.postId}`, async () => {
            return await Post.findById(req.params.postId).populate("comments");
        });

        if (!post) {
            return res.status(400).json({error: "Unexisting post", success: false});
        }

        return res.status(200).json({post, success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

// POST | /api/v1/create-post | current user adds a post | private
router.post("/create-post", verifyToken, async (req, res) => {
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

        updateCache(`user:${newPost.userId}`, async () => {
            return await User.findById(newPost.userId);
        });

        return res.status(200).json({msg: "Post created!", success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

async function getPostsOfUsersWithPagination(page, limit, idsOfFollowed) {
    const postsOfFollowing = await Post.find({
        userId: idsOfFollowed
    }).sort("createdAt").skip(page - 1).limit(limit);
    return postsOfFollowing;
}

// GET | /api/v1/posts-following | shows the posts of the followed users of the current | private
router.get("/posts-following/:userId", verifyToken, authorize, async (req, res) => {
    try {
        const currentUser = getOrSetCache(`user:${req.params.userId}`, async () => {
            return await User.findById(req.params.userId);s
        });

        const currentUserFollowing = currentUser.following;
        console.log(currentUserFollowing);

        const postsOfFollowed = await getPostsOfUsersWithPagination(req.query.page, req.query.limit, currentUserFollowing);

        return res.status(200).json({posts: postsOfFollowed});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(400);
    }
});

// PATCH | /api/v1/modify-post/:userId/:postId | private | modifies the post of the cpecified user
router.patch("/modify-post/:userId/:postId", verifyToken, authorize, async (req, res) => {
    try {
        const { title, content } = req.body;
        let post = getOrSetCache(`post:${req.params.postId}`, async () => {
            return await Post.findById(req.params.postId);
        });

        if (!post) {
            return res.status(400).json({error: "Invalid post id!", success: false});
        }

        if (title) post.title = title;
        if (content) post.content = content;
        await post.save();

        updateCache(`user:${post.userId}`, async () => {
            return await User.findById(post.userId);
        });
        updateCache(`post:${post._id}`, () => post);

        return res.status(200).json({post, success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

router.delete("/delete-post/:userId/:postId", verifyToken, authorize, async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        if (!deletedPost) {
            return res.status(400).json({error: "Invalid post id!", success: false});
        }

        await updateCache(`user:${deletedPost.userId}`, async () => {
            return await User.findById(deletedPost.userId);
        });
        await deleteCache(`post:${deletedPost._id}`);

        return res.json({deletedPost, success: true});
    } catch (error) {
        res.sendStatus(501);
    }
});

router.get("/like-post/:postId", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        let post = await Post.findById(userId);

        if (!post) {
            return res.status(400).json({error: "Wrong post id!", success: false});
        }

        if (post.likes.indexOf(userId) > 0) {
            return res.status(400).json({error: "Post already liked!", success: false});
        }

        post.likes.push(userId);
        await post.save();

        return res.status(200).json({success: true, post});
    } catch (error) {
        return res.sendStatus(500);
    }
});

router.get("/unlike-post/:userId/:postId", verifyToken, authorize, async (req, res) => {
    try {
        const userId = req.params.id;
        let post = await Post.findById(userId);

        if (!post) {
            return res.status(400).json({error: "Wrong post id!", success: false});
        }

        if (post.likes.indexOf(userId) < 0) {
            return res.status(400).json({error: "Post isn't liked!", success: false});
        }

        post.likes = post.likes.filter(likeId => likeId != userId);
        await post.save();

        return res.status(200).json({success: true, post});
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

router.get("/likes/:postId", verifyToken, async (req, res) => {
    try {
        const currentUserFollowed= await User.findById(req.user.id, "following").following;
        const post = await Post.findById(req.params.postId);

        if (!post) {
            res.status(400).json({error: "False post id", success: false});
        }

        if (currentUserFollowed.indexOf(post.userId) < 0) {
            return res.status(401).json({error: "You aren't a follower of this user", success: false});
        }

        const namesOfFollwed = await User.find({_id: post.likes}, "name");
        res.status(200).json({data: namesOfFollwed, success: false});

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

module.exports = router;