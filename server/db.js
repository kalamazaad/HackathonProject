import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dbPath = path.join(__dirname, 'database.sqlite')

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message)
  } else {
    console.log('Connected to SQLite database')
  }
})

// Helper functions to promisify database methods
export const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

export const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

export const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
}

// Initialize database schema
export const initDatabase = async () => {
  try {
    // Users table (extended)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        userType TEXT NOT NULL,
        name TEXT,
        isAdmin INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Add name column if it doesn't exist (migration for existing databases)
    try {
      await dbRun('ALTER TABLE users ADD COLUMN name TEXT')
      console.log('Added name column to users table')
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('Name column check:', error.message)
      }
    }

    // Career Fairs table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS career_fairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        startDate DATETIME NOT NULL,
        endDate DATETIME NOT NULL,
        status TEXT DEFAULT 'upcoming',
        createdBy INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (createdBy) REFERENCES users(id)
      )
    `)

    // Companies table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        website TEXT,
        logo TEXT,
        industry TEXT,
        userId INTEGER,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )
    `)

    // Company Booths table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS company_booths (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        careerFairId INTEGER NOT NULL,
        companyId INTEGER NOT NULL,
        boothNumber TEXT,
        description TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (careerFairId) REFERENCES career_fairs(id),
        FOREIGN KEY (companyId) REFERENCES companies(id)
      )
    `)

    // Registrations table (users registering for career fairs)
    await dbRun(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        careerFairId INTEGER NOT NULL,
        registeredAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (careerFairId) REFERENCES career_fairs(id),
        UNIQUE(userId, careerFairId)
      )
    `)

    // Resumes table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        companyBoothId INTEGER,
        jobOpportunityId INTEGER,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileSize INTEGER,
        coverLetter TEXT,
        status TEXT DEFAULT 'pending',
        submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (companyBoothId) REFERENCES company_booths(id),
        FOREIGN KEY (jobOpportunityId) REFERENCES job_opportunities(id),
        CHECK (companyBoothId IS NOT NULL OR jobOpportunityId IS NOT NULL)
      )
    `)

    // Ensure companyBoothId is nullable (migration for existing databases)
    // SQLite doesn't support ALTER COLUMN, so we need to recreate the table if needed
    try {
      const tableInfo = await dbAll('PRAGMA table_info(resumes)')
      const companyBoothIdColumn = tableInfo.find(col => col.name === 'companyBoothId')
      if (companyBoothIdColumn && companyBoothIdColumn.notnull === 1) {
        console.log('Note: companyBoothId has NOT NULL constraint. This may cause issues with job applications.')
        console.log('Consider recreating the resumes table or updating existing data.')
      }
    } catch (error) {
      console.log('Could not check table info:', error.message)
    }

    // Add jobOpportunityId and coverLetter columns if they don't exist (migration)
    try {
      await dbRun('ALTER TABLE resumes ADD COLUMN jobOpportunityId INTEGER')
      console.log('Added jobOpportunityId column to resumes table')
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.log('JobOpportunityId column check:', error.message)
      }
    }

    try {
      await dbRun('ALTER TABLE resumes ADD COLUMN coverLetter TEXT')
      console.log('Added coverLetter column to resumes table')
    } catch (error) {
      if (!error.message.includes('duplicate column name')) {
        console.log('CoverLetter column check:', error.message)
      }
    }

    // Check if companyBoothId has NOT NULL constraint and fix it if needed
    try {
      const tableInfo = await dbAll('PRAGMA table_info(resumes)')
      const companyBoothIdColumn = tableInfo.find(col => col.name === 'companyBoothId')
      
      if (companyBoothIdColumn && companyBoothIdColumn.notnull === 1) {
        console.log('WARNING: companyBoothId has NOT NULL constraint. Recreating table to fix this...')
        
        // Create backup table
        await dbRun(`
          CREATE TABLE IF NOT EXISTS resumes_backup AS 
          SELECT * FROM resumes
        `)
        
        // Drop old table
        await dbRun('DROP TABLE IF EXISTS resumes')
        
        // Recreate with correct schema
        await dbRun(`
          CREATE TABLE resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId INTEGER NOT NULL,
            companyBoothId INTEGER,
            jobOpportunityId INTEGER,
            fileName TEXT NOT NULL,
            filePath TEXT NOT NULL,
            fileSize INTEGER,
            coverLetter TEXT,
            status TEXT DEFAULT 'pending',
            submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (userId) REFERENCES users(id),
            FOREIGN KEY (companyBoothId) REFERENCES company_booths(id),
            FOREIGN KEY (jobOpportunityId) REFERENCES job_opportunities(id),
            CHECK (companyBoothId IS NOT NULL OR jobOpportunityId IS NOT NULL)
          )
        `)
        
        // Copy data back (only rows that have companyBoothId)
        await dbRun(`
          INSERT INTO resumes (id, userId, companyBoothId, fileName, filePath, fileSize, status, submittedAt)
          SELECT id, userId, companyBoothId, fileName, filePath, fileSize, status, submittedAt
          FROM resumes_backup
          WHERE companyBoothId IS NOT NULL
        `)
        
        // Drop backup
        await dbRun('DROP TABLE IF EXISTS resumes_backup')
        
        console.log('Resumes table recreated with nullable companyBoothId')
      }
    } catch (error) {
      console.log('Table migration check:', error.message)
    }

    // Chat Messages table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        boothId INTEGER NOT NULL,
        senderId INTEGER NOT NULL,
        message TEXT NOT NULL,
        sentAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (boothId) REFERENCES company_booths(id),
        FOREIGN KEY (senderId) REFERENCES users(id)
      )
    `)

    // Job Opportunities table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS job_opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        salaryMin INTEGER,
        salaryMax INTEGER,
        salaryCurrency TEXT DEFAULT 'USD',
        companyId INTEGER,
        careerFairId INTEGER,
        status TEXT DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (companyId) REFERENCES companies(id),
        FOREIGN KEY (careerFairId) REFERENCES career_fairs(id)
      )
    `)

    // Add jobOpportunityId and coverLetter columns to resumes table if they don't exist (migration)
    try {
      await dbRun('ALTER TABLE resumes ADD COLUMN jobOpportunityId INTEGER')
      console.log('Added jobOpportunityId column to resumes table')
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('jobOpportunityId column check:', error.message)
      }
    }

    try {
      await dbRun('ALTER TABLE resumes ADD COLUMN coverLetter TEXT')
      console.log('Added coverLetter column to resumes table')
    } catch (error) {
      // Column already exists, ignore error
      if (!error.message.includes('duplicate column name')) {
        console.log('coverLetter column check:', error.message)
      }
    }

    // Add foreign key constraint if it doesn't exist
    try {
      await dbRun(`
        CREATE INDEX IF NOT EXISTS idx_resumes_job_opportunity 
        ON resumes(jobOpportunityId)
      `)
    } catch (error) {
      console.log('Index creation check:', error.message)
    }

    // Insert sample job opportunities if table is empty
    try {
      const existingJobs = await dbGet('SELECT COUNT(*) as count FROM job_opportunities')
      if (existingJobs && existingJobs.count === 0) {
        await dbRun(`
          INSERT INTO job_opportunities (title, description, salaryMin, salaryMax, salaryCurrency, status)
          VALUES 
          ('Senior Software Developer', 'Lead development of complex software solutions, mentor junior developers, and architect scalable systems. Requires 5+ years of experience in modern programming languages and frameworks.', 120000, 180000, 'USD', 'active'),
          ('Junior Software Developer', 'Build and maintain web applications, collaborate with cross-functional teams, and learn from experienced developers. Perfect for recent graduates or developers with 1-2 years of experience.', 60000, 90000, 'USD', 'active'),
          ('Software Debugger', 'Identify, analyze, and resolve software bugs and issues. Work closely with development teams to ensure code quality and system stability. Strong problem-solving skills required.', 70000, 100000, 'USD', 'active')
        `)
        console.log('Sample job opportunities inserted')
      }
    } catch (error) {
      console.log('Job opportunities check:', error.message)
    }

    console.log('Database schema initialized with all tables')
  } catch (error) {
    console.error('Error initializing database:', error)
  }
}

export default db

