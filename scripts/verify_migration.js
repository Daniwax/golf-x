import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://kdzbghjsqjnglzsmhxpu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkemJnaGpzcWpuZ2x6c21oeHB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNjIyNzMsImV4cCI6MjA3MTczODI3M30.ZnHlurufEXVWzakIeY8gw3_BdGItFGWmFATyjvCe6lM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyMigration() {
  console.log('=================================');
  console.log('Normal Game Migration Verification');
  console.log('=================================\n');
  
  const tables = [
    { name: 'games', expectedColumns: ['id', 'course_id', 'creator_user_id', 'game_description', 'status'] },
    { name: 'game_participants', expectedColumns: ['id', 'game_id', 'user_id', 'tee_box_id', 'handicap_index'] },
    { name: 'game_hole_scores', expectedColumns: ['id', 'game_id', 'user_id', 'hole_number', 'strokes'] },
    { name: 'game_invitations', expectedColumns: ['id', 'game_id', 'invited_user_id', 'status'] },
    { name: 'game_statistics', expectedColumns: ['game_id', 'total_players', 'winner_user_id'] },
    { name: 'user_statistics', expectedColumns: ['user_id', 'total_rounds', 'best_gross_score'] }
  ];
  
  let allTablesExist = true;
  
  for (const table of tables) {
    try {
      // Try to query the table
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`[X] Table '${table.name}' - NOT FOUND`);
          allTablesExist = false;
        } else if (error.message.includes('Row Level Security')) {
          console.log(`[✓] Table '${table.name}' - EXISTS (RLS enabled)`);
        } else {
          console.log(`[?] Table '${table.name}' - ERROR: ${error.message}`);
          allTablesExist = false;
        }
      } else {
        console.log(`[✓] Table '${table.name}' - EXISTS`);
      }
    } catch (err) {
      console.log(`[X] Table '${table.name}' - ERROR: ${err.message}`);
      allTablesExist = false;
    }
  }
  
  console.log('\n=================================');
  
  if (allTablesExist) {
    console.log('✓ All tables exist!');
    console.log('✓ Migration appears successful!');
    console.log('\nNext steps:');
    console.log('1. Test creating a game through the app');
    console.log('2. Verify RLS policies are working');
    console.log('3. Check that handicap calculations work');
  } else {
    console.log('✗ Some tables are missing!');
    console.log('\nPlease apply the migration:');
    console.log('1. Go to Supabase SQL Editor');
    console.log('2. Copy migration_01_normal_game.sql');
    console.log('3. Run the SQL');
  }
  
  console.log('=================================\n');
}

// Check if we can connect to Supabase
async function checkConnection() {
  console.log('Checking Supabase connection...');
  
  try {
    const { data, error } = await supabase
      .from('golf_courses')
      .select('name')
      .limit(1);
    
    if (error) {
      console.log('Connection check failed:', error.message);
    } else {
      console.log('✓ Connected to Supabase successfully');
      if (data && data.length > 0) {
        console.log(`✓ Found course: ${data[0].name}\n`);
      }
    }
  } catch (err) {
    console.log('Connection error:', err.message);
  }
}

// Run verification
async function main() {
  await checkConnection();
  await verifyMigration();
}

main().catch(console.error);