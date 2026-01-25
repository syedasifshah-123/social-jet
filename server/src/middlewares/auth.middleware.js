import { eq } from "drizzle-orm";
import { db } from "../db/config.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { usersTable } from "../db/index.js";

const authMiddleware = async (req, res, next) => {
    try {

        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Invalid token format" });
        }

        const decoded = verifyAccessToken(token);


        const user = await db.query.usersTable.findFirst({ where: eq(usersTable.user_id, decoded.id) });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;

        next();

    } catch (err) {
        return res.status(403).json({ message: "Token invalid or expired" });
    }
};

export { authMiddleware };
