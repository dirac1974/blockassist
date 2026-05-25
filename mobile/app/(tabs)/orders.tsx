import { SectionList, View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../../components/Card';
import { StatusPill } from '../../components/StatusPill';
import { formatUsdc, timeAgo } from '../../lib/format';
import type { Order } from '../../types';

const PLACEHOLDER_ORDERS: { active: Order[]; past: Order[] } = {
  active: [
    { id: 'a1', listingTitle: 'Grocery run, 1 hour', counterparty: 'assistant-7a4b', priceUsdcCents: 1500, status: 'funded', updatedAt: Date.now() - 5 * 60_000 },
    { id: 'a2', listingTitle: 'IKEA assembly', counterparty: 'assistant-93de', priceUsdcCents: 4500, status: 'in_progress', updatedAt: Date.now() - 30 * 60_000 },
  ],
  past: [
    { id: 'p1', listingTitle: 'Last week box pickup', counterparty: 'assistant-12ab', priceUsdcCents: 800, status: 'completed', updatedAt: Date.now() - 5 * 24 * 3_600_000 },
  ],
};

export default function OrdersScreen(): JSX.Element {
  const router = useRouter();
  const sections = [
    { title: 'Active', data: PLACEHOLDER_ORDERS.active },
    { title: 'Past', data: PLACEHOLDER_ORDERS.past },
  ];

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderSectionHeader={({ section: { title, data } }) => (
        <Text style={styles.sectionHeader}>{title} ({data.length})</Text>
      )}
      renderItem={({ item }) => (
        <Card
          title={item.listingTitle}
          onPress={() => router.push(`/order/${item.id}`)}
          right={<StatusPill status={item.status} />}
        >
          <Text style={styles.row}>{formatUsdc(item.priceUsdcCents)} · {item.counterparty}</Text>
          <Text style={styles.muted}>updated {timeAgo(item.updatedAt)}</Text>
        </Card>
      )}
      ListEmptyComponent={<Text style={styles.muted}>No orders yet.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  sectionHeader: { fontSize: 16, fontWeight: '700', marginTop: 8, marginBottom: 4 },
  row: { fontSize: 14 },
  muted: { color: '#666', fontSize: 12 },
});
