import { createClient } from '@supabase/supabase-js';
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

// Database connection
const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/escola_dublagem';

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials not found. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// PostgreSQL connection
const pool = new Pool({ connectionString });

async function setupDatabase() {
  console.log('Setting up database...');

  try {
    // Connect to the database
    await pool.connect();
    console.log('Connected to PostgreSQL');

    // Create tables for the main application (escola-dublagem)
    console.log('Creating tables for the main application...');
    
    // Banners table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS banners (
        id VARCHAR PRIMARY KEY,
        title TEXT NOT NULL,
        subtitle TEXT,
        image_url TEXT NOT NULL,
        link TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Modules table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS modules (
        id VARCHAR PRIMARY KEY,
        num INTEGER NOT NULL,
        title TEXT NOT NULL,
        desc TEXT NOT NULL,
        duration TEXT NOT NULL,
        details JSONB NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Teachers table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        photo TEXT NOT NULL,
        bio TEXT,
        specialties TEXT[] NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Testimonials table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        avatar TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // FAQs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id VARCHAR PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Settings table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR PRIMARY KEY DEFAULT 'global',
        site_name TEXT NOT NULL DEFAULT 'StudioVoice Pro',
        contact_email TEXT,
        social_links JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Enrollments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        module TEXT,
        status TEXT NOT NULL DEFAULT 'Pendente',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Minicourses table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS minicourses (
        id VARCHAR PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        image_url TEXT NOT NULL,
        level TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Lessons table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS lessons (
        id VARCHAR PRIMARY KEY,
        course_id VARCHAR NOT NULL REFERENCES minicourses(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        duration TEXT NOT NULL,
        content TEXT NOT NULL,
        media_type TEXT NOT NULL,
        is_special BOOLEAN DEFAULT false,
        slide_bg_url TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // User progress table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        course_id VARCHAR NOT NULL REFERENCES minicourses(id) ON DELETE CASCADE,
        lesson_id VARCHAR NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
        progress INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, course_id, lesson_id)
      );
    `);

    // Create indexes
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON lessons(course_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_progress_course_id ON user_progress(course_id);`);

    // Tabelas para UltimoHub e estúdios
    await pool.query(`
      CREATE TABLE IF NOT EXISTS studios (
        id VARCHAR PRIMARY KEY,
        name TEXT NOT NULL,
        owner_id VARCHAR NOT NULL,
        address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS productions (
        id VARCHAR PRIMARY KEY,
        studio_id VARCHAR REFERENCES studios(id),
        title TEXT NOT NULL,
        client TEXT,
        script TEXT,
        status TEXT DEFAULT 'planning',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR PRIMARY KEY,
        production_id VARCHAR REFERENCES productions(id),
        user_id VARCHAR NOT NULL,
        start_time TIMESTAMPTZ DEFAULT NOW(),
        end_time TIMESTAMPTZ,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS takes (
        id VARCHAR PRIMARY KEY,
        session_id VARCHAR REFERENCES sessions(id),
        cue_id INTEGER,
        audio_url TEXT,
        duration REAL,
        quality_score INTEGER,
        status TEXT DEFAULT 'pending_review',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Indexes adicionais
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_sessions_production_id ON sessions(production_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_takes_session_id ON takes(session_id);`);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase().catch(console.error);
