import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { getConnectionPeopleController } from "../controllers/connectPeople.controller.js";


export const connectPeopleRoutes = express.Router();


connectPeopleRoutes.get("/connect", authMiddleware, getConnectionPeopleController);