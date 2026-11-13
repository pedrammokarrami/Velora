import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class AetherErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] w-full bg-[#070b14] text-slate-100 flex flex-col items-center justify-center p-6 text-center gap-4">
          <p className="font-editorial text-2xl text-[#D4AF37]">AETHER</p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false })}
            className="min-h-[44px] px-6 py-2.5 rounded-full bg-[#D4AF37] text-[#070b14] text-sm font-semibold cursor-pointer transition-transform active:scale-95"
          >
            Reload Discovery
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AetherErrorBoundary>
    <App />
  </AetherErrorBoundary>
);
