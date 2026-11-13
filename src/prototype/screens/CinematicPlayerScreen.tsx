import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Captions,
  Check,
  Clapperboard,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  Film,
  Globe2,
  HardDriveDownload,
  Loader2,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldCheck,
  Sparkles,
  Star,
  Volume2,
  VolumeX,
  Wand2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  WatchProgressEntry
} from '../types';
import { formatBytes, loadOfflineMediaBlob, triggerBrowserDownload } from '../downloadEngine';
import {
  fetchBackendFilmDetails,
  pickRandomCardinalEntrances,
  type BackendFilmDetailsResponse,
  type BackendStreamQuality
} from '../filmDetailsClient';
import {
  buildSrtContent,
  buildWebVttContent,
  generateAiSyncedSubtitles,
  type AiSubtitleSyncResult
} from '../subtitleAiEngine';
import { useT } from '../i18n';
import { Button, formatDuration } from '../components/UiPrimitives';

interface CinematicPlayerScreenProps {
  item: PrototypeMediaItem | null;
  lang: LanguageCode;
  initialProgress?: WatchProgressEntry;
  downloadRecord?: OfflineDownloadRecord;
  defaultQuality: 'auto' | '4k' | '1080p' | '720p';
  defaultSubtitleLang: 'fa' | 'en' | 'off';
  defaultSpeed: number;
  initialSelectedQualityId?: string;
  initialPlaybackMode?: 'movie' | 'trailer';
  onSaveProgress: (contentId: string, positionSec: number, durationSec: number, completed: boolean) => void;
  onDownload: (
    item: PrototypeMediaItem,
    saveFileToDevice?: boolean,
    selectedQuality?: BackendStreamQuality
  ) => void;
  onOpenLanguagePicker: () => void;
  onBack: () => void;
}

export function CinematicPlayerScreen({
  item,
  lang,
  initialProgress,
  downloadRecord,
  defaultQuality,
  defaultSubtitleLang,
  defaultSpeed,
  initialSelectedQualityId,
  initialPlaybackMode = 'movie',
  onSaveProgress,
  onDownload,
  onOpenLanguagePicker,
  onBack
}: CinematicPlayerScreenProps) {
  const { t, dir, languageInfo, translateTexts, isTranslating } = useT();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const trailerVideoRef = useRef<HTMLVideoElement | null>(null);

  const [playbackMode, setPlaybackMode] = useState<'movie' | 'trailer'>(initialPlaybackMode);
  useEffect(() => {
    setPlaybackMode(initialPlaybackMode);
  }, [initialPlaybackMode, item?.id]);

  const [details, setDetails] = useState<BackendFilmDetailsResponse | null>(null);
  const trailerDuration = details?.trailer?.durationSec || 45;
  const duration = playbackMode === 'trailer' ? trailerDuration : item?.durationSec ?? 360;

  const startOffset =
    playbackMode === 'movie' &&
    initialProgress &&
    !initialProgress.completed &&
    initialProgress.positionSec < (item?.durationSec ?? 360) - 5
      ? initialProgress.positionSec
      : 0;

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(startOffset);
  const currentTimeRef = useRef(startOffset);
  currentTimeRef.current = currentTime;
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [selectedQualityId, setSelectedQualityId] = useState<string>(
    initialSelectedQualityId || defaultQuality
  );
  const [subMode, setSubMode] = useState<'auto' | 'fa' | 'en' | 'off'>(
    lang !== 'fa' && lang !== 'en' && defaultSubtitleLang !== 'off' ? 'auto' : defaultSubtitleLang
  );
  const [speed, setSpeed] = useState<number>(defaultSpeed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playingFromOfflineVault, setPlayingFromOfflineVault] = useState(false);
  const [offlineBlobAvailable, setOfflineBlobAvailable] = useState(false);
  const [streamReady, setStreamReady] = useState(false);
  const [liveTrailerVideoActive, setLiveTrailerVideoActive] = useState(false);

  // Autonomous AI Subtitle Auto-Match & Sync state
  const [aiSyncing, setAiSyncing] = useState(false);
  const [aiSyncedSub, setAiSyncedSub] = useState<AiSubtitleSyncResult | null>(null);
  const [syncOffsetMs, setSyncOffsetMs] = useState<number>(0);
  const [subtitlePanelOpen, setSubtitlePanelOpen] = useState<boolean>(false);
  const [vttTrackUrl, setVttTrackUrl] = useState<string | null>(null);

  const cardEntrances = useMemo(() => pickRandomCardinalEntrances(4), [item?.id]);

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const isDownloading = downloadRecord?.status === 'downloading';
  const isDownloaded = downloadRecord?.status === 'completed';

  // Fetch IMDb + Backend Qualities + Trailer info when item loads
  useEffect(() => {
    if (!item) {
      setDetails(null);
      return;
    }
    let active = true;
    void fetchBackendFilmDetails(item).then((res) => {
      if (!active) return;
      setDetails(res);
      if (initialSelectedQualityId && res.qualities.some((q) => q.id === initialSelectedQualityId)) {
        setSelectedQualityId(initialSelectedQualityId);
      } else {
        const rec = res.qualities.find((q) => q.recommended) || res.qualities[0];
        if (rec) setSelectedQualityId(rec.id);
      }
    });
    return () => {
      active = false;
    };
  }, [item, initialSelectedQualityId]);

  // Batch translate IMDb + quality + trailer data + AI synced subtitle cues on language change
  useEffect(() => {
    if (!details || lang === 'en') return;
    const imdb = details.imdb;
    const extraCueTexts = aiSyncedSub ? aiSyncedSub.cues.map((c) => c.en) : [];
    void translateTexts([
      imdb.matchedTitle,
      imdb.director,
      imdb.typeLabel,
      imdb.country,
      imdb.plotSummary,
      imdb.imdbReferenceNote,
      ...(details.trailer ? [details.trailer.title] : []),
      ...imdb.cast,
      ...imdb.genres,
      ...imdb.spokenLanguages,
      ...details.qualities.map((q) => q.label),
      ...details.qualities.map((q) => q.batteryMode),
      ...details.qualities.map((q) => q.audio),
      ...extraCueTexts
    ]);
  }, [details, lang, aiSyncedSub, translateTexts]);

  const backendQualities = details?.qualities || [];
  const activeQuality =
    backendQualities.find((q) => q.id === selectedQualityId) || backendQualities[0];

  // Reset AI synced subtitle state when switching film
  useEffect(() => {
    setAiSyncedSub(null);
    setSyncOffsetMs(0);
    setLiveTrailerVideoActive(false);
  }, [item?.id]);

  // Reset timeline cleanly when switching between Movie and Trailer mode
  useEffect(() => {
    const targetOffset =
      playbackMode === 'movie' &&
      item &&
      initialProgress &&
      !initialProgress.completed &&
      initialProgress.positionSec < item.durationSec - 5
        ? initialProgress.positionSec
        : 0;
    currentTimeRef.current = targetOffset;
    setCurrentTime(targetOffset);
    setIsPlaying(true);
    setLiveTrailerVideoActive(false);
  }, [playbackMode, item?.id]);

  // Detect offline blob availability
  useEffect(() => {
    if (!item) return;
    let active = true;
    void loadOfflineMediaBlob(item.id).then((blob) => {
      if (active) {
        const hasBlob = Boolean(blob);
        setOfflineBlobAvailable(hasBlob);
        if (hasBlob && typeof navigator !== 'undefined' && navigator.onLine === false) {
          setPlayingFromOfflineVault(true);
        }
      }
    });
    return () => {
      active = false;
    };
  }, [item?.id, isDownloaded]);

  // Autonomous AI Subtitle Match & Drift Calibration handler
  const handleRunAiSubtitleSync = useCallback(() => {
    if (!item || aiSyncing) return;
    setAiSyncing(true);
    setSubtitlePanelOpen(true);

    window.setTimeout(() => {
      const matched = generateAiSyncedSubtitles(
        item,
        details?.imdb || null,
        activeQuality?.resolution || item.quality,
        lang
      );
      setAiSyncedSub(matched);
      setSyncOffsetMs(matched.autoOffsetMs);
      if (subMode === 'off') {
        setSubMode('auto');
      }
      if (lang !== 'en' && lang !== 'fa') {
        void translateTexts(matched.cues.map((c) => c.en));
      }
      setAiSyncing(false);
    }, 520);
  }, [item, aiSyncing, details, activeQuality, lang, subMode, translateTexts]);

  // Helper to resolve subtitle line in active language
  const renderCueText = useCallback(
    (enText: string, faText: string): string => {
      if (subMode === 'fa') return faText;
      if (subMode === 'en') return enText;
      return t(enText, faText);
    },
    [subMode, t]
  );

  // Build live WebVTT Blob Track URL & attach to <video> whenever cues, offset, or lang change
  useEffect(() => {
    if (!item || subMode === 'off') {
      setVttTrackUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return null;
      });
      return;
    }

    const activeCues = aiSyncedSub
      ? aiSyncedSub.cues
      : item.subtitles.map((s, idx) => ({
          id: `base-${idx}`,
          startSec: s.startSec,
          endSec: s.endSec,
          en: s.en,
          fa: s.fa
        }));

    const vttText = buildWebVttContent(activeCues, syncOffsetMs, (cue) =>
      renderCueText(cue.en, cue.fa)
    );
    const blob = new Blob([vttText], { type: 'text/vtt;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    setVttTrackUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item, aiSyncedSub, syncOffsetMs, subMode, renderCueText]);

  const handleDownloadMatchedSrt = useCallback(() => {
    if (!item) return;
    const synced =
      aiSyncedSub ||
      generateAiSyncedSubtitles(
        item,
        details?.imdb || null,
        activeQuality?.resolution || item.quality,
        lang
      );
    const srtText = buildSrtContent(synced.cues, syncOffsetMs, (cue) =>
      renderCueText(cue.en, cue.fa)
    );
    const blob = new Blob([srtText], { type: 'text/plain;charset=utf-8' });
    triggerBrowserDownload(blob, synced.matchedFilename);
  }, [item, aiSyncedSub, details, activeQuality, lang, syncOffsetMs, renderCueText]);

  // Procedural Canvas -> HTML5 <video> MediaStream engine (adapts to Trailer vs Movie cadence)
  useEffect(() => {
    if (!item) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const posterImg = new Image();
    posterImg.src = item.posterUrl;

    let frame = 0;
    let rafId = 0;

    const drawFrame = () => {
      if (isPlayingRef.current) {
        frame += playbackMode === 'trailer' ? 2.4 : 1;
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#06070C';
      ctx.fillRect(0, 0, w, h);

      if (posterImg.complete && posterImg.naturalWidth > 0) {
        const zoomFactor =
          playbackMode === 'trailer'
            ? 1.06 + Math.sin(frame * 0.025) * 0.05
            : 1.04 + Math.sin(frame * 0.015) * 0.03;
        const dw = w * zoomFactor;
        const dh = h * zoomFactor;
        const dx = (w - dw) / 2 + Math.cos(frame * 0.012) * 14;
        const dy = (h - dh) / 2 + Math.sin(frame * 0.01) * 10;
        ctx.globalAlpha = isPlayingRef.current ? 0.92 : 0.6;
        ctx.drawImage(posterImg, dx, dy, dw, dh);
        ctx.globalAlpha = 1;
      }

      const grad = ctx.createRadialGradient(
        w * (0.5 + Math.sin(frame * 0.02) * 0.16),
        h * 0.45,
        24,
        w * 0.5,
        h * 0.5,
        w * 0.68
      );
      grad.addColorStop(0, `${item.accentHex}3D`);
      grad.addColorStop(1, 'rgba(6, 7, 12, 0.72)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);

    try {
      const streamable = canvas as HTMLCanvasElement & { captureStream?: (fps?: number) => MediaStream };
      if (video && typeof streamable.captureStream === 'function') {
        const mediaStream = streamable.captureStream(24);
        video.srcObject = mediaStream;
        video.muted = true;
        void video.play().catch(() => {});
        setStreamReady(true);
      }
    } catch {
      setStreamReady(false);
    }

    return () => {
      window.cancelAnimationFrame(rafId);
      if (video && video.srcObject) {
        const stream = video.srcObject as MediaStream;
        stream.getTracks().forEach((tr) => tr.stop());
        video.srcObject = null;
      }
    };
  }, [item?.id, item?.posterUrl, item?.accentHex, playbackMode]);

  // Sync external MP4 trailer video element play/pause/mute state when in Trailer Mode
  useEffect(() => {
    const trVideo = trailerVideoRef.current;
    if (!trVideo || playbackMode !== 'trailer' || !details?.trailer?.previewVideoUrl) return;
    trVideo.muted = muted;
    trVideo.volume = volume;
    trVideo.playbackRate = speed;
    if (isPlaying) {
      void trVideo.play().catch(() => {});
    } else {
      trVideo.pause();
    }
  }, [isPlaying, muted, volume, speed, playbackMode, details?.trailer?.previewVideoUrl]);

  // Playback progress ticker
  useEffect(() => {
    if (!item || !isPlaying) return;
    const id = window.setInterval(() => {
      const next = Math.min(duration, currentTimeRef.current + speed);
      currentTimeRef.current = next;
      setCurrentTime(next);
      if (playbackMode === 'movie') {
        onSaveProgress(item.id, next, duration, next >= duration);
      }
      if (next >= duration) {
        setIsPlaying(false);
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [item, duration, isPlaying, speed, playbackMode, onSaveProgress]);

  // Robust Fullscreen: tries Native Fullscreen API AND applies fixed-viewport Cinema Fullscreen
  // cleanly so it works 100% inside iframes, iOS Safari, Android, and desktop browsers!
  const toggleFullscreen = useCallback(async () => {
    const stageEl = stageRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => Promise<void> | void;
    }) | null;
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void;
      webkitFullscreenElement?: Element | null;
    };

    const nextState = !isFullscreen;
    setIsFullscreen(nextState);

    if (!stageEl) return;
    try {
      if (nextState) {
        if (!doc.fullscreenElement && !doc.webkitFullscreenElement) {
          if (typeof stageEl.requestFullscreen === 'function') {
            await stageEl.requestFullscreen();
          } else if (typeof stageEl.webkitRequestFullscreen === 'function') {
            await stageEl.webkitRequestFullscreen();
          }
        }
      } else {
        if (doc.fullscreenElement && typeof doc.exitFullscreen === 'function') {
          await doc.exitFullscreen();
        } else if (doc.webkitFullscreenElement && typeof doc.webkitExitFullscreen === 'function') {
          await doc.webkitExitFullscreen();
        }
      }
    } catch {
      // Viewport fixed fullscreen overlay remains active cleanly even when iframe blocks native Fullscreen API
    }
  }, [isFullscreen]);

  // Keep state synced when native Escape exits browser fullscreen & lock scroll while fullscreen
  useEffect(() => {
    const onNativeFsChange = () => {
      const fsActive = Boolean(
        document.fullscreenElement ||
          (document as Document & { webkitFullscreenElement?: Element | null }).webkitFullscreenElement
      );
      if (!fsActive && isFullscreen) {
        // Keep viewport fullscreen unless exited via Esc/toggle button; if native FS exited via Esc, exit cleanly
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', onNativeFsChange);
    document.addEventListener('webkitfullscreenchange', onNativeFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onNativeFsChange);
      document.removeEventListener('webkitfullscreenchange', onNativeFsChange);
    };
  }, [isFullscreen]);

  useEffect(() => {
    if (!isFullscreen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          void document.exitFullscreen().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isFullscreen]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      } else if (e.key.toLowerCase() === 'j') {
        setCurrentTime((tm) => Math.max(0, tm - 10));
      } else if (e.key.toLowerCase() === 'l') {
        setCurrentTime((tm) => Math.min(duration, tm + 10));
      } else if (e.key.toLowerCase() === 'm') {
        setMuted((m) => !m);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        void toggleFullscreen();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [duration, toggleFullscreen]);

  // Resolve current live subtitle cue honoring AI Synced Subtitles + calibration offset
  const activeSubtitle = useMemo(() => {
    if (!item || subMode === 'off') return null;

    if (playbackMode === 'trailer') {
      const idx = Math.min(2, Math.floor((currentTime / Math.max(1, duration)) * 3));
      const hl = details?.trailer?.highlights?.[idx];
      return hl
        ? `${t('Official Trailer', 'تریلر رسمی')} · ${t(hl.label)}`
        : `${t('Official Trailer', 'تریلر رسمی')} — ${t(item.titleEn, item.titleFa)}`;
    }

    const effectiveTime = currentTime - syncOffsetMs / 1000;
    const pool = aiSyncedSub
      ? aiSyncedSub.cues
      : item.subtitles.map((s, idx) => ({
          id: `base-${idx}`,
          startSec: s.startSec,
          endSec: s.endSec,
          en: s.en,
          fa: s.fa
        }));

    const match = pool.find((s) => effectiveTime >= s.startSec && effectiveTime <= s.endSec);
    if (match) {
      return renderCueText(match.en, match.fa);
    }

    if (aiSyncedSub && pool.length > 0) {
      const nearest = pool.reduce((best, cur) =>
        Math.abs(cur.startSec - effectiveTime) < Math.abs(best.startSec - effectiveTime) ? cur : best
      );
      return renderCueText(nearest.en, nearest.fa);
    }

    if (currentTime > 0 && item.subtitles.length > 0) {
      const prefix = t('Live Subtitles', 'زیرنویس زنده');
      return `[${prefix} · ${activeQuality ? activeQuality.resolution : selectedQualityId}] ${t(
        item.titleEn,
        item.titleFa
      )}`;
    }
    return null;
  }, [
    item,
    subMode,
    playbackMode,
    currentTime,
    duration,
    details,
    syncOffsetMs,
    aiSyncedSub,
    activeQuality,
    selectedQualityId,
    renderCueText,
    t
  ]);

  if (!item) {
    return (
      <div className="my-12 rounded-[28px] border border-white/12 bg-[#0D101A] p-8 text-center space-y-4">
        <p className="text-sm text-[#A3AEC2]">
          {t('No media item selected for playback.', 'هنوز اثری برای پخش انتخاب نشده است.')}
        </p>
        <Button onClick={onBack}>{t('Return to Universe', 'بازگشت به جهان من')}</Button>
      </div>
    );
  }

  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const title = t(item.titleEn, item.titleFa);
  const category = t(item.categoryEn, item.categoryFa);
  const synopsis =
    details?.imdb && details.imdb.plotSummary !== item.synopsisEn
      ? t(details.imdb.plotSummary)
      : t(item.synopsisEn, item.synopsisFa);

  const getMotionProps = (idx: number) => {
    const ent = cardEntrances[idx] || { initialX: 0, initialY: 28, delay: 0 };
    return {
      initial: { opacity: 0, x: ent.initialX, y: ent.initialY },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { type: 'spring' as const, stiffness: 280, damping: 24, delay: ent.delay }
    };
  };

  return (
    <div className="space-y-5 pb-12 overflow-x-hidden">
      {/* Player Top Navigation & Trailer / Full Movie Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" onClick={onBack}>
            <BackIcon className="h-4 w-4" />
            <span>{t('Back', 'بازگشت')}</span>
          </Button>

          {/* Official Trailer vs Full Film Mode Pill */}
          <div className="inline-flex items-center rounded-full border border-white/15 bg-[#0D101A] p-1">
            <button
              type="button"
              onClick={() => setPlaybackMode('movie')}
              className={`min-h-[34px] inline-flex items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors cursor-pointer ${
                playbackMode === 'movie'
                  ? 'bg-[#F5B942] text-[#06070C] font-semibold'
                  : 'text-[#A3AEC2] hover:text-white'
              }`}
            >
              <Film className="h-3.5 w-3.5" />
              <span>{t('Full Movie', 'فیلم کامل')}</span>
            </button>
            <button
              type="button"
              onClick={() => setPlaybackMode('trailer')}
              className={`min-h-[34px] inline-flex items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors cursor-pointer ${
                playbackMode === 'trailer'
                  ? 'bg-[#F5B942] text-[#06070C] font-semibold'
                  : 'text-[#A3AEC2] hover:text-white'
              }`}
            >
              <Clapperboard className="h-3.5 w-3.5" />
              <span>{t('Watch Trailer', 'پخش تریلر')}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={aiSyncedSub ? 'primary' : 'secondary'}
            size="sm"
            onClick={handleRunAiSubtitleSync}
            disabled={aiSyncing}
          >
            {aiSyncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wand2 className="h-3.5 w-3.5" />
            )}
            <span>
              {aiSyncing
                ? t('AI Syncing...', 'در حال همسان‌سازی AI...')
                : aiSyncedSub
                ? `${t('AI Sub Synced', 'زیرنویس همسان‌سازی شد')} (${aiSyncedSub.confidencePct}%)`
                : t('AI Auto-Sync Subtitles', 'همسان‌سازی هوشمند زیرنویس')}
            </span>
          </Button>

          <Button variant="secondary" size="sm" onClick={onOpenLanguagePicker}>
            <Globe2 className="h-3.5 w-3.5 text-[#F5B942]" />
            <span>
              {isTranslating
                ? t('Translating...', 'در حال ترجمه...')
                : `${t('Translate', 'ترجمه')}: ${languageInfo.nativeName}`}
            </span>
          </Button>

          {(isDownloaded || offlineBlobAvailable) && (
            <Button
              variant={playingFromOfflineVault ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setPlayingFromOfflineVault((v) => !v)}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>
                {playingFromOfflineVault
                  ? t('Playing Offline Vault', 'در حال پخش از حافظه آفلاین')
                  : t('Switch to Offline Copy', 'پخش نسخه آفلاین')}
              </span>
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            disabled={isDownloading}
            onClick={() => onDownload(item, false, activeQuality)}
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#F5B942]" />
                <span>{downloadRecord.progressPct}%</span>
              </>
            ) : isDownloaded ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#34D399]" />
                <span>{t('Offline Ready', 'آفلاین آماده')}</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-[#F5B942]" />
                <span>{t('Save Offline', 'ذخیره آفلاین')}</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={isDownloading}
            onClick={() => onDownload(item, true, activeQuality)}
          >
            <HardDriveDownload className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{t('Download to Device', 'دانلود در دستگاه')}</span>
          </Button>
        </div>
      </div>

      {/* Main Cinema Stage — Outer element is raw un-transformed <div> so fixed fullscreen ALWAYS fills 100dvh cleanly */}
      <div
        ref={stageRef}
        data-fullscreen={isFullscreen ? 'true' : 'false'}
        className={
          isFullscreen
            ? 'fixed inset-0 z-[120] w-[100dvw] h-[100dvh] bg-black flex flex-col justify-center overflow-hidden'
            : 'relative overflow-hidden rounded-[22px] sm:rounded-[28px] border border-white/15 bg-[#06070C] shadow-[0_28px_80px_-20px_rgba(0,0,0,0.95)]'
        }
      >
        <div
          className={
            isFullscreen
              ? 'relative w-full h-full flex items-center justify-center bg-black'
              : 'relative aspect-video w-full bg-black'
          }
        >
          {/* Synthesized High-Quality Frame Stream / Fallback */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className={`h-full w-full ${isFullscreen ? 'object-contain' : 'object-cover'}`}
          />

          {/* Main HTML5 Video Stream with attached AI-Synced WebVTT Subtitle <track> */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`pointer-events-none absolute inset-0 h-full w-full ${
              isFullscreen ? 'object-contain' : 'object-cover'
            } ${streamReady && !liveTrailerVideoActive ? 'opacity-100' : 'opacity-0'}`}
          >
            {vttTrackUrl && (
              <track
                key={`${vttTrackUrl}-${lang}`}
                kind="subtitles"
                src={vttTrackUrl}
                srcLang={lang}
                label={languageInfo.nativeName}
                default
              />
            )}
          </video>

          {/* Real External Trailer Stream Layer when in Trailer Mode and URL exists */}
          {playbackMode === 'trailer' && details?.trailer?.previewVideoUrl && (
            <video
              ref={trailerVideoRef}
              src={details.trailer.previewVideoUrl}
              playsInline
              autoPlay
              onCanPlay={() => setLiveTrailerVideoActive(true)}
              onError={() => setLiveTrailerVideoActive(false)}
              className={`absolute inset-0 h-full w-full ${
                isFullscreen ? 'object-contain' : 'object-cover'
              } ${liveTrailerVideoActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {vttTrackUrl && (
                <track
                  key={`trailer-${vttTrackUrl}-${lang}`}
                  kind="subtitles"
                  src={vttTrackUrl}
                  srcLang={lang}
                  label={languageInfo.nativeName}
                  default
                />
              )}
            </video>
          )}

          {/* Top Left Mode Badges (Trailer / AI Sub / Offline Vault) */}
          <div className="absolute top-3 start-3 z-20 flex flex-wrap items-center gap-2">
            {playbackMode === 'trailer' && (
              <div className="inline-flex items-center gap-2 rounded-full border border-[#F5B942]/55 bg-[#06070C]/85 px-3 py-1 text-xs font-semibold text-[#F5B942] backdrop-blur-md">
                <Clapperboard className="h-3.5 w-3.5" />
                <span>{t('Official Trailer Mode', 'حالت پخش تریلر رسمی')}</span>
                <button
                  type="button"
                  onClick={() => setPlaybackMode('movie')}
                  className="ms-1 rounded-full bg-[#F5B942] px-2 py-0.5 text-[10px] font-bold text-[#06070C] cursor-pointer"
                >
                  {t('Watch Full Movie', 'تماشای فیلم کامل')}
                </button>
              </div>
            )}

            {aiSyncedSub && (
              <div className="inline-flex items-center gap-1.5 rounded-full border border-[#34D399]/45 bg-[#06070C]/85 px-3 py-1 text-[11px] font-medium text-[#34D399] backdrop-blur-md">
                <Wand2 className="h-3 w-3" />
                <span>
                  {t('AI Synced', 'همسان‌سازی خودکار AI')} · {aiSyncedSub.confidencePct}%
                </span>
              </div>
            )}

            {playingFromOfflineVault && playbackMode === 'movie' && (
              <div className="rounded-full border border-[#34D399]/40 bg-[#06070C]/85 px-3 py-1 text-[11px] font-medium text-[#34D399] backdrop-blur-md">
                {t('Playing from In-App Offline Vault', 'در حال پخش از حافظه آفلاین داخل برنامه')}
              </div>
            )}
          </div>

          {/* Top Right Fullscreen Exit Button when Fullscreen is active */}
          {isFullscreen && (
            <button
              type="button"
              onClick={() => void toggleFullscreen()}
              className="absolute top-3 end-3 z-20 min-h-[40px] inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-[#06070C]/85 px-3.5 text-xs font-semibold text-white backdrop-blur-md hover:border-[#F5B942] cursor-pointer"
            >
              <Minimize2 className="h-4 w-4 text-[#F5B942]" />
              <span>{t('Exit Fullscreen', 'خروج از تمام‌صفحه')}</span>
            </button>
          )}

          {/* Subtitles Overlay */}
          {activeSubtitle && (
            <div className="pointer-events-none absolute bottom-20 sm:bottom-24 inset-x-4 z-10 flex justify-center">
              <p className="max-w-3xl rounded-xl bg-[#06070C]/88 px-4 py-2 text-center text-xs sm:text-base font-medium text-[#F5F7FA] shadow-lg backdrop-blur-md border border-white/10">
                {activeSubtitle}
              </p>
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#06070C] via-[#06070C]/88 to-transparent px-3 sm:px-6 pt-6 sm:pt-8 pb-3 sm:pb-4 space-y-2 sm:space-y-3">
            {/* Scrubber */}
            <div className="space-y-1" dir="ltr">
              <div className="relative flex items-center">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  value={currentTime}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setCurrentTime(next);
                    if (playbackMode === 'movie') {
                      onSaveProgress(item.id, next, duration, next >= duration);
                    } else if (trailerVideoRef.current && liveTrailerVideoActive) {
                      trailerVideoRef.current.currentTime = next;
                    }
                  }}
                  aria-label="Seek timeline"
                  className="aether-slider w-full"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#A3AEC2]">
                <span>{formatDuration(currentTime)}</span>
                <span>{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-full bg-[#F5B942] text-[#06070C] cursor-pointer"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTime((tm) => Math.max(0, tm - 10))}
                  aria-label="Rewind 10s"
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[#F5F7FA] cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTime((tm) => Math.min(duration, tm + 10))}
                  aria-label="Forward 10s"
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[#F5F7FA] cursor-pointer"
                >
                  <RotateCw className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setMuted((m) => !m)}
                  aria-label={muted ? 'Unmute' : 'Mute'}
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[#F5F7FA] cursor-pointer"
                >
                  {muted || volume === 0 ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={muted ? 0 : volume}
                  onChange={(e) => {
                    setVolume(Number(e.target.value));
                    setMuted(false);
                  }}
                  aria-label="Volume"
                  className="hidden sm:block w-20 accent-[#F5B942]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Autonomous AI Subtitle Sync Trigger inside player bar */}
                <button
                  type="button"
                  onClick={() => setSubtitlePanelOpen((o) => !o)}
                  aria-label={t('AI Subtitle Sync Studio', 'تنظیمات همسان‌سازی زیرنویس')}
                  className={`min-h-[38px] inline-flex items-center gap-1.5 rounded-full border px-2.5 sm:px-3 text-xs cursor-pointer transition-colors ${
                    aiSyncedSub || subtitlePanelOpen
                      ? 'border-[#34D399]/60 bg-[#34D399]/15 text-[#34D399]'
                      : 'border-white/15 bg-white/[0.06] text-[#F5F7FA]'
                  }`}
                >
                  <Wand2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{t('AI Sub Sync', 'همسان‌سازی AI')}</span>
                </button>

                {/* Subtitle Switcher */}
                <button
                  type="button"
                  onClick={() =>
                    setSubMode((s) =>
                      s === 'auto' ? 'fa' : s === 'fa' ? 'en' : s === 'en' ? 'off' : 'auto'
                    )
                  }
                  className="min-h-[38px] inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/[0.06] px-2.5 sm:px-3 text-xs text-[#F5F7FA] cursor-pointer"
                >
                  <Captions className="h-3.5 w-3.5 text-[#F5B942]" />
                  <span>
                    {subMode === 'off'
                      ? t('CC Off', 'زیرنویس خاموش')
                      : subMode === 'auto'
                      ? `CC (${lang.toUpperCase()})`
                      : `CC ${subMode.toUpperCase()}`}
                  </span>
                </button>

                {/* Speed Switcher */}
                <button
                  type="button"
                  onClick={() =>
                    setSpeed((sp) => (sp === 1 ? 1.25 : sp === 1.25 ? 1.5 : sp === 1.5 ? 2 : 1))
                  }
                  className="min-h-[38px] rounded-full border border-white/15 bg-white/[0.06] px-2.5 sm:px-3 text-xs font-mono-tabular text-[#F5F7FA] cursor-pointer"
                >
                  {speed}x
                </button>

                {/* Backend Quality Selector */}
                <select
                  value={activeQuality?.id || selectedQualityId}
                  onChange={(e) => setSelectedQualityId(e.target.value)}
                  aria-label="Backend Stream Quality"
                  className="min-h-[38px] rounded-full border border-white/15 bg-[#0D101A] px-2.5 sm:px-3 text-base sm:text-xs text-[#F5F7FA]"
                >
                  {backendQualities.length > 0 ? (
                    backendQualities.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.resolution} · {t(q.label)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="auto">Auto (ABR)</option>
                      <option value="4k">4K HDR</option>
                      <option value="1080p">1080p</option>
                      <option value="720p">720p Lite</option>
                    </>
                  )}
                </select>

                <button
                  type="button"
                  onClick={() => void toggleFullscreen()}
                  aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                  className="min-h-[40px] min-w-[40px] sm:min-h-[44px] sm:min-w-[44px] inline-flex items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-[#F5F7FA] hover:border-[#F5B942] cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Autonomous AI Subtitle Matching & Calibration Panel (Always accessible + Expandable) */}
      <AnimatePresence>
        {(subtitlePanelOpen || aiSyncedSub) && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-[24px] border border-[#34D399]/35 bg-[#0D101A] p-4 sm:p-5 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Wand2 className="h-5 w-5 text-[#34D399] shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">
                    {t(
                      'Autonomous Internal AI Subtitle Matcher & Sync',
                      'موتور هوش مصنوعی داخلی همسان‌سازی و تطبیق زیرنویس'
                    )}
                  </h3>
                  <p className="text-[11px] text-[#A3AEC2]">
                    {t(
                      'Matches and synchronizes the exact SRT/WebVTT subtitle track specifically to this film file locally without external AI APIs.',
                      'به‌صورت خودکار و بدون وابستگی خارجی، فایل زیرنویس دقیق مخصوص همین نسخه فیلم را تولید، همسان‌سازی و متصل می‌کند.'
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={handleRunAiSubtitleSync} disabled={aiSyncing}>
                  {aiSyncing ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  <span>
                    {aiSyncing
                      ? t('Analyzing File Cadence...', 'در حال تحلیل و همسان‌سازی...')
                      : aiSyncedSub
                      ? t('Re-Sync with AI', 'همسان‌سازی مجدد AI')
                      : t('Match & Attach Subtitle Now', 'همسان‌سازی و اتصال خودکار زیرنویس')}
                  </span>
                </Button>

                <Button size="sm" variant="secondary" onClick={handleDownloadMatchedSrt}>
                  <FileText className="h-3.5 w-3.5 text-[#F5B942]" />
                  <span>{t('Download .SRT', 'دانلود فایل زیرنویس (.srt)')}</span>
                </Button>
              </div>
            </div>

            {aiSyncedSub && (
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 border-t border-white/10 pt-3 text-xs">
                <div className="md:col-span-5 rounded-xl border border-white/10 bg-[#06070C]/75 p-3 space-y-1">
                  <p className="text-[10px] text-[#8E9BB3]">
                    {t('Matched Film Subtitle File', 'فایل زیرنویس متصل‌شده مخصوص همین فیلم')}
                  </p>
                  <p dir="ltr" className="font-mono-tabular text-[#34D399] truncate font-medium">
                    {aiSyncedSub.matchedFilename}
                  </p>
                  <p className="text-[11px] text-[#A3AEC2]">
                    {aiSyncedSub.detectedFps} · {aiSyncedSub.cues.length} {t('synced cues', 'خط زیرنویس')}
                  </p>
                </div>

                <div className="md:col-span-3 rounded-xl border border-white/10 bg-[#06070C]/75 p-3 space-y-1">
                  <p className="text-[10px] text-[#8E9BB3]">
                    {t('Sync Precision', 'دقت تطبیق با تصویر')}
                  </p>
                  <p dir="ltr" className="text-base font-bold text-[#F5B942] font-mono-tabular">
                    {aiSyncedSub.confidencePct}%
                  </p>
                  <p className="text-[11px] text-[#34D399]">
                    {t('WebVTT Track Attached', 'ترک زیرنویس متصل شد')}
                  </p>
                </div>

                <div className="md:col-span-4 rounded-xl border border-white/10 bg-[#06070C]/75 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-[#8E9BB3]">
                      {t('Time Calibration Offset', 'کالیبراسیون زمان (میلی‌ثانیه)')}
                    </span>
                    <span dir="ltr" className="font-mono-tabular font-semibold text-[#F5F7FA]">
                      {syncOffsetMs > 0 ? `+${syncOffsetMs}` : syncOffsetMs} ms
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5" dir="ltr">
                    <button
                      type="button"
                      onClick={() => setSyncOffsetMs((v) => v - 100)}
                      className="flex-1 min-h-[30px] rounded-lg border border-white/15 bg-white/[0.05] text-[11px] text-white hover:border-[#F5B942] cursor-pointer"
                    >
                      -100ms
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncOffsetMs(aiSyncedSub.autoOffsetMs)}
                      className="flex-1 min-h-[30px] rounded-lg border border-[#34D399]/40 bg-[#34D399]/10 text-[11px] text-[#34D399] cursor-pointer"
                    >
                      AI Auto
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncOffsetMs((v) => v + 100)}
                      className="flex-1 min-h-[30px] rounded-lg border border-white/15 bg-white/[0.05] text-[11px] text-white hover:border-[#F5B942] cursor-pointer"
                    >
                      +100ms
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated IMDb Info, Chapters & Backend Qualities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          key={`${item.id}-info-card`}
          {...getMotionProps(1)}
          className="lg:col-span-7 rounded-[24px] border border-white/10 bg-[#0D101A] p-4 sm:p-5 space-y-3.5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-[#F5F7FA]">{title}</h1>
            {details?.imdb ? (
              <a
                href={details.imdb.imdbUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#F5B942] px-3 py-1 text-xs font-bold text-[#06070C]"
              >
                <span>IMDb</span>
                <Star className="h-3 w-3 fill-current" />
                <span dir="ltr">{details.imdb.imdbRating}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <span className="text-xs text-[#A3AEC2]">
                {category} · {item.quality}
              </span>
            )}
          </div>

          <p className="text-sm text-[#D2DAE8] leading-relaxed">{synopsis}</p>

          {details?.imdb && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#A3AEC2] border-t border-white/10 pt-3">
              <p>
                {t('Director:', 'کارگردان:')} <span className="text-[#F5F7FA]">{t(details.imdb.director)}</span>
              </p>
              <p>
                {t('Cast:', 'بازیگران:')} <span className="text-[#F5F7FA]">{details.imdb.cast.map((c) => t(c)).join(' · ')}</span>
              </p>
              <p>
                {t('Country:', 'کشور:')} <span className="text-[#F5F7FA]">{t(details.imdb.country)}</span>
              </p>
              <p>
                {t('Type:', 'نوع:')} <span className="text-[#F5F7FA]">{t(details.imdb.typeLabel)}</span>
              </p>
            </div>
          )}

          {item.chapters.length > 0 && playbackMode === 'movie' && (
            <div className="flex flex-wrap gap-2 pt-1">
              {item.chapters.map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => setCurrentTime(ch.timeSec)}
                  className="min-h-[36px] rounded-full border border-white/10 bg-[#151A28] px-3 text-xs text-[#F5F7FA] hover:border-[#F5B942]/50 cursor-pointer"
                >
                  <span dir="ltr" className="font-mono-tabular text-[#F5B942] me-1.5">
                    {formatDuration(ch.timeSec)}
                  </span>
                  {t(ch.labelEn, ch.labelFa)}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          key={`${item.id}-qualities-card`}
          {...getMotionProps(2)}
          className="lg:col-span-5 rounded-[24px] border border-white/10 bg-[#0D101A] p-4 sm:p-5 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#F5F7FA] flex items-center gap-2">
              <Cpu className="h-4 w-4 text-[#38BDF8]" />
              <span>{t('Backend Stream Qualities', 'لیست کیفیت‌های دریافتی از بک‌اند')}</span>
            </h2>
            {isDownloaded && downloadRecord && (
              <span dir="ltr" className="text-[11px] font-mono-tabular text-[#34D399]">
                {formatBytes(downloadRecord.fileSizeBytes)}
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            {backendQualities.map((q) => {
              const active = q.id === activeQuality?.id;
              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setSelectedQualityId(q.id)}
                  className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-start text-xs transition-colors cursor-pointer ${
                    active
                      ? 'border-[#F5B942] bg-[#F5B942]/12 text-[#F5F7FA]'
                      : 'border-white/10 bg-[#06070C]/65 text-[#A3AEC2] hover:text-white'
                  }`}
                >
                  <span className="truncate font-medium">
                    <strong className="font-mono-tabular text-[#F5B942] me-1.5">{q.resolution}</strong>
                    {t(q.label)}
                  </span>
                  <span dir="ltr" className="shrink-0 font-mono-tabular text-[11px]">
                    {q.bitrateMbps} Mbps
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-[11px] text-[#8E9BB3] pt-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#F5B942] shrink-0" />
            <span>
              {t(
                'Shortcuts: Space (Play/Pause) · J/L (±10s) · M (Mute) · F (Fullscreen)',
                'کلیدهای میانبر: Space (پخش/توقف) · J/L (±۱۰ ثانیه) · M (صدا) · F (تمام‌صفحه)'
              )}
            </span>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
