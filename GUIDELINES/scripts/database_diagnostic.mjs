#!/usr/bin/env node

/**
 * Database Diagnostic Tool - Performs deep analysis on database health and data quality
 * 
 * USAGE:
 * node GUIDELINES/scripts/database_diagnostic.mjs
 * 
 * OUTPUTS:
 * 1. GUIDELINES/DATABASE_DIAGNOSTIC.md
 *    Format: Structured markdown report with sections:
 *    - EXECUTIVE SUMMARY: Overview with data quality score (0-100)
 *    - ALL PROBLEMS AND WARNINGS: Grouped by severity
 *      • Critical Issues
 *      • Regular Issues  
 *      • Warnings (sub-grouped: Nullability, Empty Tables, Test Data, etc.)
 *    - DATA QUALITY SCORE DETAILS: Breakdown by category
 *    - TABLE DETAILS: Overview table with row/issue/warning counts
 *    - DETAILED COLUMN ANALYSIS: Per-table column statistics in table format
 *    
 * 2. GUIDELINES/database_diagnostic.json
 *    Format: JSON array of table analysis objects containing:
 *    - tableName, exists, rowCount, sampleSize
 *    - columns: Object with per-column statistics
 *    - issues: Array of detected problems
 *    - warnings: Array of potential issues
 *    - relationships: Array of foreign key references
 * 
 * ANALYSIS FEATURES:
 * - Detects duplicate IDs
 * - Analyzes NULL patterns (>50% threshold)
 * - Checks numeric ranges (min/max/zeros/negatives)
 * - Validates string patterns (empty strings, whitespace issues)
 * - Measures data uniqueness ratios
 * - Identifies test data (single row tables)
 * - Calculates overall data quality score
 * 
 * CONSOLE OUTPUT:
 * - Color-coded status per table: [OK] green, [WARNINGS] yellow, [ISSUES] red
 * - Summary of critical issues, total issues, and warnings
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from project root
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
// Try service role key first (bypasses RLS), fallback to anon key
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.SUPABASE_SERVICE_ROLE_KEY || 
                    process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Missing VITE_SUPABASE_URL and service role key (or VITE_SUPABASE_ANON_KEY) in .env');
  process.exit(1);
}

const keyType = (process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) 
  ? 'Service Role Key (bypasses RLS)' 
  : 'Anon Key (RLS applies)';

console.log('[DATABASE DIAGNOSTIC TOOL]');
console.log('==========================');
console.log(`URL: ${supabaseUrl}`);
console.log(`Using: ${keyType}`);
console.log(`Timestamp: ${new Date().toISOString()}\n`);

const supabase = createClient(supabaseUrl, supabaseKey);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Analyze a single table's data quality and statistics
 */
async function analyzeTable(tableName) {
  const analysis = {
    tableName,
    exists: false,
    rowCount: 0,
    columns: {},
    issues: [],
    warnings: [],
    stats: {},
    relationships: []
  };

  try {
    // First get a sample of data for analysis
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .limit(100);

    if (error) {
      analysis.exists = false;
      analysis.error = error.message;
      return analysis;
    }

    analysis.exists = true;
    analysis.rowCount = count || 0;
    analysis.sampleSize = data ? data.length : 0;

    // If table is empty, try to get schema from a single row
    if (!data || data.length === 0) {
      analysis.isEmpty = true;
      analysis.warnings.push('Table is empty - cannot perform data analysis');
      
      // Try to insert and rollback to get schema (won't work with all tables)
      const { data: schemaTest } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
      
      if (schemaTest) {
        // Even empty result gives us column names from the query
        analysis.columns = { '[No data for analysis]': { type: 'unknown' } };
      }
      return analysis;
    }

    // Analyze each column
    const columnStats = {};
    const sample = data[0];
    
    for (const [columnName, sampleValue] of Object.entries(sample)) {
      columnStats[columnName] = {
        type: detectType(sampleValue),
        nullable: false,
        nullCount: 0,
        uniqueCount: 0,
        uniqueValues: new Set(),
        minValue: null,
        maxValue: null,
        avgLength: null,
        patterns: {},
        issues: []
      };
    }

    // Analyze all rows for statistics
    for (const row of data) {
      for (const [columnName, value] of Object.entries(row)) {
        const stats = columnStats[columnName];
        
        // Check nulls
        if (value === null || value === undefined) {
          stats.nullable = true;
          stats.nullCount++;
          continue;
        }

        // Track unique values (limit to prevent memory issues, but always track IDs)
        if (columnName === 'id' || stats.uniqueValues.size < 50) {
          stats.uniqueValues.add(value);
        }

        // Type-specific analysis
        if (typeof value === 'number') {
          stats.minValue = stats.minValue === null ? value : Math.min(stats.minValue, value);
          stats.maxValue = stats.maxValue === null ? value : Math.max(stats.maxValue, value);
          
          // Check for suspicious values
          if (value === 0) {
            stats.zeroCount = (stats.zeroCount || 0) + 1;
          }
          if (value < 0) {
            stats.negativeCount = (stats.negativeCount || 0) + 1;
          }
        } else if (typeof value === 'string') {
          const length = value.length;
          stats.minLength = stats.minLength === null ? length : Math.min(stats.minLength, length);
          stats.maxLength = stats.maxLength === null ? length : Math.max(stats.maxLength, length);
          stats.totalLength = (stats.totalLength || 0) + length;
          
          // Check for common patterns
          if (value === '') stats.emptyStringCount = (stats.emptyStringCount || 0) + 1;
          if (value.trim() !== value) stats.whitespaceIssues = (stats.whitespaceIssues || 0) + 1;
          if (/^\s+$/.test(value)) stats.onlyWhitespace = (stats.onlyWhitespace || 0) + 1;
          
          // Detect common formats
          if (columnName.includes('email') && !value.includes('@')) {
            stats.issues.push(`Invalid email format: "${value}"`);
          }
          if (columnName.includes('url') && !value.startsWith('http')) {
            stats.issues.push(`Suspicious URL: "${value}"`);
          }
        } else if (typeof value === 'boolean') {
          stats.trueCount = (stats.trueCount || 0) + (value ? 1 : 0);
          stats.falseCount = (stats.falseCount || 0) + (!value ? 1 : 0);
        } else if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
          const date = new Date(value);
          const timestamp = date.getTime();
          stats.minDate = stats.minDate === null ? timestamp : Math.min(stats.minDate, timestamp);
          stats.maxDate = stats.maxDate === null ? timestamp : Math.max(stats.maxDate, timestamp);
          
          // Check for suspicious dates
          const year = date.getFullYear();
          if (year < 1900 || year > 2100) {
            stats.issues.push(`Suspicious date: ${value}`);
          }
        }
      }
    }

    // Calculate final statistics and detect anomalies
    for (const [columnName, stats] of Object.entries(columnStats)) {
      stats.uniqueCount = stats.uniqueValues.size;
      stats.uniqueRatio = stats.uniqueCount / analysis.sampleSize;
      
      // Calculate average for strings
      if (stats.totalLength !== undefined) {
        stats.avgLength = Math.round(stats.totalLength / (analysis.sampleSize - stats.nullCount));
      }
      
      // Detect potential issues
      if (columnName === 'id' && stats.uniqueRatio < 1) {
        analysis.issues.push(`CRITICAL: Duplicate IDs found in column '${columnName}'`);
      }
      
      if (stats.nullCount > analysis.sampleSize * 0.5) {
        analysis.warnings.push(`Column '${columnName}' is >50% NULL (${stats.nullCount}/${analysis.sampleSize})`);
      }
      
      if (stats.emptyStringCount > analysis.sampleSize * 0.2) {
        analysis.warnings.push(`Column '${columnName}' has many empty strings (${stats.emptyStringCount})`);
      }
      
      if (stats.whitespaceIssues > 0) {
        analysis.warnings.push(`Column '${columnName}' has whitespace issues (${stats.whitespaceIssues} rows)`);
      }
      
      if (columnName.includes('_id') && columnName !== 'id') {
        const refTable = columnName.replace('_id', '').replace(/_/g, '_');
        analysis.relationships.push({ column: columnName, references: refTable });
      }
      
      // Clean up for output
      delete stats.uniqueValues;
      delete stats.totalLength;
    }

    analysis.columns = columnStats;

    // Table-level checks
    if (analysis.rowCount === 0) {
      analysis.warnings.push('Table is empty');
    } else if (analysis.rowCount === 1) {
      analysis.warnings.push('Table has only 1 row - may be test data');
    } else if (analysis.rowCount > 10000 && analysis.sampleSize < analysis.rowCount) {
      analysis.warnings.push(`Large table (${analysis.rowCount} rows) - analysis based on sample of ${analysis.sampleSize}`);
    }

  } catch (err) {
    analysis.error = err.message;
    analysis.issues.push(`Failed to analyze: ${err.message}`);
  }

  return analysis;
}

/**
 * Detect data type from a value
 */
function detectType(value) {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'number') return Number.isInteger(value) ? 'integer' : 'decimal';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'string') {
    if (!isNaN(Date.parse(value)) && value.includes('-')) return 'timestamp';
    if (value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) return 'uuid';
    if (value.length > 255) return 'text';
    return 'varchar';
  }
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'jsonb';
  return 'unknown';
}

/**
 * Format the diagnostic report with problems first, then details
 */
function formatDiagnosticReport(analyses) {
  let report = '# DATABASE DIAGNOSTIC REPORT\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Tables Analyzed: ${analyses.length}\n\n`;
  
  // Summary statistics
  const summary = {
    totalTables: analyses.length,
    totalRows: 0,
    emptyTables: [],
    tablesWithIssues: [],
    tablesWithWarnings: [],
    criticalIssues: [],
    allIssues: [],
    allWarnings: []
  };

  // Collect all problems
  for (const analysis of analyses) {
    if (analysis.exists) {
      summary.totalRows += analysis.rowCount;
      if (analysis.isEmpty) summary.emptyTables.push(analysis.tableName);
      
      if (analysis.issues.length > 0) {
        summary.tablesWithIssues.push(analysis.tableName);
        analysis.issues.forEach(issue => {
          const issueEntry = { table: analysis.tableName, issue };
          summary.allIssues.push(issueEntry);
          if (issue.includes('CRITICAL')) {
            summary.criticalIssues.push(issueEntry);
          }
        });
      }
      
      if (analysis.warnings.length > 0) {
        summary.tablesWithWarnings.push(analysis.tableName);
        analysis.warnings.forEach(warning => {
          summary.allWarnings.push({ table: analysis.tableName, warning });
        });
      }
    }
  }

  // EXECUTIVE SUMMARY
  report += '## EXECUTIVE SUMMARY\n\n';
  report += `- Total Tables: ${summary.totalTables}\n`;
  report += `- Total Rows: ${summary.totalRows.toLocaleString()}\n`;
  report += `- Empty Tables: ${summary.emptyTables.length}\n`;
  report += `- Tables with Issues: ${summary.tablesWithIssues.length}\n`;
  report += `- Tables with Warnings: ${summary.tablesWithWarnings.length}\n`;
  
  // Data Quality Score
  const qualityScore = calculateQualityScore(analyses);
  report += `- Data Quality Score: ${qualityScore.overall}/100`;
  if (qualityScore.overall < 50) {
    report += ' (POOR)';
  } else if (qualityScore.overall < 70) {
    report += ' (NEEDS IMPROVEMENT)';
  } else if (qualityScore.overall < 90) {
    report += ' (GOOD)';
  } else {
    report += ' (EXCELLENT)';
  }
  report += '\n\n---\n\n';
  
  // ALL PROBLEMS SECTION (Grouped by severity)
  report += '## ALL PROBLEMS AND WARNINGS\n\n';
  
  // Critical Issues
  if (summary.criticalIssues.length > 0) {
    report += '### CRITICAL ISSUES\n';
    summary.criticalIssues.forEach(({ table, issue }) => {
      report += `- **${table}**: ${issue}\n`;
    });
    report += '\n';
  }
  
  // Regular Issues
  const nonCriticalIssues = summary.allIssues.filter(i => !i.issue.includes('CRITICAL'));
  if (nonCriticalIssues.length > 0) {
    report += '### ISSUES\n';
    nonCriticalIssues.forEach(({ table, issue }) => {
      report += `- **${table}**: ${issue}\n`;
    });
    report += '\n';
  }
  
  // Warnings grouped by type
  if (summary.allWarnings.length > 0) {
    report += '### WARNINGS\n';
    
    // Group warnings by type
    const warningGroups = {
      nullability: [],
      emptyTables: [],
      testData: [],
      whitespace: [],
      emptyStrings: [],
      other: []
    };
    
    summary.allWarnings.forEach(({ table, warning }) => {
      if (warning.includes('NULL')) {
        warningGroups.nullability.push({ table, warning });
      } else if (warning.includes('empty - cannot perform')) {
        warningGroups.emptyTables.push({ table, warning });
      } else if (warning.includes('test data')) {
        warningGroups.testData.push({ table, warning });
      } else if (warning.includes('whitespace')) {
        warningGroups.whitespace.push({ table, warning });
      } else if (warning.includes('empty strings')) {
        warningGroups.emptyStrings.push({ table, warning });
      } else {
        warningGroups.other.push({ table, warning });
      }
    });
    
    if (warningGroups.nullability.length > 0) {
      report += '\n#### Nullability Warnings\n';
      warningGroups.nullability.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    if (warningGroups.emptyTables.length > 0) {
      report += '\n#### Empty Table Warnings\n';
      warningGroups.emptyTables.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    if (warningGroups.testData.length > 0) {
      report += '\n#### Test Data Warnings\n';
      warningGroups.testData.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    if (warningGroups.whitespace.length > 0) {
      report += '\n#### Data Quality Warnings\n';
      warningGroups.whitespace.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    if (warningGroups.emptyStrings.length > 0) {
      warningGroups.emptyStrings.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    if (warningGroups.other.length > 0) {
      report += '\n#### Other Warnings\n';
      warningGroups.other.forEach(({ table, warning }) => {
        report += `- **${table}**: ${warning}\n`;
      });
    }
    
    report += '\n';
  }
  
  if (summary.criticalIssues.length === 0 && summary.allIssues.length === 0 && summary.allWarnings.length === 0) {
    report += '*No problems detected - database is healthy*\n\n';
  }
  
  report += '---\n\n';
  
  // DATA QUALITY SCORE DETAILS
  report += '## DATA QUALITY SCORE DETAILS\n\n';
  report += `**Overall Score: ${qualityScore.overall}/100**\n\n`;
  report += '| Category | Score | Max |\n';
  report += '|----------|-------|-----|\n';
  report += `| Schema Completeness | ${qualityScore.schemaCompleteness} | 25 |\n`;
  report += `| Data Consistency | ${qualityScore.dataConsistency} | 25 |\n`;
  report += `| Nullability Health | ${qualityScore.nullabilityHealth} | 25 |\n`;
  report += `| Referential Integrity | ${qualityScore.referentialIntegrity} | 25 |\n`;
  report += '\n---\n\n';

  // TABLE DETAILS SECTION
  report += '## TABLE DETAILS\n\n';
  
  // Table overview
  report += '### Table Overview\n\n';
  report += '| Table | Rows | Status | Issues | Warnings |\n';
  report += '|-------|------|--------|--------|----------|\n';
  
  for (const analysis of analyses) {
    if (!analysis.exists) {
      report += `| ${analysis.tableName} | ERROR | NOT ACCESSIBLE | - | - |\n`;
    } else {
      const status = analysis.isEmpty ? 'EMPTY' : 'ACTIVE';
      const issueCount = analysis.issues.length || '-';
      const warningCount = analysis.warnings.length || '-';
      report += `| ${analysis.tableName} | ${analysis.rowCount.toLocaleString()} | ${status} | ${issueCount} | ${warningCount} |\n`;
    }
  }
  report += '\n---\n\n';

  // DETAILED COLUMN ANALYSIS SECTION
  report += '## DETAILED COLUMN ANALYSIS\n\n';
  
  for (const analysis of analyses) {
    if (!analysis.exists) {
      continue; // Skip non-existent tables
    }

    report += `### ${analysis.tableName}\n`;
    report += `*${analysis.rowCount.toLocaleString()} rows | Sample size: ${analysis.sampleSize}*\n\n`;

    // Column Analysis Table
    if (Object.keys(analysis.columns).length > 0) {
      report += '| Column | Type | Nullable | Unique | Statistics |\n';
      report += '|--------|------|----------|--------|------------|\n';
      
      for (const [columnName, stats] of Object.entries(analysis.columns)) {
        const nullable = stats.nullable ? `Yes (${stats.nullCount})` : 'No';
        const unique = stats.uniqueCount !== undefined ? `${Math.round(stats.uniqueRatio * 100)}%` : '-';
        
        let statistics = '';
        
        // Type-specific stats
        if (stats.type === 'integer' || stats.type === 'decimal') {
          if (stats.minValue !== null) {
            statistics = `Range: ${stats.minValue}-${stats.maxValue}`;
            if (stats.zeroCount) statistics += `, Zeros: ${stats.zeroCount}`;
            if (stats.negativeCount) statistics += `, Negatives: ${stats.negativeCount}`;
          }
        } else if (stats.type === 'varchar' || stats.type === 'text') {
          if (stats.minLength !== undefined) {
            statistics = `Length: ${stats.minLength}-${stats.maxLength} (avg: ${stats.avgLength})`;
            if (stats.emptyStringCount) statistics += `, Empty: ${stats.emptyStringCount}`;
          }
        } else if (stats.type === 'boolean') {
          if (stats.trueCount !== undefined) {
            statistics = `T:${stats.trueCount} / F:${stats.falseCount}`;
          }
        } else if (stats.type === 'timestamp') {
          if (stats.minDate) {
            const minDate = new Date(stats.minDate).toISOString().split('T')[0];
            const maxDate = new Date(stats.maxDate).toISOString().split('T')[0];
            statistics = `${minDate} to ${maxDate}`;
          }
        }
        
        report += `| ${columnName} | ${stats.type} | ${nullable} | ${unique} | ${statistics} |\n`;
      }
      
      // Foreign Key Relationships
      if (analysis.relationships.length > 0) {
        report += '\n**Foreign Keys:**\n';
        analysis.relationships.forEach(rel => {
          report += `- ${rel.column} → ${rel.references}\n`;
        });
      }
      
      report += '\n';
    } else {
      report += '*No column data available*\n\n';
    }
  }

  return report;
}

/**
 * Calculate data quality score
 */
function calculateQualityScore(analyses) {
  const score = {
    schemaCompleteness: 25,
    dataConsistency: 25,
    nullabilityHealth: 25,
    referentialIntegrity: 25,
    overall: 0
  };

  let deductions = {
    schemaCompleteness: 0,
    dataConsistency: 0,
    nullabilityHealth: 0,
    referentialIntegrity: 0
  };

  for (const analysis of analyses) {
    if (!analysis.exists) {
      deductions.schemaCompleteness += 2;
      continue;
    }

    // Schema completeness
    if (analysis.isEmpty) deductions.schemaCompleteness += 1;
    if (Object.keys(analysis.columns).length === 0) deductions.schemaCompleteness += 2;

    // Data consistency
    if (analysis.issues.length > 0) {
      deductions.dataConsistency += Math.min(analysis.issues.length * 2, 10);
    }

    // Nullability health
    for (const stats of Object.values(analysis.columns)) {
      if (stats.nullCount > analysis.sampleSize * 0.7) {
        deductions.nullabilityHealth += 1;
      }
    }

    // Referential integrity
    if (analysis.tableName.includes('_id') && analysis.relationships.length === 0) {
      deductions.referentialIntegrity += 2;
    }
  }

  // Apply deductions
  score.schemaCompleteness = Math.max(0, score.schemaCompleteness - deductions.schemaCompleteness);
  score.dataConsistency = Math.max(0, score.dataConsistency - deductions.dataConsistency);
  score.nullabilityHealth = Math.max(0, score.nullabilityHealth - deductions.nullabilityHealth);
  score.referentialIntegrity = Math.max(0, score.referentialIntegrity - deductions.referentialIntegrity);

  score.overall = score.schemaCompleteness + score.dataConsistency + 
                  score.nullabilityHealth + score.referentialIntegrity;

  return score;
}

/**
 * Main execution
 */
async function main() {
  console.log('Starting comprehensive database diagnostic...\n');

  // List of tables to analyze
  const tables = [
    'profiles',
    'friendships',
    'games',
    'game_participants',
    'game_hole_scores',
    'game_invitations',
    'game_statistics',
    'user_statistics',
    'countries',
    'regions',
    'golf_clubs',
    'golf_courses',
    'holes',
    'tee_boxes',
    'hole_distances',
    'club_amenities',
    'course_images'
  ];

  const analyses = [];
  
  for (const table of tables) {
    process.stdout.write(`Analyzing ${table}...`);
    const analysis = await analyzeTable(table);
    analyses.push(analysis);
    
    if (analysis.exists) {
      if (analysis.issues.length > 0) {
        console.log(` ${colors.red}[ISSUES]${colors.reset}`);
      } else if (analysis.warnings.length > 0) {
        console.log(` ${colors.yellow}[WARNINGS]${colors.reset}`);
      } else {
        console.log(` ${colors.green}[OK]${colors.reset}`);
      }
    } else {
      console.log(` ${colors.red}[ERROR]${colors.reset}`);
    }
  }

  console.log('\nGenerating diagnostic report...\n');

  // Generate and save the report
  const report = formatDiagnosticReport(analyses);
  
  // Save to file
  const outputPath = join(__dirname, '../DATABASE_DIAGNOSTIC.md');
  fs.writeFileSync(outputPath, report, 'utf8');
  
  console.log(`${colors.green}Diagnostic report saved to: GUIDELINES/DATABASE_DIAGNOSTIC.md${colors.reset}`);
  
  // Show summary
  console.log('\n--- SUMMARY ---');
  const criticalCount = analyses.reduce((sum, a) => sum + a.issues.filter(i => i.includes('CRITICAL')).length, 0);
  const issueCount = analyses.reduce((sum, a) => sum + a.issues.length, 0);
  const warningCount = analyses.reduce((sum, a) => sum + a.warnings.length, 0);
  
  if (criticalCount > 0) {
    console.log(`${colors.red}${colors.bright}[!] ${criticalCount} CRITICAL issues found${colors.reset}`);
  }
  if (issueCount > 0) {
    console.log(`${colors.red}[!] ${issueCount} total issues found${colors.reset}`);
  }
  if (warningCount > 0) {
    console.log(`${colors.yellow}[W] ${warningCount} warnings found${colors.reset}`);
  }
  if (criticalCount === 0 && issueCount === 0 && warningCount === 0) {
    console.log(`${colors.green}[OK] No issues found - database is healthy${colors.reset}`);
  }

  // Also create a JSON version for programmatic use
  const jsonPath = join(__dirname, '../database_diagnostic.json');
  fs.writeFileSync(jsonPath, JSON.stringify(analyses, null, 2), 'utf8');
  console.log(`\nJSON data saved to: GUIDELINES/database_diagnostic.json`);
}

main().catch(err => {
  console.error(`${colors.red}Fatal error:${colors.reset}`, err);
  process.exit(1);
});