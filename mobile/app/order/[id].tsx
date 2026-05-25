import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusPill } from '../../components/StatusPill';
import { formatUsdc, timeAgo, formatRemaining } from '../../lib/format';
import type { Order, OrderStatus } from '../../types';

const PLACEHOLDER_ORDERS: Record<string, Order & { description?: string; challengeWindowEndsAt?: number }> = {
  '1': { id: '1', listingTitle: 'Grocery run, 1 hour', counterparty: 'assistant-7a4b', priceUsdcCents: 1500, status: 'open', updatedAt: Date.now() - 5 * 60_000, description: 'Pick up the list at the front desk; deliver to apartment 4B.' },
  '2': { id: '2', listingTitle: 'IKEA assembly', counterparty: 'assistant-93de', priceUsdcCents: 4500, status: 'in_progress', updatedAt: Date.now() - 30 * 60_000, description: 'Two-piece desk + chair. Tools at the apartment.' },
  '3': { id: '3', listingTitle: 'Document scanning', counterparty: 'assistant-c1ab', priceUsdcCents: 2000, status: 'awaiting_acceptance', updatedAt: Date.now() - 60 * 60_000, description: 'Scan 40 pages, upload to provided link.', challengeWindowEndsAt: Date.now() + 24 * 3_600_000 },
  'a1': { id: 'a1', listingTitle: 'Grocery run, 1 hour', counterparty: 'assistant-7a4b', priceUsdcCents: 1500, status: 'funded', updatedAt: Date.now() - 5 * 60_000 },
  'a2': { id: 'a2', listingTitle: 'IKEA assembly', counterparty: 'assistant-93de', priceUsdcCents: 4500, status: 'in_progress', updatedAt: Date.now() - 30 * 60_000 },
  'p1': { id: 'p1', listingTitle: 'Last week box pickup', counterparty: 'assistant-12ab', priceUsdcCents: 800, status: 'completed', updatedAt: Date.now() - 5 * 24 * 3_600_000 },
};

export default function OrderDetail(): JSX.Element {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = id ? PLACEHOLDER_ORDERS[id] : undefined;

  if (!order) {
    return (
      <View style={styles.container}>
        <Text style={styles.heading}>Order not found</Text>
        <Text style={styles.muted}>ID {String(id)} has no matching record.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{order.listingTitle}</Text>
        <StatusPill status={order.status} />
      </View>

      <Card title="Summary">
        <Row label="Counterparty" value={order.counterparty} />
        <Row label="Price" value={formatUsdc(order.priceUsdcCents)} />
        <Row label="Updated" value={timeAgo(order.updatedAt)} />
        {order.description && <Text style={styles.description}>{order.description}</Text>}
      </Card>

      {order.status === 'awaiting_acceptance' && order.challengeWindowEndsAt && (
        <Card title="Action required">
          <Text style={styles.copy}>
            The assistant has marked this delivered. Confirm or dispute before the window closes in{' '}
            <Text style={styles.bold}>{formatRemaining(order.challengeWindowEndsAt)}</Text>.
          </Text>
          <Button label="Accept and release" />
          <Button label="Dispute" variant="danger" />
        </Card>
      )}

      {actionsForStatus(order.status).length > 0 && (
        <Card title="Actions">
          {actionsForStatus(order.status).map((a) => (
            <Button key={a.label} label={a.label} variant={a.variant} />
          ))}
        </Card>
      )}

      <Card title="On-chain references">
        <Text style={styles.codeLabel}>Escrow PDA</Text>
        <Text style={styles.code}>—</Text>
        <Text style={styles.codeLabel}>Order hash</Text>
        <Text style={styles.code}>—</Text>
      </Card>
    </ScrollView>
  );
}

function actionsForStatus(s: OrderStatus): Array<{ label: string; variant?: 'secondary' | 'danger' }> {
  switch (s) {
    case 'open': return [{ label: 'Accept this listing' }];
    case 'funded': return [{ label: 'Mark delivered' }, { label: 'Cancel', variant: 'danger' }];
    case 'in_progress': return [{ label: 'Mark delivered' }, { label: 'Cancel', variant: 'danger' }];
    case 'awaiting_acceptance': return [];
    case 'completed': return [{ label: 'View transaction', variant: 'secondary' }];
    case 'disputed': return [{ label: 'Submit evidence', variant: 'secondary' }];
    case 'cancelled': return [];
    default: return [];
  }
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
  heading: { fontSize: 22, fontWeight: '700', flexShrink: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  muted: { color: '#666' },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  rowLabel: { color: '#444' },
  rowValue: { fontWeight: '600' },
  description: { marginTop: 8, color: '#333' },
  copy: { color: '#333', marginBottom: 8 },
  bold: { fontWeight: '700' },
  codeLabel: { fontSize: 11, color: '#666', marginTop: 6 },
  code: { fontFamily: 'Menlo', fontSize: 12, color: '#222' },
});
