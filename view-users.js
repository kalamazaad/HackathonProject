// Simple script to view all users in the database
import { dbAll } from './server/db.js'
import { initDatabase } from './server/db.js'

async function viewUsers() {
  try {
    await initDatabase()
    
    const users = await dbAll(
      'SELECT id, email, name, userType, createdAt FROM users ORDER BY createdAt DESC'
    )
    
    console.log('\n=== Registered Users ===\n')
    console.log(`Total users: ${users.length}\n`)
    
    if (users.length === 0) {
      console.log('No users found in the database.')
    } else {
      users.forEach((user, index) => {
        console.log(`${index + 1}. ID: ${user.id}`)
        console.log(`   Name: ${user.name || '(not set)'}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   User Type: ${user.userType}`)
        console.log(`   Created: ${user.createdAt}`)
        console.log('')
      })
    }
    
    process.exit(0)
  } catch (error) {
    console.error('Error viewing users:', error)
    process.exit(1)
  }
}

viewUsers()

