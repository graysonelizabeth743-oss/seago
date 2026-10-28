// Sea-lane network. Ships don't sail in straight lines across land, so routes are found
// through these waypoints (capes, canals and straits) with Dijkstra.
//
// Nodes are [lat, lng]. Edge flags: "c" = canal (crosses a narrow strip of land on purpose),
// "s" = narrow strait (coastline data is too coarse to validate it). Everything else is
// verified against real coastline data by scripts/validate-routes.mjs.

export const NODES = {
  // North-west Europe & Atlantic coast
  NS: [53.9, 3.0], ELBE: [54.0, 7.6], DV: [51.0, 1.6], EC: [49.9, -2.5], USH: [48.6, -6.3],
  BIS: [45.0, -7.5], FIN: [43.4, -10.0], SVC: [36.8, -10.0], CAS: [35.6, -7.4], GIB: [35.95, -5.6],
  // Mediterranean
  ALB: [36.0, -2.8], MW: [37.4, 2.0], MW2: [38.3, 6.0], SICN: [37.7, 10.9], SICS: [35.4, 13.8],
  MEC: [34.0, 19.5], CRS: [34.2, 25.5], MEE: [32.6, 30.0], PSD: [31.26, 32.3],
  // Suez, Red Sea, Gulf of Aden
  SUEZ: [29.95, 32.55], GOS: [28.6, 32.9], GOS2: [27.7, 33.9], RS1: [26.0, 35.0], RS2: [21.5, 37.8],
  RS3: [16.0, 41.2], BAB: [12.7, 43.3], GOA: [12.2, 47.5], GA1: [13.2, 50.5], GA2: [12.3, 52.4],
  // Arabian Sea, Gulf, India, Sri Lanka
  ARB1: [14.0, 60.0], ARBN: [21.5, 62.0], GOM: [25.0, 58.8], HOR: [26.55, 56.4], PG: [26.0, 54.8],
  ARBK: [23.0, 65.8], ARBM: [18.5, 70.0], MAL: [9.0, 73.5], SLW: [6.5, 78.8], SLS: [5.3, 79.8],
  // Bay of Bengal, Malacca, South China Sea, East Asia
  SMT: [6.5, 93.5], MLK0: [6.0, 97.5], MLK1: [2.7, 101.0], MLK2: [1.3, 103.4], SCS1: [2.0, 105.5],
  SCS2: [9.0, 109.5], SCS3: [15.0, 112.5], HKA: [21.5, 115.0], TWS: [24.5, 119.3], ECS: [29.5, 123.2],
  ECN: [31.0, 123.5], KRS: [33.8, 128.2],
  // West Africa
  MOR: [31.0, -10.5], CAN: [27.0, -14.5], CAV: [21.0, -17.8], DKA: [14.7, -18.0], GUI: [10.5, -17.5],
  SLE: [7.5, -14.5], LIB: [4.5, -9.5], IVC: [4.0, -4.0], GHA: [4.4, -1.0], GUL: [3.8, 4.0], PHA: [3.7, 6.8],
  // Southern & East Africa
  CNG: [-3.5, 8.0], ANG: [-9.5, 10.5], NAM: [-22.5, 11.0], CPW: [-33.8, 16.5], CAPE: [-35.3, 19.0],
  AGH: [-35.9, 23.0], DBA: [-31.2, 32.5], MOZ: [-26.5, 34.5], MOZC: [-18.5, 39.8], MZN: [-13.0, 42.0],
  TZN: [-7.5, 41.5], KEN: [-4.3, 40.8], SOM: [4.0, 49.5], SOM2: [9.0, 53.5],
  // Atlantic crossings & South America
  ATLN: [47.5, -28.0], ATLW: [41.5, -52.0], ATLM: [34.0, -32.0], NYA: [40.2, -71.0], AW1: [28.0, -62.0],
  AW2: [10.0, -50.0], AW3: [-3.0, -30.0], ATLS: [-5.0, -20.0], BR1: [-13.0, -36.0], BR2: [-22.0, -39.0],
  SAN: [-25.5, -45.0], URG: [-35.5, -50.0], RDP: [-35.5, -55.5], SAT: [-37.0, -30.0],
  // Caribbean, Panama, Pacific coast
  WIN: [20.1, -73.8], WIN2: [18.5, -75.5], CAR: [14.5, -76.5], COLN: [10.8, -79.9], PANP: [6.8, -79.0],
  PAN2: [5.5, -85.5], GUA: [10.5, -93.5], MEX1: [14.5, -100.0], MEX2: [18.0, -105.5], CAB: [21.5, -111.0],
  BJA: [27.5, -116.5], LAA: [32.9, -118.9],
};

export const EDGES = [
  // Europe ↔ Atlantic ↔ Mediterranean
  ["NS", "ELBE"], ["NS", "DV", "s"], ["DV", "EC"], ["EC", "USH"], ["USH", "BIS"], ["BIS", "FIN"], ["FIN", "SVC"],
  ["SVC", "CAS"], ["CAS", "GIB", "s"], ["GIB", "ALB", "s"], ["ALB", "MW"], ["MW", "MW2"], ["MW2", "SICN"],
  ["SICN", "SICS", "s"], ["SICS", "MEC"], ["MEC", "CRS"], ["CRS", "MEE"], ["MEE", "PSD"],
  // Suez, Red Sea, Gulf of Aden
  ["PSD", "SUEZ", "c"], ["SUEZ", "GOS", "s"], ["GOS", "GOS2", "s"], ["GOS2", "RS1", "s"], ["RS1", "RS2"], ["RS2", "RS3"],
  ["RS3", "BAB", "s"], ["BAB", "GOA", "s"], ["GOA", "GA1"], ["GA1", "GA2"], ["GA2", "ARB1"], ["GA2", "SOM2"],
  // Arabian Sea, Gulf, India
  ["ARB1", "ARBN"], ["ARBN", "GOM"], ["GOM", "HOR", "s"], ["HOR", "PG", "s"], ["ARBN", "ARBK"], ["ARBK", "ARBM"],
  ["ARB1", "ARBM"], ["ARBM", "MAL"], ["ARB1", "MAL"], ["SOM2", "MAL"], ["SOM", "SLS"], ["MAL", "SLS"], ["SLW", "SLS"],
  // Bay of Bengal → Malacca → East Asia
  ["SLS", "SMT"], ["SMT", "MLK0", "s"], ["MLK0", "MLK1", "s"], ["MLK1", "MLK2", "s"], ["MLK2", "SCS1", "s"],
  ["SCS1", "SCS2"], ["SCS2", "SCS3"], ["SCS3", "HKA"], ["HKA", "TWS"], ["TWS", "ECS"], ["ECS", "ECN"], ["ECN", "KRS"],
  // West Africa
  ["CAS", "MOR"], ["MOR", "CAN"], ["CAN", "CAV"], ["CAV", "DKA"], ["DKA", "GUI"], ["GUI", "SLE"], ["SLE", "LIB"],
  ["LIB", "IVC"], ["IVC", "GHA"], ["GHA", "GUL"], ["GUL", "PHA"],
  // Southern & East Africa
  ["GUL", "CNG"], ["CNG", "ANG"], ["ANG", "NAM"], ["NAM", "CPW"], ["CPW", "CAPE"], ["CAPE", "AGH"], ["AGH", "DBA"],
  ["DBA", "MOZ"], ["MOZ", "MOZC"], ["MOZC", "MZN"], ["MZN", "TZN"], ["TZN", "KEN"], ["KEN", "SOM"], ["SOM", "SOM2"],
  // Atlantic crossings
  ["USH", "ATLN"], ["ATLN", "ATLW"], ["ATLW", "NYA"], ["CAS", "ATLM"], ["ATLM", "ATLW"], ["NYA", "AW1"], ["AW1", "AW2"],
  ["AW2", "AW3"], ["AW3", "BR1"], ["DKA", "ATLS"], ["GUL", "ATLS"], ["ATLS", "BR1"], ["BR1", "BR2"], ["BR2", "SAN"],
  ["SAN", "URG"], ["URG", "RDP"], ["SAN", "SAT"], ["URG", "SAT"], ["SAT", "CAPE"],
  // Caribbean, Panama, Pacific
  ["NYA", "WIN", "s"], ["WIN", "WIN2"], ["WIN2", "CAR"], ["CAR", "COLN"], ["COLN", "PANP", "c"], ["PANP", "PAN2"],
  ["PAN2", "GUA"], ["GUA", "MEX1"], ["MEX1", "MEX2"], ["MEX2", "CAB"], ["CAB", "BJA"], ["BJA", "LAA"],
];

/** Which waypoints each port connects to (the first hop out of harbour). */
export const PORT_LINKS = {
  // Africa
  NGLOS: ["GUL"], NGPHC: ["PHA"], GHTEM: ["GHA", "GUL"], SNDKR: ["DKA"], MAPTM: ["GIB", "CAS"],
  AOLAD: ["ANG"], ZACPT: ["CPW"], ZADUR: ["DBA"], TZDAR: ["TZN"], KEMBA: ["KEN"], DJJIB: ["BAB", "GOA"], EGPSD: ["PSD"],
  // Europe
  NLRTM: ["NS"], BEANR: ["DV", "NS"], DEHAM: ["ELBE"], GBFXT: ["NS", "DV"], ESVLC: ["MW"], GRPIR: ["CRS"],
  // Americas
  USNYC: ["NYA"], PAONX: ["COLN"], USLAX: ["LAA"], BRSSZ: ["SAN"], ARBUE: ["RDP"],
  // Asia
  SAJED: ["RS2"], AEJEA: ["PG"], PKKHI: ["ARBK"], INNSA: ["ARBM"], LKCMB: ["SLW"], SGSIN: ["MLK2", "SCS1"],
  MYPKG: ["MLK1"], HKHKG: ["HKA"], CNSHA: ["ECN"], CNNGB: ["ECS"], KRPUS: ["KRS"],
};

/** Friendly names for waypoints. These appear as location choices for admins and as map labels. */
export const NODE_NAMES = {
  NS: "North Sea", ELBE: "Elbe approach", DV: "Strait of Dover", EC: "English Channel", USH: "Off Ushant",
  BIS: "Bay of Biscay", FIN: "Cape Finisterre", SVC: "Cape St Vincent", CAS: "Atlantic off Morocco",
  GIB: "Strait of Gibraltar", ALB: "Alboran Sea", MW: "Western Mediterranean", MW2: "Off Sardinia",
  SICN: "Strait of Sicily", SICS: "South of Malta", MEC: "Central Mediterranean", CRS: "South of Crete",
  MEE: "Eastern Mediterranean", PSD: "Port Said", SUEZ: "Suez Canal", GOS: "Gulf of Suez",
  RS1: "Northern Red Sea", RS2: "Central Red Sea", RS3: "Southern Red Sea", BAB: "Bab-el-Mandeb Strait",
  GOA: "Gulf of Aden", GA1: "Gulf of Aden (east)", GA2: "Off Cape Guardafui", ARB1: "Arabian Sea", ARBN: "Off Oman",
  GOM: "Gulf of Oman", HOR: "Strait of Hormuz", PG: "Persian Gulf", ARBK: "Off Karachi", ARBM: "Off Mumbai",
  MAL: "Off south-west India", SLW: "Off Colombo", SLS: "South of Sri Lanka", SMT: "Andaman Sea",
  MLK0: "Northern Malacca Strait", MLK1: "Strait of Malacca", MLK2: "Singapore Strait", SCS1: "South China Sea (south)",
  SCS2: "South China Sea", SCS3: "South China Sea (north)", HKA: "Off Hong Kong", TWS: "Taiwan Strait",
  ECS: "East China Sea", ECN: "Off Shanghai", KRS: "Korea Strait", MOR: "Off Morocco", CAN: "Off the Canary Islands",
  CAV: "Off Mauritania", DKA: "Off Dakar", GUI: "Off Guinea-Bissau", SLE: "Off Sierra Leone", LIB: "Off Liberia",
  IVC: "Off Ivory Coast", GHA: "Off Ghana", GUL: "Gulf of Guinea", PHA: "Niger Delta approach", CNG: "Off Gabon",
  ANG: "Off Angola", NAM: "Off Namibia", CPW: "Off Cape Town", CAPE: "Cape of Good Hope", AGH: "Agulhas Bank",
  DBA: "Off Durban", MOZ: "Off Mozambique", MOZC: "Mozambique Channel", MZN: "Northern Mozambique Channel",
  TZN: "Off Tanzania", KEN: "Off Kenya", SOM: "Off Somalia", SOM2: "Off the Horn of Africa",
  ATLN: "North Atlantic", ATLW: "Grand Banks", ATLM: "Mid-Atlantic", NYA: "Approach to New York",
  AW1: "Western Atlantic", AW2: "Off Guyana", AW3: "South Atlantic (west)", ATLS: "South Atlantic",
  BR1: "Off north-east Brazil", BR2: "Off south-east Brazil", SAN: "Off Santos", URG: "Off Uruguay",
  RDP: "Río de la Plata", SAT: "South Atlantic (south)", WIN: "Windward Passage", WIN2: "Caribbean Sea (north)",
  CAR: "Caribbean Sea", COLN: "Approach to Colón", PANP: "Gulf of Panama", PAN2: "Pacific off Costa Rica",
  GUA: "Pacific off Guatemala", MEX1: "Pacific off Mexico", MEX2: "Pacific off western Mexico",
  CAB: "Off southern Baja California", BJA: "Off Baja California", LAA: "Approach to Los Angeles",
};
