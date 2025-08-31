# Phase 1 Agent Calling Protocol

## PURPOSE
This protocol instructs agents how to properly dispatch multiple sub-agents for Phase 1 file analysis when the user requests: "send X agents in parallel to phase 1"

## STEP-BY-STEP PROTOCOL

### Step 1: Identify Files to Analyze
1. Read `D:\projects\repositories\golf-x\DATA_UNIFICATION\DATA_UNIFICATION_PHASE1_FILES.md`
2. Find X files marked with `[ ]` (not analyzed yet)
3. Note both the file code (e.g., F021) and full path for each
4. Check `D:\projects\repositories\golf-x\DATA_UNIFICATION\DATA_UNIFICATION_PHASE1.md` for the highest PAGE number
5. Assign sequential PAGE numbers starting from (highest + 1)

### Step 2: Confirm with User
Present the selected files to the user:
```
OK. I will send X agents to analyze these files:
- [F021] src/features/normal-game/components/GhostConfig.tsx
- [F022] src/features/normal-game/components/CourseSelector.tsx
- [F023] src/features/normal-game/components/TeeSelector.tsx

Which agent type should I use? Available agents in .claude/agents/:
- general-purpose (default)
- [list other available agents from D:\projects\repositories\golf-x\.claude\agents]

Please specify or confirm 'general-purpose'.
```

**IMPORTANT**: User MUST specify an agent type. If unclear, ask for clarification.

### Step 3: Call Agents in PARALLEL (CRITICAL!)

**⚠️ CRITICAL: ALL agents MUST be called in ONE SINGLE message with multiple Task tool invocations**

Each agent prompt MUST include:

1. **File Assignment**: Their specific [Fxxx] code and file path
2. **Parallel Awareness**: List of OTHER agents working simultaneously  
3. **Timing Strategy**: Staggered wait times to avoid document conflicts
4. **Instructions Path**: Reference to PHASE1_AGENT_INSTRUCTIONS.md
5. **Brief Reminder**: Max 2-3 entries, 5-10 words per description

**PROMPT TEMPLATE FOR EACH AGENT:**
```
You are analyzing file [FXXX] for the Golf X Data Unification Phase 1.

YOUR ASSIGNED FILE: [FXXX] path/to/file.tsx
YOUR PAGE NUMBER: PAGE [X] (use this in DATA_UNIFICATION_PHASE1.md)

OTHER AGENTS WORKING IN PARALLEL:
- Agent 1 is analyzing [F021] FileName1.tsx
- Agent 2 is analyzing [F022] FileName2.tsx
- Agent 3 is analyzing [F023] FileName3.tsx

IMPORTANT: You are working alongside other agents. To avoid conflicts:
- Wait [X-Y] seconds before updating shared documents (you're agent N)
- If a document is locked, wait 30 seconds and retry
- Be brief - max 2-3 entries total across all documents

Follow the instructions in D:\projects\repositories\golf-x\DATA_UNIFICATION\PHASE1_AGENT_INSTRUCTIONS.md

1. Read and analyze your assigned file
2. Check if it's imported: grep -r "YourFileName" src/
3. Update these THREE documents (BE BRIEF!):
   - DATA_UNIFICATION_PHASE1_FILES.md (mark [x] analyzed)
   - DATA_UNIFICATION_PHASE1.md (add 2-3 entries MAX to existing tables)
   - DATA_UNIFICATION_PHASE1_LOGIC.md (add 1-2 patterns MAX if major)

CRITICAL REMINDERS:
- LOOK at existing entries first to match the style
- Keep descriptions to 5-10 words maximum
- Only document facts, no suggestions
- Add to EXISTING tables, don't create new sections
- Time limit: 5 minutes

Return a brief summary of what you found.
```

**STAGGERED TIMING STRATEGY:**
- Agent 1: Wait 2-3 seconds
- Agent 2: Wait 4-5 seconds  
- Agent 3: Wait 6-7 seconds
- Agent 4: Wait 8-9 seconds
- Agent 5: Wait 10-11 seconds

### Step 4: Review Results
After all agents complete:

1. **Check completions**: Verify all files marked [x] in PHASE1_FILES.md
2. **Review patterns**: Ensure entries are brief and factual
3. **Fix any issues**: Clean up if agents overengineered
4. **Report to user**: 
   ```
   Phase 1 Analysis Complete:
   ✓ [F021] GhostConfig.tsx - analyzed
   ✓ [F022] CourseSelector.tsx - analyzed  
   ✓ [F023] TeeSelector.tsx - analyzed
   
   Total files analyzed: X/62
   Any issues: [list if any]
   ```

## COMMON ERRORS TO AVOID

1. **DON'T call agents sequentially** - Must be parallel in one message
2. **DON'T forget to inform each agent about others** - Prevents conflicts
3. **DON'T skip agent type confirmation** - User must specify
4. **DON'T let agents create new sections** - Only add to existing tables
5. **DON'T allow verbose descriptions** - Enforce 5-10 word limit

## EXAMPLE USAGE

**User**: "send 3 agents in parallel to phase 1"

**Agent Response**:
1. Checks PHASE1_FILES.md, finds F021, F022, F023 need analysis
2. Confirms files and agent type with user
3. Calls all 3 agents in ONE message with Task tool
4. Each agent gets unique prompt with file, awareness of others, timing
5. Reviews results and reports completion

## VALIDATION CHECKLIST
- [ ] All agents called in ONE message?
- [ ] Each agent knows about the others?
- [ ] Staggered timing included?
- [ ] PHASE1_AGENT_INSTRUCTIONS.md referenced?
- [ ] Brief documentation enforced?
- [ ] Agent type confirmed by user?

---
*This protocol ensures efficient, conflict-free parallel analysis for Phase 1*