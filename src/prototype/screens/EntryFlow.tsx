import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Compass,
  Globe2,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { LanguageCode, PrototypeRoute, UserAccountState } from '../types';
import { useT } from '../i18n';
import { Button, TextInput } from '../components/UiPrimitives';

interface EntryFlowProps {
  route: Extract<PrototypeRoute, 'splash' | 'welcome' | 'age-gate' | 'onboarding'>;
  lang: LanguageCode;
  user: UserAccountState;
  onOpenLanguagePicker: () => void;
  onNavigate: (route: PrototypeRoute) => void;
  onUpdateUser: (patch: Partial<UserAccountState>) => void;
  onApplyOnboardingPresets: (presets: string[], blockedTopics: string[]) => void;
  onQuickEnterUniverse: () => void;
}

const VIBE_PRESETS = [
  {
    id: 'noir',
    titleFa: 'سایه‌های نوار و باران',
    titleEn: 'Noir Shadows & Rain',
    descFa: 'معمایی، ریتم آهسته، نور کهربایی در تاریکی شب',
    descEn: 'Slow-burn detective moods, rain & amber low-key lighting'
  },
  {
    id: 'velvet',
    titleFa: 'سینمای مخملی و صمیمی',
    titleEn: 'Velvet Intimate Drama',
    descFa: 'دیالوگ‌محور، قاب‌های کلوزآپ و اتمسفر گرم',
    descEn: 'Character-driven chamber stories with warm tactile framing'
  },
  {
    id: 'neon',
    titleFa: 'آینده نئونی و انیمیشن',
    titleEn: 'Neon Futures & Animation',
    descFa: 'ریتم سریع، سایبرپانک توکیویی و انیمیشن‌های بزرگسال',
    descEn: 'Kinetic Tokyo nightscapes and high-craft adult animation'
  },
  {
    id: 'surreal',
    titleFa: 'هنر سورئال و تجربی',
    titleEn: 'Surreal Visual Worlds',
    descFa: 'معماری غیرخطی، رویاپردازی بصری و زمان معلق',
    descEn: 'Architectural dreamscapes and experimental sensory cinema'
  },
  {
    id: 'sound',
    titleFa: 'صدا و ریتم نیمه‌شب',
    titleEn: 'Midnight Sound & ASMR',
    descFa: 'طراحی صدای باینورال، تنش پایین و آرامش عمیق شبانه',
    descEn: 'Binaural acoustic journeys designed for late-night calm'
  }
];

const TOPIC_AVOID_OPTIONS = [
  { key: 'fast-paced', fa: 'ریتم خیلی سریع / اکشن', en: 'Hyper-fast / Action' },
  { key: 'animation', fa: 'انیمیشن', en: 'Animation' },
  { key: 'surreal', fa: 'فضاهای سورئال', en: 'Surreal / Abstract' },
  { key: 'whisper', fa: 'صداهای ASMR', en: 'ASMR / Whisper' },
  { key: 'cyber', fa: 'تم‌های سایبری', en: 'Cyber / Sci-Fi' }
];

export function EntryFlow({
  route,
  user,
  onOpenLanguagePicker,
  onNavigate,
  onUpdateUser,
  onApplyOnboardingPresets,
  onQuickEnterUniverse
}: EntryFlowProps) {
  const { dir, languageInfo, t } = useT();
  const [birthYear, setBirthYear] = useState('1996');
  const [attestLegalAge, setAttestLegalAge] = useState(true);
  const [ageError, setAgeError] = useState('');
  const [underageLocked, setUnderageLocked] = useState(false);

  const [selectedVibes, setSelectedVibes] = useState<string[]>(['noir', 'velvet']);
  const [blockedChoices, setBlockedChoices] = useState<string[]>(user.blockedTopics);

  useEffect(() => {
    if (route !== 'splash') return;
    const timer = window.setTimeout(() => {
      onNavigate('welcome');
    }, 900);
    return () => window.clearTimeout(timer);
  }, [route, onNavigate]);

  const ForwardIcon = dir === 'rtl' ? ArrowLeft : ArrowRight;

  if (route === 'splash') {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#06070C] px-6 text-center">
        <div className="h-14 w-14 rounded-full border border-[#F5B942]/40 bg-[#F5B942]/10 flex items-center justify-center mb-6">
          <Sparkles className="h-6 w-6 text-[#F5B942]" />
        </div>
        <h1 className="font-editorial text-3xl sm:text-5xl tracking-[0.22em] text-[#F5B942]">
          PERSONAL ENTERTAINMENT UNIVERSE
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-[#A3AEC2]">
          {t('Initializing your personalized digital universe...', 'آماده‌سازی جهان دیجیتال شخصی شما...')}
        </p>
        <div className="mt-8 flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('welcome')}>
            {t('Enter Now', 'ورود فوری')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#06070C] text-[#F5F7FA] flex flex-col">
      {/* Compact Entry Header */}
      <header className="w-full max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onNavigate('welcome')}
          className="min-h-[44px] text-start cursor-pointer"
        >
          <span className="font-editorial text-xl sm:text-2xl tracking-[0.18em] text-[#F5B942]">
            AETHER UNIVERSE
          </span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenLanguagePicker}
            className="liquid-glass-pill min-h-[40px] px-3.5 inline-flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
          >
            <Globe2 className="h-3.5 w-3.5 text-[#F5B942]" />
            <span>{languageInfo.nativeName}</span>
          </button>
          <Button variant="ghost" size="sm" onClick={onQuickEnterUniverse}>
            {t('Enter App', 'ورود سریع به برنامه')}
          </Button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={route}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full flex justify-center"
          >
            {route === 'welcome' && (
              <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <p className="text-xs font-medium tracking-wider text-[#F5B942]">
                    {t(
                      'PRIVATE PERSONALIZED STREAMING · TRANSPARENT INTERNAL DISCOVERY',
                      'تجربه شخصی و هوشمند استریم · شفاف و خصوصی'
                    )}
                  </p>
                  <h1 className="text-3xl sm:text-5xl font-bold leading-tight text-[#F5F7FA]">
                    {t(
                      'Cinema that maps to your taste before you even type a query.',
                      'سینمایی که پیش از جست‌وجو، حال‌وهوای شما را می‌شناسد.'
                    )}
                  </h1>
                  <p className="text-sm sm:text-base text-[#A3AEC2] leading-relaxed max-w-2xl">
                    {t(
                      'Your Personal Entertainment Universe runs an independent internal taste engine, spatial 3D content discovery, and offline downloads stored directly inside the app.',
                      'جهان شخصی شما با موتور هوشمند داخلی، سلیقه بصری، ریتم و موضوعات مطلوبتان را تحلیل می‌کند و همراه با دانلود آفلاین و حافظه داخلی کامل همیشه همراه شماست.'
                    )}
                  </p>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button size="lg" onClick={() => onNavigate('age-gate')}>
                      <span>{t('Begin & Verify Eligibility', 'شروع و تأیید قوانین دسترسی')}</span>
                      <ForwardIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="secondary" size="lg" onClick={onQuickEnterUniverse}>
                      {t('Enter Universe Now', 'ورود فوری به جهان شخصی')}
                    </Button>
                  </div>
                </div>

                <div className="lg:col-span-5 rounded-[28px] border border-white/12 bg-[#0D101A] p-6 space-y-5">
                  <h2 className="text-sm font-semibold text-[#F5F7FA]">
                    {t('Instant Zero-Signup Entry', 'شروع سریع بدون ثبت‌نام')}
                  </h2>
                  <ol className="space-y-3 text-xs text-[#A3AEC2]">
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center font-mono-tabular shrink-0">
                        1
                      </span>
                      <span>
                        {t(
                          'Jurisdiction-aware Age Verification & Privacy Consent (no account or email needed)',
                          'تأیید سن متناسب با استاندارد قانونی و تنظیم حریم خصوصی (بدون ساخت حساب یا ایمیل)'
                        )}
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="h-6 w-6 rounded-full bg-[#F5B942]/15 text-[#F5B942] flex items-center justify-center font-mono-tabular shrink-0">
                        2
                      </span>
                      <span>
                        {t(
                          'Visual Mood Calibration with automatic in-app persistent memory & offline downloads',
                          'کالیبراسیون بصری سلیقه، دانلود آفلاین و ذخیره خودکار تمام اطلاعات در حافظه داخلی اپلیکیشن'
                        )}
                      </span>
                    </li>
                  </ol>
                </div>
              </div>
            )}

            {route === 'age-gate' && (
              <div className="w-full max-w-xl rounded-[28px] border border-white/12 bg-[#0D101A] p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-full bg-[#F5B942]/15 flex items-center justify-center text-[#F5B942]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h1 className="text-lg sm:text-xl font-semibold">
                      {t('Age Verification & Privacy Consent', 'تأیید سن و رضایت‌نامه حریم خصوصی')}
                    </h1>
                    <p className="text-xs text-[#A3AEC2]">
                      {t(
                        'Select applicable jurisdiction for compliant age assurance',
                        'انتخاب حوزه قضایی متناسب با استاندارد قانونی محل دسترسی شما'
                      )}
                    </p>
                  </div>
                </div>

                {underageLocked ? (
                  <div className="rounded-2xl border border-[#EF4444]/40 bg-[#EF4444]/10 p-5 space-y-3">
                    <h2 className="text-sm font-semibold text-[#FCA5A5]">
                      {t('Access Restricted', 'دسترسی مسدود شد')}
                    </h2>
                    <p className="text-xs text-[#F5F7FA] leading-relaxed">
                      {t(
                        'Entered birth year does not meet the minimum 18+ age threshold.',
                        'بر اساس سال تولد واردشده، شرایط سنی دسترسی به محتوای ۱۸+ احراز نشد.'
                      )}
                    </p>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setUnderageLocked(false);
                        setBirthYear('1996');
                        setAgeError('');
                      }}
                    >
                      {t('Re-enter Birth Year', 'اصلاح سال تولد')}
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-[#A3AEC2]">
                        {t('Jurisdiction Compliance Mode', 'منطقه / استاندارد انطباق قانونی')}
                      </label>
                      <select
                        value={user.jurisdiction}
                        onChange={(e) =>
                          onUpdateUser({
                            jurisdiction: e.target.value as UserAccountState['jurisdiction']
                          })
                        }
                        className="w-full min-h-[44px] rounded-2xl border border-white/12 bg-[#06070C] px-4 text-base sm:text-sm text-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B942]"
                      >
                        <option value="global-standard">
                          {t(
                            'Global Standard (Birth Year + Legal Attestation)',
                            'استاندارد بین‌المللی (تأیید سن + اظهار قانونی)'
                          )}
                        </option>
                        <option value="eu-strict">
                          {t(
                            'EU DSA / AVMSD (Tokenized Age Assurance Check)',
                            'اتحادیه اروپا (DSA / AVMSD)'
                          )}
                        </option>
                        <option value="ca-uk-strict">
                          {t(
                            'UK Online Safety Act (Privacy-Preserving Verification)',
                            'بریتانیا (Online Safety Act)'
                          )}
                        </option>
                        <option value="us-2257">
                          {t(
                            'US State Compliance + 18+ Verified Catalog',
                            'آمریکای شمالی (انطباق ۱۸+)'
                          )}
                        </option>
                      </select>
                    </div>

                    <TextInput
                      label={t('Birth Year (e.g. 1996)', 'سال تولد (میلادی، برای مثال 1996)')}
                      type="number"
                      value={birthYear}
                      onChange={(e) => {
                        setBirthYear(e.target.value);
                        setAgeError('');
                      }}
                      error={ageError}
                      dir="ltr"
                    />

                    <div className="space-y-2.5 rounded-2xl border border-white/10 bg-[#06070C]/70 p-4">
                      <p className="text-xs font-semibold text-[#F5F7FA]">
                        {t('Privacy Preferences', 'تنظیمات حریم خصوصی')}
                      </p>
                      <label className="flex items-center justify-between gap-3 py-1 text-xs text-[#A3AEC2]">
                        <span>
                          {t(
                            'Essential Playback & In-App Memory (Always On)',
                            'اجزای ضروری پخش و حافظه داخلی برنامه (همیشه فعال)'
                          )}
                        </span>
                        <input type="checkbox" checked disabled className="accent-[#F5B942] h-4 w-4" />
                      </label>
                      <label className="flex items-center justify-between gap-3 py-1 text-xs text-[#F5F7FA] cursor-pointer">
                        <span>
                          {t(
                            'Internal Taste Engine Personalization',
                            'شخصی‌سازی جهان محتوا و موتور سلیقه داخلی'
                          )}
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
                          className="accent-[#F5B942] h-4 w-4 cursor-pointer"
                        />
                      </label>
                    </div>

                    <label className="flex items-start gap-2.5 text-xs text-[#D2DAE8] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={attestLegalAge}
                        onChange={(e) => setAttestLegalAge(e.target.checked)}
                        className="mt-0.5 accent-[#F5B942] h-4 w-4 cursor-pointer"
                      />
                      <span>
                        {t(
                          'I confirm I am at least 18 years old and agree to the Terms & Privacy framework.',
                          'تأیید می‌کنم به سن قانونی ۱۸+ سال رسیده‌ام و قوانین حریم خصوصی و شرایط استفاده را می‌پذیرم.'
                        )}
                      </span>
                    </label>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <Button variant="ghost" onClick={() => onNavigate('welcome')}>
                        {t('Back', 'بازگشت')}
                      </Button>
                      <Button
                        onClick={() => {
                          const yr = Number(birthYear);
                          const age = new Date().getFullYear() - yr;
                          if (!yr || yr < 1920 || yr > new Date().getFullYear()) {
                            setAgeError(t('Please enter a valid year.', 'سال تولد معتبر نیست.'));
                            return;
                          }
                          if (age < 18) {
                            setUnderageLocked(true);
                            return;
                          }
                          if (!attestLegalAge) {
                            setAgeError(
                              t(
                                'Please confirm legal age attestation.',
                                'تأیید قوانین و سن قانونی الزامی است.'
                              )
                            );
                            return;
                          }
                          onUpdateUser({ ageVerified: true });
                          onNavigate('onboarding');
                        }}
                      >
                        <span>
                          {user.jurisdiction === 'global-standard'
                            ? t('Verify & Personalize', 'تأیید سن و انتخاب سلیقه')
                            : t('Complete Regional Age Check', 'تکمیل تأیید سن منطقه‌ای')}
                        </span>
                        <ForwardIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}

            {route === 'onboarding' && (
              <div className="w-full max-w-4xl rounded-[28px] border border-white/12 bg-[#0D101A] p-6 sm:p-8 space-y-7">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h1 className="text-xl sm:text-2xl font-semibold">
                      {t(
                        'Visual Taste Calibration — Pick Resonant Atmospheres',
                        'شناخت اولیه سلیقه — اتمسفرهای محبوبتان را لمس کنید'
                      )}
                    </h1>
                    <p className="text-xs sm:text-sm text-[#A3AEC2]">
                      {t(
                        'Select visual moods below to seed your 6D internal recommendation vector.',
                        'چند حال‌وهوا را انتخاب کنید تا موتور هوشمند داخلی جهان شما را بچیند.'
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onUpdateUser({ personalizationEnabled: false, consentPersonalization: false });
                      onNavigate('universe');
                    }}
                  >
                    {t('Opt Out & Enter General Feed', 'انصراف از شخصی‌سازی و ورود')}
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {VIBE_PRESETS.map((v) => {
                    const active = selectedVibes.includes(v.id);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          setSelectedVibes((prev) =>
                            prev.includes(v.id) ? prev.filter((x) => x !== v.id) : [...prev, v.id]
                          )
                        }
                        className={`rounded-2xl border p-4 text-start transition-all cursor-pointer ${
                          active
                            ? 'border-[#F5B942] bg-[#F5B942]/12 shadow-[0_10px_30px_-12px_rgba(245,185,66,0.35)]'
                            : 'border-white/10 bg-[#06070C]/60 hover:border-white/25'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-[#F5F7FA]">
                            {t(v.titleEn, v.titleFa)}
                          </span>
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center ${
                              active ? 'bg-[#F5B942] text-[#06070C]' : 'border border-white/20'
                            }`}
                          >
                            {active && <Check className="h-3 w-3" />}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-[#A3AEC2] leading-relaxed">
                          {t(v.descEn, v.descFa)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-3 pt-2 border-t border-white/10">
                  <p className="text-xs font-medium text-[#A3AEC2]">
                    {t(
                      'Topics to exclude from your Universe (optional):',
                      'موضوعاتی که نمی‌خواهید در جهان شما نمایش داده شوند (اختیاری):'
                    )}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {TOPIC_AVOID_OPTIONS.map((opt) => {
                      const excluded = blockedChoices.includes(opt.key);
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() =>
                            setBlockedChoices((prev) =>
                              prev.includes(opt.key)
                                ? prev.filter((x) => x !== opt.key)
                                : [...prev, opt.key]
                            )
                          }
                          className={`min-h-[38px] rounded-full px-3.5 text-xs transition-colors cursor-pointer ${
                            excluded
                              ? 'bg-[#EF4444]/20 border border-[#EF4444]/50 text-[#FCA5A5]'
                              : 'border border-white/12 bg-white/[0.04] text-[#A3AEC2] hover:text-white'
                          }`}
                        >
                          {excluded ? '✕ ' : ''}
                          {t(opt.en, opt.fa)}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <Button variant="secondary" onClick={() => onNavigate('universe')}>
                    {t('Skip for Now', 'رد کردن این مرحله')}
                  </Button>
                  <Button
                    size="lg"
                    onClick={() => {
                      onUpdateUser({ personalizationEnabled: true, consentPersonalization: true });
                      onApplyOnboardingPresets(selectedVibes, blockedChoices);
                      onNavigate('universe');
                    }}
                  >
                    <Compass className="h-4 w-4" />
                    {t('Build My Personal Universe', 'ساخت جهان شخصی و ورود')}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
