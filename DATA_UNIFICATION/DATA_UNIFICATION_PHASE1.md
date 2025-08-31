# Golf X - Data Unification Phase 1 Analysis
*Detailed analysis of each file with data patterns and issues*

---

## PAGE 1: HOME.TSX (F001)

**File**: `src/pages/Home.tsx`  
**Status**: ✅ Active  
**Imports**: ProfileDataService, GameDataService, hooks  
**Imported By**: App.tsx  

### Data Patterns
- **Hardcoded**: userId (16752), test data arrays
- **Services**: profileDataService.getUser(), gameDataService  
- **Hooks**: useProfile, useFriends, useLiveGames

### Key Functions
- `loadUserData()`: Manual profile fetch
- `calculateCareerStats()`: Aggregates game statistics  
- `fetchFriends()`: Friend list retrieval

### Issues Found
- Multiple data sources for same user
- Hardcoded userId (16752)
- Missing error boundaries
- Duplicate data fetching (hooks + direct service)

---

## PAGE 2: PROFILE.TSX (F002)

**File**: `src/pages/Profile.tsx`  
**Status**: ✅ Active  
**Imports**: ProfileDataService, profileGameService, StatsGrid  
**Imported By**: App.tsx  

### Data Patterns
- **Auth**: useAuthState, User from @aws-amplify/ui-react
- **Services**: Direct profileDataService calls
- **Hooks**: useState for local state management
- **Components**: StatsGrid for stat display

### Key Functions
- `fetchUserProfile()`: Gets profile + handicap
- `fetchCareerStats()`: Aggregates game statistics
- `handleProfileUpdate()`: Updates user profile
- `handleSignOut()`: Auth signout

### Issues Found
- No useProfile hook usage (inconsistent)
- Manual stat calculations
- Missing loading states for some operations

---

## PAGE 3: FRIENDS.TSX (F003)

**File**: `src/pages/Friends.tsx`  
**Status**: ✅ Active  
**Imports**: useFriends hook, friendsLib  
**Imported By**: App.tsx  

### Data Patterns
- **Hook**: useFriends for data management
- **Search**: Local filter on friendsList
- **Loading**: Proper loading/error states

### Key Functions
- `handleSearch()`: Local friend search
- `navigateToFriendProfile()`: Navigation handler

### Issues Found
- No pagination (loads all friends)
- Search is client-side only
- Missing friend request management

---

## PAGE 4: MATCHHISTORY.TSX (F004) 

**File**: `src/pages/MatchHistory.tsx`  
**Status**: ✅ Active  
**Imports**: GameDataService, profileGameService  
**Imported By**: App.tsx  

### Data Patterns
- **Services**: Direct service calls
- **Queries**: Multiple expensive queries
- **State**: Complex local state management

### Key Functions
- `fetchMatchHistory()`: Gets all user games
- `calculateStats()`: Manual aggregations
- `navigateToGameDetails()`: Game navigation

### Issues Found
- No pagination (N+1 query problem)
- Heavy calculations on render
- Missing data caching
- Manual date formatting

---

## PAGE 5: STATS.TSX (F005)

**File**: `src/pages/Stats.tsx`  
**Status**: ✅ Active  
**Imports**: None (all hardcoded)  
**Imported By**: App.tsx  

### Data Patterns
- **Hardcoded**: ALL data is hardcoded
- **Navigation**: Links to HoleStats page

### Key Functions
- Component renders static data only

### Issues Found
- 100% hardcoded data
- No real data integration
- Missing stat calculations

---

## PAGE 6: HOLESTATS.TSX (F006)

**File**: `src/pages/HoleStats.tsx`  
**Status**: ✅ Active  
**Imports**: useHoleStats, profileGameService  
**Imported By**: Stats.tsx navigation  

### Data Patterns
- **Hook**: useHoleStats for data
- **Complex**: Multi-level stat calculations
- **Charts**: Data visualization components

### Key Functions
- `calculateHolePerformance()`: Per-hole analysis
- `generateChartData()`: Chart formatting
- Multiple stat aggregations

### Issues Found
- Complex nested calculations
- Performance concerns with large datasets
- Missing data validation

---

## PAGE 7: TOURNAMENTS.TSX (F007)

**File**: `src/pages/Tournaments.tsx`  
**Status**: ✅ Active  
**Imports**: None  
**Imported By**: App.tsx  

### Data Patterns
- **Hardcoded**: All tournament data
- **Mock**: Leaderboard, standings, stats

### Key Functions
- Static rendering only
- Tab navigation for different views

### Issues Found
- No real tournament integration
- All data is mocked
- Missing tournament service

---

## PAGE 8: FRIENDPROFILE.TSX (F008)

**File**: `src/pages/FriendProfile.tsx`  
**Status**: ✅ Active  
**Imports**: ProfileDataService, GameDataService  
**Imported By**: Friends.tsx navigation  

### Data Patterns
- **Services**: Direct service calls
- **Stats**: Complex stat calculations
- **Games**: Friend's game history

### Key Functions
- `loadFriendData()`: Profile + stats
- `fetchCommonGames()`: Shared game history
- `calculateHeadToHead()`: H2H statistics

### Issues Found
- Duplicate stat calculation logic
- No data caching
- Missing error handling

---

## PAGE 9: LOGIN.TSX (F009)

**File**: `src/pages/Login.tsx`  
**Status**: ✅ Active  
**Imports**: AWS Amplify Auth  
**Imported By**: App.tsx  

### Data Patterns
- **Auth**: Amplify authentication only
- **No Data**: No data service usage

### Key Functions
- Authentication only

### Issues Found
- None (auth only)

---

## PAGE 10: SIGNUP.TSX (F010)

**File**: `src/pages/Signup.tsx`  
**Status**: ✅ Active  
**Imports**: AWS Amplify Auth  
**Imported By**: App.tsx  

### Data Patterns
- **Auth**: Amplify authentication only
- **No Data**: No data service usage

### Key Functions
- User registration only

### Issues Found
- None (auth only)

---

## PAGE 11: CONFIGERROR.TSX (F011)

**File**: `src/pages/ConfigError.tsx`  
**Status**: ✅ Active  
**Imports**: None  
**Imported By**: App.tsx  

### Data Patterns
- **Static**: Error display page

### Key Functions
- Static error display

### Issues Found
- None (static page)

---

## PAGE 12: TESTCOMPLETEDSCORECARD.TSX (F012)

**File**: `src/pages/TestCompletedScorecard.tsx`  
**Status**: ⚠️ Test Page  
**Imports**: ViewCompletedGame  
**Imported By**: None found  

### Data Patterns
- **Hardcoded**: Test game data
- **Mock**: Sample scorecard data

### Key Functions
- Test harness for ViewCompletedGame

### Issues Found
- Dead code (no route)
- Test data only

---

## PAGE 13: LEADERBOARD.TSX (F013)

**File**: `src/features/normal-game/components/Leaderboard.tsx`  
**Status**: ✅ Active  
**Imports**: GameDataService  
**Imported By**: LiveGame.tsx  

### Data Patterns
- **Props**: Game data passed from parent
- **Calculations**: Real-time score updates
- **Sorting**: Dynamic leaderboard ordering

### Key Functions
- `calculateNetScore()`: Handicap adjustments
- `sortLeaderboard()`: Position calculation
- `formatScore()`: Score display logic

### Issues Found
- Complex score calculations
- Missing memoization
- Duplicate handicap logic

---

## PAGE 14: COMPLETEDLEADERBOARD.TSX (F014)

**File**: `src/features/normal-game/components/CompletedLeaderboard.tsx`  
**Status**: ✅ Active  
**Imports**: None (props only)  
**Imported By**: ViewCompletedGame.tsx  

### Data Patterns
- **Props**: Completed game data
- **Static**: No data fetching
- **Display**: Final scores only

### Key Functions
- `renderFinalScores()`: Display logic
- `determineWinner()`: Winner calculation

### Issues Found
- Inconsistent with live leaderboard
- Missing tie-breaking logic

---

## PAGE 15: GAMESUMMARY.TSX (F015)

**File**: `src/features/normal-game/components/GameSummary.tsx`  
**Status**: ✅ Active  
**Imports**: gameService  
**Imported By**: LiveGame.tsx  

### Data Patterns
- **Service**: gameService.completeGame()
- **Calculations**: Final score processing
- **Stats**: Game statistics generation

### Key Functions
- `handleGameCompletion()`: Finalize game
- `calculateHandicapChanges()`: HCP updates
- `generateGameStats()`: Statistical summary

### Issues Found
- Complex handicap calculations
- Missing validation
- Duplicate logic from engines

---

## PAGE 16: LIVEGAME.TSX (F016)

**File**: `src/features/normal-game/components/LiveGame.tsx`  
**Status**: ✅ Active  
**Imports**: gameService, multiple components  
**Imported By**: App.tsx route  

### Data Patterns
- **State**: Complex game state management
- **Service**: gameService for persistence
- **Real-time**: Score updates

### Key Functions
- `updateScore()`: Score entry
- `nextHole()`: Navigation
- `saveGameState()`: Persistence

### Issues Found
- State management complexity
- Missing optimistic updates
- No offline support

---

## PAGE 17: VIEWCOMPLETEDGAME.TSX (F017)

**File**: `src/features/normal-game/components/ViewCompletedGame.tsx`  
**Status**: ✅ Active  
**Imports**: GameDataService  
**Imported By**: MatchHistory navigation  

### Data Patterns
- **Service**: gameDataService.getGameDetails()
- **Display**: Read-only scorecard
- **Logging**: Debug console.logs

### Key Functions
- `loadGameDetails()`: Fetch completed game
- `renderScorecard()`: Display logic

### Issues Found
- Console.log statements
- Name/username fallbacks
- Missing error handling

---

## PAGE 18: CREATEGAMECUSTOM.TSX (F018)

**File**: `src/features/normal-game/components/CreateGameCustom.tsx`  
**Status**: ✅ Active  
**Imports**: gameService, multiple hooks  
**Imported By**: Home.tsx  

### Data Patterns
- **Hardcoded**: Game type options
- **Service**: gameService.createGame()
- **Multi-step**: Wizard pattern

### Key Functions
- `handleGameCreation()`: Create new game
- `validateConfiguration()`: Input validation

### Issues Found
- Hardcoded game types
- Complex state management
- Missing validation feedback

---

## PAGE 19: PLAYERCONFIGURATION.TSX (F019)

**File**: `src/features/normal-game/components/PlayerConfiguration.tsx`  
**Status**: ✅ Active  
**Imports**: None  
**Imported By**: CreateGameCustom.tsx  

### Data Patterns
- **Props**: Player data from parent
- **Config**: Handicap settings

### Key Functions
- `configurePlayer()`: Player setup
- `setHandicap()`: HCP configuration

### Issues Found
- Missing player validation
- No handicap limits

---

## PAGE 20: ADDPARTICIPANTS.TSX (F020)

**File**: `src/features/normal-game/components/AddParticipants.tsx`  
**Status**: ✅ Active  
**Imports**: useFriends  
**Imported By**: CreateGameCustom.tsx  

### Data Patterns
- **Hook**: useFriends for friend list
- **Search**: Friend selection

### Key Functions
- `selectFriend()`: Add to game
- `searchFriends()`: Filter list

### Issues Found
- No pagination for large friend lists
- Missing recent players

---

## PAGE 21: GHOSTCONFIG.TSX (F021)

**File**: `src/features/normal-game/components/GhostConfig.tsx`  
**Status**: ✅ Active  
**Imports**: None  
**Imported By**: CreateGameCustom.tsx  

### Data Patterns
- **Props**: Ghost player configuration
- **Validation**: Name/handicap checks

### Key Functions
- `addGhostPlayer()`: Non-user player

### Issues Found
- Limited ghost player features
- No handicap validation

---

## PAGE 22: COURSESELECTOR.TSX (F022)

**File**: `src/features/normal-game/components/CourseSelector.tsx`  
**Status**: ✅ Active  
**Imports**: useCourses  
**Imported By**: CreateGameCustom.tsx  

### Data Patterns
- **Hook**: useCourses for course data
- **Search**: Course filtering

### Key Functions
- `selectCourse()`: Course selection
- `searchCourses()`: Filter courses

### Issues Found
- Missing favorite courses
- No recent courses
- Search performance

---

## PAGE 23: TEESELECTOR.TSX (F023)

**File**: `src/features/normal-game/components/TeeSelector.tsx`  
**Status**: ✅ Active  
**Imports**: None  
**Imported By**: CreateGameCustom.tsx  

### Data Patterns
- **Props**: Course tee data
- **Selection**: Tee configuration

### Key Functions
- `selectTee()`: Tee selection

### Issues Found
- Missing tee ratings
- No color indicators

---

## PAGE 24: HOLEENTRY.TSX (F024)

**File**: `src/features/normal-game/components/HoleEntry.tsx`  
**Status**: ✅ Active  
**Imports**: ScoringEngine  
**Imported By**: LiveGame.tsx  

### Data Patterns
- **Engine**: ScoringEngine calculations
- **State**: Score entry management

### Key Functions
- `enterScore()`: Score input
- `calculatePoints()`: Point calculation

### Issues Found
- Complex scoring logic
- Missing validation
- No undo feature

---

## PAGE 25: LIVEMATCHCARD.TSX (F025)

**File**: `src/features/normal-game/components/LiveMatchCard.tsx`  
**Status**: ✅ Active  
**Imports**: useLiveGames  
**Imported By**: Home.tsx  

### Data Patterns
- **Hook**: useLiveGames for active games
- **Display**: Game card rendering

### Key Functions
- `renderGameCard()`: Display logic
- `navigateToGame()`: Game navigation

### Issues Found
- Missing real-time updates
- No error states

---

## PAGE 26: GAMESERVICE.TS (F026)

**File**: `src/features/normal-game/services/gameService.ts`  
**Status**: ✅ Active  
**Imports**: supabase, engines  
**Imported By**: Multiple game components  

### Data Patterns
- **Database**: Direct Supabase queries
- **Engines**: Scoring/handicap calculations
- **Complex**: Multi-table operations

### Key Functions
- `createGame()`: Game initialization
- `updateScore()`: Score persistence
- `completeGame()`: Game finalization
- `getGameDetails()`: Game retrieval

### Issues Found
- Complex query chains
- Missing transaction support
- Duplicate engine logic
- No caching layer

---

## PAGE 27: DATASERVICE.TS (F027)

**File**: `src/services/data/DataService.ts`  
**Status**: ✅ Active  
**Imports**: supabase, sub-services  
**Imported By**: Multiple pages  

### Data Patterns
- **Aggregator**: Combines multiple services
- **Sub-services**: ProfileData, GameData, etc.
- **Auth**: User context management

### Key Functions
- Service initialization
- Sub-service access

### Issues Found
- Service sprawl
- Inconsistent patterns
- Missing unified interface

---

## PAGE 28: PROFILEDATASERVICE.TS (F028)

**File**: `src/services/data/ProfileDataService.ts`  
**Status**: ✅ Active  
**Imports**: supabase  
**Imported By**: DataService  

### Data Patterns
- **CRUD**: User profile operations
- **Relations**: Friends, stats
- **Queries**: Profile fetching

### Key Functions
- `getUser()`: Profile retrieval
- `updateProfile()`: Profile updates
- `getUserStats()`: Stat aggregation

### Issues Found
- N+1 query problems
- Missing caching
- Duplicate stat logic

---

## PAGE 29: GAMEDATASERVICE.TS (F029)

**File**: `src/services/data/GameDataService.ts`  
**Status**: ✅ Active  
**Imports**: supabase  
**Imported By**: DataService  

### Data Patterns
- **CRUD**: Game operations
- **Complex**: Multi-table joins
- **Queries**: Game history

### Key Functions
- `getUserGames()`: Game history
- `getGameDetails()`: Full game data
- `getActiveGames()`: Live games

### Issues Found
- Heavy queries
- Missing pagination
- No query optimization

---

## PAGE 30: PROFILEGAMESERVICE.TS (F030)

**File**: `src/services/profileGameService.ts`  
**Status**: ✅ Active  
**Imports**: supabase  
**Imported By**: Profile, Stats pages  

### Data Patterns
- **Stats**: Game statistics
- **Aggregation**: Career totals
- **Calculations**: Handicap trends

### Key Functions
- `getCareerStats()`: Total statistics
- `getRecentGames()`: Recent history
- `calculateTrends()`: Stat trends

### Issues Found
- Duplicate logic
- Heavy calculations
- Missing caching

---

## PAGE 31: SESSIONTRACKINGSERVICE.TS (F031)

**File**: `src/services/sessionTrackingService.ts`  
**Status**: ✅ Active  
**Imports**: supabase  
**Imported By**: App.tsx  

### Data Patterns
- **Tracking**: Session management
- **Table**: user_sessions
- **Lifecycle**: Login/logout tracking

### Key Functions
- `startSession()`: Session creation
- `endSession()`: Session closure
- `updateActivity()`: Activity tracking

### Issues Found
- Privacy considerations
- Missing cleanup
- No session timeout

---

## PAGE 32: FRIENDS.TS (F032)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| TBD | TBD | TBD |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| TBD | TBD | TBD |

### Issues Found
- Content needs to be analyzed

---

## PAGE 33: TOURNAMENTS.TS (F033)

**Status**: FILE DOESN'T EXIST

---

## PAGE 34: USEPROFILE.TS (F034)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| TBD | TBD | TBD |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| TBD | TBD | TBD |

### Issues Found
- Content needs to be analyzed

---

## PAGE 35: USEFRIENDS.TS (F035)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| TBD | TBD | TBD |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| TBD | TBD | TBD |

### Issues Found
- Content needs to be analyzed

---

## PAGE 36: USECOURSES.TS (F036)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| TBD | TBD | TBD |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| TBD | TBD | TBD |

### Issues Found
- Content needs to be analyzed

---

## PAGE 37: USEHOLESTATS.TS (F037)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| TBD | TBD | TBD |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| TBD | TBD | TBD |

### Issues Found
- Content needs to be analyzed

---

## PAGE 38: USELIVEGAMES.TS (F038)

**File**: `src/hooks/useLiveGames.ts`  
**Status**: ✅ Active  
**Imports**: DataService, gameService  
**Imported By**: LiveMatchCard.tsx  

### Data Patterns
- **Cache**: Map-based 30s cache
- **Data Source**: dataService.games.getUserActiveGames()
- **Fallback**: gameService.getGameDetails()

### Key Functions
- `useLiveGames()`: Fetch active games
- `useLiveGamesWithNavigation()`: Nav-aware refresh

### Issues Found
- Mixed data sources
- Window cache exposure
- Manual score calculations

## PAGE 39: USESWIPEGESTURE.TS (F039)

**Status**: FILE DOESN'T EXIST

---

## PAGE 40: USESWIPEGESTURE.TS (F040)

**Status**: FILE DOESN'T EXIST

---

## PAGE 41: NAMEUTILS.TS (F041)

**Status**: ALREADY IMPLEMENTED

---

## PAGE 42: STATSGRID.TSX (F042)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| StatItem array | Via props | [StatsGrid.tsx:props] |
| No data fetching | Display component only | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Grid layout logic | Component render | Responsive columns |
| Loading state | [StatsGrid.tsx:23] | Shows skeleton |

### Issues Found
- No data fetching (display only component)
- Inline styles instead of CSS classes
- No memoization for performance

---

## PAGE 43: HANDICAPCARD.TSX (F043)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| N/A | FILE DOESN'T EXIST | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| N/A | FILE DOESN'T EXIST | N/A |

### Issues Found
- File doesn't exist in codebase
- Can be removed from tracking

---

## PAGE 44: AVATARUPLOAD.TSX (F044)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Current avatar | Via props | [AvatarUpload.tsx:props] |
| Avatar storage | avatarService | [AvatarUpload.tsx:imports] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Image compression | handleImageSelection | Before upload processing |
| Priority display | getAvatarUrl | Custom → Google → initials |
| Cleanup old avatars | uploadAvatar | Background deletion |

### Issues Found
- Uses avatarService directly instead of DataService
- Image size validation hardcoded to 10MB
- No error recovery mechanisms

---

## PAGE 45: AVATARSERVICE.TS (F045)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Avatar files | Supabase storage | [avatarService.ts:storage] |
| Profile updates | Direct supabase | [avatarService.ts:profiles] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Image compression | compressImage | 1MB max, 800px |
| File naming | uploadAvatar | avatar-{timestamp}.ext |
| Old file cleanup | uploadAvatar | Delete previous avatars |

### Issues Found
- Direct Supabase access bypasses data layer
- No error recovery mechanisms
- Manual bucket management

---

## PAGE 46: TOURNAMENTCARD.TSX (F046)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| N/A | FILE DOESN'T EXIST | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| N/A | FILE DOESN'T EXIST | N/A |

### Issues Found
- File doesn't exist in codebase
- Can be removed from tracking

---

## PAGE 47: TOURNAMENTDETAILS.TSX (F047)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| N/A | FILE DOESN'T EXIST | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| N/A | FILE DOESN'T EXIST | N/A |

### Issues Found
- File doesn't exist in codebase
- Can be removed from tracking

---

## PAGE 48: TOURNAMENTLEADERBOARD.TSX (F048)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Tournament data | Hardcoded mock data | [TournamentLeaderboard.tsx:30-85] |
| Player positions | Hardcoded array | [TournamentLeaderboard.tsx:30-85] |
| Prize pool | Hardcoded values | [TournamentLeaderboard.tsx:87-92] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Stableford scoring | Component text | 4pts Eagle, 3pts Birdie |
| Position colors | getPositionStyle | Gold, silver, bronze |
| Movement indicators | PlayerRow | Up/down/same arrows |

### Issues Found
- All data is hardcoded mock data
- No database integration
- Static tournament name and prizes

---

## PAGE 49: TOURNAMENTSERVICE.TS (F049)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| N/A | FILE DOESN'T EXIST | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| N/A | FILE DOESN'T EXIST | N/A |

### Issues Found
- File doesn't exist in codebase
- Can be removed from tracking

---

## PAGE 50: COURSESLIST.TSX (F050)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Courses | useCourses hook | Fetches from courses table |
| Course locations | Database | Location, par, holes data |
| Favorites | localStorage | Stored locally |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Distance calc | Component | Calculate distance to courses |
| Sorting | Component | Sort by distance, name, favorites |
| Search filter | Component | Filter courses by name |

### Issues Found
- Distance calculations in component
- Favorites only in localStorage, not synced
- No pagination for large lists

---

## PAGE 51: COURSEDETAIL.TSX (F051)

### Data Retrieved
| Source | Method | Data Type | Usage |
|--------|--------|-----------|--------|
| useCourseDetail hook | course, teeBoxes, holes | Course with relations | Display course info |
| dataService.profiles | getUserProfile() | User profile | Get user handicap |
| holeStatsService | getHoleStatistics() | Hole statistics | Display user stats |
| dataService.stats | getFriendsAverageForHoles() | Friends averages | Compare with friends |

### Embedded Business Logic
| Logic Type | Location | Description |
|------------|----------|-------------|
| Handicap Range | getHandicapRange() | Calculates comparison range (±2 to ±6) based on user handicap |
| Stats Processing | processedStats useMemo | Aggregates rounds, calculates best/worst/avg scores |
| Chart Data | holeChartData useMemo | Transforms holes data for visualization |
| Score Coloring | renderTeeBoxes() L754-792 | Green for best scores, gray for worst |
| Default Tee | useEffect L203-218 | Auto-selects Yellow tee or first available |

### Issues Found
| Issue | Severity | Details |
|-------|----------|---------|
| Hardcoded ranges | Medium | Handicap ranges hardcoded in component |
| Complex calculations | Medium | Score coloring logic embedded in render (754-792) |
| Missing error handling | Low | No error handling for stats API calls |
| Data aggregation | Medium | Stats processing mixed with presentation |

---

## PAGE 52: COURSESCORECARD.TSX (F052)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| N/A | FILE DOESN'T EXIST | N/A |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| N/A | FILE DOESN'T EXIST | N/A |

### Issues Found
- File doesn't exist in codebase
- Can be removed from tracking

---

## PAGE 53: SCORINGENGINE.TS (F053)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Scorecards | Function parameter | L68-72 calculateLeaderboard() |
| Hole scores | card.holes | L347, L432, L634 |
| Player handicaps | card.courseHandicap/playingHandicap | L282, L351, L440 |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Stroke Play scoring | L269-333 | Score vs par, handicap adjustments |
| Stableford points | L339-402 | Points: Double Eagle=5, Eagle=4, Birdie=3, Par=2, Bogey=1 |
| Match Play rounds | L408-608 | Round-robin pairwise comparisons, 2pts win/1pt tie |
| Skins calculation | L614-741 | Outright hole wins, carryovers for ties |
| Handicap strokes | L746-762 | Stroke index based allocation |
| Position assignment | L767-776 | Handles tied positions |

### Issues Found
- Console.log statements in production (L713)
- Complex scoring logic tightly coupled
- No caching for expensive calculations
- Missing error handling for edge cases

## PAGE 54: HANDICAPENGINE.TS (F054)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| GameParticipant[] | Input param | calculatePlayerMatchPar() L33 |
| HoleData[] | Input param | calculatePlayerMatchPar() L34 |
| participant.user_id | Property access | L63, L97, L133, L175 |
| participant.match_handicap | Property access | L87 (match play mode) |
| participant.playing_handicap | Property access | L123, L158 (stroke/random) |
| hole.hole_number | Property access | L64, L98, L134, L176 |
| hole.par | Property access | L65, L99, L135, L177 |
| hole.handicap_index | Property access | L91-93, L127-129 (SI) |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Handicap mode switching | L37-49 | Routes to different calculation methods |
| No handicap logic | L55-73 | All players play to course par |
| Match play calculation | L79-109 | Relative to lowest handicap player |
| Stroke play calculation | L115-144 | Full handicap for each player |
| Random handicap | L151-187 | Random stroke distribution |
| Stroke distribution | L91-93, L127-129 | Uses getStrokesOnHole() utility |
| PMP calculation | L101, L137, L179 | par + strokesReceived |
| Random distribution | L161-169 | While loop distributing strokes |

### Issues Found
- Different handicap fields used (match_handicap vs playing_handicap)
- Random mode hardcoded to 18 holes (L161)
- No validation for negative handicaps
- Map structure returned instead of direct array

---

## PAGE 55: MATCHHANDICAPENGINE.TS (F055)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| User profile | dataService.profiles.getUserProfile() | [MatchHandicapEngine.ts:173] |
| Ghost player data | Via context.selectedGameId | [MatchHandicapEngine.ts:159-196] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Match play calculation | MatchPlayStrategy | 100% allowance, relative to lowest |
| Stroke play calculation | StrokePlayStrategy | 95% allowance applied |
| Lucky draw calculation | RandomHandicapStrategy | 95% allowance, random PMP distribution |
| Ghost mode calculation | GhostModeStrategy | 0% allowance (scratch play) |
| Strategy registration | StrategyRegistry | Manages 6 handicap strategies |
| Fallback handling | calculateMatchHandicap | Falls back to match_play on error |

### Issues Found
- PersonalParStrategy not implemented (TODO at line 216)
- Ghost mode requires external game ID selection
- Weather/seasonal adjustments planned but not implemented

---

## PAGE 56: PMPENGINE.TS (F056)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| Game hole scores | dataService.games.getGameHoleScores() | L374 |
| Ghost scorecard data | Map of hole scores | L383-389 |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Stroke distribution | L50-100 | Allocates strokes by stroke index |
| Random distribution | L145-173 | Seeded random for consistency |
| Controlled random | L184-249 | Lucky Draw with max caps |
| Ghost distribution | L283-331 | Uses actual past scores |
| Handicap adjustment | L426 | Adjusts for 9-hole rounds |
| Ghost hole filtering | L415-420 | Matches historical holes |

### Issues Found
- console.log statements in production (L368, L394, L419)
- console.warn statements left in (L318, L441)
- Complex ghost mode logic mixed with regular PMP
- No error handling for DataService import failure
- Tight coupling between ghost mode and PMP calculation

---
- Hardcoded image fallback path

---

## PAGE 57: DATEUTILS.TS (F057)

**Status**: TO BE CREATED

---

## PAGE 58: NAMEUTILS.TS (F058)

**Status**: TO BE CREATED

---

## PAGE 59: SCOREUTILS.TS (F059)

**Status**: TO BE CREATED

---

## PAGE 60: VALIDATIONUTILS.TS (F060)

**Status**: TO BE CREATED

---

## PAGE 61: SCORINGENGINETEST.TSX (F061)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| User games | dataService.games | [ScoringEngineTest.tsx:175] |
| Game participants | dataService.games | [ScoringEngineTest.tsx:207] |
| Hole scores | dataService.games | [ScoringEngineTest.tsx:210] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Calculate leaderboard | [ScoringEngineTest.tsx:114-157] | Convert scorecards to engine format |
| Apply handicap via PMP | [ScoringEngineTest.tsx:133] | Use player match par for handicap |
| Score color coding | [ScoringEngineTest.tsx:518-524] | Visual scoring vs personal par |

### Issues Found
- Mock scoring methods hardcoded at top
- Complex type conversions for engine
- Direct dataService calls in component

---

## PAGE 62: HANDICAPENGINETEST.TSX (F062)

### Data Retrieved
| Data Type | Method | Location |
|-----------|--------|----------|
| User profile | dataService.profiles.getUserProfile | [HandicapEngineTest.tsx:200] |
| Course data | dataService.courses.getAllCourses | [HandicapEngineTest.tsx:242] |
| Game scores | dataService.games.getUserCompletedGames | [HandicapEngineTest.tsx:321] |

### Embedded Business Logic
| Logic | Location | Description |
|-------|----------|-------------|
| Handicap calculation | [HandicapEngineTest.tsx:411] | CH = HI × (Slope/113) + (CR - Par) |
| Test game types | [HandicapEngineTest.tsx:25] | Defines 5 game type configurations |
| PMP distribution | [HandicapEngineTest.tsx:590] | Calculates Player Match Par |

### Issues Found
- Hardcoded test values for handicap (15.0) at line 203
- Multiple data service calls without proper error handling
- Complex state management with 20+ useState hooks

---

