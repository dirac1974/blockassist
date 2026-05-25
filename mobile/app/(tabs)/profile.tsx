import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { TierBadge } from '../../components/TierBadge';
import { formatUsdc } from '../../lib/format';

export default function ProfileScreen(): JSX.Element {
  // Placeholders. Profile data wires in via SDK once auth lands.
  const usdcCents = 0;
  const collateralCents = 0;
  const tier = 'Bronze' as const;
  const completedOrders = 0;
  const disputeLossRate = 0;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Profile</Text>

      <Card title="Wallet">
        <Row label="USDC balance" value={formatUsdc(usdcCents)} />
        <Row label="Collateral (USDC)" value={formatUsdc(collateralCents)} />
        <Button label="Deposit" variant="secondary" />
        <Button label="Withdraw" variant="secondary" />
      </Card>

      <Card title="Reputation">
        <View style={styles.tierRow}>
          <TierBadge tier={tier} />
          <Text style={styles.muted}>{completedOrders} orders · {(disputeLossRate * 100).toFixed(1)}% dispute-loss rate</Text>
        </View>
      </Card>

      <Card title="Visitor">
        <Link href="/tourist-onboarding" asChild>
          <Button label="Tourist Mode" variant="secondary" />
        </Link>
        <Link href="/safety" asChild>
          <Button label="Safety & buddy check-in" variant="secondary" />
        </Link>
      </Card>

      <Card title="Settings">
        <Button label="Manage passkey" variant="secondary" />
        <Button label="Recovery email" variant="secondary" />
        <Button label="Sign out" variant="danger" />
      </Card>

      <Text style={styles.footer}>
        Token (governance/yield) features deferred — see docs/alternatives/no-token-spec.md.
      </Text>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  heading: { fontSize: 24, fontWeight: '700' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  rowLabel: { color: '#444' },
  rowValue: { fontWeight: '600' },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  muted: { color: '#666' },
  footer: { fontSize: 11, color: '#888', marginTop: 16, textAlign: 'center' },
});
