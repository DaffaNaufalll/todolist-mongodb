import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
    try {
        // Try to get token from Authorization header (Bearer <token>)
        let token = req.headers.authorization?.split(" ")[1];

        // If not found, try to get from cookies (for flexibility)
        if (!token && req.cookies) {
            token = req.cookies.refreshtoken;
        }

        if (!token) return res.status(403).json({ message: "Token Expired or Invalid Authentication." });

        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
            if (err) return res.status(403).json({ message: "Token Expired or Invalid Authentication." });

            req.user = user;
            next();
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};