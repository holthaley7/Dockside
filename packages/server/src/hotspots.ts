// Dynamic hotspot ranking for San Diego fishing locations
// Scores each species location against current live conditions
// and generates condition-aware method recommendations

import type { CurrentConditions } from "./conditions";

// ── San Diego location knowledge base ────────────────────────────────────────

type LocationType =
  | "offshore_bank"  // deep offshore structure — trolling / yo-yo iron
  | "kelp_bed"       // kelp canopy — live bait / surface iron / dropper loops
  | "rocky_reef"     // nearshore rocky structure — dropper loops / live bait
  | "bay_harbor"     // protected bay / harbor — soaking bait / soft plastics
  | "pier"           // public pier — sabiki / bottom rigs / casting
  | "surf_beach"     // sandy surf zone — high-low rigs / spoons
  | "coastal_open";  // nearshore open coast — drift bait / jigs / kayak

interface LocationMeta {
  locationType: LocationType;
  // How exposed to wind/swell
  exposure: "protected" | "moderate" | "exposed";
  // Long offshore run required
  isOffshore: boolean;
  // How strongly tides influence fishing at this spot
  tideEffect: "high" | "moderate" | "low";
  // Kelp/structure/rocky edges — especially productive at dawn/dusk
  dawnDuskBonus: boolean;
  // Wind speed above which this spot gets uncomfortable
  maxComfortWindMph: number;
  // Boat required to access
  boatRequired: boolean;
}

const LOCATION_META: Record<string, LocationMeta> = {
  "9-Mile Bank": {
    locationType: "offshore_bank",
    exposure: "exposed", isOffshore: true, tideEffect: "moderate",
    dawnDuskBonus: false, maxComfortWindMph: 15, boatRequired: true,
  },
  "Coronado Islands": {
    locationType: "kelp_bed",
    exposure: "moderate", isOffshore: true, tideEffect: "high",
    dawnDuskBonus: true, maxComfortWindMph: 18, boatRequired: true,
  },
  "Hidden Bank (182 Spot)": {
    locationType: "offshore_bank",
    exposure: "exposed", isOffshore: true, tideEffect: "moderate",
    dawnDuskBonus: false, maxComfortWindMph: 12, boatRequired: true,
  },
  "Tanner/Cortez Banks": {
    locationType: "offshore_bank",
    exposure: "exposed", isOffshore: true, tideEffect: "low",
    dawnDuskBonus: false, maxComfortWindMph: 10, boatRequired: true,
  },
  "La Jolla Kelp Beds": {
    locationType: "kelp_bed",
    exposure: "moderate", isOffshore: false, tideEffect: "high",
    dawnDuskBonus: true, maxComfortWindMph: 22, boatRequired: false,
  },
  "Point Loma Kelp Forest": {
    locationType: "kelp_bed",
    exposure: "moderate", isOffshore: false, tideEffect: "high",
    dawnDuskBonus: true, maxComfortWindMph: 20, boatRequired: false,
  },
  "Point Loma": {
    locationType: "rocky_reef",
    exposure: "moderate", isOffshore: false, tideEffect: "high",
    dawnDuskBonus: true, maxComfortWindMph: 20, boatRequired: false,
  },
  "Shelter Island": {
    locationType: "bay_harbor",
    exposure: "protected", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: false, maxComfortWindMph: 999, boatRequired: false,
  },
  "Mission Bay": {
    locationType: "bay_harbor",
    exposure: "protected", isOffshore: false, tideEffect: "high",
    dawnDuskBonus: false, maxComfortWindMph: 999, boatRequired: false,
  },
  "San Diego Bay": {
    locationType: "bay_harbor",
    exposure: "protected", isOffshore: false, tideEffect: "high",
    dawnDuskBonus: false, maxComfortWindMph: 999, boatRequired: false,
  },
  "Ocean Beach Pier": {
    locationType: "pier",
    exposure: "moderate", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 999, boatRequired: false,
  },
  "Mission Beach": {
    locationType: "surf_beach",
    exposure: "exposed", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 20, boatRequired: false,
  },
  "La Jolla Shores": {
    locationType: "coastal_open",
    exposure: "moderate", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 25, boatRequired: false,
  },
  "Torrey Pines": {
    locationType: "coastal_open",
    exposure: "moderate", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 22, boatRequired: false,
  },
  "Silver Strand Beach": {
    locationType: "surf_beach",
    exposure: "exposed", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: false, maxComfortWindMph: 20, boatRequired: false,
  },
  "Coronado": {
    locationType: "bay_harbor",
    exposure: "protected", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: false, maxComfortWindMph: 999, boatRequired: false,
  },
  "Del Mar": {
    locationType: "coastal_open",
    exposure: "moderate", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 20, boatRequired: false,
  },
  "Oceanside": {
    locationType: "coastal_open",
    exposure: "moderate", isOffshore: false, tideEffect: "moderate",
    dawnDuskBonus: true, maxComfortWindMph: 20, boatRequired: false,
  },
};

const DEFAULT_META: LocationMeta = {
  locationType: "coastal_open",
  exposure: "moderate", isOffshore: false, tideEffect: "moderate",
  dawnDuskBonus: false, maxComfortWindMph: 20, boatRequired: false,
};

// Resolves a location name to its metadata.
// First tries an exact key match, then keyword inference — handles names like
// "Mission Beach Surf Zone" or "Point Loma Kelp Edges" that don't exactly
// match the LOCATION_META keys.
function getLocationMeta(name: string): LocationMeta {
  if (LOCATION_META[name]) return LOCATION_META[name];

  // Partial exact key match (location name contains a known key or vice-versa)
  for (const [key, meta] of Object.entries(LOCATION_META)) {
    if (name.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(name.toLowerCase())) {
      return meta;
    }
  }

  // Keyword-based type inference — so unknown locations still get real advice
  const n = name.toLowerCase();
  if (n.includes("kelp") || n.includes("canopy")) {
    return { ...DEFAULT_META, locationType: "kelp_bed", tideEffect: "high", dawnDuskBonus: true };
  }
  if (n.includes("bank") || n.includes("offshore") || n.includes("ridge") || n.includes("seamount")) {
    return { ...DEFAULT_META, locationType: "offshore_bank", isOffshore: true, exposure: "exposed", boatRequired: true, maxComfortWindMph: 15 };
  }
  if (n.includes("island") || n.includes("islands")) {
    return { ...DEFAULT_META, locationType: "kelp_bed", isOffshore: true, exposure: "moderate", boatRequired: true, tideEffect: "high", dawnDuskBonus: true };
  }
  if (n.includes("pier") || n.includes("dock") || n.includes("wharf")) {
    return { ...DEFAULT_META, locationType: "pier", exposure: "protected", maxComfortWindMph: 999 };
  }
  if (n.includes("bay") || n.includes("harbor") || n.includes("channel") || n.includes("cove") || n.includes("lagoon")) {
    return { ...DEFAULT_META, locationType: "bay_harbor", exposure: "protected", tideEffect: "high", maxComfortWindMph: 999 };
  }
  if (n.includes("surf") || n.includes("beach") || n.includes("strand") || n.includes("shore") || n.includes("wash")) {
    return { ...DEFAULT_META, locationType: "surf_beach", exposure: "exposed" };
  }
  if (n.includes("reef") || n.includes("rock") || n.includes("point") || n.includes("loma") || n.includes("rocky")) {
    return { ...DEFAULT_META, locationType: "rocky_reef", tideEffect: "high", dawnDuskBonus: true };
  }

  return DEFAULT_META;
}

// ── Condition helpers ─────────────────────────────────────────────────────────

function parseWindMph(windSpeed: string): number {
  const match = windSpeed.match(/(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

function parseTempRange(text: string): { min: number; max: number } | null {
  const match = text.match(/(\d+)\s*[-–]\s*(\d+)/);
  if (!match) return null;
  return { min: parseInt(match[1]), max: parseInt(match[2]) };
}

function isWaterTempGood(idealTemp: string, currentTempF: number | null): boolean {
  if (!currentTempF) return true;
  const range = parseTempRange(idealTemp);
  if (!range) return true;
  return currentTempF >= range.min - 3 && currentTempF <= range.max + 3;
}

function isDawnOrDusk(): boolean {
  const h = new Date().getHours();
  return (h >= 4 && h <= 8) || (h >= 16 && h <= 20);
}

function isNighttime(): boolean {
  const h = new Date().getHours();
  return h >= 20 || h <= 4;
}

function tideMatchesSpecies(idealTides: string, tideState: string): boolean {
  const ideal = idealTides.toLowerCase();
  const state = tideState.toLowerCase();
  if (ideal.includes("incoming") && state.includes("incoming")) return true;
  if (ideal.includes("outgoing") && state.includes("outgoing")) return true;
  if (ideal.includes("slack") && state.includes("slack")) return true;
  if (ideal.includes("not as particular")) return true;
  return false;
}

// ── Method recommendation engine ─────────────────────────────────────────────
// Generates actionable bait + technique + positioning advice by combining
// the species' actual bait/gear preferences with live conditions.

interface ConditionContext {
  locationType: LocationType;
  windMph: number;
  isRough: boolean;
  isCalm: boolean;
  tideState: string;
  isIncoming: boolean;
  isOutgoing: boolean;
  isSlack: boolean;
  atDawnDusk: boolean;
  atNight: boolean;
  currentTempF: number | null;
  isWarmWater: boolean;  // >68°F
  isColdWater: boolean;  // <58°F
  // Species-specific preferences
  speciesBait: string;
  speciesGear: string;
}

// Pulls the first bait name out of a free-text bait description.
// e.g. "Sand crabs are the top bait — fresh-dug..." → "sand crabs"
function primaryBait(baitText: string): string {
  const first = baitText.split(/[—\-,.]/)[0].trim().toLowerCase();
  // Strip leading filler phrases
  return first
    .replace(/^(top bait is |top bait:|best bait is |use |try )/i, "")
    .trim();
}

// Returns "artificials work well" or "live/natural bait is the call" based on conditions
function baitConditionNote(isWarmWater: boolean, isColdWater: boolean, atNight: boolean): string {
  if (isColdWater) return "Live or natural bait significantly outperforms artificials in cold water — fish are lethargic and won't chase.";
  if (isWarmWater) return "Warm water fish are aggressive — artificials and faster retrieves are viable alongside live bait.";
  if (atNight) return "At night, scent-based baits (squid, cut mackerel, live bait) outperform lures. Glow jigs are the exception.";
  return "";
}

function buildMethodBlurb(ctx: ConditionContext): string {
  const {
    locationType, isRough, isCalm, isIncoming, isOutgoing, isSlack,
    atDawnDusk, atNight, isWarmWater, isColdWater, windMph,
    speciesBait, speciesGear,
  } = ctx;

  const topBait = primaryBait(speciesBait);
  const baitNote = baitConditionNote(isWarmWater, isColdWater, atNight);

  // Helper to append optional bait condition note
  const withBaitNote = (core: string) =>
    baitNote ? `${core} ${baitNote}` : core;

  switch (locationType) {

    case "offshore_bank": {
      const gear = speciesGear.split(".")[0]; // first sentence of gear desc
      if (isRough) return withBaitNote(
        `Rough water: skip the troll. ${topBait} on a heavy dropper loop (4–8 oz) worked vertically. Anchor up or drift slowly — keep your bait in the zone, not chasing the boat. ${gear}.`
      );
      if (isCalm && isWarmWater) return withBaitNote(
        `Flat seas and warm water: start with a surface troll (cedar plugs, feathers, chrome jigs at 6–8 knots) then switch to poppers or surface iron when you mark fish or see boils. ${topBait} on a dropper loop as your backup. ${gear}.`
      );
      if (isCalm) return withBaitNote(
        `Calm conditions: troll cedar plugs or feathers to cover water, stop on marks and yo-yo iron down. Fly-lined ${topBait} on a short leader is deadly when fish are near the surface. ${gear}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide: work the uphill (shoreward) face of the bank where bait stacks. Troll into the current first, then stop and drop ${topBait} on a dropper loop when you mark the bait school. ${gear}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide: position on the down-current edge and depth break — bait and fish both stack there. Yo-yo iron hard, or drift ${topBait} naturally with the current on a light dropper loop. ${gear}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: slow your troll to 4–5 knots, go deeper (150–250 ft). ${topBait} on a dropper loop at the thermocline edge will out-fish surface presentations. Slow down every retrieve. ${gear}.`
      );
      return withBaitNote(
        `Troll cedar plugs or feathers to locate fish, then stop on marks and yo-yo iron or drop ${topBait} on a dropper loop. ${gear}.`
      );
    }

    case "kelp_bed": {
      if (atNight) return withBaitNote(
        `Night kelp bite: ${topBait} on a dropper loop fished at the bottom of the canopy (30–80 ft). Cut squid or mackerel also work if ${topBait} isn't available. No need to fish shallow — fish are holding deep on the structure at night. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk && isCalm) return withBaitNote(
        `Prime low-light window: throw surface iron or small chrome jigs along the outer kelp edge. When the surface bite fades, switch to fly-lining ${topBait} on a short 15–20 lb fluorocarbon leader inside the canopy. No weight — let it sink naturally. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk) return withBaitNote(
        `Low-light bite with some wind: fly-line ${topBait} just inside the canopy edge under a float or on a free line. Surface iron is less effective in chop — go subsurface and let the bait do the work. ${speciesGear.split(".")[0]}.`
      );
      if (isRough) return withBaitNote(
        `${windMph} mph — surface action is blown out. Move inside the kelp away from the chop: dropper loop with ${topBait} or cut squid, fish 20–40 ft deep along the kelp wall. Heavier weight (1–2 oz) to stay down. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide pushes bait INTO the kelp — work inside pockets and edges. Fly-line ${topBait} on a short leader and let it swim naturally into the canopy. This is when fish are most aggressive; match the retrieve to the current. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide washes bait OUT of the kelp — fish the down-current outer edge and the sandy bottom just past the canopy. Fly-lined ${topBait} or a surface iron worked along the outside edge. Halibut stage on the sand here too. ${speciesGear.split(".")[0]}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: fish are deep and slow. Dropper loop with ${topBait} or cut squid near the kelp bottom (40–80 ft). Dead-stick it or move very slowly — fast presentations will be ignored. ${speciesGear.split(".")[0]}.`
      );
      if (isWarmWater) return withBaitNote(
        `Warm water — fish are active through the whole column. Surface iron, fast-retrieved jigs, or fly-lined ${topBait} all work. Hit the outer kelp edge first, then work deeper if the surface bite shuts off. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `Fly-line ${topBait} on a short fluorocarbon leader near the canopy edge. Dropper loop to the bottom if surface action is slow. ${speciesGear.split(".")[0]}.`
      );
    }

    case "rocky_reef": {
      if (atNight) return withBaitNote(
        `Night reef: ${topBait} or cut squid on a dropper loop right on the structure bottom. Use 1–2 oz to stay down in the current. Rockfish, lingcod, and calico feed hard at night — keep your bait within 5 ft of the bottom. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide: position on the up-current face of the reef. Drop ${topBait} on a dropper loop just off the bottom and let the current do the work — don't over-retrieve. Target depth breaks where structure meets sand. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide: work the down-current face and sandy pockets adjacent to rocks. ${topBait} on a slow-dragged dropper loop, or a swimbait crawled over the sand-rock transition. Calico and halibut both key on this edge. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk) return withBaitNote(
        `Low-light window: surface iron or a fast-retrieved jig along the rocky edges can produce calico and barracuda. For bottom-dwellers, drop ${topBait} on a dropper loop right into the structure. ${speciesGear.split(".")[0]}.`
      );
      if (isRough) return withBaitNote(
        `Rough conditions: heavier weight (2–4 oz) to hold bottom in the surge. ${topBait} on a short dropper loop tight to the structure — longer leaders blow around too much in current. No surface presentations. ${speciesGear.split(".")[0]}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: dead-stick ${topBait} or cut squid right on the bottom of the structure. Fish are barely moving — slow everything way down and wait. A dropper loop with no motion at all will out-fish any retrieve. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `Dropper loop with ${topBait} or cut squid just off the bottom. Work the structure edges and depth breaks — calico, rockfish, and sheephead will be stacked there. ${speciesGear.split(".")[0]}.`
      );
    }

    case "bay_harbor": {
      if (atNight) return withBaitNote(
        `Night bay: bottom-soak ${topBait} or cut squid on a Carolina rig near channel edges and drop-offs. Halibut and leopard sharks feed actively in the dark — a slow-dragged rig along the channel bottom is the proven move. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide is the prime bay window: work current seams along channel edges with ${topBait} or a soft plastic swimbait. Halibut stage at the down-current end of grass beds — drag slow. Cast perpendicular to the current and let it swing. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide: position near pilings, rocks, or grass edges as the water rises. ${topBait} under a float or on a light drop-shot. Fish push up onto the flats — work shallow first, then move deeper as it slows. ${speciesGear.split(".")[0]}.`
      );
      if (isSlack) return withBaitNote(
        `Slack tide — fish are least active. Slow way down: drop-shot ${topBait} near structure or dead-soak it on a Carolina rig on the bottom. Patience wins here; don't move the bait much. ${speciesGear.split(".")[0]}.`
      );
      if (isWarmWater) return withBaitNote(
        `Warm bay water: fish are aggressive. Soft plastic swimbaits over sand-grass transitions, or ${topBait} on a Carolina rig. Faster retrieves are viable — cover more water. ${speciesGear.split(".")[0]}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: dead-soak ${topBait} near channel edges on the bottom — don't move it. Fish are lethargic and won't chase; the bait needs to be right in front of them. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `Drift ${topBait} or a soft plastic swimbait over sand-grass transitions and channel drop-offs. Work current seams whenever the tide is moving — that's when everything bites. ${speciesGear.split(".")[0]}.`
      );
    }

    case "pier": {
      if (atNight) return withBaitNote(
        `Night pier: ${topBait} or cut squid on a bottom rig (1–2 oz sliding sinker) near the pilings. Glow sabiki rigs at mid-column also produce. Under the pier lights is prime — fish stack there at night attracted to the bait fish drawn to the light. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk) return withBaitNote(
        `First/last light: cast jigs or swimbaits off the end for mackerel and barracuda, or drop ${topBait} on a sabiki/float rig. The bite window is short — be ready and covering water immediately. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide: fish the shoreward side of the pier where bait stacks against the pilings. ${topBait} under a float or on a short dropper loop bounced around the structure. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide: move to the seaward end of the pier where the current runs strongest. ${topBait} or cut squid on a bottom rig, or jig the column vertically for bonito and mackerel working through. ${speciesGear.split(".")[0]}.`
      );
      if (isRough) return withBaitNote(
        `Rough outside but the pier is protected — take advantage. Heavier sinkers (2–4 oz) to hold bottom in the surge. ${topBait} or cut squid on a bottom rig. Fish push tight to structure in rough conditions. ${speciesGear.split(".")[0]}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: surface action is slow. Focus on the bottom with ${topBait} or cut squid on a 1–2 oz bottom rig near the pilings. Rockfish, perch, and flatfish will be holding there. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `Run a sabiki rig at mid-column to build a live bait well, then fish ${topBait} or that live bait on a sliding sinker rig near the bottom. Cast metal jigs toward the pilings for calico and bass. ${speciesGear.split(".")[0]}.`
      );
    }

    case "surf_beach": {
      const sinkerSz = isRough ? "4–6 oz pyramid sinker" : "1–2 oz pyramid sinker";
      if (atNight) return withBaitNote(
        `Night surf: ${sinkerSz} on a 2-hook high-low rig with ${topBait}. Walk the waterline slowly — corbina and halibut patrol the shallow trough actively after dark. Keep slack out of the line; bites are often subtle. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk && isIncoming) return withBaitNote(
        `Best window of the day: dawn/dusk + incoming tide. Wade to the edge of the first trough and fish ${topBait} on a ${sinkerSz} high-low rig. Cast 30–40 ft — don't overthrow. Fish are right in the wash feeding hard. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming) return withBaitNote(
        `Incoming tide: wade to the edge of the break and fish the first trough lip. ${topBait} on a ${sinkerSz} high-low rig — cast just beyond the breaker line and let it settle. Corbina and surfperch will be patrolling. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide: find the gutters and cuts where water rushes back through the beach — halibut and corbina stage in these channels. ${topBait} on a Carolina rig dragged slowly through the gut, or a soft plastic swimbait worked along the edge. ${speciesGear.split(".")[0]}.`
      );
      if (isRough) return withBaitNote(
        `Heavy surf: ${sinkerSz} is mandatory to hold bottom in the surge. Fish the trough directly behind the break — shorter casts only. ${topBait} on a high-low rig. Corbina actually feed in rough whitewater — don't leave just because it's choppy. ${speciesGear.split(".")[0]}.`
      );
      if (isCalm) return withBaitNote(
        `Calm surf — lighter presentations work. Try a 1/4–1/2 oz Carolina rig with ${topBait} for corbina, or a small swimbait dragged slowly through nearshore troughs for halibut. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `${sinkerSz} on a 2-hook high-low rig with ${topBait}. Fish the trough behind the break and work any gut or cut you can find. ${speciesGear.split(".")[0]}.`
      );
    }

    case "coastal_open": {
      if (atNight) return withBaitNote(
        `Night coastal: glow jigs or ${topBait} on a bottom rig worked slowly near the bottom. Scent-based baits dominate after dark — artificial lures are much less effective in the dark water column. ${speciesGear.split(".")[0]}.`
      );
      if (atDawnDusk && isCalm) return withBaitNote(
        `Calm low-light window: cast iron jigs or topwater lures along nearshore structure and depth transitions. Halibut hunters: drift ${topBait} slowly over sandy bottom in 20–40 ft — this is the prime window for big flatfish. ${speciesGear.split(".")[0]}.`
      );
      if (isIncoming && !isRough) return withBaitNote(
        `Incoming tide: drift ${topBait} or a swimbait over sandy bottom transitions in 15–35 ft. Fish push shallow with the rising water — don't fish too deep. Work the sand-kelp or sand-rock transition lines. ${speciesGear.split(".")[0]}.`
      );
      if (isOutgoing) return withBaitNote(
        `Outgoing tide: work the edges of nearshore drop-offs and rocky points. Drift ${topBait} naturally with the current or cast blade baits along depth transitions — fish follow bait as it washes seaward. ${speciesGear.split(".")[0]}.`
      );
      if (isRough) return withBaitNote(
        `${windMph} mph — focus on the lee side of any nearby point or structure. Heavier jigs or ${topBait} on a weighted rig to stay down. Work close to structure rather than open water. ${speciesGear.split(".")[0]}.`
      );
      if (isWarmWater) return withBaitNote(
        `Warm water: fish are active through the column. Swimbaits, slow-rolled blade baits, and ${topBait} all work. Cover sand-rock transitions at 15–40 ft — that's where the action concentrates. ${speciesGear.split(".")[0]}.`
      );
      if (isColdWater) return withBaitNote(
        `Cold water: fish are on the bottom. Slow-drag ${topBait} or a swimbait over sandy nearshore bottom — 20–40 ft is the sweet spot. Dead-stick pauses will trigger cold-water bites. ${speciesGear.split(".")[0]}.`
      );
      return withBaitNote(
        `Drift ${topBait} or a swimbait over sandy nearshore bottom in 15–40 ft. Work blade baits and depth transitions to find active halibut and bass. ${speciesGear.split(".")[0]}.`
      );
    }

    default:
      return `${topBait} on a standard bottom rig or Carolina rig, adjusted for current conditions. Check current to determine weight and position.`;
  }
}

// ── Scoring ───────────────────────────────────────────────────────────────────

export interface RankedHotspot {
  name: string;
  note: string;
  score: number;
  rating: "prime" | "good" | "fair" | "tough";
  nowBlurb: string;
  methodBlurb: string;   // condition-specific fishing method right now
  accessNote: string | null;
}

interface SpeciesConditions {
  idealTides: string;
  waterTemp: string;
  primeHour: string;
  zone: string;
  bait: string;
  gear: string;
}

export function rankHotspots(
  locations: { name: string; note: string }[],
  species: SpeciesConditions,
  conditions: CurrentConditions
): RankedHotspot[] {
  const windMph = conditions.weather ? parseWindMph(conditions.weather.windSpeed) : 0;
  const tideState = conditions.currentTideState;
  const currentTempF = conditions.waterTemp?.fahrenheit ?? null;
  const tempGood = isWaterTempGood(species.waterTemp, currentTempF);
  const tideMatch = tideMatchesSpecies(species.idealTides, tideState);
  const atDawnDusk = isDawnOrDusk();
  const atNight = isNighttime();
  const hour = new Date().getHours();

  const results: RankedHotspot[] = locations.map(({ name, note }) => {
    const meta = getLocationMeta(name);

    const isRough = windMph > meta.maxComfortWindMph;
    const isCalm = windMph < 8;
    const tideL = tideState.toLowerCase();
    const isIncoming = tideL.includes("incoming");
    const isOutgoing = tideL.includes("outgoing");
    const isSlack = tideL.includes("slack");
    const isWarmWater = currentTempF !== null && currentTempF > 68;
    const isColdWater = currentTempF !== null && currentTempF < 58;

    // ── Wind score (0–30) ─────────────────────────────────────────────────
    let windScore: number;
    let windNote = "";
    if (meta.exposure === "protected") {
      windScore = 30;
    } else {
      const ratio = windMph / meta.maxComfortWindMph;
      if (ratio <= 0.6) {
        windScore = 30;
      } else if (ratio <= 1.0) {
        windScore = Math.round(30 * (1 - (ratio - 0.6) / 0.4));
      } else {
        windScore = 0;
        windNote = meta.isOffshore
          ? `${windMph} mph winds — rough offshore crossing`
          : `${windMph} mph winds — choppy at this exposed spot`;
      }
    }

    // ── Tide score (0–25) ─────────────────────────────────────────────────
    let tideScore: number;
    let tideNote = "";
    if (meta.tideEffect === "low") {
      tideScore = 18;
    } else if (tideState === "unknown") {
      tideScore = 12;
    } else if (tideMatch) {
      tideScore = meta.tideEffect === "high" ? 25 : 18;
      tideNote = `${tideState} tide working in your favor`;
    } else {
      tideScore = meta.tideEffect === "high" ? 5 : 12;
      tideNote = `${tideState} tide — not ideal for this spot`;
    }

    // ── Time of day score (0–25) ──────────────────────────────────────────
    let timeScore: number;
    let timeNote = "";
    const primeText = species.primeHour.toLowerCase();
    const isNightSpecies = primeText.includes("night");
    const isDawnDuskSpecies =
      primeText.includes("dawn") || primeText.includes("dusk") || primeText.includes("early morning");

    if (isNightSpecies && atNight) {
      timeScore = meta.dawnDuskBonus ? 25 : 20;
      timeNote = "Night time — prime feeding window";
    } else if (isDawnDuskSpecies && atDawnDusk) {
      timeScore = meta.dawnDuskBonus ? 25 : 18;
      timeNote = meta.dawnDuskBonus
        ? "Dawn/dusk at structure — lights out bite"
        : "Dawn/dusk feeding window is open";
    } else if (meta.dawnDuskBonus && atDawnDusk) {
      timeScore = 22;
      timeNote = "Structure is hottest at low light — bite should be on";
    } else if (hour >= 6 && hour <= 18) {
      timeScore = 14;
    } else {
      timeScore = 6;
    }

    // ── Water temp score (0–20) ───────────────────────────────────────────
    let tempScore: number;
    let tempNote = "";
    if (!currentTempF) {
      tempScore = 12;
    } else if (tempGood) {
      tempScore = meta.isOffshore ? 20 : 16;
      tempNote = `${currentTempF}°F — water temp in the zone`;
    } else {
      tempScore = meta.isOffshore ? 3 : 8;
      tempNote = `${currentTempF}°F — outside ideal temp range`;
    }

    const score = Math.min(100, windScore + tideScore + timeScore + tempScore);

    let rating: "prime" | "good" | "fair" | "tough";
    if (score >= 78) rating = "prime";
    else if (score >= 55) rating = "good";
    else if (score >= 32) rating = "fair";
    else rating = "tough";

    // ── nowBlurb ──────────────────────────────────────────────────────────
    const highlights: string[] = [];
    if (timeNote) highlights.push(timeNote);
    if (tideNote && tideScore >= 18) highlights.push(tideNote);
    if (tempNote && tempScore >= 16) highlights.push(tempNote);

    const problems: string[] = [];
    if (windNote) problems.push(windNote);
    if (tideNote && tideScore < 10) problems.push(tideNote);
    if (tempNote && tempScore < 8) problems.push(tempNote);

    let nowBlurb: string;
    if (rating === "prime" || rating === "good") {
      nowBlurb = highlights.length > 0
        ? highlights.slice(0, 2).join(". ") + "."
        : "Conditions are dialed in at this spot right now.";
    } else if (rating === "fair") {
      const pos = highlights.slice(0, 1).join(". ");
      const neg = problems.slice(0, 1).join(". ");
      nowBlurb = [pos, neg].filter(Boolean).join(" But ") || "Passable conditions — worth checking.";
    } else {
      nowBlurb = problems.slice(0, 2).join(". ") || "Conditions are stacked against you here right now.";
    }

    // ── methodBlurb ───────────────────────────────────────────────────────
    const ctx: ConditionContext = {
      locationType: meta.locationType,
      windMph,
      isRough,
      isCalm,
      tideState,
      isIncoming,
      isOutgoing,
      isSlack,
      atDawnDusk,
      atNight,
      currentTempF,
      isWarmWater,
      isColdWater,
      speciesBait: species.bait,
      speciesGear: species.gear,
    };
    const methodBlurb = buildMethodBlurb(ctx);

    // ── accessNote ────────────────────────────────────────────────────────
    let accessNote: string | null = null;
    if (meta.boatRequired && meta.isOffshore && windMph > meta.maxComfortWindMph * 0.8) {
      accessNote = `Long offshore run — verify sea state before departure`;
    } else if (meta.boatRequired) {
      accessNote = "Accessible by boat (sport fishing boat or private vessel)";
    }

    return { name, note, score, rating, nowBlurb, methodBlurb, accessNote };
  });

  return results.sort((a, b) => b.score - a.score);
}
