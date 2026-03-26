import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Firebase config
const firebaseConfigPath = path.join(__dirname, '..', 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf8'));

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp, firebaseConfig.firestoreDatabaseId);

// PostgreSQL connection
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/escola_dublagem';
const pool = new Pool({ connectionString });

// Helper function to convert Firebase timestamp to PostgreSQL timestamp
function convertTimestamp(timestamp) {
  if (!timestamp) return null;
  if (timestamp.toDate) {
    return timestamp.toDate().toISOString();
  }
  return timestamp;
}

// Helper function to insert data into PostgreSQL
async function insertData(tableName, data) {
  if (!data || data.length === 0) {
    console.log(`No data to insert into ${tableName}`);
    return;
  }

  const client = await pool.connect();
  try {
    // Start a transaction
    await client.query('BEGIN');

    for (const item of data) {
      // Convert Firebase document to PostgreSQL row
      const keys = Object.keys(item).filter(key => key !== 'id');
      const values = keys.map(key => {
        const value = item[key];
        
        // Handle arrays
        if (Array.isArray(value)) {
          return JSON.stringify(value);
        }
        
        // Handle objects
        if (value && typeof value === 'object' && !value.toDate) {
          return JSON.stringify(value);
        }
        
        // Handle timestamps
        if (value && value.toDate) {
          return convertTimestamp(value);
        }
        
        return value;
      });
      
      const placeholders = keys.map((_, i) => `$${i + 2}`).join(', ');
      const query = `
        INSERT INTO ${tableName} (id, ${keys.join(', ')})
        VALUES ($1, ${placeholders})
        ON CONFLICT (id) DO UPDATE SET
        ${keys.map((key, i) => `${key} = $${i + 2}`).join(', ')}
      `;
      
      await client.query(query, [item.id, ...values]);
    }
    
    // Commit the transaction
    await client.query('COMMIT');
    console.log(`Successfully inserted ${data.length} items into ${tableName}`);
  } catch (error) {
    // Rollback the transaction on error
    await client.query('ROLLBACK');
    console.error(`Error inserting data into ${tableName}:`, error);
    throw error;
  } finally {
    client.release();
  }
}

// Main migration function
async function migrateData() {
  console.log('Starting migration from Firebase to PostgreSQL...');
  
  try {
    // Migrate banners
    console.log('Migrating banners...');
    const bannersSnapshot = await getDocs(collection(firestore, 'banners'));
    const banners = bannersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    await insertData('banners', banners);
    
    // Migrate modules
    console.log('Migrating modules...');
    const modulesSnapshot = await getDocs(collection(firestore, 'modules'));
    const modules = modulesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      details: JSON.stringify(doc.data().details || {})
    }));
    await insertData('modules', modules);
    
    // Migrate teachers
    console.log('Migrating teachers...');
    const teachersSnapshot = await getDocs(collection(firestore, 'teachers'));
    const teachers = teachersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      specialties: JSON.stringify(doc.data().specialties || [])
    }));
    await insertData('teachers', teachers);
    
    // Migrate testimonials
    console.log('Migrating testimonials...');
    const testimonialsSnapshot = await getDocs(collection(firestore, 'testimonials'));
    const testimonials = testimonialsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    await insertData('testimonials', testimonials);
    
    // Migrate FAQs
    console.log('Migrating FAQs...');
    const faqsSnapshot = await getDocs(collection(firestore, 'faqs'));
    const faqs = faqsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    await insertData('faqs', faqs);
    
    // Migrate settings
    console.log('Migrating settings...');
    const settingsSnapshot = await getDocs(collection(firestore, 'settings'));
    const settings = settingsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      social_links: JSON.stringify(doc.data().socialLinks || {})
    }));
    await insertData('settings', settings);
    
    // Migrate enrollments
    console.log('Migrating enrollments...');
    const enrollmentsSnapshot = await getDocs(collection(firestore, 'enrollments'));
    const enrollments = enrollmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    await insertData('enrollments', enrollments);
    
    // Migrate minicourses
    console.log('Migrating minicourses...');
    const minicursosSnapshot = await getDocs(collection(firestore, 'minicourses'));
    const minicursos = minicursosSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        category: data.category || 'Dublagem',
        image_url: data.imageUrl,
        level: data.level || 'Iniciante'
      };
    });
    await insertData('minicourses', minicursos);
    
    // Migrate lessons
    console.log('Migrating lessons...');
    for (const course of minicursos) {
      const lessonsSnapshot = await getDocs(collection(firestore, `minicourses/${course.id}/lessons`));
      const lessons = lessonsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          course_id: course.id,
          title: data.title,
          duration: data.duration,
          content: data.content,
          media_type: data.mediaType,
          is_special: data.isSpecial || false,
          slide_bg_url: data.slideBgUrl
        };
      });
      await insertData('lessons', lessons);
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await pool.end();
  }
}

// Run the migration
migrateData().catch(console.error);
