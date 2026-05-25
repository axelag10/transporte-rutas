import { Router, type IRouter } from "express";
import healthRouter from "./health";
import routesRouter from "./routes";
import vehiclesRouter from "./vehicles";

const router: IRouter = Router();

router.use(healthRouter);
router.use(routesRouter);
router.use(vehiclesRouter);

export default router;
