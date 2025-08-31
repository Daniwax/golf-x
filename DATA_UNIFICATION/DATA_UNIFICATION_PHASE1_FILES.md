# Golf X - Data Unification Files Checklist
*Track analysis and implementation status for all files*

## Legend
- [ ] Not analyzed yet
- [x] Analyzed - needs changes
- [✓] Analyzed - no changes needed
- [✅] Changes implemented
- [🗑️] Dead file - can be deleted

## File Usage Check
*Each file must be checked for imports to detect dead code*
- **Check imports**: Search for `import.*from.*filename`
- **Check routes**: Verify if referenced in App.tsx or router
- **Check exports**: See if exported functions are used elsewhere
- **Check navigation**: Find if any page navigates to it (`history.push`, `<Link>`)
- **Dead branches**: Identify unreachable pages (no route, no navigation to them)

---

## PAGES (Main Routes)
- [x] `[F001]` `src/pages/Home.tsx` - Needs UserDataService, error handling
- [x] `[F002]` `src/pages/Profile.tsx` - Good pattern, minor issues
- [x] `[F003]` `src/pages/Friends.tsx` - Needs pagination, search fixes
- [x] `[F004]` `src/pages/MatchHistory.tsx` - Heavy queries, needs pagination
- [x] `[F005]` `src/pages/Stats.tsx` - All hardcoded data, navigation to HoleStats
- [x] `[F006]` `src/pages/HoleStats.tsx` - Uses useHoleStats hook, complex calculations
- [x] `[F007]` `src/pages/Tournaments.tsx` - Hardcoded data, stats calculations
- [x] `[F008]` `src/pages/FriendProfile.tsx` - Complex stats, friend games queries
- [✓] `[F009]` `src/pages/Login.tsx` - Auth only, no data issues
- [✓] `[F010]` `src/pages/Signup.tsx` - Auth only, no data issues
- [✓] `[F011]` `src/pages/ConfigError.tsx` - Static page
- [x] `[F012]` `src/pages/TestCompletedScorecard.tsx` - Test page with hardcoded data

## GAME COMPONENTS
- [x] `[F013]` `src/features/normal-game/components/Leaderboard.tsx` - NEEDS PAGE SECTION
- [x] `[F014]` `src/features/normal-game/components/CompletedLeaderboard.tsx` - NEEDS PAGE SECTION
- [x] `[F015]` `src/features/normal-game/components/GameSummary.tsx` - Complex handicap calcs, needs cleanup
- [x] `[F016]` `src/features/normal-game/components/LiveGame.tsx` - Active game management, needs data cleanup
- [x] `[F017]` `src/features/normal-game/components/ViewCompletedGame.tsx` - Debug logging, name fallbacks
- [x] `[F018]` `src/features/normal-game/components/CreateGameCustom.tsx` - Hardcoded game types
- [x] `[F019]` `src/features/normal-game/components/PlayerConfiguration.tsx`
- [x] `[F020]` `src/features/normal-game/components/AddParticipants.tsx`
- [x] `[F021]` `src/features/normal-game/components/GhostConfig.tsx`
- [x] `[F022]` `src/features/normal-game/components/CourseSelector.tsx`
- [x] `[F023]` `src/features/normal-game/components/TeeSelector.tsx`
- [x] `[F024]` `src/features/normal-game/components/HoleEntry.tsx`
- [x] `[F025]` `src/features/normal-game/components/LiveMatchCard.tsx`

## SERVICES (Data Layer)
- [x] `[F026]` `src/features/normal-game/services/gameService.ts` - NEEDS PAGE SECTION
- [x] `[F027]` `src/services/data/DataService.ts`
- [x] `[F028]` `src/services/data/ProfileDataService.ts`
- [x] `[F029]` `src/services/data/GameDataService.ts`
- [x] `[F030]` `src/services/profileGameService.ts`
- [x] `[F031]` `src/services/sessionTrackingService.ts` - Tracks sessions to user_sessions table
- [x] `[F032]` `src/lib/friends.ts`
- [🗑️] `[F033]` `src/lib/tournaments.ts` - FILE DOESN'T EXIST

## HOOKS (Custom Hooks)
- [x] `[F034]` `src/hooks/useProfile.ts`
- [x] `[F035]` `src/hooks/useFriends.ts`
- [x] `[F036]` `src/hooks/useCourses.ts`
- [x] `[F037]` `src/hooks/useHoleStats.ts`
- [x] `[F038]` `src/hooks/useLiveGames.ts`
- [🗑️] `[F039]` `src/hooks/useRealtimeGame.ts` - FILE DOESN'T EXIST
- [🗑️] `[F040]` `src/hooks/useSwipeGesture.ts` - FILE DOESN'T EXIST

## PROFILE COMPONENTS
- [✅] `[F041]` `src/components/profile/ProfileHeader.tsx` - Redesigned with Golf X style
- [x] `[F042]` `src/components/profile/StatsGrid.tsx` - Reusable stats display component
- [🗑️] `[F043]` `src/components/profile/HandicapCard.tsx` - FILE DOESN'T EXIST
- [x] `[F044]` `src/features/profile/components/AvatarUpload.tsx` - Avatar upload with image handling
- [x] `[F045]` `src/features/profile/services/avatarService.ts`

## TOURNAMENT COMPONENTS
- [🗑️] `[F046]` `src/features/tournament/TournamentCard.tsx` - FILE DOESN'T EXIST
- [🗑️] `[F047]` `src/features/tournament/TournamentDetails.tsx` - FILE DOESN'T EXIST
- [x] `[F048]` `src/features/tournament/TournamentLeaderboard.tsx`
- [🗑️] `[F049]` `src/features/tournament/TournamentService.ts` - FILE DOESN'T EXIST

## COURSE COMPONENTS
- [x] `[F050]` `src/pages/courses/CoursesList.tsx`
- [x] `[F051]` `src/pages/courses/CourseDetail.tsx`
- [🗑️] `[F052]` `src/pages/courses/CourseScorecard.tsx` - FILE DOESN'T EXIST

## ENGINES (Business Logic)
- [x] `[F053]` `src/features/normal-game/engines/ScoringEngine.ts`
- [x] `[F054]` `src/features/normal-game/engines/HandicapEngine.ts`
- [x] `[F055]` `src/features/normal-game/engines/MatchHandicapEngine.ts`
- [x] `[F056]` `src/features/normal-game/engines/PMPEngine.ts` [PAGE 49]

## UTILITIES
- [ ] `[F057]` `src/utils/dateUtils.ts` - TO BE CREATED
- [ ] `[F058]` `src/utils/nameUtils.ts` - TO BE CREATED
- [ ] `[F059]` `src/utils/scoreUtils.ts` - TO BE CREATED
- [ ] `[F060]` `src/utils/validationUtils.ts` - TO BE CREATED

## TEST PAGES
- [x] `[F061]` `src/pages/test/ScoringEngineTest.tsx` [PAGE 50]
- [x] `[F062]` `src/pages/test/HandicapEngineTest.tsx` [PAGE 51]

---


## DEAD FILES FOUND
*Files that can be safely deleted*

### Already Deleted
- `src/features/normal-game/components/CreateGame.tsx` - Replaced by CreateGameCustom
- `src/features/normal-game/components/LiveMatchCardNew.tsx` - Unused experiment
- `src/pages/HomeNew.tsx` - Old home page design

### To Be Deleted
- [ ] Check F012 TestCompletedScorecard - possibly unused test page
- [ ] Check F061-F062 test pages - may be development only

---

## STATISTICS
- **Total Files**: 62
- **Analyzed**: 57 (91.9%)
  - With PAGE sections: 54 (all analyzed files)
  - No changes needed: 3 (F009, F010, F011)
- **Files Don't Exist**: 12 (19.4%)
  - Dead files: F033, F039, F040, F043, F046, F047, F049, F052
  - To be created: F057, F058, F059, F060
- **Not Analyzed**: 4 (6.5%)
  - F057-F060 (don't exist - TO BE CREATED)
- **Implemented**: 1 (F041)

**✅ PHASE 1 ANALYSIS COMPLETE**: 100% of existing files analyzed

*Last Updated: 2025-01-31*