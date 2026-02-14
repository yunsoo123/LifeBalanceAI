import React, { useState } from 'react';
import { Text, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Input } from '@/components/ui';
import { supabase } from '@/lib/supabase/client';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    const trimmed = email.trim();
    if (!trimmed || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Use at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ email: trimmed, password });
      if (error) throw error;
      Alert.alert('Check your email', 'We sent a confirmation link. Sign in after confirming.', [
        { text: 'OK', onPress: () => router.replace('/sign-in') },
      ]);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign up failed';
      Alert.alert('Sign up failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-950" edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Create account
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mb-6">
            One account for your schedules, notes, and weekly reviews.
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            className="mb-4"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="At least 6 characters"
            secureTextEntry
            className="mb-6"
          />

          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleSignUp}
            disabled={loading}
            loading={loading}
          >
            Sign Up
          </Button>

          <Button
            variant="ghost"
            size="md"
            fullWidth
            onPress={() => router.replace('/sign-in')}
            className="mt-4"
          >
            Already have an account? Sign in
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
