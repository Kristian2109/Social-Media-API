const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const REFRESH_TOKEN_EXPIRATION = "10d";
const ACCESS_TOKEN_EXPIRATION = "20m";

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

        const accessToken = createAccessToken({id: newUser._id});
        const refreshToken = createRefreshToken({id: newUser._id});

        newUser.refreshTokenJWT = refreshToken;

        await newUser.save();

        return res.status(200).json({accessToken, refreshToken});

    } catch (error) {
        console.log(error);
        res.status(400).json({error: error.message, success: false});
    }
});

// POST | /api/v1/login | login | public | bcrypt, jwt
// Everytime saves new refresh token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({email}).select('+password');

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
        const refreshToken = createRefreshToken({id: user._id});

        user.refreshTokenJWT = refreshToken;
        await user.save();

        return res.status(200).json({ accessToken, refreshToken });

    } catch (error) {
        console.log(error.message);
        res.sendStatus(500);
    }
});

// POST | /api/v1/token | public | jwt
// Sends new access token if provided a valid refresh token
router.post("/token", async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(403).json({ error: "No refresh token!", success: false });
        }

        const user = await User.findOne({refreshTokenJWT: refreshToken});

        if (!user) {
            return res.status(403).json({ error: "No valid token!", success: false });
        }

        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY);

        if (!decoded) {
            return res.status(403).json({error: "Invalid token!", success: false});
        }

        const accessToken = createAccessToken({id: decoded.id});
        return res.status(200).json({accessToken});

    } catch (error) {
        console.log(error.message);
        return res.sendStatus(401);
    }
});

// PATCH | /api/v1/logout | private | jwt
// Deletes the refresh token of an authenticated user
router.patch("/logout", async (req, res) => {
    try {
        const userId = jwt.verify(req.body.refreshToken, process.env.JWT_REFRESH_KEY);
        const user = await User.findById(userId.id);
        user.refreshTokenJWT = null;
        await user.save();
        return res.json({ msg: "RefreshToken deleted", success: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({success: false});
    }

})

function createAccessToken(payload) {
    return jwt.sign(payload, process.env.JWT_ACCESS_KEY, { expiresIn:  ACCESS_TOKEN_EXPIRATION});
}

function createRefreshToken(payload) {
    return jwt.sign(payload, process.env.JWT_REFRESH_KEY, { expiresIn:  REFRESH_TOKEN_EXPIRATION});
}

module.exports = router;