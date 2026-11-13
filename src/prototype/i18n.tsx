import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Globe2, Search, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export interface WorldLanguageInfo {
  code: string;
  nativeName: string;
  englishName: string;
  dir: 'rtl' | 'ltr';
}

const RTL_CODES = new Set(['ar', 'fa', 'he', 'ur', 'ps', 'ku', 'ckb', 'sd', 'ug', 'dv', 'yi']);

export function getLanguageDirection(code: string): 'rtl' | 'ltr' {
  const base = code.toLowerCase().split('-')[0];
  return RTL_CODES.has(base) ? 'rtl' : 'ltr';
}

export const WORLD_LANGUAGES: WorldLanguageInfo[] = [
  { code: 'fa', nativeName: 'فارسی', englishName: 'Persian', dir: 'rtl' },
  { code: 'en', nativeName: 'English', englishName: 'English', dir: 'ltr' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic', dir: 'rtl' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish', dir: 'ltr' },
  { code: 'fr', nativeName: 'Français', englishName: 'French', dir: 'ltr' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German', dir: 'ltr' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish', dir: 'ltr' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian', dir: 'ltr' },
  { code: 'zh-CN', nativeName: '简体中文', englishName: 'Chinese (Simplified)', dir: 'ltr' },
  { code: 'zh-TW', nativeName: '繁體中文', englishName: 'Chinese (Traditional)', dir: 'ltr' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese', dir: 'ltr' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean', dir: 'ltr' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi', dir: 'ltr' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese', dir: 'ltr' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian', dir: 'ltr' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian', dir: 'ltr' },
  { code: 'ur', nativeName: 'اردو', englishName: 'Urdu', dir: 'rtl' },
  { code: 'he', nativeName: 'עברית', englishName: 'Hebrew', dir: 'rtl' },
  { code: 'nl', nativeName: 'Nederlands', englishName: 'Dutch', dir: 'ltr' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish', dir: 'ltr' },
  { code: 'uk', nativeName: 'Українська', englishName: 'Ukrainian', dir: 'ltr' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese', dir: 'ltr' },
  { code: 'th', nativeName: 'ไทย', englishName: 'Thai', dir: 'ltr' },
  { code: 'sv', nativeName: 'Svenska', englishName: 'Swedish', dir: 'ltr' },
  { code: 'no', nativeName: 'Norsk', englishName: 'Norwegian', dir: 'ltr' },
  { code: 'da', nativeName: 'Dansk', englishName: 'Danish', dir: 'ltr' },
  { code: 'fi', nativeName: 'Suomi', englishName: 'Finnish', dir: 'ltr' },
  { code: 'el', nativeName: 'Ελληνικά', englishName: 'Greek', dir: 'ltr' },
  { code: 'cs', nativeName: 'Čeština', englishName: 'Czech', dir: 'ltr' },
  { code: 'ro', nativeName: 'Română', englishName: 'Romanian', dir: 'ltr' },
  { code: 'hu', nativeName: 'Magyar', englishName: 'Hungarian', dir: 'ltr' },
  { code: 'bn', nativeName: 'বাংলা', englishName: 'Bengali', dir: 'ltr' },
  { code: 'ms', nativeName: 'Bahasa Melayu', englishName: 'Malay', dir: 'ltr' },
  { code: 'tl', nativeName: 'Filipino', englishName: 'Filipino / Tagalog', dir: 'ltr' },
  { code: 'sw', nativeName: 'Kiswahili', englishName: 'Swahili', dir: 'ltr' },
  { code: 'az', nativeName: 'Azərbaycanca', englishName: 'Azerbaijani', dir: 'ltr' },
  { code: 'uz', nativeName: 'Oʻzbekcha', englishName: 'Uzbek', dir: 'ltr' },
  { code: 'kk', nativeName: 'Қазақша', englishName: 'Kazakh', dir: 'ltr' },
  { code: 'ka', nativeName: 'ქართული', englishName: 'Georgian', dir: 'ltr' },
  { code: 'hy', nativeName: 'Հայերեն', englishName: 'Armenian', dir: 'ltr' },
  { code: 'ps', nativeName: 'پښتو', englishName: 'Pashto', dir: 'rtl' },
  { code: 'ku', nativeName: 'کوردی', englishName: 'Kurdish', dir: 'rtl' },
  { code: 'ta', nativeName: 'தமிழ்', englishName: 'Tamil', dir: 'ltr' },
  { code: 'te', nativeName: 'తెలుగు', englishName: 'Telugu', dir: 'ltr' },
  { code: 'mr', nativeName: 'मराठी', englishName: 'Marathi', dir: 'ltr' },
  { code: 'pa', nativeName: 'ਪੰਜਾਬੀ', englishName: 'Punjabi', dir: 'ltr' },
  { code: 'gu', nativeName: 'ગુજરાતી', englishName: 'Gujarati', dir: 'ltr' },
  { code: 'kn', nativeName: 'ಕನ್ನಡ', englishName: 'Kannada', dir: 'ltr' },
  { code: 'ml', nativeName: 'മലയാളം', englishName: 'Malayalam', dir: 'ltr' },
  { code: 'si', nativeName: 'සිංහල', englishName: 'Sinhala', dir: 'ltr' },
  { code: 'my', nativeName: 'မြန်မာ', englishName: 'Burmese', dir: 'ltr' },
  { code: 'km', nativeName: 'ខ្មែរ', englishName: 'Khmer', dir: 'ltr' },
  { code: 'lo', nativeName: 'ລາວ', englishName: 'Lao', dir: 'ltr' },
  { code: 'am', nativeName: 'አማርኛ', englishName: 'Amharic', dir: 'ltr' },
  { code: 'ha', nativeName: 'Hausa', englishName: 'Hausa', dir: 'ltr' },
  { code: 'yo', nativeName: 'Yorùbá', englishName: 'Yoruba', dir: 'ltr' },
  { code: 'af', nativeName: 'Afrikaans', englishName: 'Afrikaans', dir: 'ltr' },
  { code: 'sq', nativeName: 'Shqip', englishName: 'Albanian', dir: 'ltr' },
  { code: 'sr', nativeName: 'Српски', englishName: 'Serbian', dir: 'ltr' },
  { code: 'hr', nativeName: 'Hrvatski', englishName: 'Croatian', dir: 'ltr' },
  { code: 'bg', nativeName: 'Български', englishName: 'Bulgarian', dir: 'ltr' },
  { code: 'sk', nativeName: 'Slovenčina', englishName: 'Slovak', dir: 'ltr' },
  { code: 'sl', nativeName: 'Slovenščina', englishName: 'Slovenian', dir: 'ltr' },
  { code: 'et', nativeName: 'Eesti', englishName: 'Estonian', dir: 'ltr' },
  { code: 'lv', nativeName: 'Latviešu', englishName: 'Latvian', dir: 'ltr' },
  { code: 'lt', nativeName: 'Lietuvių', englishName: 'Lithuanian', dir: 'ltr' },
  { code: 'ca', nativeName: 'Català', englishName: 'Catalan', dir: 'ltr' },
  { code: 'eu', nativeName: 'Euskara', englishName: 'Basque', dir: 'ltr' },
  { code: 'gl', nativeName: 'Galego', englishName: 'Galician', dir: 'ltr' },
  { code: 'is', nativeName: 'Íslenska', englishName: 'Icelandic', dir: 'ltr' },
  { code: 'mn', nativeName: 'Монгол', englishName: 'Mongolian', dir: 'ltr' },
  { code: 'ne', nativeName: 'नेपाली', englishName: 'Nepali', dir: 'ltr' }
];

export function resolveLanguageLabel(code: string): WorldLanguageInfo {
  const exact = WORLD_LANGUAGES.find((l) => l.code.toLowerCase() === code.toLowerCase());
  if (exact) return exact;
  try {
    const enNames = new Intl.DisplayNames(['en'], { type: 'language' });
    const nativeNames = new Intl.DisplayNames([code], { type: 'language' });
    return {
      code,
      nativeName: nativeNames.of(code) || code.toUpperCase(),
      englishName: enNames.of(code) || code.toUpperCase(),
      dir: getLanguageDirection(code)
    };
  } catch {
    return {
      code,
      nativeName: code.toUpperCase(),
      englishName: code.toUpperCase(),
      dir: getLanguageDirection(code)
    };
  }
}

/**
 * Offline core UI dictionary packs for major world languages so key navigation,
 * controls, and actions switch instantaneously even with zero network connection.
 * Every remaining phrase or world language translates dynamically via the public
 * translation engine and caches inside localStorage for instant future access.
 */
const OFFLINE_DICTIONARY: Record<string, Record<string, string>> = {
  fa: {
    'Feature Film': 'فیلم سینمایی',
    'TV Series': 'سریال',
    'TV Mini Series': 'مینی‌سریال',
    Short: 'فیلم کوتاه',
    'Neo-Noir': 'نئو-نوار',
    Mystery: 'معمایی',
    Drama: 'درام',
    Thriller: 'هیجان‌انگیز',
    Animation: 'انیمیشن',
    'Sci-Fi': 'علمی‌تخیلی',
    Japan: 'ژاپن',
    France: 'فرانسه',
    'Sweden & Germany': 'سوئد و آلمان',
    'United States & International': 'آمریکا و بین‌الملل',
    English: 'انگلیسی',
    Japanese: 'ژاپنی',
    French: 'فرانسوی',
    Swedish: 'سوئدی',
    German: 'آلمانی',
    'Cinema High Power': 'قدرت کامل سینمایی',
    'Balanced HDR': 'تعادل کیفیت و مصرف',
    'Optimal Daily': 'بهینه و روان',
    'Low Battery & Fast Load': 'کم‌مصرف و سریع',
    'Ultra Eco / Slow Network': 'فوق کم‌مصرف (اینترنت ضعیف)'
  },
  ar: {
    'My Universe': 'عالمي',
    'Discover Map': 'خريطة الاكتشاف',
    Search: 'بحث',
    Library: 'المكتبة',
    Settings: 'الإعدادات',
    Back: 'رجوع',
    Play: 'تشغيل',
    'Watch Now': 'شاهد الآن',
    'Resume Watching': 'متابعة المشاهدة',
    Download: 'تنزيل',
    Downloaded: 'تم التنزيل',
    'Save Offline': 'حفظ دون اتصال',
    'Offline Ready': 'جاهز دون اتصال',
    'Download to Device': 'حفظ في الجهاز',
    Details: 'التفاصيل',
    'Details & Download': 'التفاصيل والتنزيل',
    Bookmark: 'المفضلة',
    Saved: 'محفوظ',
    Like: 'أعجبني',
    'Less Like This': 'أقل من هذا',
    Hide: 'إخفاء',
    'Why this?': 'لماذا هذا؟',
    'Personal Entertainment Universe': 'عالم الترفيه الشخصي',
    'Continue Watching': 'متابعة المشاهدة',
    'Recommended for You': 'مقترح لك',
    'New Discoveries': 'اكتشافات جديدة',
    'Hidden Gems': 'جواهر مخفية',
    'Explore Something Different': 'اكتشف شيئاً مختلفاً',
    'Recently Added': 'أُضيف حديثاً',
    'Offline Downloads': 'التنزيلات دون اتصال',
    'Watch History': 'سجل المشاهدة',
    Favorites: 'المفضلة',
    'Saved Collections': 'المجموعات المحفوظة',
    'Recently Viewed': 'المشاهدة مؤخراً',
    'Hidden Items': 'العناصر المخفية',
    'Personalized Lists': 'قوائم مخصصة',
    'Filters': 'فلاتر',
    'Reset All': 'إعادة تعيين'
  },
  es: {
    'My Universe': 'Mi Universo',
    'Discover Map': 'Mapa 3D',
    Search: 'Buscar',
    Library: 'Biblioteca',
    Settings: 'Ajustes',
    Back: 'Volver',
    Play: 'Reproducir',
    'Watch Now': 'Ver ahora',
    'Resume Watching': 'Continuar',
    Download: 'Descargar',
    Downloaded: 'Descargado',
    'Save Offline': 'Guardar sin conexión',
    'Offline Ready': 'Listo sin conexión',
    'Download to Device': 'Descargar al dispositivo',
    Details: 'Detalles',
    'Details & Download': 'Detalles y descarga',
    Bookmark: 'Guardar',
    Saved: 'Guardado',
    Like: 'Me gusta',
    'Less Like This': 'Menos así',
    Hide: 'Ocultar',
    'Why this?': '¿Por qué esto?',
    'Personal Entertainment Universe': 'Universo de Entretenimiento Personal',
    'Continue Watching': 'Seguir viendo',
    'Recommended for You': 'Recomendado para ti',
    'New Discoveries': 'Nuevos descubrimientos',
    'Hidden Gems': 'Joyas ocultas',
    'Explore Something Different': 'Explora algo distinto',
    'Recently Added': 'Añadido recientemente',
    'Offline Downloads': 'Descargas sin conexión',
    'Watch History': 'Historial',
    Favorites: 'Favoritos',
    'Saved Collections': 'Colecciones',
    'Recently Viewed': 'Visto recientemente',
    'Hidden Items': 'Ocultos',
    'Personalized Lists': 'Listas personalizadas',
    Filters: 'Filtros',
    'Reset All': 'Restablecer'
  },
  fr: {
    'My Universe': 'Mon Univers',
    'Discover Map': 'Carte 3D',
    Search: 'Recherche',
    Library: 'Bibliothèque',
    Settings: 'Paramètres',
    Back: 'Retour',
    Play: 'Lire',
    'Watch Now': 'Regarder',
    'Resume Watching': 'Reprendre',
    Download: 'Télécharger',
    Downloaded: 'Téléchargé',
    'Save Offline': 'Hors ligne',
    'Offline Ready': 'Prêt hors ligne',
    'Download to Device': 'Enregistrer sur l’appareil',
    Details: 'Détails',
    'Details & Download': 'Détails & Téléchargement',
    Bookmark: 'Favori',
    Saved: 'Enregistré',
    Like: 'J’aime',
    'Less Like This': 'Moins comme ça',
    Hide: 'Masquer',
    'Why this?': 'Pourquoi ce choix ?',
    'Personal Entertainment Universe': 'Univers de Divertissement Personnel',
    'Continue Watching': 'Reprendre la lecture',
    'Recommended for You': 'Recommandé pour vous',
    'New Discoveries': 'Nouvelles découvertes',
    'Hidden Gems': 'Pépites cachées',
    'Explore Something Different': 'Explorer autrement',
    'Recently Added': 'Ajouts récents',
    'Offline Downloads': 'Téléchargements hors ligne',
    'Watch History': 'Historique',
    Favorites: 'Favoris',
    'Saved Collections': 'Collections',
    'Recently Viewed': 'Vus récemment',
    'Hidden Items': 'Éléments masqués',
    'Personalized Lists': 'Listes personnalisées',
    Filters: 'Filtres',
    'Reset All': 'Réinitialiser'
  },
  de: {
    'My Universe': 'Mein Universum',
    'Discover Map': '3D-Karte',
    Search: 'Suche',
    Library: 'Bibliothek',
    Settings: 'Einstellungen',
    Back: 'Zurück',
    Play: 'Abspielen',
    'Watch Now': 'Jetzt ansehen',
    'Resume Watching': 'Fortsetzen',
    Download: 'Herunterladen',
    Downloaded: 'Heruntergeladen',
    'Save Offline': 'Offline speichern',
    'Offline Ready': 'Offline bereit',
    'Download to Device': 'Auf Gerät speichern',
    Details: 'Details',
    'Details & Download': 'Details & Download',
    Bookmark: 'Merken',
    Saved: 'Gespeichert',
    Like: 'Gefällt mir',
    'Less Like This': 'Weniger davon',
    Hide: 'Ausblenden',
    'Why this?': 'Warum das?',
    'Personal Entertainment Universe': 'Persönliches Entertainment-Universum',
    'Continue Watching': 'Weiterschauen',
    'Recommended for You': 'Für dich empfohlen',
    'New Discoveries': 'Neue Entdeckungen',
    'Hidden Gems': 'Geheimtipps',
    'Explore Something Different': 'Etwas anderes entdecken',
    'Recently Added': 'Kürzlich hinzugefügt',
    'Offline Downloads': 'Offline-Downloads',
    'Watch History': 'Verlauf',
    Favorites: 'Favoriten',
    'Saved Collections': 'Sammlungen',
    'Recently Viewed': 'Zuletzt angesehen',
    'Hidden Items': 'Ausgeblendet',
    'Personalized Lists': 'Persönliche Listen',
    Filters: 'Filter',
    'Reset All': 'Zurücksetzen'
  },
  tr: {
    'My Universe': 'Evrenim',
    'Discover Map': '3D Harita',
    Search: 'Arama',
    Library: 'Kütüphane',
    Settings: 'Ayarlar',
    Back: 'Geri',
    Play: 'Oynat',
    'Watch Now': 'Şimdi İzle',
    'Resume Watching': 'Kaldığın Yerden',
    Download: 'İndir',
    Downloaded: 'İndirildi',
    'Save Offline': 'Çevrimdışı Kaydet',
    'Offline Ready': 'Çevrimdışı Hazır',
    'Download to Device': 'Cihaza İndir',
    Details: 'Detaylar',
    'Details & Download': 'Detaylar ve İndirme',
    Bookmark: 'Kaydet',
    Saved: 'Kaydedildi',
    Like: 'Beğendim',
    'Less Like This': 'Bunun Gibi Daha Az',
    Hide: 'Gizle',
    'Why this?': 'Neden bu?',
    'Personal Entertainment Universe': 'Kişisel Eğlence Evreni',
    'Continue Watching': 'İzlemeye Devam Et',
    'Recommended for You': 'Senin İçin Önerilenler',
    'New Discoveries': 'Yeni Keşifler',
    'Hidden Gems': 'Saklı Hazineler',
    'Explore Something Different': 'Farklı Bir Şey Keşfet',
    'Recently Added': 'Yeni Eklenenler',
    'Offline Downloads': 'Çevrimdışı İndirmeler',
    'Watch History': 'İzleme Geçmişi',
    Favorites: 'Favoriler',
    'Saved Collections': 'Koleksiyonlar',
    'Recently Viewed': 'Son Görüntülenenler',
    'Hidden Items': 'Gizlenenler',
    'Personalized Lists': 'Kişisel Listeler',
    Filters: 'Filtreler',
    'Reset All': 'Sıfırla'
  },
  ru: {
    'My Universe': 'Моя Вселенная',
    'Discover Map': '3D Карта',
    Search: 'Поиск',
    Library: 'Библиотека',
    Settings: 'Настройки',
    Back: 'Назад',
    Play: 'Смотреть',
    'Watch Now': 'Смотреть сейчас',
    'Resume Watching': 'Продолжить',
    Download: 'Скачать',
    Downloaded: 'Скачано',
    'Save Offline': 'Сохранить офлайн',
    'Offline Ready': 'Доступно офлайн',
    'Download to Device': 'Скачать файл',
    Details: 'Подробнее',
    'Details & Download': 'Детали и загрузка',
    Bookmark: 'В избранное',
    Saved: 'Сохранено',
    Like: 'Нравится',
    'Less Like This': 'Меньше такого',
    Hide: 'Скрыть',
    'Why this?': 'Почему это?',
    'Personal Entertainment Universe': 'Персональная Вселенная Развлечений',
    'Continue Watching': 'Продолжить просмотр',
    'Recommended for You': 'Рекомендуем вам',
    'New Discoveries': 'Новые открытия',
    'Hidden Gems': 'Скрытые шедевры',
    'Explore Something Different': 'Открыть новое',
    'Recently Added': 'Недавно добавлено',
    'Offline Downloads': 'Офлайн-загрузки',
    'Watch History': 'История',
    Favorites: 'Избранное',
    'Saved Collections': 'Коллекции',
    'Recently Viewed': 'Недавние',
    'Hidden Items': 'Скрытое',
    'Personalized Lists': 'Подборки',
    Filters: 'Фильтры',
    'Reset All': 'Сбросить'
  },
  'zh-CN': {
    'My Universe': '我的宇宙',
    'Discover Map': '3D 探索图谱',
    Search: '搜索',
    Library: '媒体库',
    Settings: '设置',
    Back: '返回',
    Play: '播放',
    'Watch Now': '立即观看',
    'Resume Watching': '继续观看',
    Download: '下载',
    Downloaded: '已下载',
    'Save Offline': '离线保存',
    'Offline Ready': '已可离线观看',
    'Download to Device': '下载到设备',
    Details: '详情',
    'Details & Download': '详情与下载',
    Bookmark: '收藏',
    Saved: '已收藏',
    Like: '喜欢',
    'Less Like This': '减少此类推荐',
    Hide: '隐藏',
    'Why this?': '为什么推荐？',
    'Personal Entertainment Universe': '个人娱乐宇宙',
    'Continue Watching': '继续观看',
    'Recommended for You': '为你推荐',
    'New Discoveries': '新发现',
    'Hidden Gems': '冷门佳作',
    'Explore Something Different': '探索不同风格',
    'Recently Added': '最新上线',
    'Offline Downloads': '离线下载',
    'Watch History': '观看历史',
    Favorites: '收藏夹',
    'Saved Collections': '我的合集',
    'Recently Viewed': '最近浏览',
    'Hidden Items': '已隐藏',
    'Personalized Lists': '个性片单',
    Filters: '筛选',
    'Reset All': '重置全部'
  },
  ja: {
    'My Universe': 'マイ・ユニバース',
    'Discover Map': '3D探索マップ',
    Search: '検索',
    Library: 'ライブラリ',
    Settings: '設定',
    Back: '戻る',
    Play: '再生',
    'Watch Now': '今すぐ見る',
    'Resume Watching': '続きを見る',
    Download: 'ダウンロード',
    Downloaded: 'ダウンロード済み',
    'Save Offline': 'オフライン保存',
    'Offline Ready': 'オフライン再生可能',
    'Download to Device': '端末に保存',
    Details: '詳細',
    'Details & Download': '詳細とダウンロード',
    Bookmark: '保存',
    Saved: '保存済み',
    Like: 'いいね',
    'Less Like This': '興味なし',
    Hide: '非表示',
    'Why this?': 'おすすめの理由',
    'Personal Entertainment Universe': 'パーソナル・エンタメ・ユニバース',
    'Continue Watching': '視聴中の作品',
    'Recommended for You': 'あなたへのおすすめ',
    'New Discoveries': '新しい発見',
    'Hidden Gems': '隠れた名作',
    'Explore Something Different': '新しいジャンルを探索',
    'Recently Added': '新着',
    'Offline Downloads': 'オフライン保存',
    'Watch History': '視聴履歴',
    Favorites: 'お気に入り',
    'Saved Collections': 'コレクション',
    'Recently Viewed': '最近の閲覧',
    'Hidden Items': '非表示リスト',
    'Personalized Lists': 'パーソナルリスト',
    Filters: 'フィルター',
    'Reset All': 'リセット'
  },
  ko: {
    'My Universe': '나의 유니버스',
    'Discover Map': '3D 탐색 맵',
    Search: '검색',
    Library: '보관함',
    Settings: '설정',
    Back: '뒤로',
    Play: '재생',
    'Watch Now': '지금 시청',
    'Resume Watching': '이어 보기',
    Download: '다운로드',
    Downloaded: '다운로드됨',
    'Save Offline': '오프라인 저장',
    'Offline Ready': '오프라인 준비됨',
    'Download to Device': '기기에 저장',
    Details: '상세정보',
    'Details & Download': '상세정보 및 다운로드',
    Bookmark: '저장',
    Saved: '저장됨',
    Like: '좋아요',
    'Less Like This': '비슷한 추천 줄이기',
    Hide: '숨기기',
    'Why this?': '추천 이유',
    'Personal Entertainment Universe': '퍼스널 엔터테인먼트 유니버스',
    'Continue Watching': '이어 보기',
    'Recommended for You': '맞춤 추천',
    'New Discoveries': '새로운 발견',
    'Hidden Gems': '숨은 명작',
    'Explore Something Different': '새로운 취향 탐색',
    'Recently Added': '최신 등록',
    'Offline Downloads': '오프라인 다운로드',
    'Watch History': '시청 기록',
    Favorites: '즐겨찾기',
    'Saved Collections': '컬렉션',
    'Recently Viewed': '최근 본 항목',
    'Hidden Items': '숨긴 항목',
    'Personalized Lists': '맞춤 목록',
    Filters: '필터',
    'Reset All': '초기화'
  },
  pt: {
    'My Universe': 'Meu Universo',
    'Discover Map': 'Mapa 3D',
    Search: 'Buscar',
    Library: 'Biblioteca',
    Settings: 'Configurações',
    Back: 'Voltar',
    Play: 'Reproduzir',
    'Watch Now': 'Assistir agora',
    'Resume Watching': 'Continuar',
    Download: 'Baixar',
    Downloaded: 'Baixado',
    'Save Offline': 'Salvar offline',
    'Offline Ready': 'Pronto offline',
    'Download to Device': 'Salvar no dispositivo',
    Details: 'Detalhes',
    'Details & Download': 'Detalhes e Download',
    Bookmark: 'Salvar',
    Saved: 'Salvo',
    Like: 'Curtir',
    'Less Like This': 'Menos assim',
    Hide: 'Ocultar',
    'Why this?': 'Por que isso?',
    'Personal Entertainment Universe': 'Universo de Entretenimento Pessoal',
    'Continue Watching': 'Continuar assistindo',
    'Recommended for You': 'Recomendado para você',
    'New Discoveries': 'Novas descobertas',
    'Hidden Gems': 'Joias escondidas',
    'Explore Something Different': 'Explorar algo diferente',
    'Recently Added': 'Adicionado recentemente',
    'Offline Downloads': 'Downloads offline',
    'Watch History': 'Histórico',
    Favorites: 'Favoritos',
    'Saved Collections': 'Coleções',
    'Recently Viewed': 'Vistos recentemente',
    'Hidden Items': 'Ocultos',
    'Personalized Lists': 'Listas personalizadas',
    Filters: 'Filtros',
    'Reset All': 'Redefinir'
  },
  it: {
    'My Universe': 'Il Mio Universo',
    'Discover Map': 'Mappa 3D',
    Search: 'Cerca',
    Library: 'Libreria',
    Settings: 'Impostazioni',
    Back: 'Indietro',
    Play: 'Riproduci',
    'Watch Now': 'Guarda ora',
    'Resume Watching': 'Riprendi',
    Download: 'Scarica',
    Downloaded: 'Scaricato',
    'Save Offline': 'Salva offline',
    'Offline Ready': 'Pronto offline',
    'Download to Device': 'Salva su dispositivo',
    Details: 'Dettagli',
    'Details & Download': 'Dettagli e Download',
    Bookmark: 'Salva',
    Saved: 'Salvato',
    Like: 'Mi piace',
    'Less Like This': 'Meno simili',
    Hide: 'Nascondi',
    'Why this?': 'Perché questo?',
    'Personal Entertainment Universe': 'Universo di Intrattenimento Personale',
    'Continue Watching': 'Continua a guardare',
    'Recommended for You': 'Consigliati per te',
    'New Discoveries': 'Nuove scoperte',
    'Hidden Gems': 'Gemme nascoste',
    'Explore Something Different': 'Esplora qualcosa di diverso',
    'Recently Added': 'Aggiunti di recente',
    'Offline Downloads': 'Download offline',
    'Watch History': 'Cronologia',
    Favorites: 'Preferiti',
    'Saved Collections': 'Raccolte',
    'Recently Viewed': 'Visti di recente',
    'Hidden Items': 'Nascosti',
    'Personalized Lists': 'Liste personalizzate',
    Filters: 'Filtri',
    'Reset All': 'Ripristina'
  },
  hi: {
    'My Universe': 'मेरा यूनिवर्स',
    'Discover Map': '3D खोज मानचित्र',
    Search: 'खोजें',
    Library: 'लाइब्रेरी',
    Settings: 'सेटिंग्स',
    Back: 'वापस',
    Play: 'चलाएं',
    'Watch Now': 'अभी देखें',
    'Resume Watching': 'जारी रखें',
    Download: 'डाउनलोड',
    Downloaded: 'डाउनलोड हो गया',
    'Save Offline': 'ऑफ़लाइन सहेजें',
    'Offline Ready': 'ऑफ़लाइन तैयार',
    'Download to Device': 'डिवाइस में डाउनलोड करें',
    Details: 'विवरण',
    'Details & Download': 'विवरण और डाउनलोड',
    Bookmark: 'सहेजें',
    Saved: 'सहेजा गया',
    Like: 'पसंद',
    'Less Like This': 'इस जैसा कम',
    Hide: 'छुपाएं',
    'Why this?': 'यह क्यों?',
    'Personal Entertainment Universe': 'पर्सनल एंटरटेनमेंट यूनिवर्स',
    'Continue Watching': 'देखना जारी रखें',
    'Recommended for You': 'आपके लिए सुझाव',
    'New Discoveries': 'नई खोजें',
    'Hidden Gems': 'छिपे हुए रत्न',
    'Explore Something Different': 'कुछ अलग देखें',
    'Recently Added': 'हाल ही में जोड़ा गया',
    'Offline Downloads': 'ऑफ़लाइन डाउनलोड',
    'Watch History': 'देखने का इतिहास',
    Favorites: 'पसंदीदा',
    'Saved Collections': 'सहेजे गए संग्रह',
    'Recently Viewed': 'हाल ही में देखे गए',
    'Hidden Items': 'छुपाए गए आइटम',
    'Personalized Lists': 'व्यक्तिगत सूचियां',
    Filters: 'फ़िल्टर',
    'Reset All': 'रीसेट करें'
  }
};

const I18N_CACHE_KEY = 'aether_i18n_dynamic_cache_v1';

type TranslationCache = Record<string, Record<string, string>>;

function loadTranslationCache(): TranslationCache {
  try {
    const raw = window.localStorage.getItem(I18N_CACHE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TranslationCache;
  } catch {
    return {};
  }
}

function saveTranslationCache(cache: TranslationCache): void {
  try {
    window.localStorage.setItem(I18N_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage limits
  }
}

async function fetchPublicTranslation(targetLang: string, text: string): Promise<string | null> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${encodeURIComponent(
      targetLang
    )}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as unknown[];
    if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
    const segments = data[0] as unknown[][];
    const translated = segments
      .map((seg) => (typeof seg?.[0] === 'string' ? seg[0] : ''))
      .join('')
      .trim();
    return translated || null;
  } catch {
    return null;
  }
}

async function fetchBatchServerTranslation(
  targetLang: string,
  texts: string[]
): Promise<Record<string, string>> {
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLang, texts })
    });
    if (res.ok) {
      const data = (await res.json()) as { translations?: Record<string, string> };
      if (data?.translations && typeof data.translations === 'object') {
        return data.translations;
      }
    }
  } catch {
    // fallback below
  }

  const out: Record<string, string> = {};
  await Promise.all(
    texts.slice(0, 12).map(async (txt) => {
      const translated = await fetchPublicTranslation(targetLang, txt);
      if (translated) out[txt] = translated;
    })
  );
  return out;
}

interface I18nContextValue {
  lang: string;
  dir: 'rtl' | 'ltr';
  languageInfo: WorldLanguageInfo;
  setLang: (code: string) => void;
  t: (enText: string, faText?: string) => string;
  translateTexts: (texts: string[]) => Promise<void>;
  isTranslating: boolean;
}

const I18nContext = createContext<I18nContextValue>({
  lang: 'fa',
  dir: 'rtl',
  languageInfo: WORLD_LANGUAGES[0],
  setLang: () => {},
  t: (enText, faText) => faText || enText,
  translateTexts: async () => {},
  isTranslating: false
});

export function I18nProvider({
  lang,
  onChangeLang,
  children
}: {
  lang: string;
  onChangeLang: (code: string) => void;
  children: React.ReactNode;
}) {
  const [cache, setCache] = useState<TranslationCache>(() => loadTranslationCache());
  const [isTranslating, setIsTranslating] = useState(false);

  const pendingQueueRef = useRef<Set<string>>(new Set());
  const inFlightRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<number | null>(null);
  const langRef = useRef(lang);
  langRef.current = lang;
  const cacheRef = useRef(cache);
  cacheRef.current = cache;

  const commitTranslations = useCallback((targetLang: string, entries: Record<string, string>) => {
    const keys = Object.keys(entries);
    if (keys.length === 0) return;

    const nextCache: TranslationCache = { ...cacheRef.current };
    const langBucket = { ...(nextCache[targetLang] || {}) };
    let changed = false;

    for (const src of keys) {
      const val = entries[src];
      if (val && langBucket[src] !== val) {
        langBucket[src] = val;
        changed = true;
      }
    }

    if (changed) {
      nextCache[targetLang] = langBucket;
      cacheRef.current = nextCache;
      setCache(nextCache);
      saveTranslationCache(nextCache);
    }
  }, []);

  const flushBatch = useCallback(async () => {
    const targetLang = langRef.current;
    if (targetLang === 'en') {
      pendingQueueRef.current.clear();
      return;
    }

    const items = Array.from(pendingQueueRef.current).slice(0, 24);
    if (items.length === 0) return;

    items.forEach((txt) => {
      pendingQueueRef.current.delete(txt);
      inFlightRef.current.add(`${targetLang}::${txt}`);
    });

    setIsTranslating(true);
    try {
      const translatedMap = await fetchBatchServerTranslation(targetLang, items);
      if (langRef.current !== targetLang) return;

      const resolvedEntries: Record<string, string> = {};
      for (const src of items) {
        resolvedEntries[src] = translatedMap[src] || src;
      }
      commitTranslations(targetLang, resolvedEntries);
    } finally {
      items.forEach((txt) => inFlightRef.current.delete(`${targetLang}::${txt}`));
      setIsTranslating(false);
      if (pendingQueueRef.current.size > 0) {
        timerRef.current = window.setTimeout(() => void flushBatch(), 80);
      }
    }
  }, [commitTranslations]);

  useEffect(() => {
    pendingQueueRef.current.clear();
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, [lang]);

  const translateTexts = useCallback(
    async (rawTexts: string[]) => {
      const targetLang = langRef.current;
      if (targetLang === 'en') return;

      const unique = Array.from(
        new Set(rawTexts.map((x) => x.trim()).filter((x) => x.length > 0))
      );
      const missing = unique.filter(
        (txt) =>
          !OFFLINE_DICTIONARY[targetLang]?.[txt] &&
          !cacheRef.current[targetLang]?.[txt] &&
          !inFlightRef.current.has(`${targetLang}::${txt}`)
      );
      if (missing.length === 0) return;

      missing.forEach((txt) => inFlightRef.current.add(`${targetLang}::${txt}`));
      setIsTranslating(true);
      try {
        const translatedMap = await fetchBatchServerTranslation(targetLang, missing);
        if (langRef.current !== targetLang) return;
        commitTranslations(targetLang, translatedMap);
      } finally {
        missing.forEach((txt) => inFlightRef.current.delete(`${targetLang}::${txt}`));
        setIsTranslating(false);
      }
    },
    [commitTranslations]
  );

  const t = useCallback(
    (enText: string, faText?: string): string => {
      if (!enText) return faText || '';
      const activeLang = lang;
      if (activeLang === 'en') return enText;
      if (activeLang === 'fa' && faText && faText !== enText) return faText;

      const baseLang = activeLang.split('-')[0];
      const staticHit =
        OFFLINE_DICTIONARY[activeLang]?.[enText] || OFFLINE_DICTIONARY[baseLang]?.[enText];
      if (staticHit) return staticHit;

      const dynamicHit = cache[activeLang]?.[enText];
      if (dynamicHit) return dynamicHit;

      // Queue background translation without modifying state during render
      if (
        typeof window !== 'undefined' &&
        navigator.onLine !== false &&
        !inFlightRef.current.has(`${activeLang}::${enText}`)
      ) {
        pendingQueueRef.current.add(enText);
        if (!timerRef.current) {
          timerRef.current = window.setTimeout(() => {
            timerRef.current = null;
            void flushBatch();
          }, 70);
        }
      }

      return activeLang === 'fa' && faText ? faText : enText;
    },
    [lang, cache, flushBatch]
  );

  const dir = getLanguageDirection(lang);
  const languageInfo = useMemo(() => resolveLanguageLabel(lang), [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({
      lang,
      dir,
      languageInfo,
      setLang: onChangeLang,
      t,
      translateTexts,
      isTranslating
    }),
    [lang, dir, languageInfo, onChangeLang, t, translateTexts, isTranslating]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT() {
  return useContext(I18nContext);
}

export function LanguagePickerModal({
  isOpen,
  currentLang,
  onSelect,
  onClose
}: {
  isOpen: boolean;
  currentLang: string;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  const { t } = useT();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (l) =>
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const trimmedCode = search.trim().toLowerCase();
  const canUseCustomCode =
    trimmedCode.length >= 2 &&
    trimmedCode.length <= 8 &&
    /^[a-z]{2,3}(-[a-z]{2,4})?$/i.test(trimmedCode) &&
    !WORLD_LANGUAGES.some((l) => l.code.toLowerCase() === trimmedCode);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#06070C]/80 backdrop-blur-md p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t('Select World Language', 'انتخاب زبان اپلیکیشن')}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
            className="w-full max-w-2xl max-h-[88dvh] flex flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border border-white/15 bg-[#0D101A] shadow-2xl pb-[env(safe-area-inset-bottom)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-2.5 min-w-0">
                <Globe2 className="h-5 w-5 text-[#F5B942] shrink-0" />
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-[#F5F7FA]">
                    {t('Select Any World Language', 'انتخاب زبان از سراسر دنیا')}
                  </h2>
                  <p className="truncate text-[11px] text-[#A3AEC2]">
                    {t(
                      '70+ world languages + automatic translation & RTL/LTR layout',
                      'پشتیبانی از بیش از ۷۰ زبان دنیا با ترجمه خودکار و تغییر چیدمان چپ/راست'
                    )}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] text-[#A3AEC2] hover:text-white cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="px-5 pt-4 pb-3 border-b border-white/10">
              <div className="relative flex items-center">
                <Search className="pointer-events-none absolute start-3.5 h-4 w-4 text-[#A3AEC2]" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(
                    'Search language name or ISO code (e.g. Arabic, Español, 日本語, fr, tr)...',
                    'جست‌وجوی نام زبان یا کد زبان (مثلاً: عربی، ترکی، فرانسوی، zh، es)...'
                  )}
                  className="w-full min-h-[44px] rounded-full border border-white/15 bg-[#06070C] ps-10 pe-4 text-base sm:text-sm text-[#F5F7FA] placeholder:text-[#7A869F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 sm:p-5 space-y-3">
              {canUseCustomCode && (
                <button
                  type="button"
                  onClick={() => {
                    onSelect(trimmedCode);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between rounded-2xl border border-[#F5B942]/45 bg-[#F5B942]/10 px-4 py-3 text-sm text-[#F5F7FA] cursor-pointer"
                >
                  <span>
                    {t('Switch to custom language code:', 'تغییر به کد زبان:')}{' '}
                    <strong className="font-mono-tabular text-[#F5B942]">{trimmedCode}</strong>
                  </span>
                  <span className="text-xs text-[#F5B942]">{t('Apply', 'اعمال')}</span>
                </button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {filtered.map((item) => {
                  const active = currentLang.toLowerCase() === item.code.toLowerCase();
                  return (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => {
                        onSelect(item.code);
                        onClose();
                      }}
                      className={`min-h-[52px] flex items-center justify-between gap-2 rounded-2xl border px-3.5 py-2 text-start transition-colors cursor-pointer ${
                        active
                          ? 'border-[#F5B942] bg-[#F5B942]/15 text-[#F5F7FA]'
                          : 'border-white/10 bg-[#06070C]/65 text-[#D2DAE8] hover:border-white/25 hover:bg-white/[0.04]'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{item.nativeName}</p>
                        <p className="truncate text-[11px] text-[#8E9BB3]">
                          {item.englishName} · <span className="uppercase">{item.code}</span>
                        </p>
                      </div>
                      {active && <Check className="h-4 w-4 text-[#F5B942] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
