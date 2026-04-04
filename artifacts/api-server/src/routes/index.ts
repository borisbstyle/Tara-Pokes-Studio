import { Router, type IRouter } from "express";
import healthRouter from "./health";
import openaiRouter from "./openai";
import bookingRouter from "./booking";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(openaiRouter);
router.use("/booking", bookingRouter);
router.use(storageRouter);

export default router;
