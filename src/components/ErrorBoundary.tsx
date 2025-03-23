import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Üç boyutlu model hatası:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <mesh scale={[1, 1, 1]}>
          <sphereGeometry args={[2, 32, 32]} />
          <meshStandardMaterial
            color="#2233ff"
            emissive="#112244"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.4}
          />
        </mesh>
      );
    }

    return this.props.children;
  }
} 