import { Router, type IRouter } from "express";
import healthRouter from "./health";
import personasRouter from "./personas";
import actionCardsRouter from "./actionCards";

const router: IRouter = Router();

router.use(healthRouter);
router.use(personasRouter);
router.use(actionCardsRouter);

export default router;
