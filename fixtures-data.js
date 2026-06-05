/**
 * fixtures-data.js
 * Official FIFA World Cup 2026 group stage fixtures: 12 groups × 6 matches = 72 total.
 *
 * All scheduledTime values are stored as UTC ISO strings.
 * Cairo (Egypt) = UTC+3 during June-July 2026 (EEST).
 * To display in Cairo time: add 3 hours to the UTC time shown here.
 *
 * Official tournament dates (all verified from FIFA/Wikipedia):
 *   Group stage:   June 11 – June 27, 2026
 *   Round of 32:   June 28 – July 3, 2026
 *   Round of 16:   July 4 – July 7, 2026
 *   Quarter-finals: July 9 – July 11, 2026
 *   Semi-finals:   July 14 – July 15, 2026
 *   Third Place:   July 18, 2026
 *   Final:         July 19, 2026
 *
 * Cairo display examples:
 *   Mexico vs South Africa   → June 11, 22:00 Cairo
 *   Belgium vs Egypt         → June 15, 22:00 Cairo
 *   France vs Senegal        → June 16, 22:00 Cairo
 *   Argentina vs Algeria     → June 17, 04:00 Cairo (next day)
 */

// ─── Group definitions (team order matches official FIFA draw positions) ──────
export const GROUPS_MAP = {
  A: ["Mexico", "South Africa", "South Korea", "Czechia"],
  B: ["Canada", "Bosnia", "Qatar", "Switzerland"],
  C: ["Brazil", "Morocco", "Haiti", "Scotland"],
  D: ["United States", "Paraguay", "Australia", "Türkiye"],
  E: ["Germany", "Curaçao", "Côte d'Ivoire", "Ecuador"],
  F: ["Netherlands", "Japan", "Sweden", "Tunisia"],
  G: ["Belgium", "Egypt", "Iran", "New Zealand"],
  H: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"],
  I: ["France", "Senegal", "Iraq", "Norway"],
  J: ["Argentina", "Algeria", "Austria", "Jordan"],
  K: ["Portugal", "DR Congo", "Uzbekistan", "Colombia"],
  L: ["England", "Croatia", "Ghana", "Panama"],
};

// ─── All 48 teams flat list ───────────────────────────────────────────────────
export const ALL_TEAMS = Object.values(GROUPS_MAP).flat();

// ─── All 72 group-stage fixtures (hardcoded UTC times from official FIFA schedule) ──
// Cairo display time = UTC + 3 hours
// MatchId follows group_001 … group_072, numbered by group A→L then MD1→MD3
export const GROUP_FIXTURES = [
  // ── GROUP A ─────────────────────────────────────────────────────────────────
  // MD1: June 11 (Azteca, 13:00 UTC-6 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_001",
    stage: "group",
    group: "A",
    team1: "Mexico",
    team2: "South Africa",
    scheduledTime: "2026-06-11T19:00:00.000Z",
    result: null,
  },
  // MD1: June 12 (Estadio Akron, 20:00 UTC-6 = 02:00 UTC Jun12 = 05:00 Cairo Jun12)
  {
    matchId: "group_002",
    stage: "group",
    group: "A",
    team1: "South Korea",
    team2: "Czechia",
    scheduledTime: "2026-06-12T02:00:00.000Z",
    result: null,
  },
  // MD2: June 18 (Atlanta, 12:00 UTC-4 = 16:00 UTC = 19:00 Cairo)
  {
    matchId: "group_003",
    stage: "group",
    group: "A",
    team1: "Czechia",
    team2: "South Africa",
    scheduledTime: "2026-06-18T16:00:00.000Z",
    result: null,
  },
  // MD2: June 19 (Estadio Akron, 19:00 UTC-6 = 01:00 UTC Jun19 = 04:00 Cairo Jun19)
  {
    matchId: "group_004",
    stage: "group",
    group: "A",
    team1: "Mexico",
    team2: "South Korea",
    scheduledTime: "2026-06-19T01:00:00.000Z",
    result: null,
  },
  // MD3: June 24 (simultaneous, 19:00 UTC-6 = 01:00 UTC Jun25 = 04:00 Cairo Jun25)
  {
    matchId: "group_005",
    stage: "group",
    group: "A",
    team1: "Czechia",
    team2: "Mexico",
    scheduledTime: "2026-06-25T01:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_006",
    stage: "group",
    group: "A",
    team1: "South Africa",
    team2: "South Korea",
    scheduledTime: "2026-06-25T01:00:00.000Z",
    result: null,
  },

  // ── GROUP B ─────────────────────────────────────────────────────────────────
  // MD1: June 12 (BMO Field Toronto, 15:00 UTC-4 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_007",
    stage: "group",
    group: "B",
    team1: "Canada",
    team2: "Bosnia",
    scheduledTime: "2026-06-12T19:00:00.000Z",
    result: null,
  },
  // MD1: June 13 (Levi's Stadium, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_008",
    stage: "group",
    group: "B",
    team1: "Qatar",
    team2: "Switzerland",
    scheduledTime: "2026-06-13T19:00:00.000Z",
    result: null,
  },
  // MD2: June 18 (Levi's Stadium, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_009",
    stage: "group",
    group: "B",
    team1: "Switzerland",
    team2: "Bosnia",
    scheduledTime: "2026-06-18T19:00:00.000Z",
    result: null,
  },
  // MD2: June 18 (SoFi Stadium, 15:00 UTC-7 = 22:00 UTC = 01:00 Cairo Jun19)
  {
    matchId: "group_010",
    stage: "group",
    group: "B",
    team1: "Canada",
    team2: "Qatar",
    scheduledTime: "2026-06-18T22:00:00.000Z",
    result: null,
  },
  // MD3: June 24 (simultaneous, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_011",
    stage: "group",
    group: "B",
    team1: "Switzerland",
    team2: "Canada",
    scheduledTime: "2026-06-24T19:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_012",
    stage: "group",
    group: "B",
    team1: "Bosnia",
    team2: "Qatar",
    scheduledTime: "2026-06-24T19:00:00.000Z",
    result: null,
  },

  // ── GROUP C ─────────────────────────────────────────────────────────────────
  // MD1: June 13 (MetLife NJ, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun14)
  {
    matchId: "group_013",
    stage: "group",
    group: "C",
    team1: "Brazil",
    team2: "Morocco",
    scheduledTime: "2026-06-13T22:00:00.000Z",
    result: null,
  },
  // MD1: June 13 (Gillette Stadium, 21:00 UTC-4 = 01:00 UTC Jun14 = 04:00 Cairo Jun14)
  {
    matchId: "group_014",
    stage: "group",
    group: "C",
    team1: "Haiti",
    team2: "Scotland",
    scheduledTime: "2026-06-14T01:00:00.000Z",
    result: null,
  },
  // MD2: June 19 (Gillette Stadium, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun20)
  {
    matchId: "group_015",
    stage: "group",
    group: "C",
    team1: "Scotland",
    team2: "Morocco",
    scheduledTime: "2026-06-19T22:00:00.000Z",
    result: null,
  },
  // MD2: June 19 (Lincoln Financial, 20:30 UTC-4 = 00:30 UTC Jun20 = 03:30 Cairo Jun20)
  {
    matchId: "group_016",
    stage: "group",
    group: "C",
    team1: "Brazil",
    team2: "Haiti",
    scheduledTime: "2026-06-20T00:30:00.000Z",
    result: null,
  },
  // MD3: June 24 (simultaneous, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun25)
  {
    matchId: "group_017",
    stage: "group",
    group: "C",
    team1: "Scotland",
    team2: "Brazil",
    scheduledTime: "2026-06-24T22:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_018",
    stage: "group",
    group: "C",
    team1: "Morocco",
    team2: "Haiti",
    scheduledTime: "2026-06-24T22:00:00.000Z",
    result: null,
  },

  // ── GROUP D ─────────────────────────────────────────────────────────────────
  // MD1: June 12 (SoFi Stadium, 18:00 UTC-7 = 01:00 UTC Jun13 = 04:00 Cairo Jun13)
  {
    matchId: "group_019",
    stage: "group",
    group: "D",
    team1: "United States",
    team2: "Paraguay",
    scheduledTime: "2026-06-13T01:00:00.000Z",
    result: null,
  },
  // MD1: June 13 (BC Place Vancouver, 21:00 UTC-7 = 04:00 UTC Jun14 = 07:00 Cairo Jun14)
  {
    matchId: "group_020",
    stage: "group",
    group: "D",
    team1: "Australia",
    team2: "Türkiye",
    scheduledTime: "2026-06-14T04:00:00.000Z",
    result: null,
  },
  // MD2: June 19 (Lumen Field, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_021",
    stage: "group",
    group: "D",
    team1: "United States",
    team2: "Australia",
    scheduledTime: "2026-06-19T19:00:00.000Z",
    result: null,
  },
  // MD2: June 19 (Lumen Field, 20:00 UTC-7 = 03:00 UTC Jun20 = 06:00 Cairo Jun20)
  {
    matchId: "group_022",
    stage: "group",
    group: "D",
    team1: "Türkiye",
    team2: "Paraguay",
    scheduledTime: "2026-06-20T03:00:00.000Z",
    result: null,
  },
  // MD3: June 25 (simultaneous, 19:00 UTC-7 = 02:00 UTC Jun26 = 05:00 Cairo Jun26)
  {
    matchId: "group_023",
    stage: "group",
    group: "D",
    team1: "Türkiye",
    team2: "United States",
    scheduledTime: "2026-06-26T02:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_024",
    stage: "group",
    group: "D",
    team1: "Paraguay",
    team2: "Australia",
    scheduledTime: "2026-06-26T02:00:00.000Z",
    result: null,
  },

  // ── GROUP E ─────────────────────────────────────────────────────────────────
  // MD1: June 14 (NRG Houston, 12:00 UTC-5 = 17:00 UTC = 20:00 Cairo)
  {
    matchId: "group_025",
    stage: "group",
    group: "E",
    team1: "Germany",
    team2: "Curaçao",
    scheduledTime: "2026-06-14T17:00:00.000Z",
    result: null,
  },
  // MD1: June 14 (Lincoln Financial, 19:00 UTC-4 = 23:00 UTC = 02:00 Cairo Jun15)
  {
    matchId: "group_026",
    stage: "group",
    group: "E",
    team1: "Côte d'Ivoire",
    team2: "Ecuador",
    scheduledTime: "2026-06-14T23:00:00.000Z",
    result: null,
  },
  // MD2: June 20 (BMO Toronto, 16:00 UTC-4 = 20:00 UTC = 23:00 Cairo)
  {
    matchId: "group_027",
    stage: "group",
    group: "E",
    team1: "Germany",
    team2: "Côte d'Ivoire",
    scheduledTime: "2026-06-20T20:00:00.000Z",
    result: null,
  },
  // MD2: June 20 (Arrowhead KC, 19:00 UTC-5 = 00:00 UTC Jun21 = 03:00 Cairo Jun21)
  {
    matchId: "group_028",
    stage: "group",
    group: "E",
    team1: "Ecuador",
    team2: "Curaçao",
    scheduledTime: "2026-06-21T00:00:00.000Z",
    result: null,
  },
  // MD3: June 25 (simultaneous, 16:00 UTC-4 = 20:00 UTC = 23:00 Cairo)
  {
    matchId: "group_029",
    stage: "group",
    group: "E",
    team1: "Curaçao",
    team2: "Côte d'Ivoire",
    scheduledTime: "2026-06-25T20:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_030",
    stage: "group",
    group: "E",
    team1: "Ecuador",
    team2: "Germany",
    scheduledTime: "2026-06-25T20:00:00.000Z",
    result: null,
  },

  // ── GROUP F ─────────────────────────────────────────────────────────────────
  // MD1: June 14 (AT&T Stadium, 15:00 UTC-5 = 20:00 UTC = 23:00 Cairo)
  {
    matchId: "group_031",
    stage: "group",
    group: "F",
    team1: "Netherlands",
    team2: "Japan",
    scheduledTime: "2026-06-14T20:00:00.000Z",
    result: null,
  },
  // MD1: June 14 (Estadio BBVA, 20:00 UTC-6 = 02:00 UTC Jun15 = 05:00 Cairo Jun15)
  {
    matchId: "group_032",
    stage: "group",
    group: "F",
    team1: "Sweden",
    team2: "Tunisia",
    scheduledTime: "2026-06-15T02:00:00.000Z",
    result: null,
  },
  // MD2: June 20 (Estadio BBVA, 12:00 UTC-5 = 17:00 UTC = 20:00 Cairo)
  {
    matchId: "group_033",
    stage: "group",
    group: "F",
    team1: "Netherlands",
    team2: "Sweden",
    scheduledTime: "2026-06-20T17:00:00.000Z",
    result: null,
  },
  // MD2: June 20 (NRG Houston, 22:00 UTC-6 = 04:00 UTC Jun21 = 07:00 Cairo Jun21)
  {
    matchId: "group_034",
    stage: "group",
    group: "F",
    team1: "Tunisia",
    team2: "Japan",
    scheduledTime: "2026-06-21T04:00:00.000Z",
    result: null,
  },
  // MD3: June 25 (simultaneous, 18:00 UTC-5 = 23:00 UTC = 02:00 Cairo Jun26)
  {
    matchId: "group_035",
    stage: "group",
    group: "F",
    team1: "Japan",
    team2: "Sweden",
    scheduledTime: "2026-06-25T23:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_036",
    stage: "group",
    group: "F",
    team1: "Tunisia",
    team2: "Netherlands",
    scheduledTime: "2026-06-25T23:00:00.000Z",
    result: null,
  },

  // ── GROUP G ─────────────────────────────────────────────────────────────────
  // MD1: June 15 (Lumen Field, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_037",
    stage: "group",
    group: "G",
    team1: "Belgium",
    team2: "Egypt",
    scheduledTime: "2026-06-15T19:00:00.000Z",
    result: null,
  },
  // MD1: June 15 (SoFi Stadium, 18:00 UTC-7 = 01:00 UTC Jun16 = 04:00 Cairo Jun16)
  {
    matchId: "group_038",
    stage: "group",
    group: "G",
    team1: "Iran",
    team2: "New Zealand",
    scheduledTime: "2026-06-16T01:00:00.000Z",
    result: null,
  },
  // MD2: June 21 (SoFi Stadium, 12:00 UTC-7 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_039",
    stage: "group",
    group: "G",
    team1: "Belgium",
    team2: "Iran",
    scheduledTime: "2026-06-21T19:00:00.000Z",
    result: null,
  },
  // MD2: June 21 (SoFi Stadium, 18:00 UTC-7 = 01:00 UTC Jun22 = 04:00 Cairo Jun22)
  {
    matchId: "group_040",
    stage: "group",
    group: "G",
    team1: "New Zealand",
    team2: "Egypt",
    scheduledTime: "2026-06-22T01:00:00.000Z",
    result: null,
  },
  // MD3: June 26 (simultaneous, 20:00 UTC-7 = 03:00 UTC Jun27 = 06:00 Cairo Jun27)
  {
    matchId: "group_041",
    stage: "group",
    group: "G",
    team1: "Egypt",
    team2: "Iran",
    scheduledTime: "2026-06-27T03:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_042",
    stage: "group",
    group: "G",
    team1: "New Zealand",
    team2: "Belgium",
    scheduledTime: "2026-06-27T03:00:00.000Z",
    result: null,
  },

  // ── GROUP H ─────────────────────────────────────────────────────────────────
  // MD1: June 15 (Atlanta, 12:00 UTC-4 = 16:00 UTC = 19:00 Cairo)
  {
    matchId: "group_043",
    stage: "group",
    group: "H",
    team1: "Spain",
    team2: "Cape Verde",
    scheduledTime: "2026-06-15T16:00:00.000Z",
    result: null,
  },
  // MD1: June 15 (Hard Rock Miami, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun16)
  {
    matchId: "group_044",
    stage: "group",
    group: "H",
    team1: "Saudi Arabia",
    team2: "Uruguay",
    scheduledTime: "2026-06-15T22:00:00.000Z",
    result: null,
  },
  // MD2: June 21 (Hard Rock Miami, 12:00 UTC-4 = 16:00 UTC = 19:00 Cairo)
  {
    matchId: "group_045",
    stage: "group",
    group: "H",
    team1: "Spain",
    team2: "Saudi Arabia",
    scheduledTime: "2026-06-21T16:00:00.000Z",
    result: null,
  },
  // MD2: June 21 (Atlanta, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun22)
  {
    matchId: "group_046",
    stage: "group",
    group: "H",
    team1: "Uruguay",
    team2: "Cape Verde",
    scheduledTime: "2026-06-21T22:00:00.000Z",
    result: null,
  },
  // MD3: June 26 (simultaneous, 19:00 UTC-5 = 00:00 UTC Jun27 = 03:00 Cairo Jun27)
  {
    matchId: "group_047",
    stage: "group",
    group: "H",
    team1: "Cape Verde",
    team2: "Saudi Arabia",
    scheduledTime: "2026-06-27T00:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_048",
    stage: "group",
    group: "H",
    team1: "Uruguay",
    team2: "Spain",
    scheduledTime: "2026-06-27T00:00:00.000Z",
    result: null,
  },

  // ── GROUP I ─────────────────────────────────────────────────────────────────
  // MD1: June 16 (MetLife NJ, 15:00 UTC-4 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_049",
    stage: "group",
    group: "I",
    team1: "France",
    team2: "Senegal",
    scheduledTime: "2026-06-16T19:00:00.000Z",
    result: null,
  },
  // MD1: June 16 (Gillette Stadium, 18:00 UTC-4 = 22:00 UTC = 01:00 Cairo Jun17)
  {
    matchId: "group_050",
    stage: "group",
    group: "I",
    team1: "Iraq",
    team2: "Norway",
    scheduledTime: "2026-06-16T22:00:00.000Z",
    result: null,
  },
  // MD2: June 22 (Gillette Stadium, 17:00 UTC-4 = 21:00 UTC = 00:00 Cairo Jun23)
  {
    matchId: "group_051",
    stage: "group",
    group: "I",
    team1: "France",
    team2: "Iraq",
    scheduledTime: "2026-06-22T21:00:00.000Z",
    result: null,
  },
  // MD2: June 22 (Lincoln Financial, 20:00 UTC-4 = 00:00 UTC Jun23 = 03:00 Cairo Jun23)
  {
    matchId: "group_052",
    stage: "group",
    group: "I",
    team1: "Norway",
    team2: "Senegal",
    scheduledTime: "2026-06-23T00:00:00.000Z",
    result: null,
  },
  // MD3: June 26 (simultaneous, 15:00 UTC-4 = 19:00 UTC = 22:00 Cairo)
  {
    matchId: "group_053",
    stage: "group",
    group: "I",
    team1: "Norway",
    team2: "France",
    scheduledTime: "2026-06-26T19:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_054",
    stage: "group",
    group: "I",
    team1: "Senegal",
    team2: "Iraq",
    scheduledTime: "2026-06-26T19:00:00.000Z",
    result: null,
  },

  // ── GROUP J ─────────────────────────────────────────────────────────────────
  // MD1: June 16 (Arrowhead KC, 20:00 UTC-5 = 01:00 UTC Jun17 = 04:00 Cairo Jun17)
  {
    matchId: "group_055",
    stage: "group",
    group: "J",
    team1: "Argentina",
    team2: "Algeria",
    scheduledTime: "2026-06-17T01:00:00.000Z",
    result: null,
  },
  // MD1: June 16 (Levi's Stadium, 21:00 UTC-7 = 04:00 UTC Jun17 = 07:00 Cairo Jun17)
  {
    matchId: "group_056",
    stage: "group",
    group: "J",
    team1: "Austria",
    team2: "Jordan",
    scheduledTime: "2026-06-17T04:00:00.000Z",
    result: null,
  },
  // MD2: June 22 (Levi's Stadium, 12:00 UTC-5 = 17:00 UTC = 20:00 Cairo)
  {
    matchId: "group_057",
    stage: "group",
    group: "J",
    team1: "Argentina",
    team2: "Austria",
    scheduledTime: "2026-06-22T17:00:00.000Z",
    result: null,
  },
  // MD2: June 22 (AT&T Stadium, 20:00 UTC-7 = 03:00 UTC Jun23 = 06:00 Cairo Jun23)
  {
    matchId: "group_058",
    stage: "group",
    group: "J",
    team1: "Jordan",
    team2: "Algeria",
    scheduledTime: "2026-06-23T03:00:00.000Z",
    result: null,
  },
  // MD3: June 27 (simultaneous, 21:00 UTC-5 = 02:00 UTC Jun28 = 05:00 Cairo Jun28)
  {
    matchId: "group_059",
    stage: "group",
    group: "J",
    team1: "Algeria",
    team2: "Austria",
    scheduledTime: "2026-06-28T02:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_060",
    stage: "group",
    group: "J",
    team1: "Jordan",
    team2: "Argentina",
    scheduledTime: "2026-06-28T02:00:00.000Z",
    result: null,
  },

  // ── GROUP K ─────────────────────────────────────────────────────────────────
  // MD1: June 17 (NRG Houston, 12:00 UTC-5 = 17:00 UTC = 20:00 Cairo)
  {
    matchId: "group_061",
    stage: "group",
    group: "K",
    team1: "Portugal",
    team2: "DR Congo",
    scheduledTime: "2026-06-17T17:00:00.000Z",
    result: null,
  },
  // MD1: June 17 (Azteca MX, 20:00 UTC-6 = 02:00 UTC Jun18 = 05:00 Cairo Jun18)
  {
    matchId: "group_062",
    stage: "group",
    group: "K",
    team1: "Uzbekistan",
    team2: "Colombia",
    scheduledTime: "2026-06-18T02:00:00.000Z",
    result: null,
  },
  // MD2: June 23 (Azteca MX, 12:00 UTC-5 = 17:00 UTC = 20:00 Cairo)
  {
    matchId: "group_063",
    stage: "group",
    group: "K",
    team1: "Portugal",
    team2: "Uzbekistan",
    scheduledTime: "2026-06-23T17:00:00.000Z",
    result: null,
  },
  // MD2: June 23 (NRG Houston, 20:00 UTC-6 = 02:00 UTC Jun24 = 05:00 Cairo Jun24)
  {
    matchId: "group_064",
    stage: "group",
    group: "K",
    team1: "Colombia",
    team2: "DR Congo",
    scheduledTime: "2026-06-24T02:00:00.000Z",
    result: null,
  },
  // MD3: June 27 (simultaneous, 19:30 UTC-4 = 23:30 UTC = 02:30 Cairo Jun28)
  {
    matchId: "group_065",
    stage: "group",
    group: "K",
    team1: "Colombia",
    team2: "Portugal",
    scheduledTime: "2026-06-27T23:30:00.000Z",
    result: null,
  },
  {
    matchId: "group_066",
    stage: "group",
    group: "K",
    team1: "DR Congo",
    team2: "Uzbekistan",
    scheduledTime: "2026-06-27T23:30:00.000Z",
    result: null,
  },

  // ── GROUP L ─────────────────────────────────────────────────────────────────
  // MD1: June 17 (AT&T Stadium, 15:00 UTC-5 = 20:00 UTC = 23:00 Cairo)
  {
    matchId: "group_067",
    stage: "group",
    group: "L",
    team1: "England",
    team2: "Croatia",
    scheduledTime: "2026-06-17T20:00:00.000Z",
    result: null,
  },
  // MD1: June 17 (BMO Toronto, 19:00 UTC-4 = 23:00 UTC = 02:00 Cairo Jun18)
  {
    matchId: "group_068",
    stage: "group",
    group: "L",
    team1: "Ghana",
    team2: "Panama",
    scheduledTime: "2026-06-17T23:00:00.000Z",
    result: null,
  },
  // MD2: June 23 (BMO Toronto, 16:00 UTC-4 = 20:00 UTC = 23:00 Cairo)
  {
    matchId: "group_069",
    stage: "group",
    group: "L",
    team1: "England",
    team2: "Ghana",
    scheduledTime: "2026-06-23T20:00:00.000Z",
    result: null,
  },
  // MD2: June 23 (Gillette Stadium, 19:00 UTC-4 = 23:00 UTC = 02:00 Cairo Jun24)
  {
    matchId: "group_070",
    stage: "group",
    group: "L",
    team1: "Panama",
    team2: "Croatia",
    scheduledTime: "2026-06-23T23:00:00.000Z",
    result: null,
  },
  // MD3: June 27 (simultaneous, 17:00 UTC-4 = 21:00 UTC = 00:00 Cairo Jun28)
  {
    matchId: "group_071",
    stage: "group",
    group: "L",
    team1: "Panama",
    team2: "England",
    scheduledTime: "2026-06-27T21:00:00.000Z",
    result: null,
  },
  {
    matchId: "group_072",
    stage: "group",
    group: "L",
    team1: "Croatia",
    team2: "Ghana",
    scheduledTime: "2026-06-27T21:00:00.000Z",
    result: null,
  },
];
