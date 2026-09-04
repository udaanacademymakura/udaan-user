import { Component, type ErrorInfo, type ReactNode } from "react";
import { isChunkLoadError, reloadForStaleChunk } from "../../../utils/lazyRetry";
import ErrorScreen from "./ErrorScreen";

interface Props {
    children: ReactNode;
}

interface State {
    error: Error | null;
}

export default class AppErrorBoundary extends Component<Props, State> {
    state: State = { error: null };

    static getDerivedStateFromError(error: Error): State {
        return { error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        if (isChunkLoadError(error) && reloadForStaleChunk()) return;
        console.error("Uncaught render error", error, info.componentStack);
    }

    render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        return <ErrorScreen staleBuild={isChunkLoadError(error)} error={error} />;
    }
}
