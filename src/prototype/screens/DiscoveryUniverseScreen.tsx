import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Compass,
  Eye,
  Footprints,
  Grid2x2,
  Info,
  Link2,
  MessageSquareCode,
  Play,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Trophy,
  Video,
  Volume2,
  VolumeX,
  Wand2,
  X,
  Zap
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type {
  ExplainedRecommendation,
  FeedbackRecord,
  LanguageCode,
  OfflineDownloadRecord,
  PrototypeMediaItem,
  TasteVector6D,
  WatchProgressEntry
} from '../types';
import { cosineSimilarity6D, isItemAllowed } from '../tasteEngine';
import {
  buildInitialCyberEdges,
  buildInitialCyberNodes,
  CYBER_PALETTE,
  executeCyberRoomChatCommand,
  INITIAL_CYBER_QUESTS,
  playCyberSound,
  type CyberEdgeAnimation,
  type CyberRoomEdge,
  type CyberRoomNode,
  type CyberRoomQuest
} from '../cyberpunkRoomEngine';
import {
  CyberpunkRoom3DCanvas,
  type PlayerMoveInput
} from '../components/CyberpunkRoom3DCanvas';
import { useT } from '../i18n';
import { MediaCard } from '../components/UiPrimitives';

interface DiscoveryUniverseScreenProps {
  catalog: PrototypeMediaItem[];
  lang: LanguageCode;
  userVector: TasteVector6D;
  personalizationEnabled: boolean;
  liteMode: boolean;
  reducedMotion: boolean;
  favoriteIds: Set<string>;
  downloadsMap: Record<string, OfflineDownloadRecord>;
  hiddenIds: Set<string>;
  blockedTopics: string[];
  progressMap: Record<string, WatchProgressEntry>;
  feedbackMap: Record<string, FeedbackRecord>;
  onToggleLiteMode: (lite: boolean) => void;
  onOpenDetail: (item: PrototypeMediaItem) => void;
  onPlay: (item: PrototypeMediaItem) => void;
  onDownload: (item: PrototypeMediaItem) => void;
  onToggleFavorite: (item: PrototypeMediaItem) => void;
  onFeedback: (item: PrototypeMediaItem, sentiment: 'like' | 'dislike' | 'less_like_this') => void;
  onHide: (item: PrototypeMediaItem) => void;
}

const QUICK_CHAT_CHIPS: Array<{ en: string; fa: string }> = [
  {
    en: 'Connect Midnight Rain to Neon Tokyo',
    fa: 'اتصال باران نیمه‌شب به توکیو نئونی'
  },
  {
    en: 'Edit connections to cyber magenta',
    fa: 'رنگ اتصالات صورتی سایبری شود'
  },
  {
    en: 'Delete one connection',
    fa: 'حذف یکی از اتصالات'
  },
  {
    en: 'Connect all to selected node',
    fa: 'اتصال همه به این فیلم'
  }
];

function formatCinemaTimecode(totalFrames: number): string {
  const fps = 60;
  const ff = totalFrames % fps;
  const totalSeconds = Math.floor(totalFrames / fps);
  const ss = totalSeconds % 60;
  const mm = Math.floor(totalSeconds / 60) % 60;
  const hh = Math.floor(totalSeconds / 3600) % 24;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(hh)}:${pad(mm)}:${pad(ss)}:${pad(ff)}`;
}

export function DiscoveryUniverseScreen({
  catalog,
  lang,
  userVector,
  personalizationEnabled,
  liteMode,
  reducedMotion,
  favoriteIds,
  downloadsMap,
  hiddenIds,
  blockedTopics,
  progressMap,
  feedbackMap,
  onToggleLiteMode,
  onOpenDetail,
  onPlay,
  onDownload,
  onToggleFavorite,
  onFeedback,
  onHide
}: DiscoveryUniverseScreenProps) {
  const { t, translateTexts } = useT();
  const [cameraMode, setCameraMode] = useState<'room_game' | 'orbit_overview'>('room_game');
  const [openPopover, setOpenPopover] = useState<'none' | 'links' | 'chat' | 'view'>('none');
  const [soundMuted, setSoundMuted] = useState(false);

  // Live SMPTE Cinema Camera Timecode Counter (starts at 00:00:05:57 like the reference frame)
  const [timecodeFrames, setTimecodeFrames] = useState(5 * 60 + 57);
  useEffect(() => {
    const id = window.setInterval(() => {
      setTimecodeFrames((f) => f + 1);
    }, 100);
    return () => window.clearInterval(id);
  }, []);

  const is2DFallback = liteMode || reducedMotion;

  const baseRecommendations = useMemo(() => {
    return catalog
      .filter((item) => isItemAllowed(item, hiddenIds, blockedTopics))
      .map((item) => {
        const sim = personalizationEnabled ? cosineSimilarity6D(userVector, item.vector) : 0.78;
        const score = Math.max(58, Math.min(99, Math.round(sim * 100)));
        return {
          item,
          score,
          reasonFa: `هم‌افزایی عصبی در خوشه ${item.clusterLabelFa} (${score}%)`,
          reasonEn: `Neural alignment inside ${item.clusterLabelEn} (${score}%)`
        } satisfies ExplainedRecommendation;
      });
  }, [catalog, hiddenIds, blockedTopics, personalizationEnabled, userVector]);

  const [roomNodes, setRoomNodes] = useState<CyberRoomNode[]>(() =>
    buildInitialCyberNodes(baseRecommendations)
  );
  const [roomEdges, setRoomEdges] = useState<CyberRoomEdge[]>(() =>
    buildInitialCyberEdges(buildInitialCyberNodes(baseRecommendations))
  );
  const [animations, setAnimations] = useState<CyberEdgeAnimation[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(
    () => baseRecommendations[0]?.item.id || null
  );
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [targetPickId, setTargetPickId] = useState<string>('');
  const [quests, setQuests] = useState<CyberRoomQuest[]>(INITIAL_CYBER_QUESTS);
  const [teleportRequest, setTeleportRequest] = useState<{
    x: number;
    z: number;
    seq: number;
  } | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [lastAiReply, setLastAiReply] = useState<{ en: string; fa: string } | null>(null);

  const moveInputRef = useRef<PlayerMoveInput>({ forward: 0, strafe: 0, turn: 0 });

  useEffect(() => {
    if (lang === 'en' || lang === 'fa') return;
    void translateTexts(QUICK_CHAT_CHIPS.map((c) => c.en));
  }, [lang, translateTexts]);

  const completeQuest = useCallback(
    (questId: CyberRoomQuest['id']) => {
      setQuests((prev) => {
        const target = prev.find((q) => q.id === questId);
        if (!target || target.completed) return prev;
        playCyberSound('quest', soundMuted);
        return prev.map((q) => (q.id === questId ? { ...q, completed: true } : q));
      });
    },
    [soundMuted]
  );

  const pushAnimation = useCallback((anim: CyberEdgeAnimation | CyberEdgeAnimation[]) => {
    const list = Array.isArray(anim) ? anim : [anim];
    setAnimations((prev) => [
      ...prev.filter((a) => Date.now() - a.startedAt < a.durationMs),
      ...list
    ]);
  }, []);

  const activeNodes = useMemo(
    () => roomNodes.filter((n) => n.activeInRoom),
    [roomNodes]
  );

  const selectedNode = useMemo(
    () => activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[0] || null,
    [activeNodes, selectedNodeId]
  );

  useEffect(() => {
    if (!selectedNode) return;
    const candidate = activeNodes.find((n) => n.id !== selectedNode.id);
    if (candidate && (!targetPickId || targetPickId === selectedNode.id)) {
      setTargetPickId(candidate.id);
    }
  }, [selectedNode, activeNodes, targetPickId]);

  const totalXp = useMemo(
    () => quests.reduce((sum, q) => sum + (q.completed ? q.xp : 0), 108),
    [quests]
  );

  const [activeToastAnim, setActiveToastAnim] = useState<CyberEdgeAnimation | null>(null);
  useEffect(() => {
    if (animations.length === 0) return;
    const latest = animations[animations.length - 1];
    setActiveToastAnim(latest);
    const timer = window.setTimeout(() => setActiveToastAnim(null), 2200);
    return () => window.clearTimeout(timer);
  }, [animations]);

  const handleSelectNodeIn3D = useCallback(
    (nodeId: string) => {
      playCyberSound('select', soundMuted);
      completeQuest('explore_node');

      if (connectSourceId && connectSourceId !== nodeId) {
        const srcNode = activeNodes.find((n) => n.id === connectSourceId);
        const dstNode = activeNodes.find((n) => n.id === nodeId);
        if (srcNode && dstNode) {
          const exists = roomEdges.some(
            (e) =>
              (e.fromId === srcNode.id && e.toId === dstNode.id) ||
              (e.fromId === dstNode.id && e.toId === srcNode.id)
          );
          if (!exists) {
            const newEdge: CyberRoomEdge = {
              id: `edge-${srcNode.id}-${dstNode.id}-${Date.now()}`,
              fromId: srcNode.id,
              toId: dstNode.id,
              color: CYBER_PALETTE.cyan,
              strength: 3,
              labelEn: 'Direct 3D Link',
              labelFa: 'اتصال مستقیم ۳بعدی',
              createdAt: Date.now()
            };
            setRoomEdges((prev) => [...prev, newEdge]);
            pushAnimation({
              id: `anim-create-${Date.now()}`,
              type: 'create',
              fromPos: srcNode.position,
              toPos: dstNode.position,
              color: CYBER_PALETTE.cyan,
              startedAt: Date.now(),
              durationMs: 1650,
              labelEn: `Linked ${srcNode.item.titleEn} ⚡ ${dstNode.item.titleEn}`,
              labelFa: `اتصال: «${srcNode.item.titleFa}» ⚡ «${dstNode.item.titleFa}»`
            });
            playCyberSound('connect', soundMuted);
            completeQuest('create_link');
          }
        }
        setConnectSourceId(null);
      }

      setSelectedNodeId(nodeId);
    },
    [connectSourceId, activeNodes, roomEdges, soundMuted, completeQuest, pushAnimation]
  );

  const handleCreateConnectionManual = useCallback(
    (fromId: string, toId: string, color: string = CYBER_PALETTE.cyan) => {
      if (!fromId || !toId || fromId === toId) return;
      const src = activeNodes.find((n) => n.id === fromId);
      const dst = activeNodes.find((n) => n.id === toId);
      if (!src || !dst) return;

      const existing = roomEdges.find(
        (e) =>
          (e.fromId === fromId && e.toId === toId) || (e.fromId === toId && e.toId === fromId)
      );

      if (existing) {
        setRoomEdges((prev) =>
          prev.map((e) => (e.id === existing.id ? { ...e, color, strength: 3 } : e))
        );
        pushAnimation({
          id: `anim-edit-${Date.now()}`,
          type: 'edit',
          fromPos: src.position,
          toPos: dst.position,
          color,
          startedAt: Date.now(),
          durationMs: 1550,
          labelEn: `Boosted: ${src.item.titleEn} ⚡ ${dst.item.titleEn}`,
          labelFa: `تقویت اتصال: «${src.item.titleFa}» ⚡ «${dst.item.titleFa}»`
        });
        playCyberSound('edit', soundMuted);
        completeQuest('edit_or_delete');
        return;
      }

      const newEdge: CyberRoomEdge = {
        id: `edge-${fromId}-${toId}-${Date.now()}`,
        fromId,
        toId,
        color,
        strength: 2,
        labelEn: 'Cyber Conduit',
        labelFa: 'اتصال سایبری',
        createdAt: Date.now()
      };
      setRoomEdges((prev) => [...prev, newEdge]);
      pushAnimation({
        id: `anim-create-${Date.now()}`,
        type: 'create',
        fromPos: src.position,
        toPos: dst.position,
        color,
        startedAt: Date.now(),
        durationMs: 1650,
        labelEn: `Connected: ${src.item.titleEn} ⚡ ${dst.item.titleEn}`,
        labelFa: `اتصال جدید: «${src.item.titleFa}» ⚡ «${dst.item.titleFa}»`
      });
      playCyberSound('connect', soundMuted);
      completeQuest('create_link');
    },
    [activeNodes, roomEdges, soundMuted, pushAnimation, completeQuest]
  );

  const handleSeverSelectedConnection = useCallback(() => {
    if (roomEdges.length === 0) return;
    const edge =
      roomEdges.find(
        (e) => selectedNode && (e.fromId === selectedNode.id || e.toId === selectedNode.id)
      ) || roomEdges[roomEdges.length - 1];
    if (!edge) return;

    const src = roomNodes.find((n) => n.id === edge.fromId);
    const dst = roomNodes.find((n) => n.id === edge.toId);
    setRoomEdges((prev) => prev.filter((e) => e.id !== edge.id));
    if (src && dst) {
      pushAnimation({
        id: `anim-del-${Date.now()}`,
        type: 'delete',
        fromPos: src.position,
        toPos: dst.position,
        color: CYBER_PALETTE.crimson,
        startedAt: Date.now(),
        durationMs: 1500,
        labelEn: `Deleted: ${src.item.titleEn} ✕ ${dst.item.titleEn}`,
        labelFa: `حذف اتصال: «${src.item.titleFa}» ✕ «${dst.item.titleFa}»`
      });
    }
    playCyberSound('delete', soundMuted);
    completeQuest('edit_or_delete');
  }, [roomEdges, selectedNode, roomNodes, soundMuted, pushAnimation, completeQuest]);

  const handleRecolorSelectedConnections = useCallback(
    (newColor: string) => {
      if (!selectedNode) return;
      setRoomEdges((prev) =>
        prev.map((e) =>
          e.fromId === selectedNode.id || e.toId === selectedNode.id
            ? { ...e, color: newColor, strength: 3 }
            : e
        )
      );
      const partnerNode =
        activeNodes.find((n) => n.id !== selectedNode.id) || selectedNode;
      pushAnimation({
        id: `anim-color-${Date.now()}`,
        type: 'edit',
        fromPos: selectedNode.position,
        toPos: partnerNode.position,
        color: newColor,
        startedAt: Date.now(),
        durationMs: 1500,
        labelEn: `Edited Conduit Color`,
        labelFa: `ویرایش رنگ و قدرت اتصال`
      });
      playCyberSound('edit', soundMuted);
      completeQuest('edit_or_delete');
    },
    [selectedNode, activeNodes, soundMuted, pushAnimation, completeQuest]
  );

  const handleRunChatCommand = useCallback(
    (rawPrompt: string) => {
      const trimmed = rawPrompt.trim();
      if (!trimmed) return;

      const result = executeCyberRoomChatCommand(
        trimmed,
        roomNodes,
        roomEdges,
        selectedNode?.id || null
      );

      setRoomNodes(result.nextNodes);
      setRoomEdges(result.nextEdges);
      pushAnimation(result.animations);
      setLastAiReply({ en: result.replyEn, fa: result.replyFa });

      if (result.focusNodeId) {
        setSelectedNodeId(result.focusNodeId);
      }
      if (result.teleportTo) {
        setCameraMode('room_game');
        setTeleportRequest({
          x: result.teleportTo.x,
          z: result.teleportTo.z,
          seq: Date.now()
        });
      }

      const animType = result.animations[0]?.type || 'edit';
      playCyberSound(
        animType === 'create' ? 'connect' : animType === 'delete' ? 'delete' : 'edit',
        soundMuted
      );

      completeQuest('chat_command');
      if (animType === 'create') completeQuest('create_link');
      if (animType === 'delete' || animType === 'edit') completeQuest('edit_or_delete');

      setChatInput('');
    },
    [roomNodes, roomEdges, selectedNode, soundMuted, pushAnimation, completeQuest]
  );

  const setHoldMove = (patch: Partial<PlayerMoveInput>) => {
    moveInputRef.current = { ...moveInputRef.current, ...patch };
  };

  const resetHoldMove = () => {
    moveInputRef.current = { forward: 0, strafe: 0, turn: 0 };
  };

  return (
    <div className="pb-2">
      {!is2DFallback ? (
        /* =====================================================================
           FUTURISTIC 3D CINEMA STUDIO VIEWPORT + FROSTED GLASS CAMERA HUD
           ===================================================================== */
        <div className="relative h-[calc(100dvh-9.2rem)] min-h-[520px] max-h-[820px] w-full overflow-hidden rounded-[28px] border border-white/15 bg-[#070b14] shadow-[0_16px_60px_rgba(0,0,0,0.88)]">
          <CyberpunkRoom3DCanvas
            nodes={roomNodes}
            edges={roomEdges}
            animations={animations}
            selectedNodeId={selectedNode?.id || null}
            connectSourceNodeId={connectSourceId}
            cameraMode={cameraMode}
            moveInputRef={moveInputRef}
            teleportRequest={teleportRequest}
            onSelectNode={handleSelectNodeIn3D}
            onEnterRoomAtNode={(nodeId) => {
              setSelectedNodeId(nodeId);
              setCameraMode('room_game');
            }}
          />

          {/* =================================================================
              TOP VISIONOS SPATIAL GLASS BAR ("Kiroshi Optics Neural Bus")
              ================================================================= */}
          <div
            className="pointer-events-none absolute top-3.5 inset-x-3.5 z-10 flex items-center justify-between gap-2"
            dir="ltr"
          >
            {/* Left Pill: Cinema Camera Icon + SMPTE Timecode + Kiroshi Optics Neural Bus + View Toggle */}
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-[#070b14]/65 backdrop-blur-2xl px-3.5 py-1.5 text-xs text-[#F5F7FA] shadow-[0_8px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)]">
              <Video className="h-4 w-4 text-[#00F0FF] shrink-0" />
              <span className="font-mono-tabular tracking-wider text-[11px] sm:text-[12px] font-medium text-[#E2E8F0]">
                {formatCinemaTimecode(timecodeFrames)}
              </span>
              <span className="hidden md:inline-block h-3.5 w-[1px] bg-white/15" />
              <span className="hidden md:inline-block text-[11px] font-medium tracking-wide text-[#00F0FF]">
                Kiroshi Optics Neural Bus
              </span>
              <span className="h-3.5 w-[1px] bg-white/15" />
              <button
                type="button"
                onClick={() =>
                  setOpenPopover((p) => (p === 'view' ? 'none' : 'view'))
                }
                aria-label="Camera Mode & Studio Info"
                className="text-[#F5B942] hover:text-white transition-colors cursor-pointer"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>

            {/* Right Pill: Sound + Connections + Golden XP Trophy */}
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-[#F5B942]/30 bg-white/[0.06] backdrop-blur-xl px-3.5 py-1.5 text-xs text-[#F5F7FA] shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
              <button
                type="button"
                onClick={() => setSoundMuted((m) => !m)}
                aria-label="Toggle Sound"
                className="text-[#00F0FF] hover:text-white transition-colors cursor-pointer"
              >
                {soundMuted ? (
                  <VolumeX className="h-4 w-4 text-[#94A3B8]" />
                ) : (
                  <Volume2 className="h-4 w-4 text-[#00F0FF]" />
                )}
              </button>
              <span className="font-mono-tabular text-[12px] font-medium text-[#5CEEFF]">
                {roomEdges.length} {t('links', 'اتصال')}
              </span>
              <span className="h-3.5 w-[1px] bg-white/15" />
              <span className="font-mono-tabular text-[12px] font-semibold text-[#F5B942]">
                XP {totalXp}
              </span>
              <Trophy className="h-3.5 w-3.5 text-[#F5B942] shrink-0" />
            </div>
          </div>

          {/* Camera View Mode Popover (when clicking ⓘ in the Timecode bar) */}
          <AnimatePresence>
            {openPopover === 'view' && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="pointer-events-auto absolute top-14 start-3.5 z-20 inline-flex items-center gap-1 rounded-2xl border border-white/20 bg-white/[0.08] backdrop-blur-2xl p-1.5 shadow-2xl"
              >
                <button
                  type="button"
                  onClick={() => {
                    onToggleLiteMode(false);
                    setCameraMode('room_game');
                    setOpenPopover('none');
                  }}
                  className={`h-8 inline-flex items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-colors cursor-pointer ${
                    cameraMode === 'room_game'
                      ? 'bg-[#00F0FF]/20 border border-[#00F0FF]/50 text-[#5CEEFF]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  <Footprints className="h-3.5 w-3.5" />
                  <span>{t('Studio Walk', 'حرکت در استودیو')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleLiteMode(false);
                    setCameraMode('orbit_overview');
                    setOpenPopover('none');
                  }}
                  className={`h-8 inline-flex items-center gap-1.5 rounded-xl px-3 text-xs font-medium transition-colors cursor-pointer ${
                    cameraMode === 'orbit_overview'
                      ? 'bg-[#F5B942]/20 border border-[#F5B942]/50 text-[#FFD66B]'
                      : 'text-[#CBD5E1] hover:text-white'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>{t('Orbit Lens', 'چرخش دور لنز')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleLiteMode(true);
                    setOpenPopover('none');
                  }}
                  className="h-8 inline-flex items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-[#CBD5E1] hover:text-white cursor-pointer"
                >
                  <Grid2x2 className="h-3.5 w-3.5" />
                  <span>{t('2D Grid', 'نمای ۲بعدی')}</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Brief 2-Second Animation Toast when a Connection is Added / Edited / Deleted */}
          <AnimatePresence mode="wait">
            {activeToastAnim && (
              <motion.div
                key={activeToastAnim.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16 }}
                className="pointer-events-none absolute top-14 inset-x-0 z-10 flex justify-center px-4"
              >
                <div className="inline-flex items-center gap-1.5 rounded-full border border-[#00F0FF]/45 bg-white/[0.08] backdrop-blur-2xl px-3.5 py-1 text-[11px] font-medium text-[#F5F7FA] shadow-lg">
                  <Zap className="h-3.5 w-3.5 text-[#F5B942] shrink-0" />
                  <span className="truncate max-w-[260px]">
                    {t(activeToastAnim.labelEn, activeToastAnim.labelFa)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 2-Click Link Mode Prompt */}
          {connectSourceId && (
            <div className="pointer-events-auto absolute top-14 end-3.5 z-10 inline-flex items-center gap-2 rounded-full border border-[#10B981]/50 bg-white/[0.08] backdrop-blur-xl px-3.5 py-1 text-[11px] text-[#34D399]">
              <span>
                {t('Tap target pedestal in 3D...', 'سکوی مقصد را در استودیو ۳بعدی لمس کنید...')}
              </span>
              <button
                type="button"
                onClick={() => setConnectSourceId(null)}
                className="text-white hover:text-[#EF4444] cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* =================================================================
              BOTTOM FROSTED GLASS DOCK & ON-DEMAND POPOVERS
              ================================================================= */}
          <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 flex flex-col items-center gap-2">
            {/* Compact Frosted Glass Popover ONLY when 'links' or 'chat' is clicked */}
            <AnimatePresence>
              {openPopover === 'links' && selectedNode && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.16 }}
                  className="pointer-events-auto w-full max-w-xl rounded-[22px] border border-white/20 bg-[#080C18]/75 backdrop-blur-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                      <select
                        value={targetPickId}
                        onChange={(e) => setTargetPickId(e.target.value)}
                        aria-label="Target film"
                        className="flex-1 min-w-0 h-8 rounded-xl border border-white/15 bg-white/[0.07] px-2.5 text-xs text-[#F5F7FA]"
                      >
                        {activeNodes
                          .filter((n) => n.id !== selectedNode.id)
                          .map((n) => (
                            <option key={n.id} value={n.id} className="bg-[#0B101E] text-white">
                              {t(n.item.titleEn, n.item.titleFa)}
                            </option>
                          ))}
                      </select>

                      <button
                        type="button"
                        onClick={() =>
                          handleCreateConnectionManual(
                            selectedNode.id,
                            targetPickId,
                            CYBER_PALETTE.cyan
                          )
                        }
                        className="h-8 inline-flex items-center gap-1 rounded-xl bg-[#00F0FF]/90 px-3 text-xs font-semibold text-[#05070F] cursor-pointer shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>{t('Link', 'اتصال')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setConnectSourceId((prev) =>
                            prev === selectedNode.id ? null : selectedNode.id
                          )
                        }
                        className="h-8 inline-flex items-center gap-1 rounded-xl border border-[#10B981]/50 bg-[#10B981]/15 px-2.5 text-[11px] text-[#34D399] cursor-pointer shrink-0"
                      >
                        <span>{t('3D Tap', 'کلیک ۳بعدی')}</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenPopover('none')}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-lg text-[#A3AEC2] hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-[#CBD5E1]">
                        {t('Color:', 'رنگ پرتو:')}
                      </span>
                      {[
                        CYBER_PALETTE.cyan,
                        CYBER_PALETTE.magenta,
                        CYBER_PALETTE.amber,
                        CYBER_PALETTE.emerald
                      ].map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => handleRecolorSelectedConnections(col)}
                          className="h-5 w-5 rounded-full border border-white/30 cursor-pointer"
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={handleSeverSelectedConnection}
                        className="h-7 inline-flex items-center gap-1 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/15 px-2.5 text-[11px] text-[#FCA5A5] cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>{t('Delete Link', 'حذف اتصال')}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const freshNodes = buildInitialCyberNodes(baseRecommendations);
                          setRoomNodes(freshNodes);
                          setRoomEdges(buildInitialCyberEdges(freshNodes));
                          playCyberSound('edit', soundMuted);
                        }}
                        aria-label="Reset Connections"
                        className="h-7 w-7 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-[#CBD5E1] hover:text-white cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {openPopover === 'chat' && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  transition={{ duration: 0.16 }}
                  className="pointer-events-auto w-full max-w-xl rounded-[22px] border border-white/20 bg-[#080C18]/75 backdrop-blur-2xl p-3 shadow-[0_12px_40px_rgba(0,0,0,0.7)] space-y-2"
                >
                  <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {QUICK_CHAT_CHIPS.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleRunChatCommand(t(chip.en, chip.fa))}
                          className="h-7 shrink-0 whitespace-nowrap rounded-xl border border-[#00F0FF]/35 bg-white/[0.06] px-2.5 text-[11px] text-[#E2E8F0] hover:border-[#00F0FF] cursor-pointer"
                        >
                          <Wand2 className="inline h-3 w-3 text-[#00F0FF] me-1" />
                          {t(chip.en, chip.fa)}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenPopover('none')}
                      className="h-7 w-7 shrink-0 inline-flex items-center justify-center rounded-lg text-[#A3AEC2] hover:text-white cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {lastAiReply && (
                    <p className="text-[11px] text-[#5CEEFF] truncate px-1">
                      {t(lastAiReply.en, lastAiReply.fa)}
                    </p>
                  )}

                  <form
                    className="flex items-center gap-1.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleRunChatCommand(chatInput);
                    }}
                  >
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={t(
                        'Chat to add, delete, or recolor 3D connections...',
                        'بنویسید: اتصال جدید، حذف اتصال، یا تغییر رنگ به صورتی...'
                      )}
                      className="flex-1 h-9 rounded-xl border border-white/15 bg-white/[0.07] px-3 text-xs text-[#F5F7FA] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00F0FF]"
                    />
                    <button
                      type="submit"
                      className="h-9 inline-flex items-center gap-1 rounded-xl bg-gradient-to-b from-[#F9D976] to-[#E5A93C] px-3.5 text-xs font-bold text-[#08090E] cursor-pointer shrink-0"
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>{t('Send', 'ارسال')}</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===============================================================
                MAIN FROSTED GLASS FLOATING CONTROL BAR
                (Matches exact glassmorphism, glowing gold Play button & icons)
                =============================================================== */}
            <div
              className="pointer-events-auto w-full max-w-2xl flex items-center justify-between gap-1.5 sm:gap-2 rounded-[22px] border border-white/20 bg-white/[0.07] backdrop-blur-2xl px-2.5 sm:px-3 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.65)]"
              dir="ltr"
            >
              {/* Left Cluster: Frosted Glass Chat, Links & Eye Details Buttons */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setOpenPopover((p) => (p === 'chat' ? 'none' : 'chat'))
                  }
                  aria-label={t('Chat', 'چت')}
                  className={`h-9 w-8 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    openPopover === 'chat'
                      ? 'border-[#00F0FF]/70 bg-[#00F0FF]/20 text-[#5CEEFF]'
                      : 'border-white/15 bg-white/[0.06] text-[#E2E8F0] hover:bg-white/[0.12]'
                  }`}
                >
                  <MessageSquareCode className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpenPopover((p) => (p === 'links' ? 'none' : 'links'))
                  }
                  aria-label={t('Links', 'اتصالات')}
                  className={`h-9 w-8 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-xl border transition-colors cursor-pointer ${
                    openPopover === 'links'
                      ? 'border-[#FF4D9D]/70 bg-[#FF4D9D]/20 text-[#FF7BB8]'
                      : 'border-white/15 bg-white/[0.06] text-[#E2E8F0] hover:bg-white/[0.12]'
                  }`}
                >
                  <Link2 className="h-4 w-4" />
                </button>

                {selectedNode && (
                  <button
                    type="button"
                    onClick={() => onOpenDetail(selectedNode.item)}
                    aria-label={t('Details', 'جزئیات')}
                    className="h-9 w-8 sm:h-10 sm:w-10 inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-[#E2E8F0] hover:bg-white/[0.12] transition-colors cursor-pointer"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Center Cluster: Radiant Gold «پخش» Button + Film Title */}
              {selectedNode && (
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <button
                    type="button"
                    onClick={() => onPlay(selectedNode.item)}
                    className="h-9 sm:h-10 inline-flex items-center gap-1 sm:gap-1.5 rounded-xl bg-gradient-to-b from-[#FCE08B] via-[#F5B942] to-[#D4931D] px-3 sm:px-4 text-xs font-bold text-[#090B10] shadow-[0_0_24px_rgba(245,185,66,0.45)] hover:brightness-105 cursor-pointer shrink-0"
                  >
                    <span>{t('Play', 'پخش')}</span>
                    <Play className="h-3.5 w-3.5 fill-current" />
                  </button>

                  <span
                    className="truncate text-xs font-semibold text-[#F5F7FA] max-w-[54px] sm:max-w-[160px]"
                    dir="auto"
                  >
                    {t(selectedNode.item.titleEn, selectedNode.item.titleFa)}
                  </span>
                </div>
              )}

              {/* Right Cluster: 4 Frosted Glass Walk / Turn Keys */}
              <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                <button
                  type="button"
                  aria-label="Turn Left"
                  onPointerDown={() => setHoldMove({ turn: 1 })}
                  onPointerUp={resetHoldMove}
                  onPointerLeave={resetHoldMove}
                  className="h-9 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-xs sm:text-sm text-[#CBD5E1] active:bg-[#00F0FF]/25 active:text-white cursor-pointer"
                >
                  ↶
                </button>
                <button
                  type="button"
                  aria-label="Walk Forward"
                  onPointerDown={() => setHoldMove({ forward: 1 })}
                  onPointerUp={resetHoldMove}
                  onPointerLeave={resetHoldMove}
                  className="h-9 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-[#00F0FF]/55 bg-[#00F0FF]/15 text-[#5CEEFF] shadow-[0_0_16px_rgba(0,240,255,0.22)] active:bg-[#00F0FF]/30 cursor-pointer"
                >
                  <ArrowUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Walk Backward"
                  onPointerDown={() => setHoldMove({ forward: -1 })}
                  onPointerUp={resetHoldMove}
                  onPointerLeave={resetHoldMove}
                  className="h-9 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-[#CBD5E1] active:bg-[#00F0FF]/25 active:text-white cursor-pointer"
                >
                  <ArrowDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Turn Right"
                  onPointerDown={() => setHoldMove({ turn: -1 })}
                  onPointerUp={resetHoldMove}
                  onPointerLeave={resetHoldMove}
                  className="h-9 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-xs sm:text-sm text-[#CBD5E1] active:bg-[#00F0FF]/25 active:text-white cursor-pointer"
                >
                  ↷
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => onToggleLiteMode(false)}
              className="h-9 inline-flex items-center gap-1.5 rounded-full border border-[#F5B942]/40 bg-white/[0.06] backdrop-blur-xl px-4 text-xs font-semibold text-[#F5B942] cursor-pointer"
            >
              <Compass className="h-3.5 w-3.5" />
              <span>{t('Return to 3D Cinema Studio', 'بازگشت به استودیوی سه‌بعدی')}</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
            {baseRecommendations.map((rec) => (
              <MediaCard
                key={rec.item.id}
                recommendation={rec}
                lang={lang}
                isFavorite={favoriteIds.has(rec.item.id)}
                downloadRecord={downloadsMap[rec.item.id]}
                progress={progressMap[rec.item.id]}
                feedback={feedbackMap[rec.item.id]}
                onOpenDetail={onOpenDetail}
                onPlay={onPlay}
                onDownload={onDownload}
                onToggleFavorite={onToggleFavorite}
                onFeedback={onFeedback}
                onHide={onHide}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
