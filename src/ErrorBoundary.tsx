import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './components/ui/button';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryComponent extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
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
                  <pre className="mt-2 text-[10px] font-mono overflow-auto max-h-32">
                    {this.state.error.message}
                  </pre>
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
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ErrorBoundaryComponent;

