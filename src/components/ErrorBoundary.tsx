'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 text-red-900 rounded-2xl border border-red-200 shadow-sm m-4">
          <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
          <p className="text-sm opacity-80 mb-4">{this.state.error?.message || "An unexpected error occurred."}</p>
          <button
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-full font-medium transition-colors text-sm"
            onClick={() => this.setState({ hasError: false })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
