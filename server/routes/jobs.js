import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Get all job opportunities
router.get('/', async (req, res) => {
  try {
    const jobs = await dbAll(`
      SELECT j.*, c.name as companyName, c.website as companyWebsite, c.industry,
             cf.title as careerFairTitle, cf.status as fairStatus
      FROM job_opportunities j
      LEFT JOIN companies c ON j.companyId = c.id
      LEFT JOIN career_fairs cf ON j.careerFairId = cf.id
      WHERE j.status = 'active'
      ORDER BY j.createdAt DESC
    `)
    res.status(200).json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await dbGet(`
      SELECT j.*, c.name as companyName, c.website as companyWebsite, c.industry,
             cf.title as careerFairTitle, cf.status as fairStatus
      FROM job_opportunities j
      LEFT JOIN companies c ON j.companyId = c.id
      LEFT JOIN career_fairs cf ON j.careerFairId = cf.id
      WHERE j.id = ? AND j.status = 'active'
    `, [req.params.id])
    
    if (!job) {
      return res.status(404).json({ error: 'Job opportunity not found' })
    }
    
    res.status(200).json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create job opportunity (Admin or Employer)
router.post('/', async (req, res) => {
  try {
    const { title, description, salaryMin, salaryMax, salaryCurrency, companyId, careerFairId } = req.body

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' })
    }

    const result = await dbRun(
      `INSERT INTO job_opportunities (title, description, salaryMin, salaryMax, salaryCurrency, companyId, careerFairId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description, salaryMin || null, salaryMax || null, salaryCurrency || 'USD', companyId || null, careerFairId || null]
    )

    res.status(201).json({ 
      message: 'Job opportunity created successfully',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update job opportunity
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, description, salaryMin, salaryMax, salaryCurrency, status } = req.body

    await dbRun(
      `UPDATE job_opportunities 
       SET title = ?, description = ?, salaryMin = ?, salaryMax = ?, salaryCurrency = ?, status = ?
       WHERE id = ?`,
      [title, description, salaryMin || null, salaryMax || null, salaryCurrency || 'USD', status || 'active', id]
    )

    res.status(200).json({ message: 'Job opportunity updated successfully' })
  } catch (error) {
    console.error('Error updating job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete job opportunity
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await dbRun('DELETE FROM job_opportunities WHERE id = ?', [id])
    res.status(200).json({ message: 'Job opportunity deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

