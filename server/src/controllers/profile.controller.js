import { db } from "../db/config.js";
import { usersTable } from "../db/schema/Users.js";
import { profilesTable } from "../db/schema/Profiles.js";
import { eq } from "drizzle-orm";
import { profileSchema } from "../validators/zodSchema.js";





// UPDATE PROFILE CONTROLLER
const updateProfileController = async (req, res, next) => {
    try {

        const { user_id: userId } = req.user;
        const parsedSchema = profileSchema.safeParse(req.body);
        const { data, success, error } = parsedSchema;

        const avatarFile = req.files && req.files["avatar"] ? req.files["avatar"][0] : null;
        const bannerFile = req.files && req.files["banner_img"] ? req.files["banner_img"][0] : null;

        console.log(avatarFile)
        console.log(bannerFile)

        const avatarUrl = avatarFile ? avatarFile.path : null;
        const bannerUrl = bannerFile ? bannerFile.path : null;


        if (!success) next(error);

        const { name, username, bio, gender, location, country, birthdate } = data;


        // UPDATE IN USER TABLE
        if (name || username) {
            await db.update(usersTable)
                .set({ name, username })
                .where(eq(usersTable.user_id, userId));
        }


        // UPDATE IN PROFILE TABLE
        await db.update(profilesTable)
            .set({
                avatar: avatarUrl ?? profilesTable.avatar,
                banner_img: bannerUrl ?? profilesTable.banner_img,
                bio,
                gender,
                location,
                country,
                birthdate
            })
            .where(eq(profilesTable.user_id, userId));


        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
        });


    } catch (err) {
        next(err);
    }
};




export {
    updateProfileController
}