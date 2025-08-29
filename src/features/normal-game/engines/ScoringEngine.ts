/**
 * ScoringEngine - Calculates game standings based on different scoring methods
 * 
 * Takes a scorecard (raw scores) and calculates points/standings
 * based on the selected scoring method.
 */

import type { GameParticipant, GameHoleScore, ScoringMethod } from '../types';

export interface ScorecardData {
  participants: GameParticipant[];
  scores: GameHoleScore[];
  holes: Array<{
    hole_number: number;
    par: number;
    handicap_index: number;
  }>;
}

export interface PlayerStanding {
  userId: string;
  playerName: string;
  position: number;
  points?: number;          // For match play, stableford
  totalStrokes?: number;     // Gross score
  netScore?: number;         // For net score method
  holesWon?: number;         // For match play
  matchesWon?: number;       // For match play (1v1 comparisons)
  skinsWon?: number[];       // Holes where player won skins
  scoreDetail?: any;         // Method-specific details
}

export interface GameResults {
  method: ScoringMethod;
  standings: PlayerStanding[];
  isComplete: boolean;
  holesPlayed: number;
  totalHoles: number;
}

export class ScoringEngine {
  /**
   * Main entry point - calculates standings based on scoring method
   */
  static calculateScoring(
    scorecard: ScorecardData,
    scoringMethod: ScoringMethod
  ): GameResults {
    // Check how many holes have been played
    const holesPlayed = this.getHolesPlayed(scorecard);
    const isComplete = holesPlayed === 18;

    switch (scoringMethod) {
      case 'net_score':
        return this.netScoreScoring(scorecard, holesPlayed, isComplete);
      case 'match_play':
        return this.matchPlayScoring(scorecard, holesPlayed, isComplete);
      case 'stableford':
        return this.stablefordScoring(scorecard, holesPlayed, isComplete);
      case 'skins':
        return this.skinsScoring(scorecard, holesPlayed, isComplete);
      default:
        return this.matchPlayScoring(scorecard, holesPlayed, isComplete);
    }
  }

  /**
   * Net Score - Total strokes minus total PMP
   * Lower is better
   */
  private static netScoreScoring(
    scorecard: ScorecardData,
    holesPlayed: number,
    isComplete: boolean
  ): GameResults {
    const standings: PlayerStanding[] = [];

    scorecard.participants.forEach(participant => {
      const playerScores = scorecard.scores.filter(
        s => s.user_id === participant.user_id && s.strokes
      );

      const totalStrokes = playerScores.reduce((sum, s) => sum + (s.strokes || 0), 0);
      const netScore = playerScores.reduce((sum, s) => sum + (s.net_score || s.strokes || 0), 0);

      standings.push({
        userId: participant.user_id,
        playerName: participant.profiles?.full_name || 'Player',
        position: 0, // Will be calculated after sorting
        totalStrokes,
        netScore,
        scoreDetail: {
          frontNine: playerScores
            .filter(s => s.hole_number <= 9)
            .reduce((sum, s) => sum + (s.strokes || 0), 0),
          backNine: playerScores
            .filter(s => s.hole_number > 9)
            .reduce((sum, s) => sum + (s.strokes || 0), 0),
          putts: playerScores.reduce((sum, s) => sum + (s.putts || 0), 0)
        }
      });
    });

    // Sort by net score (lower is better)
    standings.sort((a, b) => (a.netScore || 999) - (b.netScore || 999));
    
    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return {
      method: 'net_score',
      standings,
      isComplete,
      holesPlayed,
      totalHoles: 18
    };
  }

  /**
   * Match Play - Points from hole-by-hole wins
   * Each player compares against every other player
   */
  private static matchPlayScoring(
    scorecard: ScorecardData,
    holesPlayed: number,
    isComplete: boolean
  ): GameResults {
    const standings: PlayerStanding[] = [];
    const matchResults = new Map<string, { wins: number, losses: number, halves: number }>();

    // Initialize standings
    scorecard.participants.forEach(participant => {
      matchResults.set(participant.user_id, { wins: 0, losses: 0, halves: 0 });
      standings.push({
        userId: participant.user_id,
        playerName: participant.profiles?.full_name || 'Player',
        position: 0,
        points: 0,
        holesWon: 0,
        matchesWon: 0,
        scoreDetail: {
          holesWonList: [] as number[],
          matchupResults: {} as any
        }
      });
    });

    // For each hole, compare all players
    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeScores = scorecard.scores.filter(s => s.hole_number === holeNum && s.strokes);
      
      if (holeScores.length < 2) continue; // Need at least 2 scores to compare

      // Compare each pair of players
      for (let i = 0; i < scorecard.participants.length; i++) {
        for (let j = i + 1; j < scorecard.participants.length; j++) {
          const player1 = scorecard.participants[i];
          const player2 = scorecard.participants[j];
          
          const score1 = holeScores.find(s => s.user_id === player1.user_id);
          const score2 = holeScores.find(s => s.user_id === player2.user_id);
          
          if (!score1 || !score2) continue;

          // Compare net scores (or use strokes - player_match_par if net_score not available)
          const net1 = score1.net_score ?? (score1.strokes! - (score1.player_match_par || score1.hole_par));
          const net2 = score2.net_score ?? (score2.strokes! - (score2.player_match_par || score2.hole_par));

          const standing1 = standings.find(s => s.userId === player1.user_id)!;
          const standing2 = standings.find(s => s.userId === player2.user_id)!;

          if (net1 < net2) {
            // Player 1 wins
            standing1.points! += 1;
            standing1.holesWon! += 1;
            standing1.scoreDetail.holesWonList.push(holeNum);
            matchResults.get(player1.user_id)!.wins++;
            matchResults.get(player2.user_id)!.losses++;
          } else if (net2 < net1) {
            // Player 2 wins
            standing2.points! += 1;
            standing2.holesWon! += 1;
            standing2.scoreDetail.holesWonList.push(holeNum);
            matchResults.get(player2.user_id)!.wins++;
            matchResults.get(player1.user_id)!.losses++;
          } else {
            // Halved
            standing1.points! += 0.5;
            standing2.points! += 0.5;
            matchResults.get(player1.user_id)!.halves++;
            matchResults.get(player2.user_id)!.halves++;
          }
        }
      }
    }

    // Add match results to standings
    standings.forEach(standing => {
      const results = matchResults.get(standing.userId)!;
      standing.matchesWon = results.wins;
      standing.scoreDetail.matchupResults = results;
    });

    // Sort by points (higher is better)
    standings.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return {
      method: 'match_play',
      standings,
      isComplete,
      holesPlayed,
      totalHoles: 18
    };
  }

  /**
   * Stableford - Points based on score relative to par
   * Modified Stableford scoring system
   */
  private static stablefordScoring(
    scorecard: ScorecardData,
    holesPlayed: number,
    isComplete: boolean
  ): GameResults {
    const standings: PlayerStanding[] = [];

    scorecard.participants.forEach(participant => {
      const playerScores = scorecard.scores.filter(
        s => s.user_id === participant.user_id && s.strokes
      );

      let totalPoints = 0;
      const holePoints: number[] = [];

      playerScores.forEach(score => {
        // Calculate net score vs player's personal par
        const netVsPar = score.strokes! - (score.player_match_par || score.hole_par);
        
        // Stableford points
        let points = 0;
        if (netVsPar <= -3) points = 5;      // Albatross or better
        else if (netVsPar === -2) points = 4; // Eagle
        else if (netVsPar === -1) points = 3; // Birdie
        else if (netVsPar === 0) points = 2;  // Par
        else if (netVsPar === 1) points = 1;  // Bogey
        else points = 0;                      // Double bogey or worse

        totalPoints += points;
        holePoints.push(points);
      });

      standings.push({
        userId: participant.user_id,
        playerName: participant.profiles?.full_name || 'Player',
        position: 0,
        points: totalPoints,
        totalStrokes: playerScores.reduce((sum, s) => sum + (s.strokes || 0), 0),
        scoreDetail: {
          holePoints,
          birdiesOrBetter: holePoints.filter(p => p >= 3).length,
          pars: holePoints.filter(p => p === 2).length,
          bogeys: holePoints.filter(p => p === 1).length
        }
      });
    });

    // Sort by points (higher is better)
    standings.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return {
      method: 'stableford',
      standings,
      isComplete,
      holesPlayed,
      totalHoles: 18
    };
  }

  /**
   * Skins - Winner takes all on each hole
   * If tied, skin carries over to next hole
   */
  private static skinsScoring(
    scorecard: ScorecardData,
    holesPlayed: number,
    isComplete: boolean
  ): GameResults {
    const standings: PlayerStanding[] = [];
    const skinsPot: number[] = []; // Holes with unclaimed skins
    
    // Initialize standings
    scorecard.participants.forEach(participant => {
      standings.push({
        userId: participant.user_id,
        playerName: participant.profiles?.full_name || 'Player',
        position: 0,
        points: 0,
        skinsWon: [],
        scoreDetail: {
          skinsValue: 1, // Each skin worth 1 point (could be monetary value)
          totalSkins: 0
        }
      });
    });

    let carryOver = 0; // Skins carried from previous holes

    // Process each hole
    for (let holeNum = 1; holeNum <= 18; holeNum++) {
      const holeScores = scorecard.scores.filter(
        s => s.hole_number === holeNum && s.strokes
      );
      
      if (holeScores.length < 2) {
        carryOver++; // Add to carryover if hole not played
        continue;
      }

      const skinsForHole = 1 + carryOver; // Current hole + any carryover

      // Find the best net score
      let bestScore = 999;
      let winners: string[] = [];

      holeScores.forEach(score => {
        const netScore = score.net_score ?? 
          (score.strokes! - (score.player_match_par || score.hole_handicap_strokes || 0));
        
        if (netScore < bestScore) {
          bestScore = netScore;
          winners = [score.user_id];
        } else if (netScore === bestScore) {
          winners.push(score.user_id);
        }
      });

      // Award skins
      if (winners.length === 1) {
        // Single winner takes all skins
        const winner = standings.find(s => s.userId === winners[0])!;
        winner.points! += skinsForHole;
        winner.skinsWon!.push(holeNum);
        winner.scoreDetail.totalSkins += skinsForHole;
        carryOver = 0; // Reset carryover
      } else {
        // Tied - skins carry over
        carryOver += skinsForHole;
        skinsPot.push(holeNum);
      }
    }

    // Sort by skins won (higher is better)
    standings.sort((a, b) => (b.points || 0) - (a.points || 0));
    
    // Assign positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    return {
      method: 'skins',
      standings,
      isComplete,
      holesPlayed,
      totalHoles: 18
    };
  }

  /**
   * Helper: Calculate how many holes have been played
   */
  private static getHolesPlayed(scorecard: ScorecardData): number {
    const holesWithScores = new Set<number>();
    
    scorecard.scores.forEach(score => {
      if (score.strokes && score.strokes > 0) {
        holesWithScores.add(score.hole_number);
      }
    });

    return holesWithScores.size;
  }

  /**
   * Helper: Get current leader
   */
  static getCurrentLeader(results: GameResults): PlayerStanding | null {
    return results.standings[0] || null;
  }

  /**
   * Helper: Check if there's a tie for the lead
   */
  static hasLeaderTie(results: GameResults): boolean {
    if (results.standings.length < 2) return false;
    
    const leader = results.standings[0];
    const second = results.standings[1];
    
    switch (results.method) {
      case 'net_score':
        return leader.netScore === second.netScore;
      case 'match_play':
      case 'stableford':
      case 'skins':
        return leader.points === second.points;
      default:
        return false;
    }
  }
}