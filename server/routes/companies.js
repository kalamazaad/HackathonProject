import express from 'express'
import { dbGet, dbAll, dbRun } from '../db.js'

const router = express.Router()

// Get all companies
router.get('/', async (req, res) => {
  try {
    const companies = await dbAll(`
      SELECT c.*, u.email as userEmail
      FROM companies c
      LEFT JOIN users u ON c.userId = u.id
      ORDER BY c.name
    `)
    res.status(200).json(companies)
  } catch (error) {
    console.error('Error fetching companies:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create company
router.post('/', async (req, res) => {
  try {
    const { name, description, website, logo, industry, userId } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' })
    }

    const result = await dbRun(
      `INSERT INTO companies (name, description, website, logo, industry, userId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description || null, website || null, logo || null, industry || null, userId || null]
    )

    res.status(201).json({ 
      message: 'Company created successfully',
      id: result.lastID 
    })
  } catch (error) {
    console.error('Error creating company:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update company
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, description, website, logo, industry } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Company name is required' })
    }

    await dbRun(
      `UPDATE companies 
       SET name = ?, description = ?, website = ?, logo = ?, industry = ?
       WHERE id = ?`,
      [name, description || null, website || null, logo || null, industry || null, id]
    )

    res.status(200).json({ message: 'Company updated successfully' })
  } catch (error) {
    console.error('Error updating company:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Delete company
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    await dbRun('DELETE FROM companies WHERE id = ?', [id])

    res.status(200).json({ message: 'Company deleted successfully' })
  } catch (error) {
    console.error('Error deleting company:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

