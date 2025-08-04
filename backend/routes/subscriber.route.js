import express from "express";
import { addSubscriber } from "../controllers/subscriber.controller.js";

const subscriberRouter = express.Router();

subscriberRouter.post("/subscribe", addSubscriber);

export default subscriberRouter;