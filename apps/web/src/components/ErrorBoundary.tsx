import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-center space-y-3">
            <p className="font-medium text-red-600">Đã xảy ra lỗi</p>
            <p className="text-sm text-gray-600">{this.state.error.message}</p>
            <button
              type="button"
              className="text-sm text-primary underline"
              onClick={() => this.setState({ error: null })}
            >
              Thử lại
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
