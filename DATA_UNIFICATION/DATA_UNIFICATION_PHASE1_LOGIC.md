# Golf X - Logic Patterns Inventory (Phase 1)
*Track all business logic and data patterns found across the application*

## Format: Name | Description | Files Using It

---

## DATA RETRIEVAL PATTERNS

### Retrieve User Profile
**Logic**: Fetch current user's profile data from profiles table  
**Files**: [F001:52-82], [F002:45-51 via useProfile], [F003 via useFriends], [F031:35 session user_id], [F028:20-48 ProfileDataService]  
**Variations**: Direct supabase vs hooks vs DataService

### Retrieve Active Games
**Logic**: Get games with status 'setup' or 'active' for current user  
**Files**: [F001:89-116], [F038:68 useLiveGames hook], [F025:23 via useLiveGamesWithNavigation]  
**Filter**: `.in('status', ['setup', 'active'])`

### Load Available Courses
**Logic**: Get all golf courses from database  
**Files**: [F018:108 CreateGameCustom], [F022:29 CourseSelector], [F027:27 CourseDataService init], [F036:130 useCourseList], [F050:40-49 CoursesList]  
**API**: `dataService.courses.getAllCourses()`, `gameService.getCourses()`, `useCourseList()`

### Get Tee Boxes for Course
**Logic**: Fetch available tee boxes for selected course  
**Files**: [F023:48 TeeSelector], [F019:120-123 Direct supabase], [F036:146,277 useCourses parallel fetch], [F050:55-57 CoursesList yellow tee preference], [F051:203-218 CourseDetail yellow tee auto-select]  
**API**: `gameService.getTeeBoxes(courseId)`, Direct query, `dataService.courses.getTeeBoxesForMultipleCourses()`

### Retrieve Completed Games  
**Logic**: Get games with status 'completed' ordered by date  
**Files**: [F004:43-78], [F001:119-144 for recent], [F029:175-207 getUserCompletedGames], [F030:141-168,134-282 getUserCompletedGames]  
**Sort**: `.order('completed_at', { ascending: false })`

### Retrieve Friends List
**Logic**: Get accepted friendships for current user  
**Files**: [F003:34 via useFriends], [F020:68 AddParticipants], [F021:121 GhostConfig], [F032:74 rpc get_friends], [F028:98 ProfileDataService], [F035:40 useFriends hook]  
**Join**: With profiles table for names

### Search Users
**Logic**: Search profiles table excluding current user  
**Files**: [F003:45-63]  
**Issue**: Doesn't exclude existing friends

### Get Game Participants
**Logic**: Fetch participant profiles for a game  
**Files**: [F026:519-530], [F004:54-58], [F016:126 via gameService], [F017:330 via gameService], [F008:132-186], [F024 via props], [F029:107-158 getGameParticipants], [F030:327-350,355-377 getGameDetails]  
**Issue**: Multiple query patterns, inconsistent joins

### Get Hole Information
**Logic**: Fetch hole data with distances for specific hole  
**Files**: [F024:102-117]  
**Join**: With hole_distances table for yardage

---

## BUSINESS LOGIC PATTERNS

### Calculate Player Name Fallback
**Logic**: Get display name with fallbacks (full_name || email || 'Player')  
**Files**: [F013:86], [F014:80-83], [F026:541], [F017:360 'Unknown' fallback], [F021:348,351 avatar URL fallback], [F024:432,684], [F020:325 'Golf Friend' fallback]  
**Variations**: Different fallback chains

### Calculate Handicap Strokes
**Logic**: Distribute match handicap across holes by index  
**Files**: [F024:188-195,312-324]  
**Formula**: fullRounds + (index <= remaining ? 1 : 0)

### Course Handicap Formula
**Logic**: CH = HI × (Slope/113) + (CR - Par)  
**Files**: [F062:411 calculateRealHandicaps]  
**Issue**: Formula hardcoded in test file

### Calculate Handicap Comparison Range
**Logic**: Variable ranges for comparing friends' scores based on skill level  
**Files**: [F051:115-122 CourseDetail getHandicapRange]  
**Formula**: <5: ±2, 5-9: ±3, 10-17: ±4, 18-27: ±5, 28+: ±6

### Sort Games By Date  
**Logic**: Sort array by created_at or completed_at descending  
**Files**: [Home.tsx:141], [MatchHistory.tsx:77]  
**Code**: `games.sort((a,b) => new Date(b.created_at) - new Date(a.created_at))`

### Format Relative Time
**Logic**: Convert timestamp to "2 hours ago" format  
**Files**: [Home.tsx:234-242], [F008:342-354]  
**Should be**: Shared utility function

### Auto-Select Default Options
**Logic**: Auto-select middle or first option when only one available  
**Files**: [F023:52-56 TeeSelector middle tee], [F022:33-35 CourseSelector single course]  
**Pattern**: Select middle index for defaults or single option

### Format Standard Date
**Logic**: Convert ISO date to readable format  
**Files**: [Tournaments.tsx:138-145], [MatchHistory.tsx:234], [F048:Tournament name hardcoded]
**Method**: `toLocaleDateString()` with options

### Map Status to Color
**Logic**: Convert status string to Ionic color  
**Files**: [Tournaments.tsx:147-154]  
**Values**: open=success, full=warning, closed=danger
**Files**: [MatchHistory.tsx:234], [Profile.tsx:89], [ViewCompletedGame.tsx]  
**Formats**: Multiple different formats used

### Check Game Is Active
**Logic**: Determine if game status is playable  
**Files**: [Home.tsx:113], [F016:257,512]  
**Check**: `status === 'active' || status === 'setup'`

### Tournament Leaderboard Display
**Logic**: Show player rankings with Stableford scoring  
**Files**: [F048:TournamentLeaderboard]  
**Features**: Position icons, prize distribution, movement indicators

### Calculate Game Duration
**Logic**: Time between start and end/now  
**Files**: [MatchHistory.tsx:245-248], [Home.tsx for active games]  
**Formula**: `Math.floor((Date.now() - gameStart) / 1000 / 60)`

### Handle Friend Request
**Logic**: Accept/reject/send friend requests  
**Files**: [Friends.tsx:80-111]  
**API**: Direct supabase calls to friends table

### Update Profile
**Logic**: Save profile changes to database  
**Files**: [Profile.tsx:83-92], [ProfileDataService], [F027:28 ProfileDataService init], [F044 AvatarUpload], [F045:83-90 avatarService]  
**Returns**: Success boolean

### Sign Out User
**Logic**: Clear auth and redirect to login  
**Files**: [Profile.tsx:71-81]  
**Redirect**: `history.replace('/login')`

---

## SCORING & GAME LOGIC

### Calculate Leaderboard
**Logic**: Transform scores into sorted leaderboard  
**Files**: [CompletedLeaderboard.tsx:62-127], [Leaderboard.tsx], [F053:68-103 ScoringEngine.calculateLeaderboard]  
**Engine**: Uses ScoringEngine class

### Detect Handicap Game
**Logic**: Check if game uses handicaps  
**Files**: [Leaderboard.tsx:71], [CompletedLeaderboard.tsx:71], [F053:71 includeHandicap param]

### Calculate Score Color
**Logic**: Color code scores based on par difference  
**Files**: [Stats.tsx:69-74], [HoleStats.tsx:49-54]  
**Rules**: <=0 success, <=5 warning, >5 danger  
**Check**: `scores.some(s => s.player_match_par !== s.hole_par)`

### Calculate Net Score
**Logic**: Gross score minus handicap strokes  
**Files**: [F016:299-301], [F015:182-210], [F030:267 net_score field], [F053:282-284 StrokePlay netScore]  
**Formula**: Different implementations

### Scoring Method Calculations
**Logic**: Different point/score systems per method  
**Files**: [F053:269-741 ScoringEngine methods]  
**Methods**: Stroke Play (lowest), Stableford (points), Match Play (round-robin), Skins (carryover)

### Score Color Mapping
**Logic**: Map score relative to par to colors  
**Files**: [F005:69-74], [F006:49-54], [F061:518-524]  
**Issue**: Multiple implementations of same logic

### Calculate Match Handicap  
**Logic**: Calculate handicaps using engines (PMP/Match)  
**Files**: [F015:129-180], [F026 gameService], [F019:211-223 MatchHandicapEngine], [F054:79-109 HandicapEngine], [F055:261-280 MatchHandicapEngine.calculateMatchHandicap], [F062:566 test calculations]  
**Issue**: Complex with fallback patterns, strategy registry system

### Distribute Strokes Per Hole
**Logic**: Assign handicap strokes to specific holes  
**Files**: [F015:182-210], [F054:91-93,127-129 HandicapEngine]  
**Variations**: PMP method vs old calculation, multiple handicap modes

### Validate Score Entry
**Logic**: Check if score is valid for hole  
**Files**: [F016 HoleEntry child], [HoleEntry.tsx]  
**Rules**: Min 1, max reasonable limit

### Calculate Current Hole
**Logic**: Determine which hole players are on  
**Files**: [F016:139-144]  
**Method**: Max hole played + 1, capped at num_holes


---

## UI/UX PATTERNS

### Loading State Management
**Logic**: Show spinner while data loads  
**Files**: [Profile.tsx:95-146], [Home.tsx], [Friends.tsx]  
**Issue**: Inconsistent patterns

### Error Display
**Logic**: Show error messages to user  
**Files**: [Friends.tsx:87,98,109], [Profile.tsx:75,89]  
**Issue**: Mix of toasts, alerts, console logs

### Search Debouncing
**Logic**: Delay search until user stops typing  
**Files**: [Friends.tsx:66-77], [F031:113-122 session updates]  
**Delay**: 500ms timeout, 10s for sessions

### Pagination
**Logic**: Load data in chunks  
**Files**: None currently implemented  
**Needed**: [MatchHistory.tsx], [Friends.tsx]

---

## STATISTICS & CALCULATIONS

### Count Active Games
**Logic**: Get number of ongoing games  
**Files**: [Home.tsx:178]  
**Simple**: `activeGames.length`

### Calculate Average Score
**Logic**: Sum scores / count  
**Files**: [Profile stats], [StatsGrid.tsx], [HoleStats.tsx:142,299], [F030:113-115 averageScore calc], [F037:36-37 via dataService.stats]  
**Source**: GameStats type, hole statistics

### Get Best Score
**Logic**: Find minimum score from games  
**Files**: [Profile stats], [StatsGrid.tsx], [F030:112 bestScore calc]  
**Filter**: Completed games only

### Track Handicap Changes
**Logic**: Monitor handicap over time  
**Files**: [Profile.tsx], [HandicapCard.tsx]  
**Storage**: profiles.handicap field

---

## NOTES

1. **Most common duplications**:
   - Player name fallbacks (3+ variations)
   - Date formatting (no standard)
   - Game status checks (multiple patterns)

2. **Missing utilities**:
   - No shared date formatter
   - No pagination helper
   - No standard error handler

3. **Performance issues**:
   - Multiple queries for same data
   - No caching strategy
   - Heavy joins in MatchHistory

4. **Test files in production**:
   - [F012] TestCompletedScorecard with hardcoded data
   - Active test routes in App.tsx

5. **Next steps**:
   - Create nameUtils.ts for fallbacks
   - Create dateUtils.ts for formatting
   - Standardize game status checks
   - Unify handicap calculation methods
   - Extract stroke distribution logic

---

*Last Updated: 2024-01-31*  
*Files Analyzed: 6/72*
### Calculate Win Rate
**Logic**: Calculate wins/losses/ties between players
**Files**: [F008:209-221]
**Formula**: Math.round((wins / totalMatchups) * 100)


### Load User Profile Data
**Logic**: Load profile with game stats via hook
**Files**: [F034:55-116 useProfile hook]
**Pattern**: Uses DataService with caching

### Profile Update With Refresh
**Logic**: Update profile and refresh local state
**Files**: [F034:139-158]
**Method**: Optimistic update then server refresh

### Data Transformation and Mapping
**Logic**: Transform API responses to UI models  
**Files**: [F036:161-166,169-174,296-301,304-309 stats/images mapping], [F042:30-40 font/label sizing]  
**Issue**: Complex manual mappings repeated

### Manual Cache Invalidation
**Logic**: Force refresh profile/stats data
**Files**: [F034:161-173], [F038:128-130 activeGamesCache]
**API**: DataService invalidate methods

### Hardcoded User Defaults
**Logic**: Default bio and handicap values
**Files**: [F034:73-74,105-106]
**Values**: Bio text, handicap 12.5

### Count Games Played With Friends
**Logic**: Calculate number of games per friend
**Files**: [F028:194-209 ProfileDataService], [F035:41 useFriends hook]
**Method**: Group by friend_id and count

### PMP Handicap Distribution Strategies
**Logic**: Multiple algorithms for stroke allocation
**Files**: [F056:40-331 PMPEngine strategies], [F061:133 Apply via player match par]
**Strategies**: StrokeIndex, Even, Random, ControlledRandom, Ghost
**Issue**: Complex ghost mode coupling

### Ghost Mode Score Replay
**Logic**: Replay historical scores in new games
**Files**: [F056:283-331,367-463 Ghost distribution]
**Data**: Fetches past game hole scores via DataService
**Issue**: Mixed concerns with regular PMP calculation

## NON-EXISTENT FILES
- [F052] CourseScorecard.tsx - Not found in codebase

### Dead Files Found
**Files**: [F033:tournaments.ts], [F040:useSwipeGesture.ts], [F043:HandicapCard.tsx], [F047:TournamentDetails.tsx], [F049:TournamentService.ts]
**Status**: Files don't exist in codebase
