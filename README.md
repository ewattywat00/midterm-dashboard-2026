# 2026 U.S. Midterm Elections — Interactive State Dashboard

**Live site:** https://ewattywat00.github.io/midterm-dashboard-2026/

A self-contained static site (no backend) with a touch-friendly U.S. map. Tap or click any state (or use the state buttons / dropdown under the map) to open a panel showing that state's 2026 races:

- **U.S. Senate** (incl. the Florida and Ohio special elections) and **governor** races where on the ballot
- Incumbent, party and status (running, retiring, appointed, defeated in primary)
- Major candidates with a short, neutral summary of stated positions (paraphrased, with a source link)
- Race ratings (Cook Political Report; RealClearPolitics ratings where available)
- Polling averages (RealClearPolitics as reported by Election Central; TracktheVote; Crosstab)
- Individual polls from NYT/Siena, Marist, Quinnipiac and other public pollsters, each with dates and sample
- Published third-party win probabilities (Crosstab) where they exist — labeled as such; otherwise "unavailable"
- Competitive U.S. House seats per state (Cook ratings)
- National context: generic-ballot polling (NPR/PBS/Marist, NYT/Siena, Quinnipiac, Pew Research Center) and averages

Map color = Cook rating of the state's headline race (Senate if up in 2026, else governor; gray = no Senate/governor race).

## Data
All data is in [`data/races.json`](data/races.json). **Last updated: October 6, 2026 (PT).**

Rules followed: no invented poll numbers, candidates or probabilities. Anything not found is marked unavailable. RealClearPolling/RealClearPolitics and NYT pages block automated retrieval, so RCP Senate averages are taken from Election Central's attributed RCP table (dated Oct 6, 2026) and NYT figures come from NYT/Siena releases published by the Siena Research Institute.

## Files
- `index.html` — page shell
- `assets/app.js` — map + panel logic
- `assets/style.css` — styles (mobile bottom-sheet panel; desktop side panel)
- `assets/usmap.js` — state SVG paths (U.S. Census Bureau boundaries via us-atlas, public domain; projected with d3-geo Albers USA)
- `data/races.json` — structured race, rating and polling data

Unofficial, for personal informational use.
