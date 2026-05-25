import { Router, type IRouter } from "express";
import healthRouter from "./health";
import routesRouter from "./routes";
import vehiclesRouter from "./vehicles";
import shiftsRouter from "./shifts";
import alertsRouter from "./alerts";
import authRouter from "./auth";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(routesRouter);
router.use(vehiclesRouter);
router.use(shiftsRouter);
router.use(alertsRouter);

export default router;
