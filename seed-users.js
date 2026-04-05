import dotenv from 'dotenv';
dotenv.config();

const API_URL = 'http://localhost:5000/api';

const testUsers = [
  {
    email: 'student@example.com',
    password: 'password123',
    fullName: 'John Student',
    role: 'user',
    phoneNumber: '1234567890',
    location: 'Colombo, Sri Lanka',
  },
  {
    email: 'tutor@example.com',
    password: 'password123',
    fullName: 'Sarah Tutor',
    role: 'tutor',
    phoneNumber: '0987654321',
    location: 'Colombo, Sri Lanka',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
  },
  {
    email: 'admin@yahoo.com',
    password: 'Admin123',
    fullName: 'Yahoo Admin',
    role: 'admin',
    phoneNumber: '5555555555',
    location: 'Colombo, Sri Lanka',
  },
  {
    email: 'admin@example.com',
    password: 'password123',
    fullName: 'Admin User',
    role: 'admin',
    phoneNumber: '5555555555',
    location: 'Colombo, Sri Lanka',
  },
];

async function seedUsers() {
  console.log('Starting to seed test users...\n');

  for (const user of testUsers) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(user)
      });
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.msg || response.statusText);
      }
      
      console.log(`✓ Created ${user.role}: ${user.email}`);
      console.log(`  Name: ${user.fullName}`);
      if (user.subjects) {
        console.log(`  Subjects: ${user.subjects.join(', ')}`);
      }
      console.log();
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`⚠ User already exists: ${user.email}`);
      } else {
        console.error(`✗ Error creating user ${user.email}:`, error.message);
      }
    }
  }

  console.log('\n✓ Seeding complete!');
  console.log('\nYou can now log in with any of these credentials:');
  testUsers.forEach(user => {
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
    console.log();
  });
}

seedUsers().catch(console.error);
