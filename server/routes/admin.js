import express from 'express'
import { dbAll } from '../db.js'

const router = express.Router()

// Get all users (for viewing database entries)
router.get('/users', async (req, res) => {
  try {
    const users = await dbAll(
      'SELECT id, email, userType, createdAt FROM users ORDER BY createdAt DESC'
    )
    
    res.status(200).json({
      count: users.length,
      users: users
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

export default router

