import express from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();
const dashboardController = new DashboardController();

router.get('/', authMiddleware, dashboardController.getDashboard);

export default router;