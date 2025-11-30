import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { dbGet, dbAll, dbRun } from '../db.js'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads', 'resumes')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'))
    }
  }
})

const router = express.Router()

// Submit resume
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' })
    }

    const { userId, companyBoothId } = req.body

    if (!userId || !companyBoothId) {
      // Delete uploaded file if validation fails
      fs.unlinkSync(req.file.path)
      return res.status(400).json({ error: 'User ID and Company Booth ID are required' })
    }

    // Store relative path for serving
    const relativePath = `/uploads/resumes/${req.file.filename}`
    
    const result = await dbRun(
      `INSERT INTO resumes (userId, companyBoothId, fileName, filePath, fileSize, status)
       VALUES (?, ?, ?, ?, ?, 'pending')`,
      [userId, companyBoothId, req.file.originalname, relativePath, req.file.size]
    )

    res.status(201).json({ 
      message: 'Resume submitted successfully',
      id: result.lastID 
    })
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    console.error('Error submitting resume:', error)
    res.status(500).json({ error: error.message || 'Internal server error' })
  }
})

// Submit resume to job opportunity
router.post('/submit-job', upload.single('resume'), async (req, res) => {
  try {
    console.log('Submit-job request received:', {
      hasFile: !!req.file,
      body: req.body,
      fileInfo: req.file ? { name: req.file.originalname, size: req.file.size } : null
    })

    if (!req.file) {
      return res.status(400).json({ error: 'Resume file is required' })
    }

    const { userId, jobOpportunityId, coverLetter } = req.body

    if (!userId || !jobOpportunityId) {
      // Delete uploaded file if validation fails
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path)
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError)
        }
      }
      return res.status(400).json({ 
        error: 'User ID and Job Opportunity ID are required',
        received: { userId: !!userId, jobOpportunityId: !!jobOpportunityId }
      })
    }

    // Store relative path for serving
    const relativePath = `/uploads/resumes/${req.file.filename}`
    
    console.log('Inserting resume:', {
      userId,
      jobOpportunityId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      hasCoverLetter: !!coverLetter
    })

    // Convert jobOpportunityId to integer
    const jobId = parseInt(jobOpportunityId)
    if (isNaN(jobId)) {
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path)
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError)
        }
      }
      return res.status(400).json({ error: 'Invalid job opportunity ID' })
    }

    // Check if columns exist by trying a simple query first
    try {
      await dbGet('SELECT jobOpportunityId, coverLetter FROM resumes LIMIT 1')
    } catch (schemaError) {
      console.error('Schema error - columns may not exist:', schemaError.message)
      // Try without the new columns first, but include companyBoothId as NULL
      try {
        const result = await dbRun(
          `INSERT INTO resumes (userId, companyBoothId, fileName, filePath, fileSize, status)
           VALUES (?, NULL, ?, ?, ?, 'pending')`,
          [parseInt(userId), req.file.originalname, relativePath, req.file.size]
        )
        // Then update with job info if possible
        if (result.lastID) {
          try {
            await dbRun(
              `UPDATE resumes SET jobOpportunityId = ?, coverLetter = ? WHERE id = ?`,
              [jobId, coverLetter || null, result.lastID]
            )
          } catch (updateError) {
            console.log('Could not update with job info, but resume was saved:', updateError.message)
          }
        }
        console.log('Resume inserted successfully (fallback method):', result.lastID)
        return res.status(201).json({ 
          message: 'Resume submitted successfully',
          id: result.lastID 
        })
      } catch (insertError) {
        throw insertError
      }
    }

    // Insert with explicit NULL for companyBoothId to avoid constraint issues
    const result = await dbRun(
      `INSERT INTO resumes (userId, companyBoothId, jobOpportunityId, fileName, filePath, fileSize, coverLetter, status)
       VALUES (?, NULL, ?, ?, ?, ?, ?, 'pending')`,
      [parseInt(userId), jobId, req.file.originalname, relativePath, req.file.size, coverLetter || null]
    )

    console.log('Resume inserted successfully:', result.lastID)

    res.status(201).json({ 
      message: 'Resume submitted successfully',
      id: result.lastID 
    })
  } catch (error) {
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path)
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError)
      }
    }
    console.error('Error submitting resume to job:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.body?.userId,
      jobOpportunityId: req.body?.jobOpportunityId,
      errorName: error.name
    })
    
    // Always return JSON, even on error
    const errorMessage = error.message || 'Internal server error'
    const errorResponse = { 
      error: errorMessage
    }
    
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.details = error.stack
    }
    
    res.status(500).json(errorResponse)
  }
})

// Get resumes for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const resumes = await dbAll(`
      SELECT r.*, 
             cb.boothNumber, 
             c.name as companyName, 
             cf.title as fairTitle,
             jo.title as jobTitle
      FROM resumes r
      LEFT JOIN company_booths cb ON r.companyBoothId = cb.id
      LEFT JOIN companies c ON cb.companyId = c.id
      LEFT JOIN career_fairs cf ON cb.careerFairId = cf.id
      LEFT JOIN job_opportunities jo ON r.jobOpportunityId = jo.id
      WHERE r.userId = ?
      ORDER BY r.submittedAt DESC
    `, [req.params.userId])
    res.status(200).json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get resumes for a job opportunity (employer view)
router.get('/job/:jobId', async (req, res) => {
  try {
    const resumes = await dbAll(`
      SELECT r.*, u.email, u.name as userName
      FROM resumes r
      JOIN users u ON r.userId = u.id
      WHERE r.jobOpportunityId = ?
      ORDER BY r.submittedAt DESC
    `, [req.params.jobId])
    res.status(200).json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get resumes for a booth (company view)
router.get('/booth/:boothId', async (req, res) => {
  try {
    const resumes = await dbAll(`
      SELECT r.*, u.email, u.name as userName
      FROM resumes r
      JOIN users u ON r.userId = u.id
      WHERE r.companyBoothId = ?
      ORDER BY r.submittedAt DESC
    `, [req.params.boothId])
    res.status(200).json(resumes)
  } catch (error) {
    console.error('Error fetching resumes:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update resume status
router.put('/:resumeId/status', async (req, res) => {
  try {
    const { status } = req.body
    const { resumeId } = req.params

    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be pending, accepted, or rejected' })
    }

    await dbRun(
      'UPDATE resumes SET status = ? WHERE id = ?',
      [status, resumeId]
    )

    res.status(200).json({ message: 'Resume status updated successfully' })
  } catch (error) {
    console.error('Error updating resume status:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

