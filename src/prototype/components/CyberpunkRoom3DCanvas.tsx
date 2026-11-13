import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import type {
  CyberEdgeAnimation,
  CyberRoomEdge,
  CyberRoomNode
} from '../cyberpunkRoomEngine';

export interface PlayerMoveInput {
  forward: number; // -1 to 1
  strafe: number; // -1 to 1
  turn: number; // -1 to 1
}

interface CyberpunkRoom3DCanvasProps {
  nodes: CyberRoomNode[];
  edges: CyberRoomEdge[];
  animations: CyberEdgeAnimation[];
  selectedNodeId: string | null;
  connectSourceNodeId: string | null;
  cameraMode: 'room_game' | 'orbit_overview';
  moveInputRef: React.MutableRefObject<PlayerMoveInput>;
  teleportRequest: { x: number; z: number; seq: number } | null;
  onSelectNode: (nodeId: string) => void;
  onEnterRoomAtNode: (nodeId: string) => void;
}

// Pre-allocated math objects outside the animation loop (Zero GC in tick)
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();
const _desiredCamPos = new THREE.Vector3();
const _desiredLookAt = new THREE.Vector3();
const _mouse = new THREE.Vector2();

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

/**
 * Post-Processing Shader:
 * Clinical Delos Color Grading, Subtle Peripheral Depth-of-Field Softness & Fine Film Grain
 */
const DelosAtmosphericShader = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uGrainIntensity: { value: 0.022 }
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uGrainIntensity;
    varying vec2 vUv;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 center = vUv - vec2(0.5);
      float radialDist = length(center);

      // Subtle depth-of-field chromatic softness toward periphery
      float shift = smoothstep(0.26, 0.82, radialDist) * 0.0014;
      vec4 baseCol;
      baseCol.r = texture2D(tDiffuse, vUv + center * shift).r;
      baseCol.g = texture2D(tDiffuse, vUv).g;
      baseCol.b = texture2D(tDiffuse, vUv - center * shift).b;
      baseCol.a = 1.0;

      // Subtle volumetric shimmer around the holographic globe region
      float shimmer = exp(-pow((vUv.y - 0.48) * 14.0, 2.0)) * exp(-pow((vUv.x - 0.65) * 3.0, 2.0));
      baseCol.rgb += vec3(0.18, 0.95, 0.78) * shimmer * 0.032;

      // Fine clinical film grain
      float noise = hash(vUv * 680.0 + vec2(sin(uTime * 13.0), cos(uTime * 19.0))) - 0.5;
      baseCol.rgb += noise * uGrainIntensity;

      // Natural subterranean vignette
      float vig = smoothstep(0.95, 0.28, radialDist);
      baseCol.rgb *= mix(0.68, 1.0, vig);

      gl_FragColor = baseCol;
    }
  `
};

/**
 * Raw Board-Formed Cast Concrete Texture (Brutalist "Westworld" Delos Facility Walls & Pillars)
 * Matte grey finish showing subtle imperfections, form-board seams, and tie-rod holes
 */
function createBoardFormedConcreteTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Base matte grey cast concrete
  ctx.fillStyle = '#262c34';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle concrete mottling & aggregate texture
  for (let i = 0; i < 6500; i++) {
    const x = (i * 173) % 1024;
    const y = (i * 281) % 1024;
    const w = 4 + (i % 18);
    const h = 3 + (i % 12);
    const shade = i % 3 === 0 ? 'rgba(15, 19, 24, 0.18)' : 'rgba(62, 72, 84, 0.14)';
    ctx.fillStyle = shade;
    ctx.fillRect(x, y, w, h);
  }

  // Horizontal board-formed shuttering seams & subtle plank grain variations
  const plankHeight = 128;
  for (let py = 0; py < 1024; py += plankHeight) {
    ctx.fillStyle =
      (py / plankHeight) % 2 === 0
        ? 'rgba(255, 255, 255, 0.025)'
        : 'rgba(0, 0, 0, 0.04)';
    ctx.fillRect(0, py, 1024, plankHeight);

    // Recessed horizontal mortar/form joint line
    ctx.strokeStyle = '#15191f';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(1024, py);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, py + 3);
    ctx.lineTo(1024, py + 3);
    ctx.stroke();
  }

  // Vertical concrete panel joints
  for (let px = 0; px <= 1024; px += 256) {
    ctx.strokeStyle = '#14181e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, 1024);
    ctx.stroke();

    // Formwork tie-rod conical holes (signature brutalist architectural detail)
    for (let py = 64; py < 1024; py += 128) {
      for (const offsetX of [36, 220]) {
        const hx = (px + offsetX) % 1024;
        ctx.fillStyle = '#0e1116';
        ctx.beginPath();
        ctx.arc(hx, py, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38414d';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Dark Polished Obsidian-Concrete Floor Slabs with Satin Sheen & Subtle Imperfections
 */
function createPolishedObsidianConcreteFloorTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark obsidian-slate concrete base
  ctx.fillStyle = '#0c1016';
  ctx.fillRect(0, 0, 1024, 1024);

  // Subtle stone/concrete surface mottling
  for (let i = 0; i < 4800; i++) {
    const x = (i * 197) % 1024;
    const y = (i * 313) % 1024;
    const r = 6 + (i % 24);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(26, 34, 44, 0.14)' : 'rgba(5, 7, 10, 0.18)';
    ctx.fillRect(x, y, r, r * 0.6);
  }

  // Large architectural stone slab seams (2x2 slabs per tile)
  ctx.strokeStyle = '#05070a';
  ctx.lineWidth = 4;
  for (let i = 0; i <= 1024; i += 512) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  // Subtle bevel highlight along slab edges
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.lineWidth = 1.5;
  for (let i = 4; i <= 1024; i += 512) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, 1024);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(1024, i);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Intricate Glowing Cyan & Amber Circuit-Like Patterns Flush with the Floor
 * (Matches the exact concentric rings, 45-degree PCB traces, and pads in image_f66af8e2.jpeg!)
 */
function createFlushFloorCircuitOverlayTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 1024);
  const cx = 512;
  const cy = 512;

  // 1. Inner Warm Amber Glowing Ring around the Stepped Pedestal Base
  ctx.strokeStyle = '#F5B942';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(cx, cy, 224, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Primary Concentric Neon Cyan Circuit Ring + Segmented Arcs
  ctx.strokeStyle = '#00F0FF';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.arc(cx, cy, 268, 0, Math.PI * 2);
  ctx.stroke();

  ctx.lineWidth = 3.5;
  for (let a = 0; a < 8; a++) {
    const startAngle = (a / 8) * Math.PI * 2 + 0.08;
    const endAngle = startAngle + (Math.PI / 4) * 0.72;
    ctx.strokeStyle = a % 2 === 0 ? '#00F0FF' : '#F5B942';
    ctx.beginPath();
    ctx.arc(cx, cy, 294, startAngle, endAngle);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(0, 240, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(cx, cy, 318, startAngle + 0.05, endAngle - 0.05);
    ctx.stroke();
  }

  // 3. Intricate 45-Degree Geometric PCB Circuit Traces & Terminal Pads radiating outward
  for (let branch = 0; branch < 16; branch++) {
    const baseAng = (branch / 16) * Math.PI * 2;
    const isAmber = branch % 3 === 0;
    ctx.strokeStyle = isAmber ? '#F5B942' : '#00F0FF';
    ctx.fillStyle = isAmber ? '#F5B942' : '#00F0FF';
    ctx.lineWidth = branch % 2 === 0 ? 4 : 2.5;

    const r0 = 294;
    const r1 = 365;
    const r2 = 430;
    const r3 = 496;
    const bendAng = baseAng + (branch % 2 === 0 ? 0.11 : -0.11);

    const x0 = cx + Math.cos(baseAng) * r0;
    const y0 = cy + Math.sin(baseAng) * r0;
    const x1 = cx + Math.cos(baseAng) * r1;
    const y1 = cy + Math.sin(baseAng) * r1;
    const x2 = cx + Math.cos(bendAng) * r2;
    const y2 = cy + Math.sin(bendAng) * r2;
    const x3 = cx + Math.cos(bendAng) * r3;
    const y3 = cy + Math.sin(bendAng) * r3;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.stroke();

    // Rectangular circuit pad at end of trace
    ctx.fillRect(x3 - 5, y3 - 5, 10, 10);

    // Parallel sub-traces with circular nodes
    for (const subOffset of [-0.035, 0.035]) {
      const sa = baseAng + subOffset;
      const sx1 = cx + Math.cos(sa) * 320;
      const sy1 = cy + Math.sin(sa) * 320;
      const sx2 = cx + Math.cos(sa) * 410;
      const sy2 = cy + Math.sin(sa) * 410;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx1, sy1);
      ctx.lineTo(sx2, sy2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sx2, sy2, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Procedural Dotted & Grid Continent Texture for the Massive Holographic Globe
 */
function createHolographicGlobeTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 1024, 512);

  // Subtle translucent aqua-emerald holographic ocean tint
  ctx.fillStyle = 'rgba(0, 180, 195, 0.14)';
  ctx.fillRect(0, 0, 1024, 512);

  // Latitude & Longitude Grid Lines
  ctx.strokeStyle = 'rgba(92, 238, 255, 0.28)';
  ctx.lineWidth = 1.2;
  for (let x = 0; x <= 1024; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // Stylized Continent Silhouettes rendered as high-density glowing cyan/emerald dot matrices
  const continentEllipses = [
    // North America
    { cx: 220, cy: 165, rx: 95, ry: 68 },
    { cx: 170, cy: 120, rx: 65, ry: 40 },
    // South America
    { cx: 310, cy: 335, rx: 52, ry: 95 },
    // Europe & Africa
    { cx: 520, cy: 145, rx: 72, ry: 48 },
    { cx: 535, cy: 290, rx: 68, ry: 98 },
    // Asia
    { cx: 710, cy: 165, rx: 135, ry: 78 },
    { cx: 785, cy: 235, rx: 68, ry: 48 },
    // Australia
    { cx: 835, cy: 365, rx: 52, ry: 38 }
  ];

  for (let gx = 4; gx < 1024; gx += 6) {
    for (let gy = 4; gy < 512; gy += 6) {
      let inside = false;
      for (const c of continentEllipses) {
        const dx = (gx - c.cx) / c.rx;
        const dy = (gy - c.cy) / c.ry;
        const wobble = Math.sin(gx * 0.06) * 0.15 + Math.cos(gy * 0.08) * 0.15;
        if (dx * dx + dy * dy < 1.0 + wobble) {
          inside = true;
          break;
        }
      }
      if (inside) {
        ctx.fillStyle = (gx + gy) % 18 === 0 ? '#FCEE09' : '#67FFE8';
        ctx.fillRect(gx, gy, 3.5, 3.5);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Yellow & Green-Cyan Holographic Orbital Film-Strip / Diagnostic Ring Texture
 * (Encasing the Holographic Globe just like in image_f66af8e2.jpeg!)
 */
function createGlobeOrbitalBandTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 2048, 256);

  // Translucent emerald-gold holographic band fill
  const bg = ctx.createLinearGradient(0, 0, 0, 256);
  bg.addColorStop(0, 'rgba(250, 225, 75, 0.35)');
  bg.addColorStop(0.25, 'rgba(72, 255, 195, 0.22)');
  bg.addColorStop(0.75, 'rgba(72, 255, 195, 0.22)');
  bg.addColorStop(1, 'rgba(250, 225, 75, 0.35)');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 6, 2048, 244);

  // Glowing yellow-gold outer rails
  ctx.fillStyle = '#FFF066';
  ctx.fillRect(0, 4, 2048, 9);
  ctx.fillRect(0, 243, 2048, 9);

  // Inner glowing green-cyan rails
  ctx.fillStyle = '#52FFD8';
  ctx.fillRect(0, 38, 2048, 4);
  ctx.fillRect(0, 214, 2048, 4);

  // Sprocket / Telemetry tick marks along top & bottom edges
  for (let x = 14; x < 2048; x += 40) {
    ctx.fillStyle = '#FFF066';
    ctx.fillRect(x, 16, 20, 16);
    ctx.fillRect(x, 224, 20, 16);
    ctx.clearRect(x + 3, 19, 14, 10);
    ctx.clearRect(x + 3, 227, 14, 10);
  }

  // Segmented holographic frame windows
  const frameW = 160;
  for (let fx = 8; fx < 2048; fx += frameW) {
    ctx.fillStyle = '#FFF066';
    ctx.fillRect(fx, 40, 6, 176);

    ctx.strokeStyle = 'rgba(82, 255, 216, 0.8)';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(fx + 10, 48, frameW - 20, 160);

    // Subtle diagnostic waveform inside each window
    ctx.strokeStyle = 'rgba(255, 240, 102, 0.65)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(fx + 18, 128);
    ctx.quadraticCurveTo(fx + frameW * 0.5, 82, fx + frameW - 22, 132);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.repeat.set(2, 1);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Sleek Minimalist Delos Glass Holographic Diagnostic HUD Panel Texture on Pedestals
 * (Matches the dark smoked-glass diagnostic screens in front of the stasis chambers in image_f66af8e2.jpeg)
 */
function createDelosDiagnosticHudTexture(
  node: CyberRoomNode,
  isSelected: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 380;
  const ctx = canvas.getContext('2d')!;

  const drawHud = (img?: HTMLImageElement) => {
    ctx.clearRect(0, 0, 640, 380);

    const r = 24;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(8, 8, 624, 364, r);
    ctx.clip();

    // Smoked clinical glass background
    const bgGrad = ctx.createLinearGradient(0, 0, 640, 380);
    bgGrad.addColorStop(0, 'rgba(14, 22, 30, 0.86)');
    bgGrad.addColorStop(0.5, 'rgba(9, 14, 20, 0.90)');
    bgGrad.addColorStop(1, 'rgba(12, 19, 27, 0.88)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(8, 8, 624, 364);

    // Top Delos Diagnostic Header
    ctx.fillStyle = isSelected ? '#F5B942' : '#52FFD8';
    ctx.beginPath();
    ctx.arc(34, 34, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#CBD5E1';
    ctx.font = 'bold 15px "Courier Prime", monospace';
    ctx.fillText(`DELOS // STASIS DIAGNOSTIC · ${node.id.toUpperCase()}`, 48, 39);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(24, 54);
    ctx.lineTo(616, 54);
    ctx.stroke();

    // Left Half (x = 26..336): Film Poster Preview + Title
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(26, 68, 304, 196, 14);
      ctx.clip();
      ctx.drawImage(img, 26, 68, 304, 196);
      ctx.restore();
    } else {
      ctx.fillStyle = '#111b27';
      ctx.beginPath();
      ctx.roundRect(26, 68, 304, 196, 14);
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(82, 255, 216, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(26, 68, 304, 196, 14);
    ctx.stroke();

    // Right Half (x = 352..608): Vertical Cyan-Green Bar Charts & Diagnostic Sine Waveform
    // (Matches the exact bar chart + waveform layout on the HUD screens in image_f66af8e2.jpeg!)
    const bars = [42, 68, 54, 86, 62, 94, 76, 58, 88, 72, 64, 82, 50];
    bars.forEach((bh, idx) => {
      const bx = 356 + idx * 19;
      const by = 178 - bh;
      ctx.fillStyle = idx % 4 === 0 ? '#F5B942' : '#52FFD8';
      ctx.fillRect(bx, by, 11, bh);
    });

    // Diagnostic Sine Wave Line below the bar chart
    ctx.strokeStyle = '#52FFD8';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    const wavePts = [
      [356, 232],
      [392, 208],
      [428, 240],
      [468, 204],
      [508, 238],
      [548, 212],
      [596, 230]
    ];
    wavePts.forEach(([wx, wy], i) => {
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    });
    ctx.stroke();

    // Small diagnostic pill buttons at bottom-right of HUD
    ctx.fillStyle = 'rgba(82, 255, 216, 0.14)';
    ctx.beginPath();
    ctx.roundRect(356, 266, 116, 30, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(82, 255, 216, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#52FFD8';
    ctx.font = 'bold 13px "Courier Prime", monospace';
    ctx.fillText(`SYNC ${node.score}%`, 374, 286);

    ctx.fillStyle = 'rgba(245, 185, 66, 0.16)';
    ctx.beginPath();
    ctx.roundRect(484, 266, 116, 30, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 185, 66, 0.5)';
    ctx.stroke();
    ctx.fillStyle = '#F5B942';
    ctx.fillText(node.item.quality, 506, 286);

    // Bottom Left: Film Title in Cinema Typography
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 22px "Lalezar", "Changa", "Cinzel", sans-serif';
    ctx.fillText(node.item.titleFa.slice(0, 26), 28, 314);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 15px "Cinzel", "Montserrat", serif';
    ctx.fillText(node.item.titleEn.slice(0, 34), 28, 342);

    ctx.restore();

    // Outer glass rim
    ctx.strokeStyle = isSelected
      ? 'rgba(245, 185, 66, 0.85)'
      : 'rgba(148, 163, 184, 0.42)';
    ctx.lineWidth = isSelected ? 3.5 : 2;
    ctx.beginPath();
    ctx.roundRect(8, 8, 624, 364, r);
    ctx.stroke();
  };

  drawHud();
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    drawHud(img);
    tex.needsUpdate = true;
  };
  img.src = node.item.posterUrl;

  return tex;
}

/**
 * Glowing Bio-Particles & Dark Liquid Texture inside the Cylindrical Host Stasis Chambers
 */
function createStasisChamberLiquidTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, 'rgba(6, 16, 26, 0.92)');
  grad.addColorStop(0.5, 'rgba(10, 28, 42, 0.88)');
  grad.addColorStop(1, 'rgba(5, 14, 22, 0.94)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  // Subtle vertical central amber/cyan light filament inside the stasis tank
  const centerGlow = ctx.createLinearGradient(220, 0, 292, 0);
  centerGlow.addColorStop(0, 'rgba(0, 240, 255, 0)');
  centerGlow.addColorStop(0.5, 'rgba(245, 185, 66, 0.32)');
  centerGlow.addColorStop(1, 'rgba(0, 240, 255, 0)');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(220, 80, 72, 360);

  // Suspended glowing cyan & warm gold stasis particles
  for (let i = 0; i < 120; i++) {
    const px = (i * 137) % 500 + 6;
    const py = (i * 229) % 490 + 10;
    const rad = 1.2 + (i % 3) * 1.1;
    ctx.fillStyle = i % 5 === 0 ? '#F5B942' : '#67FFE8';
    ctx.beginPath();
    ctx.arc(px, py, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function CyberpunkRoom3DCanvas({
  nodes,
  edges,
  animations,
  selectedNodeId,
  connectSourceNodeId,
  cameraMode,
  moveInputRef,
  teleportRequest,
  onSelectNode,
  onEnterRoomAtNode
}: CyberpunkRoom3DCanvasProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;
  const edgesRef = useRef(edges);
  edgesRef.current = edges;
  const animationsRef = useRef(animations);
  animationsRef.current = animations;
  const selectedNodeIdRef = useRef(selectedNodeId);
  selectedNodeIdRef.current = selectedNodeId;
  const connectSourceNodeIdRef = useRef(connectSourceNodeId);
  connectSourceNodeIdRef.current = connectSourceNodeId;
  const cameraModeRef = useRef(cameraMode);
  cameraModeRef.current = cameraMode;

  const onSelectNodeRef = useRef(onSelectNode);
  onSelectNodeRef.current = onSelectNode;
  const onEnterRoomAtNodeRef = useRef(onEnterRoomAtNode);
  onEnterRoomAtNodeRef.current = onEnterRoomAtNode;

  const rebuildGraphFnRef = useRef<(() => void) | null>(null);

  // Initial wide-angle camera positioned to match image_f66af8e2.jpeg:
  // Showing the glowing floor circuit traces & Holographic Globe with yellow/green orbital rings on the right,
  // and the towering Brutalist Concrete Pillars, Cylindrical Stasis Chambers, HUD Pedestals & Ceiling Trays!
  const playerStateRef = useRef({
    x: -2.35,
    z: 7.85,
    yaw: Math.PI - 0.14,
    pitch: 0.02,
    orbitYaw: -0.25,
    orbitPitch: 0.34,
    orbitDistance: 13.5
  });

  useEffect(() => {
    rebuildGraphFnRef.current?.();
  }, [nodes, edges, selectedNodeId, connectSourceNodeId]);

  useEffect(() => {
    if (!teleportRequest) return;
    playerStateRef.current.x = teleportRequest.x * 0.56;
    playerStateRef.current.z = teleportRequest.z * 0.56;
    playerStateRef.current.yaw = Math.atan2(teleportRequest.x, teleportRequest.z);
  }, [teleportRequest]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 620;
    renderer.setSize(width, height);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Moody clinical subterranean atmosphere
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0b0f15);
    scene.fog = new THREE.FogExp2(0x0b0f15, 0.014);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    const envTarget = pmremGenerator.fromScene(new RoomEnvironment(), 0.035);
    scene.environment = envTarget.texture;
    pmremGenerator.dispose();

    const camera = new THREE.PerspectiveCamera(56, width / height, 0.1, 130);
    camera.position.set(-2.35, 2.25, 7.85);

    // =========================================================================
    // POST-PROCESSING: SUBTLE CINEMATIC BLOOM + DELOS ATMOSPHERIC GRADING
    // =========================================================================
    let composer: EffectComposer | null = null;
    let bloomPass: UnrealBloomPass | null = null;
    let delosPass: ShaderPass | null = null;

    if (!isSoftwareGl) {
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));

      bloomPass = new UnrealBloomPass(
        new THREE.Vector2(width, height),
        0.52,
        0.44,
        0.76
      );
      composer.addPass(bloomPass);

      delosPass = new ShaderPass(DelosAtmosphericShader);
      composer.addPass(delosPass);
    }

    // =========================================================================
    // CLINICAL ANTISEPTIC WHITE-BLUE LIGHTING + WARM AMBER & EMERALD ACCENTS
    // =========================================================================
    const hemiLight = new THREE.HemisphereLight(0xdbeafe, 0x0d121a, 1.15);
    scene.add(hemiLight);

    // Cool antiseptic white-blue directional studio light casting crisp shadows on concrete
    const antisepticLight = new THREE.DirectionalLight(0xe0f2fe, 2.1);
    antisepticLight.position.set(-12, 22, 10);
    scene.add(antisepticLight);

    // Secondary cool blue fill light
    const coolBlueFill = new THREE.DirectionalLight(0x38bdf8, 1.25);
    coolBlueFill.position.set(14, 16, -12);
    scene.add(coolBlueFill);

    // Voluminous emerald-gold point light inside the Holographic Globe
    const globeCoreLight = new THREE.PointLight(0x52ffd8, 5.2, 24, 1.25);
    globeCoreLight.position.set(0, 2.75, 0);
    scene.add(globeCoreLight);

    const amberFloorLight = new THREE.PointLight(0xf5b942, 3.2, 18, 1.4);
    amberFloorLight.position.set(0, 0.65, 0);
    scene.add(amberFloorLight);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    // Shared Brutalist Concrete & Heavy Industrial Steel Materials
    const concreteTex = createBoardFormedConcreteTexture(maxAniso);
    const brutalistConcreteMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      color: 0x6b7480,
      roughness: 0.86,
      metalness: 0.08
    });
    const darkConcreteCofferMat = new THREE.MeshStandardMaterial({
      map: concreteTex,
      color: 0x3b424c,
      roughness: 0.88,
      metalness: 0.12
    });
    const heavyIndustrialSteelMat = new THREE.MeshStandardMaterial({
      color: 0x262f3d,
      metalness: 0.86,
      roughness: 0.32,
      envMapIntensity: 1.6
    });
    const darkObsidianPedestalMat = new THREE.MeshStandardMaterial({
      color: 0x0d1219,
      metalness: 0.72,
      roughness: 0.24,
      envMapIntensity: 1.8
    });
    const cyanNeonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const amberNeonMat = new THREE.MeshBasicMaterial({ color: 0xf5b942 });
    const antisepticWhiteLedMat = new THREE.MeshBasicMaterial({ color: 0xf0f9ff });

    // =========================================================================
    // 1. BRUTALIST DELOS SUBTERRANEAN ARCHITECTURE:
    //    BOARD-FORMED CONCRETE WALLS & PILLARS, COFFERED CEILING, UTILITY TRACKS,
    //    AND TOWERING CYLINDRICAL GLASS-AND-STEEL HOST "STASIS" CHAMBERS
    // =========================================================================
    const facilityGroup = new THREE.Group();
    scene.add(facilityGroup);

    // A. Dark Polished Obsidian-Concrete Slab Floor with Subtle Satin Sheen
    const floorTex = createPolishedObsidianConcreteFloorTexture(maxAniso);
    const floorMat = new THREE.MeshPhysicalMaterial({
      map: floorTex,
      color: 0x121720,
      metalness: 0.45,
      roughness: 0.18,
      clearcoat: 0.78,
      clearcoatRoughness: 0.14,
      envMapIntensity: 1.9
    });
    const floorMesh = new THREE.Mesh(new THREE.CylinderGeometry(18.0, 18.0, 0.2, 64), floorMat);
    floorMesh.position.y = -0.1;
    facilityGroup.add(floorMesh);

    // Flush Glowing Cyan & Amber Circuit-Like Patterns embedded in the Floor around the Center!
    const circuitOverlayTex = createFlushFloorCircuitOverlayTexture(maxAniso);
    const circuitOverlayMat = new THREE.MeshBasicMaterial({
      map: circuitOverlayTex,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2
    });
    const circuitOverlayPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(14.6, 14.6),
      circuitOverlayMat
    );
    circuitOverlayPlane.rotation.x = -Math.PI / 2;
    circuitOverlayPlane.position.y = 0.015;
    facilityGroup.add(circuitOverlayPlane);

    // B. 12 Cavernous Brutalist Concrete Alcove Bays + Massive Cast-Concrete Pillars +
    //    Towering Cylindrical Glass-and-Steel Host "Stasis" Chambers (r = 15.6m)
    const wallRadius = 15.8;
    const bayCount = 12;
    const bayWidth = 2 * wallRadius * Math.tan(Math.PI / bayCount) + 0.3;
    const wallHeight = 9.4;

    const stasisLiquidTex = createStasisChamberLiquidTexture(maxAniso);
    const stasisLiquidMat = new THREE.MeshStandardMaterial({
      map: stasisLiquidTex,
      emissive: 0x00d8ff,
      emissiveMap: stasisLiquidTex,
      emissiveIntensity: 0.55,
      roughness: 0.2,
      metalness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    const stasisGlassMat = new THREE.MeshPhysicalMaterial({
      color: 0xcffafe,
      metalness: 0.05,
      roughness: 0.06,
      transmission: 0.72,
      transparent: true,
      opacity: 0.42,
      clearcoat: 1.0
    });

    const wallBackGeo = new THREE.PlaneGeometry(bayWidth, wallHeight);
    // Massive raw board-formed cast concrete pillars between alcoves
    const concretePillarGeo = new THREE.BoxGeometry(1.45, wallHeight, 1.85);
    // Deep heavy-duty concrete ceiling coffer beams
    const ceilingCofferBeamGeo = new THREE.BoxGeometry(0.95, 0.9, wallRadius + 1.0);

    // Stasis Chamber Geometries
    const stasisCapGeo = new THREE.CylinderGeometry(1.12, 1.18, 0.48, 32);
    const stasisCollarGeo = new THREE.CylinderGeometry(1.02, 1.02, 0.24, 32);
    const stasisLiquidGeo = new THREE.CylinderGeometry(0.86, 0.86, 4.9, 32);
    const stasisGlassGeo = new THREE.CylinderGeometry(0.96, 0.96, 5.0, 32, 1, true);
    const stasisSideStrutGeo = new THREE.BoxGeometry(0.18, 5.2, 0.28);

    for (let i = 0; i < bayCount; i++) {
      const angle = (i / bayCount) * Math.PI * 2;
      const wx = Math.cos(angle) * wallRadius;
      const wz = Math.sin(angle) * wallRadius;

      const bayGroup = new THREE.Group();
      bayGroup.position.set(wx, 0, wz);
      bayGroup.lookAt(0, 0, 0);

      // Raw Board-Formed Cast Concrete Wall
      const wallBack = new THREE.Mesh(wallBackGeo, brutalistConcreteMat);
      wallBack.position.y = wallHeight * 0.5;
      bayGroup.add(wallBack);

      // Massive Brutalist Concrete Pillar on Bay Seam
      const seamX = bayWidth * 0.49;
      const concretePillar = new THREE.Mesh(concretePillarGeo, brutalistConcreteMat);
      concretePillar.position.set(seamX, wallHeight * 0.5, 0.65);
      bayGroup.add(concretePillar);

      // Radial Heavy-Duty Concrete Coffer Beam across the high industrial ceiling
      const cofferBeam = new THREE.Mesh(ceilingCofferBeamGeo, darkConcreteCofferMat);
      cofferBeam.position.set(seamX, wallHeight - 0.5, (wallRadius - 1.0) * 0.5);
      bayGroup.add(cofferBeam);

      // Antiseptic Cool-White Linear Industrial Light Fixture mounted along the concrete ceiling beam
      if (i % 2 === 0) {
        const lightHousing = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.1, 2.5),
          heavyIndustrialSteelMat
        );
        lightHousing.position.set(0, 6.65, 2.2);
        bayGroup.add(lightHousing);

        const lightTube = new THREE.Mesh(
          new THREE.BoxGeometry(0.16, 0.04, 2.35),
          antisepticWhiteLedMat
        );
        lightTube.position.set(0, 6.59, 2.2);
        bayGroup.add(lightTube);
      }

      // Towering Cylindrical Glass-and-Steel Host "Stasis" Chamber in each Concrete Alcove!
      const stasisGroup = new THREE.Group();
      stasisGroup.position.set(0, 0, 1.05);
      bayGroup.add(stasisGroup);

      // Heavy Metal Bottom Pedestal & Mechanical Input Pipes
      const botCrown = new THREE.Mesh(stasisCapGeo, heavyIndustrialSteelMat);
      botCrown.position.y = 0.24;
      stasisGroup.add(botCrown);

      const botCollar = new THREE.Mesh(stasisCollarGeo, darkObsidianPedestalMat);
      botCollar.position.y = 0.56;
      stasisGroup.add(botCollar);

      // Mechanical input valves at bottom front of Stasis Chamber
      for (const vx of [-0.36, 0, 0.36]) {
        const mechInput = new THREE.Mesh(
          new THREE.BoxGeometry(0.14, 0.38, 0.28),
          heavyIndustrialSteelMat
        );
        mechInput.position.set(vx, 0.32, 1.05);
        stasisGroup.add(mechInput);
      }

      // Heavy Metal Top Crown with Mechanical Header Block
      const topCrown = new THREE.Mesh(stasisCapGeo, heavyIndustrialSteelMat);
      topCrown.position.y = 5.68;
      stasisGroup.add(topCrown);

      const topLatch = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.42, 0.3),
        heavyIndustrialSteelMat
      );
      topLatch.position.set(0, 5.7, 1.08);
      stasisGroup.add(topLatch);

      // Left & Right Heavy Metal Vertical Framing Struts clamping the Stasis Cylinder
      const leftStrut = new THREE.Mesh(stasisSideStrutGeo, heavyIndustrialSteelMat);
      leftStrut.position.set(-1.02, 3.05, 0);
      stasisGroup.add(leftStrut);

      const rightStrut = new THREE.Mesh(stasisSideStrutGeo, heavyIndustrialSteelMat);
      rightStrut.position.set(1.02, 3.05, 0);
      stasisGroup.add(rightStrut);

      // Dark Faintly Glowing Stasis Liquid + Floating Bio-Particles Core
      const liquidCore = new THREE.Mesh(stasisLiquidGeo, stasisLiquidMat);
      liquidCore.position.y = 3.05;
      stasisGroup.add(liquidCore);

      // Outer Cylindrical Glass Wall
      const glassWall = new THREE.Mesh(stasisGlassGeo, stasisGlassMat);
      glassWall.position.y = 3.05;
      stasisGroup.add(glassWall);

      facilityGroup.add(bayGroup);
    }

    // C. High Industrial Ceiling Concrete Deck & Curved Overhead Metal Cable Trays / Utility Tracks
    const ceilingDeck = new THREE.Mesh(
      new THREE.CylinderGeometry(18.0, 18.0, 0.3, 32),
      darkConcreteCofferMat
    );
    ceilingDeck.position.y = wallHeight + 0.15;
    facilityGroup.add(ceilingDeck);

    // Circular Overhead Metal Ladder Cable Trays (matching the curved ceiling tracks in image_f66af8e2.jpeg!)
    const trackRadii = [6.4, 10.8];
    trackRadii.forEach((tr) => {
      // Inner & Outer Steel Track Rails
      const railOuter = new THREE.Mesh(
        new THREE.TorusGeometry(tr + 0.28, 0.045, 10, 96),
        heavyIndustrialSteelMat
      );
      railOuter.rotation.x = Math.PI / 2;
      railOuter.position.y = 7.45;
      facilityGroup.add(railOuter);

      const railInner = new THREE.Mesh(
        new THREE.TorusGeometry(tr - 0.28, 0.045, 10, 96),
        heavyIndustrialSteelMat
      );
      railInner.rotation.x = Math.PI / 2;
      railInner.position.y = 7.45;
      facilityGroup.add(railInner);

      // Cross-rungs along the circular overhead utility track
      const rungCount = Math.floor(tr * 5.5);
      const rungGeo = new THREE.BoxGeometry(0.62, 0.04, 0.07);
      for (let r = 0; r < rungCount; r++) {
        const ra = (r / rungCount) * Math.PI * 2;
        const rung = new THREE.Mesh(rungGeo, heavyIndustrialSteelMat);
        rung.position.set(Math.cos(ra) * tr, 7.45, Math.sin(ra) * tr);
        rung.rotation.y = -ra;
        facilityGroup.add(rung);
      }
    });

    // Straight Diagonal Ceiling Metal Utility Tracks
    for (let d = 0; d < 4; d++) {
      const da = (d / 4) * Math.PI;
      const straightTray = new THREE.Mesh(
        new THREE.BoxGeometry(0.52, 0.07, 26),
        heavyIndustrialSteelMat
      );
      straightTray.position.set(0, 7.62, 0);
      straightTray.rotation.y = da;
      facilityGroup.add(straightTray);
    }

    // D. Volumetric Atmospheric Dust Particles floating in the cool antiseptic light
    const dustCount = 160;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 1.2 + Math.random() * 13.5;
      dustPositions[i * 3 + 0] = Math.cos(a) * r;
      dustPositions[i * 3 + 1] = 0.4 + Math.random() * 6.2;
      dustPositions[i * 3 + 2] = Math.sin(a) * r;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 0.05,
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const atmosphericDust = new THREE.Points(dustGeo, dustMat);
    scene.add(atmosphericDust);

    // =========================================================================
    // 2. MASSIVE INTRICATE HOLOGRAPHIC GLOBE ENCASED IN ROTATING ORBITAL RINGS
    //    OF GLOWING YELLOW AND GREEN-CYAN LIGHT ON STEPPED BRUTALIST PEDESTAL
    //    (Matches the exact centerpiece in image_f66af8e2.jpeg!)
    // =========================================================================
    const centerpieceGroup = new THREE.Group();
    scene.add(centerpieceGroup);

    // 4-Tiered Stepped Brutalist Circular Pedestal Base
    const stepTiers = [
      { rTop: 2.55, rBot: 2.72, h: 0.22, y: 0.11 },
      { rTop: 2.12, rBot: 2.28, h: 0.24, y: 0.34 },
      { rTop: 1.68, rBot: 1.84, h: 0.24, y: 0.58 },
      { rTop: 1.22, rBot: 1.38, h: 0.24, y: 0.82 }
    ];
    stepTiers.forEach((tier) => {
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(tier.rTop, tier.rBot, tier.h, 64),
        darkObsidianPedestalMat
      );
      mesh.position.y = tier.y;
      centerpieceGroup.add(mesh);
    });

    // Glowing Warm Amber & Cyan Base Rings around the Stepped Pedestal
    const pedestalAmberRing = new THREE.Mesh(
      new THREE.TorusGeometry(2.74, 0.035, 12, 64),
      amberNeonMat
    );
    pedestalAmberRing.rotation.x = Math.PI / 2;
    pedestalAmberRing.position.y = 0.04;
    centerpieceGroup.add(pedestalAmberRing);

    const pedestalCyanRing = new THREE.Mesh(
      new THREE.TorusGeometry(3.16, 0.032, 12, 64),
      cyanNeonMat
    );
    pedestalCyanRing.rotation.x = Math.PI / 2;
    pedestalCyanRing.position.y = 0.03;
    centerpieceGroup.add(pedestalCyanRing);

    // Holographic Globe Assembly floating at y = 2.85m
    const globeAssemblyGroup = new THREE.Group();
    globeAssemblyGroup.position.set(0, 2.85, 0);
    centerpieceGroup.add(globeAssemblyGroup);

    const globeTex = createHolographicGlobeTexture(maxAniso);
    const globeMat = new THREE.MeshStandardMaterial({
      map: globeTex,
      color: 0x67ffe8,
      emissive: 0x2dd4bf,
      emissiveMap: globeTex,
      emissiveIntensity: 1.05,
      transparent: true,
      opacity: 0.92,
      roughness: 0.2,
      metalness: 0.1
    });
    const holoGlobeMesh = new THREE.Mesh(new THREE.SphereGeometry(1.18, 64, 48), globeMat);
    globeAssemblyGroup.add(holoGlobeMesh);

    // Inner Volumetric Atmospheric Shimmer Core Sphere
    const innerCoreMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.04, 32, 32),
      new THREE.MeshBasicMaterial({
        color: 0x0d9488,
        transparent: true,
        opacity: 0.28
      })
    );
    globeAssemblyGroup.add(innerCoreMesh);

    // Vertical Glowing Yellow-Gold Meridian Gimbal Ring
    const meridianRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.36, 0.026, 16, 96),
      new THREE.MeshBasicMaterial({ color: 0xfff066 })
    );
    globeAssemblyGroup.add(meridianRing);

    // Secondary Green-Cyan Equatorial Gimbal Ring
    const equatorialRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.44, 0.018, 12, 96),
      new THREE.MeshBasicMaterial({ color: 0x52ffd8 })
    );
    equatorialRing.rotation.x = Math.PI / 2 + 0.22;
    globeAssemblyGroup.add(equatorialRing);

    // Two Tilted Rotating Orbital Film-Strip / Diagnostic Bands of Glowing Yellow & Green Light!
    const orbitalBandTex = createGlobeOrbitalBandTexture(maxAniso);
    const orbitalBandMat = new THREE.MeshStandardMaterial({
      map: orbitalBandTex,
      color: 0xffffff,
      emissive: 0xffe84d,
      emissiveMap: orbitalBandTex,
      emissiveIntensity: 1.1,
      transparent: true,
      opacity: 0.94,
      side: THREE.DoubleSide
    });

    // Upper Tilted Orbital Band
    const orbitalBandUpper = new THREE.Mesh(
      new THREE.CylinderGeometry(1.88, 1.72, 0.46, 64, 1, true),
      orbitalBandMat
    );
    orbitalBandUpper.position.y = 0.52;
    orbitalBandUpper.rotation.set(0.24, 0, -0.18);
    globeAssemblyGroup.add(orbitalBandUpper);

    // Lower Tilted Orbital Band
    const orbitalBandLower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.76, 1.92, 0.48, 64, 1, true),
      orbitalBandMat
    );
    orbitalBandLower.position.y = -0.58;
    orbitalBandLower.rotation.set(0.26, 0, 0.16);
    globeAssemblyGroup.add(orbitalBandLower);

    // =========================================================================
    // 3. PLAYER AVATAR RING
    // =========================================================================
    const playerAvatarGroup = new THREE.Group();
    scene.add(playerAvatarGroup);

    const avatarRing = new THREE.Mesh(
      new THREE.RingGeometry(0.32, 0.42, 32),
      new THREE.MeshBasicMaterial({
        color: 0x52ffd8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      })
    );
    avatarRing.rotation.x = -Math.PI / 2;
    avatarRing.position.y = 0.025;
    playerAvatarGroup.add(avatarRing);

    // =========================================================================
    // 4. DYNAMIC GRAPH: SLEEK MINIMALIST GLASS HOLOGRAPHIC DIAGNOSTIC HUD PANELS
    //    ON PEDESTALS + FLUSH FLOOR CIRCUIT TRENCH CONNECTIONS
    // =========================================================================
    const terminalsGroup = new THREE.Group();
    const conduitsGroup = new THREE.Group();
    const fxGroup = new THREE.Group();
    scene.add(terminalsGroup);
    scene.add(conduitsGroup);
    scene.add(fxGroup);

    const clickableProxies: THREE.Object3D[] = [];
    const terminalRecords = new Map<
      string,
      {
        group: THREE.Group;
        floorTrenchPort: THREE.Vector3;
      }
    >();

    const activePackets: Array<{
      mesh: THREE.Mesh;
      curve: THREE.Curve<THREE.Vector3>;
      speed: number;
      offset: number;
    }> = [];

    const disposableGeometries: THREE.BufferGeometry[] = [];
    const disposableMaterials: THREE.Material[] = [];
    const hudTextureCache = new Map<string, THREE.CanvasTexture>();

    const clearDynamicGraph = () => {
      clickableProxies.length = 0;
      terminalRecords.clear();
      activePackets.length = 0;

      while (terminalsGroup.children.length > 0) {
        terminalsGroup.remove(terminalsGroup.children[0]);
      }
      while (conduitsGroup.children.length > 0) {
        conduitsGroup.remove(conduitsGroup.children[0]);
      }
      while (disposableGeometries.length > 0) {
        disposableGeometries.pop()?.dispose();
      }
      while (disposableMaterials.length > 0) {
        disposableMaterials.pop()?.dispose();
      }
    };

    /**
     * Routes a Flush Glowing Cyan or Amber Floor Trench Circuit Line between two pedestals
     * (Entirely removing mid-air cable clutter!)
     */
    const createFlushFloorCircuitConnection = (
      fromPos: THREE.Vector3,
      toPos: THREE.Vector3,
      colorHex: string,
      strength: number,
      seedIdx: number
    ) => {
      const dist = fromPos.distanceTo(toPos);
      if (dist < 0.2) return;

      const lowerHex = (colorHex || '').toLowerCase();
      const isAmber =
        lowerHex.includes('f5b9') || lowerHex.includes('fcee') || seedIdx % 2 === 0;
      const lineMat = isAmber ? amberNeonMat : cyanNeonMat;
      const pulseColor = isAmber ? 0xf5b942 : 0x00f0ff;

      const pStart = new THREE.Vector3(fromPos.x, 0.025, fromPos.z);
      const pEnd = new THREE.Vector3(toPos.x, 0.025, toPos.z);

      // Architectural geometric waypoint along the floor
      const pMid = pStart.clone().add(pEnd).multiplyScalar(0.5);
      const midLen = Math.hypot(pMid.x, pMid.z);
      if (midLen > 0.1) {
        const targetRad = dist > 11 ? 3.4 : 11.4;
        pMid.x = (pMid.x / midLen) * targetRad;
        pMid.z = (pMid.z / midLen) * targetRad;
      }
      pMid.y = 0.025;

      const curve = new THREE.QuadraticBezierCurve3(pStart, pMid, pEnd);
      const radius = 0.032 + strength * 0.008;
      const tubeGeo = new THREE.TubeGeometry(curve, 24, radius, 6, false);
      disposableGeometries.push(tubeGeo);
      conduitsGroup.add(new THREE.Mesh(tubeGeo, lineMat));

      // Moving light pulse gliding flush along the floor trench circuit
      const pktGeo = new THREE.SphereGeometry(radius * 1.5, 8, 8);
      const pktMat = new THREE.MeshBasicMaterial({ color: pulseColor });
      disposableGeometries.push(pktGeo);
      disposableMaterials.push(pktMat);
      const pktMesh = new THREE.Mesh(pktGeo, pktMat);
      conduitsGroup.add(pktMesh);

      activePackets.push({
        mesh: pktMesh,
        curve,
        speed: 0.22 + strength * 0.08,
        offset: (seedIdx * 0.17) % 1
      });
    };

    const buildDynamicGraph = () => {
      clearDynamicGraph();

      const currentNodes = nodesRef.current.filter((n) => n.activeInRoom);
      const currentEdges = edgesRef.current;
      const selId = selectedNodeIdRef.current;
      const srcId = connectSourceNodeIdRef.current;

      currentNodes.forEach((node, idx) => {
        const isSelected = node.id === selId;
        const isConnectSource = node.id === srcId;

        const termGroup = new THREE.Group();
        termGroup.position.set(node.position.x, 0, node.position.z);
        termGroup.lookAt(0, 0, 0);

        const trimMat = isSelected
          ? amberNeonMat
          : isConnectSource
            ? new THREE.MeshBasicMaterial({ color: 0x10b981 })
            : idx % 2 === 0
              ? amberNeonMat
              : cyanNeonMat;

        // 1. Minimalist Brutalist Pedestal Foot with Glowing Flush Edge Strip
        const footGeo = new THREE.BoxGeometry(1.42, 0.1, 0.92);
        disposableGeometries.push(footGeo);
        const footMesh = new THREE.Mesh(footGeo, darkObsidianPedestalMat);
        footMesh.position.y = 0.05;
        termGroup.add(footMesh);

        const trimGeo = new THREE.BoxGeometry(1.48, 0.025, 0.98);
        disposableGeometries.push(trimGeo);
        const trimMesh = new THREE.Mesh(trimGeo, trimMat);
        trimMesh.position.y = 0.015;
        termGroup.add(trimMesh);

        // 2. Vertical Matte-Dark Pedestal Stand + Slanted Console Lectern
        const standGeo = new THREE.BoxGeometry(0.44, 1.12, 0.32);
        disposableGeometries.push(standGeo);
        const standMesh = new THREE.Mesh(standGeo, heavyIndustrialSteelMat);
        standMesh.position.y = 0.62;
        termGroup.add(standMesh);

        const lecternGeo = new THREE.BoxGeometry(1.26, 0.06, 0.58);
        disposableGeometries.push(lecternGeo);
        const lecternMesh = new THREE.Mesh(lecternGeo, darkObsidianPedestalMat);
        lecternMesh.position.set(0, 1.18, 0.1);
        lecternMesh.rotation.x = 0.34;
        termGroup.add(lecternMesh);

        // 3. Sleek Minimalist Glass Holographic Diagnostic HUD Panel floating above Pedestal
        const cacheKey = `${node.id}-${isSelected ? 'sel' : 'norm'}`;
        let hudTex = hudTextureCache.get(cacheKey);
        if (!hudTex) {
          hudTex = createDelosDiagnosticHudTexture(node, isSelected, maxAniso);
          hudTextureCache.set(cacheKey, hudTex);
        }

        const hudGeo = new THREE.PlaneGeometry(2.28, 1.36);
        const hudMat = new THREE.MeshBasicMaterial({
          map: hudTex,
          transparent: true,
          opacity: 0.95,
          side: THREE.DoubleSide
        });
        disposableGeometries.push(hudGeo);
        disposableMaterials.push(hudMat);
        const hudMesh = new THREE.Mesh(hudGeo, hudMat);
        hudMesh.position.set(0, 2.18, 0.06);
        termGroup.add(hudMesh);

        // Click proxy
        const hitGeo = new THREE.BoxGeometry(2.5, 3.2, 1.4);
        const hitMat = new THREE.MeshBasicMaterial({ visible: false });
        disposableGeometries.push(hitGeo);
        disposableMaterials.push(hitMat);
        const hitProxy = new THREE.Mesh(hitGeo, hitMat);
        hitProxy.position.set(0, 1.65, 0);
        hitProxy.userData = { nodeId: node.id };
        termGroup.add(hitProxy);
        clickableProxies.push(hitProxy);

        terminalsGroup.add(termGroup);
        terminalRecords.set(node.id, {
          group: termGroup,
          floorTrenchPort: new THREE.Vector3(node.position.x, 0.025, node.position.z)
        });

        // Straight Glowing Amber/Cyan Floor Trench Line from Selected Pedestal to the Central Globe Pedestal
        // (Just like the glowing amber segmented floor track in image_f66af8e2.jpeg!)
        if (isSelected || idx % 4 === 0) {
          createFlushFloorCircuitConnection(
            new THREE.Vector3(0, 0.025, 0),
            new THREE.Vector3(node.position.x, 0.025, node.position.z),
            '#F5B942',
            isSelected ? 3 : 2,
            idx + 300
          );
        }
      });

      // Route all connections flush along the floor trenches
      currentEdges.forEach((edge, idx) => {
        const fromRec = terminalRecords.get(edge.fromId);
        const toRec = terminalRecords.get(edge.toId);
        if (!fromRec || !toRec) return;

        createFlushFloorCircuitConnection(
          fromRec.floorTrenchPort,
          toRec.floorTrenchPort,
          edge.color || '#00F0FF',
          edge.strength,
          idx
        );
      });
    };

    rebuildGraphFnRef.current = buildDynamicGraph;
    buildDynamicGraph();

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const raycaster = new THREE.Raycaster();
    const pressedKeys = new Set<string>();
    let isPointerDragging = false;
    let pointerDownPos = { x: 0, y: 0 };
    let lastPointerPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      isPointerDragging = true;
      pointerDownPos = { x: e.clientX, y: e.clientY };
      lastPointerPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      const dx = e.clientX - lastPointerPos.x;
      const dy = e.clientY - lastPointerPos.y;
      lastPointerPos = { x: e.clientX, y: e.clientY };

      if (cameraModeRef.current === 'room_game') {
        playerStateRef.current.yaw -= dx * 0.0055;
        playerStateRef.current.pitch = THREE.MathUtils.clamp(
          playerStateRef.current.pitch - dy * 0.004,
          -0.42,
          0.42
        );
      } else {
        playerStateRef.current.orbitYaw -= dx * 0.006;
        playerStateRef.current.orbitPitch = THREE.MathUtils.clamp(
          playerStateRef.current.orbitPitch + dy * 0.005,
          0.18,
          1.12
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!isPointerDragging) return;
      isPointerDragging = false;
      const movedDist = Math.hypot(
        e.clientX - pointerDownPos.x,
        e.clientY - pointerDownPos.y
      );
      if (movedDist < 7) {
        const rect = renderer.domElement.getBoundingClientRect();
        _mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        _mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(_mouse, camera);
        const hits = raycaster.intersectObjects(clickableProxies, false);
        if (hits.length > 0) {
          const hitNodeId = hits[0].object.userData?.nodeId as string | undefined;
          if (hitNodeId) {
            onSelectNodeRef.current(hitNodeId);
            const targetNode = nodesRef.current.find((n) => n.id === hitNodeId);
            if (targetNode) {
              playerStateRef.current.x = targetNode.position.x * 0.56;
              playerStateRef.current.z = targetNode.position.z * 0.56;
              playerStateRef.current.yaw = Math.atan2(
                targetNode.position.x - playerStateRef.current.x,
                targetNode.position.z - playerStateRef.current.z
              );
              if (cameraModeRef.current === 'orbit_overview') {
                onEnterRoomAtNodeRef.current(hitNodeId);
              }
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (cameraModeRef.current === 'orbit_overview') {
        e.preventDefault();
        playerStateRef.current.orbitDistance = THREE.MathUtils.clamp(
          playerStateRef.current.orbitDistance + e.deltaY * 0.02,
          7,
          15.2
        );
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      pressedKeys.add(e.code);
    };

    const onKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.code);
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 960;
      const h = container.clientHeight || 620;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
      if (bloomPass) bloomPass.resolution.set(w, h);
    };
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const fxRingGeo = new THREE.TorusGeometry(1.0, 0.06, 10, 32);
    const fxBeamGeo = new THREE.CylinderGeometry(0.08, 0.08, 1, 10);
    const fxSparkGeo = new THREE.BoxGeometry(0.16, 0.16, 0.16);

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (gl && typeof gl.fenceSync === 'function') {
        const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        gl.flush();
        const poll = () => {
          const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
          if (state === gl.UNSIGNALED) {
            frameId = window.setTimeout(poll, 5);
          } else {
            if (sync) gl.deleteSync(sync);
            frameId = window.setTimeout(cb, 80);
          }
        };
        frameId = window.setTimeout(poll, 5);
      } else {
        frameId = window.setTimeout(cb, 80);
      }
    }

    function tick() {
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (delosPass) {
        delosPass.uniforms.uTime.value = elapsed;
      }

      // 1. Animate the Massive Holographic Globe & Rotating Orbital Yellow/Green Rings
      holoGlobeMesh.rotation.y = elapsed * 0.24;
      meridianRing.rotation.y = -elapsed * 0.18;
      equatorialRing.rotation.z = elapsed * 0.22;
      orbitalBandUpper.rotation.y = -elapsed * 0.32;
      orbitalBandLower.rotation.y = elapsed * 0.28;
      orbitalBandTex.offset.x = -elapsed * 0.06;

      // 2. Gently drift floating bio-particles inside Stasis Chambers & room atmosphere
      stasisLiquidTex.offset.y = -elapsed * 0.03;
      atmosphericDust.rotation.y = elapsed * 0.025;

      for (let i = 0; i < activePackets.length; i++) {
        const pkt = activePackets[i];
        const tVal = (elapsed * pkt.speed + pkt.offset) % 1;
        pkt.curve.getPointAt(tVal, pkt.mesh.position);
      }

      // Render Create / Delete / Edit 3D Animations along Floor Circuit Traces
      while (fxGroup.children.length > 0) {
        const child = fxGroup.children[0] as THREE.Mesh;
        if (child.material && !Array.isArray(child.material)) {
          child.material.dispose();
        }
        fxGroup.remove(child);
      }

      const nowMs = Date.now();
      const activeAnims = animationsRef.current;
      for (let i = 0; i < activeAnims.length; i++) {
        const anim = activeAnims[i];
        const progress = (nowMs - anim.startedAt) / anim.durationMs;
        if (progress < 0 || progress > 1) continue;

        const animCol = new THREE.Color(anim.color);
        _v1.set(anim.fromPos.x, 0.2, anim.fromPos.z);
        _v2.set(anim.toPos.x, 0.2, anim.toPos.z);

        if (anim.type === 'create') {
          _v3.lerpVectors(_v1, _v2, progress);
          const dist = _v1.distanceTo(_v3);
          if (dist > 0.05) {
            const beamMat = new THREE.MeshBasicMaterial({
              color: animCol,
              transparent: true,
              opacity: 1 - progress * 0.25
            });
            const beamMesh = new THREE.Mesh(fxBeamGeo, beamMat);
            beamMesh.position.copy(_v1).add(_v3).multiplyScalar(0.5);
            beamMesh.scale.set(1.2, dist, 1.2);
            beamMesh.lookAt(_v3);
            beamMesh.rotateX(Math.PI / 2);
            fxGroup.add(beamMesh);
          }

          const ringMat = new THREE.MeshBasicMaterial({
            color: animCol,
            transparent: true,
            opacity: 1 - progress
          });
          const ringMesh = new THREE.Mesh(fxRingGeo, ringMat);
          ringMesh.position.copy(progress < 0.5 ? _v1 : _v2);
          ringMesh.rotation.x = Math.PI / 2;
          const s = 0.8 + progress * 2.4;
          ringMesh.scale.set(s, s, s);
          fxGroup.add(ringMesh);
        } else if (anim.type === 'delete') {
          for (let sp = 0; sp < 10; sp++) {
            const frac = (sp + 0.5) / 10;
            _v3.lerpVectors(_v1, _v2, frac);
            _v3.y += progress * 2.0 + Math.sin(sp * 4 + progress * 12) * 0.3;
            const sparkMat = new THREE.MeshBasicMaterial({
              color: 0xef4444,
              transparent: true,
              opacity: Math.max(0, 1 - progress)
            });
            const sparkMesh = new THREE.Mesh(fxSparkGeo, sparkMat);
            sparkMesh.position.copy(_v3);
            const sc = Math.max(0.1, (1 - progress) * 1.4);
            sparkMesh.scale.set(sc, sc, sc);
            sparkMesh.rotation.set(progress * 6, sp, progress * 4);
            fxGroup.add(sparkMesh);
          }
        } else {
          for (let w = 0; w < 3; w++) {
            const waveP = (progress + w * 0.25) % 1;
            _v3.lerpVectors(_v1, _v2, waveP);
            _v3.y = 0.2 + Math.sin(waveP * Math.PI) * 1.2;
            const pulseMat = new THREE.MeshBasicMaterial({
              color: animCol,
              transparent: true,
              opacity: 1 - progress
            });
            const pulseRing = new THREE.Mesh(fxRingGeo, pulseMat);
            pulseRing.position.copy(_v3);
            const sc = 0.5 + Math.sin(waveP * Math.PI) * 1.4;
            pulseRing.scale.set(sc, sc, sc);
            fxGroup.add(pulseRing);
          }
        }
      }

      // Player Movement inside the Delos Subterranean Facility
      let moveFwd = moveInputRef.current.forward;
      let moveStrafe = moveInputRef.current.strafe;
      let moveTurn = moveInputRef.current.turn;

      if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) moveFwd += 1;
      if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) moveFwd -= 1;
      if (pressedKeys.has('KeyA')) moveStrafe -= 1;
      if (pressedKeys.has('KeyD')) moveStrafe += 1;
      if (pressedKeys.has('ArrowLeft') || pressedKeys.has('KeyQ')) moveTurn += 1;
      if (pressedKeys.has('ArrowRight') || pressedKeys.has('KeyE')) moveTurn -= 1;

      const pState = playerStateRef.current;
      if (moveTurn !== 0) {
        pState.yaw += moveTurn * 1.85 * dt;
      }

      const walkSpeed = pressedKeys.has('ShiftLeft') ? 10 : 6.8;
      if (moveFwd !== 0 || moveStrafe !== 0) {
        const forwardX = Math.sin(pState.yaw);
        const forwardZ = Math.cos(pState.yaw);
        const rightX = -forwardZ;
        const rightZ = forwardX;

        pState.x += (forwardX * moveFwd + rightX * moveStrafe) * walkSpeed * dt;
        pState.z += (forwardZ * moveFwd + rightZ * moveStrafe) * walkSpeed * dt;

        const radialDist = Math.hypot(pState.x, pState.z);
        if (radialDist > 13.6) {
          pState.x = (pState.x / radialDist) * 13.6;
          pState.z = (pState.z / radialDist) * 13.6;
        }
        if (radialDist < 3.4 && radialDist > 0.001) {
          pState.x = (pState.x / radialDist) * 3.4;
          pState.z = (pState.z / radialDist) * 3.4;
        }
      }

      playerAvatarGroup.position.set(pState.x, 0, pState.z);
      playerAvatarGroup.rotation.y = pState.yaw;

      if (cameraModeRef.current === 'room_game') {
        _desiredCamPos.set(pState.x, 2.25, pState.z);
        const lookDist = 10;
        _desiredLookAt.set(
          pState.x + Math.sin(pState.yaw) * lookDist,
          2.25 + Math.sin(pState.pitch) * lookDist,
          pState.z + Math.cos(pState.yaw) * lookDist
        );
      } else {
        const ox = Math.sin(pState.orbitYaw) * Math.cos(pState.orbitPitch) * pState.orbitDistance;
        const oy = Math.min(6.4, Math.max(2.0, Math.sin(pState.orbitPitch) * pState.orbitDistance));
        const oz = Math.cos(pState.orbitYaw) * Math.cos(pState.orbitPitch) * pState.orbitDistance;
        _desiredCamPos.set(ox, oy, oz);
        _desiredLookAt.set(0, 2.5, 0);
      }

      const dampFactor = 1 - Math.exp(-8.5 * dt);
      camera.position.lerp(_desiredCamPos, dampFactor);
      camera.lookAt(_desiredLookAt);

      if (isSoftwareGl || !composer) {
        renderer.render(scene, camera);
      } else {
        composer.render();
      }

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = window.requestAnimationFrame(tick);
      }
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(frameId);
      domEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);

      clearDynamicGraph();
      hudTextureCache.forEach((t) => t.dispose());
      hudTextureCache.clear();
      concreteTex.dispose();
      brutalistConcreteMat.dispose();
      darkConcreteCofferMat.dispose();
      floorTex.dispose();
      floorMat.dispose();
      circuitOverlayTex.dispose();
      circuitOverlayMat.dispose();
      stasisLiquidTex.dispose();
      stasisLiquidMat.dispose();
      stasisGlassMat.dispose();
      globeTex.dispose();
      globeMat.dispose();
      orbitalBandTex.dispose();
      orbitalBandMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      fxRingGeo.dispose();
      fxBeamGeo.dispose();
      fxSparkGeo.dispose();
      envTarget.dispose();
      composer?.dispose();
      renderer.dispose();
    };
  }, [moveInputRef]);

  return (
    <div
      ref={mountRef}
      className="h-full w-full select-none cursor-grab active:cursor-grabbing"
      aria-label="Delos Brutalist Sci-Fi Stasis & Holographic Globe Facility 3D"
    />
  );
}
