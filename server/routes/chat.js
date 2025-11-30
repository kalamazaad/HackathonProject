import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Get chat messages for a booth
router.get('/booth/:boothId', async (req, res) => {
  try {
    const messages = await dbAll(`
      SELECT cm.*, u.email, u.name as senderName, u.userType
      FROM chat_messages cm
      JOIN users u ON cm.senderId = u.id
      WHERE cm.boothId = ?
      ORDER BY cm.sentAt ASC
    `, [req.params.boothId])
    res.status(200).json(messages)
  } catch (error) {
    console.error('Error fetching messages:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Send message
router.post('/', async (req, res) => {
  try {
    const { boothId, senderId, message } = req.body

    if (!boothId || !senderId || !message) {
      return res.status(400).json({ error: 'Booth ID, sender ID, and message are required' })
    }

    const result = await dbRun(
      'INSERT INTO chat_messages (boothId, senderId, message) VALUES (?, ?, ?)',
      [boothId, senderId, message]
    )

    // Get the created message with user info
    const newMessage = await dbGet(`
      SELECT cm.*, u.email, u.name as senderName, u.userType
      FROM chat_messages cm
      JOIN users u ON cm.senderId = u.id
      WHERE cm.id = ?
    `, [result.lastID])

    res.status(201).json(newMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

