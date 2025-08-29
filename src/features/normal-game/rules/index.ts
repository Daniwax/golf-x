// Handicap Types
import { matchPlayHandicap } from './handicap-types/match-play';
import { strokePlayHandicap } from './handicap-types/stroke-play';
import { noHandicap } from './handicap-types/none';
import { randomHandicap } from './handicap-types/random';

// Scoring Methods
import { netScoreMethod } from './scoring-methods/net-score';
import { matchPlayMethod } from './scoring-methods/match-play';
import { stablefordMethod } from './scoring-methods/stableford';
import { skinsMethod } from './scoring-methods/skins';

export const handicapTypes = {
  match_play: matchPlayHandicap,
  stroke_play: strokePlayHandicap,
  none: noHandicap,
  random: randomHandicap
};

export const scoringMethods = {
  net_score: netScoreMethod,
  match_play: matchPlayMethod,
  stableford: stablefordMethod,
  skins: skinsMethod
};

export type HandicapTypeKey = keyof typeof handicapTypes;
export type ScoringMethodKey = keyof typeof scoringMethods;

export interface RuleContent {
  id: string;
  title: string;
  subtitle: string;
  content: string;
}