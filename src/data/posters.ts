import type { PosterKey } from '../types/cinema';

import rainDetective from '../assets/images/poster_rain_detective_1794572116567.jpg';
import neonTokyo from '../assets/images/poster_neon_tokyo_1794572116252.jpg';
import surrealLabyrinth from '../assets/images/poster_surreal_labyrinth_1794572117376.jpg';
import parisianShadow from '../assets/images/poster_parisian_shadow_1794572118475.jpg';
import alpineMystery from '../assets/images/poster_alpine_mystery_1794572117720.jpg';
import cyberMemory from '../assets/images/poster_cyber_memory_1794572117940.jpg';
import crimsonMotel from '../assets/images/poster_crimson_motel_1794572119002.jpg';
import quantumOasis from '../assets/images/ai_cinema_quantum_oasis_1794408994686.jpg';
import solarisMirage from '../assets/images/ai_cinema_solaris_mirage_1794398990412.jpg';
import obsidianSonata from '../assets/images/cinema_obsidian_sonata_1794398992852.jpg';
import midnightParis from '../assets/images/cinema_midnight_express_paris_1794408998635.jpg';
import velvetRain from '../assets/images/cinema_noir_velvet_rain_1794398988857.jpg';
import crimsonPenthouse from '../assets/images/cinema_crimson_penthouse_1794408993203.jpg';
import amberHotel from '../assets/images/editorial_amber_hotel_noir_1794443435341.jpg';

export const POSTER_ASSETS: Record<PosterKey, string> = {
  rain_detective: rainDetective,
  neon_tokyo: neonTokyo,
  surreal_labyrinth: surrealLabyrinth,
  parisian_shadow: parisianShadow,
  alpine_mystery: alpineMystery,
  cyber_memory: cyberMemory,
  crimson_motel: crimsonMotel,
  amber_hotel: amberHotel,
  quantum_oasis: quantumOasis,
  solaris_mirage: solarisMirage,
  obsidian_sonata: obsidianSonata,
  midnight_paris: midnightParis,
  velvet_rain: velvetRain,
  crimson_penthouse: crimsonPenthouse
};

export function resolvePosterAsset(key: string): string {
  if (key in POSTER_ASSETS) {
    return POSTER_ASSETS[key as PosterKey];
  }
  return POSTER_ASSETS.rain_detective;
}
