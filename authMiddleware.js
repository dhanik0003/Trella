import jwt from "jsonwebtoken";

function authMiddleware(req, res, next) {
    const token = req.headers.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;

    if (userId) {
        req.userId = userId;
        next();
        return;
    }

    res.status(403).json({
        message: "Token was incorrect"
    })

}

export { authMiddleware };