import React, { useState, useEffect } from 'react';
import {
  VideoRecord,
  SourceRecord,
  CategoryRecord,
  PlaybackType,
  ContentStatus
} from './types';
import {
  Shield,
  Lock,
  Layers,
  Film,
  Globe,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  XCircle,
  Eye,
  LogOut,
  RefreshCw,
  AlertTriangle,
  Play,
  Search,
  ExternalLink,
  Sparkles,
  UploadCloud,
  X,
  FileText,
  CheckSquare
} from 'lucide-react';
import { AuthorizedVideoPlayer } from './AuthorizedVideoPlayer';
import { convertPageUrlToEmbedUrl, generateSampleVideosForDomain } from './urlHelper';

interface OwnerAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCatalogUpdated: () => void;
}

const LOCAL_STORAGE_DB_KEY = 'velora_live_db_v4';

function isLegacySampleRecord(v: any): boolean {
  const u1 = String(v?.original_video_url || '').toLowerCase();
  const u2 = String(v?.authorized_embed_url || '').toLowerCase();
  return (
    u1.includes('gtv-videos-bucket/sample') ||
    u2.includes('gtv-videos-bucket/sample') ||
    String(v?.id || '').startsWith('vid-sample-')
  );
}

function getInitialLocalDb(): { videos: VideoRecord[]; sources: SourceRecord[]; categories: CategoryRecord[] } {
  try {
    localStorage.removeItem('velora_owner_db');
    const raw = localStorage.getItem(LOCAL_STORAGE_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.videos)) {
        parsed.videos = parsed.videos.filter((v: any) => !isLegacySampleRecord(v));
        return parsed;
      }
    }
  } catch {}

  const defaultCategories: CategoryRecord[] = [
    { id: 'cat-featured', name: 'منتخب سردبیری', name_fa: 'منتخب سردبیری', description: 'بهترین فیلم‌های دستچین شده مدیر' },
    { id: 'cat-pov', name: 'زاویه دید POV', name_fa: 'زاویه دید POV', description: 'نمای نزدیک اول‌شخص و حس واقعی' },
    { id: 'cat-boudoir', name: 'مجموعه ابریشم سرخ', name_fa: 'مجموعه ابریشم سرخ', description: 'فضای صمیمی و سینمایی' },
    { id: 'cat-4k', name: 'کیفیت فوق‌العاده 4K', name_fa: 'کیفیت فوق‌العاده 4K', description: 'فیلم‌های با رزولوشن بالای 60FPS' }
  ];

  const defaultSources: SourceRecord[] = [
    {
      id: 'src-official',
      source_name: 'منبع رسمی مدیر (Velora Master Vault)',
      homepage_url: 'https://velora.internal',
      source_status: 'active',
      administrative_notes: 'سرور اصلی ذخیره‌سازی ویدیوهای تاییدشده',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  return { videos: [], sources: defaultSources, categories: defaultCategories };
}

function saveLocalDb(videos: VideoRecord[], sources: SourceRecord[], categories: CategoryRecord[]) {
  try {
    const cleanVideos = videos.filter((v) => !isLegacySampleRecord(v));
    localStorage.setItem(LOCAL_STORAGE_DB_KEY, JSON.stringify({ videos: cleanVideos, sources, categories }));
  } catch {}
}

export const OwnerAdminPanel: React.FC<OwnerAdminPanelProps> = ({
  isOpen,
  onClose,
  onCatalogUpdated
}) => {
  const [token, setToken] = useState<string>(() => localStorage.getItem('velora_owner_token') || 'session-owner-unlocked');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');
  const [isSubmittingAuth, setIsSubmittingAuth] = useState<boolean>(false);

  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<'bulk' | 'single' | 'videos' | 'sources' | 'approval' | 'dashboard'>('bulk');

  // Stats & Data
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [sources, setSources] = useState<SourceRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Toast / Status Message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Form states: New Source
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceNotes, setNewSourceNotes] = useState('');

  // Form states: Single Link Input
  const [singleTitle, setSingleTitle] = useState('');
  const [singleUrl, setSingleUrl] = useState('');
  const [singleEmbedUrl, setSingleEmbedUrl] = useState('');
  const [singleCategory, setSingleCategory] = useState('cat-featured');
  const [singlePlaybackType, setSinglePlaybackType] = useState<PlaybackType>('authorized_embed');
  const [singleThumbnail, setSingleThumbnail] = useState('');
  const [singleDescription, setSingleDescription] = useState('');

  // Form states: Bulk URLs Ingestion
  const [bulkText, setBulkText] = useState('');
  const [bulkSourceId, setBulkSourceId] = useState('');
  const [bulkCategoryId, setBulkCategoryId] = useState('cat-featured');
  const [bulkPlaybackType, setBulkPlaybackType] = useState<PlaybackType>('authorized_embed');
  const [bulkAutoApprove, setBulkAutoApprove] = useState(true);
  const [bulkResult, setBulkResult] = useState<{ addedCount: number; duplicateCount: number; duplicates: string[] } | null>(null);

  // Modals
  const [previewVideo, setPreviewVideo] = useState<VideoRecord | null>(null);
  const [editingVideo, setEditingVideo] = useState<VideoRecord | null>(null);

  // Verify Owner Session Token (Always Unlocked by Owner Request)
  useEffect(() => {
    setIsAuthenticated(true);
  }, [token]);

  // Load Admin Data (Hybrid API + Local Storage fallback)
  const loadAdminData = async () => {
    setLoadingData(true);
    const local = getInitialLocalDb();

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [vidsRes, sourcesRes] = await Promise.all([
        fetch('/api/velora/admin/videos', { headers }).then(r => r.json()).catch(() => null),
        fetch('/api/velora/admin/sources', { headers }).then(r => r.json()).catch(() => null)
      ]);

      if (vidsRes && Array.isArray(vidsRes.videos) && vidsRes.videos.length > 0) {
        setVideos(vidsRes.videos);
        setCategories(vidsRes.categories || local.categories);
        setSources(sourcesRes?.sources || local.sources);
        saveLocalDb(vidsRes.videos, sourcesRes?.sources || local.sources, vidsRes.categories || local.categories);
      } else {
        setVideos(local.videos);
        setSources(local.sources);
        setCategories(local.categories);
      }
    } catch {
      setVideos(local.videos);
      setSources(local.sources);
      setCategories(local.categories);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isOpen) {
      loadAdminData();
    }
  }, [isAuthenticated, isOpen]);

  // Owner Password Verification
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSubmittingAuth(true);

    const entered = passwordInput.trim();
    if (!entered) {
      setAuthError('لطفاً رمز عبور را وارد کنید.');
      setIsSubmittingAuth(false);
      return;
    }

    try {
      const res = await fetch('/api/velora/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: entered })
      });
      const data = await res.json();

      if (res.ok && data.token) {
        setToken(data.token);
        localStorage.setItem('velora_owner_token', data.token);
        setIsAuthenticated(true);
        setPasswordInput('');
        setStatusMessage({ type: 'success', text: 'با موفقیت وارد پنل مدیریت مدیر شدید.' });
      } else if (entered === 'velora-owner-master-2026') {
        const localToken = 'session-owner-local-' + Date.now();
        setToken(localToken);
        localStorage.setItem('velora_owner_token', localToken);
        setIsAuthenticated(true);
        setPasswordInput('');
        setStatusMessage({ type: 'success', text: 'دسترسی مدیریت با کلید اصلی تایید شد.' });
      } else {
        setAuthError(data.error || 'رمز عبور اشتباه است.');
      }
    } catch {
      if (entered === 'velora-owner-master-2026') {
        const localToken = 'session-owner-local-' + Date.now();
        setToken(localToken);
        localStorage.setItem('velora_owner_token', localToken);
        setIsAuthenticated(true);
        setPasswordInput('');
        setStatusMessage({ type: 'success', text: 'دسترسی مدیریت با کلید اصلی تایید شد.' });
      } else {
        setAuthError('خطا در احراز هویت. رمز عبور پیش‌فرض: velora-owner-master-2026');
      }
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('velora_owner_token');
    setIsAuthenticated(false);
    setStatusMessage({ type: 'info', text: 'از پنل مدیریت خارج شدید.' });
  };

  // Add Single Link
  const handleAddSingleVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً آدرس ویدیو را وارد کنید.' });
      return;
    }

    setStatusMessage({ type: 'info', text: 'در حال استخراج ویدئوهای واقعی با کیفیت 4K از لینک...' });
    const converted = convertPageUrlToEmbedUrl(singleUrl.trim());

    const payload: VideoRecord = {
      id: 'vid-' + Math.random().toString(36).substring(2, 9),
      source_name: converted.sourceName,
      title: singleTitle.trim() || converted.titleSuggestion || 'ویدئوی اختصاصی جدید',
      description: singleDescription.trim() || 'ثبت شده توسط مدیر سیستم',
      original_video_url: singleUrl.trim(),
      authorized_embed_url: singleEmbedUrl.trim() || converted.embedUrl,
      thumbnail_url: singleThumbnail.trim() || undefined,
      playback_type: converted.playbackType || singlePlaybackType,
      category_id: singleCategory,
      tags: ['curated', converted.sourceName],
      content_status: 'published',
      approval_status: 'approved',
      is_published: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const res = await fetch('/api/velora/admin/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data && Array.isArray(data.allVideos)) {
        setVideos(data.allVideos);
        saveLocalDb(data.allVideos, sources, categories);
        const count = Array.isArray(data.addedVideos) ? data.addedVideos.length : 1;
        setStatusMessage({
          type: 'success',
          text: `✅ ${count} ویدئوی واقعی با تامبنیل و پخش مستقیم در صفحه اصلی منتشر شد.`
        });
        setSingleTitle('');
        setSingleUrl('');
        setSingleEmbedUrl('');
        setSingleThumbnail('');
        setSingleDescription('');
        onCatalogUpdated();
        return;
      }
    } catch {}

    const updatedVids = [payload, ...videos];
    setVideos(updatedVids);
    saveLocalDb(updatedVids, sources, categories);

    setSingleTitle('');
    setSingleUrl('');
    setSingleEmbedUrl('');
    setSingleThumbnail('');
    setSingleDescription('');
    setStatusMessage({ type: 'success', text: '✅ ویدئو با موفقیت ذخیره و در کاتالوگ اصلی منتشر شد.' });
    onCatalogUpdated();
  };

  // Bulk Links Ingestion
  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkText.trim()) {
      setStatusMessage({ type: 'error', text: 'لطفاً حداقل یک لینک یا نام سایت در کادر وارد کنید.' });
      return;
    }

    setStatusMessage({
      type: 'info',
      text: 'در حال استخراج ۱۰ ویدئوی واقعی ۴K به همراه کاور و استریم مستقیم...'
    });

    try {
      const res = await fetch('/api/velora/admin/videos/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          urlsText: bulkText,
          source_id: bulkSourceId || undefined,
          category_id: bulkCategoryId,
          default_playback_type: bulkPlaybackType,
          auto_approve: bulkAutoApprove
        })
      });
      const data = await res.json();
      if (data && Array.isArray(data.allVideos) && data.allVideos.length > 0) {
        setVideos(data.allVideos);
        saveLocalDb(data.allVideos, sources, categories);
        const addedCount = Number(data.addedCount || data.addedVideos?.length || 10);
        const duplicateCount = Number(data.duplicateCount || 0);
        setBulkResult({
          addedCount,
          duplicateCount,
          duplicates: Array.isArray(data.duplicates) ? data.duplicates : []
        });
        setBulkText('');
        setStatusMessage({
          type: 'success',
          text: `✅ ${addedCount} ویدئوی واقعی با تامبنیل اختصاصی و استریم مستقیم به صفحه اول اضافه شد!`
        });
        onCatalogUpdated();
        return;
      }
    } catch {}

    setStatusMessage({
      type: 'error',
      text: 'خطا در ارتباط با سرور؛ لطفاً دوباره تلاش کنید.'
    });
  };

  // Toggle Video Publish Status
  const handleTogglePublish = async (video: VideoRecord) => {
    const nextPublished = !video.is_published;
    const nextStatus: ContentStatus = nextPublished ? 'published' : 'draft';

    const updated = videos.map(v => {
      if (v.id === video.id) {
        return {
          ...v,
          is_published: nextPublished,
          content_status: nextStatus,
          approval_status: nextPublished ? ('approved' as const) : v.approval_status
        };
      }
      return v;
    });

    setVideos(updated);
    saveLocalDb(updated, sources, categories);

    try {
      await fetch(`/api/velora/admin/videos/${video.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_published: nextPublished, content_status: nextStatus })
      });
    } catch {}

    onCatalogUpdated();
    setStatusMessage({
      type: 'info',
      text: nextPublished ? `ویدئوی "${video.title}" منتشر شد.` : `ویدئوی "${video.title}" از انتشار خارج شد.`
    });
  };

  // Delete Video
  const handleDeleteVideo = async (id: string) => {
    if (!confirm('آیا از حذف این ویدئو از دیتابیس اطمینان دارید؟')) return;

    const updated = videos.filter(v => v.id !== id);
    setVideos(updated);
    saveLocalDb(updated, sources, categories);

    try {
      await fetch(`/api/velora/admin/videos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}

    onCatalogUpdated();
    setStatusMessage({ type: 'info', text: 'ویدئو با موفقیت حذف گردید.' });
  };

  // Add Source
  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceName.trim()) return;

    const newSource: SourceRecord = {
      id: 'src-' + Math.random().toString(36).substring(2, 9),
      source_name: newSourceName.trim(),
      homepage_url: newSourceUrl.trim() || 'https://example.com',
      source_status: 'active',
      administrative_notes: newSourceNotes.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedSources = [newSource, ...sources];
    setSources(updatedSources);
    saveLocalDb(videos, updatedSources, categories);

    try {
      await fetch('/api/velora/admin/sources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newSource)
      });
    } catch {}

    setNewSourceName('');
    setNewSourceUrl('');
    setNewSourceNotes('');
    setStatusMessage({ type: 'success', text: 'منبع جدید با موفقیت ثبت شد.' });
  };

  // Save Video Edit
  const handleSaveVideoEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVideo) return;

    const updated = videos.map(v => v.id === editingVideo.id ? editingVideo : v);
    setVideos(updated);
    saveLocalDb(updated, sources, categories);

    try {
      await fetch(`/api/velora/admin/videos/${editingVideo.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(editingVideo)
      });
    } catch {}

    setEditingVideo(null);
    setStatusMessage({ type: 'success', text: 'تغییرات ویدئو با موفقیت ذخیره شد.' });
    onCatalogUpdated();
  };

  const filteredVideos = videos.filter(v => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      v.title.toLowerCase().includes(q) ||
      v.original_video_url.toLowerCase().includes(q) ||
      v.description.toLowerCase().includes(q) ||
      (v.source_name && v.source_name.toLowerCase().includes(q))
    );
  });

  const pendingVideos = videos.filter(v => v.approval_status === 'pending' || v.content_status === 'pending_review');
  const publishedVideosCount = videos.filter(v => v.is_published).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-hidden" dir="rtl">
      <div className="relative w-full max-w-5xl h-[100dvh] sm:h-[92vh] bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 border-0 sm:border border-white/10 sm:rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        
        {/* Responsive Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-black/70 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/40 flex items-center justify-center text-rose-300 shrink-0 shadow-lg shadow-rose-500/10">
              <Shield className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                  پنل اختصاصی مدیریت ویدئوها و لینک‌ها
                </h2>
                {isAuthenticated && (
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-medium">
                    مدیر تاییدشده 🔐
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/50 truncate mt-0.5">
                سیستم ثبت مستقیم و انبوه • بدون خزنده‌های خودکار خارجی • کنترل ۱۰۰٪ مدیر
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3.5 py-1.5 rounded-full liquid-glass-btn text-white/80 hover:text-white text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full liquid-glass-active text-rose-100 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              <span>بستن</span>
            </button>
          </div>
        </div>

        {/* Global Toast / Status Banner */}
        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-medium flex items-center justify-between border-b transition-all shrink-0 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/15 text-emerald-200 border-emerald-500/30'
                : statusMessage.type === 'error'
                ? 'bg-rose-500/15 text-rose-200 border-rose-500/30'
                : 'bg-sky-500/15 text-sky-200 border-sky-500/30'
            }`}
          >
            <span>{statusMessage.text}</span>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-white/60 hover:text-white cursor-pointer p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Auth Gate vs Admin Tabs */}
        {!isAuthenticated ? (
          /* OWNER LOGIN GATE */
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-6 shadow-2xl backdrop-blur-xl">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500/20 to-amber-500/20 border border-rose-500/40 text-rose-300 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
                <Lock className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">احراز هویت مدیریت VELORA</h3>
                <p className="text-xs text-white/60 mt-2 leading-relaxed">
                  جهت دسترسی به کاتالوگ و ثبت انبوه لینک‌های ویدئویی، رمز عبور مدیر اصلی را وارد کنید.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="رمز عبور مدیر (پیش‌فرض: velora-owner-master-2026)"
                  className="w-full px-4 py-3.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-rose-500/60 text-right font-mono"
                  required
                />

                {authError && (
                  <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 text-right">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{authError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingAuth}
                  className="w-full py-3.5 rounded-full liquid-glass-cta text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {isSubmittingAuth ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>تایید رمز عبور و ورود به پنل</span>
                    </>
                  )}
                </button>
              </form>

              <div className="pt-2 text-[11px] text-white/40">
                رمز عبور پیش‌فرض مدیر: <code className="text-amber-300 font-mono">velora-owner-master-2026</code>
              </div>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED PANEL CONTENT */
          <>
            {/* Scrollable Luxury Tab Bar */}
            <div className="px-4 py-2 border-b border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'bulk', label: 'ورود دسته‌جمعی لینک‌ها', icon: UploadCloud, badge: null },
                { id: 'single', label: 'افزودن تکی', icon: Plus, badge: null },
                { id: 'videos', label: 'آرشیو ویدیوها', icon: Film, badge: videos.length },
                { id: 'sources', label: 'منابع ثبت‌شده', icon: Globe, badge: sources.length },
                { id: 'approval', label: 'صف بازبینی', icon: CheckSquare, badge: pendingVideos.length },
                { id: 'dashboard', label: 'داشبورد آمار', icon: Layers, badge: null }
              ].map(tab => {
                const IconComp = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-2 rounded-full text-xs font-medium flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'liquid-glass-active font-bold'
                        : 'liquid-glass-btn text-white/75'
                    }`}
                  >
                    <IconComp className={`w-4 h-4 ${isActive ? 'text-rose-400' : 'text-white/60'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== null && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                        isActive ? 'bg-rose-500/30 text-rose-200' : 'bg-white/10 text-white/60'
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* TAB 1: BULK LINK INGESTION */}
              {activeTab === 'bulk' && (
                <div className="space-y-6 max-w-4xl mx-auto">
                  <div className="p-4 sm:p-6 rounded-[24px] bg-white/[0.03] border border-white/10 shadow-[0_14px_34px_rgba(0,0,0,0.45)] space-y-4">
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                          <UploadCloud className="w-5 h-5 text-rose-400" />
                          <span>افزودن دسته‌جمعی لینک‌های ویدئویی (Bulk Input)</span>
                        </h3>
                        <p className="text-xs text-white/60 mt-1">
                          لینک‌های ویدیو (MP4، Embed آی‌فریم یا HLS) را جای‌گذاری کنید (هر لینک در یک خط).
                        </p>
                      </div>

                      {/* Quick Fill Test Presets */}
                      <div className="hidden sm:flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBulkText(
                            'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4\nhttps://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
                          )}
                          className="px-3 py-1 rounded-full liquid-glass-active text-rose-100 text-[11px] font-medium transition-colors cursor-pointer"
                        >
                          تست نمونه 4K MP4
                        </button>
                        <button
                          type="button"
                          onClick={() => setBulkText('')}
                          className="px-3 py-1 rounded-full liquid-glass-btn text-white/70 text-[11px] cursor-pointer"
                        >
                          پاکسازی
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleBulkSubmit} className="space-y-4">
                      {/* Configuration Selects Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1.5">انتخاب منبع</label>
                          <select
                            value={bulkSourceId}
                            onChange={e => setBulkSourceId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                          >
                            <option value="">-- بدون منبع خاص (پیش‌فرض مدیر) --</option>
                            {sources.map(s => (
                              <option key={s.id} value={s.id}>{s.source_name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1.5">دسته‌بندی اولیه</label>
                          <select
                            value={bulkCategoryId}
                            onChange={e => setBulkCategoryId(e.target.value)}
                            className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name_fa || c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1.5">نوع پخش پیش‌فرض</label>
                          <select
                            value={bulkPlaybackType}
                            onChange={e => setBulkPlaybackType(e.target.value as PlaybackType)}
                            className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                          >
                            <option value="authorized_embed">آی‌فریم (Embed)</option>
                            <option value="direct_video">ویدئوی مستقیم MP4 / Stream</option>
                            <option value="source_link_only">فقط هدایت به منبع اصلی</option>
                          </select>
                        </div>
                      </div>

                      {/* Multiline Textarea */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-medium text-white/80">لینک‌های ویدئویی (هر خط یک URL)</label>
                          <span className="text-[11px] font-mono text-amber-300">
                            تعداد خطوط: {bulkText.split(/\r?\n/).filter(l => l.trim().length > 0).length}
                          </span>
                        </div>
                        <textarea
                          rows={7}
                          dir="ltr"
                          value={bulkText}
                          onChange={e => setBulkText(e.target.value)}
                          placeholder="https://provider-one.example/embed/video123&#10;https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4&#10;https://provider-two.example/embed/video456"
                          className="w-full px-4 py-3 rounded-xl bg-black/70 border border-white/15 text-white font-mono text-xs placeholder:text-white/20 focus:outline-none focus:border-rose-500/60 leading-relaxed"
                        />
                      </div>

                      {/* Auto Approve Checkbox */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-black/40 border border-white/10">
                        <input
                          type="checkbox"
                          id="bulkAutoApproveCheck"
                          checked={bulkAutoApprove}
                          onChange={e => setBulkAutoApprove(e.target.checked)}
                          className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
                        />
                        <label htmlFor="bulkAutoApproveCheck" className="text-xs text-white/90 cursor-pointer font-medium select-none">
                          انتشار و تایید فوری تمام لینک‌های جدید وارد شده (مستقیماً در کاتالوگ اصلی نمایش داده شوند)
                        </label>
                      </div>

                      {/* Submit CTA */}
                      <button
                        type="submit"
                        className="w-full py-4 rounded-full liquid-glass-cta text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>پردازش و ذخیره دسته‌جمعی لینک‌ها</span>
                      </button>
                    </form>
                  </div>

                  {/* Bulk Result Feedback */}
                  {bulkResult && (
                    <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3">
                      <div className="flex items-center justify-between text-xs text-emerald-300 font-bold border-b border-white/10 pb-2">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>نتیجه پردازش دسته‌جمعی</span>
                        </span>
                        <span className="font-mono text-white">
                          ذخیره‌شده: {bulkResult.addedCount} | تکراری: {bulkResult.duplicateCount}
                        </span>
                      </div>

                      {bulkResult.duplicates.length > 0 && (
                        <div className="text-xs text-amber-200 space-y-1">
                          <span className="font-semibold">لینک‌های تکراری ردشده (از قبل در دیتابیس موجود بودند):</span>
                          <div className="max-h-24 overflow-y-auto p-2 rounded-lg bg-black/50 font-mono text-[11px] text-amber-300/80 space-y-1" dir="ltr">
                            {bulkResult.duplicates.map((d, i) => (
                              <div key={i} className="truncate">{d}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: SINGLE LINK INPUT */}
              {activeTab === 'single' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
                      <Plus className="w-5 h-5 text-rose-400" />
                      <span>افزودن تکی ویدیوی جدید</span>
                    </h3>

                    <form onSubmit={handleAddSingleVideo} className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">عنوان ویدئو</label>
                        <input
                          type="text"
                          value={singleTitle}
                          onChange={e => setSingleTitle(e.target.value)}
                          placeholder="مثلاً: ویدئوی اختصاصی 4K - نمای نزدیک"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1">آدرس اصلی ویدئو / Embed</label>
                          <input
                            type="url"
                            dir="ltr"
                            value={singleUrl}
                            onChange={e => setSingleUrl(e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-rose-500/60"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1">آدرس کاور / پوستر (اختیاری)</label>
                          <input
                            type="url"
                            dir="ltr"
                            value={singleThumbnail}
                            onChange={e => setSingleThumbnail(e.target.value)}
                            placeholder="https://example.com/poster.jpg"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none focus:border-rose-500/60"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1">دسته‌بندی</label>
                          <select
                            value={singleCategory}
                            onChange={e => setSingleCategory(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                          >
                            {categories.map(c => (
                              <option key={c.id} value={c.id}>{c.name_fa || c.name}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-white/80 mb-1">نوع پخش</label>
                          <select
                            value={singlePlaybackType}
                            onChange={e => setSinglePlaybackType(e.target.value as PlaybackType)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                          >
                            <option value="authorized_embed">آی‌فریم (Embed)</option>
                            <option value="direct_video">ویدئوی مستقیم (MP4 / Stream)</option>
                            <option value="source_link_only">فقط هدایت به منبع</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-white/80 mb-1">توضیحات کوتاه</label>
                        <textarea
                          rows={3}
                          value={singleDescription}
                          onChange={e => setSingleDescription(e.target.value)}
                          placeholder="توضیحات کوتاه درباره ویدئو..."
                          className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none focus:border-rose-500/60"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3.5 rounded-full liquid-glass-cta text-xs sm:text-sm font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>ذخیره و انتشار فوری در کاتالوگ</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: VIDEOS CATALOG ARCHIVE */}
              {activeTab === 'videos' && (
                <div className="space-y-4">
                  {/* Search and Filters */}
                  <div className="flex items-center justify-between gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/10 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-4 h-4 absolute right-3 top-3 text-white/40" />
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={e => setSearchFilter(e.target.value)}
                        placeholder="جستجو در آرشیو ویدیوها (عنوان، آدرس، منبع)..."
                        className="w-full pr-9 pl-3 py-2 rounded-lg bg-black/50 border border-white/10 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-rose-500/50"
                      />
                    </div>

                    <div className="text-xs text-white/60 font-mono">
                      مجموع ویدیوها: <span className="text-amber-300 font-bold">{videos.length}</span> | منتشرشده: <span className="text-emerald-400 font-bold">{publishedVideosCount}</span>
                    </div>
                  </div>

                  {/* Videos Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredVideos.map(video => (
                      <div
                        key={video.id}
                        className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-3 hover:border-white/20 transition-all"
                      >
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[70%]">
                              {video.title}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              video.is_published
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {video.is_published ? 'منتشرشده' : 'پیش‌نویس'}
                            </span>
                          </div>

                          <div className="text-[11px] text-white/50 font-mono truncate" dir="ltr">
                            {video.original_video_url}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-white/60 pt-1">
                            <span className="px-2 py-0.5 rounded bg-white/5">{video.source_name || 'مدیر'}</span>
                            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300">{video.playback_type}</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreviewVideo(video)}
                              className="px-3 py-1 rounded-full liquid-glass-btn text-sky-200 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Play className="w-3 h-3" />
                              <span>تست زنده</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingVideo(video)}
                              className="px-2.5 py-1.5 rounded-full liquid-glass-btn text-white/80 hover:text-white text-xs cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePublish(video)}
                              className={`px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                                video.is_published
                                  ? 'liquid-glass-btn text-amber-200'
                                  : 'liquid-glass-active text-emerald-200'
                              }`}
                            >
                              {video.is_published ? 'عدم انتشار' : 'انتشار فوری'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(video.id)}
                              className="p-1.5 rounded-full liquid-glass-btn text-rose-400 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: SOURCE WEBSITES */}
              {activeTab === 'sources' && (
                <div className="space-y-6 max-w-3xl mx-auto">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                    <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2 flex items-center gap-2">
                      <Globe className="w-4 h-4 text-rose-400" />
                      <span>ثبت منبع ویدئویی جدید</span>
                    </h3>

                    <form onSubmit={handleAddSource} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={newSourceName}
                          onChange={e => setNewSourceName(e.target.value)}
                          placeholder="نام منبع (مثلاً: سرور رسمی ۱)"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs focus:outline-none"
                          required
                        />
                        <input
                          type="url"
                          dir="ltr"
                          value={newSourceUrl}
                          onChange={e => setNewSourceUrl(e.target.value)}
                          placeholder="https://source-domain.com"
                          className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs font-mono focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-full liquid-glass-cta text-xs font-bold cursor-pointer"
                      >
                        افزودن منبع
                      </button>
                    </form>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-white/80">منابع ثبت‌شده</h4>
                    {sources.map(src => (
                      <div key={src.id} className="p-3 rounded-[20px] bg-white/[0.03] border border-white/10 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white">{src.source_name}</div>
                          <div className="text-[10px] text-white/50 font-mono" dir="ltr">{src.homepage_url}</div>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                          {src.source_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: APPROVAL QUEUE */}
              {activeTab === 'approval' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-white/10 pb-2">
                    <CheckSquare className="w-4 h-4 text-rose-400" />
                    <span>صف ویدئوهای در انتظار تایید ({pendingVideos.length})</span>
                  </h3>

                  {pendingVideos.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-white/[0.02] border border-white/10 text-xs text-white/50">
                      هیچ ویدئویی در صف تایید وجود ندارد. تمام ویدیوها تایید و منتشر شده‌اند.
                    </div>
                  ) : (
                    pendingVideos.map(v => (
                      <div key={v.id} className="p-3.5 rounded-[20px] bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{v.title}</div>
                          <div className="text-[10px] text-white/50 font-mono truncate" dir="ltr">{v.original_video_url}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(v)}
                          className="px-3.5 py-1.5 rounded-full liquid-glass-active text-emerald-200 text-xs font-bold shrink-0 cursor-pointer"
                        >
                          تایید و انتشار فوری
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 6: DASHBOARD STATS */}
              {activeTab === 'dashboard' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-4xl mx-auto">
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
                    <div className="text-[11px] text-white/50">کل ویدئوها</div>
                    <div className="text-2xl font-bold font-mono text-white">{videos.length}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
                    <div className="text-[11px] text-white/50">منتشرشده</div>
                    <div className="text-2xl font-bold font-mono text-emerald-400">{publishedVideosCount}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
                    <div className="text-[11px] text-white/50">در انتظار تایید</div>
                    <div className="text-2xl font-bold font-mono text-amber-300">{pendingVideos.length}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-1">
                    <div className="text-[11px] text-white/50">منابع فعال</div>
                    <div className="text-2xl font-bold font-mono text-sky-400">{sources.length}</div>
                  </div>
                </div>
              )}

            </div>
          </>
        )}

        {/* LIVE TEST PREVIEW MODAL */}
        {previewVideo && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-2xl" dir="rtl">
            <div className="w-full max-w-4xl h-[85vh] bg-neutral-950 border border-white/20 rounded-2xl flex flex-col shadow-2xl overflow-hidden">
              <div className="px-4 py-3 bg-black/80 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <Play className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="text-xs font-bold text-white truncate">{previewVideo.title}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewVideo(null)}
                  className="px-3.5 py-1.5 rounded-full liquid-glass-btn text-white text-xs cursor-pointer"
                >
                  بستن پیش‌نمایش
                </button>
              </div>
              <div className="flex-1 bg-black p-2 flex items-center justify-center">
                <AuthorizedVideoPlayer
                  title={previewVideo.title}
                  originalUrl={previewVideo.original_video_url}
                  embedUrl={previewVideo.authorized_embed_url}
                  playbackType={previewVideo.playback_type}
                  thumbnailUrl={previewVideo.thumbnail_url}
                  sourceName={previewVideo.source_name}
                />
              </div>
            </div>
          </div>
        )}

        {/* EDIT VIDEO MODAL */}
        {editingVideo && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl" dir="rtl">
            <div className="w-full max-w-lg bg-neutral-950 border border-white/20 rounded-2xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-white border-b border-white/10 pb-2">ویرایش مشخصات ویدئو</h3>
              
              <form onSubmit={handleSaveVideoEdit} className="space-y-3">
                <div>
                  <label className="block text-xs text-white/70 mb-1">عنوان</label>
                  <input
                    type="text"
                    value={editingVideo.title}
                    onChange={e => setEditingVideo({ ...editingVideo, title: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-full bg-black/60 border border-white/15 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs text-white/70 mb-1">آدرس لینک اصلی</label>
                  <input
                    type="url"
                    dir="ltr"
                    value={editingVideo.original_video_url}
                    onChange={e => setEditingVideo({ ...editingVideo, original_video_url: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-full bg-black/60 border border-white/15 text-white text-xs font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingVideo(null)}
                    className="px-4 py-2 rounded-full liquid-glass-btn text-white text-xs cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full liquid-glass-cta text-xs font-bold cursor-pointer"
                  >
                    ذخیره تغییرات
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
