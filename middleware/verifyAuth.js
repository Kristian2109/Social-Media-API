require("dotenv").config();

const jwt = require("jsonwebtoken");

function verifyAuthentication(req, res, next) {
    const authToken = req.body.accessToken;

    if (!authToken) {
        return res.status(401).json({
            error: "No access token, access denied!",
            success: false
        })
    }

    try {
        const user = jwt.verify(authToken, process.env.JWT_ACCESS_KEY);
        if (!user) {
            return res.status(400).json({
                error: "Invalid token",
                success: false
            })
        }
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            error: "Bad credentials",
            success: false
        })
    }
}

module.exports = verifyAuthentication;