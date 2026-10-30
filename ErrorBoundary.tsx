import React from 'react';
import { AlertTriangle, ArrowRight, RefreshCw } from 'lucide-react';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

/** Keep a broken route/component from turning the entire app into a blank screen. */
export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    if (import.meta.env.DEV) console.error('VESTORA render error', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="app-error-page" role="alert">
        <div className="app-error-card">
          <div className="app-error-icon"><AlertTriangle size={24} /></div>
          <span className="app-error-kicker">VESTORA · EXPERIENCE INTERRUPTED</span>
          <h1>We couldn't load this view.</h1>
          <p>Your simulated portfolio stays in your browser. Try reloading the page. If the issue continues, return to the overview.</p>
          <div className="app-error-actions">
            <button type="button" className="app-error-primary" onClick={() => window.location.reload()}>
              <RefreshCw size={16} /> Reload page
            </button>
            <a className="app-error-secondary" href="/">Go to overview <ArrowRight size={16} /></a>
          </div>
          <span className="app-error-footnote">Educational prototype · No real-money transactions</span>
        </div>
      </div>
    );
  }
}
