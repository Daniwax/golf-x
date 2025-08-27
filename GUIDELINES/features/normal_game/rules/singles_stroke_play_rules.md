# Golf Handicap – Default Singles Stroke Play

This is the streamlined reference for **singles stroke play** scoring with handicaps.

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

In singles stroke play, **Playing Handicap = Course Handicap** (100% allowance).

---

## Step 3: Allocate Handicap Strokes

Each player receives strokes equal to their **Playing Handicap**, allocated hole‑by‑hole:

1. If CH ≤ 18 → assign 1 stroke on the holes with SI = 1..CH.
2. If CH > 18 → assign 1 stroke on all 18 holes, then a second stroke on SI = 1..(CH − 18).
   Continue looping if CH > 36.

Example:

* Player with CH = 12 → 1 stroke on SI 1–12.
* Player with CH = 22 → 1 stroke on all 18 holes, plus an extra stroke on SI 1–4.

---

## Step 4: Hole Scoring

* **Gross Score** = actual strokes taken on a hole.
* **Net Score** = Gross Score − allocated handicap strokes for that hole.

---

## Step 5: Round Scoring

1. Add up **gross scores** for all 18 holes → **Gross Total**.
2. Add up **net scores** for all 18 holes → **Net Total**.
3. The winner is the player with the **lowest Net Total**.

---

## Example

**Inputs**

* Player A: HI = 10.3 → CH ≈ 10
* Player B: HI = 22.5 → CH ≈ 23

**Allocation**

* A gets 1 stroke on SI 1–10.
* B gets 1 stroke on every hole, plus an extra stroke on SI 1–5.

**Scoring**

* Hole 1 (SI = 1): Gross A = 5, Gross B = 6

  * A’s Net = 5 − 1 = 4
  * B’s Net = 6 − 2 = 4 → hole halved on net scores

Continue for all 18 holes. Add totals; lowest net wins.

---

## Quick Checklist

1. Compute CH for each player.
2. Allocate strokes to holes via SI.
3. Record Gross per hole.
4. Apply strokes to get Net per hole.
5. Add up → lowest Net Total wins.
