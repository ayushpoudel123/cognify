const bcrypt = require('bcrypt');
const { Client } = require('pg');
const { randomUUID: uuidv4 } = require('crypto');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'cognify_user',
    password: process.env.DB_PASSWORD || 'cognify_password',
    database: process.env.DB_NAME || 'cognify_db',
  });

  await client.connect();

  // --- Admin Account ---
  const adminHash = await bcrypt.hash('AdminPassword123!', 10);
  const adminId = 'a0000000-0000-0000-0000-000000000001';
  const adminProfileId = 'a0000000-0000-0000-0000-000000000002';

  await client.query(
    `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive") 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     ON CONFLICT (email) DO UPDATE SET role='ADMIN', "passwordHash"=$4`,
    [adminId, 'admin@cognify.com', 'admin', adminHash, 'ADMIN', true, true]
  );

  await client.query(
    `INSERT INTO profiles (id, "fullName", bio, "userId") 
     VALUES ($1, $2, $3, $4) 
     ON CONFLICT ("userId") DO NOTHING`,
    [adminProfileId, 'System Administrator', 'Cognify Lead Administrator', adminId]
  );

  // --- Sample Users ---
  const users = [
    { username: 'alice_dev', email: 'alice@example.com', fullName: 'Alice Chen', bio: 'Full-stack developer & CS educator. I teach React, Node.js and system design.' },
    { username: 'bob_ml', email: 'bob@example.com', fullName: 'Bob Kumar', bio: 'ML Engineer. Sharing notes on PyTorch, transformers, and data science.' },
    { username: 'carol_ux', email: 'carol@example.com', fullName: 'Carol Smith', bio: 'UX Designer | Making interfaces intuitive. Sharing design tips & resources.' },
  ];

  const userPassword = await bcrypt.hash('Password123!', 10);
  const userIds = {};

  for (const u of users) {
    const userId = uuidv4();
    const profileId = uuidv4();
    userIds[u.username] = userId;

    await client.query(
      `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive") 
       VALUES ($1, $2, $3, $4, 'USER', true, true) 
       ON CONFLICT (email) DO NOTHING`,
      [userId, u.email, u.username, userPassword]
    );

    await client.query(
      `INSERT INTO profiles (id, "fullName", bio, "userId") 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT ("userId") DO NOTHING`,
      [profileId, u.fullName, u.bio, userId]
    );
  }

  // --- Sample Posts ---
  const samplePosts = [
    {
      title: 'Getting Started with React Hooks',
      content: 'React Hooks revolutionized how we write React components. The two most important hooks are useState and useEffect.\n\n**useState** lets you add state to functional components:\n```js\nconst [count, setCount] = useState(0);\n```\n\n**useEffect** handles side effects like data fetching:\n```js\nuseEffect(() => { fetchData(); }, [dependency]);\n```\n\n#React #JavaScript #WebDev',
      username: 'alice_dev',
    },
    {
      title: 'Introduction to Transformer Architecture',
      content: 'Transformers have become the backbone of modern NLP. The key innovation is the **self-attention mechanism** which allows the model to weigh the importance of different words in a sequence.\n\nThe formula is: Attention(Q, K, V) = softmax(QK^T / sqrt(d_k)) * V\n\nThis has enabled breakthroughs in language models like GPT and BERT.\n\n#MachineLearning #NLP #AI',
      username: 'bob_ml',
    },
    {
      title: 'Design Systems: Why They Matter',
      content: 'A design system is a collection of reusable components, guided by clear standards, that can be assembled together to build any number of applications.\n\n**Key Benefits:**\n- Consistency across products\n- Faster development cycles\n- Better collaboration between dev & design\n- Easier maintenance and updates\n\nPopular examples: Material Design, Ant Design, Tailwind UI.\n\n#UX #Design #DesignSystem',
      username: 'carol_ux',
    },
  ];

  for (const post of samplePosts) {
    const authorId = userIds[post.username];
    if (!authorId) continue;

    const postId = uuidv4();
    await client.query(
      `INSERT INTO posts (id, title, content, "authorId", "isPublished", "publishedAt") 
       VALUES ($1, $2, $3, $4, true, NOW()) 
       ON CONFLICT DO NOTHING`,
      [postId, post.title, post.content, authorId]
    );
  }

  console.log('✅ Seed completed:');
  console.log('   - Admin account: admin@cognify.com / AdminPassword123!');
  console.log('   - User: alice@example.com / Password123!');
  console.log('   - User: bob@example.com / Password123!');
  console.log('   - User: carol@example.com / Password123!');
  console.log('   - 3 sample posts seeded');

  await client.end();
}

seed().catch(console.error);
