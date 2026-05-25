import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { StatusPill } from '../../components/StatusPill';
import { formatUsdc } from '../../lib/format';
import type { Listing } from '../../types';

const PLACEHOLDER_LISTINGS: Listing[] = [
  { id: '1', title: 'Grocery run, 1 hour', priceUsdcCents: 1500, status: 'open', city: 'Lisbon', createdAt: Date.now() - 60_000 },
  { id: '2', title: 'IKEA assembly', priceUsdcCents: 4500, status: 'open', city: 'Lisbon', createdAt: Date.now() - 120_000 },
  { id: '3', title: 'Document scanning', priceUsdcCents: 2000, status: 'in_progress', city: 'Singapore', createdAt: Date.now() - 3_600_000 },
];

export default function MarketplaceScreen(): JSX.Element {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 600);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={PLACEHOLDER_LISTINGS}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListHeaderComponent={
          <View>
            <Text style={styles.heading}>Marketplace</Text>
            <Text style={styles.muted}>Placeholder listings — wire to chain via SDK.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card
            title={item.title}
            onPress={() => router.push(`/order/${item.id}`)}
            right={<StatusPill status={item.status} />}
          >
            <Text style={styles.price}>{formatUsdc(item.priceUsdcCents)}</Text>
            <Text style={styles.meta}>{item.city}</Text>
            {item.status === 'open' && (
              <Button label="View" onPress={() => router.push(`/order/${item.id}`)} />
            )}
          </Card>
        )}
        ListEmptyComponent={<Text style={styles.muted}>No listings right now.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 4 },
  muted: { color: '#666', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '600' },
  meta: { color: '#444' },
});
