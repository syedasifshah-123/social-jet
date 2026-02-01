// THIRD PART
// USER DEFINED
import { ENV } from "./config/env.js";
import { server } from "./app.js";


const startServer = async () => {

    const port = ENV.PORT || "5000";

    try {
        server.listen(port, () => {
            console.log(`Server is running on port: ${port}`);
        });
    } catch (err) {
        console.log(err);
        console.log("Failed to start server");
        process.exit(1);
    }
}


startServer();