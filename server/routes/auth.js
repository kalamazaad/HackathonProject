import express from 'express'
import bcrypt from 'bcryptjs'
import { dbGet, dbRun } from '../db.js'

const router = express.Router()

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body

    // Validation
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        error: 'Name, email, password, and user type are required' 
      })
    }

    // Password length validation
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      })
    }

    // Check if email already exists
    const existingUser = await dbGet(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (existingUser) {
      return res.status(409).json({ 
        error: 'Email already registered' 
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Insert user into database
    const result = await dbRun(
      'INSERT INTO users (name, email, password, userType) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userType]
    )

    console.log('User created:', { id: result.lastID, name, email, userType })

    res.status(201).json({ 
      message: 'Account created successfully',
      userId: result.lastID 
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      })
    }

    // Find user by email
    const user = await dbGet(
      'SELECT * FROM users WHERE email = ?',
      [email]
    )

    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      })
    }

    // Login successful
    const userResponse = {
      id: user.id,
      name: user.name || null,
      email: user.email,
      userType: user.userType,
      isAdmin: user.isAdmin || 0
    }
    
    console.log('Login response user data:', userResponse)
    
    res.status(200).json({ 
      message: 'Login successful',
      user: userResponse
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
})

export default router

