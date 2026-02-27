import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('[v0] Starting database setup...');

  try {
    // Create waste_categories table
    console.log('[v0] Creating waste_categories table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS waste_categories (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        color TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      // Table might already exist, continue
      console.log('[v0] waste_categories table already exists or couldn\'t be created via RPC');
    });

    // Create bins table
    console.log('[v0] Creating bins table...');
    const { error: binsError } = await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS bins (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        latitude FLOAT NOT NULL,
        longitude FLOAT NOT NULL,
        capacity INT DEFAULT 100,
        current_fill FLOAT DEFAULT 0,
        status TEXT DEFAULT 'active',
        location_address TEXT,
        bin_type TEXT DEFAULT 'general',
        qr_code TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] bins table already exists');
    });

    // Create waste_logs table
    console.log('[v0] Creating waste_logs table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS waste_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        bin_id UUID REFERENCES bins(id),
        waste_category_id UUID NOT NULL REFERENCES waste_categories(id),
        weight_kg FLOAT NOT NULL,
        image_url TEXT,
        latitude FLOAT,
        longitude FLOAT,
        ai_classification TEXT,
        ai_confidence FLOAT,
        status TEXT DEFAULT 'verified',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] waste_logs table already exists');
    });

    // Create user_profiles table
    console.log('[v0] Creating user_profiles table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        phone TEXT,
        city TEXT,
        country TEXT,
        total_waste_kg FLOAT DEFAULT 0,
        total_points INT DEFAULT 0,
        level INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] user_profiles table already exists');
    });

    // Create badges table
    console.log('[v0] Creating badges table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        icon TEXT,
        criteria_kg FLOAT,
        criteria_count INT,
        color TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] badges table already exists');
    });

    // Create user_badges table
    console.log('[v0] Creating user_badges table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS user_badges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        badge_id UUID NOT NULL REFERENCES badges(id),
        earned_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, badge_id)
      )`
    }).catch(() => {
      console.log('[v0] user_badges table already exists');
    });

    // Create leaderboards table
    console.log('[v0] Creating leaderboards table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS leaderboards (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        rank INT,
        total_waste_kg FLOAT DEFAULT 0,
        total_points INT DEFAULT 0,
        disposals_count INT DEFAULT 0,
        month TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] leaderboards table already exists');
    });

    // Create xp_logs table
    console.log('[v0] Creating xp_logs table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS xp_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        waste_log_id UUID REFERENCES waste_logs(id),
        xp_earned INT NOT NULL,
        reason TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] xp_logs table already exists');
    });

    // Create challenges table
    console.log('[v0] Creating challenges table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS challenges (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT,
        target_kg FLOAT,
        reward_xp INT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )`
    }).catch(() => {
      console.log('[v0] challenges table already exists');
    });

    // Create challenge_participants table
    console.log('[v0] Creating challenge_participants table...');
    await supabase.rpc('exec_sql', {
      sql: `CREATE TABLE IF NOT EXISTS challenge_participants (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        challenge_id UUID NOT NULL REFERENCES challenges(id),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        progress_kg FLOAT DEFAULT 0,
        completed_at TIMESTAMP,
        UNIQUE(challenge_id, user_id)
      )`
    }).catch(() => {
      console.log('[v0] challenge_participants table already exists');
    });

    console.log('[v0] Database setup completed successfully!');
  } catch (error) {
    console.error('[v0] Error during database setup:', error);
    process.exit(1);
  }
}

setupDatabase();
