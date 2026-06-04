import express from 'express';
import { protect, admin } from '../middleware/auth.middleware.js';
import {
  getDashboardStats,
  getAllUsers,
  getAllResults,
  deleteUser,
  deleteResult,
} from '../controllers/admin.controller.js';

const router = express.Router();

// Secure all admin routes with auth and admin role verification
router.use(protect);
router.use(admin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/results', getAllResults);
router.delete('/users/:id', deleteUser);
router.delete('/results/:id', deleteResult);

export default router;
