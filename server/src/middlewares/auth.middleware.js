import { eq } from "drizzle-orm";
import { db } from "../db/config.js";
import { verifyAccessToken } from "../utils/tokens.js";
import { usersTable } from "../db/index.js";
import { getCache, setCache } from "../utils/cacheHelper.js";

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


        // first get from  redis 
        const cacheKey = `user:${decoded.id}`;
        let user = await getCache(cacheKey);


        if (!user) {

            // if not in redis to get from db
            user = await db.query.usersTable.findFirst({
                where: eq(usersTable.user_id, decoded.id),
                columns: {
                    user_id: true,
                    name: true,
                    email: true,
                    username: true,
                    createdAt: true
                }
            });

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            await setCache(cacheKey, user, 900);
        }

        req.user = user;
        next();

    } catch (err) {
        return res.status(403).json({ message: "Token invalid or expired" });
    }
};

export { authMiddleware };
