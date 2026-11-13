import type { PrototypeMediaItem } from './types';

export interface CyberRoomNode {
  id: string;
  item: PrototypeMediaItem;
  score: number;
  position: { x: number; y: number; z: number };
  customColor?: string;
  energyLevel: number; // 0.5 to 2.0
  activeInRoom: boolean;
}

export interface CyberRoomEdge {
  id: string;
  fromId: string;
  toId: string;
  color: string;
  strength: number; // 1 to 3
  labelEn: string;
  labelFa: string;
  createdAt: number;
}

export interface CyberEdgeAnimation {
  id: string;
  type: 'create' | 'delete' | 'edit' | 'spawn';
  fromPos: { x: number; y: number; z: number };
  toPos: { x: number; y: number; z: number };
  color: string;
  startedAt: number;
  durationMs: number;
  labelEn: string;
  labelFa: string;
}

export interface CyberRoomQuest {
  id: 'explore_node' | 'create_link' | 'edit_or_delete' | 'chat_command';
  titleEn: string;
  titleFa: string;
  xp: number;
  completed: boolean;
}

export interface CyberChatTurn {
  id: string;
  role: 'user' | 'architect';
  textEn: string;
  textFa: string;
  actionBadgeEn?: string;
  actionBadgeFa?: string;
  timestamp: string;
}

export const CYBER_PALETTE = {
  cyan: '#00F0FF',
  magenta: '#FF2A85',
  amber: '#F5B942',
  emerald: '#10B981',
  violet: '#A855F7',
  crimson: '#EF4444'
} as const;

/**
 * Pure Web Audio API synthesizer for cyberpunk room interactions (zero external files).
 */
export function playCyberSound(
  effect: 'connect' | 'delete' | 'edit' | 'quest' | 'select',
  muted = false
): void {
  if (muted || typeof window === 'undefined') return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (effect === 'connect') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.28);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
      osc.start(now);
      osc.stop(now + 0.33);
    } else if (effect === 'delete') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.26);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.29);
    } else if (effect === 'edit') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.setValueAtTime(540, now + 0.1);
      osc.frequency.setValueAtTime(760, now + 0.2);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (effect === 'quest') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(660, now + 0.12);
      osc.frequency.setValueAtTime(880, now + 0.24);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.46);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(580, now);
      osc.frequency.exponentialRampToValueAtTime(720, now + 0.09);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.11);
    }

    window.setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 600);
  } catch {
    // ignore audio restrictions
  }
}

/**
 * Maps catalog items onto a spacious, walkable 3D Cyberpunk Neural Room layout.
 */
export function buildInitialCyberNodes(
  items: Array<{ item: PrototypeMediaItem; score: number }>
): CyberRoomNode[] {
  const count = Math.max(1, items.length);
  const radius = 12.5;

  return items.map(({ item, score }, idx) => {
    const angle = (idx / count) * Math.PI * 2 - Math.PI / 2;
    const x = Number((Math.cos(angle) * radius).toFixed(2));
    const z = Number((Math.sin(angle) * radius).toFixed(2));
    return {
      id: item.id,
      item,
      score,
      position: { x, y: 0, z },
      energyLevel: 1.0,
      activeInRoom: true
    };
  });
}

export function buildInitialCyberEdges(nodes: CyberRoomNode[]): CyberRoomEdge[] {
  const edges: CyberRoomEdge[] = [];
  const active = nodes.filter((n) => n.activeInRoom);
  if (active.length < 2) return edges;

  // 1. Organized perimeter fiber-optic trench ring (Neon Cyan & Amber)
  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    const b = active[(i + 1) % active.length];
    if (!a || !b || a.id === b.id) continue;
    edges.push({
      id: `edge-${a.id}-${b.id}`,
      fromId: a.id,
      toId: b.id,
      color: i % 3 === 0 ? CYBER_PALETTE.amber : CYBER_PALETTE.cyan,
      strength: 1,
      labelEn: 'Kiroshi Optics Neural Bus',
      labelFa: 'گذرگاه عصبی کیروشی اپتیکس',
      createdAt: Date.now()
    });
  }

  // 2. Structured cross-hub floor trench & ceiling conduit trunks (1 per cluster)
  const seenClusters = new Set<string>();
  for (let i = 0; i < active.length; i++) {
    const a = active[i];
    if (seenClusters.has(a.item.clusterId)) continue;
    const partner = active.find(
      (b, j) => j > i + 1 && b.item.clusterId === a.item.clusterId
    );
    if (partner) {
      seenClusters.add(a.item.clusterId);
      edges.push({
        id: `edge-bridge-${a.id}-${partner.id}`,
        fromId: a.id,
        toId: partner.id,
        color: CYBER_PALETTE.amber,
        strength: 2,
        labelEn: `${a.item.clusterLabelEn} Neural Trunk`,
        labelFa: `ترانک فیبر نوری ${a.item.clusterLabelFa}`,
        createdAt: Date.now()
      });
    }
  }

  return edges;
}

export const INITIAL_CYBER_QUESTS: CyberRoomQuest[] = [
  {
    id: 'explore_node',
    titleEn: 'Inspect a 3D Film Terminal inside the Room',
    titleFa: 'بازرسی یکی از پایانه‌های فیلم در اتاق ۳بعدی',
    xp: 150,
    completed: false
  },
  {
    id: 'create_link',
    titleEn: 'Forge a New 3D Cyberpunk Connection',
    titleFa: 'ایجاد یک اتصال سایبرپانکی جدید بین دو فیلم',
    xp: 250,
    completed: false
  },
  {
    id: 'edit_or_delete',
    titleEn: 'Modify or Sever a Neural Conduit',
    titleFa: 'ویرایش یا حذف یکی از اتصالات شبکه',
    xp: 250,
    completed: false
  },
  {
    id: 'chat_command',
    titleEn: 'Edit the 3D Room via Live Chat Command',
    titleFa: 'ویرایش اتصالات اتاق با دستور چت هوشمند',
    xp: 350,
    completed: false
  }
];

function findMatchingNodesFromPrompt(
  prompt: string,
  nodes: CyberRoomNode[]
): CyberRoomNode[] {
  const norm = prompt.toLowerCase().trim();
  const matched: CyberRoomNode[] = [];

  for (const n of nodes) {
    const titleEn = n.item.titleEn.toLowerCase();
    const titleFa = n.item.titleFa.toLowerCase();
    const wordsEn = titleEn.split(/\s+/).filter((w) => w.length >= 4);
    const wordsFa = titleFa.split(/\s+/).filter((w) => w.length >= 3);

    const hitFull = norm.includes(titleEn) || norm.includes(titleFa) || norm.includes(n.id.toLowerCase());
    const hitWordEn = wordsEn.some((w) => norm.includes(w));
    const hitWordFa = wordsFa.some((w) => norm.includes(w));

    if (hitFull || hitWordEn || hitWordFa) {
      matched.push(n);
    }
  }
  return matched;
}

export interface ChatCommandExecutionResult {
  nextNodes: CyberRoomNode[];
  nextEdges: CyberRoomEdge[];
  animations: CyberEdgeAnimation[];
  replyEn: string;
  replyFa: string;
  badgeEn: string;
  badgeFa: string;
  focusNodeId?: string;
  teleportTo?: { x: number; z: number };
}

/**
 * Parses natural-language Persian or English chat commands and directly mutates
 * the 3D room's connections & nodes with dedicated 3D animations.
 */
export function executeCyberRoomChatCommand(
  rawInput: string,
  nodes: CyberRoomNode[],
  edges: CyberRoomEdge[],
  selectedNodeId: string | null
): ChatCommandExecutionResult {
  const text = rawInput.trim();
  const lower = text.toLowerCase();
  const activeNodes = nodes.filter((n) => n.activeInRoom);
  const mentioned = findMatchingNodesFromPrompt(text, nodes);

  const isDeleteIntent =
    /حذف|قطع|پاک|ببر|دیسکانکت|delete|remove|disconnect|sever|cut|clear/.test(lower);
  const isAddNodeIntent =
    /(اضافه.*گره|اضافه.*فیلم|بازگردانی|گره جدید|add node|spawn|restore)/.test(lower);
  const isRemoveNodeIntent = /(حذف.*گره|حذف.*فیلم|remove node|hide node)/.test(lower);
  const isColorOrEditIntent =
    /ویرایش|تغییر|رنگ|تقویت|سایبر|صورتی|آبی|طلایی|سبز|قرمز|بنفش|edit|color|boost|upgrade|cyan|magenta|pink|gold|amber|green|red|purple/.test(
      lower
    );
  const isWalkIntent = /برو|حرکت|پرش|تله‌پورت|نزدیک|walk|go to|teleport|move to/.test(lower);
  const isConnectAllIntent =
    /(همه.*وصل|اتصال.*همه|شبکه کامل|connect all|link all|mesh)/.test(lower);

  // 1. Teleport / Walk to a film terminal
  if (isWalkIntent && mentioned.length > 0) {
    const target = mentioned[0];
    return {
      nextNodes: nodes,
      nextEdges: edges,
      animations: [
        {
          id: `anim-walk-${Date.now()}`,
          type: 'edit',
          fromPos: { x: 0, y: 1.4, z: 0 },
          toPos: target.position,
          color: CYBER_PALETTE.cyan,
          startedAt: Date.now(),
          durationMs: 1400,
          labelEn: `Navigating to ${target.item.titleEn}`,
          labelFa: `حرکت به سمت پایانه «${target.item.titleFa}»`
        }
      ],
      replyEn: `Moved your cyber-avatar directly in front of "${target.item.titleEn}".`,
      replyFa: `آواتار شما در اتاق ۳بعدی به مقابل پایانه «${target.item.titleFa}» منتقل شد.`,
      badgeEn: 'AVATAR TELEPORTED',
      badgeFa: 'انتقال در اتاق ۳بعدی',
      focusNodeId: target.id,
      teleportTo: {
        x: target.position.x * 0.68,
        z: target.position.z * 0.68
      }
    };
  }

  // 2. Restore / Spawn a node in the 3D room
  if (isAddNodeIntent) {
    const hiddenNode = nodes.find((n) => !n.activeInRoom);
    if (hiddenNode) {
      const nextNodes = nodes.map((n) =>
        n.id === hiddenNode.id ? { ...n, activeInRoom: true, energyLevel: 1.5 } : n
      );
      const hub = activeNodes[0];
      const newEdge: CyberRoomEdge | null = hub
        ? {
            id: `edge-${hiddenNode.id}-${hub.id}-${Date.now()}`,
            fromId: hiddenNode.id,
            toId: hub.id,
            color: CYBER_PALETTE.emerald,
            strength: 2,
            labelEn: 'Spawned Neural Link',
            labelFa: 'اتصال پایانه جدید',
            createdAt: Date.now()
          }
        : null;
      return {
        nextNodes,
        nextEdges: newEdge ? [...edges, newEdge] : edges,
        animations: [
          {
            id: `anim-spawn-${Date.now()}`,
            type: 'spawn',
            fromPos: hiddenNode.position,
            toPos: hub ? hub.position : { x: 0, y: 2, z: 0 },
            color: CYBER_PALETTE.emerald,
            startedAt: Date.now(),
            durationMs: 1600,
            labelEn: `Spawned ${hiddenNode.item.titleEn}`,
            labelFa: `پایانه «${hiddenNode.item.titleFa}» وارد اتاق شد`
          }
        ],
        replyEn: `Materialized "${hiddenNode.item.titleEn}" into the 3D room and linked it to the neural grid.`,
        replyFa: `پایانه سه‌بعدی «${hiddenNode.item.titleFa}» با انیمیشن پرتو نوری در اتاق ساخته و به شبکه متصل شد.`,
        badgeEn: 'NODE MATERIALIZED',
        badgeFa: 'افزودن پایانه ۳بعدی',
        focusNodeId: hiddenNode.id
      };
    }
  }

  // 3. Remove a node from the 3D room
  if (isRemoveNodeIntent) {
    const target =
      mentioned[0] || activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[activeNodes.length - 1];
    if (target && activeNodes.length > 2) {
      const nextNodes = nodes.map((n) =>
        n.id === target.id ? { ...n, activeInRoom: false } : n
      );
      const nextEdges = edges.filter((e) => e.fromId !== target.id && e.toId !== target.id);
      return {
        nextNodes,
        nextEdges,
        animations: [
          {
            id: `anim-del-node-${Date.now()}`,
            type: 'delete',
            fromPos: target.position,
            toPos: { x: 0, y: 2, z: 0 },
            color: CYBER_PALETTE.crimson,
            startedAt: Date.now(),
            durationMs: 1500,
            labelEn: `Deconstructed ${target.item.titleEn}`,
            labelFa: `حذف پایانه «${target.item.titleFa}»`
          }
        ],
        replyEn: `Deconstructed terminal "${target.item.titleEn}" and dissolved its neural links.`,
        replyFa: `پایانه «${target.item.titleFa}» و اتصالات آن با انیمیشن فروپاشی سایبری از اتاق حذف شدند.`,
        badgeEn: 'NODE REMOVED',
        badgeFa: 'حذف پایانه و اتصالات'
      };
    }
  }

  // 4. Delete / Sever Connection(s)
  if (isDeleteIntent) {
    if (mentioned.length >= 2) {
      const [a, b] = mentioned;
      const targetEdge = edges.find(
        (e) =>
          (e.fromId === a.id && e.toId === b.id) || (e.fromId === b.id && e.toId === a.id)
      );
      if (targetEdge) {
        return {
          nextNodes: nodes,
          nextEdges: edges.filter((e) => e.id !== targetEdge.id),
          animations: [
            {
              id: `anim-del-${Date.now()}`,
              type: 'delete',
              fromPos: a.position,
              toPos: b.position,
              color: CYBER_PALETTE.crimson,
              startedAt: Date.now(),
              durationMs: 1500,
              labelEn: `Severed ${a.item.titleEn} ✕ ${b.item.titleEn}`,
              labelFa: `قطع اتصال «${a.item.titleFa}» و «${b.item.titleFa}»`
            }
          ],
          replyEn: `Severed the cyberpunk conduit between "${a.item.titleEn}" and "${b.item.titleEn}".`,
          replyFa: `اتصال سایبرپانکی بین «${a.item.titleFa}» و «${b.item.titleFa}» با انیمیشن قطع پلاسما حذف شد.`,
          badgeEn: 'CONDUIT SEVERED',
          badgeFa: 'حذف اتصال ۳بعدی'
        };
      }
    }

    const focusNode =
      mentioned[0] ||
      activeNodes.find((n) => n.id === selectedNodeId) ||
      activeNodes[0];

    const edgeToDelete =
      edges.find((e) => focusNode && (e.fromId === focusNode.id || e.toId === focusNode.id)) ||
      edges[edges.length - 1];

    if (edgeToDelete) {
      const nA = nodes.find((n) => n.id === edgeToDelete.fromId) || activeNodes[0];
      const nB = nodes.find((n) => n.id === edgeToDelete.toId) || activeNodes[1] || activeNodes[0];
      return {
        nextNodes: nodes,
        nextEdges: edges.filter((e) => e.id !== edgeToDelete.id),
        animations: [
          {
            id: `anim-del-${Date.now()}`,
            type: 'delete',
            fromPos: nA.position,
            toPos: nB.position,
            color: CYBER_PALETTE.crimson,
            startedAt: Date.now(),
            durationMs: 1500,
            labelEn: `Severed ${nA.item.titleEn} ✕ ${nB.item.titleEn}`,
            labelFa: `قطع اتصال «${nA.item.titleFa}» و «${nB.item.titleFa}»`
          }
        ],
        replyEn: `Severed neural link between "${nA.item.titleEn}" and "${nB.item.titleEn}" with glitch-dissolve animation.`,
        replyFa: `اتصال بین «${nA.item.titleFa}» و «${nB.item.titleFa}» با انیمیشن فروپاشی نوری قطع و حذف شد.`,
        badgeEn: 'LINK DELETED',
        badgeFa: 'اتصال حذف شد'
      };
    }
  }

  // 5. Edit Color / Bandwidth of Connections
  if (isColorOrEditIntent && !/وصل|بساز|connect|link/.test(lower)) {
    let pickedColor: string = CYBER_PALETTE.magenta;
    let colorNameEn = 'Cyber Magenta';
    let colorNameFa = 'صورتی نئونی سایبرپانک';

    if (/آبی|فیروزه|cyan|blue/.test(lower)) {
      pickedColor = CYBER_PALETTE.cyan;
      colorNameEn = 'Electric Cyan';
      colorNameFa = 'فیروزه‌ای نئونی';
    } else if (/طلایی|زرد|gold|amber|yellow/.test(lower)) {
      pickedColor = CYBER_PALETTE.amber;
      colorNameEn = 'Solar Amber';
      colorNameFa = 'طلایی سایبر';
    } else if (/سبز|زمرد|green|emerald/.test(lower)) {
      pickedColor = CYBER_PALETTE.emerald;
      colorNameEn = 'Matrix Emerald';
      colorNameFa = 'سبز نئونی';
    } else if (/بنفش|purple|violet/.test(lower)) {
      pickedColor = CYBER_PALETTE.violet;
      colorNameEn = 'Quantum Violet';
      colorNameFa = 'بنفش کوانتومی';
    }

    const targetNode = mentioned[0] || activeNodes.find((n) => n.id === selectedNodeId);
    const updatedEdges = edges.map((e) => {
      if (!targetNode || e.fromId === targetNode.id || e.toId === targetNode.id) {
        return {
          ...e,
          color: pickedColor,
          strength: Math.min(3, e.strength + 1),
          labelEn: `Upgraded ${colorNameEn} Conduit`,
          labelFa: `اتصال ارتقایافته (${colorNameFa})`
        };
      }
      return e;
    });

    const sampleEdge =
      updatedEdges.find((e) => !targetNode || e.fromId === targetNode.id || e.toId === targetNode.id) ||
      updatedEdges[0];
    const nA = nodes.find((n) => n.id === sampleEdge?.fromId) || activeNodes[0];
    const nB = nodes.find((n) => n.id === sampleEdge?.toId) || activeNodes[1] || activeNodes[0];

    const updatedNodes = nodes.map((n) =>
      !targetNode || n.id === targetNode.id
        ? { ...n, customColor: pickedColor, energyLevel: 1.75 }
        : n
    );

    return {
      nextNodes: updatedNodes,
      nextEdges: updatedEdges,
      animations: [
        {
          id: `anim-edit-${Date.now()}`,
          type: 'edit',
          fromPos: nA.position,
          toPos: nB.position,
          color: pickedColor,
          startedAt: Date.now(),
          durationMs: 1600,
          labelEn: `Re-modulated Conduits → ${colorNameEn}`,
          labelFa: `ویرایش و تقویت اتصالات به ${colorNameFa}`
        }
      ],
      replyEn: `Edited neural conduits to ${colorNameEn} and boosted signal bandwidth across the room.`,
      replyFa: `اتصالات اتاق با موج انرژی ویرایش شدند، رنگ به «${colorNameFa}» تغییر یافت و پهنای باند تقویت شد.`,
      badgeEn: 'CONDUITS EDITED',
      badgeFa: 'ویرایش اتصال انجام شد'
    };
  }

  // 6. Connect All / Cluster Mesh
  if (isConnectAllIntent && activeNodes.length >= 2) {
    const focus = activeNodes.find((n) => n.id === selectedNodeId) || activeNodes[0];
    const newEdges = [...edges];
    const anims: CyberEdgeAnimation[] = [];

    activeNodes.forEach((other) => {
      if (other.id === focus.id) return;
      const exists = newEdges.some(
        (e) =>
          (e.fromId === focus.id && e.toId === other.id) ||
          (e.fromId === other.id && e.toId === focus.id)
      );
      if (!exists) {
        newEdges.push({
          id: `edge-${focus.id}-${other.id}-${Date.now()}`,
          fromId: focus.id,
          toId: other.id,
          color: CYBER_PALETTE.cyan,
          strength: 3,
          labelEn: 'Full Starburst Neural Link',
          labelFa: 'اتصال ستاره‌ای کامل',
          createdAt: Date.now()
        });
        anims.push({
          id: `anim-burst-${other.id}-${Date.now()}`,
          type: 'create',
          fromPos: focus.position,
          toPos: other.position,
          color: CYBER_PALETTE.cyan,
          startedAt: Date.now(),
          durationMs: 1700,
          labelEn: `Linked ${focus.item.titleEn} ⚡ ${other.item.titleEn}`,
          labelFa: `اتصال «${focus.item.titleFa}» ⚡ «${other.item.titleFa}»`
        });
      }
    });

    return {
      nextNodes: nodes,
      nextEdges: newEdges,
      animations:
        anims.length > 0
          ? anims
          : [
              {
                id: `anim-burst-edit-${Date.now()}`,
                type: 'edit',
                fromPos: focus.position,
                toPos: activeNodes[1].position,
                color: CYBER_PALETTE.cyan,
                startedAt: Date.now(),
                durationMs: 1500,
                labelEn: `Synchronized Starburst Hub: ${focus.item.titleEn}`,
                labelFa: `همگام‌سازی کامل شبکه مرکزی «${focus.item.titleFa}»`
              }
            ],
      replyEn: `Connected "${focus.item.titleEn}" to all active terminals in the 3D room with synchronized laser conduits.`,
      replyFa: `پایانه «${focus.item.titleFa}» با انیمیشن پرتوهای هم‌زمان به تمامی فیلم‌های داخل اتاق ۳بعدی متصل شد.`,
      badgeEn: 'STARBURST LINKED',
      badgeFa: 'اتصال دسته‌جمعی انجام شد',
      focusNodeId: focus.id
    };
  }

  // 7. Default / Connect Two Specific or Selected Nodes
  const sourceNode =
    mentioned[0] ||
    activeNodes.find((n) => n.id === selectedNodeId) ||
    activeNodes[0];

  const targetNode =
    mentioned[1] ||
    activeNodes.find(
      (n) =>
        n.id !== sourceNode.id &&
        !edges.some(
          (e) =>
            (e.fromId === sourceNode.id && e.toId === n.id) ||
            (e.fromId === n.id && e.toId === sourceNode.id)
        )
    ) ||
    activeNodes.find((n) => n.id !== sourceNode.id) ||
    sourceNode;

  const existingEdge = edges.find(
    (e) =>
      (e.fromId === sourceNode.id && e.toId === targetNode.id) ||
      (e.fromId === targetNode.id && e.toId === sourceNode.id)
  );

  if (existingEdge) {
    const upgradedColor =
      existingEdge.color === CYBER_PALETTE.cyan ? CYBER_PALETTE.magenta : CYBER_PALETTE.cyan;
    const nextEdges = edges.map((e) =>
      e.id === existingEdge.id
        ? {
            ...e,
            color: upgradedColor,
            strength: 3,
            labelEn: 'Hyper-Synced Neural Conduit',
            labelFa: 'اتصال ابرتقویت‌شده سایبری'
          }
        : e
    );
    return {
      nextNodes: nodes,
      nextEdges,
      animations: [
        {
          id: `anim-upgrade-${Date.now()}`,
          type: 'edit',
          fromPos: sourceNode.position,
          toPos: targetNode.position,
          color: upgradedColor,
          startedAt: Date.now(),
          durationMs: 1600,
          labelEn: `Upgraded Link: ${sourceNode.item.titleEn} ⚡ ${targetNode.item.titleEn}`,
          labelFa: `ارتقای اتصال «${sourceNode.item.titleFa}» و «${targetNode.item.titleFa}»`
        }
      ],
      replyEn: `Upgraded the existing connection between "${sourceNode.item.titleEn}" and "${targetNode.item.titleEn}" to max bandwidth.`,
      replyFa: `اتصال بین «${sourceNode.item.titleFa}» و «${targetNode.item.titleFa}» با انیمیشن پالس نئونی ویرایش و به حداکثر قدرت ارتقا یافت.`,
      badgeEn: 'LINK UPGRADED',
      badgeFa: 'اتصال ویرایش و تقویت شد',
      focusNodeId: targetNode.id
    };
  }

  const newEdge: CyberRoomEdge = {
    id: `edge-${sourceNode.id}-${targetNode.id}-${Date.now()}`,
    fromId: sourceNode.id,
    toId: targetNode.id,
    color: CYBER_PALETTE.cyan,
    strength: 3,
    labelEn: 'Custom AI Chat Synapse',
    labelFa: 'اتصال سفارشی ساخته‌شده با چت',
    createdAt: Date.now()
  };

  return {
    nextNodes: nodes,
    nextEdges: [...edges, newEdge],
    animations: [
      {
        id: `anim-create-${Date.now()}`,
        type: 'create',
        fromPos: sourceNode.position,
        toPos: targetNode.position,
        color: CYBER_PALETTE.cyan,
        startedAt: Date.now(),
        durationMs: 1650,
        labelEn: `Connected ${sourceNode.item.titleEn} ⚡ ${targetNode.item.titleEn}`,
        labelFa: `اتصال جدید: «${sourceNode.item.titleFa}» ⚡ «${targetNode.item.titleFa}»`
      }
    ],
    replyEn: `Created a new 3D cyberpunk connection between "${sourceNode.item.titleEn}" and "${targetNode.item.titleEn}".`,
    replyFa: `اتصال سه‌بعدی جدید بین «${sourceNode.item.titleFa}» و «${targetNode.item.titleFa}» با انیمیشن پرتو سایبرپانکی برقرار شد.`,
    badgeEn: 'NEW LINK FORGED',
    badgeFa: 'اتصال جدید برقرار شد',
    focusNodeId: targetNode.id
  };
}
