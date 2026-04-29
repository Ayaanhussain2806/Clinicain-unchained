import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import parkingRouter from "./parking";
import bookingsRouter from "./bookings";
import pricingRouter from "./pricing";
import ridesRouter from "./rides";
import adminRouter from "./admin";
import paymentsRouter from "./payments";
import vehicleRouter from "./vehicle";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(parkingRouter);
router.use(bookingsRouter);
router.use(pricingRouter);
router.use(ridesRouter);
router.use(adminRouter);
router.use(paymentsRouter);
router.use(vehicleRouter);

export default router;
