const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

// POST | /api/v1/register | register | public | bcrypt, jwt
router.post("/register", async (req, res) => {
    try {
        const { name, email, password, age } = req.body;

        if (!name || !email || !password || !age) {
            return res.status(401).json({error: "Unfilled credentials", success: false});
        }

        const user = await User.findOne({email});
        if (user) {
            return res.status(401).json({error: "Existing email", success: false});
        }

        const newUser = new User({
            name, email, password, age
        });

        const salt = await bcrypt.genSalt();
        const hashedPass = await bcrypt.hash(password, salt);
        newUser.password = hashedPass;

        await newUser.save();

        const accessToken = createAccessToken({id: newUser._id});

        return res.status(200).json({accessToken});

    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message, success: false});
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email}).select('+password');
        console.log(user);

        if (!user) {
            return res.status(401).json({
                error: "Not existing email",
                success: false
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "False password",
                success: false
            });
        }

        const accessToken = createAccessToken({id: user._id});
        return res.status(200).json({token: accessToken, success: true});
    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
})

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn:  "10m"});
}


module.exports = router;