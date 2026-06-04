import User from '../models/User.model.js';
import Resume from '../models/Resume.model.js';
import Result from '../models/Result.model.js';
import { isMockDB } from '../config/db.js';
import { mockUsers, mockResumes, mockResults } from '../config/mockStore.js';

// @desc    Get Admin dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
  try {
    if (isMockDB) {
      const totalUsers = mockUsers.length;
      const totalResumes = mockResults.length;
      
      const totalScore = mockResults.reduce((acc, curr) => acc + curr.atsScore, 0);
      const avgAtsScore = mockResults.length > 0 ? Math.round(totalScore / mockResults.length) : 0;

      return res.status(200).json({
        totalUsers,
        totalResumes,
        avgAtsScore,
      });
    }

    // Real MongoDB Flow
    const totalUsers = await User.countDocuments();
    const totalResumes = await Result.countDocuments();

    const avgScoreResult = await Result.aggregate([
      {
        $group: {
          _id: null,
          avgScore: { $avg: '$atsScore' },
        },
      },
    ]);

    const avgAtsScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    res.status(200).json({
      totalUsers,
      totalResumes,
      avgAtsScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users with their resume count
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    if (isMockDB) {
      const usersWithCount = mockUsers.map((user) => {
        const resumeCount = mockResults.filter((r) => r.userId === user._id).length;
        const { password, ...userWithoutPassword } = user;
        return {
          ...userWithoutPassword,
          resumeCount,
        };
      });
      return res.status(200).json(usersWithCount);
    }

    // Real MongoDB Flow
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    const usersWithCount = await Promise.all(
      users.map(async (user) => {
        const resumeCount = await Result.countDocuments({ userId: user._id });
        return {
          ...user.toObject(),
          resumeCount,
        };
      })
    );

    res.status(200).json(usersWithCount);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all resume results with user details
// @route   GET /api/admin/results
// @access  Private/Admin
export const getAllResults = async (req, res) => {
  try {
    if (isMockDB) {
      const resultsWithDetails = mockResults
        .map((result) => {
          const user = mockUsers.find((u) => u._id === result.userId);
          const resume = mockResumes.find((r) => r._id === result.resumeId);
          return {
            ...result,
            userId: user ? { _id: user._id, name: user.name, email: user.email } : null,
            resumeId: resume ? { _id: resume._id, filename: resume.filename } : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.status(200).json(resultsWithDetails);
    }

    // Real MongoDB Flow
    const results = await Result.find()
      .populate('userId', 'name email')
      .populate('resumeId', 'filename')
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user along with all their resumes & results
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    if (userIdToDelete === req.user._id) {
      return res.status(400).json({ message: 'You cannot delete your own admin account' });
    }

    if (isMockDB) {
      const userIndex = mockUsers.findIndex((u) => u._id === userIdToDelete);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Remove user
      mockUsers.splice(userIndex, 1);

      // Filter out resumes & results
      const resultsToKeep = mockResults.filter((r) => r.userId !== userIdToDelete);
      mockResults.length = 0;
      mockResults.push(...resultsToKeep);

      const resumesToKeep = mockResumes.filter((r) => r.userId !== userIdToDelete);
      mockResumes.length = 0;
      mockResumes.push(...resumesToKeep);

      return res.status(200).json({ message: 'User and all associated data successfully deleted' });
    }

    // Real MongoDB Flow
    const user = await User.findById(userIdToDelete);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete associated Resumes and Results
    await Resume.deleteMany({ userId: userIdToDelete });
    await Result.deleteMany({ userId: userIdToDelete });
    await User.findByIdAndDelete(userIdToDelete);

    res.status(200).json({ message: 'User and all associated data successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a single resume and its result
// @route   DELETE /api/admin/results/:id
// @access  Private/Admin
export const deleteResult = async (req, res) => {
  try {
    const resultIdToDelete = req.params.id;

    if (isMockDB) {
      const resultIndex = mockResults.findIndex((r) => r._id === resultIdToDelete);
      if (resultIndex === -1) {
        return res.status(404).json({ message: 'Result not found' });
      }

      const result = mockResults[resultIndex];
      
      // Delete resume text
      const resumeIndex = mockResumes.findIndex((r) => r._id === result.resumeId);
      if (resumeIndex !== -1) {
        mockResumes.splice(resumeIndex, 1);
      }

      // Delete result
      mockResults.splice(resultIndex, 1);

      return res.status(200).json({ message: 'Resume analysis result successfully deleted' });
    }

    // Real MongoDB Flow
    const result = await Result.findById(resultIdToDelete);
    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    await Resume.findByIdAndDelete(result.resumeId);
    await Result.findByIdAndDelete(resultIdToDelete);

    res.status(200).json({ message: 'Resume analysis result successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
