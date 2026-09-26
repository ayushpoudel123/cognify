const bcrypt = require('bcrypt');
const { Client } = require('pg');
const { randomUUID: uuidv4 } = require('crypto');

async function seed() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    user: process.env.DB_USERNAME || 'cognify_user',
    password: process.env.DB_PASSWORD || 'cognify_password',
    database: process.env.DB_NAME || 'cognify_db',
  });

  console.log('Connecting to PostgreSQL database...');
  await client.connect();

  console.log('Clearing existing data across all modules...');
  // Truncate tables with cascade to provide a clean state
  await client.query(`
    TRUNCATE TABLE 
      notifications,
      reports,
      messages,
      conversations,
      reactions,
      bookmarks,
      follows,
      comments,
      post_media,
      post_tags,
      posts,
      categories,
      tags,
      profiles,
      refresh_tokens,
      users
    CASCADE;
  `);

  console.log('1/8 Seeding Categories & Tags...');

  // --- Categories ---
  const categoriesData = [
    {
      id: uuidv4(),
      name: 'Computer Science & Software',
      slug: 'computer-science',
      description: 'Data structures, algorithms, system design, and software engineering principles.',
    },
    {
      id: uuidv4(),
      name: 'Artificial Intelligence & ML',
      slug: 'artificial-intelligence',
      description: 'Machine learning, deep learning, LLMs, neural networks, and AI ethics.',
    },
    {
      id: uuidv4(),
      name: 'UI/UX & Product Design',
      slug: 'design-ui-ux',
      description: 'Human-computer interaction, accessible design systems, and user research.',
    },
    {
      id: uuidv4(),
      name: 'Mathematics & Physics',
      slug: 'math-physics',
      description: 'Linear algebra, calculus, discrete mathematics, and theoretical physics.',
    },
    {
      id: uuidv4(),
      name: 'Cybersecurity & Networks',
      slug: 'cybersecurity',
      description: 'Zero trust security, penetration testing, cryptography, and network defense.',
    },
    {
      id: uuidv4(),
      name: 'Bioinformatics & Cognitive Science',
      slug: 'bio-cognitive',
      description: 'Computational biology, genomic algorithms, memory systems, and neuroscience.',
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const res = await client.query(
      `INSERT INTO categories (id, name, slug, description, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, slug`,
      [cat.id, cat.name, cat.slug, cat.description]
    );
    categoryMap[cat.slug] = res.rows[0].id;
  }

  // --- Tags ---
  const tagNames = [
    'react',
    'nextjs',
    'typescript',
    'python',
    'machine-learning',
    'deep-learning',
    'system-design',
    'algorithms',
    'ui-ux',
    'design-systems',
    'linear-algebra',
    'cybersecurity',
    'bioinformatics',
    'neuroscience',
    'devops',
    'cloud-native',
  ];

  const tagMap = {};
  for (const name of tagNames) {
    const tagId = uuidv4();
    const res = await client.query(
      `INSERT INTO tags (id, name, "createdAt", "updatedAt")
       VALUES ($1, $2, NOW(), NOW())
       RETURNING id, name`,
      [tagId, name]
    );
    tagMap[name] = res.rows[0].id;
  }

  console.log('2/8 Seeding 10 Educational Users & 1 Administrator with Unsplash Images...');

  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const commonPassword = await bcrypt.hash('Password123!', 10);

  // Admin account
  const adminId = uuidv4();
  const adminProfileId = uuidv4();
  await client.query(
    `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, 'ADMIN', true, true, NOW(), NOW())`,
    [adminId, 'admin@cognify.com', 'admin', adminPassword]
  );
  await client.query(
    `INSERT INTO profiles (id, "fullName", bio, education, skills, interests, website, "socialLinks", avatar, "coverImage", "userId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
    [
      adminProfileId,
      'System Administrator',
      'Cognify Lead Administrator & Platform Architect. Ensuring high educational quality, safe academic discourse, and platform stability.',
      'Ph.D. in Computer Science & Systems, MIT',
      'Platform Architecture,Moderation,Database Reliability,Security',
      'EdTech,Open Science,Digital Safety,Knowledge Graphs',
      'https://cognify.edu',
      JSON.stringify({ github: 'cognify-admin', twitter: 'cognify_edu', linkedin: 'cognify-platform' }),
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&h=450&q=80',
      adminId,
    ]
  );

  // 10 Educational Users
  const educationalUsers = [
    {
      username: 'dr_elena_ai',
      email: 'elena.ai@cognify.edu',
      fullName: 'Dr. Elena Rostova',
      bio: 'AI Research Scientist & Adjunct Professor. Focused on Large Language Models, interpretability, and AI safety in education.',
      education: 'Ph.D. in Computer Science (Artificial Intelligence), Stanford University',
      skills: 'Machine Learning,PyTorch,LLMs,Transformer Architecture,Python',
      interests: 'Deep Learning,Explainable AI,EdTech,Research Ethics',
      website: 'https://elenarostova.ai',
      socialLinks: { github: 'elenarostova', twitter: 'elena_ai_edu', linkedin: 'elena-rostova-phd' },
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'marcus_code',
      email: 'marcus.dev@cognify.edu',
      fullName: 'Marcus Vance',
      bio: 'Senior Software Architect & CS Instructor. Helping developers master Distributed Systems, Go, and resilient backend architecture.',
      education: 'M.S. in Software Engineering, Carnegie Mellon University',
      skills: 'Distributed Systems,Go,Kubernetes,System Design,Microservices',
      interests: 'High-Performance Computing,Cloud Architecture,Open Source,Mentoring',
      website: 'https://marcusvance.dev',
      socialLinks: { github: 'marcusvance', twitter: 'marcus_builds', linkedin: 'marcus-vance' },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'sophia_design',
      email: 'sophia.ux@cognify.edu',
      fullName: 'Sophia Patel',
      bio: 'Lead Product Designer & Design Educator. Teaching accessible UX, scalable design systems, and human-computer interaction.',
      education: 'B.Des in Human-Computer Interaction, Rhode Island School of Design',
      skills: 'UI/UX Design,Figma,Design Systems,Accessibility (a11y),User Research',
      interests: 'Inclusive Design,Design Tokens,Micro-interactions,Cognitive Psychology',
      website: 'https://sophiapatel.design',
      socialLinks: { twitter: 'sophia_ux', linkedin: 'sophia-patel-design', youtube: 'designwithsophia' },
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'prof_david_math',
      email: 'david.math@cognify.edu',
      fullName: 'Prof. David K. Miller',
      bio: 'Mathematics Professor & Olympiad Coach. Breaking down discrete mathematics, linear algebra, and cryptography for curious minds.',
      education: 'Ph.D. in Pure Mathematics, MIT',
      skills: 'Linear Algebra,Discrete Mathematics,Cryptography,LaTeX,Number Theory',
      interests: 'Mathematical Proofs,Graph Theory,Algorithm Analysis,STEM Outreach',
      website: 'https://davidmiller.math.mit.edu',
      socialLinks: { github: 'dkmiller-math', twitter: 'prof_miller_math', youtube: 'discrete_math_hub' },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'priya_data',
      email: 'priya.data@cognify.edu',
      fullName: 'Priya Sharma',
      bio: 'Data Scientist & Academic Author. Sharing hands-on guides for pandas, statistical modeling, exploratory data analysis, and SQL.',
      education: 'M.S. in Statistics & Data Analytics, University of Washington',
      skills: 'Data Science,Python,SQL,Statistics,Data Visualization,Scikit-Learn',
      interests: 'Predictive Analytics,Big Data,Business Intelligence,Data Storytelling',
      website: 'https://priyasharma.io',
      socialLinks: { github: 'priyasharma-ds', linkedin: 'priya-sharma-data', twitter: 'priya_analytics' },
      avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'alex_security',
      email: 'alex.sec@cognify.edu',
      fullName: 'Alex Rivera',
      bio: 'Cybersecurity Analyst & Offensive Security Instructor. Explaining zero-trust, threat modeling, ethical hacking, and secure code.',
      education: 'B.S. in Cybersecurity & Information Assurance, Purdue University',
      skills: 'Network Security,Penetration Testing,OWASP Top 10,Linux,Cryptography',
      interests: 'Zero Trust Security,Threat Hunting,Reverse Engineering,DevSecOps',
      website: 'https://alexrivera.sec',
      socialLinks: { github: 'arivera-sec', twitter: 'alex_cybersec', linkedin: 'alex-rivera-security' },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'dr_hannah_bio',
      email: 'hannah.bio@cognify.edu',
      fullName: 'Dr. Hannah Kim',
      bio: 'Computational Biologist & Medical Mentor. Bridging genomics, sequence alignment algorithms, and deep learning for medicine.',
      education: 'M.D. / Ph.D. in Computational Biology, Johns Hopkins University',
      skills: 'Bioinformatics,Genomics,Python for Biology,R,Molecular Biology',
      interests: 'Cancer Genomics,CRISPR Therapeutics,Precision Medicine,Health Tech',
      website: 'https://hannahkim.bio',
      socialLinks: { github: 'hannahkim-bio', twitter: 'dr_hannah_kim', linkedin: 'hannah-kim-md-phd' },
      avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'leo_frontend',
      email: 'leo.web@cognify.edu',
      fullName: 'Leo Takahashi',
      bio: 'Frontend Specialist & Open Source Contributor. Creating deep-dive tutorials on Next.js 15, TypeScript patterns, and modern CSS.',
      education: 'B.S. in Computer Science, UC Berkeley',
      skills: 'Next.js,React,TypeScript,Tailwind CSS,Web Performance',
      interests: 'Server Components,Web Vitals,Animation Libraries,Frontend Tooling',
      website: 'https://leotakahashi.dev',
      socialLinks: { github: 'leotakahashi', twitter: 'leo_frontdev', youtube: 'leobuildsweb' },
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'zara_neuro',
      email: 'zara.neuro@cognify.edu',
      fullName: 'Zara Al-Mansoor',
      bio: 'Cognitive Neuroscientist & EdTech Researcher. Studying memory consolidation, active recall, and spaced repetition curves.',
      education: 'M.S. in Cognitive Science, University of Oxford',
      skills: 'Cognitive Neuroscience,Experimental Psychology,Spaced Repetition,Python,EEG Analysis',
      interests: 'Brain Plasticity,Educational Psychology,Accelerated Learning,Neurotech',
      website: 'https://zara-neuro.org',
      socialLinks: { twitter: 'zara_cognition', linkedin: 'zara-almansoor', github: 'zara-neuro' },
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1600&h=450&q=80',
    },
    {
      username: 'kenji_cloud',
      email: 'kenji.cloud@cognify.edu',
      fullName: 'Kenji Sato',
      bio: 'DevOps & SRE Coach. Teaching containerization, infrastructure-as-code with Terraform, CI/CD automation, and cloud resilience.',
      education: 'B.Eng in Computer Systems, Tokyo Institute of Technology',
      skills: 'Docker,Kubernetes,AWS,Terraform,CI/CD,Linux',
      interests: 'Site Reliability Engineering,Infrastructure as Code,Cloud FinOps',
      website: 'https://kenjisato.cloud',
      socialLinks: { github: 'kenjisato-cloud', twitter: 'kenji_devops', linkedin: 'kenji-sato-cloud' },
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&h=400&q=80',
      coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&h=450&q=80',
    },
  ];

  const userIds = { admin: adminId };

  for (const u of educationalUsers) {
    const userId = uuidv4();
    const profileId = uuidv4();

    await client.query(
      `INSERT INTO users (id, email, username, "passwordHash", role, "isVerified", "isActive", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'USER', true, true, NOW(), NOW())`,
      [userId, u.email, u.username, commonPassword]
    );

    await client.query(
      `INSERT INTO profiles (id, "fullName", bio, education, skills, interests, website, "socialLinks", avatar, "coverImage", "userId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        profileId,
        u.fullName,
        u.bio,
        u.education,
        u.skills,
        u.interests,
        u.website,
        JSON.stringify(u.socialLinks),
        u.avatar,
        u.coverImage,
        userId,
      ]
    );

    userIds[u.username] = userId;
  }

  console.log('3/8 Seeding Educational Posts with Unsplash Media & Tags...');

  const educationalPosts = [
    {
      title: 'Demystifying the Transformer Attention Mechanism: A Step-by-Step Breakdown',
      content: `The self-attention mechanism is the cornerstone of modern Large Language Models like GPT-4 and Claude. Rather than processing tokens sequentially like traditional RNNs, self-attention computes pairwise alignment scores between every token in an input sequence simultaneously.\n\n### The Mathematical Foundation\n\nGiven an input matrix $X$, we compute Query, Key, and Value representations via linear projections:\n\n$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$\n\n### Why Scale by $\\sqrt{d_k}$?\nAs dimensionality $d_k$ grows large, the dot products grow in magnitude, pushing the softmax function into regions with tiny gradients (vanishing gradient problem). The $\\sqrt{d_k}$ denominator stabilizes gradient flow.\n\n\`\`\`python\nimport torch\nimport torch.nn.functional as F\n\ndef scaled_dot_product_attention(Q, K, V, mask=None):\n    d_k = Q.size(-1)\n    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)\n    if mask is not None:\n        scores = scores.masked_fill(mask == 0, -1e9)\n    weights = F.softmax(scores, dim=-1)\n    return torch.matmul(weights, V), weights\n\`\`\`\n\nWhat topics in Multi-Head Attention would you like covered in the next lecture? Drop your questions below!`,
      username: 'dr_elena_ai',
      categorySlug: 'artificial-intelligence',
      tags: ['machine-learning', 'deep-learning', 'python'],
      hashtags: 'MachineLearning,DeepLearning,NLP,Transformers,Python',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 1420,
      likesCount: 198,
      commentsCount: 12,
    },
    {
      title: 'Architecting High-Throughput Distributed Cache Systems: Key Trade-offs',
      content: `When scaling applications to millions of concurrent requests, database bottlenecks become unavoidable. Caching isn't just about throwing Redis in front of PostgreSQL; it requires disciplined cache consistency strategies.\n\n### 1. Cache-Aside (Lazy Loading)\n- Application reads from cache first.\n- If cache miss: reads DB, populates cache, returns data.\n- **Pros:** Resilient against cache outages.\n- **Cons:** Stale data risk; initial high latency spike.\n\n### 2. Write-Through vs. Write-Behind\n- **Write-Through:** Cache and DB are updated synchronously. Ensures strict consistency.\n- **Write-Behind (Write-Back):** Writes are buffered in cache and lazily flushed to DB in batches. Extreme write throughput, but risks data loss during ungraceful node termination.\n\n\`\`\`go\n// Cache-aside pattern demonstration in Go\nfunc (s *UserService) GetUserProfile(ctx context.Context, id string) (*Profile, error) {\n    cached, err := s.redis.Get(ctx, "user:"+id).Result()\n    if err == nil {\n        return deserializeProfile(cached), nil\n    }\n    profile, err := s.db.FindUser(ctx, id)\n    if err != nil {\n        return nil, err\n    }\n    s.redis.Set(ctx, "user:"+id, serialize(profile), 15*time.Minute)\n    return profile, nil\n}\n\`\`\`\n\nAlways ask yourself: *What is your system's acceptable data freshness window?*`,
      username: 'marcus_code',
      categorySlug: 'computer-science',
      tags: ['system-design', 'algorithms', 'cloud-native'],
      hashtags: 'SystemDesign,DistributedSystems,BackendArchitecture,GoLang',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 2310,
      likesCount: 284,
      commentsCount: 18,
    },
    {
      title: 'Building Inclusive Design Systems: Color Contrast, Focus States & WCAG 2.2',
      content: `Accessible design is not an afterthought; it is fundamental good engineering. When building UI components, adherence to WCAG 2.2 Level AA guidelines guarantees digital products are usable by everyone, including those with visual and motor impairments.\n\n### Critical Principles:\n1. **Contrast Ratio Rules:** Standard text requires at least **4.5:1** contrast; large text (>=18pt or >=14pt bold) requires **3:1**.\n2. **Never Rely Solely on Color:** Use icons, labels, or patterns alongside color indicators for error states.\n3. **Keyboard Focus rings:** Ensure \`:focus-visible\` is distinct with an offset border so keyboard navigation is intuitive.\n\n\`\`\`css\n/* Accessible focus token example */\n.btn:focus-visible {\n  outline: 2px solid var(--primary-500);\n  outline-offset: 2px;\n  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2);\n}\n\`\`\`\n\nDesigning with empathy builds superior products for everyone!`,
      username: 'sophia_design',
      categorySlug: 'design-ui-ux',
      tags: ['ui-ux', 'design-systems'],
      hashtags: 'DesignSystems,Accessibility,UIUX,WebStandards,WCAG',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 1890,
      likesCount: 215,
      commentsCount: 9,
    },
    {
      title: 'Geometric Intuition Behind Eigenvalues and Eigenvectors in Data Science',
      content: `Many students struggle with linear algebra because equations are taught without geometric visualization. Let's fix that!\n\nWhen a matrix $A$ transforms a vector $x$ ($Ax = y$), the vector typically changes both length and direction. However, **eigenvectors** are special vectors that maintain their exact direction under transformation—they are merely scaled by a factor called the **eigenvalue** $\\lambda$:\n\n$$A v = \\lambda v$$\n\n### Real-world Applications:\n- **Principal Component Analysis (PCA):** The eigenvectors of a dataset's covariance matrix point along the axes of maximum variance!\n- **Google PageRank:** Eigenvector centrality of web link graphs.\n- **Vibration Analysis:** Natural frequencies in mechanical engineering.\n\nNext week, we will write a Python notebook visualizing PCA transformations step by step!`,
      username: 'prof_david_math',
      categorySlug: 'math-physics',
      tags: ['linear-algebra', 'algorithms', 'python'],
      hashtags: 'Mathematics,LinearAlgebra,DataScience,MachineLearning,STEM',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 1650,
      likesCount: 310,
      commentsCount: 14,
    },
    {
      title: 'Mastering Exploratory Data Analysis (EDA): 5 Essential Steps in Python',
      content: `A common rookie error in data science is jumping directly into model training before thoroughly auditing raw data. 80% of data science is exploratory analysis and data hygiene.\n\n### The 5-Step EDA Checklist:\n1. **Data Shape & Types:** Check \`df.info()\` and enforce schema constraints.\n2. **Missingness Audit:** Distinguish between Missing Completely at Random (MCAR) vs. Missing Not at Random (MNAR).\n3. **Distribution Skewness:** Plot histograms and log-transform heavy-tailed distributions.\n4. **Outlier Detection:** Compute Interquartile Ranges (IQR) and investigate leverage points.\n5. **Multicollinearity:** Calculate Variance Inflation Factors (VIF) and correlation heatmaps.\n\n\`\`\`python\nimport pandas as pd\nimport seaborn as sns\nimport matplotlib.pyplot as plt\n\ndef quick_audit(df):\n    print("Null Percentages:\\n", df.isnull().mean() * 100)\n    print("\\nDuplicate Rows:", df.duplicated().sum())\n    plt.figure(figsize=(10, 6))\n    sns.heatmap(df.corr(numeric_only=True), annot=True, cmap='viridis')\n    plt.title("Correlation Matrix")\n\`\`\`\n\nQuality in, quality out! What dataset are you exploring right now?`,
      username: 'priya_data',
      categorySlug: 'artificial-intelligence',
      tags: ['python', 'machine-learning'],
      hashtags: 'DataScience,Python,Pandas,EDA,Analytics,Statistics',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 1980,
      likesCount: 245,
      commentsCount: 11,
    },
    {
      title: 'Zero-Trust Architecture: Never Trust, Always Verify in Modern Networks',
      content: `The traditional perimeter defense model ("castle and moat") is obsolete in today's remote and cloud-first landscape. Once an attacker bypasses the corporate firewall, they enjoy unrestricted lateral movement.\n\n### The 3 Pillars of Zero Trust:\n1. **Verify Explicitly:** Always authenticate and authorize based on all available data points (identity, device health, location, workload).\n2. **Least Privilege Access:** Restrict access with Just-In-Time (JIT) and Just-Enough-Access (JEA) controls.\n3. **Assume Breach:** Minimize blast radius by segmenting access by network, user, devices, and application awareness. Encrypt all communication end-to-end.\n\nDefenders must think in graphs while attackers think in lists. Harden your perimeter and assume internal nodes are potentially compromised!`,
      username: 'alex_security',
      categorySlug: 'cybersecurity',
      tags: ['cybersecurity', 'cloud-native', 'devops'],
      hashtags: 'Cybersecurity,ZeroTrust,InfoSec,CloudSecurity,NetworkDefense',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 2120,
      likesCount: 270,
      commentsCount: 16,
    },
    {
      title: 'How Dynamic Programming Powers DNA Sequence Alignment (Needleman-Wunsch)',
      content: `How do geneticists compare human DNA sequences against reference genomes with billions of base pairs? The answer lies in dynamic programming algorithms developed in 1970!\n\n### The Needleman-Wunsch Algorithm\nGiven two sequences $A$ and $B$, we construct a grid matrix where each cell represents the optimal alignment score up to indices $i$ and $j$:\n\n$$F(i,j) = \\max \\begin{cases} F(i-1, j-1) + S(A_i, B_j) & \\text{(Match/Mismatch)} \\\\ F(i-1, j) + d & \\text{(Deletion / Gap)} \\\\ F(i, j-1) + d & \\text{(Insertion / Gap)} \\end{cases}$$\n\nTracing back through the matrix gives the global alignment. It is amazing how classic CS algorithms directly advance cancer treatment and gene therapy today!`,
      username: 'dr_hannah_bio',
      categorySlug: 'bio-cognitive',
      tags: ['bioinformatics', 'algorithms', 'python'],
      hashtags: 'Bioinformatics,ComputationalBiology,Genomics,Algorithms,HealthTech',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 1540,
      likesCount: 182,
      commentsCount: 8,
    },
    {
      title: 'Next.js 15 Deep Dive: React Server Components and Server Actions in Practice',
      content: `React Server Components (RSC) fundamentally redefine how modern web applications manage data fetching and bundle sizes.\n\n### Key Advantages of Server Components:\n- **Zero Client Bundle Impact:** Heavy libraries (like marked, date-fns, or database ORMs) remain on the server and send pure HTML/JSON stream to the client.\n- **Direct Database Access:** No need for boilerplate API endpoints just to read read-only data for initial render.\n- **Server Actions:** Type-safe form mutations with automatic optimistic updates and revalidation.\n\n\`\`\`tsx\n// Server Action inside a Next.js Server Component\nimport { revalidatePath } from 'next/cache';\n\nexport async function updateBio(formData: FormData) {\n  'use server';\n  const bio = formData.get('bio');\n  await db.user.update({ where: { id: session.user.id }, data: { bio } });\n  revalidatePath('/profile');\n}\n\`\`\`\n\nHave you transitioned your production apps to App Router yet? Let's discuss migration gotchas!`,
      username: 'leo_frontend',
      categorySlug: 'computer-science',
      tags: ['react', 'nextjs', 'typescript'],
      hashtags: 'Nextjs,React,WebDevelopment,Frontend,TypeScript',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 2890,
      likesCount: 360,
      commentsCount: 22,
    },
    {
      title: 'The Neuroscience of Spaced Repetition: Why Cramming Fails Long-Term Memory',
      content: `The human brain is optimized to forget trivia unless repeated retrieval cues convince the hippocampus that the information is vital for survival.\n\n### The Ebbinghaus Forgetting Curve\nImmediately after studying, retention drops exponentially over 48 hours. However, each active retrieval session flattens the decay curve.\n\n### 3 Science-Backed Learning Rules:\n1. **Active Recall > Passive Rereading:** Testing yourself forces synaptic strengthening (long-term potentiation).\n2. **Optimal Inter-Study Intervals:** Review at expanding intervals (1 day, 3 days, 7 days, 21 days).\n3. **Sleep Consolidates Memory:** Stage 3 Slow-Wave Sleep transfers episodic memories to the neocortex for permanent semantic storage.\n\nWork with your brain biology, not against it!`,
      username: 'zara_neuro',
      categorySlug: 'bio-cognitive',
      tags: ['neuroscience', 'edtech'],
      hashtags: 'Neuroscience,StudyHacks,CognitiveScience,LearningHowToLearn,EdTech',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 3200,
      likesCount: 420,
      commentsCount: 25,
    },
    {
      title: 'Production Docker Containers: Multi-Stage Builds & Non-Root Security Best Practices',
      content: `A default Docker container running as root user with dev dependencies included in the final image is a severe security liability.\n\n### Essential Container Best Practices:\n- **Multi-Stage Builds:** Compile your TypeScript or Go binaries in a build stage; copy ONLY the artifacts into a minimal alpine or distroless runtime stage.\n- **Non-root user:** Explicitly specify \`USER node\` or \`USER 1001\` to prevent container breakout exploits.\n- **Use .dockerignore:** Never bundle local \`node_modules\`, \`.git\`, or environment files into image layers.\n\n\`\`\`dockerfile\n# Stage 1: Build\nFROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Stage 2: Production Minimal Runtime\nFROM node:20-alpine AS runner\nWORKDIR /app\nENV NODE_ENV=production\nUSER node\nCOPY --chown=node:node --from=builder /app/dist ./dist\nCOPY --chown=node:node --from=builder /app/node_modules ./node_modules\nEXPOSE 3000\nCMD ["node", "dist/main"]\n\`\`\`\n\nShrink your attack surface and drop image sizes from 1.2GB down to 85MB!`,
      username: 'kenji_cloud',
      categorySlug: 'computer-science',
      tags: ['docker', 'devops', 'cloud-native'],
      hashtags: 'DevOps,Docker,Containers,CloudArchitecture,Security',
      type: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=1200&h=630&q=80',
      viewsCount: 2470,
      likesCount: 295,
      commentsCount: 15,
    },
    {
      title: 'Top 5 Habits of Highly Effective Computer Science Researchers',
      content: `Reflecting on my decade mentoring graduate students and conducting AI research, the difference between great researchers and struggling ones rarely comes down to raw IQ. It comes down to daily rigor.\n\n1. **Read one paper daily with pen and paper:** Don't just skim abstracts. Reproduce the main proof or architecture by hand.\n2. **Maintain a structured research logbook:** Document every negative experiment. Failed hypotheses often point to the real breakthrough.\n3. **Master LaTeX and diagramming tools early:** Clear visual communication makes review committees take your findings seriously.\n4. **Seek harsh criticism before submitting:** Internal red-teaming avoids embarrassing peer review rejections.\n5. **Prioritize mental endurance over 14-hour sprints:** Research is a marathon. Steady, consistent momentum wins.\n\nTo all students drafting papers this semester: keep pushing forward!`,
      username: 'dr_elena_ai',
      categorySlug: 'computer-science',
      tags: ['algorithms', 'machine-learning'],
      hashtags: 'ComputerScience,AcademicResearch,PhDLife,Mentorship,StudyTips',
      type: 'TEXT',
      viewsCount: 1720,
      likesCount: 230,
      commentsCount: 14,
    },
  ];

  const postIds = [];
  const postAuthorMap = {};

  for (const p of educationalPosts) {
    const authorId = userIds[p.username];
    const categoryId = categoryMap[p.categorySlug];
    const postId = uuidv4();

    await client.query(
      `INSERT INTO posts (id, title, content, type, status, "viewsCount", "likesCount", "commentsCount", hashtags, "authorId", "categoryId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, 'PUBLISHED', $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
      [postId, p.title, p.content, p.type, p.viewsCount, p.likesCount, p.commentsCount, p.hashtags, authorId, categoryId]
    );

    postIds.push(postId);
    postAuthorMap[postId] = authorId;

    // Post media if type is IMAGE
    if (p.type === 'IMAGE' && p.imageUrl) {
      const mediaId = uuidv4();
      await client.query(
        `INSERT INTO post_media (id, url, type, "order", "postId", "createdAt", "updatedAt")
         VALUES ($1, $2, 'IMAGE', 0, $3, NOW(), NOW())`,
        [mediaId, p.imageUrl, postId]
      );
    }

    // Post tags
    if (p.tags && p.tags.length > 0) {
      for (const t of p.tags) {
        const tagId = tagMap[t];
        if (tagId) {
          await client.query(
            `INSERT INTO post_tags ("postsId", "tagsId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [postId, tagId]
          );
        }
      }
    }
  }

  console.log('4/8 Seeding Educational Comments & Nested Discussion Replies...');

  const commentsData = [
    {
      postIndex: 0, // Elena's Attention post
      username: 'priya_data',
      content: 'Brilliant explanation, Dr. Elena! Could you elaborate on how flash-attention optimizes GPU SRAM memory bandwidth compared to standard scaled dot-product attention?',
      replies: [
        {
          username: 'dr_elena_ai',
          content: 'Great question Priya! Standard attention materializes the intermediate $N \\times N$ attention matrix in High Bandwidth Memory (HBM). FlashAttention tiles the computation using online softmax, calculating everything in fast SRAM and reducing HBM read/write bottlenecks dramatically.',
        },
      ],
    },
    {
      postIndex: 1, // Marcus's Distributed Caching post
      username: 'kenji_cloud',
      content: 'Marcus, how do you handle cache stampede (thundering herd) when a high-traffic key expires simultaneously across hundreds of backend workers?',
      replies: [
        {
          username: 'marcus_code',
          content: 'Excellent point Kenji. We typically employ two techniques: 1) probabilistic early expiration (XFetch algorithm), or 2) singleflight mutex locks where only one worker fetches from DB while others await the result.',
        },
      ],
    },
    {
      postIndex: 2, // Sophia's Design Systems post
      username: 'leo_frontend',
      content: 'The CSS focus-visible snippet is gold. A lot of developers accidentally set outline: none without providing an accessible alternative.',
      replies: [
        {
          username: 'sophia_design',
          content: 'Exactly Leo! It is one of the most common automated accessibility audit failures. Glad you found the token snippet helpful!',
        },
      ],
    },
    {
      postIndex: 3, // David's Math post
      username: 'dr_hannah_bio',
      content: 'We use PCA on single-cell RNA-seq datasets every day. Seeing the geometric transformation mapped out makes teaching it to biology students so much easier!',
      replies: [
        {
          username: 'prof_david_math',
          content: 'Delighted to hear that, Dr. Hannah! Connecting abstract geometry with real genomic data makes mathematics truly come alive.',
        },
      ],
    },
    {
      postIndex: 7, // Leo's Next.js 15 post
      username: 'marcus_code',
      content: 'Server Actions with optimistic UI updates have really reduced client-side Redux/state management overhead in our newer apps.',
      replies: [
        {
          username: 'leo_frontend',
          content: '100% agree Marcus. Removing client fetch waterfalls and keeping state synchronized on the server simplifies frontend architecture tremendously.',
        },
      ],
    },
    {
      postIndex: 8, // Zara's Neuroscience post
      username: 'prof_david_math',
      content: 'I always advise my Olympiad math students to sleep at least 8 hours before competitions rather than doing all-nighters. Your neuroscience breakdown proves why!',
      replies: [
        {
          username: 'zara_neuro',
          content: 'Spot on, Professor! Depriving the brain of slow-wave sleep prevents neural synaptic pruning, leading to mental brain fog and impaired problem-solving.',
        },
      ],
    },
  ];

  for (const c of commentsData) {
    const targetPostId = postIds[c.postIndex];
    if (!targetPostId) continue;
    const authorId = userIds[c.username];
    const commentId = uuidv4();

    await client.query(
      `INSERT INTO comments (id, content, "likesCount", "authorId", "postId", "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, 4, $3, $4, NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours')`,
      [commentId, c.content, authorId, targetPostId]
    );

    if (c.replies) {
      for (const r of c.replies) {
        const replyAuthorId = userIds[r.username];
        const replyId = uuidv4();
        await client.query(
          `INSERT INTO comments (id, content, "likesCount", "authorId", "postId", "parentId", "createdAt", "updatedAt")
           VALUES ($1, $2, 3, $3, $4, $5, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')`,
          [replyId, r.content, replyAuthorId, targetPostId, commentId]
        );
      }
    }
  }

  console.log('5/8 Seeding Social Graph: Follows, Reactions (Likes), and Bookmarks...');

  // Social Follows (Academic & peer mentor network)
  const followPairs = [
    ['dr_elena_ai', 'priya_data'],
    ['priya_data', 'dr_elena_ai'],
    ['marcus_code', 'kenji_cloud'],
    ['kenji_cloud', 'marcus_code'],
    ['sophia_design', 'leo_frontend'],
    ['leo_frontend', 'sophia_design'],
    ['prof_david_math', 'dr_hannah_bio'],
    ['dr_hannah_bio', 'prof_david_math'],
    ['alex_security', 'kenji_cloud'],
    ['zara_neuro', 'dr_elena_ai'],
    ['leo_frontend', 'marcus_code'],
    ['priya_data', 'prof_david_math'],
    ['dr_hannah_bio', 'zara_neuro'],
    ['kenji_cloud', 'alex_security'],
  ];

  for (const [follower, following] of followPairs) {
    const fId = userIds[follower];
    const tId = userIds[following];
    if (fId && tId) {
      await client.query(
        `INSERT INTO follows (id, "followerId", "followingId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [uuidv4(), fId, tId]
      );
    }
  }

  // Reactions (Likes) on Posts
  for (let i = 0; i < postIds.length; i++) {
    const postId = postIds[i];
    // Have 3-4 users like each post
    const likers = Object.values(userIds).slice(1, 5);
    for (const likerId of likers) {
      await client.query(
        `INSERT INTO reactions (id, "userId", "targetType", "targetId", type, "createdAt", "updatedAt")
         VALUES ($1, $2, 'POST', $3, 'LIKE', NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [uuidv4(), likerId, postId]
      );
    }
  }

  // Bookmarks (Users saving educational articles)
  const bookmarkData = [
    { username: 'leo_frontend', postIndex: 0 },
    { username: 'priya_data', postIndex: 3 },
    { username: 'kenji_cloud', postIndex: 1 },
    { username: 'dr_hannah_bio', postIndex: 3 },
    { username: 'alex_security', postIndex: 9 },
    { username: 'zara_neuro', postIndex: 8 },
  ];

  for (const b of bookmarkData) {
    const uId = userIds[b.username];
    const pId = postIds[b.postIndex];
    if (uId && pId) {
      await client.query(
        `INSERT INTO bookmarks (id, "userId", "postId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         ON CONFLICT DO NOTHING`,
        [uuidv4(), uId, pId]
      );
    }
  }

  console.log('6/8 Seeding Chat Conversations & Direct Messages...');

  const conversationsData = [
    {
      userOne: 'dr_elena_ai',
      userTwo: 'priya_data',
      messages: [
        { sender: 'priya_data', text: 'Hi Dr. Elena, I read your latest paper on attention sparsity. Absolutely loved the benchmarks!' },
        { sender: 'dr_elena_ai', text: 'Thank you Priya! We are presenting an updated ablation study next month at the symposium.' },
        { sender: 'priya_data', text: 'I would love to collaborate on the statistical validation section if you have an open slot.' },
        { sender: 'dr_elena_ai', text: 'That would be fantastic. Let us schedule a virtual sync this Thursday at 3 PM.' },
      ],
    },
    {
      userOne: 'marcus_code',
      userTwo: 'leo_frontend',
      messages: [
        { sender: 'leo_frontend', text: 'Hey Marcus, what is your take on streaming Server-Sent Events vs WebSockets for educational dashboard alerts?' },
        { sender: 'marcus_code', text: 'For unidirectional server-to-client updates like notifications or progress bars, SSE over HTTP/2 is vastly simpler and reconnects automatically!' },
        { sender: 'leo_frontend', text: 'Makes total sense. We will use SSE for the feed activity ticker and keep WebSockets solely for real-time peer chat.' },
      ],
    },
    {
      userOne: 'sophia_design',
      userTwo: 'leo_frontend',
      messages: [
        { sender: 'sophia_design', text: 'Leo, I updated the Figma tokens for dark mode contrast ratios. Check out the new slate palette.' },
        { sender: 'leo_frontend', text: 'Looks gorgeous! All the badge tokens now pass WCAG 2.2 AAA standard.' },
      ],
    },
  ];

  for (const conv of conversationsData) {
    const u1 = userIds[conv.userOne];
    const u2 = userIds[conv.userTwo];
    if (!u1 || !u2) continue;

    const convId = uuidv4();
    const lastMsg = conv.messages[conv.messages.length - 1];

    await client.query(
      `INSERT INTO conversations (id, "userOneId", "userTwoId", "lastMessageContent", "lastMessageAt", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
      [convId, u1, u2, lastMsg.text]
    );

    for (const msg of conv.messages) {
      const senderId = userIds[msg.sender];
      await client.query(
        `INSERT INTO messages (id, "conversationId", "senderId", content, "isSeen", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, true, NOW() - INTERVAL '10 minutes', NOW() - INTERVAL '10 minutes')`,
        [uuidv4(), convId, senderId, msg.text]
      );
    }
  }

  console.log('7/8 Seeding Educational Notifications...');

  const notificationData = [
    {
      recipient: 'dr_elena_ai',
      actor: 'priya_data',
      type: 'COMMENT',
      message: 'priya_data commented on your post "Demystifying the Transformer Attention Mechanism"',
      entityId: postIds[0],
    },
    {
      recipient: 'marcus_code',
      actor: 'kenji_cloud',
      type: 'LIKE',
      message: 'kenji_cloud liked your post "Architecting High-Throughput Distributed Cache Systems"',
      entityId: postIds[1],
    },
    {
      recipient: 'sophia_design',
      actor: 'leo_frontend',
      type: 'FOLLOW',
      message: 'leo_frontend started following your educational updates',
      entityId: userIds['leo_frontend'],
    },
    {
      recipient: 'dr_elena_ai',
      actor: 'zara_neuro',
      type: 'FOLLOW',
      message: 'zara_neuro started following your research',
      entityId: userIds['zara_neuro'],
    },
  ];

  for (const n of notificationData) {
    const rId = userIds[n.recipient];
    const aId = userIds[n.actor];
    if (rId && aId) {
      await client.query(
        `INSERT INTO notifications (id, "recipientId", "actorId", type, "entityId", message, "isRead", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, false, NOW(), NOW())`,
        [uuidv4(), rId, aId, n.type, n.entityId, n.message]
      );
    }
  }

  console.log('8/8 Seeding Moderation Reports (for Admin Dashboard)...');

  // Add 1 sample flagged post to demonstrate moderation workflow
  const flaggedPostId = uuidv4();
  await client.query(
    `INSERT INTO posts (id, title, content, type, status, "flagReason", "viewsCount", "likesCount", "commentsCount", "authorId", "categoryId", "createdAt", "updatedAt")
     VALUES ($1, $2, $3, 'TEXT', 'FLAGGED', $4, 45, 1, 0, $5, $6, NOW(), NOW())`,
    [
      flaggedPostId,
      'Cryptocurrency Trading Course 100% Guaranteed Returns in 24 Hours',
      'Join our external telegram link to double your crypto investments with AI bots. Guaranteed income guaranteed!',
      'Reported for suspected academic spam and commercial advertisement',
      userIds['alex_security'],
      categoryMap['computer-science'],
    ]
  );

  const sampleReports = [
    {
      reporterUsername: 'dr_elena_ai',
      targetType: 'POST',
      targetId: flaggedPostId,
      reason: 'SPAM',
      details: 'Commercial promotion violating educational content guidelines and advertising fraudulent crypto schemes.',
      status: 'PENDING',
    },
    {
      reporterUsername: 'prof_david_math',
      targetType: 'POST',
      targetId: postIds[0],
      reason: 'FALSE_INFORMATION',
      details: 'Suggested revision: Typo in the mathematical index notation on step 2, resolved with author.',
      status: 'REVIEWED',
    },
  ];

  for (const rep of sampleReports) {
    const repId = userIds[rep.reporterUsername];
    if (repId) {
      await client.query(
        `INSERT INTO reports (id, "reporterId", "targetType", "targetId", reason, details, status, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [uuidv4(), repId, rep.targetType, rep.targetId, rep.reason, rep.details, rep.status]
      );
    }
  }

  console.log('---------------------------------------------------------');
  console.log('✅ Educational Seed Completed Successfully!');
  console.log('📊 Seeded Data Summary:');
  console.log('   - 1 Administrator (admin@cognify.com / AdminPassword123!)');
  console.log('   - 10 Educational Users (Password: Password123!)');
  console.log('     * dr_elena_ai, marcus_code, sophia_design, prof_david_math');
  console.log('     * priya_data, alex_security, dr_hannah_bio, leo_frontend');
  console.log('     * zara_neuro, kenji_cloud');
  console.log('   - High-resolution Unsplash Avatars & Cover Banners for all users');
  console.log('   - 6 Educational Categories & 16 Core Tags');
  console.log('   - 12 Rich Educational Posts (with Unsplash diagrams & markdown)');
  console.log('   - Threaded Comments, Replies, Reactions, and Bookmarks');
  console.log('   - Follow Graph & Direct Chat Conversations with Messages');
  console.log('   - Real-time Notifications & Admin Moderation Reports');
  console.log('---------------------------------------------------------');

  await client.end();
}

seed().catch((err) => {
  console.error('❌ Error during seeding:', err);
  process.exit(1);
});
