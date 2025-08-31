# PHASE 1: File Analysis Instructions

## ⚠️ CRITICAL: ANALYSIS ONLY - DO NOT MODIFY CODE ⚠️
You are in DISCOVERY phase. Do NOT:
- Fix any issues you find
- Modify source code
- Suggest code changes
- Refactor anything

## YOUR ASSIGNED FILE
You have been assigned file: **[Fxxx]**
Your PAGE number is: **[PAGE_NUMBER]** (will be provided by main agent)

## YOUR ONLY TASK: QUICK ANALYSIS AND BRIEF DOCUMENTATION

### Step 1: Find Your File
Look up your file number in `DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_FILES.md`
- Find the line with your [Fxxx] code
- Note the file path

**Note:** If PAGE number wasn't provided, check the highest PAGE number in DATA_UNIFICATION_PHASE1.md

### Step 2: Analyze Your File
1. **Read** the entire file
2. **Check if used**: `grep -r "filename" src/` (is anyone importing it?)
3. **Document** what you find:
   - How does it get data?
   - What logic/calculations does it have?
   - Any duplicate patterns with other files?

### Step 3: Update Documentation (BE BRIEF!)

**🛑 STOP AND READ: YOU MUST ADD A COMPLETE PAGE SECTION TO PHASE1.md!**
**Many agents are skipping this - DON'T BE ONE OF THEM!**

**⚠️ CRITICAL: LOOK AT EXISTING ENTRIES FIRST!**
Before writing ANYTHING, read how previous files were documented. Match that exact style.

**⚠️ WORKING WITH OTHER AGENTS?**
If you're working in parallel with other agents, wait your assigned delay (2-3 seconds for agent 1, 4-5 for agent 2, etc.) before editing shared documents.

Update THREE documents (if locked, wait 30 seconds and retry):

1. **DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_FILES.md**
   - Mark as analyzed: `[x]`
   - Mark if dead file: `[🗑️]` (not imported anywhere)

2. **DATA_UNIFICATION/DATA_UNIFICATION_PHASE1.md**
   
   **⚠️ YOU MUST ADD A COMPLETE PAGE SECTION - NO SKIPPING!**
   
   **STEP 1 - ADD PAGE HEADER:**
   - Use the PAGE number provided to you (or check existing pages if not provided)
   - Format: `## PAGE X: FILENAME.TSX (Fxxx)`
   - Example: `## PAGE 9: LIVEGAME.TSX (F016)`
   
   **STEP 2 - ADD ALL THREE TABLES (REQUIRED!):**
   
   ```markdown
   ## PAGE X: FILENAME.TSX (Fxxx)
   
   ### Data Retrieved
   | Data Type | Method | Location |
   |-----------|--------|----------|
   | User data | useAuth hook | [File.tsx:45] |
   | Game info | Direct supabase | [File.tsx:89] |
   
   ### Embedded Business Logic
   | Logic | Location | Description |
   |-------|----------|-------------|
   | Sort by date | [File.tsx:141] | Orders descending |
   | Calculate score | [File.tsx:200] | Sum of strokes |
   
   ### Issues Found
   - No error handling for data fetch
   - Hardcoded values for limits
   - Direct supabase calls
   ```
   
   **⚠️ CRITICAL RULES:**
   - **MUST ADD ALL 3 SECTIONS** - Data Retrieved, Business Logic, Issues Found
   - **USE TABLES** - Never write paragraphs or bullet lists
   - **Keep descriptions SHORT** (5-10 words max)
   - **If file doesn't exist**, still add the PAGE with "FILE DOESN'T EXIST" in tables
   - **MAX 2-3 entries per table**

3. **DATA_UNIFICATION/DATA_UNIFICATION_PHASE1_LOGIC.md**
   - **FIRST: Check if pattern already exists - just add your file to it!**
   - **Only add 1-2 NEW patterns** if truly unique
   - Format for adding to existing:
     ```
     ### Format Standard Date
     **Logic**: Convert ISO date to readable format  
     **Files**: [existing], [YourFile:123]  ← Just add here
     ```
   - Format for NEW pattern (only if unique):
     ```
     ### Your New Pattern Name
     **Logic**: Brief 5-10 word description  
     **Files**: [Fxxx:lineNumber]  
     **Issue**: Optional, only if problem exists
     ```

### Step 4: Mark Complete
In PHASE1_FILES.md, update your file's checkbox when done.

## WHAT TO DOCUMENT (FACTS ONLY)

| Check | Record |
|-------|--------|
| Data Fetching | How it gets data (supabase, hook, service) |
| Business Logic | What calculations/transformations exist |
| Duplicates | Which files have similar code |
| Imports | Which files import this one |
| Exports | What this file exports |
| Observations | What patterns you see (no judgments) |

## TIME LIMIT: 5 MINUTES MAX
Don't overanalyze. Quick scan, brief documentation, move on.

## IMPORTANT NOTES
- **ONLY ANALYZE** - Do not modify code
- **ONLY DOCUMENT FACTS** - No suggestions or solutions
- **BE BRIEF** - No essays, just observations (5-10 words per description!)
- **MATCH EXISTING STYLE** - Read previous entries FIRST, copy their format
- **ADD TO EXISTING TABLES** - Don't create new sections
- **MAX 2-3 ENTRIES** per document (This means TOTAL, not per section!)
- **NO DECISIONS** - Don't say what should be done
- **Other agents working** - If document locked, wait and retry
- **Use file numbers** - Reference as [Fxxx] not full paths

## BREVITY EXAMPLES
✅ GOOD descriptions (5-10 words):
- "Sort games by date"
- "Format relative time"
- "Get user profile"
- "Check game is active"

❌ BAD descriptions (too long):
- "Complex handicap calculation with multiple engines and fallback pattern"
- "Calculate strokes received on specific hole using PMP results"
- "Use MatchHandicapEngine and PMPEngine for handicap calculation"

## VALIDATION CHECKLIST
Before finishing, verify:
- [ ] Did you check the current PAGE count and add yours as next number?
- [ ] Are all your descriptions 5-10 words max?
- [ ] Did you add to EXISTING patterns in LOGIC file (not create new ones)?
- [ ] Did you limit yourself to 2-3 entries per document?
- [ ] Did you avoid creating duplicate sections?
- [ ] Is your PAGE header format correct: `## PAGE X: FILENAME.TSX (Fxxx)`?

## YOUR OUTPUT
Just facts about what the file does and contains.
No recommendations. No next steps. No fixes.
Pure analysis only.

## COMMON MISTAKES TO AVOID
❌ Creating duplicate PAGE sections with same number
❌ Adding more than 3 entries per table
❌ Writing long descriptions (>10 words)
❌ Creating new logic patterns when one already exists
❌ Adding duplicate "Issues Found" sections
❌ Forgetting the PAGE header format
❌ Not checking what PAGE number to use next

---
*End of Phase 1 Instructions*