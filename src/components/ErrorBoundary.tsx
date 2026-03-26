import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

'use client';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public static override getDerivedStateFromError?(error: Error): Partial<State> | null {
    return { hasError: true, error };
  }

  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public componentDidUpdate() {
    if (this.state.hasError) {
      console.log('ErrorBoundary state updated:', this.state);
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false });
  };

  public override render() {
    return this.state.hasError 
      ? (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="w-24 h-24 mx-auto bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-12 h-12 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white mb-4 font-display">Algo deu errado</h1>
              <p className="text-gray-400 mb-2">Tivemos um problema inesperado.</p>
              {this.state.error && (
                <details className="text-xs text-gray-500 bg-black/50 p-3 rounded-xl mt-4">
                  <summary>Detalhes técnicos</summary>
                  <pre className="mt-2 text-[10px] font-mono overflow-auto max-h-32">{this.state.error.message}</pre>
                </details>
              )}
            </div>
            <Button 
              onClick={this.handleReset}
              className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-4 px-8 rounded-2xl shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)] transition-all"
            >
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Tentar Novamente
            </Button>
          </div>
        </div>
      )
      : this.props.children;
  }
}


