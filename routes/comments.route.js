const Post = require("../model/post");
const User = require("../model/user");
const router = require("express").Router();
const verifyToken = require("../middleware/verifyAuth");
const { authorize } = require("../middleware/permissions");

router.post("/add-comment/:postId", verifyToken, async (req, res) => {

});

router.patch("/modify-comment/:userId/:commentId", verifyToken, authorize, async (req, res) => {

});

router.get("/posts/:postId/comments", verifyToken, async (req, res) => {

});

router.patch("like-comment/:commentId", verifyToken, async (req, res) => {

});

router.patch("unlike-comment/:userId/:commentId", verifyToken, authorize, async (req, res) => {

});

module.exports = router;