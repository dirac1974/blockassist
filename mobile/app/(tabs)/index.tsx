import { ScrollView, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TierBadge } from '../../components/TierBadge';
import ZoneIndicator from '../../components/ZoneIndicator';
import { getZoneAt, zoneDemandMultiplier } from '../../services/hot-zones';

export default function HomeScreen(): JSX.Element {
  // Placeholder demo data. Real data wires in via SDK once auth lands.
  const balanceUsdc = 0;
  const tier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | null = null;
  // Demo: pretend the user is on the Strip near Bellagio until geolocation lands.
  const demoLoc = { lat: 36.1147, lng: -115.1728 };
  const zone = getZoneAt(demoLoc.lat, demoLoc.lng);
  const surge = zoneDemandMultiplier(demoLoc.lat, demoLoc.lng);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>BlockAssist</Text>
      <Text style={styles.tagline}>USDC-escrow gig platform on Solana.</Text>

      <ZoneIndicator zone={zone} multiplier={surge} />

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
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  heading: { fontSize: 28, fontWeight: '700' },
  tagline: { fontSize: 14, color: '#555', marginBottom: 8 },
  balance: { fontSize: 22, fontWeight: '600', marginBottom: 8 },
  muted: { color: '#666' },
});
