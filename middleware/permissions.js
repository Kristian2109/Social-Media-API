const ROLES = {
    ADMIN: "Admin",
    USER: "User"
}

function canUserSeePosts(currentUser, userIdToVisit) {
    return currentUser.id === userIdToVisit || currentUser.role === ROLES.ADMIN;
}

function authorize(req, res, next) {
    if (!canUserSeePosts(req.user, req.params.userId)) {
        console.log(req.user);
        return res.sendStatus(401);
    }

    next();
}

module.exports = {
    ROLES, authorize
}