import fs from 'fs';
import pdf from 'pdf-parse';
import Resume from '../models/Resume.model.js';
import Result from '../models/Result.model.js';
import { analyzeResumeWithGemini } from '../services/gemini.service.js';
import { isMockDB } from '../config/db.js';
import { mockResumes, mockResults } from '../config/mockStore.js';

// @desc    Upload PDF resume and analyze
// @route   POST /api/resume/upload
// @access  Private
export const uploadAndAnalyzeResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Please upload a PDF file' });
  }

  const filePath = req.file.path;

  try {
    // Read and parse PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdf(dataBuffer);
    const extractedText = pdfData.text;

    if (!extractedText || extractedText.trim().length === 0) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('File cleanup error:', err);
      }
      return res.status(400).json({ message: 'Failed to extract text from the PDF. The file may be empty or secured.' });
    }

    // Call Gemini AI service (will fall back to mock analysis if key is missing)
    const analysis = await analyzeResumeWithGemini(extractedText);

    if (isMockDB) {
      const mockResume = {
        _id: `mock-res-${Date.now()}-${Math.round(Math.random() * 1e5)}`,
        userId: req.user._id,
        filename: req.file.originalname,
        extractedText,
        createdAt: new Date().toISOString(),
      };
      mockResumes.push(mockResume);

      const mockResult = {
        _id: `mock-ret-${Date.now()}-${Math.round(Math.random() * 1e5)}`,
        resumeId: mockResume._id,
        userId: req.user._id,
        atsScore: analysis.atsScore,
        strengths: analysis.strengths,
        foundKeywords: analysis.foundKeywords,
        missingSkills: analysis.missingSkills,
        missingKeywords: analysis.missingKeywords,
        spellingErrors: analysis.spellingErrors,
        suggestions: analysis.suggestions,
        overallFeedback: analysis.overallFeedback,
        createdAt: new Date().toISOString(),
      };
      mockResults.push(mockResult);

      // Return result with populated resume details
      const populatedResult = {
        ...mockResult,
        resumeId: {
          _id: mockResume._id,
          filename: mockResume.filename,
          createdAt: mockResume.createdAt,
        },
      };

      return res.status(201).json(populatedResult);
    }

    // Standard MongoDB Connection Flow
    const resume = await Resume.create({
      userId: req.user._id,
      filename: req.file.originalname,
      extractedText,
    });

    const result = await Result.create({
      resumeId: resume._id,
      userId: req.user._id,
      atsScore: analysis.atsScore,
      strengths: analysis.strengths,
      foundKeywords: analysis.foundKeywords,
      missingSkills: analysis.missingSkills,
      missingKeywords: analysis.missingKeywords,
      spellingErrors: analysis.spellingErrors,
      suggestions: analysis.suggestions,
      overallFeedback: analysis.overallFeedback,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error during upload and analysis:', error);
    res.status(500).json({ message: error.message || 'An error occurred during resume analysis.' });
  } finally {
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (err) {
        console.error('Failed to delete temp file:', err);
      }
    }
  }
};

// @desc    Get all resume results of logged in user
// @route   GET /api/resume/all
// @access  Private
export const getMyResumes = async (req, res) => {
  try {
    if (isMockDB) {
      const userResults = mockResults
        .filter((r) => r.userId === req.user._id)
        .map((r) => {
          const matchingResume = mockResumes.find((res) => res._id === r.resumeId);
          return {
            ...r,
            resumeId: matchingResume
              ? {
                  _id: matchingResume._id,
                  filename: matchingResume.filename,
                  createdAt: matchingResume.createdAt,
                }
              : null,
          };
        })
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return res.status(200).json(userResults);
    }

    // Standard MongoDB Connection Flow
    const results = await Result.find({ userId: req.user._id })
      .populate('resumeId', 'filename createdAt')
      .sort({ createdAt: -1 });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single result by ID
// @route   GET /api/resume/result/:id
// @access  Private
export const getResultById = async (req, res) => {
  try {
    if (isMockDB) {
      const result = mockResults.find((r) => r._id === req.params.id);

      if (!result) {
        return res.status(404).json({ message: 'Analysis result not found' });
      }

      if (result.userId !== req.user._id) {
        return res.status(401).json({ message: 'User not authorized to view this result' });
      }

      const matchingResume = mockResumes.find((res) => res._id === result.resumeId);
      const populatedResult = {
        ...result,
        resumeId: matchingResume || null,
      };

      return res.status(200).json(populatedResult);
    }

    // Standard MongoDB Connection Flow
    const result = await Result.findById(req.params.id).populate('resumeId');

    if (!result) {
      return res.status(404).json({ message: 'Analysis result not found' });
    }

    if (result.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to view this result' });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a resume and its result
// @route   DELETE /api/resume/:id
// @access  Private
export const deleteResult = async (req, res) => {
  try {
    if (isMockDB) {
      const resultIndex = mockResults.findIndex((r) => r._id === req.params.id);

      if (resultIndex === -1) {
        return res.status(404).json({ message: 'Result not found' });
      }

      const result = mockResults[resultIndex];

      if (result.userId !== req.user._id) {
        return res.status(401).json({ message: 'User not authorized to delete this result' });
      }

      // Delete resume and result from in-memory arrays
      const resumeIndex = mockResumes.findIndex((r) => r._id === result.resumeId);
      if (resumeIndex !== -1) {
        mockResumes.splice(resumeIndex, 1);
      }

      mockResults.splice(resultIndex, 1);

      return res.status(200).json({ message: 'Resume analysis and history successfully deleted' });
    }

    // Standard MongoDB Connection Flow
    const result = await Result.findById(req.params.id);

    if (!result) {
      return res.status(404).json({ message: 'Result not found' });
    }

    if (result.userId.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized to delete this result' });
    }

    await Resume.findByIdAndDelete(result.resumeId);
    await Result.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Resume analysis and history successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
