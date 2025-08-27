import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://kdzbghjsqjnglzsmhxpu.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtkemJnaGpzcWpuZ2x6c21oeHB1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjE2MjI3NCwiZXhwIjoyMDcxNzM4Mjc0fQ.riTiiESrKrBkhlSgGF7B-Znj3YbqXvJuOd67aRP7P0g';

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('Starting Normal Game migration...\n');
  
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'GUIDELINES', 'features', 'normal_game', 'migration_01_normal_game.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the migration into individual statements
    // Remove comments and split by semicolons
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .split(/;\s*$/m)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');
    
    console.log(`Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip empty statements
      if (!statement.trim() || statement.trim() === ';') continue;
      
      // Get first 50 chars of statement for logging
      const stmtPreview = statement.substring(0, 50).replace(/\n/g, ' ');
      
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: statement
        }).single();
        
        if (error) throw error;
        
        console.log(`[${i + 1}/${statements.length}] ✓ ${stmtPreview}...`);
        successCount++;
      } catch (error) {
        console.error(`[${i + 1}/${statements.length}] ✗ ${stmtPreview}...`);
        console.error(`  Error: ${error.message}\n`);
        errorCount++;
        
        // Continue with next statement
        continue;
      }
    }
    
    console.log('\n=================================');
    console.log('Migration Summary:');
    console.log(`✓ Successful: ${successCount} statements`);
    console.log(`✗ Failed: ${errorCount} statements`);
    console.log('=================================\n');
    
    // Verify critical tables were created
    console.log('Verifying table creation...\n');
    
    const tablesToCheck = [
      'games',
      'game_participants', 
      'game_hole_scores',
      'game_invitations',
      'game_statistics',
      'user_statistics'
    ];
    
    for (const tableName of tablesToCheck) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log(`✗ Table '${tableName}' NOT created`);
      } else {
        console.log(`✓ Table '${tableName}' exists`);
      }
    }
    
    console.log('\nMigration complete!');
    
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();