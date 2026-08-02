const bcrypt = require('bcrypt');
const { Client } = require('pg');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'cognify_user',
    password: process.env.DB_PASSWORD || 'cognify_password',
    database: process.env.DB_NAME || 'cognify_db',
  });

  await client.connect();
  const hash = await bcrypt.hash('AdminPassword123!', 10);

  await client.query(
    `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive") 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     ON CONFLICT (email) DO UPDATE SET role='ADMIN', "passwordHash"=$4`,
    ['a0000000-0000-0000-0000-000000000001', 'admin@cognify.com', 'admin', hash, 'ADMIN', true, true]
  );

  await client.query(
    `INSERT INTO profiles (id, "fullName", bio, "userId") 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT DO NOTHING`,
    ['a0000000-0000-0000-0000-000000000002', 'System Administrator', 'Cognify Lead Administrator', 'a0000000-0000-0000-0000-000000000001']
  );

  console.log('✅ Admin Account Seeded Successfully!');
  await client.end();
}

seed().catch(console.error);
