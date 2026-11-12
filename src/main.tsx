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
        <div
          dir="rtl"
          className="h-[100dvh] w-full bg-[#030306] text-white flex flex-col items-center justify-center p-6 text-center gap-4"
        >
          <p className="text-sm text-white/80">در حال بازنشانی موتور تصویر سه‌بعدی AETHER...</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-5 py-2.5 rounded-full bg-white text-black text-xs font-semibold cursor-pointer"
          >
            ادامه تماشا
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
