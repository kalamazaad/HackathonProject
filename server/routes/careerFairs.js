import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Get all career fairs
router.get('/', async (req, res) => {
  try {
    const fairs = await dbAll(`
      SELECT cf.*, u.name as createdByName
      FROM career_fairs cf
      LEFT JOIN users u ON cf.createdBy = u.id
      ORDER BY cf.startDate DESC
    `)
    res.status(200).json(fairs)
  } catch (error) {
    console.error('Error fetching career fairs:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get single career fair
router.get('/:id', async (req, res) => {
  try {
    const fair = await dbGet(`
      SELECT cf.*, u.name as createdByName
      FROM career_fairs cf
      LEFT JOIN users u ON cf.createdBy = u.id
      WHERE cf.id = ?
    `, [req.params.id])
    
    if (!fair) {
      return res.status(404).json({ error: 'Career fair not found' })
    }
    res.status(200).json(fair)
  } catch (error) {
    console.error('Error fetching career fair:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create career fair (Admin only)
router.post('/', async (req, res) => {
  try {
    const { title, description, startDate, endDate, createdBy } = req.body

    if (!title || !startDate || !endDate) {
      return res.status(400).json({ error: 'Title, start date, and end date are required' })
    }

    const result = await dbRun(
      `INSERT INTO career_fairs (title, description, startDate, endDate, createdBy, status)
       VALUES (?, ?, ?, ?, ?, 'upcoming')`,
      [title, description || null, startDate, endDate, createdBy || null]
    )

    res.status(201).json({ 
      message: 'Career fair created successfully',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creating career fair:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update career fair
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startDate, endDate, status } = req.body
    const { id } = req.params

    await dbRun(
      `UPDATE career_fairs 
       SET title = ?, description = ?, startDate = ?, endDate = ?, status = ?
       WHERE id = ?`,
      [title, description, startDate, endDate, status || 'upcoming', id]
    )

    res.status(200).json({ message: 'Career fair updated successfully' })
  } catch (error) {
    console.error('Error updating career fair:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete career fair
router.delete('/:id', async (req, res) => {
  try {
    await dbRun('DELETE FROM career_fairs WHERE id = ?', [req.params.id])
    res.status(200).json({ message: 'Career fair deleted successfully' })
  } catch (error) {
    console.error('Error deleting career fair:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

