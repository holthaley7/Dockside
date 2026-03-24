import { PrismaClient, Zone, ScanFrequency, ScanSourceType } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const speciesData = [
  {
    name: "Bluefin Tuna",
    icon: "🐟",
    imageUrl: "https://www.fisheries.noaa.gov/s3//styles/original/s3/2022-09/640x427-Tuna-Bluefin-NOAAFisheries.png",
    color: "#1E3A5F",
    zone: Zone.OFFSHORE,
    season: "Year-round",
    peakSeason: "June - October",
    primeHour:
      "These predators often feed most aggressively at dusk and dawn, making pre-dawn departures and late-afternoon trips especially productive.",
    avgSize: "60-150 pounds",
    bagLimit: "2 fish",
    sizeLimit: "none",
    migrationPatterns:
      "They follow warm Pacific currents and bait concentrations, moving into San Diego range when water temps rise above 60°F, typically arriving in early summer and lingering through fall.",
    idealTides: "Outgoing or slack",
    idealDepths:
      'They range from the surface to deep "meter marks" shown on sonar. Surface iron and fly-line baiting work during boils, while deep drops on kite or balloon rigs target fish marked at 50–200+ feet.',
    waterTemp: "60-70 degrees F",
    bait: "The most common live baits used on private luxury boats are live sardines and mackerel, fly-lined or fished under a kite. Fluorocarbon leaders (60–130 lb) are essential, and flat-fall jigs, knife jigs, and Nomad DTX Minnows are popular artificial alternatives.",
    gear: "Standard gear consists of 40–100 lb conventional tackle, while trophy specimens (200+ lb) demand 100–130 lb stand-up rigs paired with Shimano Tiagra or Penn International reels and 200 lb fluorocarbon leaders.",
    visionAndColor:
      "These top-tier predators have exceptional vision and are highly sensitive to seeing line in the water. Using thinner, clearer fluorocarbon leader material significantly increases success.",
    filletRules:
      "Each fish must be cut into six specific pieces (four loins, the collar with pectoral fin attached, and the tail). Additionally, one pectoral fin must remain attached to the collar section of each fish for identification purposes.",
    mustKnow:
      "Regardless of the number of passengers, a vessel may not have more than 20 bluefin tuna on board at any time. As of August 2024, the daily bag limit for Pacific bluefin tuna is 2 fish per angler.",
  },
  {
    name: "Calico Bass (Kelp Bass)",
    icon: "🐠",
    imageUrl: "https://www.takemefishing.org/getmedia/2ba14bbc-ae23-43ab-9e6b-f0f47e48fdac/kelp-bass-464x170.png",
    color: "#4A7C59",
    zone: Zone.OFFSHORE,
    season: "Year-round",
    peakSeason: "May - October",
    primeHour:
      "They are most active during dawn and dusk. When using artificial lures like jerkbaits and swimbaits, the mid-morning through early afternoon window is also productive.",
    avgSize: "2–5 pounds (max size 10 pounds)",
    bagLimit: "5 fish",
    sizeLimit: '14 inches total length or 10 inches alternate length',
    migrationPatterns:
      "They remain in local waters year-round but move into shallow kelp forests to feed in warm months and retreat to deeper structure in cooler water.",
    idealTides: "Low tides for lure fishing and high tides for bait fishing",
    idealDepths:
      "Typically targeted in coastal waters at depths up to 70 feet. They reside within and around kelp canopy structures, rocky reef edges, and submerged ledges.",
    waterTemp: "60-72 degrees F",
    bait: 'Their natural diet consists of anchovies, topsmelt, señorita, and perch, making live bait the go-to method. Anglers also use swimbaits that "match the hatch" for the most natural presentation.',
    gear: "Boat-based anglers use light spinning tackle with live bait or jigging techniques near kelp and rocky structure. Shore anglers target them with swimbaits and jerkbaits cast along kelp edges.",
    visionAndColor:
      'Success often comes from using swimbaits that "match the hatch," meaning they mimic the natural forage in color, size, and action. Natural green, brown, and silver tones work best.',
    filletRules:
      "Fillets must be at least 7.5 inches long and must bear a one-inch square patch of skin for identification. Fish may be filleted at sea.",
    mustKnow:
      "Kelp bass (calico), barred sand bass, and spotted sand bass are managed under a combined 5-fish aggregate bag limit. Any combination of these three species may be taken as long as the total does not exceed 5.",
  },
  {
    name: "Mahi-Mahi (Dorado)",
    icon: "🐬",
    imageUrl: "https://www.fisheries.noaa.gov/s3//styles/original/s3/2022-08/640x427-Mahimahi-NOAAFisheries.png",
    color: "#2E8B57",
    zone: Zone.OFFSHORE,
    season: "Year-round",
    peakSeason: "July - October",
    primeHour:
      "While they are targeted during standard daylight hours, they are known to head to the surface to feed actively around dawn and dusk near floating debris and kelp paddies.",
    avgSize: "15-30 pounds",
    bagLimit: "10 fish, as part of the 20-fish general bag limit",
    sizeLimit: "none",
    migrationPatterns:
      "They are tropical migrants that push north when water temperatures hit 72°F or higher, typically arriving in San Diego waters mid-summer and peaking in early fall.",
    idealTides: "Outgoing or slack",
    idealDepths:
      "Typically lurk between the surface and approximately 250 feet below. Most frequently encountered near floating kelp paddies, debris fields, and current edges where baitfish congregate.",
    waterTemp: "72-82 degrees F",
    bait: "These predators are most effectively targeted by fly-lining live bait, specifically sardines or small mackerel, near kelp paddies. Trolling with feather jigs, cedar plugs, and Rapalas also works well.",
    gear: "Standard offshore tuna tackle is generally sufficient for these fish. They are primarily caught by trolling near kelp paddies with feathers, cedar plugs, or Rapalas at 6–8 knots.",
    visionAndColor:
      "These predators are particularly responsive to colorful surface lures — bright greens, yellows, and blues that mimic their own coloring tend to trigger aggressive strikes.",
    filletRules:
      "Fillets may be of any size but must bear an intact one-inch square patch of skin for species identification.",
    mustKnow:
      "While not legally required, it is considered ethical to limit yourself to 6 fish per voyage and to only keep fish at least 28 inches in length.",
  },
  {
    name: "Yellowtail Amberjack",
    icon: "💛",
    imageUrl: "https://www.takemefishing.org/getmedia/38e543d1-3ddc-4162-bc15-785a421e9771/california-yellowtail-464x170.png",
    color: "#DAA520",
    zone: Zone.OFFSHORE,
    season: "Year-round",
    peakSeason: "March - October",
    primeHour:
      'Anglers frequently encounter "wide-open" fishing for yellowtail specifically in early morning. Surface boils and kelp patty action are best at dawn.',
    avgSize: "Firecrackers: 12–25 pounds; Mossbacks: 40+ pounds",
    bagLimit: "10 fish",
    sizeLimit: "24 inches fork length minimum",
    migrationPatterns:
      "Year-round residents that move from offshore islands to local kelp beds in the spring as waters warm, making them accessible closer to shore during peak season.",
    idealTides: "Outgoing or slack",
    idealDepths:
      "Found from the surface down to 130 feet. In the spring and summer, they cruise the upper water column near kelp paddies and rocky structure; in winter they hold deeper near the islands.",
    waterTemp: "62-70 degrees F",
    bait: 'During the winter "squid bite," live squid used on dropper loop rigs is the standard. In warm months, live sardines, mackerel, and surface iron are the primary approach.',
    gear: 'Preparation varies by season; the winter "squid bite" requires dropper loop rigs and heavier tackle (40–65 lb), while the summer surface bite calls for lighter setups (25–40 lb) with fly-lined sardines or surface iron.',
    visionAndColor:
      'When trolling near the islands, specific color patterns like "bonita" or black and purple Rapalas have proven to be top producers.',
    filletRules:
      "Fillets must be at least 17 inches in length. There is an exception allowing for a partial fillet with a one-inch square patch of skin for identification.",
    mustKnow:
      "While the minimum size is 24 inches fork length, you are legally allowed to possess up to 5 fish under 24 inches — but any undersized fish count toward your 10-fish daily bag limit.",
  },
  {
    name: "Vermilion/Sunset Rockfish",
    icon: "🔴",
    imageUrl: "https://caseagrant.ucsd.edu/sites/default/files/importedFiles/Vermillion_rockfish_science.jpg",
    color: "#CC3333",
    zone: Zone.OFFSHORE,
    season: "April - December",
    peakSeason: "April - June",
    primeHour:
      "As deep-dwelling resident species, they are targeted throughout the day during standard fishing trips, with no strong time-of-day preference.",
    avgSize: "6-7 pounds",
    bagLimit: "2 fish",
    sizeLimit: "none",
    migrationPatterns:
      "Non-migratory resident bottom-dwellers that inhabit deep reefs and underwater structures year-round. Their availability to anglers is dictated by season closures, not movement.",
    idealTides:
      "Not as particular, but stronger tides bring more action.",
    idealDepths:
      "Generally found around rocky bottoms at 150 feet. At the Coronado Islands and offshore banks, they hold near rocky pinnacles, ledges, and underwater canyon walls.",
    waterTemp: "52-65 degrees F",
    bait: 'For these deep-dwelling bottom fish, squid strips are the "bread and butter" bait, fished on dropper loop rigs or gangion-style bottom rigs with heavy sinkers (8–16 oz).',
    gear: "These are caught with hook-and-line bottom rigs or dropper loops, often using squid and cut bait lowered to deep reefs. Heavy sinkers (8–16 oz) are standard to reach depth.",
    visionAndColor:
      "Because red appears black at these depths, the vibrant contrast of white squid strips against the dark bottom is what draws them in. Glow-in-the-dark lure accents can help.",
    filletRules:
      "Fillets are required to have the entire skin attached. There is no minimum length for fillets as long as the skin is present for identification.",
    mustKnow:
      "Closed for boat-based anglers from January 1 through March 31, but can be taken year-round from shore. A descending device is mandatory on any vessel targeting or possessing rockfish.",
  },
  {
    name: "Yellowfin Croaker",
    icon: "🌊",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3d/Umbrina_roncador_2.jpg",
    color: "#C8A55A",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - September",
    primeHour:
      "These inshore fish are more likely to hit in the early morning or approximately 2 hours before sunset, especially during incoming tides.",
    avgSize: "1-3 pounds",
    bagLimit: "10 fish per day",
    sizeLimit: "none",
    migrationPatterns:
      "An inshore species that patrols shallow shore waters and sandy flats most actively during warmer months, retreating slightly deeper in winter.",
    idealTides: "Incoming high",
    idealDepths:
      "Associated with shallow nearshore waters and bays. Within the nearshore zone, they favor sandy and muddy bottoms near jetties, piers, and along the surf line.",
    waterTemp: "63-75 degrees F",
    bait: "These fish have a strong preference for sand crabs, but they also readily feed on mussels, bloodworms, lugworms, and ghost shrimp. Fresh bait is critical.",
    gear: "Pier and surf anglers use light tackle with 6 lb leaders and small 1/4 to 1/2 oz weights. Carolina rigs and high-low rigs are standard for keeping bait near the bottom.",
    visionAndColor:
      "While they can hit artificials, they are most consistently caught using natural-scent baits — their sensory system favors smell and vibration over visual cues.",
    filletRules:
      "Fillets may be of any size but must bear a one-inch square patch of skin intact for species identification.",
    mustKnow:
      "You cannot sell yellowfin croaker caught recreationally, as California and Mexican regulations prohibit the sale of recreationally caught fish.",
  },
  {
    name: "California Halibut",
    icon: "🐟",
    imageUrl: "https://www.takemefishing.org/getmedia/35734d12-c968-4c89-9d3c-c9c2d4deffb5/california-halibut-464x170.png",
    color: "#8B7355",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "March - September",
    primeHour:
      "Peak activity is heavily influenced by the tide; while some anglers find success throughout the day, slack or slow-moving tides are ideal.",
    avgSize: "5–20 pounds (larger fish can reach 30 pounds)",
    bagLimit: "5 fish per day",
    sizeLimit: "22 inches total length minimum",
    migrationPatterns:
      "year-round residents that migrate from deeper areas into shallower sandy flats to feed during the spring and summer, making them more accessible in warm months.",
    idealTides: "Slack or slow",
    idealDepths:
      "Most often caught by anglers in 10 to 90 feet of water. These flatfish prefer sandy bottoms near kelp edges, channel drop-offs, and bay entrances where baitfish funnel.",
    waterTemp: "58-68 degrees F",
    bait: "They are most effectively caught using live bait such as anchovies, sardines, or small smelt on a two-hook rig near the seafloor. Soft plastic swimbaits (white, 5-inch) are the top artificial.",
    gear: "Gear must be able to keep bait near the seafloor using two-hook rigs and a heavy sinker. Light to medium spinning or conventional tackle with 15–25 lb braid and fluorocarbon leaders.",
    visionAndColor:
      'These ambush predators respond well to white-colored plastics, such as 5-inch fluke-style soft baits. The contrast against sandy bottom triggers strikes.',
    filletRules:
      "Fillets must be at least 16.75 inches long with the entire skin intact.",
    mustKnow:
      "In waters south of Point Sur, the limit is 5 fish with a minimum size of 22 inches total length.",
  },
  {
    name: "Spotted Sand Bass",
    icon: "🐠",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Paralabrax_maculatofasciatus.jpg",
    color: "#6B8E23",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - October",
    primeHour:
      "Like other bass, they are most active during dawn and dusk. They can also be effectively targeted at night in the bays using dark-colored soft plastics.",
    avgSize: "1–3 pounds (max size 6 pounds)",
    bagLimit: "5 fish per day",
    sizeLimit: "14 in. total length, 10 in. alternate length",
    migrationPatterns:
      "Year-round residents that stay within the protected waters of bays and estuaries, moving to shallow flats during spawning season (May–August).",
    idealTides: "Outgoing",
    idealDepths:
      "Found from just one foot of water down to 50 feet. They are most commonly found in San Diego Bay, Mission Bay, and other estuaries around eelgrass beds and sandy structure.",
    waterTemp: "61-75 degrees F",
    bait: "Inside the bays, live worms, shrimp, and small crabs are highly effective. Many anglers also use soft plastic swimbaits, drop-shot rigs, and ned rigs with great success.",
    gear: "Typically targeted with light spinning tackle inside the bays. Successful setups include finesse jig heads (1/8–1/4 oz) with 3–4 inch soft plastics on 8–10 lb fluorocarbon.",
    visionAndColor:
      "During the day, greens, browns, and oranges produce the best results. For night fishing in the bays, dark colors (black, purple, red) silhouette better against ambient light.",
    filletRules:
      "Fillets must be at least 7.5 inches long and must bear a one-inch square patch of skin for identification.",
    mustKnow:
      "Kelp bass (calico), barred sand bass, and spotted sand bass are managed under a combined 5-fish aggregate bag limit.",
  },
  {
    name: "California Corbina",
    icon: "🏖️",
    imageUrl: "https://www.takemefishing.org/getmedia/100a1cea-004f-4f30-8870-1fb76ecf57bb/california-corbina-464x170.png",
    color: "#B8860B",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - September",
    primeHour:
      "Known for being wary, they hit hardest during early mornings and late afternoons in the surf zone when conditions are calm.",
    avgSize: "6-8 pounds",
    bagLimit: "10 fish",
    sizeLimit: "none",
    migrationPatterns:
      "An inshore species that patrols shallow shore waters and sandy flats most actively during warmer months, retreating slightly deeper in winter.",
    idealTides: "Last two hours of incoming tide",
    idealDepths:
      "Inhabits waters ranging from inches deep at the surface down to 65 feet. They cruise the wash zone and first trough of the surf, following sand crabs and other invertebrates.",
    waterTemp: "65-75 degrees F",
    bait: "They are best targeted with sand crabs, which are their primary seasonal food source. Ghost shrimp, bloodworms, and mussels also work when sand crabs are scarce.",
    gear: "Pier and surf anglers use light tackle with 6 lb leaders and small 1/4 to 1/2 oz weights. Carolina rigs are preferred for keeping bait in the strike zone.",
    visionAndColor:
      "Requires a stealthy approach wearing dull colors (gray, tan, or light blue) and making gentle casts. They spook easily and rely heavily on smell over sight.",
    filletRules:
      "Fillets may be any size but must have a one-inch square patch of skin left intact for identification.",
    mustKnow:
      "It is a serious offense to buy or sell any sport-caught California Corbina. Any Corbina found on a boat operating as a Commercial Passenger Fishing Vessel is presumed to be illegally possessed.",
  },
  {
    name: "White Seabass",
    icon: "⚪",
    imageUrl: "https://www.takemefishing.org/getmedia/ae4a6cd6-9d2d-4d1d-a095-84150ef80133/white-seabass-464x170.png",
    color: "#708090",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "March - June",
    primeHour:
      "Most commonly caught at night or in the early morning, particularly during their spawning run from mid-March to June.",
    avgSize: "20-30 pounds",
    bagLimit: "3 fish per day",
    sizeLimit: '28 inches total length or 20 inches alternate length minimum',
    migrationPatterns:
      "They push into Southern California waters between mid-March and June, primarily following spawning squid runs along the kelp edges and rocky structure.",
    idealTides: "Outgoing or slack",
    idealDepths:
      "Vertical distribution shifts toward the surface during warmer months. Found along kelp bed edges, rocky reefs, and near squid spawning grounds at 30–120 feet.",
    waterTemp: "59-66 degrees F",
    bait: "Live squid is considered the premier bait for this species, especially when fished near kelp lines during the spawning squid run. Live sardines and mackerel are also effective.",
    gear: "Anglers target them using hook-and-line or pole-and-line gear. They are most commonly caught on dropper loop rigs or fly-lined live squid near kelp edges at night.",
    visionAndColor:
      "Primarily targeted during spawning (mid-March to June) using live squid near kelp beds at night — they are drawn to the natural bioluminescence of squid.",
    filletRules:
      "Fillets must be at least 19 inches long and bear a one-inch square patch of silvery skin for identification.",
    mustKnow:
      "The limit is reduced to 1 fish between March 15 and June 15.",
  },
];

const scanSources = [
  // — Weather & Conditions —
  {
    name: "NOAA Marine Forecast San Diego",
    url: "https://www.ndbc.noaa.gov/data/Forecasts/FZUS56.KSGX.html",
    scanFrequency: ScanFrequency.DAILY,
    sourceType: ScanSourceType.WEATHER,
  },
  {
    name: "NWS Special Marine Warnings",
    url: "https://forecast.weather.gov/product.php?site=SGX&issuedby=SGX&product=SMW",
    scanFrequency: ScanFrequency.DAILY,
    sourceType: ScanSourceType.WEATHER,
  },

  // — CA DFW Regulations —
  {
    name: "California 2026 Ocean Sport Fishing Regulations",
    url: "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=239985&inline",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Wildlife Home",
    url: "https://wildlife.ca.gov",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Regulations Portal",
    url: "https://wildlife.ca.gov/regulations",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Ocean Fishing Guide",
    url: "https://wildlife.ca.gov/Fishing/Ocean",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Ocean Sportfish Map",
    url: "https://wildlife.ca.gov/OceanSportfishMap",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Beach & Free Fishing",
    url: "https://wildlife.ca.gov/Fishing/Ocean/Beach-Fishing#freefishing",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Groundfish Summary",
    url: "https://wildlife.ca.gov/Fishing/Ocean/Regulations/Groundfish-Summary",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Whale-Safe Fisheries",
    url: "https://wildlife.ca.gov/Conservation/Marine/Whale-Safe-Fisheries",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Fishing License",
    url: "https://wildlife.ca.gov/Licensing/Fishing",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Fishing Reporting",
    url: "https://wildlife.ca.gov/licensing/fishing#reporting",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "CA DFW Marine Subscribe",
    url: "https://wildlife.ca.gov/marine-subscribe",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },
  {
    name: "California Boater Card",
    url: "https://www.californiaboatercard.com",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.REGULATION,
  },

  // — OEHHA Fish Consumption Advisories —
  {
    name: "OEHHA Fish Advisory — Migratory Species",
    url: "https://oehha.ca.gov/fish/advisories/advisory-fish-migrate",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Statewide Coastal Fish Advisory",
    url: "https://oehha.ca.gov/fish/advisories/statewide-advisory-eating-fish-california-coastal-locations-without-site-specific-advice",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — San Diego Bay",
    url: "https://oehha.ca.gov/fish/advisories/san-diego-bay",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Mission Bay",
    url: "https://oehha.ca.gov/fish/advisories/mission-bay",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Santa Monica & Seal Beach",
    url: "https://oehha.ca.gov/fish/advisories/santa-monica-beach-south-santa-monica-pier-seal-beach-pier",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Ventura Harbor",
    url: "https://oehha.ca.gov/fish/advisories/ventura-harbor-santa-monica-pier",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Elkhorn Slough",
    url: "https://oehha.ca.gov/fish/advisories/elkhorn-slough",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — San Francisco Bay",
    url: "https://oehha.ca.gov/fish/advisories/san-francisco-bay",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Humboldt Bay",
    url: "https://oehha.ca.gov/fish/advisories/humboldt-bay",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "OEHHA Fish Advisory — Tomales Bay",
    url: "https://oehha.ca.gov/fish/advisories/tomales-bay",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },

  // — Research & Science —
  {
    name: "CA Sea Grant",
    url: "https://caseagrant.ucsd.edu",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Red Tides",
    url: "https://caseagrant.ucsd.edu/our-work/resources/red-tides-california",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Coastal Hazards & Resilience",
    url: "https://caseagrant.ucsd.edu/coastal-hazards-resilience",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Kelp Research",
    url: "https://caseagrant.ucsd.edu/kelp-research",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — California Seafood",
    url: "https://caseagrant.ucsd.edu/our-work/discover-california-seafood",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Aquaculture",
    url: "https://caseagrant.ucsd.edu/our-work/discover-california-seafood/aquaculture-california",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Aquaculture Development",
    url: "https://caseagrant.ucsd.edu/aquaculture-development",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Ocean & Fisheries Science",
    url: "https://caseagrant.ucsd.edu/our-work/collaborative-ocean-and-fisheries-science",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Offshore Winds",
    url: "https://caseagrant.ucsd.edu/california-offshore-winds",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Salmon & Steelhead",
    url: "https://caseagrant.ucsd.edu/russian-river-salmon-steelhead",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Participatory Science",
    url: "https://caseagrant.ucsd.edu/participatory-science",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CA Sea Grant — Market Your Catch",
    url: "https://caseagrant.ucsd.edu/market-your-catch",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "CAPAM White Seabass Stock Assessment",
    url: "https://capamresearch.org/current-projects/white-seabass-stock-assessment",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },

  // — Fishing Reports & Local Intel —
  {
    name: "San Diego Fishing Reports",
    url: "https://fishing-reports.ai/blog/san-diego-fishing-season-calendar/",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "Excel Sport Fishing Reports",
    url: "https://excelsportfishing.com/fishreports.php",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "Captain Clowers SD Fishing Charters",
    url: "https://captainclowers.com/san-diego-fishing-charters",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "Surf Fishing SoCal — Mission Bay",
    url: "https://surffishingsocalsd.com/bay-fishing-mission-bay/",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "FishingReminder — San Diego",
    url: "https://fishingreminder.com/fishing-spots/us/california/san-diego-5391811",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "FishingBooker — Southern California",
    url: "https://fishingbooker.com/destinations/region/us/southern-california",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "FishingBooker — San Diego Charters",
    url: "https://fishingbooker.com/charters/search/us/CA?search_location=san-diego",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "FishingBooker — Baja Mexico",
    url: "https://fishingbooker.com/destinations/country/mx",
    scanFrequency: ScanFrequency.WEEKLY,
    sourceType: ScanSourceType.NEWS,
  },
  {
    name: "Guidesly — Species Guide",
    url: "https://guidesly.com/fishing/fish-species/african-pompano",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
  {
    name: "MidCurrent — Fishing Techniques",
    url: "https://midcurrent.com",
    scanFrequency: ScanFrequency.MONTHLY,
    sourceType: ScanSourceType.RESEARCH,
  },
];

const generalInfo = [
  // Vocab
  {
    category: "vocab",
    key: "Total Length",
    value:
      "The longest straight-line measurement from the tip of the head (with the mouth closed) to the end of the longest lobe of the tail fin.",
    sortOrder: 1,
  },
  {
    category: "vocab",
    key: "Fork Length",
    value:
      "The straight-line distance from the tip of the head to the center of the tail fin.",
    sortOrder: 2,
  },
  {
    category: "vocab",
    key: "Alternate Length",
    value:
      "The straight-line distance from the base of the foremost spine of the first dorsal fin to the end of the tail.",
    sortOrder: 3,
  },
  // General Legal
  {
    category: "legal",
    key: "Licensing",
    value:
      "Anyone 16 years or older must have a valid California sport fishing license, unless fishing from a public pier.",
    sortOrder: 1,
  },
  {
    category: "legal",
    key: "Mousetrap Gear",
    value:
      "It is illegal to use or possess gear where hooks or lures are attached to a float not directly connected to the angler's line.",
    sortOrder: 2,
  },
  {
    category: "legal",
    key: "Mandatory Boat Gear",
    value:
      "Any boat fishing for species with a minimum size limit must have a landing net with an opening at least 18 inches in diameter.",
    sortOrder: 3,
  },
  {
    category: "legal",
    key: "Filleting at Sea",
    value:
      "If you fillet fish on a boat, you must follow strict length and skin-patch requirements.",
    sortOrder: 4,
  },
  {
    category: "legal",
    key: "Multi-Day Trips",
    value:
      "Anglers on authorized multi-day trips who have filed an official Declaration for Multi-Day Fishing Trip may possess up to two daily limits.",
    sortOrder: 5,
  },
  {
    category: "legal",
    key: "Boat Limit",
    value:
      'When two or more licensed anglers are on a vessel, they may continue fishing until a "boat limit" is reached (the individual daily bag limit multiplied by the number of anglers).',
    sortOrder: 6,
  },
  {
    category: "legal",
    key: "Gaff Hooks",
    value:
      "You may not use a gaff hook to land any fish that is below its legal minimum size limit.",
    sortOrder: 7,
  },
  // Mandatory Tools
  {
    category: "tools",
    key: "Landing Gear",
    value:
      "Boat-based anglers are required by law to have a landing net with an opening at least 18 inches in diameter.",
    sortOrder: 1,
  },
  {
    category: "tools",
    key: "Descending Device",
    value:
      "Any vessel taking or possessing groundfish (like rockfish) must have a descending device available for immediate use.",
    sortOrder: 2,
  },
  {
    category: "tools",
    key: "Measuring Device",
    value:
      "You must carry a measuring device capable of accurately checking minimum legal sizes.",
    sortOrder: 3,
  },
  {
    category: "tools",
    key: "Personal Gear",
    value:
      "Polarized sunglasses are critical for seeing fish in the shore break or offshore, and layered clothing is essential for early-morning trips.",
    sortOrder: 4,
  },
  // Essential Links
  {
    category: "links",
    key: "Fishing License",
    value: "https://wildlife.ca.gov/Licensing/Fishing",
    sortOrder: 1,
  },
  {
    category: "links",
    key: "2026 CA Ocean Sport Fishing Regulations",
    value:
      "https://nrm.dfg.ca.gov/FileHandler.ashx?DocumentID=239985&inline",
    sortOrder: 2,
  },
  {
    category: "links",
    key: "NOAA Marine Forecast",
    value: "https://www.ndbc.noaa.gov/data/Forecasts/FZUS56.KSGX.html",
    sortOrder: 3,
  },
  {
    category: "links",
    key: "NWS Special Marine Warnings",
    value:
      "https://forecast.weather.gov/product.php?site=SGX&issuedby=SGX&product=SMW",
    sortOrder: 4,
  },
];

async function main() {
  console.log("Seeding database...");

  // Seed species
  for (const s of speciesData) {
    await prisma.species.upsert({
      where: { slug: slugify(s.name) },
      update: s,
      create: { ...s, slug: slugify(s.name) },
    });
    console.log(`  ✓ ${s.name}`);
  }

  // Seed scan sources (deduplicate by URL)
  for (const src of scanSources) {
    const existing = await prisma.scanSource.findFirst({ where: { url: src.url } });
    if (existing) {
      await prisma.scanSource.update({ where: { id: existing.id }, data: src });
    } else {
      await prisma.scanSource.create({ data: src });
    }
    console.log(`  ✓ Source: ${src.name}`);
  }

  // Seed general info
  for (const info of generalInfo) {
    await prisma.generalInfo.upsert({
      where: {
        category_key: { category: info.category, key: info.key },
      },
      update: info,
      create: info,
    });
  }
  console.log(`  ✓ ${generalInfo.length} general info entries`);

  console.log("\nSeed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
