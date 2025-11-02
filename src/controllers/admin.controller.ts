// backend/controllers/admin.controller.ts
import { Request, Response } from 'express';
import User from '../models/user.model';
import Hotel from '../models/hotel.model';
import Booking from '../models/booking.model';
import Settings from '../models/settings.model';

// Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalUsers,
      totalHotels,
      totalBookings,
      activeBookings,
      recentBookings
    ] = await Promise.all([
      User.countDocuments(),
      Hotel.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Confirmed' }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('userId', 'name email')
        .populate('hotelId', 'name')
    ]);

    // Calculate total revenue
    const revenueData = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    // Revenue by month (last 12 months)
    const revenueByMonth = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Booking status distribution
    const bookingStatus = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalHotels,
          totalBookings,
          activeBookings,
          totalRevenue: revenueData[0]?.total || 0
        },
        recentActivity: recentBookings,
        chartData: {
          revenue: revenueByMonth,
          bookingStatus: bookingStatus
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message
    });
  }
};

// Hotels Management
export const getAllHotels = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      data: {
        hotels,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotels',
      error: error.message
    });
  }
};

export const createHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error creating hotel',
      error: error.message
    });
  }
};

export const updateHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndUpdate(id, req.body, { new: true });

    if (!hotel) {
      res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating hotel',
      error: error.message
    });
  }
};

export const deleteHotel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const hotel = await Hotel.findByIdAndDelete(id);

    if (!hotel) {
      res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting hotel',
      error: error.message
    });
  }
};

// Bookings Management
export const getAllBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');
      
      const hotels = await Hotel.find({
        name: { $regex: search, $options: 'i' }
      }).select('_id');

      query.$or = [
        { userId: { $in: users.map(u => u._id) } },
        { hotelId: { $in: hotels.map(h => h._id) } }
      ];
    }

    const bookings = await Booking.find(query)
      .populate('userId', 'name email phone')
      .populate('hotelId', 'name location')
      .populate('roomId', 'type')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Booking.countDocuments(query);

    // Stats
    const stats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRevenue = await Booking.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);

    res.json({
      success: true,
      data: {
        bookings,
        stats: {
          total,
          byStatus: stats,
          totalRevenue: totalRevenue[0]?.total || 0
        },
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings',
      error: error.message
    });
  }
};

export const updateBookingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('userId', 'name email')
     .populate('hotelId', 'name');

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking status updated successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating booking status',
      error: error.message
    });
  }
};

export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndUpdate(
      id,
      { status: 'Cancelled', paymentStatus: 'Refunded' },
      { new: true }
    );

    if (!booking) {
      res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error cancelling booking',
      error: error.message
    });
  }
};

// Users Management
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await User.countDocuments(query);

    // Get booking stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const bookings = await Booking.find({ userId: user._id });
        const totalSpent = bookings.reduce((sum, b) => sum, 0);
        
        return {
          ...user.toObject(),
          totalBookings: bookings.length,
          totalSpent
        };
      })
    );

    // Stats
    const activeUsers = await User.countDocuments({ status: 'Active' });
    const adminCount = await User.countDocuments({ role: 'Admin' });

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        stats: {
          total,
          active: activeUsers,
          admins: adminCount
        },
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['Admin', 'User'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Invalid role. Must be Admin or User'
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating user role',
      error: error.message
    });
  }
};

export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).select('-password');

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// Analytics
export const getRevenueAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const { period = '12months' } = req.query;
    
    let dateFilter = new Date();
    if (period === '7days') {
      dateFilter.setDate(dateFilter.getDate() - 7);
    } else if (period === '30days') {
      dateFilter.setDate(dateFilter.getDate() - 30);
    } else if (period === '90days') {
      dateFilter.setDate(dateFilter.getDate() - 90);
    } else {
      dateFilter.setMonth(dateFilter.getMonth() - 12);
    }

    const revenueData = await Booking.aggregate([
      {
        $match: {
          paymentStatus: 'Paid',
          createdAt: { $gte: dateFilter }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalPrice' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: revenueData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue analytics',
      error: error.message
    });
  }
};

export const getUserAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          users: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: userGrowth
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user analytics',
      error: error.message
    });
  }
};

export const getBookingAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const bookingSources = await Booking.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const roomTypes = await Booking.aggregate([
      {
        $lookup: {
          from: 'rooms',
          localField: 'roomId',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.type',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        sources: bookingSources,
        roomTypes
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching booking analytics',
      error: error.message
    });
  }
};

export const getHotelAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    const popularHotels = await Booking.aggregate([
      {
        $group: {
          _id: '$hotelId',
          bookings: { $sum: 1 },
          revenue: { $sum: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'hotels',
          localField: '_id',
          foreignField: '_id',
          as: 'hotel'
        }
      },
      { $unwind: '$hotel' },
      {
        $project: {
          name: '$hotel.name',
          bookings: 1,
          revenue: 1
        }
      },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: popularHotels
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching hotel analytics',
      error: error.message
    });
  }
};

// Settings
export const getSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create({
        general: {
          siteName: 'HotelBooking Pro',
          currency: 'INR',
          timezone: 'Asia/Kolkata'
        },
        commission: {
          platformFee: 10,
          taxRate: 18
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const settings = await Settings.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
};