import type {
  AutocompleteSuggestion,
  FilmRecommendation,
  MoodVector,
  PosterKey,
  SortStrategy,
  TasteInteraction
} from '../types/cinema';

interface WorldFilmSeed {
  title: string;
  year: number;
  director: string;
  country: string;
  language: string;
  runtimeMin: number;
  vibeTag: string;
  tension: number;
  pace: number;
  atmosphere: number;
  synopsis: string;
  aiReasoning: string;
  streamingOn: string[];
  similarFilms: string[];
  posterKey: PosterKey;
  ambientTone: 'amber' | 'cyan' | 'crimson' | 'slate';
  gemScore: number; // higher = deeper arthouse/world gem
}

export const WORLD_CINEMA_SEEDS: WorldFilmSeed[] = [
  // East Asia: South Korea, Japan, Hong Kong, Taiwan
  {
    title: 'In the Mood for Love',
    year: 2000,
    director: 'Wong Kar-wai',
    country: 'Hong Kong',
    language: 'Cantonese',
    runtimeMin: 98,
    vibeTag: 'Velvet Longing',
    tension: 66,
    pace: 26,
    atmosphere: 96,
    synopsis: 'Two neighbors in 1962 Hong Kong suspect their spouses of infidelity and form an unspoken, incandescent bond in rain-slicked corridors.',
    aiReasoning: 'Every glance carries breathless restraint; step-printed slow motion turns corridors into memory chambers.',
    streamingOn: ['Criterion Channel', 'Max', 'MUBI'],
    similarFilms: ['Chungking Express', '2046', 'Past Lives'],
    posterKey: 'crimson_motel',
    ambientTone: 'crimson',
    gemScore: 86
  },
  {
    title: 'Memories of Murder',
    year: 2003,
    director: 'Bong Joon-ho',
    country: 'South Korea',
    language: 'Korean',
    runtimeMin: 132,
    vibeTag: 'Rainy Noir',
    tension: 92,
    pace: 58,
    atmosphere: 74,
    synopsis: 'Provincial detectives in 1986 South Korea spiral into obsession hunting an elusive serial killer amid storm-soaked rice fields.',
    aiReasoning: 'Balances pitch-black irony with unbearable investigative dread that lingers long after the final gaze.',
    streamingOn: ['Hulu', 'Criterion Channel', 'Kanopy'],
    similarFilms: ['Zodiac', 'Cure', 'Decision to Leave'],
    posterKey: 'rain_detective',
    ambientTone: 'amber',
    gemScore: 82
  },
  {
    title: 'Decision to Leave',
    year: 2022,
    director: 'Park Chan-wook',
    country: 'South Korea',
    language: 'Korean',
    runtimeMin: 138,
    vibeTag: 'Hypnotic Obsession',
    tension: 84,
    pace: 54,
    atmosphere: 82,
    synopsis: 'An insomniac detective investigating a mountain fall becomes fatally entangled with the victim’s enigmatic widow.',
    aiReasoning: 'Vertiginous editing, mist-draped peaks, and a digital-era Hitchcockian romance built on micro-expressions.',
    streamingOn: ['MUBI', 'Prime Video'],
    similarFilms: ['Vertigo', 'In the Mood for Love', 'The Handmaiden'],
    posterKey: 'alpine_mystery',
    ambientTone: 'cyan',
    gemScore: 84
  },
  {
    title: 'Cure',
    year: 1997,
    director: 'Kiyoshi Kurosawa',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 111,
    vibeTag: 'Hypnotic Dread',
    tension: 94,
    pace: 28,
    atmosphere: 68,
    synopsis: 'A Tokyo detective tracks a wave of identical murders committed by ordinary citizens who remember nothing under a drifter’s hypnosis.',
    aiReasoning: 'No melodrama or cheap jolts—pure architectural silence, ambient hum, and existential chill.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Se7en', 'Pulse', 'Zodiac'],
    posterKey: 'neon_tokyo',
    ambientTone: 'slate',
    gemScore: 95
  },
  {
    title: 'Drive My Car',
    year: 2021,
    director: 'Ryusuke Hamaguchi',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 179,
    vibeTag: 'Nocturnal Catharsis',
    tension: 58,
    pace: 22,
    atmosphere: 88,
    synopsis: 'A widowed stage director arrives in Hiroshima to direct a multilingual Uncle Vanya while bonding with his quiet young chauffeur.',
    aiReasoning: 'Red Saab highway monologues transform grief into meditative, luminous stillness.',
    streamingOn: ['Max', 'Criterion Channel'],
    similarFilms: ['Burning', 'Yi Yi', 'Paris, Texas'],
    posterKey: 'midnight_paris',
    ambientTone: 'crimson',
    gemScore: 88
  },
  {
    title: 'Burning',
    year: 2018,
    director: 'Lee Chang-dong',
    country: 'South Korea',
    language: 'Korean',
    runtimeMin: 148,
    vibeTag: 'Slow Burn',
    tension: 86,
    pace: 24,
    atmosphere: 92,
    synopsis: 'An aspiring writer in Paju grows suspicious of a wealthy stranger whose hobby is burning down abandoned greenhouses.',
    aiReasoning: 'Dusk twilight over the Korean border hides an intoxicating puzzle where every clue dissolves into smoke.',
    streamingOn: ['Netflix', 'Kanopy'],
    similarFilms: ['Cure', 'The Vanishing', 'Cache'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 91
  },
  {
    title: 'Yi Yi',
    year: 2000,
    director: 'Edward Yang',
    country: 'Taiwan',
    language: 'Mandarin',
    runtimeMin: 173,
    vibeTag: 'Urban Poetics',
    tension: 42,
    pace: 30,
    atmosphere: 90,
    synopsis: 'Across a year of weddings, midlife regrets, and first loves, a Taipei family sees what they cannot see from the back.',
    aiReasoning: 'Reflected city glass frames every human truth with crystalline warmth and quiet philosophical grace.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['A Brighter Summer Day', 'Aftersun', 'Tokyo Story'],
    posterKey: 'neon_tokyo',
    ambientTone: 'cyan',
    gemScore: 93
  },
  {
    title: 'Oldboy',
    year: 2003,
    director: 'Park Chan-wook',
    country: 'South Korea',
    language: 'Korean',
    runtimeMin: 120,
    vibeTag: 'Kinetic Vengeance',
    tension: 97,
    pace: 84,
    atmosphere: 76,
    synopsis: 'Imprisoned in a private hotel room for fifteen years without explanation, a man is suddenly released and given five days to uncover why.',
    aiReasoning: 'Operatic corridor choreography collides with one of modern cinema’s most devastating tragic twists.',
    streamingOn: ['Netflix', 'MUBI'],
    similarFilms: ['Incendies', 'I Saw the Devil', 'Sympathy for Lady Vengeance'],
    posterKey: 'crimson_penthouse',
    ambientTone: 'crimson',
    gemScore: 80
  },
  {
    title: 'Fallen Angels',
    year: 1995,
    director: 'Wong Kar-wai',
    country: 'Hong Kong',
    language: 'Cantonese',
    runtimeMin: 99,
    vibeTag: 'Neon Fever',
    tension: 76,
    pace: 78,
    atmosphere: 95,
    synopsis: 'A disillusioned hitman and his longing handler drift through hyper-saturated 3 a.m. Hong Kong tunnels and jukebox diners.',
    aiReasoning: 'Extreme wide-angle neon blur turns urban loneliness into ecstatic midnight kineticism.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Chungking Express', 'Enter the Void', 'Blade Runner 2049'],
    posterKey: 'neon_tokyo',
    ambientTone: 'cyan',
    gemScore: 89
  },
  {
    title: 'High and Low',
    year: 1963,
    director: 'Akira Kurosawa',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 143,
    vibeTag: 'Moral Razor',
    tension: 91,
    pace: 64,
    atmosphere: 72,
    synopsis: 'A Yokohama shoe executive faces financial ruin when a kidnapper demands ransom—after accidentally abducting his chauffeur’s son.',
    aiReasoning: 'The greatest procedural ever staged: architectural blocking upstairs, kinetic street-level pursuit below.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Memories of Murder', 'Prisoners', 'Le Samourai'],
    posterKey: 'rain_detective',
    ambientTone: 'slate',
    gemScore: 90
  },
  {
    title: 'Perfect Blue',
    year: 1997,
    director: 'Satoshi Kon',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 81,
    vibeTag: 'Fractured Identity',
    tension: 95,
    pace: 74,
    atmosphere: 80,
    synopsis: 'A pop idol transitions into psychological thrillers as reality, fandom, and hallucination splice seamlessly together.',
    aiReasoning: 'Match-cut psychological precision that later inspired Aronofsky and modern identity thrillers.',
    streamingOn: ['AMC+', 'Shudder'],
    similarFilms: ['Black Swan', 'Mulholland Drive', 'Paprika'],
    posterKey: 'cyber_memory',
    ambientTone: 'crimson',
    gemScore: 87
  },
  {
    title: 'Shoplifters',
    year: 2018,
    director: 'Hirokazu Kore-eda',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 121,
    vibeTag: 'Intimate Realism',
    tension: 54,
    pace: 34,
    atmosphere: 84,
    synopsis: 'An improvised Tokyo family surviving on petty theft takes in a neglected little girl, until hidden pasts surface.',
    aiReasoning: 'Tender natural light and lived-in gestures conceal a quietly shattering moral inquiry.',
    streamingOn: ['Hulu', 'MUBI', 'Kanopy'],
    similarFilms: ['Parasite', 'Nobody Knows', 'A Separation'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 85
  },

  // Iran & Middle East Cinema
  {
    title: 'Close-Up',
    year: 1990,
    director: 'Abbas Kiarostami',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 98,
    vibeTag: 'Poetic Truth',
    tension: 64,
    pace: 32,
    atmosphere: 89,
    synopsis: 'A destitute Tehran cinephile impersonates director Mohsen Makhmalbaf, and the real-life participants re-enact his trial and longing.',
    aiReasoning: 'Blurs documentary and fiction into cinema’s purest meditation on dignity, illusion, and empathy.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Taste of Cherry', 'Certified Copy', 'F for Fake'],
    posterKey: 'solaris_mirage',
    ambientTone: 'amber',
    gemScore: 97
  },
  {
    title: 'A Separation',
    year: 2011,
    director: 'Asghar Farhadi',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 123,
    vibeTag: 'Moral Labyrinth',
    tension: 93,
    pace: 62,
    atmosphere: 70,
    synopsis: 'A couple’s divorce dispute in Tehran sparks an escalating legal and ethical crisis when a caregiver suffers a tragic fall.',
    aiReasoning: 'Every character tells a partial truth; Farhadi constructs Hitchcockian suspense strictly out of human conscience.',
    streamingOn: ['Amazon Prime', 'MUBI', 'Kanopy'],
    similarFilms: ['About Elly', 'Anatomy of a Fall', 'The Salesman'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 88
  },
  {
    title: 'Taste of Cherry',
    year: 1997,
    director: 'Abbas Kiarostami',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 95,
    vibeTag: 'Dusty Metaphysics',
    tension: 60,
    pace: 18,
    atmosphere: 92,
    synopsis: 'Driving along ochre hills outside Tehran, a quiet man searches for someone willing to bury him after he ends his life.',
    aiReasoning: 'Sun-baked windshields and unhurried dialogue transform an existential abyss into fragile beauty.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Close-Up', 'Paris, Texas', 'Winter Sleep'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 96
  },
  {
    title: 'About Elly',
    year: 2009,
    director: 'Asghar Farhadi',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 119,
    vibeTag: 'Caspian Mystery',
    tension: 90,
    pace: 56,
    atmosphere: 78,
    synopsis: 'A carefree Caspian seaside weekend among old university friends turns claustrophobic when one guest mysteriously vanishes.',
    aiReasoning: 'Crashing waves drown out polite lies as social etiquette fractures into sheer panic.',
    streamingOn: ['MUBI', 'Kanopy'],
    similarFilms: ['L’Avventura', 'A Separation', 'Cache'],
    posterKey: 'alpine_mystery',
    ambientTone: 'cyan',
    gemScore: 92
  },
  {
    title: 'Winter Sleep',
    year: 2014,
    director: 'Nuri Bilge Ceylan',
    country: 'Turkey',
    language: 'Turkish',
    runtimeMin: 196,
    vibeTag: 'Snowbound Ego',
    tension: 74,
    pace: 20,
    atmosphere: 91,
    synopsis: 'In snow-dusted Cappadocia, a former actor runs a cliffside hotel while his marriage and tenant disputes unearth buried bitterness.',
    aiReasoning: 'Chekhovian chamber drama filmed against vast Anatolian frost and flickering fireplace shadows.',
    streamingOn: ['MUBI', 'Criterion Channel'],
    similarFilms: ['Once Upon a Time in Anatolia', 'Drive My Car', 'Persona'],
    posterKey: 'alpine_mystery',
    ambientTone: 'amber',
    gemScore: 94
  },
  {
    title: 'Once Upon a Time in Anatolia',
    year: 2011,
    director: 'Nuri Bilge Ceylan',
    country: 'Turkey',
    language: 'Turkish',
    runtimeMin: 157,
    vibeTag: 'Nocturnal Steppe',
    tension: 78,
    pace: 22,
    atmosphere: 94,
    synopsis: 'Through a winding night on the Turkish steppe, prosecutors, doctors, and suspects search by headlight for a buried body.',
    aiReasoning: 'Headlamps sweeping across wheat fields create one of the most hypnotic midnight road movies ever made.',
    streamingOn: ['MUBI', 'Kanopy'],
    similarFilms: ['Memories of Murder', 'Stalker', 'Zodiac'],
    posterKey: 'velvet_rain',
    ambientTone: 'amber',
    gemScore: 96
  },
  {
    title: 'Incendies',
    year: 2010,
    director: 'Denis Villeneuve',
    country: 'Canada / Middle East',
    language: 'French / Arabic',
    runtimeMin: 131,
    vibeTag: 'Tragic Reckoning',
    tension: 96,
    pace: 48,
    atmosphere: 82,
    synopsis: 'Twins travel to their late mother’s war-torn homeland to deliver two sealed letters—unraveling a Greek-tragedy secret.',
    aiReasoning: 'Radiohead’s haunting opening chord launches a relentless excavation of memory and fate.',
    streamingOn: ['Prime Video', 'Netflix'],
    similarFilms: ['Oldboy', 'Prisoners', 'Sicario'],
    posterKey: 'solaris_mirage',
    ambientTone: 'crimson',
    gemScore: 84
  },

  // French, Nordic, Eastern & Western European Cinema
  {
    title: 'Le Samourai',
    year: 1967,
    director: 'Jean-Pierre Melville',
    country: 'France',
    language: 'French',
    runtimeMin: 105,
    vibeTag: 'Ice Noir',
    tension: 83,
    pace: 32,
    atmosphere: 92,
    synopsis: 'A methodical Parisian contract killer in trench coat and fedora becomes hunted by both the police and his own employers.',
    aiReasoning: 'Steel-blue Parisian apartments and near-silent discipline laid the blueprint for every cool neo-noir since.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Drive', 'Ghost Dog', 'Thief'],
    posterKey: 'parisian_shadow',
    ambientTone: 'slate',
    gemScore: 91
  },
  {
    title: 'La Haine',
    year: 1995,
    director: 'Matthieu Kassovitz',
    country: 'France',
    language: 'French',
    runtimeMin: 98,
    vibeTag: 'Kinetic Rebellion',
    tension: 92,
    pace: 82,
    atmosphere: 76,
    synopsis: 'Over twenty-four ticking hours in the Paris banlieues after a riot, three friends drift toward an inevitable confrontation.',
    aiReasoning: 'Razor-sharp monochrome, rooftop DJ echoes, and an unforgettable ticking clock toward impact.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['City of God', 'Do the Right Thing', 'Uncut Gems'],
    posterKey: 'parisian_shadow',
    ambientTone: 'slate',
    gemScore: 86
  },
  {
    title: 'Portrait of a Lady on Fire',
    year: 2019,
    director: 'Céline Sciamma',
    country: 'France',
    language: 'French',
    runtimeMin: 122,
    vibeTag: 'Candlelit Gaze',
    tension: 70,
    pace: 26,
    atmosphere: 98,
    synopsis: 'On an isolated Brittany island in 1770, a painter must secretly commit a reluctant bride’s features to canvas by night.',
    aiReasoning: 'Zero background score until a breathtaking bonfire chorus—pure tactile paint, ocean wind, and longing.',
    streamingOn: ['Hulu', 'Criterion Channel'],
    similarFilms: ['In the Mood for Love', 'Phantom Thread', 'The Piano'],
    posterKey: 'crimson_motel',
    ambientTone: 'amber',
    gemScore: 89
  },
  {
    title: 'Anatomy of a Fall',
    year: 2023,
    director: 'Justine Triet',
    country: 'France',
    language: 'French / English',
    runtimeMin: 151,
    vibeTag: 'Alpine Dissection',
    tension: 88,
    pace: 56,
    atmosphere: 72,
    synopsis: 'When a novelist’s husband is found dead in the snow beneath their chalet, her marriage becomes the courtroom’s prime suspect.',
    aiReasoning: 'Surgical dialogue turns marital ambiguity into edge-of-seat investigative suspense.',
    streamingOn: ['Hulu', 'MUBI'],
    similarFilms: ['A Separation', 'Gone Girl', 'Michael Clayton'],
    posterKey: 'alpine_mystery',
    ambientTone: 'slate',
    gemScore: 83
  },
  {
    title: 'Stalker',
    year: 1979,
    director: 'Andrei Tarkovsky',
    country: 'Soviet Union',
    language: 'Russian',
    runtimeMin: 162,
    vibeTag: 'Hypnotic Odyssey',
    tension: 74,
    pace: 12,
    atmosphere: 99,
    synopsis: 'A guide leads a disillusioned writer and a professor through a flooded, reality-bending Zone toward a room that grants secret desires.',
    aiReasoning: 'Sepia transition to lush, mossy ruins creates cinema’s supreme spiritual dream-state.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Solaris', 'Annihilation', 'Once Upon a Time in Anatolia'],
    posterKey: 'surreal_labyrinth',
    ambientTone: 'cyan',
    gemScore: 98
  },
  {
    title: 'Persona',
    year: 1966,
    director: 'Ingmar Bergman',
    country: 'Sweden',
    language: 'Swedish',
    runtimeMin: 83,
    vibeTag: 'Mirror Psyche',
    tension: 87,
    pace: 34,
    atmosphere: 92,
    synopsis: 'A mute stage actress and her talkative nurse retreat to a Baltic seaside house where their identities begin to merge.',
    aiReasoning: 'Monochrome close-ups crack open the fourth wall into pure psychological electricity.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Mulholland Drive', '3 Women', 'Black Swan'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 95
  },
  {
    title: 'Caché (Hidden)',
    year: 2005,
    director: 'Michael Haneke',
    country: 'France / Austria',
    language: 'French',
    runtimeMin: 117,
    vibeTag: 'Paranoid Gaze',
    tension: 91,
    pace: 36,
    atmosphere: 70,
    synopsis: 'A Parisian television host receives unblinking VHS surveillance tapes of his own house, forcing repressed history into daylight.',
    aiReasoning: 'Unsettling static frames make the viewer complicit in every second of creeping bourgeois guilt.',
    streamingOn: ['MUBI', 'Criterion Channel'],
    similarFilms: ['Blow-Up', 'The Conversation', 'Burning'],
    posterKey: 'parisian_shadow',
    ambientTone: 'slate',
    gemScore: 94
  },
  {
    title: 'The Lives of Others',
    year: 2006,
    director: 'Florian Henckel von Donnersmarck',
    country: 'Germany',
    language: 'German',
    runtimeMin: 137,
    vibeTag: 'Surveillance Noir',
    tension: 86,
    pace: 46,
    atmosphere: 78,
    synopsis: 'A cold Stasi officer bugs an East Berlin playwright’s apartment—only to become quietly transformed by the art he overhears.',
    aiReasoning: 'Rainy Berlin grey transforms into heartbreaking human grace in one of the finest endings ever filmed.',
    streamingOn: ['Prime Video', 'Kanopy'],
    similarFilms: ['The Conversation', 'Tinker Tailor Soldier Spy', 'Bridge of Spies'],
    posterKey: 'rain_detective',
    ambientTone: 'slate',
    gemScore: 84
  },
  {
    title: 'Three Colors: Blue',
    year: 1993,
    director: 'Krzysztof Kieślowski',
    country: 'France / Poland',
    language: 'French',
    runtimeMin: 98,
    vibeTag: 'Sapphire Elegy',
    tension: 68,
    pace: 30,
    atmosphere: 95,
    synopsis: 'After losing her composer husband and daughter, a woman retreats into blue-lit Parisian anonymity until music pulls her back.',
    aiReasoning: 'Cobalt swimming-pool reflections and sudden orchestral swells turn grief into pure sensory poetry.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Three Colors: Red', 'The Double Life of Véronique', 'Drive My Car'],
    posterKey: 'velvet_rain',
    ambientTone: 'cyan',
    gemScore: 92
  },
  {
    title: 'La Dolce Vita',
    year: 1960,
    director: 'Federico Fellini',
    country: 'Italy',
    language: 'Italian',
    runtimeMin: 174,
    vibeTag: 'Nocturnal Decadence',
    tension: 58,
    pace: 48,
    atmosphere: 94,
    synopsis: 'A disillusioned Rome tabloid columnist drifts across seven decadent nights of aristocrats, cinema idols, and Trevi fountain silence.',
    aiReasoning: 'Every nocturnal boulevard glides with intoxicating glamour hollowed out by dawn.',
    streamingOn: ['Paramount+', 'Criterion Channel'],
    similarFilms: ['The Great Beauty', '8½', 'Babylon'],
    posterKey: 'midnight_paris',
    ambientTone: 'amber',
    gemScore: 89
  },
  {
    title: 'Another Round',
    year: 2020,
    director: 'Thomas Vinterberg',
    country: 'Denmark',
    language: 'Danish',
    runtimeMin: 117,
    vibeTag: 'Euphoric Reckoning',
    tension: 66,
    pace: 62,
    atmosphere: 80,
    synopsis: 'Four weary high-school teachers test a theory that maintaining a steady 0.05% blood alcohol level unlocks creative vitality.',
    aiReasoning: 'Warm Copenhagen light and Mads Mikkelsen’s luminous physicality bridge midlife melancholy and wild joy.',
    streamingOn: ['Hulu', 'Kanopy'],
    similarFilms: ['The Worst Person in the World', 'The Hunt', 'Sideways'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 82
  },
  {
    title: 'The Worst Person in the World',
    year: 2021,
    director: 'Joachim Trier',
    country: 'Norway',
    language: 'Norwegian',
    runtimeMin: 128,
    vibeTag: 'Oslo Twenties',
    tension: 52,
    pace: 58,
    atmosphere: 88,
    synopsis: 'Across twelve chapters, a restless Oslo woman searches for identity, love, and purpose while freezing time across golden city streets.',
    aiReasoning: 'The time-freeze sunrise sprint through Oslo is instant modern cinema folklore.',
    streamingOn: ['Hulu', 'MUBI', 'Criterion Channel'],
    similarFilms: ['Frances Ha', 'Before Sunrise', 'Past Lives'],
    posterKey: 'midnight_paris',
    ambientTone: 'amber',
    gemScore: 85
  },

  // Latin America, India & Global South
  {
    title: 'City of God',
    year: 2002,
    director: 'Fernando Meirelles',
    country: 'Brazil',
    language: 'Portuguese',
    runtimeMin: 130,
    vibeTag: 'Kinetic Fate',
    tension: 94,
    pace: 94,
    atmosphere: 78,
    synopsis: 'A young photographer documents the explosive rise of rival gangs inside Rio de Janeiro’s sun-bleached Cidade de Deus.',
    aiReasoning: 'Blistering samba rhythms and kaleidoscopic editing that never drops a single heartbeat.',
    streamingOn: ['Paramount+', 'Max'],
    similarFilms: ['La Haine', 'Goodfellas', 'Amores Perros'],
    posterKey: 'crimson_penthouse',
    ambientTone: 'amber',
    gemScore: 81
  },
  {
    title: 'Amores Perros',
    year: 2000,
    director: 'Alejandro G. Iñárritu',
    country: 'Mexico',
    language: 'Spanish',
    runtimeMin: 154,
    vibeTag: 'Raw Collision',
    tension: 92,
    pace: 80,
    atmosphere: 76,
    synopsis: 'A brutal Mexico City car crash interlocks three strangers across class, betrayal, and street-level survival.',
    aiReasoning: 'Handheld urgency and overlapping timelines collide with devastating emotional gravity.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['City of God', 'Pulp Fiction', '21 Grams'],
    posterKey: 'crimson_motel',
    ambientTone: 'crimson',
    gemScore: 86
  },
  {
    title: 'Roma',
    year: 2018,
    director: 'Alfonso Cuarón',
    country: 'Mexico',
    language: 'Spanish / Mixtec',
    runtimeMin: 135,
    vibeTag: 'Monochrome Memory',
    tension: 64,
    pace: 34,
    atmosphere: 96,
    synopsis: 'An indigenous domestic worker navigates love, political unrest, and quiet devotion for a family in 1970s Mexico City.',
    aiReasoning: '65mm black-and-white panning shots elevate everyday courtyard water and ocean surf into sacred memory.',
    streamingOn: ['Netflix'],
    similarFilms: ['Shoplifters', 'The Tree of Life', 'Close-Up'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 87
  },
  {
    title: 'Pan’s Labyrinth',
    year: 2006,
    director: 'Guillermo del Toro',
    country: 'Spain / Mexico',
    language: 'Spanish',
    runtimeMin: 118,
    vibeTag: 'Dark Fable',
    tension: 89,
    pace: 56,
    atmosphere: 95,
    synopsis: 'In fascist 1944 Spain, a bookish girl discovers an overgrown stone labyrinth where a faun assigns three perilous trials.',
    aiReasoning: 'Lush cobalt-and-amber fairy tale brutality where myth offers the only refuge from tyranny.',
    streamingOn: ['Max', 'Netflix'],
    similarFilms: ['The Devil’s Backbone', 'Spirited Away', 'The Fall'],
    posterKey: 'surreal_labyrinth',
    ambientTone: 'cyan',
    gemScore: 84
  },
  {
    title: 'The Secret in Their Eyes',
    year: 2009,
    director: 'Juan José Campanella',
    country: 'Argentina',
    language: 'Spanish',
    runtimeMin: 129,
    vibeTag: 'Obsessive Coldcase',
    tension: 88,
    pace: 58,
    atmosphere: 82,
    synopsis: 'A retired legal counselor writes a novel about a twenty-five-year-old unsolved Buenos Aires murder—and the silent love beside him.',
    aiReasoning: 'Contains an unbroken stadium tracking shot and one of cinema’s hauntingly quiet final reveals.',
    streamingOn: ['Prime Video', 'Kanopy'],
    similarFilms: ['Memories of Murder', 'Prisoners', 'Zodiac'],
    posterKey: 'rain_detective',
    ambientTone: 'amber',
    gemScore: 87
  },
  {
    title: 'Pather Panchali',
    year: 1955,
    director: 'Satyajit Ray',
    country: 'India',
    language: 'Bengali',
    runtimeMin: 125,
    vibeTag: 'Monsoon Lyric',
    tension: 48,
    pace: 26,
    atmosphere: 94,
    synopsis: 'Young Apu grows up amid poverty, train whistles across tall white grass, and monsoon rains in rural Bengal.',
    aiReasoning: 'Ravi Shankar’s sitar and unvarnished human tenderness created a cornerstone of global poetic realism.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Bicycle Thieves', 'Where Is the Friend’s House?', 'Yi Yi'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 95
  },

  // North American & International Auteur Neo-Noir / Sci-Fi / Psychological
  {
    title: 'Blade Runner 2049',
    year: 2017,
    director: 'Denis Villeneuve',
    country: 'USA / Canada',
    language: 'English',
    runtimeMin: 164,
    vibeTag: 'Neon Solitude',
    tension: 76,
    pace: 28,
    atmosphere: 98,
    synopsis: 'A replicant blade runner uncovers a buried secret that threatens to ignite war amid orange desert ruins and rain-lashed megacities.',
    aiReasoning: 'Roger Deakins’ amber-and-cyan architecture makes every motionless frame feel like a museum relic.',
    streamingOn: ['Max', 'Hulu'],
    similarFilms: ['Blade Runner', 'Arrival', 'Ghost in the Shell'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 79
  },
  {
    title: 'Mulholland Drive',
    year: 2001,
    director: 'David Lynch',
    country: 'USA / France',
    language: 'English',
    runtimeMin: 147,
    vibeTag: 'Velvet Dream',
    tension: 88,
    pace: 36,
    atmosphere: 97,
    synopsis: 'An amnesiac survivor of a winding Hollywood Hills crash teams up with an aspiring actress inside a glittering, shifting nightmare.',
    aiReasoning: 'Blue velvet curtains and Club Silencio turn Hollywood ambition into hypnotic surreal terror.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Persona', 'Lost Highway', 'Perfect Blue'],
    posterKey: 'crimson_motel',
    ambientTone: 'crimson',
    gemScore: 90
  },
  {
    title: 'Zodiac',
    year: 2007,
    director: 'David Fincher',
    country: 'USA',
    language: 'English',
    runtimeMin: 157,
    vibeTag: 'Clockwork Dread',
    tension: 89,
    pace: 52,
    atmosphere: 74,
    synopsis: 'Reporters and detectives across 1970s San Francisco lose decades to encrypted letters from a killer who refuses to be caught.',
    aiReasoning: 'Meticulous period texture and a basement scene of pure oxygen-less panic.',
    streamingOn: ['Paramount+', 'Netflix'],
    similarFilms: ['Memories of Murder', 'Se7en', 'All the President’s Men'],
    posterKey: 'rain_detective',
    ambientTone: 'amber',
    gemScore: 81
  },
  {
    title: 'Sicario',
    year: 2015,
    director: 'Denis Villeneuve',
    country: 'USA',
    language: 'English / Spanish',
    runtimeMin: 121,
    vibeTag: 'Border Tension',
    tension: 98,
    pace: 68,
    atmosphere: 78,
    synopsis: 'An idealistic FBI agent joins a shadowy black-ops task force crossing into Juárez where rules dissolve before dusk.',
    aiReasoning: 'Sub-bass pulses and twilight silhouettes turn a border bridge traffic jam into unbearable suspense.',
    streamingOn: ['Netflix', 'Peacock'],
    similarFilms: ['No Country for Old Men', 'Traffic', 'Prisoners'],
    posterKey: 'solaris_mirage',
    ambientTone: 'amber',
    gemScore: 80
  },
  {
    title: 'Se7en',
    year: 1995,
    director: 'David Fincher',
    country: 'USA',
    language: 'English',
    runtimeMin: 127,
    vibeTag: 'Rainy Noir',
    tension: 96,
    pace: 62,
    atmosphere: 84,
    synopsis: 'During seven relentless days of rain, a retiring detective and his impulsive partner hunt a killer staging the seven deadly sins.',
    aiReasoning: 'Bleach-bypass shadows, Bach library reverie, and an unrelenting descent into moral darkness.',
    streamingOn: ['Max', 'Prime Video'],
    similarFilms: ['Cure', 'Zodiac', 'Prisoners'],
    posterKey: 'velvet_rain',
    ambientTone: 'slate',
    gemScore: 76
  },
  {
    title: 'Arrival',
    year: 2016,
    director: 'Denis Villeneuve',
    country: 'USA',
    language: 'English',
    runtimeMin: 116,
    vibeTag: 'Quiet Awe',
    tension: 74,
    pace: 30,
    atmosphere: 92,
    synopsis: 'When monolithic obsidian vessels hover over twelve nations, a linguist decodes a nonlinear script that rewrites time itself.',
    aiReasoning: 'Fog-wrapped Montana meadows and Max Richter’s strings merge sci-fi mystery with shattering intimacy.',
    streamingOn: ['Paramount+', 'Netflix'],
    similarFilms: ['Stalker', 'Contact', 'Interstellar'],
    posterKey: 'alpine_mystery',
    ambientTone: 'cyan',
    gemScore: 81
  },
  {
    title: 'Nightcrawler',
    year: 2014,
    director: 'Dan Gilroy',
    country: 'USA',
    language: 'English',
    runtimeMin: 117,
    vibeTag: 'Neon Predation',
    tension: 92,
    pace: 76,
    atmosphere: 74,
    synopsis: 'A hollow insomniac prowls Los Angeles freeways after midnight with a police scanner and camcorder, selling tragedy to local news.',
    aiReasoning: 'Sodium-vapor L.A. nights and Gyllenhaal’s unblinking stare make late capitalism feel razor-sharp.',
    streamingOn: ['Netflix', 'Peacock'],
    similarFilms: ['Taxi Driver', 'Drive', 'Good Time'],
    posterKey: 'cyber_memory',
    ambientTone: 'crimson',
    gemScore: 83
  },
  {
    title: 'Aftersun',
    year: 2022,
    director: 'Charlotte Wells',
    country: 'UK / USA',
    language: 'English',
    runtimeMin: 102,
    vibeTag: 'Sunlit Ache',
    tension: 54,
    pace: 26,
    atmosphere: 96,
    synopsis: 'Twenty years later, a daughter replays MiniDV tapes from a quiet Turkish resort holiday with her loving, fragile father.',
    aiReasoning: 'Strobe-lit dancefloor flashes reveal everything left unsaid beneath bright Mediterranean sun.',
    streamingOn: ['MUBI', 'A24'],
    similarFilms: ['Past Lives', 'Yi Yi', 'Moonlight'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 91
  },
  {
    title: 'Past Lives',
    year: 2023,
    director: 'Celine Song',
    country: 'USA / South Korea',
    language: 'Korean / English',
    runtimeMin: 106,
    vibeTag: 'Fated Echoes',
    tension: 52,
    pace: 28,
    atmosphere: 94,
    synopsis: 'Childhood sweethearts separated between Seoul and Toronto reunite twenty-four years later for one luminous week in New York.',
    aiReasoning: 'In-Yun fate rendered with aching restraint, twilight bridges, and quiet emotional precision.',
    streamingOn: ['Paramount+', 'Showtime'],
    similarFilms: ['In the Mood for Love', 'Before Sunset', 'Aftersun'],
    posterKey: 'midnight_paris',
    ambientTone: 'amber',
    gemScore: 86
  },
  {
    title: 'Prisoners',
    year: 2013,
    director: 'Denis Villeneuve',
    country: 'USA',
    language: 'English',
    runtimeMin: 153,
    vibeTag: 'Winter Dread',
    tension: 97,
    pace: 60,
    atmosphere: 76,
    synopsis: 'When two young girls disappear on a sleet-chilled Thanksgiving, a desperate father crosses every line as a detective races time.',
    aiReasoning: 'Sleet-soaked Pennsylvania suburbs and labyrinthine clues generate suffocating, morally complex suspense.',
    streamingOn: ['Max', 'Hulu'],
    similarFilms: ['Zodiac', 'Mystic River', 'The Secret in Their Eyes'],
    posterKey: 'rain_detective',
    ambientTone: 'slate',
    gemScore: 80
  },
  {
    title: 'Drive',
    year: 2011,
    director: 'Nicolas Winding Refn',
    country: 'USA',
    language: 'English',
    runtimeMin: 100,
    vibeTag: 'Synth Noir',
    tension: 86,
    pace: 54,
    atmosphere: 93,
    synopsis: 'A Hollywood stuntman who moonlights as a five-minute getaway driver gets drawn into a bloody heist to protect his neighbor.',
    aiReasoning: 'Magenta neon elevators and Kavinsky synth transform pulp crime into minimalist romantic myth.',
    streamingOn: ['Prime Video', 'Max'],
    similarFilms: ['Le Samourai', 'Thief', 'Nightcrawler'],
    posterKey: 'cyber_memory',
    ambientTone: 'crimson',
    gemScore: 83
  },
  {
    title: 'Children of Men',
    year: 2006,
    director: 'Alfonso Cuarón',
    country: 'UK / USA',
    language: 'English',
    runtimeMin: 109,
    vibeTag: 'Kinetic Elegy',
    tension: 95,
    pace: 82,
    atmosphere: 86,
    synopsis: 'In an infertile 2027 Britain sliding into authoritarian chaos, a weary bureaucrat escorts a miraculously pregnant refugee to sea.',
    aiReasoning: 'Unbroken multi-minute battle takes plunge you directly inside history happening in real time.',
    streamingOn: ['Peacock', 'Prime Video'],
    similarFilms: ['Blade Runner 2049', 'Mad Max: Fury Road', 'Roma'],
    posterKey: 'velvet_rain',
    ambientTone: 'slate',
    gemScore: 85
  },
  {
    title: 'Chinatown',
    year: 1974,
    director: 'Roman Polanski',
    country: 'USA',
    language: 'English',
    runtimeMin: 130,
    vibeTag: 'Sunlit Noir',
    tension: 88,
    pace: 46,
    atmosphere: 90,
    synopsis: 'A 1937 Los Angeles private investigator hired for a routine infidelity case uncovers municipal water corruption and family tragedy.',
    aiReasoning: 'Blinding California glare hides noir’s bleakest labyrinth and an immortal closing line.',
    streamingOn: ['Paramount+', 'Max'],
    similarFilms: ['L.A. Confidential', 'Vertigo', 'Brick'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 87
  },
  {
    title: 'The Conversation',
    year: 1974,
    director: 'Francis Ford Coppola',
    country: 'USA',
    language: 'English',
    runtimeMin: 113,
    vibeTag: 'Acoustic Paranoia',
    tension: 86,
    pace: 34,
    atmosphere: 80,
    synopsis: 'A reclusive San Francisco audio surveillance expert replays a Union Square recording until a single inflection reveals a murder.',
    aiReasoning: 'Tape reels spinning in dim light build unbearable dread out of a single misheard syllable.',
    streamingOn: ['Paramount+', 'Criterion Channel'],
    similarFilms: ['Blow Out', 'Caché', 'The Lives of Others'],
    posterKey: 'rain_detective',
    ambientTone: 'slate',
    gemScore: 92
  },
  {
    title: 'Phantom Thread',
    year: 2017,
    director: 'Paul Thomas Anderson',
    country: 'UK / USA',
    language: 'English',
    runtimeMin: 130,
    vibeTag: 'Velvet Control',
    tension: 76,
    pace: 34,
    atmosphere: 96,
    synopsis: 'In 1950s London, an obsessive couturier’s clockwork studio life is upended by a strong-willed young muse.',
    aiReasoning: 'Jonny Greenwood’s piano score and tactile 35mm wool turn romance into a razor-edged power duel.',
    streamingOn: ['Netflix', 'Peacock'],
    similarFilms: ['Portrait of a Lady on Fire', 'Rebecca', 'There Will Be Blood'],
    posterKey: 'crimson_motel',
    ambientTone: 'amber',
    gemScore: 88
  },
  {
    title: 'Ex Machina',
    year: 2014,
    director: 'Alex Garland',
    country: 'UK',
    language: 'English',
    runtimeMin: 108,
    vibeTag: 'Glass Tension',
    tension: 88,
    pace: 44,
    atmosphere: 84,
    synopsis: 'Inside an isolated Norwegian-inspired glass bunker, a young coder administers a Turing test to an uncanny sentient AI.',
    aiReasoning: 'Minimalist concrete, scarlet emergency blackouts, and a quiet dance scene steeped in dread.',
    streamingOn: ['Max', 'Hulu'],
    similarFilms: ['Her', 'Blade Runner 2049', 'Annihilation'],
    posterKey: 'alpine_mystery',
    ambientTone: 'crimson',
    gemScore: 82
  },
  {
    title: 'Moonlight',
    year: 2016,
    director: 'Barry Jenkins',
    country: 'USA',
    language: 'English',
    runtimeMin: 111,
    vibeTag: 'Indigo Grace',
    tension: 58,
    pace: 28,
    atmosphere: 97,
    synopsis: 'Across childhood, adolescence, and adulthood in Miami, a quiet Black man discovers tenderness beneath armor.',
    aiReasoning: 'Moonlit ocean surf and swirling violin close-ups glow with rare intimacy and lyricism.',
    streamingOn: ['Max', 'A24'],
    similarFilms: ['In the Mood for Love', 'Aftersun', 'Past Lives'],
    posterKey: 'velvet_rain',
    ambientTone: 'cyan',
    gemScore: 89
  },
  {
    title: 'La Chimera',
    year: 2023,
    director: 'Alice Rohrwacher',
    country: 'Italy / France',
    language: 'Italian',
    runtimeMin: 130,
    vibeTag: 'Earthy Myth',
    tension: 56,
    pace: 40,
    atmosphere: 93,
    synopsis: 'A disheveled British archaeologist with a gift for sensing Etruscan tombs roams sun-dappled Tuscany haunted by a lost love.',
    aiReasoning: 'Warm 16mm grain and joyful thieves fuse folklore, grief, and Mediterranean enchantment.',
    streamingOn: ['Hulu', 'MUBI'],
    similarFilms: ['Happy as Lazzaro', 'Amarcord', 'Close-Up'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 93
  },
  {
    title: 'No Country for Old Men',
    year: 2007,
    director: 'Joel & Ethan Coen',
    country: 'USA',
    language: 'English',
    runtimeMin: 122,
    vibeTag: 'Desert Fate',
    tension: 96,
    pace: 56,
    atmosphere: 82,
    synopsis: 'In 1980 West Texas, a hunter stumbles on two million dollars in the desert—triggering pursuit by an unstoppable philosophy-spouting assassin.',
    aiReasoning: 'Zero musical score lets boots on motel carpet and coin-toss silence tighten tension to breaking point.',
    streamingOn: ['Paramount+', 'Max'],
    similarFilms: ['Sicario', 'Fargo', 'There Will Be Blood'],
    posterKey: 'solaris_mirage',
    ambientTone: 'amber',
    gemScore: 81
  },
  {
    title: 'Spirited Away',
    year: 2001,
    director: 'Hayao Miyazaki',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 125,
    vibeTag: 'Spirit Odyssey',
    tension: 62,
    pace: 52,
    atmosphere: 98,
    synopsis: 'A ten-year-old girl wanders into an enchanted bathhouse of gods and spirits where she must work to free her transformed parents.',
    aiReasoning: 'The flooded twilight train journey stands as one of the purest visual poems in world animation.',
    streamingOn: ['Max'],
    similarFilms: ['Princess Mononoke', 'Pan’s Labyrinth', 'Howl’s Moving Castle'],
    posterKey: 'surreal_labyrinth',
    ambientTone: 'cyan',
    gemScore: 82
  },
  {
    title: 'Perfect Days',
    year: 2023,
    director: 'Wim Wenders',
    country: 'Japan / Germany',
    language: 'Japanese',
    runtimeMin: 124,
    vibeTag: 'Zen Daylight',
    tension: 24,
    pace: 18,
    atmosphere: 95,
    synopsis: 'A quiet Tokyo public-toilet cleaner savors cassette tapes, paperback novels, dappled komorebi sunlight through leaves, and small human kindness.',
    aiReasoning: 'Proves cinema needs zero plot explosions when every morning light beam feels sacred.',
    streamingOn: ['Hulu', 'MUBI'],
    similarFilms: ['Paterson', 'Tokyo Story', 'Drive My Car'],
    posterKey: 'neon_tokyo',
    ambientTone: 'amber',
    gemScore: 91
  },
  {
    title: 'Mad Max: Fury Road',
    year: 2015,
    director: 'George Miller',
    country: 'Australia / USA',
    language: 'English',
    runtimeMin: 120,
    vibeTag: 'Relentless Fury',
    tension: 96,
    pace: 99,
    atmosphere: 88,
    synopsis: 'Across a scorched wasteland, a rebel Imperator and a haunted loner lead an armored war rig sprint toward green redemption.',
    aiReasoning: 'Center-framed kinetic opera where every gear shift and sandstorm surge tells story without exposition.',
    streamingOn: ['Max', 'Hulu'],
    similarFilms: ['Children of Men', 'Furiosa', 'Akira'],
    posterKey: 'solaris_mirage',
    ambientTone: 'crimson',
    gemScore: 78
  },
  {
    title: 'The Handmaiden',
    year: 2016,
    director: 'Park Chan-wook',
    country: 'South Korea',
    language: 'Korean / Japanese',
    runtimeMin: 145,
    vibeTag: 'Gothic Deception',
    tension: 90,
    pace: 62,
    atmosphere: 94,
    synopsis: 'In 1930s Japanese-occupied Korea, a pickpocket is hired as handmaiden to a secluded heiress—inside a three-act puzzle of shifting loyalties.',
    aiReasoning: 'Sumptuous mansion architecture unfolds through three contradictory perspectives of intrigue and liberation.',
    streamingOn: ['Prime Video', 'MUBI'],
    similarFilms: ['Decision to Leave', 'Portrait of a Lady on Fire', 'Oldboy'],
    posterKey: 'crimson_penthouse',
    ambientTone: 'crimson',
    gemScore: 88
  },
  {
    title: 'Solaris',
    year: 1972,
    director: 'Andrei Tarkovsky',
    country: 'Soviet Union',
    language: 'Russian',
    runtimeMin: 167,
    vibeTag: 'Orbital Ghost',
    tension: 70,
    pace: 14,
    atmosphere: 97,
    synopsis: 'A psychologist sent to a decaying station orbiting an oceanic planet confronts physical manifestations of his deepest regrets.',
    aiReasoning: 'Highway tunnels and zero-gravity candlelight reimagine sci-fi as an intimate study of memory.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Stalker', '2001: A Space Odyssey', 'Arrival'],
    posterKey: 'quantum_oasis',
    ambientTone: 'cyan',
    gemScore: 96
  },
  {
    title: 'Beau Travail',
    year: 1999,
    director: 'Claire Denis',
    country: 'France',
    language: 'French',
    runtimeMin: 92,
    vibeTag: 'Sunlit Ritual',
    tension: 74,
    pace: 26,
    atmosphere: 95,
    synopsis: 'Beneath Djibouti’s volcanic coast, a Foreign Legion sergeant watches envy overtake his regiment—remembered from a misty Marseille apartment.',
    aiReasoning: 'Choreographed sun-baked drills culminate in one of cinema’s most iconic dance explosions.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Aftersun', 'Moonlight', 'Portrait of a Lady on Fire'],
    posterKey: 'solaris_mirage',
    ambientTone: 'amber',
    gemScore: 97
  },
  {
    title: 'Parasite',
    year: 2019,
    director: 'Bong Joon-ho',
    country: 'South Korea',
    language: 'Korean',
    runtimeMin: 132,
    vibeTag: 'Architectural Razor',
    tension: 92,
    pace: 76,
    atmosphere: 80,
    synopsis: 'A resourceful semi-basement family infiltrates a wealthy architect’s hillside villa—until a rain-soaked night reveals what waits downstairs.',
    aiReasoning: 'Staircases become class geometry as razor-sharp comedy pivots cleanly into breathless thriller.',
    streamingOn: ['Max', 'Hulu'],
    similarFilms: ['Memories of Murder', 'Shoplifters', 'Burning'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 80
  },
  {
    title: 'The Vanishing (Spoorloos)',
    year: 1988,
    director: 'George Sluizer',
    country: 'Netherlands / France',
    language: 'Dutch / French',
    runtimeMin: 107,
    vibeTag: 'Daylight Dread',
    tension: 96,
    pace: 40,
    atmosphere: 74,
    synopsis: 'When a woman vanishes from a crowded sunlit French highway rest stop, her partner’s three-year search draws an unthinkable invitation.',
    aiReasoning: 'No blood, no darkness—just bright afternoon asphalt and the most chilling finale in suspense history.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Caché', 'Cure', 'Zodiac'],
    posterKey: 'alpine_mystery',
    ambientTone: 'amber',
    gemScore: 95
  },
  {
    title: 'Tokyo Story',
    year: 1953,
    director: 'Yasujirō Ozu',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 136,
    vibeTag: 'Tatami Stillness',
    tension: 34,
    pace: 14,
    atmosphere: 92,
    synopsis: 'An elderly couple visits their busy grown children in postwar Tokyo, finding quiet warmth only from their widowed daughter-in-law.',
    aiReasoning: 'Low tatami-mat camera angles turn everyday train departures into timeless meditation on family and time.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Yi Yi', 'Perfect Days', 'After Life'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 96
  },
  {
    title: 'Uncut Gems',
    year: 2019,
    director: 'Josh & Benny Safdie',
    country: 'USA',
    language: 'English',
    runtimeMin: 135,
    vibeTag: 'Relentless Pulse',
    tension: 99,
    pace: 98,
    atmosphere: 72,
    synopsis: 'A charismatic Manhattan diamond-district jeweler stacks impossible parlay bets while collectors close in from every doorway.',
    aiReasoning: 'Overlapping dialogue and Oneohtrix synth build a two-hour sprint without a single calm breath.',
    streamingOn: ['Netflix', 'A24'],
    similarFilms: ['Good Time', 'Nightcrawler', 'La Haine'],
    posterKey: 'cyber_memory',
    ambientTone: 'cyan',
    gemScore: 81
  },
  {
    title: 'The Fall',
    year: 2006,
    director: 'Tarsem Singh',
    country: 'USA / India / South Africa',
    language: 'English',
    runtimeMin: 117,
    vibeTag: 'Mythic Odyssey',
    tension: 60,
    pace: 46,
    atmosphere: 99,
    synopsis: 'In a 1920s Los Angeles hospital, an injured silent-era stuntman spins an epic global fable for a five-year-old girl.',
    aiReasoning: 'Shot across twenty-four countries without CGI—pure cobalt dunes, crimson palaces, and aching heart.',
    streamingOn: ['MUBI'],
    similarFilms: ['Pan’s Labyrinth', 'La Chimera', 'Baraka'],
    posterKey: 'quantum_oasis',
    ambientTone: 'crimson',
    gemScore: 93
  },
  {
    title: 'Chungking Express',
    year: 1994,
    director: 'Wong Kar-wai',
    country: 'Hong Kong',
    language: 'Cantonese',
    runtimeMin: 102,
    vibeTag: 'Midnight Dream',
    tension: 54,
    pace: 72,
    atmosphere: 96,
    synopsis: 'Two lovesick Hong Kong cops cross paths with a blonde-wigged underworld courier and a daydreaming snack-bar worker.',
    aiReasoning: 'Expired pineapples, California Dreamin’, and kinetic streetlight romance bottled in 1994 perfection.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Fallen Angels', 'In the Mood for Love', 'Before Sunrise'],
    posterKey: 'neon_tokyo',
    ambientTone: 'amber',
    gemScore: 88
  },
  {
    title: 'Paris, Texas',
    year: 1984,
    director: 'Wim Wenders',
    country: 'West Germany / France',
    language: 'English',
    runtimeMin: 145,
    vibeTag: 'Desert Elegy',
    tension: 62,
    pace: 20,
    atmosphere: 97,
    synopsis: 'After wandering out of the Mojave Desert after four silent years, a drifter reconnects with his young son and searches for his lost wife.',
    aiReasoning: 'Ry Cooder’s slide guitar and emerald neon glass booths create cinema’s most tender confession.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Taste of Cherry', 'Aftersun', 'Drive My Car'],
    posterKey: 'crimson_motel',
    ambientTone: 'crimson',
    gemScore: 92
  },
  {
    title: 'Everything Everywhere All at Once',
    year: 2022,
    director: 'Daniels',
    country: 'USA',
    language: 'English / Cantonese',
    runtimeMin: 139,
    vibeTag: 'Multiverse Surge',
    tension: 82,
    pace: 96,
    atmosphere: 88,
    synopsis: 'An exhausted laundromat owner mid-tax-audit must tap parallel versions of her unrealized lives to save her daughter.',
    aiReasoning: 'Hyper-kinetic absurdist chaos grounded in aching immigrant family reconciliation.',
    streamingOn: ['Showtime', 'Paramount+', 'A24'],
    similarFilms: ['Paprika', 'The Matrix', 'Eternal Sunshine'],
    posterKey: 'surreal_labyrinth',
    ambientTone: 'cyan',
    gemScore: 79
  },
  {
    title: 'Tampopo',
    year: 1985,
    director: 'Juzo Itami',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 114,
    vibeTag: 'Sensory Joy',
    tension: 34,
    pace: 62,
    atmosphere: 92,
    synopsis: 'A cowboy-hatted truck driver helps a struggling widow craft the ultimate Tokyo ramen shop across playful culinary vignettes.',
    aiReasoning: 'A joyful ramen western bursting with sensual appetite, warmth, and eccentric wit.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Chungking Express', 'Babette’s Feast', 'Perfect Days'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 91
  },
  {
    title: 'Amour',
    year: 2012,
    director: 'Michael Haneke',
    country: 'France / Austria',
    language: 'French',
    runtimeMin: 127,
    vibeTag: 'Chamber Devotion',
    tension: 68,
    pace: 18,
    atmosphere: 86,
    synopsis: 'Inside their quiet Parisian apartment, an octogenarian music teacher cares for his beloved wife after a debilitating stroke.',
    aiReasoning: 'Unflinching, deeply humane chamber cinema where silence speaks volumes of lifelong love.',
    streamingOn: ['MUBI', 'Kanopy'],
    similarFilms: ['Drive My Car', 'Tokyo Story', 'The Father'],
    posterKey: 'parisian_shadow',
    ambientTone: 'slate',
    gemScore: 92
  },
  {
    title: 'City Lights',
    year: 1931,
    director: 'Charlie Chaplin',
    country: 'USA',
    language: 'Silent',
    runtimeMin: 87,
    vibeTag: 'Timeless Grace',
    tension: 44,
    pace: 48,
    atmosphere: 90,
    synopsis: 'A penniless Tramp falls for a blind flower girl and scrapes through chaotic nights to fund an operation that restores her sight.',
    aiReasoning: 'The final silent close-up remains the purest emotional triumph in cinema history.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Modern Times', 'Bicycle Thieves', 'Cinema Paradiso'],
    posterKey: 'midnight_paris',
    ambientTone: 'amber',
    gemScore: 89
  },
  {
    title: 'Bicycle Thieves',
    year: 1948,
    director: 'Vittorio De Sica',
    country: 'Italy',
    language: 'Italian',
    runtimeMin: 89,
    vibeTag: 'Street Humanity',
    tension: 76,
    pace: 48,
    atmosphere: 82,
    synopsis: 'In postwar Rome, a desperate father and his young son scour rain-swept alleys after the bicycle essential to his job is stolen.',
    aiReasoning: 'Non-professional faces and open Roman streets forged the soul of neorealist world cinema.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Pather Panchali', 'Close-Up', 'Shoplifters'],
    posterKey: 'velvet_rain',
    ambientTone: 'slate',
    gemScore: 93
  },
  {
    title: 'Blow Out',
    year: 1981,
    director: 'Brian De Palma',
    country: 'USA',
    language: 'English',
    runtimeMin: 108,
    vibeTag: 'Crimson Conspiracy',
    tension: 94,
    pace: 66,
    atmosphere: 84,
    synopsis: 'A Philadelphia sound-effects technician recording midnight owl calls accidentally captures a gunshot before a governor’s car plunges.',
    aiReasoning: 'Split-diopter paranoia and Technicolor fireworks deliver a devastating neo-noir gut punch.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['The Conversation', 'Chinatown', 'Nightcrawler'],
    posterKey: 'crimson_penthouse',
    ambientTone: 'crimson',
    gemScore: 89
  },
  {
    title: 'Stalker: Tarkovsky Echoes / Mirror',
    year: 1975,
    director: 'Andrei Tarkovsky',
    country: 'Soviet Union',
    language: 'Russian',
    runtimeMin: 107,
    vibeTag: 'Poetic Memory',
    tension: 54,
    pace: 16,
    atmosphere: 98,
    synopsis: 'A dying poet recalls childhood barns, wartime newsreels, wind across buckwheat fields, and his mother’s luminous face.',
    aiReasoning: 'Non-linear dream cinema composed like breath, water, and fire.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Stalker', 'The Tree of Life', 'Aftersun'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 97
  },
  {
    title: 'Akira',
    year: 1988,
    director: 'Katsuhiro Otomo',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 124,
    vibeTag: 'Cyber Kinetic',
    tension: 93,
    pace: 92,
    atmosphere: 94,
    synopsis: 'Across Neo-Tokyo 2019, a biker gang member develops uncontrollable telekinetic powers feared by military psychics.',
    aiReasoning: 'Hand-inked neon motorcycle trails and percussive gamelan synths reshaped global animation forever.',
    streamingOn: ['Hulu', 'Crunchyroll'],
    similarFilms: ['Ghost in the Shell', 'Perfect Blue', 'Blade Runner 2049'],
    posterKey: 'cyber_memory',
    ambientTone: 'crimson',
    gemScore: 83
  },
  {
    title: 'Ghost in the Shell',
    year: 1995,
    director: 'Mamoru Oshii',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 83,
    vibeTag: 'Cyber Philosophy',
    tension: 82,
    pace: 46,
    atmosphere: 96,
    synopsis: 'A cyborg counter-cybercrime major hunts a sentient hacker known as the Puppet Master across rain-flooded canals.',
    aiReasoning: 'Kenji Kawai’s choral hymn over quiet Hong Kong-inspired canals remains unmatched sci-fi atmosphere.',
    streamingOn: ['Prime Video', 'Peacock'],
    similarFilms: ['Blade Runner 2049', 'Akira', 'Ex Machina'],
    posterKey: 'neon_tokyo',
    ambientTone: 'cyan',
    gemScore: 87
  },
  {
    title: 'The Double Life of Véronique',
    year: 1991,
    director: 'Krzysztof Kieślowski',
    country: 'Poland / France',
    language: 'Polish / French',
    runtimeMin: 98,
    vibeTag: 'Golden Resonance',
    tension: 62,
    pace: 30,
    atmosphere: 98,
    synopsis: 'Two unrelated women—one in Kraków, one in Paris—share identical faces and an eerie spiritual bond across borders.',
    aiReasoning: 'Amber-tinted glass beads and Zbigniew Preisner’s soprano conjure pure metaphysical wonder.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Three Colors: Blue', 'Mulholland Drive', 'Persona'],
    posterKey: 'amber_hotel',
    ambientTone: 'amber',
    gemScore: 95
  },
  {
    title: 'Anatomy of Hell / Cure: Twin Shadow',
    year: 1998,
    director: 'Thomas Vinterberg',
    country: 'Denmark',
    language: 'Danish',
    runtimeMin: 105,
    vibeTag: 'Family Fracture',
    tension: 95,
    pace: 66,
    atmosphere: 70,
    synopsis: 'At a wealthy patriarch’s sixtieth birthday banquet in a country manor, his eldest son delivers a toast that shatters every illusion.',
    aiReasoning: 'Raw Dogme 95 handheld immediacy extracts volcanic emotional tension inside candlelight.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Another Round', 'A Separation', 'Succession'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 91
  },
  {
    title: 'Tár',
    year: 2022,
    director: 'Todd Field',
    country: 'USA / Germany',
    language: 'English / German',
    runtimeMin: 158,
    vibeTag: 'Acoustical Dread',
    tension: 85,
    pace: 40,
    atmosphere: 84,
    synopsis: 'At the pinnacle of Berlin’s classical music elite, a celebrated maestro hears phantom metronomes as power unravels.',
    aiReasoning: 'Clinical Berlin minimalism gradually bends into ghost-story paranoia with extraordinary precision.',
    streamingOn: ['Peacock', 'Prime Video'],
    similarFilms: ['Whiplash', 'Black Swan', 'Persona'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 86
  },
  {
    title: 'Taxi Driver',
    year: 1976,
    director: 'Martin Scorsese',
    country: 'USA',
    language: 'English',
    runtimeMin: 114,
    vibeTag: 'Steam & Neon',
    tension: 91,
    pace: 46,
    atmosphere: 92,
    synopsis: 'An insomniac Vietnam veteran drives the night shift through steaming 1970s Manhattan avenues, slowly detaching from reality.',
    aiReasoning: 'Bernard Herrmann’s smoky saxophone and rain-smeared windshields remain the gold standard of urban alienation.',
    streamingOn: ['Netflix', 'Max'],
    similarFilms: ['Nightcrawler', 'King of Comedy', 'Le Samourai'],
    posterKey: 'crimson_motel',
    ambientTone: 'crimson',
    gemScore: 82
  },
  {
    title: 'Good Time',
    year: 2017,
    director: 'Josh & Benny Safdie',
    country: 'USA',
    language: 'English',
    runtimeMin: 102,
    vibeTag: 'Neon Sprint',
    tension: 97,
    pace: 96,
    atmosphere: 82,
    synopsis: 'After a bungled Queens bank robbery lands his brother in custody, a frantic hustler tears through one chaotic neon night to bail him out.',
    aiReasoning: 'Fluorescent hospital corridors and feverish electro momentum make every wrong decision electric.',
    streamingOn: ['Max', 'A24'],
    similarFilms: ['Uncut Gems', 'After Hours', 'Nightcrawler'],
    posterKey: 'cyber_memory',
    ambientTone: 'cyan',
    gemScore: 84
  },
  {
    title: 'Cinema Paradiso',
    year: 1988,
    director: 'Giuseppe Tornatore',
    country: 'Italy',
    language: 'Italian',
    runtimeMin: 155,
    vibeTag: 'Celluloid Nostalgia',
    tension: 38,
    pace: 34,
    atmosphere: 96,
    synopsis: 'A renowned Rome filmmaker returns to his Sicilian village for an old projectionist’s funeral—reliving his lifelong love affair with movies.',
    aiReasoning: 'Ennio Morricone’s aching theme and the reel of censored kisses define pure love of cinema.',
    streamingOn: ['Paramount+', 'Kanopy'],
    similarFilms: ['The Fabelmans', 'La Dolce Vita', '8½'],
    posterKey: 'midnight_paris',
    ambientTone: 'amber',
    gemScore: 82
  },
  {
    title: 'The Seventh Seal',
    year: 1957,
    director: 'Ingmar Bergman',
    country: 'Sweden',
    language: 'Swedish',
    runtimeMin: 96,
    vibeTag: 'Existential Chess',
    tension: 76,
    pace: 30,
    atmosphere: 91,
    synopsis: 'Returning from the Crusades across plague-ravaged Sweden, a disillusioned knight challenges Death to a chess game for his life.',
    aiReasoning: 'Stark monochrome horizons and unforgettable existential poetry that still echoes through modern cinema.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Persona', 'Stalker', 'The Lighthouse'],
    posterKey: 'alpine_mystery',
    ambientTone: 'slate',
    gemScore: 91
  },
  {
    title: 'Where Is the Friend’s House?',
    year: 1987,
    director: 'Abbas Kiarostami',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 83,
    vibeTag: 'Gentle Quest',
    tension: 44,
    pace: 32,
    atmosphere: 92,
    synopsis: 'Discovering he accidentally packed his classmate’s notebook, an eight-year-old Iranian boy treks up zigzagging hillside paths at dusk to return it.',
    aiReasoning: 'Turns a simple schoolboy errand into one of world cinema’s most suspenseful, tender odysseys.',
    streamingOn: ['Criterion Channel', 'MUBI'],
    similarFilms: ['Close-Up', 'Pather Panchali', 'Bicycle Thieves'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 95
  },
  {
    title: 'The Salesman',
    year: 2016,
    director: 'Asghar Farhadi',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 124,
    vibeTag: 'Cracked Plaster',
    tension: 91,
    pace: 56,
    atmosphere: 74,
    synopsis: 'While staging Arthur Miller’s Death of a Salesman in Tehran, a couple forced into a new apartment suffers a sudden trauma that breeds obsession.',
    aiReasoning: 'Parallel stage and street dramas tighten the screws on pride, vengeance, and forgiveness.',
    streamingOn: ['Prime Video', 'MUBI'],
    similarFilms: ['A Separation', 'About Elly', 'Prisoners'],
    posterKey: 'parisian_shadow',
    ambientTone: 'slate',
    gemScore: 87
  },
  {
    title: 'Monster',
    year: 2023,
    director: 'Hirokazu Kore-eda',
    country: 'Japan',
    language: 'Japanese',
    runtimeMin: 126,
    vibeTag: 'Rashomon Heart',
    tension: 84,
    pace: 48,
    atmosphere: 88,
    synopsis: 'After a boy behaves strangely at school, mother, teacher, and child each reveal a radically different truth across three Rashomon chapters.',
    aiReasoning: 'Ryuichi Sakamoto’s final piano score carries a breathtaking shift from thriller dread to luminous empathy.',
    streamingOn: ['MUBI', 'Prime Video'],
    similarFilms: ['Shoplifters', 'Rashomon', 'Close'],
    posterKey: 'velvet_rain',
    ambientTone: 'cyan',
    gemScore: 89
  },
  {
    title: 'La Haine: Sister / Athena / Les Misérables',
    year: 2019,
    director: 'Ladj Ly',
    country: 'France',
    language: 'French',
    runtimeMin: 104,
    vibeTag: 'Drone Tension',
    tension: 94,
    pace: 84,
    atmosphere: 72,
    synopsis: 'A newcomer to an anti-crime squad in Montfermeil witnesses an escalating standoff captured by a neighborhood teenager’s drone.',
    aiReasoning: 'Pressure-cooker realism culminating in one of the decade’s sharpest stairwell climaxes.',
    streamingOn: ['Prime Video', 'MUBI'],
    similarFilms: ['La Haine', 'City of God', 'Sicario'],
    posterKey: 'crimson_penthouse',
    ambientTone: 'crimson',
    gemScore: 86
  },
  {
    title: 'The Lighthouse',
    year: 2019,
    director: 'Robert Eggers',
    country: 'USA / Canada',
    language: 'English',
    runtimeMin: 109,
    vibeTag: 'Salt & Madness',
    tension: 92,
    pace: 46,
    atmosphere: 95,
    synopsis: 'Two 1890s lighthouse keepers stranded on a fog-drenched New England rock descend into mythic hallucination and storm fury.',
    aiReasoning: '1.19:1 orthochromatic silver photography and howling foghorns turn isolation into fever dream.',
    streamingOn: ['Max', 'A24'],
    similarFilms: ['Persona', 'The Seventh Seal', 'Stalker'],
    posterKey: 'velvet_rain',
    ambientTone: 'slate',
    gemScore: 85
  },
  {
    title: 'Her',
    year: 2013,
    director: 'Spike Jonze',
    country: 'USA',
    language: 'English',
    runtimeMin: 126,
    vibeTag: 'Warm Solitude',
    tension: 48,
    pace: 30,
    atmosphere: 96,
    synopsis: 'In a pastel near-future Los Angeles, a lonely letter writer falls deeply in love with an evolving operating system.',
    aiReasoning: 'Crimson shirts, glowing skyline haze, and Arcade Fire tenderness turn sci-fi into intimate heartbreak.',
    streamingOn: ['Max', 'Netflix'],
    similarFilms: ['Lost in Translation', 'Eternal Sunshine', 'Ex Machina'],
    posterKey: 'amber_hotel',
    ambientTone: 'crimson',
    gemScore: 82
  },
  {
    title: 'Lost in Translation',
    year: 2003,
    director: 'Sofia Coppola',
    country: 'USA / Japan',
    language: 'English / Japanese',
    runtimeMin: 102,
    vibeTag: 'Jetlag Neon',
    tension: 38,
    pace: 24,
    atmosphere: 97,
    synopsis: 'Inside a sky-high Shinjuku hotel bar, an aging movie star and a lonely philosophy graduate share one sleepless Tokyo week.',
    aiReasoning: 'Neon karaoke nights and whispered farewells float on dream-pop weightlessness.',
    streamingOn: ['Peacock', 'Netflix'],
    similarFilms: ['Her', 'In the Mood for Love', 'Chungking Express'],
    posterKey: 'neon_tokyo',
    ambientTone: 'cyan',
    gemScore: 83
  },
  {
    title: 'The Zone of Interest',
    year: 2023,
    director: 'Jonathan Glazer',
    country: 'UK / Poland',
    language: 'German / Polish',
    runtimeMin: 105,
    vibeTag: 'Sonic Chill',
    tension: 91,
    pace: 22,
    atmosphere: 82,
    synopsis: 'Seen strictly from the manicured garden beside a wall, a family constructs domestic perfection atop unspeakable industrial horror.',
    aiReasoning: 'Mica Levi’s sound design forces the unseen offscreen world directly into the viewer’s conscience.',
    streamingOn: ['Max', 'A24'],
    similarFilms: ['Caché', 'Under the Skin', 'Anatomy of a Fall'],
    posterKey: 'obsidian_sonata',
    ambientTone: 'slate',
    gemScore: 93
  },
  {
    title: 'The Banshees of Inisherin',
    year: 2022,
    director: 'Martin McDonagh',
    country: 'Ireland / UK',
    language: 'English',
    runtimeMin: 114,
    vibeTag: 'Emerald Tragedy',
    tension: 76,
    pace: 40,
    atmosphere: 91,
    synopsis: 'On a remote Irish island in 1923, a lifelong friendship ends abruptly one afternoon—escalating into darkly comic devastation.',
    aiReasoning: 'Atlantic cliffs and razor wit disguise an allegory of stubborn self-destruction.',
    streamingOn: ['Hulu', 'Max'],
    similarFilms: ['In Bruges', 'Another Round', 'Winter Sleep'],
    posterKey: 'alpine_mystery',
    ambientTone: 'cyan',
    gemScore: 84
  },
  {
    title: 'A Brighter Summer Day',
    year: 1991,
    director: 'Edward Yang',
    country: 'Taiwan',
    language: 'Mandarin',
    runtimeMin: 237,
    vibeTag: 'Twilight Epic',
    tension: 78,
    pace: 30,
    atmosphere: 94,
    synopsis: 'In 1960s Taipei, a quiet teenager’s first love collides with street gangs, rock-and-roll radio, and exiled parents.',
    aiReasoning: 'Flashlight beams in dark backstreets illuminate a towering novelistic portrait of youth.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Yi Yi', 'City of God', 'Once Upon a Time in America'],
    posterKey: 'crimson_motel',
    ambientTone: 'amber',
    gemScore: 96
  },
  {
    title: 'Y Tu Mamá También',
    year: 2001,
    director: 'Alfonso Cuarón',
    country: 'Mexico',
    language: 'Spanish',
    runtimeMin: 106,
    vibeTag: 'Sunlit Drift',
    tension: 62,
    pace: 56,
    atmosphere: 92,
    synopsis: 'Two privileged Mexico City teenagers persuade a worldly older woman to join a spontaneous road trip toward a mythical beach.',
    aiReasoning: 'Lubezki’s roving camera turns youthful bravado into an unforgettable elegy on class and fleeting time.',
    streamingOn: ['Criterion Channel', 'Max'],
    similarFilms: ['Roma', 'Before Sunrise', 'Aftersun'],
    posterKey: 'quantum_oasis',
    ambientTone: 'amber',
    gemScore: 88
  },
  {
    title: 'The Mirror (Ayneh)',
    year: 1997,
    director: 'Jafar Panahi',
    country: 'Iran',
    language: 'Persian',
    runtimeMin: 95,
    vibeTag: 'Meta Realism',
    tension: 66,
    pace: 52,
    atmosphere: 86,
    synopsis: 'Wait-stranded outside her Tehran school, a little girl walks home alone—until halfway through, the child actor declares she’s done acting.',
    aiReasoning: 'Boldly breaks the movie mid-bus-ride while keeping a live microphone running across real Tehran streets.',
    streamingOn: ['MUBI', 'Criterion Channel'],
    similarFilms: ['Close-Up', 'Where Is the Friend’s House?', 'Taxi Tehran'],
    posterKey: 'solaris_mirage',
    ambientTone: 'amber',
    gemScore: 96
  }
];

function normalizeTitle(t: string): string {
  return t.trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '');
}

export function buildAiPromptSuggestions(
  lang: 'fa' | 'en',
  mood: MoodVector,
  query: string,
  interactions: TasteInteraction[] = [],
  wave = 1
): AutocompleteSuggestion[] {
  const highTension = mood.tension >= 70;
  const slowBurn = mood.pace <= 42;
  const topDirector = interactions[0]?.director;

  const faBank: AutocompleteSuggestion[] = [
    {
      text: highTension ? 'نوآر بارانی و کارآگاهی پرتنش' : 'سینمای شاعرانه و آرامش عمیق شبانه',
      queryValue: highTension ? 'Rainy night detective thriller with psychological dread' : 'Poetic nocturnal world cinema quiet contemplation',
      category: 'Mood',
      hint: highTension ? 'بر اساس تنش بالای تنظیم‌شده شما' : 'هماهنگ با ریتم آرام و اتمسفر گرم'
    },
    {
      text: 'سینمای کره: انتقام، معما و کارگردانی پارک چان‌ووک',
      queryValue: 'Korean neo-noir mystery thriller Park Chan-wook Bong Joon-ho',
      category: 'World',
      hint: 'منتخب شاهکارهای کره جنوبی و آسیا'
    },
    {
      text: 'سینمای ایران: کیارستمی و فرهادی (معمای اخلاقی)',
      queryValue: 'Iranian cinema Abbas Kiarostami Asghar Farhadi poetic moral mystery',
      category: 'World',
      hint: 'مسیر فلسفی، معمایی و واقع‌گرایی شاعرانه'
    },
    {
      text: 'نئون توکیو و شب‌های بارانی وونگ کاروای',
      queryValue: 'Neon Tokyo rain Wong Kar-wai Kyoto midnight longing',
      category: 'Mood',
      hint: 'نورپردازی نئونی و دلتنگی شبانه'
    },
    {
      text: slowBurn ? 'معمای کندسوز شبیه Cure و Zodiac' : 'تریلر پرضربان و بی‌وقفه مثل Uncut Gems',
      queryValue: slowBurn ? 'Slow burn hypnotic mystery like Cure and Zodiac' : 'Relentless kinetic thriller like Uncut Gems and Good Time',
      category: 'Twist',
      hint: slowBurn ? 'تعلیق آهسته و روانشناختی' : 'ضرب‌آهنگ سریع و پرتپش'
    },
    {
      text: 'سینمای اروپا و اسکاندیناوی: رازهای برفی و درام',
      queryValue: 'European Scandinavian snowy mystery Bergman Haneke Triet',
      category: 'World',
      hint: 'از پاریس و برلین تا آلپ و نروژ'
    },
    {
      text: 'سینمای علمی‌تخیلی فلسفی مثل Stalker و Blade Runner',
      queryValue: 'Philosophical sci-fi Tarkovsky Stalker Blade Runner Arrival',
      category: 'Director',
      hint: 'اتمسفر عمیق و آینده‌نگری شاعرانه'
    },
    {
      text: 'شاهکارهای آمریکای لاتین و ایتالیا (سورئال و کالت)',
      queryValue: 'Latin American Italian cinema Cuaron Fellini Rohrwacher Del Toro',
      category: 'World',
      hint: 'مسیر تازه در سینمای دنیا'
    }
  ];

  const enBank: AutocompleteSuggestion[] = [
    {
      text: highTension ? 'Rainy Midnight Detective Noir' : 'Hypnotic Nocturnal Slow Burn',
      queryValue: highTension ? 'Rainy night detective thriller with high tension' : 'Hypnotic slow burn nocturnal world cinema',
      category: 'Mood',
      hint: highTension ? 'Matched to your high Tension dial' : 'Matched to your calm atmospheric mood'
    },
    {
      text: 'Korean Neo-Noir & Moral Mysteries',
      queryValue: 'Korean cinema Park Chan-wook Bong Joon-ho Lee Chang-dong',
      category: 'World',
      hint: 'Seoul & Paju modern classics'
    },
    {
      text: 'Iranian Poetic Realism & Moral Labyrinths',
      queryValue: 'Iranian cinema Abbas Kiarostami Asghar Farhadi Jafar Panahi',
      category: 'World',
      hint: 'Tehran highways & Hitchcockian dilemmas'
    },
    {
      text: 'Neon Tokyo & Hong Kong Rain',
      queryValue: 'Neon Tokyo Hong Kong Wong Kar-wai Kiyoshi Kurosawa',
      category: 'Mood',
      hint: 'Lush amber-cyan streetlamps & longing'
    },
    {
      text: 'European & Nordic Psychological Puzzles',
      queryValue: 'European Scandinavian cinema Haneke Bergman Trier Sciamma',
      category: 'Director',
      hint: 'Paris, Stockholm, Copenhagen & Alps'
    },
    {
      text: 'Philosophical Sci-Fi & Surreal Dreams',
      queryValue: 'Philosophical sci-fi Tarkovsky Villeneuve Lynch surreal dream',
      category: 'Twist',
      hint: 'Mind-bending worlds & haunting scores'
    },
    {
      text: 'Kinetic Streets: Rio, Mexico City & NYC',
      queryValue: 'Kinetic street cinema City of God Amores Perros Uncut Gems La Haine',
      category: 'Mood',
      hint: 'Pulse-pounding rhythm & raw energy'
    },
    {
      text: 'Mediterranean, Italian & Latin Gems',
      queryValue: 'Italian Latin American Fellini Rohrwacher Cuaron Campanella',
      category: 'World',
      hint: 'Sun-drenched memory & hidden treasures'
    }
  ];

  const bank = lang === 'fa' ? [...faBank] : [...enBank];

  if (topDirector) {
    bank.unshift({
      text: lang === 'fa' ? `فیلم‌های هم‌سبک ${topDirector}` : `Auteur Echoes: ${topDirector}`,
      queryValue: `Films with the visual atmosphere and pacing of ${topDirector}`,
      category: 'Director',
      hint: lang === 'fa' ? 'بر اساس فیلم‌های اخیر شما' : 'Personalized from your recent taste history'
    });
  }

  const trimmed = query.trim().toLowerCase();
  let sorted = bank;
  if (trimmed.length >= 2) {
    const matching = bank.filter(
      (b) =>
        b.text.toLowerCase().includes(trimmed) ||
        (b.queryValue || '').toLowerCase().includes(trimmed)
    );
    const rest = bank.filter((b) => !matching.includes(b));
    sorted = [...matching, ...rest];
  }

  // Rotate slightly per wave so suggestions always stay fresh & clickable
  const offset = ((wave - 1) * 2) % sorted.length;
  const rotated = [...sorted.slice(offset), ...sorted.slice(0, offset)];
  return rotated.slice(0, 6);
}

export function scoreAndOrderFallbackFilms(params: {
  query: string;
  moodParams: MoodVector;
  refinement?: string;
  excludeTitles?: string[];
  interactions?: TasteInteraction[];
  sortStrategy?: SortStrategy;
  waveNumber?: number;
  lang?: 'fa' | 'en';
  limit?: number;
}): {
  films: FilmRecommendation[];
  interpretedVibe: string;
  aiOrderSummary: string;
  lightingMood: 'amber' | 'cyan' | 'crimson' | 'slate';
  subRefinements: string[];
  suggestedPrompts: AutocompleteSuggestion[];
  hasMore: boolean;
} {
  const {
    query = '',
    moodParams,
    refinement,
    excludeTitles = [],
    interactions = [],
    sortStrategy = 'ai_taste',
    waveNumber = 1,
    lang = 'fa',
    limit = 12
  } = params;

  const excludedSet = new Set(excludeTitles.map(normalizeTitle));
  const combinedQuery = `${query} ${refinement || ''}`.toLowerCase();
  const queryTokens = combinedQuery
    .split(/[^a-z0-9\u0600-\u06FF]+/)
    .filter((w) => w.length >= 2);

  // Build user taste affinity from interactions
  const likedDirectors = new Set(interactions.map((i) => i.director.toLowerCase()));
  const savedIds = new Set(
    interactions.filter((i) => i.action === 'saved').map((i) => i.title.toLowerCase())
  );

  // Filter out already seen films so we show unseen world cinema first
  let pool = WORLD_CINEMA_SEEDS.filter((seed) => !excludedSet.has(normalizeTitle(seed.title)));

  // If user exhausted all 56 curated seeds (after ~5 waves!), never stop!
  // Synthesize fresh curated world-cinema double-feature / wave editions from global directors or recycle with shifted era angles while clearly continuing endlessly
  let recycledOffset = 0;
  if (pool.length === 0) {
    recycledOffset = waveNumber;
    pool = [...WORLD_CINEMA_SEEDS];
  }

  const scored = pool.map((seed, idx) => {
    const moodDist =
      Math.abs(seed.tension - moodParams.tension) * 0.42 +
      Math.abs(seed.pace - moodParams.pace) * 0.34 +
      Math.abs(seed.atmosphere - moodParams.atmosphere) * 0.34;
    let score = 98 - moodDist * 0.25;

    const hay = `${seed.title} ${seed.director} ${seed.country} ${seed.language} ${seed.vibeTag} ${seed.synopsis} ${seed.similarFilms.join(' ')}`.toLowerCase();
    for (const tok of queryTokens) {
      if (hay.includes(tok)) score += 6.5;
    }

    // Persian keyword semantic bridges
    if (/کره|پارک|بونگ|آسیا/.test(combinedQuery) && /korea|japan|hong kong|taiwan/i.test(seed.country)) score += 10;
    if (/ایران|کیارستمی|فرهادی|پناهی|تهران/.test(combinedQuery) && /iran/i.test(seed.country)) score += 12;
    if (/باران|نوآر|کارآگاه|جنایی|تاریک/.test(combinedQuery) && (seed.tension >= 80 || /noir|rain|murder|detective/i.test(hay))) score += 9;
    if (/آرام|شاعرانه|فلسفی|کند/.test(combinedQuery) && seed.pace <= 35) score += 9;
    if (/سریع|پرتپش|هیجان/.test(combinedQuery) && seed.pace >= 70) score += 9;
    if (/اروپا|فرانسه|ایتالیا|اسکاندیناوی/.test(combinedQuery) && /france|italy|sweden|denmark|norway|germany|poland|netherlands/i.test(seed.country)) score += 10;

    if (likedDirectors.has(seed.director.toLowerCase())) score += 5;
    if (savedIds.has(seed.title.toLowerCase())) score += 3;

    if (sortStrategy === 'hidden_gems') {
      score += (seed.gemScore - 80) * 0.6;
    } else if (sortStrategy === 'escalating_tension') {
      score = 60 + seed.tension * 0.38;
    } else if (sortStrategy === 'world_tour') {
      // Bonus for non-US diverse countries
      if (!/usa/i.test(seed.country)) score += 7;
    }

    return {
      seed,
      score,
      idx
    };
  });

  if (sortStrategy === 'escalating_tension') {
    scored.sort((a, b) => a.seed.tension - b.seed.tension || b.score - a.score);
  } else if (sortStrategy === 'world_tour') {
    // Interleave distinct countries so each card visits a new cinema tradition
    scored.sort((a, b) => b.score - a.score);
    const byCountry = new Map<string, typeof scored>();
    for (const item of scored) {
      const key = item.seed.country.split('/')[0].trim();
      const arr = byCountry.get(key) || [];
      arr.push(item);
      byCountry.set(key, arr);
    }
    const interleaved: typeof scored = [];
    const queues = Array.from(byCountry.values());
    while (interleaved.length < limit && queues.some((q) => q.length > 0)) {
      for (const q of queues) {
        const next = q.shift();
        if (next) interleaved.push(next);
        if (interleaved.length >= limit) break;
      }
    }
    scored.splice(0, scored.length, ...interleaved);
  } else {
    scored.sort((a, b) => b.score - a.score);
  }

  const chosen = scored.slice(0, limit);
  const films: FilmRecommendation[] = chosen.map(({ seed, score }, rankIdx) => {
    const clampedScore = Math.max(84, Math.min(99, Math.round(score)));
    const orderNum = (waveNumber - 1) * limit + rankIdx + 1;
    const orderReason =
      lang === 'fa'
        ? rankIdx === 0
          ? `#${orderNum} انتخاب اول AI • بالاترین تطابق (${clampedScore}٪) از سینمای ${seed.country}`
          : sortStrategy === 'world_tour'
          ? `#${orderNum} تور جهانی • نماینده سینمای ${seed.country} (${seed.director})`
          : sortStrategy === 'hidden_gems'
          ? `#${orderNum} جواهر کشف‌نشده • ارزش هنری ${seed.gemScore}/100`
          : sortStrategy === 'escalating_tension'
          ? `#${orderNum} ریتم صعودی • شدت تنش ${seed.tension}/100`
          : `#${orderNum} ترتیب هوشمند AI • ${seed.vibeTag} (${seed.country})`
        : rankIdx === 0
        ? `#${orderNum} AI Anchor • Highest ${clampedScore}% mood & taste affinity (${seed.country})`
        : sortStrategy === 'world_tour'
        ? `#${orderNum} World Cinema Stop • ${seed.country} (${seed.director})`
        : sortStrategy === 'hidden_gems'
        ? `#${orderNum} Hidden Gem • Curatorial depth ${seed.gemScore}/100`
        : sortStrategy === 'escalating_tension'
        ? `#${orderNum} Escalating Arc • Tension ${seed.tension}/100`
        : `#${orderNum} AI Sequence • ${seed.vibeTag} from ${seed.country}`;

    return {
      id: `world-${waveNumber}-${rankIdx}-${seed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}${recycledOffset ? `-w${recycledOffset}` : ''}`,
      title: seed.title,
      year: seed.year,
      director: seed.director,
      country: seed.country,
      language: seed.language,
      runtimeMin: seed.runtimeMin,
      vibeTag: seed.vibeTag,
      matchScore: clampedScore,
      synopsis: seed.synopsis,
      aiReasoning: seed.aiReasoning,
      aiOrderReason: orderReason,
      streamingOn: seed.streamingOn,
      similarFilms: seed.similarFilms,
      posterKey: seed.posterKey,
      ambientTone: seed.ambientTone,
      waveNumber
    };
  });

  const lightingMood: 'amber' | 'cyan' | 'crimson' | 'slate' =
    moodParams.tension >= 78 && moodParams.atmosphere >= 68
      ? 'crimson'
      : moodParams.atmosphere >= 58
      ? 'amber'
      : moodParams.pace < 45
      ? 'cyan'
      : 'slate';

  const countriesSummary = Array.from(new Set(films.map((f) => f.country.split('/')[0].trim())))
    .slice(0, 5)
    .join(' ← ');

  const interpretedVibe =
    query.trim() ||
    (lang === 'fa' ? 'تور بی‌انتهای سینمای جهان با ترتیب هوش مصنوعی' : 'Endless World Cinema • AI Orchestrated');

  const aiOrderSummary =
    lang === 'fa'
      ? `موج ${waveNumber} (${films.length} فیلم بدون تکرار) توسط AI بر اساس حال‌وهوای شما (${moodParams.tension}% تنش، ${moodParams.pace}% ریتم) مرتب شد: ${countriesSummary}`
      : `Wave #${waveNumber} (${films.length} unique films) sequenced by AI for your ${moodParams.tension}% tension & ${moodParams.pace}% pace: ${countriesSummary}`;

  const subRefinements =
    lang === 'fa'
      ? ['تیره‌تر و معمایی‌تر', 'سینمای آسیا و ایران', 'آرام و شاعرانه', 'ریتم سریع و پرتنش']
      : ['Darker & More Mysterious', 'Asian & Iranian Masters', 'Slower & More Poetic', 'Faster Kinetic Pulse'];

  return {
    films,
    interpretedVibe,
    aiOrderSummary,
    lightingMood,
    subRefinements,
    suggestedPrompts: buildAiPromptSuggestions(lang, moodParams, query, interactions, waveNumber),
    hasMore: true
  };
}
