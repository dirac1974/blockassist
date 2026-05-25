import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TierBadge } from '../../components/TierBadge';
import ZoneIndicator from '../../components/ZoneIndicator';
import { getZoneAt, zoneDemandMultiplier } from '../../services/hot-zones';
import { isNightTime, themeFor } from '../../services/night-mode';

export default function HomeScreen(): JSX.Element {
  const theme = themeFor();
  // Placeholder demo data. Real data wires in via SDK once auth lands.
  const balanceUsdc = 0;
  const tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null = null;
  // Demo: pretend the user is on the Strip near Bellagio until geolocation lands.
  const demoLoc = { lat: 36.1147, lng: -115.1728 };
  const zone = getZoneAt(demoLoc.lat, demoLoc.lng);
  const surge = zoneDemandMultiplier(demoLoc.lat, demoLoc.lng);
  const night = isNightTime();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>BlockAssist</Text>
      <Text style={[styles.tagline, { color: theme.textMuted }]}>USDC-escrow gig platform on Solana.</Text>

      <View style={styles.indicatorsRow}>
        <ZoneIndicator zone={zone} multiplier={surge} />
        {night && (
          <View style={styles.nightPill} accessibilityLabel="Night mode active">
            <Text style={styles.nightPillText}>🌙 Night mode</Text>
          </View>
        )}
      </View>

      <Card title="Wallet">
        <Text style={styles.balance}>${balanceUsdc.toFixed(2)} USDC</Text>
        <Link href="/sign-in" asChild>
          <Button label="Sign in" />
        </Link>
      </Card>

      <Card title="Reputation">
        {tier ? <TierBadge tier={tier} /> : <Text style={styles.muted}>No reputation yet — complete an order to start.</Text>}
      </Card>

      <Card title="Quick actions">
        <Link href="/marketplace" asChild>
          <Button label="Browse marketplace" variant="secondary" />
        </Link>
        <Link href="/create-listing" asChild>
          <Button label="Post a listing" variant="secondary" />
        </Link>
        <Link href="/orders" asChild>
          <Button label="My orders" variant="secondary" />
        </Link>
        <Link href="/zones" asChild>
          <Button label="View Las Vegas zones" variant="secondary" />
        </Link>
        <Link href="/safety" asChild>
          <Button label="Safety & buddy" variant="secondary" />
        </Link>
      </Card>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  heading: { fontSize: 28, fontWeight: '700' },
  tagline: { fontSize: 14, marginBottom: 8 },
  balance: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#666' },
  indicatorsRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  nightPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#30363d' },
  nightPillText: { color: '#e6edf3', fontSize: 12, fontWeight: '600' },
});
