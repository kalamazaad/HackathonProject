import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initDatabase } from './db.js'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import careerFairRoutes from './routes/careerFairs.js'
import boothRoutes from './routes/booths.js'
import companyRoutes from './routes/companies.js'
import registrationRoutes from './routes/registrations.js'
import resumeRoutes from './routes/resumes.js'
import chatRoutes from './routes/chat.js'
import jobRoutes from './routes/jobs.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase()
    
    // Routes
    app.use('/api/auth', authRoutes)
    app.use('/api/admin', adminRoutes)
    app.use('/api/career-fairs', careerFairRoutes)
    app.use('/api/booths', boothRoutes)
    app.use('/api/companies', companyRoutes)
    app.use('/api/registrations', registrationRoutes)
    app.use('/api/resumes', resumeRoutes)
    app.use('/api/chat', chatRoutes)
    app.use('/api/jobs', jobRoutes)

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ status: 'OK', message: 'Server is running' })
    })

    // 404 handler for undefined routes
    app.use((req, res) => {
      res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
    })

    // Error handling middleware - must be after all routes
    app.use((err, req, res, next) => {
      console.error('Unhandled error:', err)
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
      })
    })

    // Start server
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`)
      console.log('Available routes:')
      console.log('  POST /api/resumes/submit-job - Submit resume to job opportunity')
      console.log('  POST /api/resumes/submit - Submit resume to booth')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()

