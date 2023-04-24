const Post = require("../model/post");
const User = require("../model/user");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyAuth");
const { authorize } = require("../middleware/permissions");
const { getOrSetCache, updateCache, deleteCache } = require("../redis/redisFunctions");

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
            res.status(400).json({error: "Unfilled data", success: false});
        }

        const newPost = new Post({
            userId: req.user.id,
            title, 
            content
        });

        await newPost.save();
        await deleteCache(`user:${newPost.userId}`);

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

// GET | /api/v1/posts-following\:userId | shows the posts of the followed users of the current | private
router.get("/posts-following/:userId", verifyToken, authorize, async (req, res) => {
    try {
        const currentUser = getOrSetCache(`user:${req.params.userId}`, async () => {
            return await User.findById(req.params.userId);
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

        await deleteCache(`user:${newPost.userId}`);
        await deleteCache(`post:${newPost._id}`);

        return res.status(200).json({post, success: true});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

// DELETE | /api/v1/delete-post/:userId/:postId | private and admin access| deletes the post 
router.delete("/delete-post/:userId/:postId", verifyToken, authorize, async (req, res) => {
    try {
        const deletedPost = await Post.findByIdAndDelete(req.params.postId);
        if (!deletedPost) {
            return res.status(404).json({error: "Invalid post id!", success: false});
        }

        await deleteCache(`user:${newPost.userId}`);
        await deleteCache(`post:${newPost._id}`);

        return res.json({deletedPost, success: true});
    } catch (error) {
        return res.sendStatus(501);
    }
});

// GET | /api/v1/like-post/:postId | private | like
router.get("/like-post/:postId", verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.postId;

        let post = getOrSetCache(`post:${postId}`, async () => {
            return await Post.findById(postId);
        });

        if (!post) {
            return res.status(400).json({error: "Wrong post id!", success: false});
        }

        if (post.likes.indexOf(userId) > 0) {
            return res.status(400).json({error: "Post already liked!", success: false});
        }

        post.likes.push(userId);
        await post.save();

        updateCache(`post:${post._id}`, () => post);

        return res.status(200).json({success: true, post});
    } catch (error) {
        return res.sendStatus(500);
    }
});

// GET | /api/v1/like-post/:postId | private and admin| unlike
router.get("/unlike-post/:userId/:postId", verifyToken, authorize, async (req, res) => {
    try {
        const userId = req.params.userId;
        const postId = req.params.postId;
        let post = getOrSetCache(`post:${postId}`, async () => {
            return await Post.findById(postId);
        });

        if (!post) {
            return res.status(400).json({error: "Wrong post id!", success: false});
        }

        if (post.likes.indexOf(userId) < 0) {
            return res.status(400).json({error: "Post isn't liked!", success: false});
        }

        post.likes = post.likes.filter(likeId => likeId != userId);
        await post.save();

        updateCache(`post:${post._id}`, () => post);

        return res.status(200).json({success: true, post});
    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

// GET | /api/v1/likes/:postId | private | 
// get the names of the users that have liked the post
router.get("/likes/:postId", verifyToken, async (req, res) => {
    try {
        const currentUser = await getOrSetCache(`user:${req.user.id}`, async () => {
            return await User.findById(req.user.id).populate("posts");
        });

        const followedUsers = currentUser.followers;

        const post = await getOrSetCache(`post:${req.params.postId}`, async () => {
            return await Post.findById(req.params.postId);
        });

        if (!post) {
            res.status(400).json({error: "False post id", success: false});
        }

        if (followedUsers.indexOf(post.userId) < 0) {
            return res.status(401).json({error: "You aren't a follower of this user", success: false});
        }

        const namesOfUsersThatLike = await User.find({_id: post.likes}, "name");
        
        return res.status(200).json({data: namesOfUsersThatLike, success: false});

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(500);
    }
});

module.exports = router;