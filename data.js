// Madeira trip data — Jan 8–15, 2027 (rental car the whole trip)
// Photos in img/ are real (Wikimedia Commons or official hotel websites). Sources in credits.js.
// lat/lon are approximate trailheads / towns, used only to estimate drive times.
// side: "S" south coast, "N" north coast, "M" mountains/plateau. pen = extra minutes for slow mountain roads.

const gmaps = (q) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);

window.FLIGHTS = {
  out: { date: "Fri, Jan 8, 2027", dep: "23:25", from: "EWR", arr: "14:10 +1", to: "FNC", dur: "9h 45min", stop: "1h15 layover in Porto", airline: "TAP Air Portugal" },
  back: { date: "Fri, Jan 15, 2027", dep: "15:00", from: "FNC", arr: "21:35", to: "EWR", dur: "11h 35min", stop: "1h05 layover in Porto", airline: "TAP Air Portugal" },
};
window.AIRPORT = { lat: 32.6979, lon: -16.7745, side: "S", pen: 0 };

/* ---------------- EXPERIENCES ---------------- */
// lush: 3 very lush · 2 green · 1 some green · 0 bare/views
// weather: "drizzle" fine in drizzle · "clear" best on a clear day · "any"
window.EXPERIENCES = [
  // hikes
  { id: "pr6", kind: "hike", name: "25 Fontes & Risco waterfalls (PR6)", area: "Rabaçal · west plateau", lat: 32.755, lon: -17.133, side: "M", pen: 10,
    lush: 3, weather: "drizzle", effort: "Moderate · 3–4 hrs", img: ["fontes25", "risco"],
    desc: "Madeira's classic green walk follows a levada through mossy laurel forest to a pool fed by dozens of falls, then on to the 100 m Risco cascade. Park on the ER110 and take the shuttle down.", link: gmaps("Rabacal Madeira") },
  { id: "alecrim", kind: "hike", name: "Levada do Alecrim to Lagoa Dona Beja (PR6.2)", area: "Rabaçal · west plateau", lat: 32.755, lon: -17.133, side: "M", pen: 10,
    lush: 2, weather: "drizzle", effort: "Easy–moderate · ~2.5 hrs", img: ["alecrim", "dona_beja"],
    desc: "A quieter sister to 25 Fontes. It starts at the same place and follows a levada through heather and laurel to small waterfall pools. Easy to combine with PR6 on the same day.", link: gmaps("Levada do Alecrim Rabacal") },
  { id: "pr9", kind: "hike", name: "Caldeirão Verde (PR9)", area: "Queimadas · Santana, north", lat: 32.784, lon: -16.904, side: "N", pen: 8,
    lush: 3, weather: "drizzle", effort: "Moderate · 4–5 hrs · headlamp", img: ["caldeirao", "queimadas"],
    desc: "A narrow levada through dripping laurel jungle and four tunnels, ending at a 100 m waterfall in a green cauldron. It starts at the thatched forest houses of Queimadas. This is the lushest hike on the island.", link: gmaps("Parque Florestal das Queimadas") },
  { id: "rei", kind: "hike", name: "Levada do Rei (PR18)", area: "São Jorge · north", lat: 32.808, lon: -16.911, side: "N", pen: 5,
    lush: 3, weather: "drizzle", effort: "Easy–moderate · ~3 hrs", img: ["levada_rei"],
    desc: "A gentle levada deep into old laurel forest that ends at a mossy waterfall. Much quieter than the famous trails.", link: gmaps("Levada do Rei Quebradas Sao Jorge") },
  { id: "furado", kind: "hike", name: "Levada do Furado (PR10)", area: "Ribeiro Frio · central", lat: 32.735, lon: -16.885, side: "M", pen: 10,
    lush: 3, weather: "drizzle", effort: "Moderate · ~4 hrs one-way", img: ["furado", "ribeiro_frio"],
    desc: "An old-growth laurel forest walk from Ribeiro Frio to Portela, with ferns, moss and mountain views. It's one-way, so leave the car and take a taxi back, or walk partway and return.", link: gmaps("Levada do Furado Ribeiro Frio") },
  { id: "balcoes", kind: "hike", name: "Vereda dos Balcões (PR11)", area: "Ribeiro Frio · central", lat: 32.735, lon: -16.885, side: "M", pen: 10,
    lush: 2, weather: "any", effort: "Very easy · 1 hr", img: ["balcoes"],
    desc: "A flat 1.5 km walk to a balcony that looks straight into the green central valleys. You could add it to a Furado day.", link: gmaps("Balcoes Ribeiro Frio") },
  { id: "fanal", kind: "hike", name: "Fanal fairy-tale forest", area: "Fanal · north-west plateau", lat: 32.81, lon: -17.145, side: "M", pen: 12,
    lush: 3, weather: "drizzle", effort: "Easy · wander 1–2 hrs", img: ["fanal", "paul_serra"],
    desc: "Ancient twisted til trees on mossy meadows. Fog makes it more magical, so it's a great pick for a misty day.", link: gmaps("Fanal Madeira") },
  { id: "cedros", kind: "hike", name: "Levada dos Cedros (PR14)", area: "Fanal · north-west", lat: 32.815, lon: -17.13, side: "M", pen: 12,
    lush: 3, weather: "drizzle", effort: "Easy–moderate · ~3 hrs", img: ["cedros"],
    desc: "A quiet walk through the UNESCO laurel forest below Fanal. Pair it with Fanal for a full green day.", link: gmaps("Levada dos Cedros Fanal") },
  { id: "pr1", kind: "hike", name: "Pico do Arieiro → Pico Ruivo (PR1)", area: "High peaks · central", lat: 32.7355, lon: -16.9285, side: "M", pen: 15,
    lush: 0, weather: "clear", effort: "Hard · 5–6 hrs return", img: ["pico_ruivo", "pico_arieiro"],
    desc: "The island's most famous hike, with stairs, tunnels and ridgelines above the clouds. It's rocky rather than lush. Check that it's open, because sections have closed in recent years. A shorter way to the summit is Achada do Teixeira → Pico Ruivo (about 1.5 hrs return).", link: gmaps("Pico do Arieiro") },
  { id: "pr8", kind: "hike", name: "Ponta de São Lourenço (PR8)", area: "East tip · near airport", lat: 32.743, lon: -16.705, side: "S", pen: 0,
    lush: 0, weather: "clear", effort: "Moderate · ~3 hrs · windy", img: ["saolourenco"],
    desc: "A bare red-and-ochre volcanic peninsula between two seas. It's the driest, least green part of Madeira, and dramatic rather than lush.", link: gmaps("Ponta de Sao Lourenco trailhead") },

  // outings
  { id: "seixal", kind: "outing", name: "Seixal beach, Véu da Noiva & Chão da Ribeira", area: "North-west coast", lat: 32.823, lon: -17.105, side: "N", pen: 0,
    lush: 3, weather: "any", effort: "Easy · half day", img: ["seixal", "veu_noiva", "chao_ribeira"],
    desc: "Black sand under vertical green cliffs, a waterfall falling into the sea, and a deep valley full of laurel and chestnut trees. Very lush.", link: gmaps("Seixal beach Madeira") },
  { id: "monte", kind: "outing", name: "Monte cable car, Tropical Garden & toboggan", area: "Above Funchal", lat: 32.675, lon: -16.902, side: "S", pen: 5,
    lush: 3, weather: "any", effort: "Easy · half day", img: ["monte_palace", "monte_cable", "toboggan"],
    desc: "Cable car up from the seafront to the jungle-like Monte Palace gardens (koi ponds, tiles, giant ferns), then ride back down in a wicker toboggan pushed by two drivers.", link: gmaps("Monte Palace Tropical Garden") },
  { id: "caves", kind: "outing", name: "São Vicente lava caves & village", area: "North coast", lat: 32.796, lon: -17.043, side: "N", pen: 0,
    lush: 2, weather: "drizzle", effort: "Easy · 2 hrs", img: ["grutas", "sao_vicente"],
    desc: "Guided walk through ancient lava tubes, then the little white village in a green valley. A good rainy-day pick.", link: gmaps("Grutas de Sao Vicente") },
  { id: "santana", kind: "outing", name: "Santana thatched houses", area: "North coast", lat: 32.805, lon: -16.882, side: "N", pen: 0,
    lush: 2, weather: "any", effort: "Easy · 1 hr", img: ["santana"],
    desc: "Madeira's iconic triangular A-frame houses in green farmland. Combine it with Caldeirão Verde or Levada do Rei.", link: gmaps("Casas Tipicas de Santana") },
  { id: "botanic", kind: "outing", name: "Madeira Botanical Garden", area: "Above Funchal", lat: 32.662, lon: -16.896, side: "S", pen: 3,
    lush: 2, weather: "any", effort: "Easy · 2 hrs", img: ["botanical"],
    desc: "Patterned flower terraces and subtropical plants with a big view over Funchal bay.", link: gmaps("Jardim Botanico da Madeira") },
  { id: "curral", kind: "outing", name: "Nuns' Valley (Curral das Freiras)", area: "Central mountains", lat: 32.705, lon: -16.966, side: "M", pen: 8,
    lush: 2, weather: "clear", effort: "Easy · half day", img: ["curral"],
    desc: "A village at the bottom of a green volcanic bowl. The Eira do Serrado viewpoint above it is one of the best on the island.", link: gmaps("Eira do Serrado") },
  { id: "arieiro", kind: "outing", name: "Pico do Arieiro sunrise drive", area: "High peaks · central", lat: 32.7355, lon: -16.9285, side: "M", pen: 15,
    lush: 0, weather: "clear", effort: "Easy · drive up, 1 hr", img: ["pico_arieiro"],
    desc: "Drive to 1,818 m before about 8:00 and watch the sun rise over a sea of clouds. Check the webcams first.", link: gmaps("Pico do Arieiro") },
  { id: "cabo", kind: "outing", name: "Cabo Girão skywalk & Câmara de Lobos", area: "South coast", lat: 32.656, lon: -17.004, side: "S", pen: 0,
    lush: 1, weather: "clear", effort: "Easy · 2–3 hrs", img: ["cabo_girao", "camara_lobos"],
    desc: "A glass floor 580 m above the ocean, then a colorful fishing harbor where Churchill painted.", link: gmaps("Cabo Girao Skywalk") },
  { id: "moniz", kind: "outing", name: "Porto Moniz lava pools", area: "North-west tip", lat: 32.867, lon: -17.17, side: "N", pen: 0,
    lush: 1, weather: "any", effort: "Easy · 2 hrs", img: ["porto_moniz"],
    desc: "Natural swimming pools in black lava with Atlantic waves crashing over the edge. The water is about 19°C, so be brave.", link: gmaps("Porto Moniz natural pools") },
  { id: "funchal", kind: "outing", name: "Funchal: market, Old Town & Madeira wine", area: "Funchal", lat: 32.649, lon: -16.905, side: "S", pen: 0,
    lush: 0, weather: "any", effort: "Easy · half day", img: ["mercado", "old_town", "blandys"],
    desc: "Exotic fruit at Mercado dos Lavradores, the painted doors of Rua de Santa Maria, and a tasting at Blandy's Wine Lodge.", link: gmaps("Mercado dos Lavradores") },
  { id: "dolphins", kind: "outing", name: "Dolphin & whale-watching catamaran", area: "Funchal marina", lat: 32.645, lon: -16.912, side: "S", pen: 0,
    lush: 0, weather: "clear", effort: "Easy · 2–3 hrs", img: ["dolphin"],
    desc: "Dolphins are seen year-round. Go on a calm-sea morning.", link: gmaps("whale watching Funchal marina") },
  { id: "tea", kind: "outing", name: "Afternoon tea at Reid's", area: "Funchal", lat: 32.6375, lon: -16.9285, side: "S", pen: 0,
    lush: 2, weather: "any", effort: "Easy · 2 hrs", img: ["reids3", "reids"],
    desc: "Scones on the terrace above the bay, a tradition since the 1890s. Book ahead, and note the smart-casual dress code.", link: gmaps("Reid's Palace Funchal") },
  { id: "machico", kind: "outing", name: "Machico bay & Pico do Facho", area: "East · near airport", lat: 32.718, lon: -16.765, side: "S", pen: 0,
    lush: 0, weather: "any", effort: "Easy · 1–2 hrs", img: ["machico", "pico_facho"],
    desc: "Madeira's first settlement: a golden-sand bay and a lookout over the coast and runway.", link: gmaps("Miradouro Pico do Facho") },
];

/* ---------------- HOTELS (any hotel can go in any stay) ---------------- */
// rain: January rain risk where the hotel sits — 0 lowest · 1 low · 2 medium · 3 higher
window.HOTELS = [
  { id: "saccharum", name: "Saccharum Resort", area: "Calheta · sunny south-west", lat: 32.7195, lon: -17.177, side: "S", pen: 0,
    style: "Clean, contemporary design",
    cls: "5-star resort", resort: true, amex: "THC", rain: 0, lush: 1, imgs: ["saccharum_h1", "saccharum_h2", "saccharum_h4"],
    desc: "A design resort between cliffs and the ocean, with infinity pools, a spa and sea-view suites. It's on the sunniest stretch of the island, about 30 min from 25 Fontes and Fanal.",
    link: "https://www.savoysignature.com/saccharumhotel/en/" },
  { id: "reids", name: "Reid's Palace, A Belmond Hotel", area: "Funchal · clifftop", lat: 32.6375, lon: -16.9285, side: "S", pen: 0,
    style: "Classic & understated, old-world",
    cls: "5-star resort", resort: true, amex: "FHR", rain: 1, lush: 2, imgs: ["reids", "reids2", "reids3"],
    desc: "The legendary pink 1891 palace with 10 acres of subtropical gardens, saltwater pools in the rocks, afternoon tea, and William (Michelin-starred).",
    link: "https://www.belmond.com/hotels/europe/portugal/madeira/belmond-reids-palace/" },
  { id: "savoy", name: "Savoy Palace", area: "Funchal · Hotel Zone", lat: 32.64, lon: -16.9265, side: "S", pen: 0,
    style: "Glitzy modern glam, big chandeliers",
    cls: "5-star resort", resort: true, amex: "FHR", rain: 1, lush: 1, imgs: ["savoy_h1", "savoy", "savoy2", "savoy_h2"],
    desc: "A big, glossy modern resort with ocean balconies, several pools, a huge spa and the Galaxia rooftop.",
    link: "https://www.savoysignature.com/savoypalacehotel/en/" },
  { id: "reserve", name: "The Reserve (inside Savoy Palace)", area: "Funchal · Hotel Zone", lat: 32.64, lon: -16.9265, side: "S", pen: 0,
    style: "Quieter suites, but inside the Savoy building",
    cls: "5-star suites", resort: true, amex: "FHR", rain: 1, lush: 1, imgs: ["reserve_h1", "savoy_h1", "savoy2"],
    desc: "A suites-only hotel within a hotel on the top floors of Savoy Palace, with a private lounge plus the Savoy pools and spa. Home of Desarma.",
    link: "https://www.americanexpress.com/en-us/travel/discover/property/Portugal/Funchal/The-Reserve-Madeira-Island" },
  { id: "cliffbay", name: "Les Suites at The Cliff Bay", area: "Funchal · clifftop", lat: 32.6365, lon: -16.933, side: "S", pen: 0,
    style: "Classic and calm",
    cls: "5-star suites · adults-only", resort: true, amex: null, rain: 1, lush: 2, imgs: ["cliffbay_h2", "cliffbay_h1", "cliffbay"],
    desc: "Adults-only suites with gardens down to a sea-level lido, close to Il Gallo d'Oro and Avista. I didn't find it in Amex FHR or the Hotel Collection.",
    link: "https://www.portobay.com/en/hotels/madeira-hotels/les-suites-at-the-cliff-bay/" },
  { id: "estalagem", name: "Estalagem da Ponta do Sol", area: "Ponta do Sol · sunny south-west", lat: 32.68, lon: -17.103, side: "S", pen: 0,
    style: "Minimalist, design-led",
    cls: "Design boutique", amex: null, rain: 0, lush: 1, imgs: ["estalagem_h1", "ponta_sol"],
    desc: "A cult minimalist hotel on a cliff above the sunniest village, with an infinity pool hanging over the Atlantic.",
    link: "https://www.pontadosol.com/" },
  { id: "socalco", name: "Socalco Nature Calheta", area: "Calheta hills · south-west", lat: 32.728, lon: -17.17, side: "S", pen: 3,
    style: "Rustic-chic, cozy",
    cls: "Rural-chic boutique", amex: null, rain: 0, lush: 2, imgs: ["socalco_h1", "socalco_h2", "socalco_h3", "socalco_h4"],
    desc: "A small hotel built into old farm terraces, with some rooms carved into the rock, sunset terraces and a quiet pool.",
    link: "https://www.socalconature.com/" },
  { id: "furao", name: "Quinta do Furão", area: "Santana · green north coast", lat: 32.818, lon: -16.867, side: "N", pen: 0,
    style: "Traditional country estate",
    cls: "Vineyard estate", amex: null, rain: 3, lush: 3, imgs: ["furao_h1", "furao_h2", "furao_h3", "furao_h4", "furao_h5"],
    desc: "A wine estate on top of the green north-coast cliffs, with a vineyard, a pool and regional cooking. It's minutes from Caldeirão Verde and Levada do Rei.",
    link: "https://www.quintadofurao.com/" },
  { id: "aquanatura", name: "Aqua Natura Madeira", area: "Porto Moniz · wild north-west", lat: 32.866, lon: -17.168, side: "N", pen: 0,
    style: "Simple and bright",
    cls: "Small seaside hotel", amex: null, rain: 3, lush: 2, imgs: ["aquanatura_h1", "aquanatura_h2", "aquanatura_h3"],
    desc: "A simple, bright hotel on the lava pools. It's the closest base for Fanal and the north-west coast.",
    link: "https://www.aquanaturamadeira.com/" },
  { id: "splendida", name: "Quinta Splendida", area: "Caniço · east, near airport", lat: 32.651, lon: -16.846, side: "S", pen: 0,
    style: "Colorful, garden resort",
    cls: "Garden resort & spa", resort: true, amex: null, rain: 1, lush: 2, imgs: ["splendida_h1", "splendida_h2"],
    desc: "A colorful estate in a botanical garden above Caniço, with a big spa.",
    link: "https://www.quintasplendida.com/" },
  { id: "albatroz", name: "Albatroz Beach & Yacht Club", area: "Santa Cruz · by the airport", lat: 32.689, lon: -16.792, side: "S", pen: 0,
    style: "Old-school, simple",
    cls: "Small seaside hotel", amex: null, rain: 1, lush: 1, imgs: ["albatroz_h1", "albatroz_h2", "albatroz_h3"],
    desc: "A small, old-school seaside hotel where every room has an ocean balcony. It's the closest pick to the airport.",
    link: "https://www.albatrozhotel.com/" },
  { id: "castanheiro", name: "Castanheiro Boutique Hotel", area: "Funchal Old Town", lat: 32.649, lon: -16.905, side: "S", pen: 0,
    style: "Historic townhouse, polished",
    cls: "City boutique", amex: null, rain: 1, lush: 0, imgs: ["castanheiro_h1", "castanheiro_h2", "castanheiro_h3", "castanheiro_h4"],
    desc: "Restored townhouses with a rooftop infinity pool. You can walk to dinner, the market and the painted doors.",
    link: "https://www.castanheiroboutiquehotel.com/" },
  { id: "casabranca", name: "Quinta da Casa Branca", area: "Funchal · garden estate", lat: 32.639, lon: -16.925, side: "S", pen: 0,
    style: "Quiet modern, big gardens",
    cls: "Garden boutique", amex: null, rain: 1, lush: 2, imgs: ["casabranca_h1", "casabranca_h2", "casabranca_h3"],
    desc: "A family estate with huge old gardens, a pool and calm modern rooms. It feels like a country house in the city.",
    link: "https://www.quintacasabranca.pt/" },
];

// Two stays: a resort first, then a boutique near your excursions. Dates come from the resort-nights switch.
// Two stays. Stay I's length comes from the switch on the page (2–4 nights).
window.STAYS = [
  { id: "s1", n: "I", label: "The resort", role: "resort",
    why: "Start on the sunny side, where rain is least likely. After your first lazy day, any extra days here can be excursion days." },
  { id: "s2", n: "II", label: "The finale", role: "second",
    why: "One more Amex FHR hotel to finish. FHR comes first, then lowest total trip driving. Your 3pm flight means no airport hotel is needed." },
];

/* ---------------- RESTAURANTS (Google Maps links, no photos) ---------------- */
window.RESTAURANTS = [
  { id: "william", name: "William", tag: "Michelin-starred · at Reid's Palace", lat: 32.6375, lon: -16.9285, q: "William Restaurant Reid's Palace Funchal" },
  { id: "galloOro", name: "Il Gallo d'Oro", tag: "Michelin 2-star · The Cliff Bay", lat: 32.6365, lon: -16.933, q: "Il Gallo d'Oro Funchal" },
  { id: "avista", name: "Avista", tag: "Michelin-starred, ocean terrace · Les Suites", lat: 32.6365, lon: -16.933, q: "Avista restaurant Les Suites at The Cliff Bay Funchal" },
  { id: "desarma", name: "Desarma", tag: "Michelin-starred · top of Savoy Palace", lat: 32.64, lon: -16.9265, q: "Desarma restaurant Funchal" },
  { id: "kampo", name: "Kampo", tag: "Chef Júlio Pereira, farm-to-table · Funchal", lat: 32.648, lon: -16.91, q: "Kampo restaurant Funchal" },
  { id: "akua", name: "Akua", tag: "Seafood & small plates · Old Town", lat: 32.649, lon: -16.903, q: "Akua restaurant Funchal" },
  { id: "gaviao", name: "Gavião Novo", tag: "Classic fish house · Old Town", lat: 32.6488, lon: -16.9025, q: "Gaviao Novo Funchal" },
  { id: "armazem", name: "Armazém do Sal", tag: "Cozy stone warehouse · Funchal", lat: 32.6485, lon: -16.909, q: "Armazem do Sal Funchal" },
  { id: "galaxia", name: "Galaxia Skyfood", tag: "Rooftop at Savoy Palace", lat: 32.64, lon: -16.9265, q: "Galaxia Skyfood Savoy Palace Funchal" },
  { id: "doca", name: "Doca do Cavacas", tag: "Grilled fish over lava pools · west Funchal", lat: 32.637, lon: -16.946, q: "Doca do Cavacas Funchal" },
  { id: "vilaPeixe", name: "Vila do Peixe", tag: "Pick-your-fish grill · Câmara de Lobos", lat: 32.649, lon: -16.976, q: "Vila do Peixe Camara de Lobos" },
  { id: "poncha", name: "Taberna da Poncha", tag: "The original poncha bar · Serra de Água", lat: 32.722, lon: -17.026, q: "Taberna da Poncha Serra de Agua" },
  { id: "solPoente", name: "Sol Poente", tag: "Sunset on the rocks · Ponta do Sol", lat: 32.68, lon: -17.1, q: "Sol Poente Ponta do Sol Madeira" },
  { id: "calhetas", name: "O Calhetas", tag: "Seafood on the water · Calheta", lat: 32.72, lon: -17.176, q: "Restaurante O Calhetas Calheta Madeira" },
  { id: "cachalote", name: "Cachalote", tag: "Built into the lava rocks · Porto Moniz", lat: 32.867, lon: -17.17, q: "Restaurante Cachalote Porto Moniz" },
  { id: "quebramar", name: "Quebra Mar", tag: "Seafront, simple & local · São Vicente", lat: 32.803, lon: -17.045, q: "Restaurante Quebra Mar Sao Vicente Madeira" },
  { id: "furaoRest", name: "Quinta do Furão", tag: "Regional tasting, vineyard views · Santana", lat: 32.818, lon: -16.867, q: "Quinta do Furao restaurant Santana" },
  { id: "cantinho", name: "Cantinho da Serra", tag: "Wood stove & stews · Santana", lat: 32.795, lon: -16.885, q: "Cantinho da Serra Santana Madeira" },
  { id: "ribeiroFrio", name: "Restaurante Ribeiro Frio", tag: "Fresh trout in the forest", lat: 32.735, lon: -16.885, q: "Restaurante Ribeiro Frio Madeira" },
  { id: "amarelo", name: "Amarelo", tag: "Fish & seafood by the harbor · Caniçal", lat: 32.738, lon: -16.737, q: "Restaurante Amarelo Canical" },
  { id: "mercadoVelho", name: "Mercado Velho", tag: "Garden terrace · Machico", lat: 32.718, lon: -16.767, q: "Mercado Velho Machico" },
].map((r) => ({ ...r, link: gmaps(r.q) }));

/* ---------------- DAYS ---------------- */
// Built in app.js from the resort-nights switch (Jan 8 flight → Jan 15 flight home).
window.FLIGHT_OUT = { name: "TAP Air Portugal · EWR → OPO → FNC", tag: "Departs 23:25 · lands Sat 14:10", img: ["tap_plane"], desc: "1h15 layover in Porto. Download offline Google Maps for Madeira before you go." };
window.FLIGHT_HOME = { name: "FNC → OPO → EWR", tag: "Departs 15:00 · lands 21:35", img: ["airport"], desc: "Look out of the window as you take off from the runway on stilts." };

// small fixed options for arrival / departure days
window.ARRIVE_OPTS = [
  { id: "a_settle", name: "Settle in & sunset at the hotel", tag: "Zero effort", img: ["@s1"], desc: "Check in, swim, and have a cocktail as the sun drops into the Atlantic." },
  { id: "a_garajau", name: "Cristo Rei do Garajau on the way", tag: "Short detour from the airport", img: ["garajau"], desc: "A huge Christ statue on a headland above the sea, just off the airport road.", lat: 32.639, lon: -16.851, side: "S", pen: 0, link: gmaps("Cristo Rei Garajau") },
  { id: "a_oldtown", name: "Evening stroll in Funchal Old Town", tag: "Painted doors & poncha", img: ["old_town"], desc: "The painted doors, little bars and the seafront at dusk.", lat: 32.649, lon: -16.905, side: "S", pen: 0, link: gmaps("Rua de Santa Maria Funchal") },
];
window.DEPART_OPTS = [
  { id: "d_brekkie", name: "Long breakfast, pack, check out", tag: "Easy", img: ["@s2"], desc: "One last slow morning, then drive to the airport." },
  { id: "d_garajau", name: "Cristo Rei do Garajau", tag: "30 min", img: ["garajau"], desc: "A last look along the coast.", lat: 32.639, lon: -16.851, side: "S", pen: 0, link: gmaps("Cristo Rei Garajau") },
  { id: "d_machico", name: "Coffee on Machico beach on the way", tag: "5 min from the airport", img: ["machico"], desc: "Golden sand right next to the runway.", lat: 32.718, lon: -16.765, side: "S", pen: 0, link: gmaps("Praia de Machico") },
];
