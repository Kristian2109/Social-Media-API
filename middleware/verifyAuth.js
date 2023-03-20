require("dotenv").config();

const jwt = require("jsonwebtoken");

function verifyAuthentication(req, res, next) {
    const authToken = req.header("x-token");

    if (!authToken) {
        res.status(401).json({
            error: "No access token, access denied!",
            success: false
        })
    }

    try {
        const decoded = jwt.verify(authToken, process.env.JWR_ACCESS_TOKEN);
        res.status(200).json({data: decoded, success: true})
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