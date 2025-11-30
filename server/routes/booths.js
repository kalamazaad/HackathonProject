import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Get all booths for a career fair
router.get('/fair/:fairId', async (req, res) => {
  try {
    const booths = await dbAll(`
      SELECT cb.*, c.name as companyName, c.description as companyDescription, 
             c.website, c.logo, c.industry
      FROM company_booths cb
      JOIN companies c ON cb.companyId = c.id
      WHERE cb.careerFairId = ? AND cb.isActive = 1
      ORDER BY cb.boothNumber
    `, [req.params.fairId])
    res.status(200).json(booths)
  } catch (error) {
    console.error('Error fetching booths:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single booth
router.get('/:id', async (req, res) => {
  try {
    const booth = await dbGet(`
      SELECT cb.*, c.name as companyName, c.description as companyDescription,
             c.website, c.logo, c.industry, cf.title as fairTitle
      FROM company_booths cb
      JOIN companies c ON cb.companyId = c.id
      JOIN career_fairs cf ON cb.careerFairId = cf.id
      WHERE cb.id = ?
    `, [req.params.id])
    
    if (!booth) {
      return res.status(404).json({ error: 'Booth not found' })
    }
    res.status(200).json(booth)
  } catch (error) {
    console.error('Error fetching booth:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create booth
router.post('/', async (req, res) => {
  try {
    const { careerFairId, companyId, boothNumber, description } = req.body

    if (!careerFairId || !companyId) {
      return res.status(400).json({ error: 'Career fair ID and company ID are required' })
    }

    const result = await dbRun(
      `INSERT INTO company_booths (careerFairId, companyId, boothNumber, description, isActive)
       VALUES (?, ?, ?, ?, 1)`,
      [careerFairId, companyId, boothNumber || null, description || null]
    )

    res.status(201).json({ 
      message: 'Booth created successfully',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creating booth:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

