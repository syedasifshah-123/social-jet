import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { ENV } from "../config/env.js";
import * as schema from "./index.js";


// POSTGRESQL CONNECTION POOL
const pool = new Pool({
    connectionString: ENV.DATABASE_URL,
    max: 20,                        // maximum 20 connections
    idleTimeoutMillis: 30000,       // 30 sec idle to connection close
    connectionTimeoutMillis: 5000   // in 5 sec not connect then throw error
});


// IF DB CONNECT
pool.on("connect", () => {
    console.log("Database connected successfully");
});


// IF DB CONNECTION FAILED
pool.on("error", (err) => {
    console.error("Database connection error:", err);
});


// EXPORTING DB
export const db = drizzle(pool, {
    schema
});