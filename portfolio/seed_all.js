const mongoose = require('mongoose');
const fs = require('fs');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value.length > 0) {
    process.env[key.trim()] = value.join('=').trim();
  }
});

const URI = process.env.MONGODB_URI;

// Schemas
const ProjectSchema = new mongoose.Schema({
  title: String, subtitle: String, description: String,
  live: String, github: String, tags: [String],
  metric: String, metricColor: String, accent: String, icon: String, order: Number
});
const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

const SkillGroupSchema = new mongoose.Schema({
  title: String, icon: String, tags: [String], order: Number
});
const SkillGroup = mongoose.models.SkillGroup || mongoose.model('SkillGroup', SkillGroupSchema);

const TopSkillSchema = new mongoose.Schema({
  name: String, pct: Number, order: Number
});
const TopSkill = mongoose.models.TopSkill || mongoose.model('TopSkill', TopSkillSchema);

const ExperienceSchema = new mongoose.Schema({
  role: String, company: String, period: String, type: String,
  typeColor: String, points: [String], stack: [String], icon: String, order: Number
});
const Experience = mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);

const ContactSchema = new mongoose.Schema({
  label: String, value: String, href: String, color: String, description: String, icon: String, order: Number
});
const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);

// Data
const PROJECTS = [
  {
    title: 'ETA OTT', subtitle: 'AI Educational Platform',
    description: 'Full-stack AI platform with RAG pipelines, semantic retrieval, LLM conversational agents and WhatsApp integration. Deployed on AWS EC2 with Docker, Redis, and CI/CD pipelines achieving +30% UI responsiveness.',
    live: 'https://eta-ott.netlify.app', github: 'https://github.com/shivam222343/ETA-OTT-_V2',
    tags: ['React.js', 'FastAPI', 'RAG', 'LLM Agents', 'AWS EC2', 'Docker', 'Redis'],
    metric: '+30% UI responsiveness · Live on AWS', metricColor: '#22c55e', accent: '#00d4aa', icon: '🚀',
  },
  {
    title: 'Task Manager', subtitle: 'Workflow Platform',
    description: 'Full-stack task management with JWT authentication, role-based access control (admin/trainer/front-desk) and centralized state management for scalable enterprise workflows.',
    github: 'https://github.com/Jax-2207/Task-Manager-Employee-Task-Decision-System-',
    tags: ['React.js', 'Flask', 'JWT', 'RBAC', 'MongoDB'],
    metric: 'Role-based access · Scalable architecture', metricColor: '#7c3aed', accent: '#7c3aed', icon: '📋',
  },
  {
    title: 'DataExtract', subtitle: 'Intelligent Retrieval',
    description: 'AI-powered semantic search system via FastAPI with vector-based retrieval pipelines. Enables intelligent document querying using async processing and cosine similarity search.',
    github: 'https://github.com/Jax-2207/Dataextract_model',
    tags: ['FastAPI', 'Vector Search', 'Semantic Retrieval', 'Async', 'FAISS'],
    metric: 'Vector embeddings · Semantic search', metricColor: '#f59e0b', accent: '#f59e0b', icon: '🔍',
  },
];

const SKILL_GROUPS = [
  { title: 'AI / ML Systems', icon: '🤖', tags: ['RAG Pipelines', 'LLM Integration', 'Semantic Search', 'Vector Embeddings', 'AI Agents', 'Workflow Automation'] },
  { title: 'Backend', icon: '⚡', tags: ['Node.js', 'Express.js', 'FastAPI', 'Flask', 'REST APIs', 'Python', 'JWT Auth'] },
  { title: 'Frontend', icon: '🎨', tags: ['React.js', 'Next.js', 'TypeScript', 'JavaScript ES6+', 'HTML5', 'CSS3'] },
  { title: 'Cloud & DevOps', icon: '☁️', tags: ['AWS EC2', 'Docker', 'CI/CD', 'GitHub Actions', 'Redis', 'MongoDB', 'Neo4j', 'Firebase'] },
];

const TOP_SKILLS = [
  { name: 'React.js / Next.js', pct: 92 },
  { name: 'FastAPI / Python', pct: 90 },
  { name: 'RAG Pipelines', pct: 87 },
  { name: 'AWS / Docker', pct: 82 },
  { name: 'Node.js / Express', pct: 85 },
  { name: 'TypeScript', pct: 88 },
];

const EXPERIENCES = [
  {
    role: 'Software Developer Intern', company: 'Immortal Tech', period: 'Jun 2025 – Jul 2025', type: 'Internship', typeColor: '#00d4aa',
    points: ['Designed and optimized REST APIs, reducing response time by 20%', 'Integrated frontend and backend across 3+ product features', 'Worked with MongoDB, Firebase, Git, and deployment pipelines'],
    stack: ['MongoDB', 'Firebase', 'REST APIs', 'Git'], icon: '💼',
  },
  {
    role: 'Software Developer Intern', company: 'Austere Systems', period: 'Jun 2024 – Aug 2024', type: 'Internship', typeColor: '#00d4aa',
    points: ['Built backend integrations for live production workflows', 'Delivered 2+ product features end-to-end', 'Collaborated with cross-functional teams on full-stack architecture'],
    stack: ['Python', 'REST APIs', 'Backend Integration', 'Git'], icon: '⚙️',
  },
  {
    role: 'Technical Head', company: 'CABSSA + E-Cell', period: '2024 – Present', type: 'Leadership', typeColor: '#7c3aed',
    points: ['Led technical strategy for CABSSA college association', 'Mentored developer teams on projects and best practices', 'Website & Technical Head at E-Cell (2025–2026)', 'Managed technical infrastructure and developer operations'],
    stack: ['Leadership', 'Web Dev', 'Team Management'], icon: '🎯',
  },
];

const CONTACTS = [
  { icon: '📧', label: 'Email', value: 'jaywani22@gmail.com', href: 'mailto:jaywani22@gmail.com', color: '#00d4aa', description: 'Reach out directly' },
  { icon: '🌐', label: 'GitHub', value: 'github.com/Jax-2207', href: 'https://github.com/Jax-2207', color: '#94a3b8', description: 'View my code' },
  { icon: '🔗', label: 'LinkedIn', value: 'linkedin.com/in/jay-wani', href: 'https://linkedin.com/in/jay-wani-0782683a8', color: '#0ea5e9', description: 'Connect professionally' },
  { icon: '🚀', label: 'Live Project', value: 'eta-ott.netlify.app', href: 'https://eta-ott.netlify.app', color: '#7c3aed', description: 'See it in action' },
];

async function seed() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB...");

    const seedModel = async (Model, dataArray, uniqueField) => {
      for (let i = 0; i < dataArray.length; i++) {
        const item = dataArray[i];
        item.order = i;
        const exists = await Model.findOne({ [uniqueField]: item[uniqueField] });
        if (!exists) {
          await Model.create(item);
          console.log(`Inserted into ${Model.modelName}: ${item[uniqueField]}`);
        } else {
          console.log(`Skipped existing in ${Model.modelName}: ${item[uniqueField]}`);
        }
      }
    };

    await seedModel(Project, PROJECTS, 'title');
    await seedModel(SkillGroup, SKILL_GROUPS, 'title');
    await seedModel(TopSkill, TOP_SKILLS, 'name');
    await seedModel(Experience, EXPERIENCES, 'company');
    await seedModel(Contact, CONTACTS, 'label');

    console.log("Done seeding all legacy data!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
