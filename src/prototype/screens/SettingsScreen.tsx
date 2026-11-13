import React, { useState } from 'react';
import {
  Accessibility,
  Bell,
  Download,
  Globe2,
  Lock,
  MonitorPlay,
  RotateCcw,
  Shield,
  Sliders,
  Trash2,
  User
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  LanguageCode,
  SettingsTab,
  TasteVector6D,
  UserAccountState
} from '../types';
import { useT } from '../i18n';
import { Button } from '../components/UiPrimitives';

interface SettingsScreenProps {
  lang: LanguageCode;
  user: UserAccountState;
  userVector: TasteVector6D;
  vaultSizeBytes: number;
  onChangeLang: (lang: LanguageCode) => void;
  onOpenLanguagePicker: () => void;
  onUpdateUser: (patch: Partial<UserAccountState>) => void;
  onRevokeSession: (sessionId: string) => void;
  onResetTasteAndHistory: () => void;
  onExportPersonalData: () => void;
  onWipeLocalMemory: () => void;
}

const SETTINGS_TABS: Array<{ id: SettingsTab; fa: string; en: string; icon: React.ReactNode }> = [
  { id: 'account', fa: 'پروفایل و حافظه داخلی', en: 'Local Profile & Memory', icon: <User className="h-3.5 w-3.5" /> },
  { id: 'preferences', fa: 'تنظیمات سلیقه', en: 'Taste Preferences', icon: <Sliders className="h-3.5 w-3.5" /> },
  { id: 'privacy', fa: 'حریم خصوصی و داده‌ها', en: 'Privacy & Data Export', icon: <Shield className="h-3.5 w-3.5" /> },
  { id: 'playback', fa: 'تنظیمات پخش', en: 'Playback Defaults', icon: <MonitorPlay className="h-3.5 w-3.5" /> },
  { id: 'notifications', fa: 'اعلان‌ها', en: 'Notifications', icon: <Bell className="h-3.5 w-3.5" /> },
  { id: 'accessibility', fa: 'زبان و دسترس‌پذیری', en: 'Language & Accessibility', icon: <Accessibility className="h-3.5 w-3.5" /> }
];

const BLOCK_TOPICS = [
  { key: 'fast-paced', fa: 'ریتم تند و اکشن', en: 'Hyper-fast / Action' },
  { key: 'animation', fa: 'انیمیشن', en: 'Animation' },
  { key: 'surreal', fa: 'فضاهای سورئال', en: 'Surreal / Abstract' },
  { key: 'whisper', fa: 'صداهای ASMR', en: 'ASMR / Whisper' },
  { key: 'cyber', fa: 'تم‌های سایبرپانک', en: 'Cyberpunk / Sci-Fi' }
];

const QUICK_LANGUAGES = [
  { code: 'fa', label: 'فارسی' },
  { code: 'en', label: 'English' },
  { code: 'ar', label: 'العربية' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' }
];

export function SettingsScreen({
  lang,
  user,
  userVector,
  vaultSizeBytes,
  onChangeLang,
  onOpenLanguagePicker,
  onUpdateUser,
  onRevokeSession,
  onResetTasteAndHistory,
  onExportPersonalData,
  onWipeLocalMemory
}: SettingsScreenProps) {
  const { t, languageInfo } = useT();
  const [tab, setTab] = useState<SettingsTab>('account');
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-7 pb-12">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#F5F7FA]">
          {t('Settings, Privacy & In-App Memory', 'تنظیمات، حریم خصوصی و حافظه داخل اپلیکیشن')}
        </h1>
        <p className="text-xs sm:text-sm text-[#A3AEC2]">
          {t(
            'All preferences, watch history, favorites, and taste vectors are saved automatically inside the app with zero signup required.',
            'تمام تنظیمات، تاریخچه، علاقه‌مندی‌ها و بردار سلیقه بدون نیاز به ثبت‌نام به‌صورت خودکار داخل برنامه ذخیره می‌شوند.'
          )}
        </p>
      </div>

      {/* Responsive Scrollable Tab Strip with Sliding Highlight */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:flex-wrap">
        {SETTINGS_TABS.map((tabItem) => {
          const active = tab === tabItem.id;
          return (
            <button
              key={tabItem.id}
              type="button"
              onClick={() => setTab(tabItem.id)}
              className={`relative min-h-[40px] shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 rounded-full px-4 text-xs font-medium border cursor-pointer transition-colors ${
                active
                  ? 'border-[#F5B942]/80 text-[#06070C]'
                  : 'border-white/12 bg-[#0D101A] text-[#A3AEC2] hover:text-white'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="settingsActiveTab"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-[#F5B942]"
                />
              )}
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {tabItem.icon}
                <span>{t(tabItem.en, tabItem.fa)}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="rounded-[24px] sm:rounded-[28px] border border-white/12 bg-[#0D101A] p-4 sm:p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            {tab === 'account' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
                  <div className="space-y-2 flex-1 min-w-[220px]">
                    <label className="block text-xs text-[#A3AEC2]">
                      {t('Local Profile Display Name (Auto-Saved)', 'نام دلخواه فضای شخصی شما (ذخیره خودکار)')}
                    </label>
                    <input
                      type="text"
                      value={user.displayName}
                      onChange={(e) => onUpdateUser({ displayName: e.target.value })}
                      className="w-full max-w-sm min-h-[44px] rounded-2xl border border-white/12 bg-[#06070C] px-4 text-base sm:text-sm text-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
                    />
                    <p className="text-xs text-[#A3AEC2]">
                      {t('Zero-login In-App Memory', 'بدون ثبت‌نام و ورود · حافظه اختصاصی دستگاه')} ·{' '}
                      {user.ageVerified
                        ? t('18+ Age Verified', 'سن ۱۸+ تاییدشده')
                        : t('Age Gate Pending', 'در انتظار تایید سن')}
                    </p>
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-[#06070C] px-3 py-1.5 text-xs text-[#A3AEC2]">
                      <Lock className="h-3.5 w-3.5 text-[#F5B942]" />
                      {user.jurisdiction}
                    </span>
                    <span dir="ltr" className="text-[11px] font-mono-tabular text-[#34D399]">
                      In-App Vault: {(vaultSizeBytes / 1024).toFixed(1)} KB (localStorage + IndexedDB)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-[#F5F7FA]">
                    {t('Active In-App Storage Vaults', 'مخزن حافظه داخلی فعال')}
                  </h3>
                  {user.sessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4"
                    >
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-[#F5F7FA]">{s.deviceLabel}</p>
                        <p className="text-[11px] text-[#A3AEC2]">
                          {s.locationLabel} · {s.lastActive}
                        </p>
                      </div>
                      {s.isCurrent ? (
                        <span className="text-xs text-[#34D399]">
                          {t('Active & Synced', 'فعال و همگام')}
                        </span>
                      ) : (
                        <Button variant="danger" size="sm" onClick={() => onRevokeSession(s.id)}>
                          {t('Revoke', 'لغو دسترسی')}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === 'preferences' && (
              <div className="space-y-6">
                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F7FA]">
                      {t('Enable Internal Taste Personalization', 'شخصی‌سازی جهان و موتور سلیقه داخلی')}
                    </p>
                    <p className="text-xs text-[#A3AEC2]">
                      {t(
                        'Turn off anytime to browse unprofiled editorial rankings without taste adaptation.',
                        'در صورت خاموش کردن، هیچ امتیازدهی شخصی‌سازی‌شده اعمال نمی‌شود و چیدمان عمومی نمایش می‌یابد.'
                      )}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={user.personalizationEnabled}
                    onChange={(e) =>
                      onUpdateUser({
                        personalizationEnabled: e.target.checked,
                        consentPersonalization: e.target.checked
                      })
                    }
                    className="h-5 w-5 accent-[#F5B942] cursor-pointer shrink-0"
                  />
                </label>

                <div className="space-y-3">
                  <p className="text-xs font-semibold text-[#A3AEC2]">
                    {t('Live 6D Internal Taste Vector', 'بردار ۶بعدی فعلی سلیقه (محاسبه ۱۰۰٪ محلی)')}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {(Object.keys(userVector) as (keyof TasteVector6D)[]).map((axis) => (
                      <div
                        key={axis}
                        className="rounded-2xl border border-white/10 bg-[#06070C]/60 p-3 space-y-1.5"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize text-[#A3AEC2]">{t(axis)}</span>
                          <span dir="ltr" className="font-mono-tabular text-[#F5B942]">
                            {Math.round(userVector[axis] * 100)}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-[#F5B942] transition-all duration-300"
                            style={{ width: `${Math.round(userVector[axis] * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-[#A3AEC2]">
                    {t('Blocked Topics (Hard Filter)', 'موضوعات حذف‌شده از کل جهان شما')}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_TOPICS.map((topic) => {
                      const blocked = user.blockedTopics.includes(topic.key);
                      return (
                        <button
                          key={topic.key}
                          type="button"
                          onClick={() =>
                            onUpdateUser({
                              blockedTopics: blocked
                                ? user.blockedTopics.filter((x) => x !== topic.key)
                                : [...user.blockedTopics, topic.key]
                            })
                          }
                          className={`min-h-[38px] rounded-full px-4 text-xs border cursor-pointer transition-colors ${
                            blocked
                              ? 'border-[#EF4444]/60 bg-[#EF4444]/15 text-[#FCA5A5]'
                              : 'border-white/12 bg-[#06070C] text-[#A3AEC2] hover:text-white'
                          }`}
                        >
                          {blocked ? '✕ ' : '+ '}
                          {t(topic.en, topic.fa)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <Button variant="danger" size="sm" onClick={onResetTasteAndHistory}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    {t('Reset Taste Model & Watch History', 'بازنشانی کامل سلیقه و تاریخچه تعاملات')}
                  </Button>
                </div>
              </div>
            )}

            {tab === 'privacy' && (
              <div className="space-y-6">
                <div className="space-y-3 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4">
                  <p className="text-sm font-semibold text-[#F5F7FA]">
                    {t('Personalization & Local Privacy', 'حریم خصوصی و شخصی‌سازی محلی')}
                  </p>
                  <label className="flex items-center justify-between gap-4 py-1.5 text-xs text-[#D2DAE8] cursor-pointer">
                    <span>
                      {t('Internal Personalization Engine', 'شخصی‌سازی داخلی جهان محتوا')}
                    </span>
                    <input
                      type="checkbox"
                      checked={user.consentPersonalization}
                      onChange={(e) =>
                        onUpdateUser({
                          consentPersonalization: e.target.checked,
                          personalizationEnabled: e.target.checked
                        })
                      }
                      className="h-4 w-4 accent-[#F5B942]"
                    />
                  </label>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F7FA]">
                      {t('Download Personal Data Archive (JSON)', 'خروجی کامل داده‌های شخصی (JSON Export)')}
                    </p>
                    <p className="text-xs text-[#A3AEC2]">
                      {t(
                        'Download your complete history, favorites, taste vector, and settings as JSON',
                        'دریافت فایل JSON شامل تاریخچه، علاقه‌مندی‌ها، بردار سلیقه و تنظیمات'
                      )}
                    </p>
                  </div>
                  <Button variant="secondary" onClick={onExportPersonalData}>
                    <Download className="h-4 w-4" />
                    {t('Export JSON', 'دانلود JSON')}
                  </Button>
                </div>

                <div className="rounded-2xl border border-[#EF4444]/35 bg-[#EF4444]/10 p-4 space-y-3">
                  <p className="text-sm font-semibold text-[#FCA5A5]">
                    {t('Wipe Local In-App Memory & Reset', 'پاک‌سازی کامل حافظه داخلی اپلیکیشن')}
                  </p>
                  <AnimatePresence mode="wait">
                    {!confirmDelete ? (
                      <motion.div
                        key="wipe-init"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
                          <Trash2 className="h-3.5 w-3.5" />
                          {t('Wipe Saved Memory', 'پاک‌کردن تمام اطلاعات ذخیره‌شده')}
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="wipe-confirm"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setConfirmDelete(false);
                            onWipeLocalMemory();
                          }}
                        >
                          {t('Confirm Permanent Wipe', 'تأیید نهایی: پاک‌سازی حافظه داخلی')}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                          {t('Cancel', 'انصراف')}
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {tab === 'playback' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-[#A3AEC2]">
                    {t('Default Quality', 'کیفیت پیش‌فرض پخش')}
                  </label>
                  <select
                    value={user.preferredQuality}
                    onChange={(e) =>
                      onUpdateUser({ preferredQuality: e.target.value as UserAccountState['preferredQuality'] })
                    }
                    className="w-full min-h-[44px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                  >
                    <option value="auto">Auto (ABR)</option>
                    <option value="4k">4K HDR</option>
                    <option value="1080p">1080p</option>
                    <option value="720p">720p Lite</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#A3AEC2]">
                    {t('Default Subtitles', 'زیرنویس پیش‌فرض')}
                  </label>
                  <select
                    value={user.defaultSubtitleLang}
                    onChange={(e) =>
                      onUpdateUser({
                        defaultSubtitleLang: e.target.value as UserAccountState['defaultSubtitleLang']
                      })
                    }
                    className="w-full min-h-[44px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                  >
                    <option value="fa">فارسی (FA)</option>
                    <option value="en">English (EN)</option>
                    <option value="off">{t('Off', 'خاموش')}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-[#A3AEC2]">
                    {t('Default Speed', 'سرعت پخش پیش‌فرض')}
                  </label>
                  <select
                    value={user.defaultSpeed}
                    onChange={(e) => onUpdateUser({ defaultSpeed: Number(e.target.value) })}
                    className="w-full min-h-[44px] rounded-2xl border border-white/12 bg-[#06070C] px-3 text-base sm:text-xs text-[#F5F7FA]"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x ({t('Normal', 'عادی')})</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                  </select>
                </div>
              </div>
            )}

            {tab === 'notifications' && (
              <div className="space-y-3">
                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <span className="text-sm text-[#F5F7FA]">
                    {t(
                      'In-app alerts for high-match new releases',
                      'اعلان آثار جدید منطبق با سلیقه داخل اپلیکیشن'
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.notificationsEnabled}
                    onChange={(e) => onUpdateUser({ notificationsEnabled: e.target.checked })}
                    className="h-5 w-5 accent-[#F5B942] shrink-0"
                  />
                </label>
                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <span className="text-sm text-[#F5F7FA]">
                    {t('Weekly Universe digest summary', 'خلاصه هفتگی تغییرات جهان شخصی')}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.digestAlertsEnabled}
                    onChange={(e) => onUpdateUser({ digestAlertsEnabled: e.target.checked })}
                    className="h-5 w-5 accent-[#F5B942] shrink-0"
                  />
                </label>
              </div>
            )}

            {tab === 'accessibility' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#F5F7FA]">
                        {t('Global Language & Layout Direction', 'زبان اپلیکیشن و چیدمان راست/چپ')}
                      </p>
                      <p className="text-xs text-[#A3AEC2]">
                        {t('Active language:', 'زبان فعال:')}{' '}
                        <span className="text-[#F5B942] font-semibold">
                          {languageInfo.nativeName} ({languageInfo.dir.toUpperCase()})
                        </span>
                      </p>
                    </div>
                    <Button size="sm" onClick={onOpenLanguagePicker}>
                      <Globe2 className="h-4 w-4" />
                      {t('All 70+ World Languages...', 'همه زبان‌های دنیا (۷۰+ زبان)...')}
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {QUICK_LANGUAGES.map((ql) => (
                      <Button
                        key={ql.code}
                        size="sm"
                        variant={lang.toLowerCase() === ql.code.toLowerCase() ? 'primary' : 'secondary'}
                        onClick={() => onChangeLang(ql.code)}
                      >
                        {ql.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <span className="text-sm text-[#F5F7FA]">
                    {t('Reduced Motion Mode', 'حالت کاهش انیمیشن (Reduced Motion)')}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.reducedMotion}
                    onChange={(e) => onUpdateUser({ reducedMotion: e.target.checked })}
                    className="h-5 w-5 accent-[#F5B942] shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <span className="text-sm text-[#F5F7FA]">
                    {t('High Contrast Focus & Borders', 'کنتراست بالای متون و حاشیه‌ها (High Contrast)')}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.highContrast}
                    onChange={(e) => onUpdateUser({ highContrast: e.target.checked })}
                    className="h-5 w-5 accent-[#F5B942] shrink-0"
                  />
                </label>

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-[#06070C]/65 p-4 cursor-pointer">
                  <span className="text-sm text-[#F5F7FA]">
                    {t('Lite 2D Discovery Universe Mode', 'حالت سبک 2D برای نقشه کاوش (Lite Mode)')}
                  </span>
                  <input
                    type="checkbox"
                    checked={user.liteUniverseMode}
                    onChange={(e) => onUpdateUser({ liteUniverseMode: e.target.checked })}
                    className="h-5 w-5 accent-[#F5B942] shrink-0"
                  />
                </label>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
