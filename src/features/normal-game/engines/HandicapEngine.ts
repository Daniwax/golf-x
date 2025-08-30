/**
 * HandicapEngine - Calculates Player Match Par (PMP) for different handicap systems
 * 
 * The engine determines how many strokes each player receives on each hole
 * based on the selected handicap type, then calculates their personal par.
 */

import type { GameParticipant, HandicapType } from '../types';
import { 
  getStrokesOnHole
} from '../utils/handicapCalculations';

export interface HoleData {
  hole_number: number;
  par: number;
  handicap_index: number; // Stroke Index (1-18, where 1 is hardest)
}

export interface PlayerMatchPar {
  userId: string;
  holeNumber: number;
  holePar: number;
  strokesReceived: number;
  playerMatchPar: number;
}

export class HandicapEngine {
  /**
   * Calculate Player Match Par for all players on all holes
   * Returns a map of userId -> array of PMPs for each hole
   */
  static calculatePlayerMatchPar(
    participants: GameParticipant[],
    holes: HoleData[],
    handicapType: HandicapType
  ): Map<string, PlayerMatchPar[]> {
    switch (handicapType) {
      case 'none':
        return this.noHandicap(participants, holes);
      case 'match_play':
        return this.matchPlayHandicap(participants, holes);
      case 'stroke_play':
        return this.strokePlayHandicap(participants, holes);
      case 'random':
        return this.randomHandicap(participants, holes);
      default:
        // Default to match play for backwards compatibility
        return this.matchPlayHandicap(participants, holes);
    }
  }

  /**
   * No Handicap - All players play to course par
   */
  private static noHandicap(
    participants: GameParticipant[],
    holes: HoleData[]
  ): Map<string, PlayerMatchPar[]> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();

    participants.forEach(participant => {
      const playerPMPs: PlayerMatchPar[] = holes.map(hole => ({
        userId: participant.user_id,
        holeNumber: hole.hole_number,
        holePar: hole.par,
        strokesReceived: 0,
        playerMatchPar: hole.par // No strokes added
      }));
      pmpMap.set(participant.user_id, playerPMPs);
    });

    return pmpMap;
  }

  /**
   * Match Play Handicap - Relative to lowest handicap player
   * Lowest handicap plays off scratch (0), others get the difference
   */
  private static matchPlayHandicap(
    participants: GameParticipant[],
    holes: HoleData[]
  ): Map<string, PlayerMatchPar[]> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();

    // Use the match_handicap that's already calculated (relative handicap)
    participants.forEach(participant => {
      const matchHandicap = participant.match_handicap || 0;
      
      const playerPMPs: PlayerMatchPar[] = holes.map(hole => {
        // Calculate strokes received on this hole based on SI
        const strokesReceived = getStrokesOnHole(
          hole.handicap_index,
          matchHandicap
        );

        return {
          userId: participant.user_id,
          holeNumber: hole.hole_number,
          holePar: hole.par,
          strokesReceived,
          playerMatchPar: hole.par + strokesReceived
        };
      });
      
      pmpMap.set(participant.user_id, playerPMPs);
    });

    return pmpMap;
  }

  /**
   * Stroke Play Handicap - Full handicap for each player
   * All players get their full course handicap strokes
   */
  private static strokePlayHandicap(
    participants: GameParticipant[],
    holes: HoleData[]
  ): Map<string, PlayerMatchPar[]> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();

    participants.forEach(participant => {
      // Use playing_handicap (full handicap, not reduced)
      const playingHandicap = participant.playing_handicap || 0;
      
      const playerPMPs: PlayerMatchPar[] = holes.map(hole => {
        // Calculate strokes received on this hole based on SI
        const strokesReceived = getStrokesOnHole(
          hole.handicap_index,
          playingHandicap
        );

        return {
          userId: participant.user_id,
          holeNumber: hole.hole_number,
          holePar: hole.par,
          strokesReceived,
          playerMatchPar: hole.par + strokesReceived
        };
      });
      
      pmpMap.set(participant.user_id, playerPMPs);
    });

    return pmpMap;
  }

  /**
   * Random Handicap - Fun mode with randomized stroke distribution
   * Each player gets their handicap strokes randomly distributed across holes
   */
  private static randomHandicap(
    participants: GameParticipant[],
    holes: HoleData[]
  ): Map<string, PlayerMatchPar[]> {
    const pmpMap = new Map<string, PlayerMatchPar[]>();

    participants.forEach(participant => {
      const totalStrokes = participant.playing_handicap || 0;
      
      // Create an array of strokes to distribute
      const strokesArray = new Array(18).fill(0);
      let remainingStrokes = totalStrokes;
      
      // Randomly distribute strokes
      while (remainingStrokes > 0) {
        const randomHole = Math.floor(Math.random() * 18);
        strokesArray[randomHole]++;
        remainingStrokes--;
      }
      
      const playerPMPs: PlayerMatchPar[] = holes.map((hole, index) => {
        const strokesReceived = strokesArray[index];
        
        return {
          userId: participant.user_id,
          holeNumber: hole.hole_number,
          holePar: hole.par,
          strokesReceived,
          playerMatchPar: hole.par + strokesReceived
        };
      });
      
      pmpMap.set(participant.user_id, playerPMPs);
    });

    return pmpMap;
  }

  /**
   * Helper: Get strokes for a specific hole for a specific player
   */
  static getPlayerStrokesForHole(
    userId: string,
    holeNumber: number,
    pmpMap: Map<string, PlayerMatchPar[]>
  ): number {
    const playerPMPs = pmpMap.get(userId);
    if (!playerPMPs) return 0;
    
    const holePMP = playerPMPs.find(pmp => pmp.holeNumber === holeNumber);
    return holePMP?.strokesReceived || 0;
  }

  /**
   * Helper: Get Player Match Par for a specific hole for a specific player
   */
  static getPlayerMatchParForHole(
    userId: string,
    holeNumber: number,
    pmpMap: Map<string, PlayerMatchPar[]>
  ): number {
    const playerPMPs = pmpMap.get(userId);
    if (!playerPMPs) return 0;
    
    const holePMP = playerPMPs.find(pmp => pmp.holeNumber === holeNumber);
    return holePMP?.playerMatchPar || holePMP?.holePar || 0;
  }
}