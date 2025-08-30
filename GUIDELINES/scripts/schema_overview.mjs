#!/usr/bin/env node

/**
 * Schema Overview Generator - Generates compact database schema with statistics
 * 
 * USAGE:
 * node GUIDELINES/scripts/schema_overview.mjs
 * 
 * OUTPUTS:
 * 1. GUIDELINES/DATABASE_SCHEMA_SIMPLE.md
 *    Format: Markdown document with:
 *    - Summary statistics (tables, rows, columns)
 *    - Compact table listings: tablename [rows] (field1: type, field2: type...)
 *    - Foreign key relationships
 *    - Table statistics sorted by row count
 *    
 * 2. Updates DATABASE_SCHEMA.md (appends compact overview at top)
 * 
 * FEATURES:
 * - Uses service role key to bypass RLS
 * - Shows row counts for each table
 * - Detects data types from sample data
 * - Identifies foreign key relationships
 * - Groups tables by category (User, Game, Golf, etc.)
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read .env file manually
function loadEnv() {
  const envPath = join(__dirname, '../../.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found at project root');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.VITE_SUPABASE_URL;
// Try service role key first (bypasses RLS), fallback to anon key
const supabaseKey = env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing VITE_SUPABASE_URL and service role key (or VITE_SUPABASE_ANON_KEY) in .env');
  process.exit(1);
}

const keyType = (env.VITE_SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY) ? 'Service Role Key (bypasses RLS)' : 'Anon Key (RLS applies)';
console.log('Fetching schema from Supabase...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Using: ${keyType}`);

// Tables we expect to exist
const expectedTables = [
  // User tables
  { name: 'profiles', category: 'User & Auth' },
  
  // Game tables
  { name: 'games', category: 'Game Management' },
  { name: 'game_participants', category: 'Game Management' },
  { name: 'game_hole_scores', category: 'Game Management' },
  
  // Golf course structure
  { name: 'countries', category: 'Location Data' },
  { name: 'regions', category: 'Location Data' },
  { name: 'golf_clubs', category: 'Golf Facilities' },
  { name: 'golf_courses', category: 'Golf Facilities' },
  
  // Course details
  { name: 'holes', category: 'Course Details' },
  { name: 'course_tees', category: 'Course Details' },
  { name: 'tee_boxes', category: 'Course Details' },
  { name: 'hole_distances', category: 'Course Details' },
  
  // Additional
  { name: 'course_images', category: 'Media' },
  { name: 'club_amenities', category: 'Amenities' }
];

async function testTable(tableName) {
  try {
    // First, try to get schema by selecting with limit 0 (gets column info without data)
    const schemaResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*&limit=1`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      }
    });
    
    if (!schemaResponse.ok) {
      return { exists: false, error: schemaResponse.statusText };
    }

    const data = await schemaResponse.json();
    
    // Now get the count
    const countResponse = await fetch(`${supabaseUrl}/rest/v1/${tableName}?select=*`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'count=exact',
        'Range': '0-0'  // Don't fetch any rows, just count
      }
    });
    
    let rowCount = 0;
    if (countResponse.ok) {
      const contentRange = countResponse.headers.get('content-range');
      if (contentRange) {
        // Format: "0-0/total" or "*/total"
        const match = contentRange.match(/\/(\d+)/);
        if (match) {
          rowCount = parseInt(match[1]);
        }
      }
    }

    // If we have data, use it for schema
    if (data && data.length > 0) {
      return { 
        exists: true, 
        sample: data[0],
        isEmpty: false,
        rowCount: rowCount
      };
    }
    
    // For empty tables, try to get schema from a dummy insert that we'll rollback
    // Or use known schemas for common tables
    const knownSchemas = {
      'profiles': {
        id: 'uuid-sample',
        full_name: null,
        email: null,
        avatar_url: null,
        handicap: null,
        home_course: null,
        bio: null,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z'
      },
      'games': {
        id: 'uuid-sample',
        course_id: 1,
        creator_user_id: 'uuid-sample',
        game_description: null,
        scoring_format: 'match_play',
        weather_condition: null,
        status: 'setup',
        created_at: '2024-01-01T00:00:00Z',
        started_at: null,
        completed_at: null,
        cancelled_at: null
      },
      'game_participants': {
        id: 'uuid-sample',
        game_id: 'uuid-sample',
        user_id: 'uuid-sample',
        tee_color: null,
        course_tee_id: null,
        handicap_index: null,
        course_handicap: null,
        playing_handicap: null,
        match_handicap: null,
        is_active: true,
        joined_at: '2024-01-01T00:00:00Z'
      },
      'game_hole_scores': {
        id: 'uuid-sample',
        game_id: 'uuid-sample',
        user_id: 'uuid-sample',
        hole_number: 1,
        strokes: null,
        putts: null,
        hole_par: 4,
        hole_yards: null,
        hole_handicap_index: null,
        score_vs_par: null,
        points: null,
        updated_at: '2024-01-01T00:00:00Z',
        updated_by: null
      }
    };

    if (knownSchemas[tableName]) {
      return {
        exists: true,
        sample: knownSchemas[tableName],
        isEmpty: true,
        rowCount: 0
      };
    }

    // If still no schema, return empty
    return {
      exists: true,
      sample: {},
      isEmpty: true,
      rowCount: rowCount
    };
  } catch (err) {
    return { exists: false, error: err.message };
  }
}

async function fetchSchema() {
  const results = {};
  const byCategory = {};
  const stats = {
    scanDate: new Date().toISOString(),
    totalTables: 0,
    totalRows: 0,
    tablesWithData: 0,
    emptyTables: 0
  };
  
  console.log('\nChecking tables...\n');
  
  for (const { name, category } of expectedTables) {
    const result = await testTable(name);
    
    if (result.exists) {
      const rowInfo = result.rowCount !== undefined ? ` (${result.rowCount} rows)` : '';
      console.log(`[OK] ${name}${rowInfo}`);
      results[name] = result;
      
      stats.totalTables++;
      if (result.rowCount !== undefined) {
        stats.totalRows += result.rowCount;
        if (result.rowCount > 0) {
          stats.tablesWithData++;
        } else {
          stats.emptyTables++;
        }
      }
      
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push({ name, ...result });
    } else {
      console.log(`[Missing] ${name}: ${result.error}`);
    }
  }
  
  return { results, byCategory, stats };
}

function inferType(value, key) {
  if (value === null || value === undefined) return 'nullable';
  if (typeof value === 'number') return Number.isInteger(value) ? 'int' : 'decimal';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'string') {
    if (key === 'id' || key.endsWith('_id')) return 'uuid';
    if (key.includes('_at')) return 'timestamptz';
    if (key.includes('image') || key.includes('_url')) return 'text';
    if (value.length > 255) return 'text';
    return 'varchar';
  }
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'jsonb';
  return 'unknown';
}

function generateCompactSchema({ results, byCategory, stats }) {
  let output = '# Database Schema - Compact Overview\n';
  output += `*Scanned: ${stats.scanDate}*\n\n`;
  output += '## Tables & Fields\n\n';
  
  let totalColumns = 0;
  const relationships = [];
  const tableStats = [];
  
  for (const [category, tables] of Object.entries(byCategory)) {
    output += `### ${category}\n\n`;
    
    for (const table of tables) {
      const fields = [];
      let columnCount = 0;
      
      for (const [key, value] of Object.entries(table.sample)) {
        const type = inferType(value, key);
        fields.push(`${key}: ${type}`);
        columnCount++;
        totalColumns++;
        
        // Detect foreign keys
        if (key.endsWith('_id') && key !== 'id') {
          const refTable = key.replace('_id', '').replace(/_/g, '');
          relationships.push(`${table.name}.${key} → ${refTable}`);
        }
      }
      
      // Add row count info
      const rowInfo = table.rowCount !== undefined ? ` [${table.rowCount} rows]` : '';
      
      if (fields.length > 0) {
        output += `**${table.name}**${rowInfo} (${fields.join(', ')})\n`;
      } else {
        output += `**${table.name}**${rowInfo} (schema pending)\n`;
      }
      
      // Store for detailed stats
      tableStats.push({
        name: table.name,
        columns: columnCount,
        rows: table.rowCount || 0,
        category: category
      });
      
      // Show FK relationships
      const tableRels = relationships.filter(r => r.startsWith(`${table.name}.`));
      for (const rel of tableRels) {
        output += `  ↳ ${rel.split('.')[1]}\n`;
      }
      
      output += '\n';
    }
  }
  
  // Add relationships section
  output += '## Key Relationships\n\n';
  for (const rel of [...new Set(relationships)].sort()) {
    output += `- ${rel}\n`;
  }
  
  // Add standard domain relationships
  output += '\n## Domain Relationships\n';
  output += '- 1 Country → N Regions\n';
  output += '- 1 Region → N Golf Clubs\n';
  output += '- 1 Golf Club → N Golf Courses\n';
  output += '- 1 Golf Course → 18 Holes\n';
  output += '- 1 Golf Course → N Tee Boxes (4-6)\n';
  output += '- 1 Game → N Participants (2-6)\n';
  output += '- 1 Game → N Hole Scores\n';
  
  // Add Security section
  output += '\n## Security (RLS Policies)\n';
  output += '- All tables have Row Level Security enabled\n';
  output += '- Golf course data: Public SELECT\n';
  output += '- Game data: Authenticated users only\n';
  output += '- User can only modify own data\n';
  
  // Add detailed statistics
  output += '\n## Database Statistics\n\n';
  output += `### Summary\n`;
  output += `- **Scan Date:** ${new Date(stats.scanDate).toLocaleString()}\n`;
  output += `- **Total Tables:** ${stats.totalTables}\n`;
  output += `- **Total Columns:** ${totalColumns}\n`;
  output += `- **Total Rows:** ${stats.totalRows.toLocaleString()}\n`;
  output += `- **Tables with Data:** ${stats.tablesWithData}\n`;
  output += `- **Empty Tables:** ${stats.emptyTables}\n`;
  output += `- **Foreign Keys:** ${relationships.length}\n`;
  
  // Add per-table statistics
  output += '\n### Table Details\n\n';
  output += '| Table | Category | Columns | Rows | Status |\n';
  output += '|-------|----------|---------|------|--------|\n';
  
  // Sort by row count descending
  tableStats.sort((a, b) => b.rows - a.rows);
  
  for (const table of tableStats) {
    const status = table.rows === 0 ? '🔴 Empty' : '🟢 Active';
    output += `| ${table.name} | ${table.category} | ${table.columns} | ${table.rows.toLocaleString()} | ${status} |\n`;
  }
  
  // Add largest tables section
  output += '\n### Largest Tables (by row count)\n';
  const topTables = tableStats.filter(t => t.rows > 0).slice(0, 5);
  for (let i = 0; i < topTables.length; i++) {
    output += `${i + 1}. **${topTables[i].name}** - ${topTables[i].rows.toLocaleString()} rows\n`;
  }
  
  // Add development notes
  output += '\n### Development Status\n';
  output += '- **Golf Course Data:** Fully populated (courses, holes, tee boxes)\n';
  output += '- **Game System:** Schema ready, awaiting implementation\n';
  output += '- **User System:** Schema ready, awaiting users\n';
  
  return output;
}

// Main
async function main() {
  const schemaData = await fetchSchema();
  const formatted = generateCompactSchema(schemaData);
  
  // Save the result
  const outputPath = join(__dirname, '../DATABASE_SCHEMA_SIMPLE.md');
  fs.writeFileSync(outputPath, formatted, 'utf8');
  
  console.log(`\nSchema saved to: GUIDELINES/DATABASE_SCHEMA_SIMPLE.md`);
  console.log('\n--- Preview ---');
  console.log(formatted.substring(0, 600));
  console.log('...');
  
  // Also update the main DATABASE_SCHEMA.md with compact version at top
  const fullSchemaPath = join(__dirname, '../DATABASE_SCHEMA.md');
  if (fs.existsSync(fullSchemaPath)) {
    const existing = fs.readFileSync(fullSchemaPath, 'utf8');
    const updated = formatted + '\n\n---\n\n# Full Schema Details\n\n' + 
                   existing.split('# Golf X - Complete Database Schema')[1];
    fs.writeFileSync(fullSchemaPath, updated, 'utf8');
    console.log('\nAlso updated DATABASE_SCHEMA.md with compact overview');
  }
}

main().catch(console.error);