const bcrypt = require('bcrypt');
const { Client } = require('pg');
const { randomUUID: uuidv4 } = require('crypto');

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [key, ...vals] = arg.slice(2).split('=');
      args[key] = vals.join('=');
    }
  }
  return args;
}

async function createAdmin() {
  const args = parseArgs();

  const email = args.email || process.env.ADMIN_EMAIL || 'admin@cognify.com';
  const username = args.username || process.env.ADMIN_USERNAME || 'admin';
  const password = args.password || process.env.ADMIN_PASSWORD || 'AdminPassword123!';
  const fullName = args.name || args.fullName || 'System Administrator';

  if (!email || !username || !password) {
    console.error('❌ Error: Missing required credentials.');
    console.log('Usage: npm run create:admin -- --email=admin@example.com --username=admin --password=Secret123! --name="Admin User"');
    process.exit(1);
  }

  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'cognify_user',
    password: process.env.DB_PASSWORD || 'cognify_password',
    database: process.env.DB_NAME || 'cognify_db',
  });

  try {
    await client.connect();
    console.log(`🔌 Connected to database ${process.env.DB_NAME || 'cognify_db'} at ${process.env.DB_HOST || 'localhost'}`);

    const passwordHash = await bcrypt.hash(password, 10);
    const adminId = uuidv4();
    const profileId = uuidv4();

    // Check if user with this email or username already exists
    const existingCheck = await client.query(
      `SELECT id, email, username, role FROM users WHERE email = $1 OR username = $2`,
      [email, username]
    );

    let actualAdminId;
    if (existingCheck.rows.length > 0) {
      const existing = existingCheck.rows[0];
      console.log(`ℹ️ User with email "${existing.email}" or username "${existing.username}" exists. Upgrading to ADMIN role...`);
      const updateRes = await client.query(
        `UPDATE users SET role = 'ADMIN', "passwordHash" = $1, "isActive" = true, "isVerified" = true, "updatedAt" = NOW()
         WHERE id = $2 RETURNING id`,
        [passwordHash, existing.id]
      );
      actualAdminId = updateRes.rows[0].id;
    } else {
      const insertRes = await client.query(
        `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive") 
         VALUES ($1, $2, $3, $4, 'ADMIN', true, true) RETURNING id`,
        [adminId, email, username, passwordHash]
      );
      actualAdminId = insertRes.rows[0].id;
    }

    // Ensure Profile exists
    await client.query(
      `INSERT INTO profiles (id, "fullName", bio, "userId") 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT ("userId") DO UPDATE SET "fullName" = $2`,
      [profileId, fullName, 'Cognify System Administrator', actualAdminId]
    );

    console.log('\n=============================================');
    console.log('✅ Admin Account Successfully Configured!');
    console.log(`   - Username:  @${username}`);
    console.log(`   - Email:     ${email}`);
    console.log(`   - Role:      ADMIN`);
    console.log(`   - Full Name: ${fullName}`);
    console.log('=============================================\n');
  } catch (err) {
    console.error('❌ Failed to create administrator:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createAdmin();
