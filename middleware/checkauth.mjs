import jwt from "jsonwebtoken"
import dotenv from "dotenv"
dotenv.config()

export default function checkauth(req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]
        jwt.verify(token, process.env.JWT_TOKEN_LEN)
        next();
    } catch (err) {
        res.status(401).json({
            message: "invalid auth token"
        })
    }
}