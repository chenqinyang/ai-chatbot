import { Component } from "react";
import { TriangleAlert } from "lucide-react";

export class RemoteBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error(`[module-federation] ${this.props.name} failed to load`, error, info);
  }

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    const className = this.props.compact
      ? "remote-error remote-error-chat"
      : "remote-error";

    return (
      <section className={className} role="alert">
        <TriangleAlert size={20} />
        <div>
          <strong>{this.props.name} is unavailable</strong>
          <span>Start the remote app and refresh the host.</span>
        </div>
        <button type="button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </section>
    );
  }
}
