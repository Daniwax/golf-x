# Golf Scoring Types for Tournament System

## Professional Formats (Official Names Required)

### 1. **Stroke Play** (Medal Play)
- **Official Name**: Stroke Play
- **Description**: Total strokes for entire round(s)
- **Scoring**: Lowest total wins
- **Used In**: Most PGA/LPGA events, US Open, The Open Championship

### 2. **Match Play**
- **Official Name**: Match Play
- **Description**: Hole-by-hole competition
- **Scoring**: Win/lose/tie each hole, most holes won wins match
- **Used In**: WGC Match Play, Ryder Cup, Presidents Cup

### 3. **Modified Stableford**
- **Official Name**: Modified Stableford
- **Description**: Points-based scoring system
- **Scoring**: Eagle=5, Birdie=2, Par=0, Bogey=-1, Double+=-3
- **Used In**: Barracuda Championship (PGA Tour)

### 4. **Four-Ball**
- **Official Name**: Four-Ball (NOT "Best Ball")
- **Description**: Partners play own ball, best score counts
- **Scoring**: Best score between partners on each hole
- **Used In**: Ryder Cup, Presidents Cup, Zurich Classic

### 5. **Foursomes**
- **Official Name**: Foursomes (Alternate Shot)
- **Description**: Partners alternate shots with same ball
- **Scoring**: One score per team per hole
- **Used In**: Ryder Cup, Solheim Cup

## Amateur Competition Formats

### 6. **Scramble**
- **Name**: Scramble/Captain's Choice
- **Description**: All players hit, play from best shot
- **Scoring**: Team score per hole
- **Popular**: Charity events, corporate outings

### 7. **Stableford** (Traditional)
- **Name**: Stableford
- **Description**: Points-based system with handicap
- **Scoring**: Eagle=4, Birdie=3, Par=2, Bogey=1, Double+=0
- **Popular**: Club competitions worldwide

### 8. **Texas Scramble**
- **Name**: Texas Scramble
- **Description**: Scramble with minimum drives per player
- **Scoring**: Team score with drive requirements
- **Popular**: Team tournaments

## Casual/Recreational Formats

### 9. **Skins**
- **Name**: Skins/Skins Game
- **Description**: Prize for winning hole outright
- **Scoring**: Win hole = win skin(s), ties carry over
- **Fun Factor**: Dramatic carryovers create big moments

### 10. **Nassau**
- **Name**: Nassau
- **Description**: Three bets - front 9, back 9, total 18
- **Scoring**: Three separate competitions in one round
- **Fun Factor**: Multiple chances to win

### 11. **Wolf**
- **Name**: Wolf
- **Description**: Rotating captain chooses partner or goes alone
- **Scoring**: Points based on partnerships and results
- **Fun Factor**: Strategic partnerships change each hole

### 12. **Vegas**
- **Name**: Vegas/Las Vegas
- **Description**: Team scores combined to make 2-digit number
- **Scoring**: Lower combined number wins (4&5 = 45)
- **Fun Factor**: Birdies flip opponent's score (45→54)

### 13. **Bingo Bango Bongo**
- **Name**: Bingo Bango Bongo
- **Description**: Points for first on green, closest, first in
- **Scoring**: 3 points available per hole
- **Fun Factor**: Equalizes different skill levels

### 14. **Dots/Garbage**
- **Name**: Dots (Trash/Garbage)
- **Description**: Points for various achievements
- **Scoring**: Sandies, barkies, greenies, etc.
- **Fun Factor**: Multiple ways to score beyond just strokes

### 15. **Rabbit**
- **Name**: Rabbit
- **Description**: Hold the "rabbit" at round's end to win
- **Scoring**: Take rabbit by winning hole, keep by tying
- **Fun Factor**: Momentum shifts throughout round

## Implementation for Golf X Tournament System

### Database Field: `scoring_type`

```sql
-- Professional (exact names)
'stroke_play'
'match_play'
'modified_stableford'
'four_ball'
'foursomes'

-- Amateur Competition
'scramble'
'stableford'  -- Traditional version
'texas_scramble'

-- Casual/Fun
'skins'
'nassau'
'wolf'
'vegas'
'bingo_bango_bongo'
'dots'
'rabbit'
```

### Scoring Configuration Examples

```json
// Modified Stableford
{
  "eagle_or_better": 5,
  "birdie": 2,
  "par": 0,
  "bogey": -1,
  "double_or_worse": -3
}

// Skins
{
  "skin_value": 10,
  "carry_over": true,
  "validation": "lowest_gross" // or "lowest_net"
}

// Nassau
{
  "front_nine_value": 10,
  "back_nine_value": 10,
  "total_value": 10,
  "press_allowed": true
}

// Bingo Bango Bongo
{
  "first_on": 1,
  "closest_to_pin": 1,
  "first_in": 1,
  "use_handicap": true
}
```

## Notes for Implementation

1. **Professional formats** MUST use exact official names for credibility
2. **Stroke Play** and **Match Play** are foundational - implement first
3. **Stableford** variations are popular for encouraging aggressive play
4. **Skins** and **Nassau** are most requested casual formats
5. **Team formats** (Scramble, Four-Ball) need special participant grouping
6. **Points-based** formats work well for season-long competitions
7. Consider allowing **custom point values** in scoring_config JSON