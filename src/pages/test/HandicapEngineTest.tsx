import React, { useState, useEffect } from 'react';
import { MatchHandicapEngine } from '../../features/normal-game/engines/MatchHandicapEngine';
import { PMPEngine } from '../../features/normal-game/engines/PMPEngine';
import { supabase } from '../../lib/supabase';
import { getFriends, getCurrentUserId, type FriendProfile } from '../../lib/friends';
import type { Player, Hole, HandicapContext, MatchHandicapResult } from '../../features/normal-game/engines/MatchHandicapEngine';
import type { PlayerMatchPar } from '../../features/normal-game/engines/PMPEngine';

// Define the actual game types we support
const TEST_GAME_TYPES = {
  match_play: {
    displayName: 'Match Play',
    description: 'Classic match play with relative handicaps (100%, lowest plays off 0)'
  },
  stroke_play: {
    displayName: 'Stroke Play', 
    description: 'Tournament format with 95% handicap allowance'
  },
  none: {
    displayName: 'Scratch Golf',
    description: 'No handicap - pure skill competition'
  },
  random: {
    displayName: 'Lucky Draw',
    description: 'Fair handicaps (95%) with controlled random distribution'
  },
  ghost: {
    displayName: 'Ghost Mode',
    description: 'Compete against best historical rounds'
  }
};

const HandicapEngineTest: React.FC = () => {
  // Test Configuration State
  const [handicapType, setHandicapType] = useState('match_play');
  const [courseId, setCourseId] = useState<number>(1);
  const [teeBoxId, setTeeBoxId] = useState<number>(1);
  const [selectedFriendId, setSelectedFriendId] = useState<string>('');
  const [selectedGhostType, setSelectedGhostType] = useState<'personal_best' | 'friend_best' | 'course_record'>('personal_best');
  const [numberOfHoles, setNumberOfHoles] = useState<number>(18);
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const [playerMatches, setPlayerMatches] = useState<any[]>([]);
  const [friendMatches, setFriendMatches] = useState<any[]>([]);
  
  // Available Data
  const [courses, setCourses] = useState<any[]>([]);
  const [teeBoxes, setTeeBoxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // User and Friends Management
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<Player | null>(null);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  const [friendsData, setFriendsData] = useState<Map<string, Player>>(new Map());
  const [matchCounts, setMatchCounts] = useState<Map<string, number>>(new Map());
  
  // Players for test (current user + selected friends)
  const [testPlayers, setTestPlayers] = useState<Player[]>([]);
  
  // Test Results
  const [matchHandicapResults, setMatchHandicapResults] = useState<MatchHandicapResult[]>([]);
  const [pmpResults, setPmpResults] = useState<Map<string, PlayerMatchPar[]>>(new Map());
  const [error, setError] = useState<string>('');
  
  // Preview Results (for showing before running test)
  const [previewMatchHandicaps, setPreviewMatchHandicaps] = useState<MatchHandicapResult[]>([]);
  const [previewPmpResults, setPreviewPmpResults] = useState<Map<string, PlayerMatchPar[]>>(new Map());
  
  // Course Holes - will be loaded from database
  const [courseHoles, setCourseHoles] = useState<Hole[]>([]);
  
  // Default test holes (fallback if database load fails)
  const defaultTestHoles: Hole[] = Array.from({ length: 18 }, (_, i) => ({
    holeNumber: i + 1,
    par: [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][i],
    strokeIndex: [7, 11, 15, 1, 9, 5, 17, 3, 13, 8, 12, 16, 2, 10, 6, 18, 4, 14][i]
  }));
  
  const [testHoles, setTestHoles] = useState<Hole[]>(defaultTestHoles);
  
  // Load initial data
  useEffect(() => {
    loadTestData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update handicaps when tee box changes
  useEffect(() => {
    if (teeBoxes.length > 0 && currentUser) {
      const selectedTee = teeBoxes.find(t => t.id === teeBoxId);
      const selectedCourse = courses.find(c => c.id === courseId);
      if (selectedTee && selectedCourse) {
        // Update current user's handicap
        calculateRealHandicaps([currentUser], selectedTee, selectedCourse.par).then(updatedPlayers => {
          if (updatedPlayers.length > 0) {
            setCurrentUser(updatedPlayers[0]);
            // Update test players with new current user data
            updateTestPlayersFromSelection();
          }
        });
        
        // Update friends' handicaps
        if (friendsData.size > 0) {
          const friendPlayers = Array.from(friendsData.values());
          calculateRealHandicaps(friendPlayers, selectedTee, selectedCourse.par).then(updatedFriends => {
            const newFriendsData = new Map<string, Player>();
            updatedFriends.forEach(friend => {
              newFriendsData.set(friend.userId, friend);
            });
            setFriendsData(newFriendsData);
            // Update test players with new friend data
            updateTestPlayersFromSelection();
          });
        }
      }
    }
  }, [teeBoxId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Update test players when friend selection changes
  useEffect(() => {
    updateTestPlayersFromSelection();
  }, [selectedFriends, currentUser, friendsData]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Load course holes when course changes
  useEffect(() => {
    if (courseId) {
      loadCourseHoles(courseId);
    }
  }, [courseId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Load match counts when tee box or friends change
  useEffect(() => {
    if (teeBoxId && friends.length > 0) {
      const friendIds = friends.map(f => f.friend_id);
      loadMatchCounts(teeBoxId, friendIds);
    }
  }, [teeBoxId, friends]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Load player matches when tee box changes and ghost mode is selected
  useEffect(() => {
    if (handicapType === 'ghost' && teeBoxId && currentUserId) {
      if (selectedGhostType === 'personal_best') {
        loadPlayerMatches(currentUserId, teeBoxId);
      } else if (selectedGhostType === 'friend_best' && selectedFriendId) {
        loadPlayerMatches(selectedFriendId, teeBoxId);
      }
    }
  }, [handicapType, teeBoxId, currentUserId, selectedGhostType, selectedFriendId]); // eslint-disable-line react-hooks/exhaustive-deps
  
  // Calculate preview when players or settings change
  useEffect(() => {
    calculatePreview();
  }, [testPlayers, handicapType, testHoles, selectedFriendId, selectedGhostType, numberOfHoles]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const loadTestData = async () => {
    setLoading(true);
    try {
      // Load current user
      const userId = await getCurrentUserId();
      if (userId) {
        setCurrentUserId(userId);
        
        // Load current user's profile
        const { data: userData } = await supabase
          .from('profiles')
          .select('id, full_name, email, handicap')
          .eq('id', userId)
          .single();
        
        if (userData) {
          const handicapIndex = userData.handicap || 15.0;
          const courseHandicap = Math.round(handicapIndex * 1.1);
          
          const currentUserPlayer: Player = {
            userId: userData.id,
            fullName: userData.full_name || userData.email || 'You',
            handicapIndex,
            courseHandicap,
            teeBoxId: 1
          };
          
          setCurrentUser(currentUserPlayer);
          setTestPlayers([currentUserPlayer]); // Current user is always in the test
        }
      }
      
      // Load friends
      const { data: friendsList, error: friendsError } = await getFriends();
      if (!friendsError && friendsList) {
        setFriends(friendsList);
        
        // Create Player objects for all friends
        const friendsMap = new Map<string, Player>();
        for (const friend of friendsList) {
          const handicapIndex = friend.handicap || 15.0;
          const courseHandicap = Math.round(handicapIndex * 1.1);
          
          friendsMap.set(friend.friend_id, {
            userId: friend.friend_id,
            fullName: friend.full_name || friend.email || 'Friend',
            handicapIndex,
            courseHandicap,
            teeBoxId: 1
          });
        }
        setFriendsData(friendsMap);
      }
      
      // Load courses
      const { data: coursesData } = await supabase
        .from('golf_courses')
        .select('id, name, par')
        .limit(10);
      if (coursesData) {
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setCourseId(coursesData[0].id);
          
          // Load tee boxes for first course
          const { data: teesData } = await supabase
            .from('tee_boxes')
            .select('*')
            .eq('course_id', coursesData[0].id)
            .order('display_order');
          if (teesData && teesData.length > 0) {
            setTeeBoxes(teesData);
            setTeeBoxId(teesData[0].id);
            
            // Update player handicaps based on actual tee data
            if (testPlayers.length > 0) {
              const updatedPlayers = await calculateRealHandicaps(testPlayers, teesData[0], coursesData[0].par);
              setTestPlayers(updatedPlayers);
            }
          }
          
          // Load holes for first course
          await loadCourseHoles(coursesData[0].id);
        }
      }
      
      // Set initial friend for ghost mode if friends exist
      if (friendsList && friendsList.length > 0) {
        setSelectedFriendId(friendsList[0].friend_id);
      }
    } catch (err) {
      console.error('Error loading test data:', err);
      setError('Failed to load test data: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  
  // Load course holes from database
  const loadCourseHoles = async (courseId: number) => {
    try {
      const { data: holesData } = await supabase
        .from('holes')
        .select('hole_number, par, stroke_index')
        .eq('course_id', courseId)
        .order('hole_number');
      
      if (holesData && holesData.length > 0) {
        const holes: Hole[] = holesData.map(h => ({
          holeNumber: h.hole_number,
          par: h.par,
          strokeIndex: h.stroke_index
        }));
        setTestHoles(holes);
        setCourseHoles(holes);
      } else {
        // Fallback to default holes
        setTestHoles(defaultTestHoles);
        setCourseHoles(defaultTestHoles);
      }
    } catch (err) {
      console.error('Error loading course holes:', err);
      setTestHoles(defaultTestHoles);
      setCourseHoles(defaultTestHoles);
    }
  };
  
  // Load player matches for ghost mode
  const loadPlayerMatches = async (userId: string, teeBoxId: number) => {
    try {
      // Query for completed games where the user played on this tee
      const { data: games, error } = await supabase
        .from('game_participants')
        .select(`
          game_id,
          games!inner (
            id,
            name,
            created_at,
            status
          )
        `)
        .eq('user_id', userId)
        .eq('tee_box_id', teeBoxId)
        .eq('games.status', 'completed')
        .order('games.created_at', { ascending: false });
      
      if (!error && games) {
        // Format matches for display
        const matches = games.map(g => ({
          id: g.game_id,
          name: g.games.name || `Game ${g.game_id}`,
          date: new Date(g.games.created_at).toLocaleDateString()
        }));
        
        if (userId === currentUserId) {
          setPlayerMatches(matches);
          // Auto-select first match if available
          if (matches.length > 0 && !selectedGameId) {
            setSelectedGameId(matches[0].id);
          }
        } else {
          setFriendMatches(matches);
          // Auto-select first match for friend
          if (matches.length > 0 && !selectedGameId) {
            setSelectedGameId(matches[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Error loading player matches:', err);
    }
  };
  
  // Load match counts for friends on selected tee
  const loadMatchCounts = async (teeBoxId: number, friendIds: string[]) => {
    try {
      if (!currentUserId || friendIds.length === 0) return;
      
      const counts = new Map<string, number>();
      
      // Add current user to the list
      const allUserIds = [currentUserId, ...friendIds];
      
      // Query for each user's match count on this tee
      for (const userId of allUserIds) {
        const { data, error } = await supabase
          .from('game_participants')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .eq('tee_box_id', teeBoxId);
        
        if (!error && data) {
          counts.set(userId, data.length);
        } else {
          counts.set(userId, 0);
        }
      }
      
      setMatchCounts(counts);
    } catch (err) {
      console.error('Error loading match counts:', err);
    }
  };
  
  // Helper function to calculate real handicaps based on tee data
  const calculateRealHandicaps = async (players: Player[], teeBox: any, coursePar: number): Promise<Player[]> => {
    return players.map(player => {
      const slopeRating = teeBox.slope_rating || 113;
      const courseRating = teeBox.course_rating || 72;
      
      // Course Handicap = HI × (Slope/113) + (CR - Par)
      const courseHandicap = Math.round(
        (player.handicapIndex * (slopeRating / 113)) + (courseRating - coursePar)
      );
      
      return {
        ...player,
        courseHandicap,
        teeBoxId: teeBox.id
      };
    });
  };
  
  // Update test players based on selection
  const updateTestPlayersFromSelection = () => {
    if (!currentUser) return;
    
    const players: Player[] = [currentUser];
    
    // Add selected friends
    selectedFriends.forEach(friendId => {
      const friendPlayer = friendsData.get(friendId);
      if (friendPlayer) {
        players.push(friendPlayer);
      }
    });
    
    setTestPlayers(players);
  };
  
  // Calculate preview of match handicaps and PMP
  const calculatePreview = async () => {
    if (testPlayers.length === 0 || testHoles.length === 0) return;
    
    try {
      // Build context
      const context: HandicapContext = {
        courseId,
        teeBoxId,
        selectedFriendId: handicapType === 'ghost' ? selectedFriendId : undefined,
        selectedGhostType: handicapType === 'ghost' ? selectedGhostType : undefined,
        selectedGameId: handicapType === 'ghost' ? selectedGameId : undefined
      };
      
      // Use selected number of holes or all holes for ghost mode
      const holesToPlay = handicapType === 'ghost' ? testHoles : testHoles.slice(0, numberOfHoles);
      
      // Calculate Match Handicaps
      const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
        testPlayers,
        handicapType,
        context
      );
      setPreviewMatchHandicaps(matchHandicaps);
      
      // Calculate PMP
      const pmpMap = PMPEngine.calculatePMP(
        matchHandicaps,
        holesToPlay,
        handicapType
      );
      setPreviewPmpResults(pmpMap);
    } catch (err) {
      console.error('Preview calculation error:', err);
    }
  };
  
  // Toggle friend selection
  const toggleFriend = (friendId: string) => {
    const newSelection = new Set(selectedFriends);
    if (newSelection.has(friendId)) {
      newSelection.delete(friendId);
    } else {
      // Max 5 friends (6 total with current user)
      if (newSelection.size < 5) {
        newSelection.add(friendId);
      }
    }
    setSelectedFriends(newSelection);
  };
  
  // Update handicap for a specific player
  const updatePlayerHandicap = (userId: string, field: 'handicapIndex' | 'courseHandicap', value: string) => {
    const numValue = parseFloat(value) || 0;
    
    if (userId === currentUserId && currentUser) {
      // Update current user
      const updatedUser = { ...currentUser };
      if (field === 'handicapIndex') {
        updatedUser.handicapIndex = numValue;
        updatedUser.courseHandicap = Math.round(numValue * 1.1);
      } else {
        updatedUser[field] = numValue;
      }
      setCurrentUser(updatedUser);
    } else if (friendsData.has(userId)) {
      // Update friend
      const friend = friendsData.get(userId)!;
      const updatedFriend = { ...friend };
      if (field === 'handicapIndex') {
        updatedFriend.handicapIndex = numValue;
        updatedFriend.courseHandicap = Math.round(numValue * 1.1);
      } else {
        updatedFriend[field] = numValue;
      }
      const newFriendsData = new Map(friendsData);
      newFriendsData.set(userId, updatedFriend);
      setFriendsData(newFriendsData);
    }
  };
  
  const runTest = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Build context
      const context: HandicapContext = {
        courseId,
        teeBoxId,
        selectedFriendId: handicapType === 'ghost' ? selectedFriendId : undefined,
        selectedGhostType: handicapType === 'ghost' ? selectedGhostType : undefined,
        selectedGameId: handicapType === 'ghost' ? selectedGameId : undefined
      };
      
      // Use selected number of holes or all holes for ghost mode
      const holesToPlay = handicapType === 'ghost' ? testHoles : testHoles.slice(0, numberOfHoles);
      
      console.log('Running test with:', { handicapType, context, players: testPlayers, holes: holesToPlay.length });
      
      // Step 1: Calculate Match Handicaps
      const matchHandicaps = await MatchHandicapEngine.calculateMatchHandicap(
        testPlayers,
        handicapType,
        context
      );
      setMatchHandicapResults(matchHandicaps);
      
      console.log('Match Handicap Results:', matchHandicaps);
      
      // Step 2: Calculate PMP
      const pmpMap = PMPEngine.calculatePMP(
        matchHandicaps,
        holesToPlay,
        handicapType
      );
      setPmpResults(pmpMap);
      
      console.log('PMP Results:', pmpMap);
    } catch (err) {
      console.error('Test error:', err);
      setError(err instanceof Error ? err.message : 'Test failed');
    } finally {
      setLoading(false);
    }
  };
  
  const gameTypeInfo = TEST_GAME_TYPES[handicapType as keyof typeof TEST_GAME_TYPES] || TEST_GAME_TYPES.match_play;
  
  return (
    <div style={{ padding: '10px', paddingBottom: '100px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#e0e0e0', minHeight: '100vh' }}>
      <h1 style={{ color: '#ffffff', marginBottom: '10px', fontSize: '24px' }}>Handicap Engine Test Page</h1>
      
      {/* Top Section - Two Columns */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        {/* Left Column - Game Configuration */}
        <div style={{ flex: '1', border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '16px' }}>Game Configuration</h3>
        
          {/* Handicap Type */}
          <div style={{ marginBottom: '10px' }}>
          <label><strong>Handicap Type:</strong></label>
          <select 
            value={handicapType} 
            onChange={e => setHandicapType(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
          >
            {Object.entries(TEST_GAME_TYPES).map(([id, info]) => (
              <option key={id} value={id}>
                {info.displayName}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: '20px', color: '#aaa' }}>
            {gameTypeInfo.description}
          </span>
        </div>
        
          {/* Number of Holes - Only for non-ghost games */}
          {handicapType !== 'ghost' && (
            <div style={{ marginBottom: '10px' }}>
              <label><strong>Number of Holes:</strong></label>
              <select 
                value={numberOfHoles} 
                onChange={e => setNumberOfHoles(Number(e.target.value))}
                style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
              >
                {[...Array(18)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {i + 1 === 1 ? 'Hole' : 'Holes'}
                  </option>
                ))}
              </select>
              <span style={{ marginLeft: '20px', color: '#aaa' }}>
                {numberOfHoles <= 9 ? 'Quick Round' : numberOfHoles === 18 ? 'Full Round' : 'Custom Round'}
              </span>
            </div>
          )}
        
          {/* Course */}
          <div style={{ marginBottom: '10px' }}>
          <label><strong>Course:</strong></label>
          <select 
            value={courseId} 
            onChange={e => setCourseId(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
          >
            {courses.map(course => (
              <option key={course.id} value={course.id}>
                {course.name} (Par {course.par})
              </option>
            ))}
          </select>
        </div>
        
          {/* Tee Box */}
          <div style={{ marginBottom: '10px' }}>
          <label><strong>Tee Box:</strong></label>
          <select 
            value={teeBoxId} 
            onChange={e => setTeeBoxId(Number(e.target.value))}
            style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
          >
            {teeBoxes.map(tee => (
              <option key={tee.id} value={tee.id}>
                {tee.color} - {tee.name}
              </option>
            ))}
          </select>
        </div>
        
          {/* Ghost Mode Options */}
          {handicapType === 'ghost' && (
          <>
            <div style={{ marginBottom: '10px' }}>
              <label><strong>Ghost Type:</strong></label>
              <select 
                value={selectedGhostType} 
                onChange={e => setSelectedGhostType(e.target.value as any)}
                style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
              >
                <option value="personal_best">Beat Your Best Round</option>
                <option value="friend_best">Chase a Friend's Best</option>
                <option value="course_record">Challenge Course Record</option>
              </select>
            </div>
            
            {selectedGhostType === 'personal_best' && (
              <div style={{ marginBottom: '10px' }}>
                <label><strong>Select Your Match:</strong></label>
                <select 
                  value={selectedGameId || ''} 
                  onChange={e => setSelectedGameId(e.target.value ? Number(e.target.value) : null)}
                  style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
                >
                  {playerMatches.length === 0 ? (
                    <option value="">No completed matches on this tee</option>
                  ) : (
                    playerMatches.map(match => (
                      <option key={match.id} value={match.id}>
                        {match.name} - {match.date}
                      </option>
                    ))
                  )}
                </select>
                <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '12px' }}>
                  ({playerMatches.length} matches found)
                </span>
              </div>
            )}
            
            {selectedGhostType === 'friend_best' && (
              <>
                <div style={{ marginBottom: '10px' }}>
                  <label><strong>Select Friend:</strong></label>
                  <select 
                    value={selectedFriendId} 
                    onChange={e => setSelectedFriendId(e.target.value)}
                    style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
                  >
                    {friends.map(friend => (
                      <option key={friend.friend_id} value={friend.friend_id}>
                        {friend.full_name || friend.email || 'Friend'}
                      </option>
                    ))}
                  </select>
                </div>
                
                {selectedFriendId && (
                  <div style={{ marginBottom: '10px' }}>
                    <label><strong>Select Friend's Match:</strong></label>
                    <select 
                      value={selectedGameId || ''} 
                      onChange={e => setSelectedGameId(e.target.value ? Number(e.target.value) : null)}
                      style={{ marginLeft: '10px', padding: '5px', backgroundColor: '#fff', color: '#000', border: '1px solid #555' }}
                    >
                      {friendMatches.length === 0 ? (
                        <option value="">No completed matches on this tee</option>
                      ) : (
                        friendMatches.map(match => (
                          <option key={match.id} value={match.id}>
                            {match.name} - {match.date}
                          </option>
                        ))
                      )}
                    </select>
                    <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '12px' }}>
                      ({friendMatches.length} matches found)
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        </div>
        
        {/* Right Column - Player Selection */}
        <div style={{ flex: '1', border: '1px solid #444', padding: '15px', backgroundColor: '#2a2a2a', maxHeight: '400px', overflowY: 'auto' }}>
          <h3 style={{ color: '#ffffff', margin: '0 0 10px 0', fontSize: '16px' }}>Player Selection</h3>
        
          {/* Current User */}
          {currentUser && (
            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#1e3a4a', borderRadius: '3px', border: '1px solid #3a5a6a' }}>
              <div style={{ marginBottom: '5px', fontSize: '12px', color: '#4a9eff' }}>You (Always Playing)</div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tr>
                  <td style={{ padding: '2px', fontSize: '12px' }}><strong>{currentUser.fullName}</strong></td>
                <td style={{ padding: '5px' }}>
                  <label>HI: </label>
                  <input
                    type="number"
                    value={currentUser.handicapIndex}
                    onChange={e => updatePlayerHandicap(currentUser.userId, 'handicapIndex', e.target.value)}
                    style={{ width: '60px', marginRight: '10px', backgroundColor: '#fff', color: '#000', border: '1px solid #555', padding: '4px' }}
                  />
                </td>
                <td style={{ padding: '5px' }}>
                  <label>CH: </label>
                  <input
                    type="number"
                    value={currentUser.courseHandicap}
                    onChange={e => updatePlayerHandicap(currentUser.userId, 'courseHandicap', e.target.value)}
                    style={{ width: '60px', backgroundColor: '#fff', color: '#000', border: '1px solid #555', padding: '4px' }}
                  />
                </td>
                <td style={{ padding: '5px', textAlign: 'right' }}>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>
                    Matches on tee: <strong>{matchCounts.get(currentUser.userId) || 0}</strong>
                  </span>
                </td>
              </tr>
            </table>
          </div>
        )}
          
          {/* Friends Selection */}
          <div style={{ marginTop: '10px' }}>
            <div style={{ fontSize: '12px', color: '#4a9eff', marginBottom: '5px' }}>Friends ({selectedFriends.size}/5)</div>
          {friends.length === 0 ? (
            <p style={{ color: '#999', padding: '20px', textAlign: 'center' }}>
              No friends available. Add friends from your profile to test with them.
            </p>
          ) : (
            <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #555', borderRadius: '5px', backgroundColor: '#1a1a1a' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#333', color: '#fff', position: 'sticky', top: 0 }}>
                    <th style={{ padding: '8px', textAlign: 'left', width: '50px' }}>Select</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Name</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '80px' }}>Matches</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '80px' }}>HI</th>
                    <th style={{ padding: '8px', textAlign: 'center', width: '80px' }}>CH</th>
                  </tr>
                </thead>
                <tbody>
                  {friends.map(friend => {
                    const friendPlayer = friendsData.get(friend.friend_id);
                    const isSelected = selectedFriends.has(friend.friend_id);
                    const isDisabled = !isSelected && selectedFriends.size >= 5;
                    
                    return (
                      <tr 
                        key={friend.friend_id}
                        style={{ 
                          backgroundColor: isSelected ? '#f0f8ff' : 'white',
                          opacity: isDisabled ? 0.5 : 1,
                          cursor: isDisabled ? 'not-allowed' : 'pointer'
                        }}
                      >
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleFriend(friend.friend_id)}
                            disabled={isDisabled}
                            style={{ cursor: isDisabled ? 'not-allowed' : 'pointer' }}
                          />
                        </td>
                        <td style={{ padding: '8px' }}>
                          {friend.full_name || friend.email || 'Friend'}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <span style={{ 
                            fontWeight: matchCounts.get(friend.friend_id) ? 'bold' : 'normal',
                            color: matchCounts.get(friend.friend_id) ? '#333' : '#999'
                          }}>
                            {matchCounts.get(friend.friend_id) || 0}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {isSelected && friendPlayer ? (
                            <input
                              type="number"
                              value={friendPlayer.handicapIndex}
                              onChange={e => updatePlayerHandicap(friend.friend_id, 'handicapIndex', e.target.value)}
                              style={{ width: '60px', backgroundColor: '#fff', color: '#000', border: '1px solid #555', padding: '2px' }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <span>{friendPlayer?.handicapIndex || '-'}</span>
                          )}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          {isSelected && friendPlayer ? (
                            <input
                              type="number"
                              value={friendPlayer.courseHandicap}
                              onChange={e => updatePlayerHandicap(friend.friend_id, 'courseHandicap', e.target.value)}
                              style={{ width: '60px', backgroundColor: '#fff', color: '#000', border: '1px solid #555', padding: '2px' }}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <span>{friendPlayer?.courseHandicap || '-'}</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        </div>
      </div>
      
      {/* Run Test Button */}
      <div style={{ border: '1px solid #444', padding: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: '#2a2a2a' }}>
        <button 
          onClick={runTest} 
          disabled={loading || testPlayers.length === 0}
          style={{ 
            padding: '12px 40px', 
            fontSize: '18px',
            backgroundColor: loading || testPlayers.length === 0 ? '#444' : '#28a745',
            color: 'white',
            border: 'none',
            cursor: loading || testPlayers.length === 0 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            width: '100%'
          }}
        >
          {loading ? 'RUNNING ENGINE...' : testPlayers.length === 0 ? 'SELECT PLAYERS FIRST' : 'RUN FULL ENGINE TEST'}
        </button>
        
        {error && (
          <div style={{ color: '#ff6b6b', marginTop: '10px', padding: '10px', backgroundColor: '#3a1a1a', border: '1px solid #ff6b6b' }}>
            ERROR: {error}
          </div>
        )}
      </div>
      
      {/* Handicap Breakdown Table - Shows all transformations */}
      {pmpResults.size > 0 && testPlayers.length > 0 && (
        <div style={{ border: '1px solid #444', padding: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: '#2a2a2a' }}>
          <h2 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px' }}>Handicap Calculation Breakdown</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a' }}>
              <thead>
                <tr style={{ backgroundColor: '#333' }}>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'left' }}>Player</th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>HI<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Handicap Index</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>CH<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Course HC</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>Allowance<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Format %</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>After %<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>CH × %</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>Relative<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Adjustment</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>MH (18)<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Match HC</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>Holes<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Playing</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>Match Par<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Sum of Pars</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center' }}>Factor<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>n/18</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', backgroundColor: '#2a4a5a' }}>Adj MH<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Final</span></th>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', backgroundColor: '#2a4a5a' }}>PMP Total<br/><span style={{ fontSize: '10px', opacity: 0.7 }}>Sum</span></th>
                </tr>
              </thead>
              <tbody>
                {Array.from(pmpResults.keys()).map((userId, idx) => {
                  const player = matchHandicapResults.find(r => r.userId === userId);
                  const testPlayer = testPlayers.find(p => p.userId === userId);
                  const pmps = pmpResults.get(userId) || [];
                  const totalPMP = pmps.reduce((sum, pmp) => sum + pmp.playerMatchPar, 0);
                  const holesPlayed = pmps.length;
                  const adjustedMH = Math.round((player?.matchHandicap || 0) * (holesPlayed / 18));
                  // Calculate Match Par (sum of pars for holes being played)
                  const matchPar = pmps.reduce((sum, pmp) => sum + pmp.holePar, 0);
                  
                  // Determine allowance and relative adjustment based on handicap type
                  let allowance = '100%';
                  let afterAllowance = testPlayer?.courseHandicap || 0;
                  let relativeAdj = 0;
                  let isRelative = false;
                  
                  if (handicapType === 'stroke_play') {
                    allowance = '95%';
                    afterAllowance = Math.round((testPlayer?.courseHandicap || 0) * 0.95);
                  } else if (handicapType === 'none') {
                    allowance = '0%';
                    afterAllowance = 0;
                  } else if (handicapType === 'random') {
                    allowance = '95%';
                    afterAllowance = Math.round((testPlayer?.courseHandicap || 0) * 0.95);
                  } else if (handicapType === 'match_play') {
                    // Match play uses relative adjustment
                    isRelative = true;
                    const lowestCH = Math.min(...testPlayers.map(p => p.courseHandicap));
                    relativeAdj = -lowestCH;
                  }
                  
                  return (
                    <tr key={userId} style={{ backgroundColor: idx % 2 === 0 ? '#1a1a1a' : '#222' }}>
                      <td style={{ border: '1px solid #555', padding: '8px', color: player?.isGhost ? '#4af' : '#e0e0e0', fontWeight: 'bold' }}>
                        {player?.fullName || userId}
                        {player?.isGhost && ' 👻'}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {testPlayer?.handicapIndex.toFixed(1)}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {testPlayer?.courseHandicap}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {allowance}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {afterAllowance}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {isRelative ? relativeAdj : '-'}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#4af', textAlign: 'center', fontWeight: 'bold' }}>
                        {player?.matchHandicap || 0}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center' }}>
                        {holesPlayed}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#e0e0e0', textAlign: 'center', fontWeight: 'bold' }}>
                        {matchPar}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#999', textAlign: 'center', fontSize: '12px' }}>
                        {holesPlayed}/18
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#4af', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#2a3a4a', fontSize: '16px' }}>
                        {adjustedMH}
                      </td>
                      <td style={{ border: '1px solid #555', padding: '8px', color: '#4af', textAlign: 'center', fontWeight: 'bold', backgroundColor: '#2a3a4a', fontSize: '16px' }}>
                        {totalPMP}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            <strong>Formula Path:</strong> HI → CH (slope/rating) → Allowance % → {handicapType === 'match_play' ? 'Relative Adj' : 'No Relative'} → MH → Holes/Match Par → Factor (n/18) → Adjusted MH → PMP Distribution
          </div>
        </div>
      )}

      {/* Results Scorecard - Shows After Running Engine */}
      {pmpResults.size > 0 && testPlayers.length > 0 && (
        <div style={{ border: '1px solid #444', padding: '15px', marginTop: '10px', marginBottom: '10px', backgroundColor: '#2a2a2a' }}>
          <h2 style={{ color: '#ffffff', fontSize: '18px', marginBottom: '10px' }}>Player Match Par (PMP) Scorecard</h2>
          <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#1a1a1a', borderRadius: '3px', border: '1px solid #555' }}>
            <span style={{ color: '#e0e0e0', fontSize: '13px' }}>
              <strong>Game:</strong> {TEST_GAME_TYPES[handicapType as keyof typeof TEST_GAME_TYPES]?.displayName || handicapType}
              {' | '}
              <strong>Players:</strong> {testPlayers.length}
              {' | '}
              <strong>Method:</strong> {
                handicapType === 'random' ? 'Random' :
                handicapType === 'ghost' ? 'SI + Historical' :
                handicapType === 'none' ? 'None' : 'Stroke Index'
              }
              {' | '}
              <strong>Holes:</strong> {Array.from(pmpResults.values())[0]?.length || 0}
            </span>
          </div>
          
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1a1a1a' }}>
              <thead>
                {/* Header row with hole numbers */}
                <tr style={{ backgroundColor: '#333' }}>
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'left', minWidth: '150px', position: 'sticky', left: 0, backgroundColor: '#333', zIndex: 10 }}>Player</th>
                  {Array.from(pmpResults.values())[0]?.map((_, idx) => {
                    const hole = testHoles[idx];
                    return hole ? (
                      <th key={idx} style={{ border: '1px solid #555', padding: '8px', color: '#fff', textAlign: 'center', minWidth: '40px' }}>
                        {hole.holeNumber}
                      </th>
                    ) : null;
                  })}
                  <th style={{ border: '1px solid #555', padding: '10px', color: '#fff', textAlign: 'center', backgroundColor: '#2a4a5a', minWidth: '60px' }}>Total</th>
                </tr>
                {/* Par row */}
                <tr style={{ backgroundColor: '#2a2a2a' }}>
                  <td style={{ border: '1px solid #555', padding: '6px', color: '#999', fontSize: '12px', position: 'sticky', left: 0, backgroundColor: '#2a2a2a' }}>Par</td>
                  {Array.from(pmpResults.values())[0]?.map((_, idx) => {
                    const hole = testHoles[idx];
                    return hole ? (
                      <td key={idx} style={{ border: '1px solid #555', padding: '6px', color: '#999', textAlign: 'center', fontSize: '12px' }}>
                        {hole.par}
                      </td>
                    ) : null;
                  })}
                  <td style={{ border: '1px solid #555', padding: '6px', color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>
                    {testHoles.slice(0, Array.from(pmpResults.values())[0]?.length || 0).reduce((sum, h) => sum + h.par, 0)}
                  </td>
                </tr>
                {/* SI row */}
                <tr style={{ backgroundColor: '#2a2a2a' }}>
                  <td style={{ border: '1px solid #555', padding: '6px', color: '#999', fontSize: '12px', position: 'sticky', left: 0, backgroundColor: '#2a2a2a' }}>SI</td>
                  {Array.from(pmpResults.values())[0]?.map((_, idx) => {
                    const hole = testHoles[idx];
                    return hole ? (
                      <td key={idx} style={{ border: '1px solid #555', padding: '6px', color: '#777', textAlign: 'center', fontSize: '11px' }}>
                        {hole.strokeIndex}
                      </td>
                    ) : null;
                  })}
                  <td style={{ border: '1px solid #555', padding: '6px' }}>-</td>
                </tr>
              </thead>
              <tbody>
                {/* Player rows */}
                {Array.from(pmpResults.entries()).map(([userId, pmps], playerIdx) => {
                  const player = matchHandicapResults.find(r => r.userId === userId);
                  const totalPMP = pmps.reduce((sum, pmp) => sum + pmp.playerMatchPar, 0);
                  const totalStrokes = pmps.reduce((sum, pmp) => sum + pmp.strokesReceived, 0);
                  const adjustedMH = Math.round((player?.matchHandicap || 0) * (pmps.length / 18));
                  
                  return (
                    <tr key={userId} style={{ backgroundColor: playerIdx % 2 === 0 ? '#1a1a1a' : '#222' }}>
                      <td style={{ 
                        border: '1px solid #555', 
                        padding: '8px', 
                        color: player?.isGhost ? '#4af' : '#e0e0e0',
                        fontWeight: 'bold',
                        position: 'sticky',
                        left: 0,
                        backgroundColor: playerIdx % 2 === 0 ? '#1a1a1a' : '#222',
                        zIndex: 5
                      }}>
                        {player?.fullName || userId}
                        {player?.isGhost && ' 👻'}
                        <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px' }}>
                          (Adj MH: {adjustedMH})
                        </span>
                      </td>
                      {pmps.map((pmp, holeIdx) => (
                        <td 
                          key={holeIdx}
                          style={{ 
                            border: '1px solid #555',
                            padding: '6px', 
                            textAlign: 'center',
                            backgroundColor: pmp.strokesReceived > 0 ? 
                              (pmp.strokesReceived === 1 ? '#2a4a5a' : 
                               pmp.strokesReceived === 2 ? '#3a5a6a' : '#4a6a7a') : 
                              (playerIdx % 2 === 0 ? '#1a1a1a' : '#222'),
                            fontWeight: pmp.strokesReceived > 0 ? 'bold' : 'normal',
                            color: pmp.strokesReceived > 0 ? '#4af' : '#e0e0e0',
                            fontSize: '13px'
                          }}
                        >
                          {pmp.playerMatchPar}
                          {pmp.strokesReceived > 1 && (
                            <sup style={{ fontSize: '9px', color: '#6cf' }}>+{pmp.strokesReceived}</sup>
                          )}
                        </td>
                      ))}
                      <td style={{ 
                        border: '1px solid #555', 
                        padding: '8px', 
                        textAlign: 'center',
                        backgroundColor: '#2a3a4a',
                        color: '#4af',
                        fontWeight: 'bold',
                        fontSize: '15px'
                      }}>
                        {totalPMP}
                        {totalStrokes > 0 && (
                          <span style={{ fontSize: '10px', color: '#999', marginLeft: '4px' }}>
                            (+{totalStrokes})
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#999' }}>
            <strong>Legend:</strong> 
            <span style={{ marginLeft: '10px', padding: '2px 6px', backgroundColor: '#2a4a5a', border: '1px solid #555', color: '#4af' }}>1 stroke</span>
            <span style={{ marginLeft: '5px', padding: '2px 6px', backgroundColor: '#3a5a6a', border: '1px solid #555', color: '#4af' }}>2 strokes</span>
            <span style={{ marginLeft: '5px', padding: '2px 6px', backgroundColor: '#4a6a7a', border: '1px solid #555', color: '#4af' }}>3+ strokes</span>
            <span style={{ marginLeft: '10px', color: '#999' }}>Ghost Player background: #4a6a8a</span>
          </div>
        </div>
      )}
      
      
      {/* Results */}
      {matchHandicapResults.length > 0 && (
        <>
          {/* Match Handicap Results */}
          <div style={{ border: '1px solid #444', padding: '20px', marginBottom: '20px', backgroundColor: '#2a2a2a' }}>
            <h2 style={{ color: '#ffffff' }}>Match Handicap Results</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Player</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Course HC</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Match HC</th>
                  <th style={{ border: '1px solid #000', padding: '5px' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {matchHandicapResults.map(result => (
                  <tr key={result.userId}>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px' }}>
                      {result.fullName || result.userId}
                      {result.isGhost && ' [GHOST]'}
                    </td>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', textAlign: 'center' }}>
                      {testPlayers.find(p => p.userId === result.userId)?.courseHandicap || '-'}
                    </td>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                      {result.matchHandicap}
                    </td>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', textAlign: 'center' }}>
                      {result.ghostType || 'Player'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* PMP Results */}
          <div style={{ border: '1px solid #444', padding: '20px', marginBottom: '20px', backgroundColor: '#2a2a2a' }}>
            <h2 style={{ color: '#ffffff' }}>Player Match Par (PMP) by Hole</h2>
            <div style={{ padding: '10px', backgroundColor: '#fffbf0', marginBottom: '10px' }}>
              <strong>Distribution Method: </strong>
              {handicapType === 'random' ? 'Controlled Random (Lucky Draw)' :
               handicapType === 'ghost' ? 'Stroke Index for players, Historical for ghost' :
               handicapType === 'none' ? 'No distribution (scratch)' :
               'Stroke Index (traditional)'}
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #000', padding: '5px' }}>Player</th>
                    {Array.from(pmpResults.values())[0]?.map((pmp, idx) => {
                      const hole = testHoles[idx];
                      return hole ? (
                        <th key={hole.holeNumber} style={{ border: '1px solid #000', padding: '5px', minWidth: '40px' }}>
                          H{hole.holeNumber}
                        </th>
                      ) : null;
                    })}
                    <th style={{ border: '1px solid #000', padding: '5px' }}>Total</th>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', fontWeight: 'bold' }}>Par</td>
                    {Array.from(pmpResults.values())[0]?.map((pmp, idx) => {
                      const hole = testHoles[idx];
                      return hole ? (
                        <td key={hole.holeNumber} style={{ border: '1px solid #000', padding: '5px', textAlign: 'center' }}>
                          {hole.par}
                        </td>
                      ) : null;
                    })}
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                      {Array.from(pmpResults.values())[0]?.reduce((sum, pmp, idx) => sum + (testHoles[idx]?.par || 0), 0) || 0}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px' }}>SI</td>
                    {Array.from(pmpResults.values())[0]?.map((pmp, idx) => {
                      const hole = testHoles[idx];
                      return hole ? (
                        <td key={hole.holeNumber} style={{ border: '1px solid #000', padding: '5px', textAlign: 'center', fontSize: '10px' }}>
                          {hole.strokeIndex}
                        </td>
                      ) : null;
                    })}
                    <td></td>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(pmpResults.entries()).map(([userId, pmps]) => {
                    const player = matchHandicapResults.find(r => r.userId === userId);
                    return (
                      <tr key={userId}>
                        <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px' }}>
                          {player?.fullName || userId}
                          {player?.isGhost && ' [G]'}
                        </td>
                        {pmps.map(pmp => (
                          <td 
                            key={pmp.holeNumber} 
                            style={{ 
                              border: '1px solid #000',
                              padding: '5px', 
                              textAlign: 'center',
                              backgroundColor: pmp.strokesReceived > 0 ? '#ddd' : 'white'
                            }}
                          >
                            {pmp.playerMatchPar}
                            {pmp.strokesReceived > 0 && (
                              <sup style={{ fontSize: '8px' }}>+{pmp.strokesReceived}</sup>
                            )}
                          </td>
                        ))}
                        <td style={{ border: '1px solid #555', color: '#e0e0e0', padding: '5px', textAlign: 'center', fontWeight: 'bold' }}>
                          {pmps.reduce((sum, pmp) => sum + pmp.playerMatchPar, 0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <strong>Legend:</strong> Gray cells = strokes received | [G] = Ghost Player
            </div>
          </div>
          
          {/* Debug Info */}
          <div style={{ border: '1px solid #000', padding: '20px' }}>
            <h2 style={{ color: '#ffffff' }}>Debug Information</h2>
            <pre style={{ fontSize: '11px', backgroundColor: '#f5f5f5', padding: '10px', overflow: 'auto' }}>
              {JSON.stringify({
                handicapType,
                context: {
                  courseId,
                  teeBoxId,
                  selectedFriendId,
                  selectedGhostType
                },
                matchHandicapResults,
                pmpSummary: Array.from(pmpResults.entries()).map(([userId, pmps]) => ({
                  userId,
                  totalPMP: pmps.reduce((sum, pmp) => sum + pmp.playerMatchPar, 0),
                  totalStrokes: pmps.reduce((sum, pmp) => sum + pmp.strokesReceived, 0)
                }))
              }, null, 2)}
            </pre>
          </div>
        </>
      )}
    </div>
  );
};

export default HandicapEngineTest;