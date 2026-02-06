import React from "react";
import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  error: Error | null;
  componentStack: string;
};

export default class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    error: null,
    componentStack: "",
  };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keep a copy of the component stack so we can identify the crashing tree.
    this.setState({ componentStack: info.componentStack });

    // Also surface it in the console for easy copy/paste.
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Caught error:", error);
    // eslint-disable-next-line no-console
    console.error("[ErrorBoundary] Component stack:", info.componentStack);
  }

  private handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-background p-6">
        <h1 className="text-xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          A component crashed while rendering this page.
        </p>

        <div className="mt-4 rounded-2xl bg-card p-4 shadow-card">
          <p className="text-sm font-mono text-foreground">
            {this.state.error.message || "Unknown error"}
          </p>
        </div>

        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-primary">
            Show component stack
          </summary>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-card p-4 text-xs text-muted-foreground shadow-soft">
            {this.state.componentStack || "(no component stack)"}
          </pre>
        </details>

        <Button className="mt-6" onClick={this.handleReload}>
          Reload
        </Button>
      </main>
    );
  }
}
