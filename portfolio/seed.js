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

const AchievementSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  badge: { type: String, required: true },
  certificates: { type: Array, default: [] },
}, { timestamps: true });

const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', AchievementSchema);

const FALLBACK_ACHIEVEMENTS = [
  { icon: '🏆', title: '1st Place', subtitle: 'TECHFIESTA International Hackathon', description: 'Won first place at an international-level hackathon among competitors from multiple countries.', color: '#f59e0b', badge: 'International' },
  { icon: '🥈', title: 'Runner Up', subtitle: 'CodeKshetra National Hackathon', description: 'Achieved runner-up position at the national-level CodeKshetra competitive hackathon.', color: '#94a3b8', badge: 'National' },
  { icon: '📜', title: 'Design Patent', subtitle: 'Government Patent Filed & Granted', description: 'Officially filed and received a Government of India design patent for an innovative project.', color: '#22c55e', badge: 'Patent' },
  { icon: '📖', title: 'Research Published', subtitle: 'IRJMETS · IJIRSET', description: 'Authored and published research papers in peer-reviewed international journals IRJMETS and IJIRSET.', color: '#00d4aa', badge: 'Publication' },
  { icon: '🎓', title: 'NPTEL Certified', subtitle: 'DSA (IIT KGP) · AI (IIT Madras)', description: 'Completed NPTEL certifications in Data Structures & Algorithms from IIT Kharagpur and AI from IIT Madras.', color: '#7c3aed', badge: 'IIT Certified' },
  { icon: '☁️', title: 'AICTE EduSkills', subtitle: 'Full Stack · AWS · Cyber Security', description: 'Completed AICTE EduSkills programs in Full Stack Development, AWS Cloud, and Cyber Security.', color: '#3b82f6', badge: 'AICTE' },
];

async function seed() {
  try {
    await mongoose.connect(URI);
    console.log("Connected to MongoDB...");
    
    for (const ach of FALLBACK_ACHIEVEMENTS) {
      const exists = await Achievement.findOne({ title: ach.title });
      if (!exists) {
        await Achievement.create(ach);
        console.log(`Inserted: ${ach.title}`);
      } else {
        console.log(`Skipped existing: ${ach.title}`);
      }
    }
    console.log("Done seeding!");
    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

seed();
