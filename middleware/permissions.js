const ROLES = {
    ADMIN: "Admin",
    USER: "User"
}

function hasUserAccess(currentUser, userIdToVisit) {
    return currentUser.id === userIdToVisit || currentUser.role === ROLES.ADMIN;
}

function authorize(req, res, next) {
    if (!hasUserAccess(req.user, req.params.userId)) {
        return res.sendStatus(401);
    }

    next();
}

module.exports = {
    ROLES, authorize
}