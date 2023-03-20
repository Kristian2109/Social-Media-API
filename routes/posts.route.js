const Post = require("../model/user");
const router = require("express").Router();
const authUser = require("../middleware/verifyAuth");