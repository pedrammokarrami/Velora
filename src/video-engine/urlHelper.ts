import type { PlaybackType } from './types.ts';

export interface ConvertedUrlResult {
  originalUrl: string;
  embedUrl: string;
  playbackType: PlaybackType;
  titleSuggestion: string;
  sourceName: string;
  isDomainOnly: boolean;
}

export function convertPageUrlToEmbedUrl(rawUrl: string): ConvertedUrlResult {
  const cleanUrl = rawUrl.trim();
  let domain = '';
  try {
    const parsed = new URL(cleanUrl);
    domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    domain = 'external-provider';
  }

  const result: ConvertedUrlResult = {
    originalUrl: cleanUrl,
    embedUrl: cleanUrl,
    playbackType: 'authorized_embed',
    titleSuggestion: 'ویدئوی تاییدشده مدیر (' + domain + ')',
    sourceName: domain,
    isDomainOnly: false
  };

  // Direct Video Stream (.mp4, .m3u8, .webm, .mov)
  if (/\.(mp4|m3u8|webm|mov)($|\?)/i.test(cleanUrl)) {
    result.playbackType = 'direct_video';
    result.embedUrl = cleanUrl;
    result.titleSuggestion = 'پخش ویدئوی مستقیم MP4 4K';
    return result;
  }

  // Check if it's just a homepage or domain URL (e.g. https://xhamster.com or https://pornhub.com)
  try {
    const u = new URL(cleanUrl);
    if (u.pathname === '' || u.pathname === '/' || u.pathname === '/index.html') {
      result.isDomainOnly = true;
      result.titleSuggestion = `کاتالوگ رسمی و برتر ${domain}`;
      return result;
    }
  } catch {}

  // 1. XVideos
  // Example: https://www.xvideos.com/video6543210/some_title
  if (domain.includes('xvideos.com')) {
    const match = cleanUrl.match(/video(\d+)/i);
    if (match && match[1]) {
      result.embedUrl = `https://www.xvideos.com/embedframe/${match[1]}`;
      result.titleSuggestion = `ویدئوی XVideos #${match[1]}`;
    }
    return result;
  }

  // 2. Pornhub
  // Example: https://www.pornhub.com/view_video.php?viewkey=ph12345678
  if (domain.includes('pornhub.com')) {
    const match = cleanUrl.match(/viewkey=([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      result.embedUrl = `https://www.pornhub.com/embed/${match[1]}`;
      result.titleSuggestion = `ویدئوی Pornhub ${match[1]}`;
    }
    return result;
  }

  // 3. xHamster
  // Example: https://xhamster.com/videos/some-title-1234567
  if (domain.includes('xhamster.')) {
    const match = cleanUrl.match(/videos\/([^/?#]+)/i);
    if (match && match[1]) {
      const idMatch = match[1].match(/(\d+)$/) || match[1].match(/([a-zA-Z0-9]+)$/);
      const videoId = idMatch ? idMatch[1] : match[1];
      result.embedUrl = `https://xhamster.com/embed/${videoId}`;
      result.titleSuggestion = `ویدئوی xHamster HD`;
    }
    return result;
  }

  // 4. SpankBang
  // Example: https://spankbang.com/7x8y9/video/title
  if (domain.includes('spankbang.com')) {
    const match = cleanUrl.match(/spankbang\.com\/([a-zA-Z0-9]+)\/video/i) || cleanUrl.match(/spankbang\.com\/([a-zA-Z0-9]+)/i);
    if (match && match[1] && match[1] !== 'video') {
      result.embedUrl = `https://spankbang.com/${match[1]}/embed/`;
      result.titleSuggestion = `ویدئوی SpankBang HD 4K`;
    }
    return result;
  }

  // 5. Eporner
  // Example: https://www.eporner.com/hd-porn/123456/title/
  if (domain.includes('eporner.com')) {
    const match = cleanUrl.match(/hd-porn\/([a-zA-Z0-9]+)/i) || cleanUrl.match(/video\/([a-zA-Z0-9]+)/i);
    if (match && match[1]) {
      result.embedUrl = `https://www.eporner.com/embed/${match[1]}/`;
      result.titleSuggestion = `ویدئوی Eporner 60FPS`;
    }
    return result;
  }

  // 6. YouPorn
  // Example: https://www.youporn.com/watch/123456/title/
  if (domain.includes('youporn.com')) {
    const match = cleanUrl.match(/watch\/(\d+)/i);
    if (match && match[1]) {
      result.embedUrl = `https://www.youporn.com/embed/${match[1]}/`;
      result.titleSuggestion = `ویدئوی YouPorn HD`;
    }
    return result;
  }

  // 7. RedTube
  // Example: https://www.redtube.com/123456
  if (domain.includes('redtube.com')) {
    const match = cleanUrl.match(/redtube\.com\/(\d+)/i);
    if (match && match[1]) {
      result.embedUrl = `https://embed.redtube.com/?id=${match[1]}`;
      result.titleSuggestion = `ویدئوی RedTube HD`;
    }
    return result;
  }

  // Default fallback title generation from URL path
  try {
    const urlObj = new URL(cleanUrl);
    const pathname = urlObj.pathname.split('/').filter(Boolean).pop();
    if (pathname && pathname !== 'index.html') {
      let pretty = decodeURIComponent(pathname).replace(/[-_.]/g, ' ').replace(/\.(html|php|aspx)$/i, '');
      pretty = pretty.charAt(0).toUpperCase() + pretty.slice(1);
      result.titleSuggestion = pretty.slice(0, 50);
    }
  } catch {}

  return result;
}

export function generateSampleVideosForDomain(domainUrl: string, sourceName?: string): Array<{
  title: string;
  original_video_url: string;
  authorized_embed_url: string;
  playback_type: PlaybackType;
  description: string;
}> {
  let domain = 'official';
  try {
    domain = new URL(domainUrl).hostname.replace(/^www\./i, '');
  } catch {}

  const name = sourceName || domain;

  return [
    {
      title: `مجموعه منتخب 4K اول‌شخص از ${name}`,
      original_video_url: domainUrl,
      authorized_embed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      playback_type: 'direct_video',
      description: `ویدئوی تاییدشده مدیر از منبع رسمی ${name} با کیفیت بالا`
    },
    {
      title: `سکانس اوج و ریتم داغ سینمایی از ${name}`,
      original_video_url: domainUrl,
      authorized_embed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
      playback_type: 'direct_video',
      description: `ویدئوی منتخب سردبیری از ${name}`
    },
    {
      title: `نمای نزدیک POV مجموعه ${name}`,
      original_video_url: domainUrl,
      authorized_embed_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
      playback_type: 'direct_video',
      description: `ویدئوی کیفیت فوق‌العاده منبع ${name}`
    }
  ];
}
