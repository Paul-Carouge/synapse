'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#07070a]">
          <div style={{ padding: '0 24px' }} className="max-w-md text-center space-y-4">
            <div className="w-10 h-10 mx-auto rounded-full bg-[#f54e00]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#f54e00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#e8e8f0]">
              Connexion interrompue
            </h2>
            <p className="text-sm text-[#7a7a8a] leading-relaxed">
              La mémoire n&apos;a pas pu être chargée. Rafraîchissez la page ou réessayez plus tard.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{ padding: '10px 20px' }}
              className="rounded-xl bg-[#f5a623] text-[#07070a] text-sm font-medium hover:bg-[#e0960f] transition-colors"
            >
              Rafraîchir
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
