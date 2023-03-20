const router = require("express").Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// POST | /api/v1/register | register | public | bcrypt, jwt
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password || !age) {
            res.status(401).json({error: "Unfilled credentials", success: false});
        }

    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message, success: false});
    }
});



module.exports = router;