import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { useState } from 'react';

type AuthState = 'idle' | 'submitting' | 'error';

export default function SignInScreen(): JSX.Element {
  const router = useRouter();
  const [state, setState] = useState<AuthState>('idle');
  const [error, setError] = useState<string | null>(null);

  const onPasskey = async (): Promise<void> => {
    setState('submitting');
    setError(null);
    try {
      // TODO: integrate @privy-io/expo passkey flow. Placeholder for now.
      await new Promise((r) => setTimeout(r, 400));
      router.back();
    } catch (e) {
      setError((e as Error).message ?? 'Sign-in failed');
      setState('error');
    }
  };

  return (
    <View style={styles.container}>
      <Card title="Sign in">
        <Text style={styles.copy}>
          Sign in with a passkey. Your device's biometric unlock authorizes BlockAssist on this device only.
        </Text>
        <Button
          label={state === 'submitting' ? 'Authenticating…' : 'Sign in with passkey'}
          onPress={onPasskey}
          disabled={state === 'submitting'}
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Text style={styles.footnote}>
          {Platform.OS === 'ios'
            ? 'Backed by iCloud Keychain.'
            : Platform.OS === 'android'
              ? 'Backed by Google Password Manager (or your chosen credential manager).'
              : 'Passkey support varies by platform.'}
        </Text>
      </Card>

      <Card title="Account recovery">
        <Text style={styles.copy}>
          If you lose your device, recovery options depend on the credential manager. Add a recovery email
          under Profile → Settings before this becomes an emergency.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  copy: { color: '#333', marginBottom: 8 },
  footnote: { fontSize: 12, color: '#666', marginTop: 8 },
  error: { color: '#b00020', marginTop: 8 },
});
