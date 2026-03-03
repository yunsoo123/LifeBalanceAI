import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Button } from './Button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 bg-white dark:bg-gray-950 items-center justify-center px-6">
          <View className="items-center max-w-md">
            <View className="w-16 h-16 bg-error/10 rounded-full items-center justify-center mb-4">
              <Text className="text-3xl">⚠️</Text>
            </View>

            <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 text-center mb-2">
              Something went wrong
            </Text>

            <Text className="text-base text-gray-600 dark:text-gray-400 text-center mb-6">
              We encountered an unexpected error. Please try again.
            </Text>

            {__DEV__ && this.state.error && (
              <ScrollView className="w-full max-h-32 bg-gray-100 dark:bg-gray-900 p-3 rounded-md mb-4">
                <Text className="text-xs text-error font-mono">{this.state.error.toString()}</Text>
              </ScrollView>
            )}

            <Button variant="primary" size="md" onPress={this.handleReset}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}
