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
      "They range from the surface to deep — sonar often shows suspended fish at 50–200+ feet. Surface iron and fly-line baiting work during boils, while deep drops on kite or balloon rigs target fish holding below the surface chum.",
    waterTemp: "60-70 degrees F",
    bait: "The top live baits used on offshore charter and private boats are live sardines and mackerel, fly-lined or fished under a kite. Fluorocarbon leaders (60–130 lb) are essential, and flat-fall jigs, knife jigs, and Nomad DTX Minnows are popular artificial alternatives.",
    gear: "Standard gear consists of 40–100 lb conventional tackle, while trophy specimens (200+ lb) demand 100–130 lb stand-up rigs paired with Shimano Tiagra or Penn International reels and 200 lb fluorocarbon leaders.",
    visionAndColor:
      "These top-tier predators have exceptional vision and are highly sensitive to seeing line in the water. Using thinner, clearer fluorocarbon leader material significantly increases success.",
    filletRules:
      "Each fish must be cut into six specific pieces (four loins, the collar with pectoral fin attached, and the tail). Additionally, one pectoral fin must remain attached to the collar section of each fish for identification purposes.",
    mustKnow:
      "Regardless of the number of passengers, a vessel may not have more than 20 bluefin tuna on board at any time. Daily bag limit is 2 fish per angler. Pacific bluefin tuna bag limits are actively managed and subject to in-season changes by NOAA and CDFW — always verify current limits before your trip.",
    locations: JSON.stringify([
      { name: "9-Mile Bank", note: "One of the most consistent BFT grounds off San Diego; strong underwater structure holds bait schools and concentrates fish throughout the season." },
      { name: "Coronado Islands", note: "Just 15 miles south in Mexican waters; kelp paddies and warm upwellings attract bluefin chasing anchovies and sardines." },
      { name: "Hidden Bank (182 Spot)", note: "Deep offshore bank where temperature breaks concentrate tuna in summer; long run but consistently productive for large fish." },
      { name: "Offshore kelp paddies (30–50 mi)", note: "Floating kelp mats well offshore draw bluefin in summer; birds working the surface signal fish below the mat." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "The SD bluefin bite peaks June–October. Watch SST charts on Hilton's Offshore or Savvy Navvy for 60°F+ breaks moving north — that's your green light to run offshore." },
      { category: "Local Trick", tip: "When fish are lock-jawed on surface iron, drop a flat-fall or knife jig to the meter marks. SD bluefin have seen heavy iron pressure — going deep triggers bites when nothing else works." },
      { category: "Bait Shop", tip: "H&M Landing and Seaforth Landing (both Point Loma) are the go-to full-service landings. They carry live bait, have tackle shops on site, and staff know what's biting offshore." },
      { category: "SD Tip", tip: "San Diego bluefin are notoriously line-shy. Local veterans use fluorocarbon leaders as light as 40 lb even on large fish — don't go heavy just because the fish are big." },
    ]),
    communityPosts: JSON.stringify([
      { username: "MarlinMike_SD", date: "Oct 14, 2024", time: "6:42 AM", location: "9-Mile Bank", weight: "87 lbs", gear: "130lb Tiagra, flat-fall jig", note: "Found them on the meter marks after the surface bite shut down. Two hours of waiting paid off big." },
      { username: "tuna_dan92037", date: "Aug 3, 2024", time: "5:15 AM", location: "Offshore kelp paddy (~48 mi SW)", weight: "112 lbs", bait: "Fly-lined sardine", tide: "Incoming", note: "Paddy was lit up at first light. Fish was in the boat by 7am." },
      { username: "Coronado_Caster", date: "Sep 22, 2024", time: "4:58 PM", location: "Coronado Islands", weight: "64 lbs", gear: "40lb spinning, knife jig", waterTemp: "68°F" },
    ]),
    maxWeightLbs: 500,
  },
  {
    name: "Calico Bass (Kelp Bass)",
    icon: "🐠",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Paralabrax_clathratus.jpg",
    color: "#4A7C59",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - October",
    primeHour:
      "They are most active during dawn and dusk. When using artificial lures like jerkbaits and swimbaits, the mid-morning through early afternoon window is also productive.",
    avgSize: "2–5 pounds (max size 10 pounds)",
    bagLimit: "5 fish",
    sizeLimit: "14 inches total length (10 inches alternate measurement)",
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
    locations: JSON.stringify([
      { name: "La Jolla Kelp Beds", note: "The richest kelp canopy in San Diego; dense structure and consistent water temps hold large calico year-round." },
      { name: "Point Loma Kelp Forest", note: "Miles of protected kelp along the peninsula offer rocky edges and thick canopy that produce consistent action." },
      { name: "Coronado Islands", note: "Less-pressured kelp forests just south of the border hold trophy calico; accessible by charter or private boat." },
      { name: "Del Mar / Solana Beach Kelp", note: "North county kelp beds offer good numbers of fish with lighter boat traffic than Point Loma and La Jolla." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "May through October is prime, but La Jolla and Point Loma kelp hold calico year-round. Water temp above 62°F moves them higher in the column and makes them more aggressive on swimbaits." },
      { category: "Local Trick", tip: "At La Jolla, anchor up-current of a kelp paddy at dawn and drift swimbaits along the outer edge. Big fish hold in the darkest, thickest kelp — don't just fish the edge, punch into the canopy." },
      { category: "Bait Shop", tip: "Squidco (Morena Blvd) and Fisherman's Landing tackle shop are local favorites. Squidco carries an especially strong selection of local swimbaits in colors proven on SD calico." },
      { category: "SD Tip", tip: "Most serious local anglers release legal calico — the La Jolla beds have been recovering and the big fish reward C&R. Target areas around the outer kelp buoys for the largest specimens." },
    ]),
    communityPosts: JSON.stringify([
      { username: "KelpQueen_SD", date: "Jun 7, 2024", time: "7:20 AM", location: "La Jolla Kelp Beds", weight: "4.2 lbs", bait: "Live anchovy", note: "First keeper of the season off the outer edge. Released her after the photo." },
      { username: "PointLoma_Pete", date: "Aug 19, 2024", time: "6:05 AM", location: "Point Loma Kelp Forest", weight: "3.8 lbs", gear: "Swimbait on 15lb fluoro", tide: "Outgoing" },
      { username: "sd_bass_crew", date: "May 30, 2024", time: "8:45 AM", location: "Coronado Islands", weight: "6.1 lbs", note: "Personal best! Hit right at the kelp edge on a big swimbait. Released her — she deserved it." },
    ]),
    maxWeightLbs: 14,
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
    bagLimit: "10 fish",
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
      "Bag limit is 10 fish, counted as part of the 20-fish general pelagic bag limit. No minimum size. No closed season. A Mexican fishing license is required when fishing near the Coronado Islands or any Mexican waters.",
    locations: JSON.stringify([
      { name: "Offshore kelp paddies (50–80 miles)", note: "Floating kelp mats in warm blue water are the primary mahi magnet; target mats with birds working overhead or debris fields." },
      { name: "Coronado Islands vicinity", note: "The islands break currents and collect floating debris that attract mahi during warm-water years." },
      { name: "9-Mile Bank", note: "Temperature breaks near the bank hold bait and attract mahi trolling through in summer and fall." },
      { name: "Tanner & Cortez Banks", note: "Distant offshore banks (100+ miles) produce mahi in peak season when warm water pushes far north." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "Mahi arrive when SST hits 72°F+, typically late July through October. Hot years push them within 50 miles; cold years may require 80-mile runs. Check SST charts before committing to the run." },
      { category: "Local Trick", tip: "When you find a kelp paddy, don't motor through it. Approach quietly and pitch a live sardine to the edge. Mahi materialize instantly if they're present — and keep one in the water while landing others to hold the school." },
      { category: "Bait Shop", tip: "Point Loma Sportfishing and H&M Landing are the main departure points for offshore trips. Call ahead — when mahi are biting, live bait sells out fast." },
      { category: "SD Tip", tip: "Keep one mahi in the water while landing others — the splashing keeps the school excited. This 'teaser fish' technique is standard practice among experienced SD offshore anglers." },
    ]),
    communityPosts: JSON.stringify([
      { username: "DoradoDave_619", date: "Sep 5, 2024", time: "9:30 AM", location: "Kelp paddy, ~65 mi offshore", weight: "28 lbs", bait: "Live sardine", note: "Found three paddies in a row. Kept two, released the rest. Meat in the freezer!" },
      { username: "blue_water_breeze", date: "Aug 12, 2024", time: "11:15 AM", location: "9-Mile Bank temperature break", weight: "19 lbs", gear: "Trolled cedar plug", waterTemp: "74°F", tide: "Slack" },
    ]),
    maxWeightLbs: 70,
  },
  {
    name: "Yellowtail Amberjack",
    icon: "💛",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/19/Yellowtail_amberjack.jpg",
    color: "#DAA520",
    zone: Zone.NEARSHORE,
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
    bait: 'During the winter "squid bite," live squid on dropper loop rigs is the standard. In warm months, live sardines, mackerel, and surface iron are the primary approach.',
    gear: 'Preparation varies by season; the winter "squid bite" requires dropper loop rigs and heavier tackle (40–65 lb), while the summer surface bite calls for lighter setups (25–40 lb) with fly-lined sardines or surface iron.',
    visionAndColor:
      "When trolling near the islands, specific color patterns like Bonita (a tan/brown mottled pattern) or black and purple Rapalas have proven to be top producers.",
    filletRules:
      "Fillets must be at least 17 inches in length. There is an exception allowing for a partial fillet with a one-inch square patch of skin for identification.",
    mustKnow:
      "While the minimum size is 24 inches fork length, you are legally allowed to possess up to 5 fish under 24 inches — but any undersized fish count toward your 10-fish daily bag limit.",
    locations: JSON.stringify([
      { name: "Coronado Islands", note: "The most famous SD yellowtail destination; rocky kelp structure holds fish spring through fall and draws big mossbacks during the winter squid bite." },
      { name: "La Jolla Kelp Beds", note: "Kelp canopy holds yellowtail near the surface during peak summer; fish stack up along the outer kelp edges and respond to surface iron." },
      { name: "Point Loma", note: "Rocky points and kelp edges along the peninsula concentrate yellowtail on outgoing tides; closer to the dock than the islands." },
      { name: "9-Mile Bank", note: "Deeper-water mossbacks (40+ lb) stack near rocky structure in winter; productive for large fish during the squid bite with dropper loop rigs." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "Spring through fall at the Coronado Islands is the classic pattern. The winter 'squid bite' (Dec–Feb) produces the biggest mossbacks — 40+ lb fish — but requires heavier tackle and an early start." },
      { category: "Local Trick", tip: "When surface iron isn't working at the islands, drop a live squid or mackerel straight down under the boat. Island mossbacks don't always come topwater — they respond to vertical presentations below the chum line." },
      { category: "Bait Shop", tip: "Fisherman's Landing (Shelter Island) is the premier departure point for Coronado Islands yellowtail trips. Their crews know the islands better than anyone and share current bite info at the landing." },
      { category: "SD Tip", tip: "The Coronado Islands require a Mexican fishing license — buy one before your trip at Fisherman's Landing or online. Getting caught without one while fishing Mexican waters carries a steep fine." },
    ]),
    communityPosts: JSON.stringify([
      { username: "IslandBound_SB", date: "Apr 28, 2024", time: "5:30 AM", location: "Coronado Islands – North Island", weight: "34 lbs", bait: "Live mackerel on dropper loop", tide: "Outgoing", note: "Squid bite was still going. Got this guy at 80ft. Biggest fish of my season." },
      { username: "YTAddict619", date: "Jul 14, 2024", time: "7:05 AM", location: "La Jolla Kelp", weight: "22 lbs", gear: "Surface iron, scrambled egg color", note: "Wide open surface bite for 45 minutes at first light. Released two, kept one." },
      { username: "Kelp_Chaser_SD", date: "Jun 3, 2024", time: "6:55 AM", location: "Point Loma kelp edge", weight: "18 lbs", tide: "Incoming", waterTemp: "66°F" },
    ]),
    maxWeightLbs: 100,
  },
  {
    name: "Vermilion/Sunset Rockfish",
    icon: "🔴",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/6/63/Sebastes_miniatus_8.jpg",
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
      "Closed for boat-based anglers from January 1 through March 31 (verify current closure dates with CDFW — the closure window can be extended by regulation). Legal year-round from shore. A descending device is mandatory on any vessel targeting or possessing rockfish — this is California law.",
    locations: JSON.stringify([
      { name: "Coronado Canyon", note: "Deep rocky canyon walls south of the Coronado Islands; dense rockfish populations stack at 150–300 feet on the canyon edges." },
      { name: "9-Mile Bank (deep structure)", note: "Rocky bottom pinnacles and ledges on the bank hold vermilion in large numbers; one of the most reliable SD rockfish spots." },
      { name: "La Jolla Canyon", note: "Underwater canyon close to shore with deep rocky walls; accessible by short run and consistently productive for multiple rockfish species." },
      { name: "Point Loma Reefs", note: "Rocky reef system extending offshore from the peninsula; reliable rockfish action at depth on the outer edges year-round." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "Available April through December for boat anglers. Early April trips after the winter closure often deliver the best numbers of the year — pent-up fish with minimal pressure." },
      { category: "Local Trick", tip: "Fresh squid strips on dropper loops 1–2 feet off bottom produce the most consistent results. Change bait often — rockfish have a keen nose and fresh bait outperforms stale every time." },
      { category: "Bait Shop", tip: "H&M Landing, Fisherman's Landing, and Seaforth all run rockfish combo trips and carry appropriate bottom-fishing gear. Staff share current depth and structure reports from recent trips." },
      { category: "SD Tip", tip: "California law requires a descending device on any vessel targeting rockfish — bring a release weight or Shelton Descender. Releasing fish properly protects stock recovery and is now legally required." },
    ]),
    communityPosts: JSON.stringify([
      { username: "BottomFisher_SD", date: "May 11, 2024", time: "8:00 AM", location: "9-Mile Bank", weight: "7.4 lbs", bait: "Squid strip on dropper loop", note: "Limit of 2 by 9am. Came up with a copper rockfish on the same drop — good day." },
      { username: "ReefDiver619", date: "Nov 2, 2024", time: "7:30 AM", location: "La Jolla Canyon, 180ft", weight: "6.1 lbs", gear: "Heavy dropper loop, 14oz sinker", tide: "Outgoing" },
    ]),
    maxWeightLbs: 15,
  },
  {
    name: "Yellowfin Croaker",
    icon: "🌊",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b6/Umbrina_roncador_mspc098.jpg",
    color: "#C8A55A",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - September",
    primeHour:
      "These inshore fish are more likely to hit in the early morning or approximately 2 hours before sunset, especially during incoming tides.",
    avgSize: "1-3 pounds",
    bagLimit: "10 fish",
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
      "Bag limit is 10 fish per day with no size limit and no closed season. No special permits required. Like all recreationally caught fish in California, yellowfin croaker may not be bought or sold.",
    locations: JSON.stringify([
      { name: "Mission Beach Surf Zone", note: "Sandy surf with heavy sand crab concentrations; best on incoming tides in summer — wade the swash zone at dawn for the most action." },
      { name: "Ocean Beach Pier Area", note: "Structure and current near the OB Pier concentrate croaker; easy shore access with consistent summer action." },
      { name: "Silver Strand / Coronado Beach", note: "Long sandy beach south of Coronado with reliable surf action and noticeably less pressure than Mission Beach." },
      { name: "Pacific Beach Surf", note: "Classic SoCal surf fishing for croaker; early morning incoming-tide sessions consistently produce from June through September." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through September is peak season. Best action comes 2 hours before and after high tide — croaker push into the wash zone to feed on sand crabs uncovered by wave action." },
      { category: "Local Trick", tip: "Dig your own sand crabs from the swash zone where waves retreat — fresh live crabs dramatically outfish store-bought bait. Break them in half and thread on a size 4–6 hook with the soft belly exposed." },
      { category: "Bait Shop", tip: "Squidco and bait shops near Mission Beach carry the essentials. For fresh bloodworms and ghost shrimp (a solid backup when sand crabs are scarce), check shops near OB Pier." },
      { category: "SD Tip", tip: "San Diego beach rangers occasionally check licenses and bag limits. Keep your license visible and know the 10-fish limit — this species is abundant but worth protecting for future seasons." },
    ]),
    communityPosts: JSON.stringify([
      { username: "SurfSider_MB", date: "Jul 6, 2024", time: "5:50 AM", location: "Mission Beach surf zone", weight: "2.1 lbs", bait: "Fresh sand crab", tide: "Incoming high", note: "Caught 6 before 8am. Kept 4 for fish tacos that night — best of the summer." },
      { username: "PierFisher_OB", date: "Aug 22, 2024", time: "6:15 AM", location: "Ocean Beach Pier area", weight: "1.8 lbs", bait: "Ghost shrimp" },
      { username: "SilverStrandSam", date: "Jun 30, 2024", time: "7:00 AM", location: "Silver Strand Beach", weight: "2.6 lbs", bait: "Sand crab", tide: "High incoming", note: "Way quieter than MB and the fish were bigger. Definitely coming back." },
    ]),
    maxWeightLbs: 5,
  },
  {
    name: "California Halibut",
    icon: "🐟",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/db/Halibut_300.jpg",
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
      "Year-round residents that migrate from deeper areas into shallower sandy flats to feed during spring and summer, making them more accessible in warm months.",
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
    locations: JSON.stringify([
      { name: "Mission Bay", note: "One of the top halibut fisheries in SoCal; sandy channel bottoms and bay mouth areas hold fish year-round with peak action in spring." },
      { name: "San Diego Bay", note: "Large protected bay with extensive sandy habitat; the main channel near Shelter Island and Coronado is a consistent producer." },
      { name: "La Jolla Shores Flats", note: "Sandy flats north of the cove in 20–50 feet; drift fishing with live bait or swimbaits is highly effective in spring and early summer." },
      { name: "Point Loma Sandy Patches", note: "Sandy bottom between kelp beds off the peninsula; large halibut stage here on outgoing tides targeting baitfish funneling out of the kelp." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "March through June is prime — halibut move from deep water onto sandy flats to spawn and the biggest fish of the year are caught during this window. Summer sees good numbers but smaller average size." },
      { category: "Local Trick", tip: "In Mission Bay, try the 'Mission Bay drift' at night: anchor near the channel mouth, cast a 5\" white swimbait toward the shallows, and retrieve slowly along the bottom. Night fishing produces the largest fish." },
      { category: "Bait Shop", tip: "Islandia Sportfishing at Mission Bay is the main halibut charter operation. Their tackle shop carries live bait (anchovies, smelt) and local guides share where fish are holding that week." },
      { category: "SD Tip", tip: "The 22\" minimum is strictly enforced — measure carefully before keeping any fish. Short halibut in the 18–21\" range are easy to misjudge, and the fine is significant. When in doubt, release it." },
    ]),
    communityPosts: JSON.stringify([
      { username: "FlatfishFan_SD", date: "Apr 5, 2024", time: "7:15 PM", location: "Mission Bay channel mouth", weight: "14.5 lbs", gear: "5\" white swimbait, 1oz jighead", note: "Night fishing finally paid off. Third cast at the channel. These things hit like a truck." },
      { username: "LaJollaDrifter", date: "May 18, 2024", time: "9:45 AM", location: "La Jolla Shores flats, ~30ft", weight: "22 lbs", bait: "Live anchovy, two-hook rig", tide: "Slack", waterTemp: "62°F" },
      { username: "BayBoss_619", date: "Mar 27, 2024", time: "6:30 AM", location: "Shelter Island channel, SD Bay", weight: "8 lbs", gear: "Swimbait, slow retrieve", note: "First one of the season. Water was cold but they're there." },
    ]),
    maxWeightLbs: 72,
  },
  {
    name: "Spotted Sand Bass",
    icon: "🐠",
    imageUrl: "https://inaturalist-open-data.s3.amazonaws.com/photos/627535246/large.jpg",
    color: "#6B8E23",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "May - October",
    primeHour:
      "Like other bass, they are most active during dawn and dusk. They can also be effectively targeted at night in the bays using dark-colored soft plastics.",
    avgSize: "1–3 pounds (max size 6 pounds)",
    bagLimit: "5 fish per day",
    sizeLimit: "14 inches total length (10 inches alternate measurement)",
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
    locations: JSON.stringify([
      { name: "Mission Bay", note: "The premier spot for sand bass in San Diego; extensive eelgrass beds and sandy structure hold fish year-round with peak spawning action May–August." },
      { name: "San Diego Bay", note: "Large eelgrass flats throughout the bay; the Shelter Island area and near the Coronado Bridge produce consistent numbers of fish." },
      { name: "Chula Vista / South Bay Flats", note: "Shallow eelgrass flats in South Bay hold spawning fish from May through August; sight fishing in clear, low water is possible on calm mornings." },
      { name: "Glorietta Bay (Coronado)", note: "Small protected bay with dense eelgrass and shallow, clear water; excellent for sight-fishing cruising sand bass at low tide." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "May through August is spawning season and the most productive time. Fish move onto shallow eelgrass flats in Mission Bay — sight fishing to cruising fish in 2–4 feet of water is a local highlight." },
      { category: "Local Trick", tip: "At Mission Bay, wade the eelgrass flats near De Anza Cove or Mariner's Basin at low tide. Sight cast a small ned rig or swimbait ahead of cruising fish — they'll often react immediately." },
      { category: "Bait Shop", tip: "Islandia Sportfishing and local Mission Bay bait shops carry fresh ghost shrimp and bloodworms — both excellent for sand bass. Ask about current eelgrass conditions, as grass locations shift seasonally." },
      { category: "SD Tip", tip: "Sand bass, calico bass, and barred sand bass share a 5-fish aggregate limit — if you've kept 3 calico and 2 spotted sand bass, you're done for the day. Many local anglers keep a running tally on their phone." },
    ]),
    communityPosts: JSON.stringify([
      { username: "EelgrassEric", date: "Jun 15, 2024", time: "7:30 AM", location: "Mission Bay – De Anza Cove flats", weight: "3.1 lbs", bait: "Live ghost shrimp", tide: "Low outgoing", note: "Sight fished 4 fish in the eelgrass before 9am. All released — water was crystal clear." },
      { username: "BayWader_SD", date: "Aug 8, 2024", time: "8:00 AM", location: "Glorietta Bay, Coronado", weight: "2.4 lbs", gear: "Ned rig, 1/10oz, green pumpkin", note: "Water was super clear. Could actually see the fish pick up the bait. Insane." },
      { username: "MissionBayMike", date: "Jul 22, 2024", time: "6:45 AM", location: "Mariner's Basin, Mission Bay", weight: "1.9 lbs", bait: "Ghost shrimp", tide: "Incoming" },
    ]),
    maxWeightLbs: 10,
  },
  {
    name: "California Corbina",
    icon: "🏖️",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/7/74/California_corbina.JPG",
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
    locations: JSON.stringify([
      { name: "Mission Beach Surf Zone", note: "Sandy surf with heavy sand crab populations; one of the most consistent corbina spots in SD from June through September." },
      { name: "Ocean Beach Surf", note: "Consistent sandy bottom with good intertidal zones; wade at low tide with sand crabs for best results along the surf line." },
      { name: "Coronado / Silver Strand Beach", note: "Long stretch of protected beach with steady corbina action and less crowding than Mission Beach; good access off the Silver Strand highway." },
      { name: "La Jolla Shores", note: "Sandy beach south of the cove where corbina cruise the shallow wash zone; sight-fishing at dawn is a highlight for local surf anglers." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through September is peak season; best action at dawn on incoming tide. Corbina feed aggressively in the white water of the breaking surf — don't be afraid to wade into knee-deep wash." },
      { category: "Local Trick", tip: "Stalking corbina at La Jolla Shores on calm mornings is a local tradition. Wear gray or tan clothing, wade slowly, and sight-cast a sand crab 3–4 feet ahead of a cruising fish. The take is explosive." },
      { category: "Bait Shop", tip: "Squidco has the light finesse tackle used by SD corbina specialists. Ghost shrimp work when sand crabs are scarce — pick them up at bait shops near Mission Beach or OB." },
      { category: "SD Tip", tip: "SD has a dedicated community of catch-and-release corbina anglers who consider them the premier SoCal surf game fish. Joining local surf fishing groups on Facebook connects you with current conditions and spot intel." },
    ]),
    communityPosts: JSON.stringify([
      { username: "SurfStalker619", date: "Jul 20, 2024", time: "6:10 AM", location: "La Jolla Shores", weight: "5.8 lbs", bait: "Fresh sand crab", tide: "Incoming", note: "Spotted her cruising in 8 inches of water. Sight fished — she didn't hesitate. Released immediately." },
      { username: "MissionBeachMo", date: "Aug 4, 2024", time: "5:45 AM", location: "Mission Beach surf zone", weight: "4.2 lbs", bait: "Ghost shrimp", waterTemp: "70°F" },
      { username: "CasualCorb_SD", date: "Sep 1, 2024", time: "7:00 AM", location: "Coronado / Silver Strand", weight: "6.3 lbs", bait: "Sand crab", tide: "High incoming", note: "Personal best! Way less crowded than Mission Beach. Released after a quick photo." },
    ]),
    maxWeightLbs: 8,
  },
  {
    name: "White Seabass",
    icon: "⚪",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/2/2b/Atractoscion_nobilis_mspc096.jpg",
    color: "#708090",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "March - June",
    primeHour:
      "Most commonly caught at night or in the early morning, particularly during their spawning run from mid-March to June.",
    avgSize: "20-30 pounds",
    bagLimit: "3 fish per day",
    sizeLimit: "28 inches total length (20 inches alternate measurement)",
    migrationPatterns:
      "They move into Southern California waters between mid-March and June, primarily following spawning squid runs along kelp edges and rocky structure.",
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
      "Regular bag limit is 3 fish per day (28-inch minimum). The limit is reduced to 1 fish per day between March 15 and June 15 during peak spawning season — this is a critical conservation measure. Verify current seasonal limits with CDFW before your trip.",
    locations: JSON.stringify([
      { name: "La Jolla Kelp Beds", note: "Prime spawning habitat; WSB stack along kelp edges during the March–June squid run and respond aggressively to live squid fished at night." },
      { name: "Point Loma Kelp Edges", note: "Night fishing along kelp lines with live squid is the proven local technique during spawn season — the outer kelp edge after dark is the sweet spot." },
      { name: "Coronado Islands", note: "Rocky kelp structure south of the border holds large WSB year-round; charter boats consistently score here during the prime spawn window." },
      { name: "Mission Bay Channel Entrance", note: "Large WSB cruise the channel mouth at night following spawning squid; accessible from shore or by small boat during March–June." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "Mid-March through June is prime when spawning squid runs push WSB into SD kelp beds at night. La Jolla and Point Loma kelp edges go active after dark — this is when locals score the biggest fish of the year." },
      { category: "Local Trick", tip: "Drift live squid along the kelp edge at night with 4–6 oz of weight. Use a 9/0 J-hook through the mantle and let the squid swim naturally. Listen for 'the knock' — WSB often tap before committing, so don't set the hook too early." },
      { category: "Bait Shop", tip: "H&M Landing and Seaforth Sportfishing are the primary departure points for WSB trips. Both sell live squid when the run is on — call ahead as squid availability is tide and season dependent. Arrive early: squid goes fast." },
      { category: "SD Tip", tip: "The bag limit drops to 1 fish March 15–June 15 — exactly peak season. Many local anglers practice voluntary catch-and-release during the spawn. Check the SD Sportfishing Association reports for real-time squid run updates." },
    ]),
    communityPosts: JSON.stringify([
      { username: "NightOwl_WSB", date: "Apr 18, 2024", time: "11:30 PM", location: "La Jolla Kelp edge", weight: "31 lbs", bait: "Live squid, 9/0 J-hook", tide: "Outgoing", note: "Heard the knock, counted to 3, set the hook. Pure adrenaline. Released to fight again." },
      { username: "SquidRun_SD", date: "May 2, 2024", time: "10:15 PM", location: "Point Loma kelp line", weight: "24 lbs", gear: "Dropper loop, 5oz lead, live squid", waterTemp: "62°F" },
      { username: "KelpLineKing", date: "Mar 29, 2024", time: "9:45 PM", location: "Mission Bay channel entrance", weight: "18 lbs", bait: "Live squid", tide: "Incoming", note: "First WSB of the season. Squid were thick in the channel. Shore caught!" },
    ]),
    maxWeightLbs: 90,
  },
  {
    name: "Yellowfin Tuna",
    icon: "🎣",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Thunnus_albacares.png",
    color: "#FFD700",
    zone: Zone.OFFSHORE,
    season: "June - October",
    peakSeason: "June - October",
    primeHour: "Most active at dawn and early morning. Pre-dawn departures are standard for offshore YFT trips, catching the first-light feeding window before the sun gets high.",
    avgSize: "20-80 pounds",
    bagLimit: "10 fish",
    sizeLimit: "none",
    migrationPatterns: "Yellowfin follow warm Pacific currents north into San Diego waters each summer, typically arriving in June when sea surface temps climb above 68°F. They track temperature breaks and bait concentrations, often found near floating kelp paddies 50–150 miles offshore.",
    idealTides: "Not as particular",
    idealDepths: "Primarily targeted at the surface during feeding boils, but also found at 50–300 feet near temperature breaks and underwater structure. Sonar meter marks at 100–200 feet often reveal suspended fish.",
    waterTemp: "68-78 degrees F",
    bait: "Live sardines and anchovies are the top live baits, fly-lined or under a kite. Squid and live mackerel also produce. Feather jigs, cedar plugs, and Nomad DTX Minnows are effective artificials when fish are boiling.",
    gear: "Medium-heavy spinning or conventional tackle with 30–50 lb line. Fluorocarbon leaders (60–100 lb) are essential. Many anglers use 40–80 lb conventional outfits paired with quality reels like Shimano Talica or Penn Torque.",
    visionAndColor: "Highly line-shy in clear offshore water. Use fluorocarbon leaders and avoid heavy, visible terminal tackle. Matching the size of live bait to what fish are keying on significantly increases hookups.",
    filletRules: "Fillets may be of any size but must bear an intact one-inch square patch of skin for species identification purposes.",
    mustKnow: "Bag limit is 10 fish per day with no minimum size. A Mexican fishing license is required when fishing near the Coronado Islands or other Mexican waters. Federal and state regulations for highly migratory species like yellowfin can change mid-season — always verify current limits with CDFW before your trip.",
    locations: JSON.stringify([
      { name: "Offshore kelp paddies (50–150 mi)", note: "Floating kelp mats in warm blue water concentrate baitfish and attract YFT; birds working overhead signal active fish below." },
      { name: "Tanner & Cortez Banks", note: "Distant offshore banks (100+ miles) where temperature breaks and upwellings hold bait and concentrate yellowfin in peak season." },
      { name: "Hurricane Bank", note: "Deep offshore seamount in Mexican waters that reliably holds yellowfin when warm water pushes north; long run but consistently productive." },
      { name: "9-Mile Bank temperature breaks", note: "When warm water pushes in close, YFT can be found at temperature breaks near the 9-Mile Bank without a long offshore run." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through October is the window, with August and September historically the best months for volume. Watch SST charts — when 70°F+ water reaches within 60 miles, the bite fires." },
      { category: "Local Trick", tip: "When fish are boiling on the surface, match your bait size exactly to what they're eating. If they're on small anchovies and you throw a sardine, they'll ignore it. Bait matching is critical for YFT." },
      { category: "Bait Shop", tip: "H&M Landing and Point Loma Sportfishing are the main departure points for offshore YFT trips. Book charters early in summer — the best boats fill fast once fish show up." },
      { category: "SD Tip", tip: "San Diego is one of the best ports in the world for access to offshore tuna. Local charter captains share SST intel at the landing — talk to the crews the night before your trip for the latest on where fish are holding." },
    ]),
    communityPosts: JSON.stringify([
      { username: "YFT_Hunter619", date: "Aug 15, 2024", time: "5:30 AM", location: "Kelp paddy, ~80 mi offshore", weight: "55 lbs", bait: "Live sardine, fly-lined", tide: "Slack", note: "Paddy was loaded. Hooked 4, landed 2. These things fight like freight trains." },
      { username: "OffshoreOliver_SD", date: "Sep 3, 2024", time: "6:45 AM", location: "Tanner Bank temperature break", weight: "38 lbs", gear: "Nomad DTX Minnow, 50lb conventional", waterTemp: "72°F" },
      { username: "TunaTime_SD", date: "Jul 28, 2024", time: "7:00 AM", location: "Hurricane Bank", weight: "72 lbs", bait: "Live squid on kite", note: "Long run but worth every mile. Biggest fish of my life. Released after photos." },
    ]),
    maxWeightLbs: 300,
  },
  {
    name: "Albacore Tuna",
    icon: "🐡",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Thon_germon_%28Thunnus_alalunga%29_%28Ifremer_00764-87615%29.jpg",
    color: "#4682B4",
    zone: Zone.OFFSHORE,
    season: "July - October",
    peakSeason: "July - October",
    primeHour: "Morning trips produce the most consistent action, with early-morning trolling and surface fishing peaking in the first few hours after dawn. Night fishing can also be productive when fish are feeding near the surface.",
    avgSize: "15-35 pounds",
    bagLimit: "25 fish",
    sizeLimit: "none",
    migrationPatterns: "Albacore travel in large schools across the Pacific, following temperature breaks and bait concentrations. They arrive in San Diego offshore waters from July through October, typically found 50–150 miles offshore where water temps hit 60–68°F.",
    idealTides: "Not as particular",
    idealDepths: "Primarily targeted at the surface during trolling and live-bait fishing. Schools often hold just below the thermocline at 30–100 feet, rising to feed at the surface during morning hours.",
    waterTemp: "60-68 degrees F",
    bait: "Live anchovies are the premier bait, fished on small hooks with light leaders. Feathers, cedar plugs, and bone jigs are the standard trolling setup at 6–8 knots. Squid also produces well.",
    gear: "Medium spinning tackle with 20–30 lb line is typical. Light conventional outfits with 25–40 lb line are also popular. Long trolling spreads of 6–8 lures at varying distances are standard for locating schools.",
    visionAndColor: "Albacore can be selective — smaller hooks and lighter leaders in clear offshore water produce more bites. When trolling, mixing lure colors (green/yellow, blue/white, chrome) helps identify what fish want on a given day.",
    filletRules: "Fillets may be of any size but must bear an intact one-inch square patch of skin for identification.",
    mustKnow: "Daily bag limit is 25 fish with no minimum size — one of the most generous limits of any offshore species. No closed season in California waters. A Mexican fishing license is required if fishing near the Coronado Islands or into Mexican waters. Albacore are the only tuna legally labeled 'white tuna' for commercial canning purposes.",
    locations: JSON.stringify([
      { name: "50–150 miles offshore (temperature breaks)", note: "Albacore school along temperature breaks in cooler water; troll along the edge of 62–66°F water for best results." },
      { name: "Tanner Bank area", note: "Offshore bank where cool water upwellings concentrate bait and hold albacore; reliable when fish are in range." },
      { name: "Offshore of Ensenada (Mexican waters)", note: "Mexican offshore waters often hold albacore earlier in the season before fish push north; Mexican license required." },
      { name: "Catalina Island vicinity", note: "In good years, albacore push as close as Catalina, making them accessible from SD on day trips when fish are close." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "July through September is peak, with some years seeing fish into October. Follow the sea surface temperature reports — albacore want 62–66°F water, so find that break and troll it." },
      { category: "Local Trick", tip: "When you mark fish on sonar but they won't hit trolling lures, slow-troll live anchovies at 2–3 knots. Albacore that are 'scratchy' respond to livebait presentations when they ignore artificials." },
      { category: "Bait Shop", tip: "H&M Landing and Seaforth both run albacore trips and sell live bait. Sign up for overnight or 1.5-day trips when fish are far — the best albacore fishing often requires a run of 100+ miles." },
      { category: "SD Tip", tip: "Albacore are schooling fish — once you find one, you've found hundreds. When a hook-up happens while trolling, immediately stop the boat and switch to live bait. The school will stay up if you keep fish in the water." },
    ]),
    communityPosts: JSON.stringify([
      { username: "AlbacoreAce_SD", date: "Aug 22, 2024", time: "5:00 AM", location: "~100 mi offshore, temperature break", weight: "28 lbs", gear: "Cedar plug trolling, then switched to live anchovy", note: "Found the 64°F break, marked fish on sonar, and went wide open on live bait. Incredible day." },
      { username: "LongRange_Lisa", date: "Sep 10, 2024", time: "6:30 AM", location: "Tanner Bank area", weight: "22 lbs", bait: "Live anchovy", waterTemp: "63°F", note: "Overnight trip. Worth every penny — limited out by 10am." },
      { username: "TrollerSD", date: "Jul 19, 2024", time: "7:15 AM", location: "~80 mi SW of Point Loma", weight: "31 lbs", gear: "Green/yellow feather, then live bait", tide: "Slack" },
    ]),
    maxWeightLbs: 88,
  },
  {
    name: "Pacific Bonito",
    icon: "🐟",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e3/Sachi_u0.gif",
    color: "#2F6B9E",
    zone: Zone.NEARSHORE,
    season: "April - November",
    peakSeason: "April - November",
    primeHour: "Most active in the morning and evening feeding windows. Early-morning surface boils are common, and bonito often follow birds and baitfish near kelp beds and nearshore structure.",
    avgSize: "3-8 pounds",
    bagLimit: "10 fish",
    sizeLimit: "none",
    migrationPatterns: "Pacific bonito are coastal migrants that appear in San Diego waters in spring as water warms and push south or offshore as temperatures cool in late fall. They are found in kelp beds, nearshore structure, and offshore waters chasing bait schools.",
    idealTides: "Not as particular",
    idealDepths: "Surface to 100 feet. Most commonly found feeding at or near the surface around kelp beds, rocky points, and offshore structure. They crash baitballs aggressively and can be visible as surface boils.",
    waterTemp: "60-72 degrees F",
    bait: "Small swimbaits, feather jigs, and live anchovies are the top producers. Bonito are aggressive and will hit almost anything resembling a small baitfish. Fast retrieves trigger the most strikes.",
    gear: "Light spinning tackle with 10–15 lb line is ideal. Bonito are fast, strong fighters and light gear maximizes the sport. Small metal jigs, feathers, and swimbaits on 1/4–1/2 oz heads are standard.",
    visionAndColor: "Fast, aggressive feeders — retrieve speed matters more than color. A fast, erratic retrieve mimicking fleeing baitfish triggers their predatory instinct. Chrome, green, and blue/white patterns are consistent producers.",
    filletRules: "No minimum fillet size, but fillets should retain a patch of skin for identification. Bonito are best eaten fresh or smoked — the dark meat deteriorates quickly on ice.",
    mustKnow: "Bag limit is 10 fish per day with no minimum size and no closed season. Pacific bonito may be taken by any legal method including from piers and shore without a vessel. No special permits required. Like all sport-caught fish in California, bonito may not be bought or sold.",
    locations: JSON.stringify([
      { name: "La Jolla Kelp Beds", note: "Bonito cruise the outer kelp edges chasing anchovies; accessible by kayak or small boat and one of the most consistent nearshore spots." },
      { name: "Point Loma Kelp", note: "Rocky points and kelp edges along the peninsula concentrate bonito on baitfish; visible as surface boils on calm mornings." },
      { name: "Ocean Beach Pier", note: "Bonito regularly pass within casting distance of the OB Pier during peak season; metal jigs and feathers work well from the pier." },
      { name: "Coronado Islands", note: "High numbers of bonito around the islands during peak season; often caught incidentally while targeting yellowtail and calico bass." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "April through October is the window. Best fishing is during bonito 'boils' — when you see birds diving and baitfish skipping across the surface, get there fast. The bite can be wide-open for 20 minutes, then gone." },
      { category: "Local Trick", tip: "Match the size of your lure to the baitfish. When bonito are keyed on tiny anchovies, a 1-inch chrome metal jig on light line will outfish bigger lures 10 to 1. Downsize your presentation when fish are being picky." },
      { category: "Bait Shop", tip: "Squidco and local tackle shops carry the small feather jigs and metal lures that are the bread-and-butter for bonito. Ask about current kelp bed activity — when bonito are in the kelp, the shops know first." },
      { category: "SD Tip", tip: "Bonito are heavily underrated as table fare. Bleed them immediately after catching, put them on ice, and either grill fresh or smoke them. SD locals know smoked bonito is delicious — most visitors are surprised." },
    ]),
    communityPosts: JSON.stringify([
      { username: "BonitoKing_SD", date: "Jun 12, 2024", time: "6:45 AM", location: "La Jolla Kelp Beds", weight: "7.2 lbs", gear: "Chrome metal jig, fast retrieve", note: "Found a massive boil at dawn. Caught and released 8 fish in an hour. What a morning." },
      { username: "KayakFisher619", date: "Aug 7, 2024", time: "7:30 AM", location: "Point Loma Kelp, outer edge", weight: "5.8 lbs", bait: "Small feather jig", tide: "Outgoing" },
      { username: "PierCaster_OB", date: "May 25, 2024", time: "8:00 AM", location: "Ocean Beach Pier", weight: "4.1 lbs", gear: "Blue/white feather, 1oz", note: "Caught 5 from the pier before 9am. Kept 2 for smoking, released the rest." },
    ]),
    maxWeightLbs: 22,
  },
  {
    name: "Barred Surfperch",
    icon: "🌊",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/d/da/Amphistichus_argenteus_1394015.jpg",
    color: "#8B7355",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "December - April",
    primeHour: "Most productive during the two hours before and after high tide. Early morning sessions on incoming tides are especially productive during peak winter-spring season.",
    avgSize: "0.5-2 pounds",
    bagLimit: "20 fish",
    sizeLimit: "none",
    migrationPatterns: "Year-round residents of San Diego's sandy surf zones and bays. They move into the shallow surf zone most actively during winter and spring — the prime spawning period — then disperse to slightly deeper water in summer.",
    idealTides: "Last two hours of incoming tide",
    idealDepths: "Extremely shallow — found in the wash zone from inches of water out to about 20 feet. They root through sand in the swash zone following sand crabs uncovered by wave action.",
    waterTemp: "55-68 degrees F",
    bait: "Sand crabs are the top bait — fresh-dug live crabs from the swash zone are the gold standard. Bloodworms, mussels, ghost shrimp, and small grubs also produce consistently.",
    gear: "Light surf rod (8–10 ft) with 8–10 lb line and small size 4–6 hooks. Carolina rigs and high-low rigs are standard. Keep the weight light — 1/4 to 1/2 oz is usually sufficient in the surf zone.",
    visionAndColor: "Primarily bottom feeders using smell and vibration to locate food. Natural-scent baits dramatically outperform artificials. Fresh bait is critical — stale sand crabs or old bloodworms are significantly less effective.",
    filletRules: "No special fillet rules for surfperch. They are small fish best cooked whole or as small fillets. No skin patch requirement, but fillets should be kept properly iced.",
    mustKnow: "Bag limit is 20 fish per day with no minimum size and no closed season — one of the most generous limits of any California surf species. No special permits or vessel required; legal to take from shore, piers, and beaches. A valid California sport fishing license is required for anglers 16 and older.",
    locations: JSON.stringify([
      { name: "Mission Beach Surf Zone", note: "Classic SD surfperch beach; long sandy stretch with consistent sand crab populations and reliable winter action during incoming tides." },
      { name: "Ocean Beach / Dog Beach Area", note: "Sandy surf with easy access; consistent surfperch action year-round with peak bite in winter and spring." },
      { name: "Silver Strand / Coronado Beach", note: "Long, protected beach south of Coronado with excellent surfperch habitat and significantly less angling pressure than Mission Beach." },
      { name: "Mission Bay Channels", note: "Barred surfperch are common in Mission Bay year-round; light tackle with small grubs or bait fished near sandy bottom produces consistent results." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "December through April is prime for the biggest fish. The incoming tide window — especially the last two hours before high — is when surfperch push onto the shallow sand to feed on exposed sand crabs." },
      { category: "Local Trick", tip: "Dig your own sand crabs from the swash zone — a small sand crab rake or your hands work fine. Freshly dug live crabs on a size 6 hook dramatically outperform store-bought bait for surfperch." },
      { category: "Bait Shop", tip: "Most SD surf shops and beach-area bait shops carry bloodworms and small hooks. Sand crabs can be dug for free from any sandy beach — look for V-shaped ripples in the wave wash where crabs are most concentrated." },
      { category: "SD Tip", tip: "Surfperch are legal to keep year-round with a 20-fish limit — one of the most generous limits in California. They are underrated table fare: mild white meat that's excellent fried or baked. Great beginner species for kids." },
    ]),
    communityPosts: JSON.stringify([
      { username: "SurfPerchStan", date: "Jan 18, 2024", time: "7:30 AM", location: "Mission Beach surf zone", weight: "1.8 lbs", bait: "Fresh sand crab", tide: "Incoming high", note: "Hit 12 fish before 9am. Peak winter bite is real — bigger fish than summer, more aggressive." },
      { username: "CoronadoCaster", date: "Mar 5, 2024", time: "6:45 AM", location: "Silver Strand Beach", weight: "2.1 lbs", bait: "Bloodworm on high-low rig", note: "Way less crowded than Mission Beach with great fishing. Kept 6 for the table." },
      { username: "BeachBum_OB", date: "Feb 10, 2024", time: "8:00 AM", location: "Ocean Beach surf", weight: "1.5 lbs", bait: "Sand crab", tide: "Incoming" },
    ]),
    maxWeightLbs: 4,
  },
  {
    name: "Leopard Shark",
    icon: "🦈",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1e/Leopard_shark_in_kelp.jpg",
    color: "#6B6B6B",
    zone: Zone.NEARSHORE,
    season: "Year-round",
    peakSeason: "June - October",
    primeHour: "Most active during high tides when they push into the shallows to feed. Dawn and dusk are productive, but leopard sharks can be caught throughout the day on a good tide.",
    avgSize: "3-5 feet / 8-20 pounds",
    bagLimit: "3 fish over 36 inches",
    sizeLimit: "36 inches total length minimum",
    migrationPatterns: "Year-round residents of San Diego Bay, Mission Bay, and adjacent nearshore waters. They aggregate in large numbers in warm, shallow bays from June through October, then disperse to slightly deeper water in cooler months.",
    idealTides: "Incoming high",
    idealDepths: "Very shallow — 2 to 20 feet. Leopard sharks are famous for cruising visible in water as shallow as knee-deep on warm summer days, especially in San Diego Bay and Mission Bay on high tides.",
    waterTemp: "60-72 degrees F",
    bait: "Squid is the top bait for leopard sharks, fished whole or in strips on a bottom rig. Mackerel, sardines, and ghost shrimp also work. Fresh, smelly bait is essential — they hunt primarily by scent.",
    gear: "Medium bottom rig with 20–30 lb line. Larger hooks (4/0–6/0) are typical for targeting bigger fish. A Carolina rig or simple fish-finder rig with a sliding sinker works well in calm bay conditions.",
    visionAndColor: "Hunts almost entirely by scent and electroreception — the fresher and smellier the bait, the better. Visual presentation is irrelevant; scent trail is everything. Change bait often to maintain a fresh scent.",
    filletRules: "Legal sharks over 36 inches may be kept. Prepare using standard shark-filleting techniques. Leopard shark meat is mild and good eating when bled immediately and kept cold. Avoid freezer burn — eat fresh.",
    mustKnow: "Bag limit is 3 fish per day with a 36-inch total length minimum — undersized fish must be released immediately and carefully. Leopard sharks may not be bought or sold recreationally. No closed season, but take care in Mission Bay and San Diego Bay where aggregations form near popular swimming and diving areas.",
    locations: JSON.stringify([
      { name: "San Diego Bay flats", note: "The premier SD leopard shark fishery; large aggregations in shallow, warm water from June through October — sometimes visible in water only 2–3 feet deep." },
      { name: "Mission Bay shallows", note: "Warm, protected bay with extensive shallow flats; leopard sharks are common year-round and often seen cruising near the surface on calm days." },
      { name: "La Jolla Shores (Underwater Park)", note: "Leopard sharks aggregate in large numbers at La Jolla Shores from July–October; primarily a viewing/diving experience, but legal to fish in non-protected areas nearby." },
      { name: "Chula Vista / South Bay", note: "Shallow, warm mud flats in South Bay hold leopard sharks in summer; less pressure and good access from shore." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through October in San Diego Bay on a high incoming tide is the gold standard. Fish push so shallow they're sometimes visible in a foot of water — exciting stalking opportunities on calm mornings." },
      { category: "Local Trick", tip: "Use very fresh squid — if it smells strong, it's working. Cast uptide of where you see fish moving and let the scent drift to them. Leopard sharks will turn and follow a scent trail directly to the bait." },
      { category: "Bait Shop", tip: "Bait shops near San Diego Bay and Mission Bay carry squid year-round. Fresh-thawed squid works well — whole or in strips. Cut bait releases more scent than whole bait." },
      { category: "SD Tip", tip: "The La Jolla Shores leopard shark aggregation (July–October) is world-famous among divers and snorkelers. Many visiting anglers come just to see them — the sharks are completely harmless and docile." },
    ]),
    communityPosts: JSON.stringify([
      { username: "SharkStalker_SD", date: "Jul 30, 2024", time: "8:15 AM", location: "San Diego Bay flats, near NAB", weight: "~18 lbs", bait: "Fresh squid strip", tide: "High incoming", note: "Could see her cruising in 3 feet of water. Two casts later she inhaled the squid. Released after photos." },
      { username: "BayWader619", date: "Aug 14, 2024", time: "7:00 AM", location: "Mission Bay shallow flats", weight: "~12 lbs", bait: "Whole squid, carolina rig", note: "Watched 4 sharks cruise through in 90 minutes. Caught 2, released both. Beautiful animals." },
      { username: "LaJolla_Diver", date: "Sep 5, 2024", time: "9:30 AM", location: "La Jolla Shores", weight: "~15 lbs", note: "Snorkeled with 30+ leopard sharks — then grabbed a rod nearby. Released immediately. The aggregation is a sight to behold." },
    ]),
    maxWeightLbs: 70,
  },
  {
    name: "Swordfish",
    icon: "⚔️",
    imageUrl: "https://www.fisheries.noaa.gov/s3//styles/original/s3/2022-09/640x427-Swordfish-NOAAFisheries.png",
    color: "#2C3E50",
    zone: Zone.OFFSHORE,
    season: "June - October",
    peakSeason: "June - October",
    primeHour: "Midday is prime for daytime swordfishing — fish rise toward the surface from deep water as the sun heats the water column. Look for finning or basking fish on calm days between 10am and 3pm.",
    avgSize: "100-300 pounds",
    bagLimit: "1 fish",
    sizeLimit: "47 inches lower jaw fork length minimum",
    migrationPatterns: "Swordfish are highly migratory, following deep-water prey in the mesopelagic zone. San Diego is one of the top daytime swordfish ports in the world — fish are present in deep canyons and offshore waters year-round but most accessible June through October when calm conditions allow visual spotting.",
    idealTides: "Not as particular",
    idealDepths: "Deep water — 1,000 to 2,000 feet is typical target depth for deep-drop fishing. For daytime visual fishing, swordfish fin at the surface in 400–1,500 feet of water. One of the most technically demanding fisheries in Southern California.",
    waterTemp: "65-75 degrees F",
    bait: "Squid is the top bait for both deep-drop and visual presentations. Large rigged mackerel and belly flaps are also used. For deep-drop, bait is rigged on weighted electric reel setups lowered to 1,000–2,000 feet.",
    gear: "Heavy conventional tackle with 80–130 lb line. Electric reels (Shimano Dendou-Maru or similar) are standard for deep-drop fishing. For visual presentations, a lighter spinning or conventional setup is used to pitch bait to finning fish.",
    visionAndColor: "Daytime swordfishing relies on visual spotting — polarized sunglasses and calm seas are essential. Fish bask and fin at the surface to warm up and digest. Once spotted, the approach and presentation must be slow and precise.",
    filletRules: "Swordfish may NOT be filleted at sea. Fish must be landed whole with the head and all fins intact for species ID and legal size verification. When processing ashore, fillets must retain the entire skin for identification. Violation is a serious offense.",
    mustKnow: "Bag limit is 1 fish per day with a 47-inch lower jaw fork length minimum. No filleting at sea — swordfish must be landed whole with head and fins attached. A Mexican fishing license is required when fishing in Mexican waters. Highly migratory species regulations can change mid-season; always verify current limits with CDFW before your trip.",
    locations: JSON.stringify([
      { name: "20–60 miles offshore (deep canyons)", note: "San Diego Canyon and adjacent deep-water habitat hold swordfish; target areas where 1,000+ foot depth is accessible within a reasonable run." },
      { name: "San Diego Trough", note: "Deep offshore basin southwest of San Diego where swordfish are regularly spotted finning on calm summer days." },
      { name: "Cortes Bank (deep water)", note: "Distant offshore seamount in extremely deep water; long run but productive for swordfish and other pelagic species in peak season." },
      { name: "Offshore of Ensenada (deep water)", note: "Mexican offshore deep water holds swordfish in the same habitat; Mexican fishing license required, but productive for daytime visual fishing." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through October during calm weather windows. Flat, glassy conditions are essential for spotting finning swordfish. Even a 5-knot wind makes visual spotting nearly impossible — watch the weather closely and go on calm days." },
      { category: "Local Trick", tip: "When approaching a finning swordfish, cut the engine well before reaching the fish and drift quietly into position. Swordfish are skittish on the surface — a noisy approach will put them down immediately." },
      { category: "Bait Shop", tip: "H&M Landing and Point Loma Sportfishing run dedicated swordfish charter trips with experienced crews who know the deep-water canyons. Book a charter before attempting to target swordfish independently — the technique requires specialized knowledge." },
      { category: "SD Tip", tip: "San Diego captains essentially created modern daytime swordfishing — this port is world-renowned for it. Local crews are very skilled and often willing to share general tips at the landing. The community around daytime swordfishing in SD is passionate and knowledgeable." },
    ]),
    communityPosts: JSON.stringify([
      { username: "BroadbillBob_SD", date: "Jul 22, 2024", time: "12:30 PM", location: "~40 mi offshore, San Diego Trough", weight: "187 lbs", bait: "Rigged squid, visual presentation", note: "Spotted her finning at 200 yards. Perfect approach, perfect pitch. The take was unreal. Dream fish." },
      { username: "DeepDropDave", date: "Aug 19, 2024", time: "11:00 AM", location: "25 miles offshore, 1,500ft drop", weight: "142 lbs", gear: "Electric reel, 130lb conventional, squid deep-drop", waterTemp: "71°F" },
      { username: "SoCal_Swordmaster", date: "Sep 8, 2024", time: "1:15 PM", location: "Offshore canyon, ~50 mi SW", weight: "224 lbs", bait: "Live mackerel on float", note: "Third swordfish of the season. SD is the best port in the world for daytime broadbill. Period." },
    ]),
    maxWeightLbs: 500,
  },
  {
    name: "Wahoo (Ono)",
    icon: "🐡",
    imageUrl: "https://media.fisheries.noaa.gov/2022-08/640x427-Wahoo-NOAAFisheries.png",
    color: "#1A6B8A",
    zone: Zone.OFFSHORE,
    season: "July - October",
    peakSeason: "August - October",
    primeHour:
      "Wahoo feed most aggressively at first light and early morning. Trolling lures at the surface in the pre-dawn to mid-morning window produces the most strikes, as fish are actively hunting before the sun gets high.",
    avgSize: "20-60 pounds",
    bagLimit: "10 fish",
    sizeLimit: "none",
    migrationPatterns:
      "Wahoo arrive in San Diego offshore waters in July when warm water eddies push north from Baja California. Their presence is closely tied to sea surface temperatures — they rarely appear when surface temps drop below 70°F. El Niño years with warmer-than-normal water push large numbers much closer to the coast.",
    idealTides: "Any",
    idealDepths:
      "Found in open ocean from the surface down to 300 feet, typically near temperature breaks, floating kelp paddies, and underwater structure at offshore banks. High-speed trolling covers open water to locate scattered fish, then live bait can be deployed once a school is found.",
    waterTemp: "70-82 degrees F",
    bait: "High-speed trolling lures (Rapalas, Zukers, skirted lures) are the primary method. Once fish are located, live mackerel fly-lined or on a slow troll is deadly. Large swimbaits trolled at moderate speed also produce. Wire leaders are non-negotiable — their razor teeth will cut through any monofilament instantly.",
    gear: "Heavy conventional tackle rated for 50–80 lb braided line. Wire leaders (single-strand #9 or #10, or 7-strand coated wire) are required — no exceptions. Trolling speed of 8–14 knots is the trigger, far faster than other tuna species. Quality snap swivels rated for the speed and weight are essential to prevent line twist.",
    visionAndColor:
      "Wahoo are visually oriented, high-speed predators. Bright, flashy lures in blue/white, green/yellow, and pink/purple work best. The speed of the retrieve matters more than color — a lure running fast and true will draw strikes when a slow one won't.",
    filletRules:
      "Fillets may be of any size but must bear an intact one-inch square patch of skin for species identification. Wahoo have a distinctive blue-striped skin that makes identification easy.",
    mustKnow:
      "Bag limit is 10 fish per day with no minimum size. Wire leaders are mandatory — teeth will cut monofilament on first contact. A valid California sport fishing license is required. When fishing near the Coronado Islands or other Mexican waters, a Mexican fishing license is also required.",
    locations: JSON.stringify([
      { name: "Offshore banks (20–60 miles)", note: "Temperature breaks and underwater structure at offshore banks concentrate baitfish that wahoo follow; run offshore and troll until you find the right temperature break." },
      { name: "Cortez Bank", note: "Distant offshore seamount (110 miles west) holds wahoo during warm-water years; long run but historically excellent for large wahoo in August–September." },
      { name: "Warm water temperature breaks", note: "The edge where warm blue water meets cooler green water is prime wahoo territory; troll along the break at speed in both directions." },
      { name: "Floating kelp paddies (offshore)", note: "Floating kelp mats 30–60 miles offshore hold mackerel and baitfish that attract wahoo; slow down to deploy live bait once fish are located near a paddy." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "July through October is the window, but August and September in El Niño years are peak. Check SST charts on Hilton's Offshore or Savvy Navvy — if 70°F+ water is within 40 miles, wahoo are possible." },
      { category: "Local Trick", tip: "Wire leaders are not optional — wahoo will cut through 400 lb monofilament in a single pass. Use single-strand #9 wire or 7-strand coated wire. Anglers who skip wire lose fish, period." },
      { category: "Bait Shop", tip: "H&M Landing and Seaforth Landing have staff with up-to-date intel on warm water locations and wahoo sightings. Wahoo trips often combine with yellowfin and bluefin fishing — book an offshore combo trip in August." },
      { category: "SD Tip", tip: "Wahoo are one of the best-eating fish in the ocean — white, firm meat that makes incredible poke, sashimi, and grilled steaks. Bleed and ice immediately after landing for the best quality." },
    ]),
    communityPosts: JSON.stringify([
      { username: "WahooWendy_SD", date: "Sep 12, 2024", time: "6:30 AM", location: "Temperature break, ~45 mi offshore", weight: "38 lbs", bait: "High-speed Rapala, wire leader", note: "Third pass on the break. Screaming run — we thought it was a tuna until it jumped. Personal best wahoo!" },
      { username: "OffshoreOno619", date: "Aug 28, 2024", time: "7:00 AM", location: "Cortez Bank area", weight: "52 lbs", gear: "Skirted lure on 80lb braid, wire leader", waterTemp: "74°F", note: "Long run but absolutely worth it. Two wahoo and a yellowfin in the same area." },
      { username: "TempBreak_Troller", date: "Oct 3, 2024", time: "6:15 AM", location: "Offshore kelp paddy, ~35 mi SW", weight: "29 lbs", bait: "Live mackerel after locating on troll", tide: "Slack", note: "Found the paddy on the troll, switched to live mac, instant bite. Released one, kept one." },
    ]),
    maxWeightLbs: 180,
  },
  {
    name: "Pacific Barracuda",
    icon: "🐟",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/8/8f/Sphyraena_argentea.jpg",
    color: "#5A7A5A",
    zone: Zone.OFFSHORE,
    season: "April - October",
    peakSeason: "May - August",
    primeHour:
      "Morning and evening are most productive, with the first two hours of daylight often delivering fast action. Barracuda school near the surface at dawn and become more scattered and harder to target once the sun is high.",
    avgSize: "4-8 pounds",
    bagLimit: "10 fish",
    sizeLimit: "none",
    migrationPatterns:
      "Pacific barracuda move into San Diego kelp beds and nearshore offshore waters in April as water temperatures warm above 60°F. Peak numbers arrive May–June and fish remain through August before retreating south as water cools. Large schools are common in warm-water years.",
    idealTides: "Incoming",
    idealDepths:
      "Surface to 60 feet, with most fish caught near the top 20 feet of the water column. They favor kelp edges, open water over reefs, and anywhere baitfish are concentrated near the surface.",
    waterTemp: "60-72 degrees F",
    bait: "Iron jigs and surface iron are the classic San Diego method — the traditional chrome 'scrambled egg' and blue/white patterns are top producers. Live anchovies work well on light leaders. Fast-retrieved swimbaits in natural baitfish colors also draw strikes. Speed is key — slow retrieves rarely work.",
    gear: "Medium spinning or conventional tackle with 15–20 lb main line. Wire leaders (6–9 inches of light wire) are recommended as their teeth can cut through light mono; however, lighter fluorocarbon leaders (20–30 lb) in clear water sometimes get more bites. Treble hooks on iron jigs significantly improve hookup rates.",
    visionAndColor:
      "Barracuda have excellent vision and can be leader-shy in clear water. In murky or choppy conditions use wire freely; in calm, clear water drop to lighter fluorocarbon leaders for more bites. Chrome, blue/white, and green patterns dominate.",
    filletRules:
      "Fillets may be of any size but must retain an intact one-inch square patch of skin for species identification.",
    mustKnow:
      "Bag limit is 10 fish per day with no minimum size. A valid California sport fishing license is required. Barracuda have a reputation for following lures to the boat — keep eyes on your lure all the way through the retrieve and be ready for a last-second strike.",
    locations: JSON.stringify([
      { name: "La Jolla Kelp Beds", note: "Dense kelp canopy provides ideal barracuda habitat; fish concentrate along the outer kelp edges where current moves baitfish through regularly." },
      { name: "Point Loma Kelp Forest", note: "Miles of kelp along the peninsula hold schools of barracuda in season; accessible from the launch ramps at Point Loma Sportfishing." },
      { name: "Coronado Islands area", note: "Waters around the Coronado Islands hold barracuda mixed with yellowtail in season; just 15 miles from San Diego Bay." },
      { name: "Offshore open water", note: "Schools of barracuda chase baitfish in open water offshore, especially where birds are working the surface; troll or run-and-gun with iron jigs." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "May through July is peak for numbers. First and last light are critical — barracuda school tight on the surface at dawn and hit surface iron hard before the sun drives them deeper." },
      { category: "Local Trick", tip: "Fast retrieves are the key. Barracuda will follow a lure for 30 feet at full speed and then commit. If fish are swirling behind your lure but not biting, speed up — don't slow down." },
      { category: "Bait Shop", tip: "H&M Landing, Seaforth, and Point Loma Sportfishing all have current reports on barracuda locations. Party boat crews know which kelp beds are holding fish and will put you on them." },
      { category: "SD Tip", tip: "Barracuda are excellent smoked — they're one of the best smoking fish available in San Diego. Fillet and brine overnight, then cold smoke for a few hours. Local charter crews eat smoked barracuda all summer." },
    ]),
    communityPosts: JSON.stringify([
      { username: "IronJig_Ivan", date: "Jun 18, 2024", time: "6:00 AM", location: "La Jolla Kelp outer edge", weight: "7.2 lbs", gear: "Chrome iron, fast retrieve", note: "School was stacked on the surface at first light. Hit 8 fish in 30 minutes on iron. Classic SD barracuda morning." },
      { username: "KelpEdge_Kris", date: "Jul 4, 2024", time: "7:15 AM", location: "Point Loma kelp, north end", weight: "5.8 lbs", bait: "Live anchovy", tide: "Incoming", note: "Happy 4th! Picked up a limit before the fireworks crowds showed up. Great eating fish." },
      { username: "SurfaceIron_SD", date: "May 22, 2024", time: "6:45 AM", location: "Coronado Islands, north side", weight: "9.1 lbs", gear: "Blue/white surface iron", waterTemp: "64°F", note: "Biggest barracuda I've ever seen. Made 4 blistering runs before coming to the boat. Released — she was too pretty." },
    ]),
    maxWeightLbs: 15,
  },
  {
    name: "Thresher Shark",
    icon: "🦈",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/b/be/Alopias_vulpinus_noaa2.jpg",
    color: "#4A5568",
    zone: Zone.OFFSHORE,
    season: "May - October",
    peakSeason: "July - September",
    primeHour:
      "Dawn is absolutely critical for thresher sharks. The first two hours of daylight — from pre-dawn gray light through the first hour of full sun — accounts for the vast majority of hook-ups. Threshers use their long tail to stun prey near the surface at first light, making them highly accessible. By mid-morning they typically descend to deeper water.",
    avgSize: "100-200 pounds",
    bagLimit: "2 fish",
    sizeLimit: "none",
    migrationPatterns:
      "Thresher sharks move into San Diego offshore waters May–June, following mackerel and baitfish schools. The fishery peaks July–September when warm water pushes baitfish to the surface and threshers actively hunt at dawn. They follow mackerel schools closely — where there are mackerel schools offshore, threshers are typically present.",
    idealTides: "Any",
    idealDepths:
      "Surface to 200 feet, but most fish are encountered at or near the surface in early morning. Threshers use their distinctive long tail to stun prey in the upper water column. By mid-morning they typically drop to 100–200 feet as the surface warms.",
    waterTemp: "60-72 degrees F",
    bait: "Live mackerel is the top bait for San Diego threshers. Live bonito also works extremely well. Squid and large chunk baits produce results when live bait is unavailable. Circle hooks (9/0–12/0) are strongly recommended to improve landing rates and reduce gut hooking.",
    gear: "Heavy conventional tackle with 50–80 lb braided or monofilament line. Circle hooks are strongly recommended — they dramatically improve hookup rates with threshers since the fish often hits the bait with its tail first. A strong, reliable drag system is essential as threshers make long, powerful runs.",
    visionAndColor:
      "Threshers rely on their long tail to stun prey and may approach bait from multiple directions. Large, lively baits draw the most attention. Natural colors — mackerel patterns, brown/silver — are most effective.",
    filletRules:
      "Shark fillets must retain a one-inch square patch of skin for identification. Thresher shark has a distinctive cross-hatched skin pattern.",
    mustKnow:
      "Bag limit is 2 fish per day (combined thresher species — common, bigeye, and pelagic thresher combined). No minimum size. A valid California sport fishing license is required PLUS a CDFW Shark and Ray Report Card, which must be purchased separately and carried while fishing. All sharks and rays retained must be recorded on the card immediately upon landing.",
    locations: JSON.stringify([
      { name: "6–25 miles offshore", note: "The heart of the SD thresher fishery; drift live mackerel at dawn in open water 6–25 miles out and work areas where birds are working surface bait." },
      { name: "Coronado Islands area", note: "Waters around the Coronado Islands hold large mackerel schools that concentrate threshers; 15 miles from the bay with consistently productive early-morning drifting." },
      { name: "Offshore banks (mackerel schools)", note: "Wherever large mackerel schools are concentrated offshore, threshers are typically present; check sonar for bait marks and drift nearby at dawn." },
      { name: "9-Mile Bank vicinity", note: "The bank and surrounding open water holds bait concentrations that draw threshers; accessible without a very long run and productive throughout the season." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "Dawn is everything — set up your drift before first light and be ready when the sky starts to gray. The first 90 minutes of daylight is when 80% of thresher bites happen. If it hasn't happened by 9am, the morning bite is over." },
      { category: "Local Trick", tip: "Circle hooks are a game-changer for threshers. Because they often stun bait with their tail before turning to eat, a J-hook misses many fish. Circle hooks 9/0–12/0 hook up in the corner of the mouth and rarely gut-hook." },
      { category: "Bait Shop", tip: "H&M Landing and Fisherman's Landing sell live mackerel specifically for thresher fishing. Get there early — live mac sells out fast on weekends during peak season. Some captains run dedicated thresher trips." },
      { category: "SD Tip", tip: "Thresher meat is exceptional — firm, white, and similar to swordfish. Treat it exactly like swordfish on the grill: season simply, high heat, don't overcook. Bleed and ice immediately after landing for best quality." },
    ]),
    communityPosts: JSON.stringify([
      { username: "DawnPatrol_SD", date: "Aug 7, 2024", time: "5:45 AM", location: "~18 miles offshore, SW of Point Loma", weight: "142 lbs", bait: "Live mackerel, 10/0 circle hook", tide: "Incoming", note: "Bite came 20 minutes after first light. 45-minute fight. Circle hook was perfect — corner of mouth. Released her." },
      { username: "ThresherMike619", date: "Jul 19, 2024", time: "6:00 AM", location: "Coronado Islands area, open water", weight: "178 lbs", gear: "80lb mono, 12/0 circle, live bonito", waterTemp: "68°F", note: "Personal best. Bonito was the key — mackerel wasn't working. Three runs that stripped 200 yards each time." },
      { username: "SharkDawn_Andrea", date: "Sep 1, 2024", time: "5:30 AM", location: "9-Mile Bank vicinity", weight: "115 lbs", bait: "Live mackerel", note: "Limit of 2 by 7am. Both fish caught on circle hooks before the sun got above the horizon. Dawn patrol pays off every time." },
    ]),
    maxWeightLbs: 500,
  },
  {
    name: "Skipjack Tuna",
    icon: "🐠",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Katsuwonus_pelamis_%28USNM-443178%29.jpg",
    color: "#2D6A8F",
    zone: Zone.OFFSHORE,
    season: "June - November",
    peakSeason: "July - October",
    primeHour:
      "Morning is most productive for skipjack. Schools are active near the surface from dawn through mid-morning, making them highly accessible to surface iron and small lures. Skipjack often signal the presence of larger tuna species nearby.",
    avgSize: "4-12 pounds",
    bagLimit: "25 fish",
    sizeLimit: "none",
    migrationPatterns:
      "Skipjack follow warm water north from Baja California each June–July. They are frequently found mixed with yellowfin and bluefin tuna schools, often as the first fish encountered when searching for larger tuna offshore. They track temperature breaks and baitfish concentrations throughout the season.",
    idealTides: "Any",
    idealDepths:
      "Surface to 100 feet in open ocean. Skipjack are highly visible when feeding — they create large, splashy boils on the surface that attract birds and can be seen from distance. They also show well on sonar suspended at 50–100 feet.",
    waterTemp: "65-75 degrees F",
    bait: "Small feather jigs and chrome iron produce fast action when fish are boiling. Small swimbaits in anchovy or sardine colors work well. Live anchovies are highly effective and produce the most consistent hookups. Small 1/2–1 oz iron jigs in blue/white or green/yellow are classics.",
    gear: "Light to medium spinning tackle rated for 15–20 lb line. Small hooks (size 2 to 1/0) match the smaller baitfish skipjack are feeding on. A fast-action rod is ideal for the quick, aggressive strikes. Fluorocarbon leader 20–30 lb is sufficient.",
    visionAndColor:
      "Skipjack respond well to anything that looks like a small baitfish moving fast. Anchovy-colored patterns (green back, silver sides) are consistent producers. Match the size of your offering to the bait they're feeding on — small baits often outperform large ones.",
    filletRules:
      "Fillets may be of any size but must bear an intact one-inch square patch of skin for identification.",
    mustKnow:
      "Bag limit is 25 fish per day with no minimum size. A valid California sport fishing license is required. When fishing near the Coronado Islands or in Mexican waters, a Mexican fishing license is also required. Skipjack are an important indicator species — where you find them, larger tuna are often present below.",
    locations: JSON.stringify([
      { name: "Offshore 15–50 miles", note: "The primary skipjack zone; run offshore until temperature breaks and bait concentrations are located, then look for surface boils and bird activity." },
      { name: "Temperature breaks", note: "The edge where warm blue water meets cooler green water concentrates baitfish and holds skipjack along with other tuna species." },
      { name: "Offshore kelp paddies", note: "Floating kelp mats attract baitfish that draw skipjack; birds working over a paddy often indicate skipjack and sometimes larger tuna below." },
      { name: "Mixed tuna grounds", note: "Skipjack are frequently found with yellowfin and bluefin tuna — locating a skipjack boil is often the first step to finding larger fish nearby." },
    ]),
    communityTips: JSON.stringify([
      { category: "Timing", tip: "June through October, peaking in August–September when warm water is most established. Watch SST charts — skipjack follow the same warm water that holds yellowfin, so the same temperature breaks produce both species." },
      { category: "Local Trick", tip: "Don't overlook skipjack as bait. A live skipjack on a large hook is one of the best baits for large yellowfin, marlin, and mako sharks. Keep a few alive in the bait tank if live bait fishing for bigger species." },
      { category: "Bait Shop", tip: "H&M Landing and Point Loma Sportfishing have current reports on skipjack and tuna locations. Skipjack often school near the same kelp paddies and temperature breaks as yellowfin — the crews know where to run." },
      { category: "SD Tip", tip: "Bleed skipjack immediately after landing — it makes a dramatic difference in quality. Skipjack bled and iced right away is outstanding sashimi and sushi-grade tuna. Unbled skipjack has a strong taste that puts people off the species unfairly." },
    ]),
    communityPosts: JSON.stringify([
      { username: "SkipjackSteve_SD", date: "Aug 20, 2024", time: "7:00 AM", location: "~30 mi offshore, temperature break", weight: "8.4 lbs", bait: "Small blue/white feather", note: "Found a massive skipjack boil with birds everywhere. Caught 12 in 20 minutes. Used two as live bait for yellowfin — one got eaten by a 55lb YFT. Best day ever." },
      { username: "TunaScout619", date: "Sep 5, 2024", time: "6:30 AM", location: "Kelp paddy, ~40 mi SW", weight: "11.2 lbs", gear: "Light spinning, 1oz iron jig", waterTemp: "70°F", note: "Skipjack were thick around the paddy. Bled three and made the best poke bowl of my life that night." },
      { username: "OffshoreBoil_SD", date: "Jul 28, 2024", time: "8:15 AM", location: "Mixed tuna grounds, ~45 mi offshore", weight: "7.1 lbs", bait: "Live anchovy", tide: "Slack", note: "Skipjack led us to a yellowfin school underneath. Keep your eyes on the boils — the big fish are always below." },
    ]),
    maxWeightLbs: 40,
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
