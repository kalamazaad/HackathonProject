import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Register user for career fair
router.post('/', async (req, res) => {
  try {
    const { userId, careerFairId } = req.body

    if (!userId || !careerFairId) {
      return res.status(400).json({ error: 'User ID and Career Fair ID are required' })
    }

    // Check if already registered
    const existing = await dbGet(
      'SELECT * FROM registrations WHERE userId = ? AND careerFairId = ?',
      [userId, careerFairId]
    )

    if (existing) {
      return res.status(409).json({ error: 'Already registered for this career fair' })
    }

    const result = await dbRun(
      'INSERT INTO registrations (userId, careerFairId) VALUES (?, ?)',
      [userId, careerFairId]
    )

    res.status(201).json({ 
      message: 'Registered successfully',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error registering:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user registrations
router.get('/user/:userId', async (req, res) => {
  try {
    const registrations = await dbAll(`
      SELECT r.*, cf.title, cf.startDate, cf.endDate, cf.status
      FROM registrations r
      JOIN career_fairs cf ON r.careerFairId = cf.id
      WHERE r.userId = ?
      ORDER BY r.registeredAt DESC
    `, [req.params.userId])
    res.status(200).json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Get all registrations for a career fair
router.get('/fair/:fairId', async (req, res) => {
  try {
    const registrations = await dbAll(`
      SELECT r.*, u.email, u.name, u.userType
      FROM registrations r
      JOIN users u ON r.userId = u.id
      WHERE r.careerFairId = ?
      ORDER BY r.registeredAt DESC
    `, [req.params.fairId])
    res.status(200).json(registrations)
  } catch (error) {
    console.error('Error fetching registrations:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete registration (unregister)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await dbRun('DELETE FROM registrations WHERE id = ?', [id])
    res.status(200).json({ message: 'Unregistered successfully' })
  } catch (error) {
    console.error('Error deleting registration:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

