import { ScrollView, View, Text, StyleSheet, Switch, Pressable, Alert } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  SafetySession,
  SafetyStatus,
  checkIn,
  endSession,
  isNightTime,
  safetyTimings,
  startSession,
  themeFor,
  tickSafetyStatus,
  triggerSOS,
} from '../services/night-mode';

// LV-005 safety screen. Pure-functional logic lives in services/night-mode.ts.
// Persistence (expo-secure-store) deferred until Mobile Lead approves the dep.

export default function SafetyScreen(): JSX.Element {
  const theme = themeFor();
  const night = isNightTime();
  const [routeShare, setRouteShare] = useState(false);
  const [session, setSession] = useState<SafetySession | null>(null);

  useEffect(() => {
    if (!session) return;
    const id = setInterval(() => setSession((s) => (s ? tickSafetyStatus(s) : s)), 30_000);
    return () => clearInterval(id);
  }, [session]);

  const timings = useMemo(() => (session ? safetyTimings(session) : null), [session]);
  const status: SafetyStatus = session?.status ?? 'inactive';

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Safety</Text>
      <Text style={[styles.muted, { color: theme.textMuted }]}>
        {night ? 'Night window active — extra availability boost is on.' : 'Daytime.'}
      </Text>

      <Card title="Route sharing">
        <View style={styles.row}>
          <Text style={[styles.label, { color: theme.text }]}>Share live route with selected contacts</Text>
          <Switch value={routeShare} onValueChange={setRouteShare} />
        </View>
        <Text style={[styles.note, { color: theme.textMuted }]}>
          When on, your live coordinates are pushed to contacts only while a trip is active. Off-trip = no sharing.
        </Text>
      </Card>

      <Card title="Buddy check-in">
        {session ? (
          <ActiveSession theme={theme} status={status} timings={timings} onCheckIn={() => setSession((s) => (s ? checkIn(s) : s))} onEnd={() => setSession((s) => (s ? endSession(s) : null))} onSOS={() => setSession((s) => (s ? triggerSOS(s) : s))} />
        ) : (
          <View>
            <Text style={[styles.note, { color: theme.textMuted }]}>
              Starts a 20-minute check-in cycle. Miss a check-in by 10 minutes and the app prompts your buddy to contact you.
            </Text>
            <Button label="Start buddy session" onPress={() => setSession(startSession())} />
          </View>
        )}
      </Card>

      <Card title="Emergency contacts">
        <Text style={[styles.note, { color: theme.textMuted }]}>
          Add up to 3 trusted contacts. They're stored only on this device until you opt to share.
        </Text>
        <Button label="Add contact" variant="secondary" onPress={() => Alert.alert('Coming soon', 'expo-secure-store wiring deferred.')} />
      </Card>

      <Card title="Late-night venues">
        <Text style={[styles.note, { color: theme.textMuted }]}>
          24-hour casinos and late-night spots are tagged in the marketplace so you don't get sent to a place that just closed.
        </Text>
      </Card>
    </ScrollView>
  );
}

function ActiveSession({
  theme,
  status,
  timings,
  onCheckIn,
  onEnd,
  onSOS,
}: {
  theme: ReturnType<typeof themeFor>;
  status: SafetyStatus;
  timings: ReturnType<typeof safetyTimings> | null;
  onCheckIn: () => void;
  onEnd: () => void;
  onSOS: () => void;
}): JSX.Element {
  return (
    <View>
      <View style={[styles.statusPill, statusStyle(status)]}>
        <Text style={styles.statusText}>{status.toUpperCase()}</Text>
      </View>
      {timings && (
        <View>
          <Text style={{ color: theme.textMuted }}>
            Last check-in {timings.minutesSinceCheckIn.toFixed(0)}m ago
          </Text>
          <Text style={{ color: theme.textMuted }}>
            Next prompt in {timings.minutesUntilLate.toFixed(0)}m · auto-escalate to SOS in {timings.minutesUntilSos.toFixed(0)}m
          </Text>
        </View>
      )}
      <Button label="I'm OK (check in)" onPress={onCheckIn} />
      <Button label="End session" variant="secondary" onPress={onEnd} />
      <Pressable onPress={onSOS} style={styles.sosButton} accessibilityRole="button">
        <Text style={styles.sosText}>Trigger SOS</Text>
      </Pressable>
    </View>
  );
}

function statusStyle(status: SafetyStatus): object {
  switch (status) {
    case 'active': return { backgroundColor: '#16a34a' };
    case 'late':   return { backgroundColor: '#f59e0b' };
    case 'sos':    return { backgroundColor: '#dc2626' };
    case 'inactive':
    default:       return { backgroundColor: '#6b7280' };
  }
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, flexGrow: 1 },
  heading: { fontSize: 24, fontWeight: '700' },
  muted: { fontSize: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  label: { flexShrink: 1, fontSize: 14 },
  note: { fontSize: 12, marginVertical: 8 },
  statusPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginBottom: 8 },
  statusText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  sosButton: { backgroundColor: '#dc2626', paddingVertical: 14, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  sosText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
