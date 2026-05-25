import { Router, type IRouter } from "express";
import healthRouter from "./health";
import routesRouter from "./routes";
import vehiclesRouter from "./vehicles";
import shiftsRouter from "./shifts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(routesRouter);
router.use(vehiclesRouter);
router.use(shiftsRouter);

export default router;
