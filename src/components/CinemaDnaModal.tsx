import React, { useEffect, useState } from 'react';
import { Check, Copy, Download, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { CinemaDnaProfile, TasteInteraction } from '../types/cinema';
import { fetchCinemaDna } from '../services/cinemaApi';

interface CinemaDnaModalProps {
  isOpen: boolean;
  onClose: () => void;
  interactions: TasteInteraction[];
}

export const CinemaDnaModal: React.FC<CinemaDnaModalProps> = ({
  isOpen,
  onClose,
  interactions
}) => {
  const [dna, setDna] = useState<CinemaDnaProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || interactions.length < 3) return;
    let active = true;
    setLoading(true);
    fetchCinemaDna(interactions)
      .then((res) => {
        if (active) setDna(res);
      })
      .catch(() => {
        if (active) {
          setDna({
            archetypeTitle: 'The Midnight Cartographer',
            signatureVibe: 'Nocturnal Neo-Noir & Hypnotic Solitude',
            tagline: 'Shadows and silence reveal more than exposition ever could.',
            topTraits: ['High Tension', 'Nocturnal Rain', 'Slow Burn'],
            directorAffinity: interactions[0]?.director || 'Kiyoshi Kurosawa',
            avgRuntimeMin: 112,
            filmsAnalyzed: interactions.length,
            accentHex: '#D4AF37',
            secondaryHex: '#1E293B'
          });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, interactions]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  const handleCopySummary = async () => {
    if (!dna) return;
    const text = `AETHER Cinema DNA — ${dna.archetypeTitle}\n${dna.signatureVibe}\n"${dna.tagline}"\nTraits: ${dna.topTraits.join(' · ')}\nAuteur Affinity: ${dna.directorAffinity}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard permissions
    }
  };

  const handleDownloadCard = () => {
    if (!dna) return;
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Deep obsidian background
    const bg = ctx.createLinearGradient(0, 0, 900, 1200);
    bg.addColorStop(0, '#0b1324');
    bg.addColorStop(0.55, '#070b14');
    bg.addColorStop(1, '#04060c');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, 900, 1200);

    // Subtle amber glow
    const glow = ctx.createRadialGradient(450, 280, 40, 450, 280, 420);
    glow.addColorStop(0, 'rgba(212, 175, 55, 0.24)');
    glow.addColorStop(1, 'rgba(7, 11, 20, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 900, 1200);

    // Frame border
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 48, 804, 1104);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '600 22px sans-serif';
    ctx.fillText('AETHER  •  LOCAL-ONLY CINEMA DNA', 96, 132);

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 64px Georgia, serif';
    ctx.fillText(dna.archetypeTitle, 96, 260);

    ctx.fillStyle = '#D4AF37';
    ctx.font = '500 26px sans-serif';
    ctx.fillText(dna.signatureVibe, 96, 330);

    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'italic 30px Georgia, serif';
    ctx.fillText(`"${dna.tagline.slice(0, 52)}"`, 96, 440);
    if (dna.tagline.length > 52) {
      ctx.fillText(dna.tagline.slice(52), 96, 486);
    }

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('DOMINANT SIGNATURE', 96, 630);

    dna.topTraits.forEach((trait, i) => {
      ctx.fillStyle = '#F1F5F9';
      ctx.font = '500 32px sans-serif';
      ctx.fillText(`0${i + 1}   ${trait}`, 96, 695 + i * 56);
    });

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 20px sans-serif';
    ctx.fillText('AUTEUR AFFINITY', 96, 940);
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 38px Georgia, serif';
    ctx.fillText(dna.directorAffinity, 96, 995);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 22px monospace';
    ctx.fillText(`${dna.filmsAnalyzed} FILMS ANALYZED  •  AVG ${dna.avgRuntimeMin} MIN`, 96, 1086);

    const link = document.createElement('a');
    link.download = 'aether-cinema-dna.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Cinema DNA Taste Card"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#04070e]/85 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#0f172a] via-[#090e1a] to-[#070b14] p-6 sm:p-8 shadow-[0_40px_100px_-14px_rgba(212,175,55,0.22)]"
          >
            {/* Ambient glow inside Wrapped card */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-[#D4AF37]/20 blur-[80px]"
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="Close Cinema DNA"
              className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {loading || !dna ? (
              <div className="py-16 flex flex-col items-center justify-center gap-3">
                <Sparkles className="h-6 w-6 text-[#D4AF37] animate-pulse" />
                <span className="text-xs uppercase tracking-[0.2em] text-slate-300">
                  Synthesizing Taste DNA
                </span>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2 text-[11px] font-mono-tabular uppercase tracking-[0.2em] text-[#D4AF37]">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Cinema DNA</span>
                </div>

                <h2 className="mt-4 font-editorial text-4xl font-semibold text-white leading-tight">
                  {dna.archetypeTitle}
                </h2>
                <p className="mt-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#D4AF37]">
                  {dna.signatureVibe}
                </p>

                <p className="mt-5 font-editorial italic text-xl text-slate-200 leading-snug">
                  “{dna.tagline}”
                </p>

                <div className="mt-6 space-y-2.5 border-y border-white/10 py-5">
                  {dna.topTraits.map((trait, idx) => (
                    <div key={trait} className="flex items-center justify-between text-sm">
                      <span className="font-mono-tabular text-xs text-[#D4AF37]">
                        0{idx + 1}
                      </span>
                      <span className="font-medium text-slate-100">{trait}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-4 text-left">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Auteur Affinity
                    </p>
                    <p className="mt-1 font-editorial text-lg text-white">
                      {dna.directorAffinity}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-slate-400">
                      Local Vault
                    </p>
                    <p className="mt-1 font-mono-tabular text-sm text-[#D4AF37]">
                      {dna.filmsAnalyzed} films • {dna.avgRuntimeMin}m
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="min-h-[48px] flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/[0.05] text-xs font-semibold text-slate-100 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="h-4 w-4 text-[#D4AF37]" /> : <Copy className="h-4 w-4" />}
                    <span>{copied ? 'Copied' : 'Copy Card'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadCard}
                    className="min-h-[48px] flex items-center justify-center gap-2 rounded-full bg-[#D4AF37] text-xs font-semibold text-[#070b14] hover:bg-[#e5c258] transition-colors cursor-pointer"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export PNG</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
