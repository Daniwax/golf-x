# Golf Match Play Handicap – Default Singles Mode

This is the streamlined version for **default singles match play** (100% handicap allowance).

---

## Inputs

* **Handicap Index** (HI)
* **Slope Rating** (Slope)
* **Course Rating** (CR)
* **Par** (Par)
* **Stroke Index per hole** (SI\[1..18])

---

## Step 1: Course Handicap

$\mathrm{CH} = \mathrm{HI} \times \frac{\mathrm{Slope}}{113} + (\mathrm{CR} - \mathrm{Par})$

Round to the **nearest whole number**.

---

## Step 2: Playing Handicap

For singles match play, **Playing Handicap = Course Handicap** (100% allowance).

---

## Step 3: Match Handicap

Subtract the lowest **Playing Handicap** from all players:

$\mathrm{MatchHandicap}_i = \mathrm{PH}_i - \min_j(\mathrm{PH}_j)$

* Lowest player(s): 0 strokes
* Others: difference applied as strokes

---

## Step 4: Allocate Strokes to Holes

For a player with **S = MatchHandicap**:

1. If **S ≥ 18**, give 1 stroke on every hole and subtract 18. Repeat until **S < 18**.
2. With the remainder **S**, give 1 extra stroke on the **S hardest holes** (SI = 1..S).

Example: S = 9 → strokes on SI 1–9.
Example: S = 23 → 1 stroke on all 18 holes, plus extra on SI 1–5.

---

## Step 5: Scoring Rules (Match Play)

* Each hole is a separate contest.
* Lowest **net score** on the hole wins it.
* If net scores are equal, the hole is **halved**.
* Match result is based on holes won vs. lost.
* A match ends when one player is up more holes than remain.

---

## Example

**Inputs**

* Player A: HI = 6.2
* Player B: HI = 14.7
* Tees: Slope 132, CR 71.5, Par 72

**Course Handicaps**

* A: (6.2 × 132/113) + (71.5 − 72) ≈ 6 → **6**
* B: (14.7 × 132/113) − 0.5 ≈ 15 → **15**

**Match Handicaps**

* Lowest PH = 6 → A = 0
* B = 15 − 6 = **9**

**Allocation**

* B gets strokes on SI 1–9
* A gets none

**Scoring**

* Hole 1 (SI = 1): Gross A = 4, Gross B = 5

  * A’s Net = 4 (no strokes)
  * B’s Net = 4 (5 − 1)
  * Hole halved

Continue hole‑by‑hole until one player leads by more holes than remain.

---

## Quick Checklist

1. Compute CH.
2. PH = CH.
3. Subtract lowest to get Match Handicap.
4. Allocate strokes across holes by SI.
5. Compare net scores hole‑by‑hole.
6. Lowest net wins the hole; most holes wins the match.
