// THIRD PART
// USER DEFINED
import { ENV } from "./config/env.js";
import { app } from "./app.js";


const startServer = async () => {

    const port = ENV.PORT || "5000";

    try {
        app.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    } catch (err) {
        console.log(err);
        console.log("Failed to start server");
        process.exit(1);
    }
}


startServer();