import { Router } from "express";
import conversationsRouter from "./conversations";
import messagesRouter from "./messages";
import emailRouter from "./email";

const router = Router();

router.use("/openai", conversationsRouter);
router.use("/openai", messagesRouter);
router.use("/openai", emailRouter);

export default router;
