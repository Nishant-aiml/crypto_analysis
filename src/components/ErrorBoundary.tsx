
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  private resetError = () => {
    this.setState({ hasError: false, error: undefined });
    // Optionally, you could try to trigger a re-fetch or redirect
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-6 rounded-lg my-4 text-center">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-destructive mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4">
            {this.props.fallbackMessage || "An unexpected error occurred in this section."}
          </p>
          {this.state.error && (
            <details className="text-left bg-secondary/30 p-3 rounded-md mb-4 text-xs">
              <summary className="cursor-pointer text-muted-foreground">Error details</summary>
              <pre className="mt-2 whitespace-pre-wrap break-all">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
          <Button onClick={this.resetError} variant="outline">
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
