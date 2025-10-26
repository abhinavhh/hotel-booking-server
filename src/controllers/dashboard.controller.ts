import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const data = await dashboardService.getDashboardStats(userId);
      
      res.json(data);
    } catch (error: any) {
      res.status(500).json({
        message: 'Failed to fetch dashboard data',
        error: error.message
      });
    }
  }
}