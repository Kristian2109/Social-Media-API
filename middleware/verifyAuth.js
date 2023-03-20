require("dotenv").config();

const jwt = require("jsonwebtoken");

function verifyAuthentication(req, res, next) {
    const authToken = req.body.accessToken;

    if (!authToken) {
        res.status(401).json({
            error: "No access token, access denied!",
            success: false
        })
    }

    try {
        const user = jwt.verify(authToken, process.env.JWR_ACCESS_TOKEN);
        res.sendStatus(200);
        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(400).json({
            error: "Bad credentials",
            success: false
        })
    }
}

module.exports = verifyAuthentication;