import React, { useState } from 'react';
import { PlaybackType } from './types';
import { AlertCircle, ExternalLink, Play, ShieldCheck } from 'lucide-react';

interface AuthorizedVideoPlayerProps {
  title: string;
  originalUrl: string;
  embedUrl?: string;
  playbackType: PlaybackType;
  thumbnailUrl?: string;
  sourceName?: string;
  onEnded?: () => void;
}

/**
 * Modular Authorized Video Player
 * - Direct MP4 / WebM / HLS stream
 * - Sandboxed, hardened iframe embed with explicit origin protections
 * - Provider-redirect fallback when embedding is disabled
 * - Never extracts hidden stream keys; never proxies or redistributes video data
 */
export const AuthorizedVideoPlayer: React.FC<AuthorizedVideoPlayerProps> = ({
  title,
  originalUrl,
  embedUrl,
  playbackType,
  thumbnailUrl,
  sourceName,
  onEnded
}) => {
  const [embedError, setEmbedError] = useState(false);
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);

  // Direct video stream
  if (playbackType === 'direct_video') {
    return (
      <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 group">
        <video
          src={embedUrl || originalUrl}
          controls
          autoPlay
          playsInline
          poster={thumbnailUrl}
          onEnded={onEnded}
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          <ShieldCheck className="w-3 h-3" />
          <span>Direct Stream • Verified Provider</span>
        </div>
      </div>
    );
  }

  // Authorized iframe embed
  if (playbackType === 'authorized_embed' && embedUrl && !embedError) {
    return (
      <div className="relative w-full aspect-video bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onError={() => setEmbedError(true)}
          sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
          referrerPolicy="strict-origin-when-cross-origin"
          className="w-full h-full border-0"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open on authorized source provider"
            className="p-1.5 rounded-lg bg-black/60 hover:bg-black/90 text-white/70 hover:text-white backdrop-blur-md transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    );
  }

  // Fallback: Embed not permitted or error occurred
  return (
    <div className="relative w-full aspect-video bg-gradient-to-br from-neutral-950 to-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center">
      {thumbnailUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-sm"
          style={{ backgroundImage: `url(${thumbnailUrl})` }}
        />
      )}
      <div className="relative z-10 max-w-md space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-base font-semibold text-white">{title}</h4>
          <p className="text-xs text-white/60 mt-1">
            This video provider requires viewing directly on their official authorized website or restricts third-party in-frame playback.
          </p>
        </div>
        <div className="pt-2">
          <a
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white text-xs font-semibold hover:brightness-110 transition-all shadow-lg shadow-rose-500/25"
          >
            <span>Watch on {sourceName || 'Provider Official Website'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
