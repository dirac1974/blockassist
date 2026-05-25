import { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native';
import {
  Event,
  computeEventBoost,
  fetchUpcomingEvents,
} from '../services/events';
import EventCard from '../components/EventCard';
import {
  getZoneAt,
  zoneDemandMultiplier,
} from '../services/hot-zones';
import { isNightTime, nightlifeBoostFor, themeFor } from '../services/night-mode';
import ZoneIndicator from '../components/ZoneIndicator';
import { useUserLocation, resolveLocation } from '../hooks/useUserLocation';

export default function MarketplaceScreen(): JSX.Element {
  const theme = themeFor();
  const [events, setEvents] = useState<Event[]>([]);
  const [eventBoostEnabled, setEventBoostEnabled] = useState(true);
  const { location } = useUserLocation();
  const loc = resolveLocation(location);

  useEffect(() => {
    fetchUpcomingEvents().then(setEvents);
  }, []);

  const eventBoost = useMemo(() => {
    if (!eventBoostEnabled) return { score: 0, contributors: [], active: false };
    return computeEventBoost(loc.lat, loc.lng, events);
  }, [events, eventBoostEnabled, loc.lat, loc.lng]);

  const zone = getZoneAt(loc.lat, loc.lng);
  const zoneSurge = zoneDemandMultiplier(loc.lat, loc.lng);
  const nightSurge = nightlifeBoostFor();
  // Combined effective surge that the matching engine would apply.
  const combinedSurge = zoneSurge * (1 + 0.5 * eventBoost.score) * nightSurge;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.root, Platform.OS === 'android' && { paddingTop: 8 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Las Vegas events</Text>
          <View style={styles.toggleRow}>
            <Text style={{ color: theme.text }}>Event boost</Text>
            <Switch value={eventBoostEnabled} onValueChange={setEventBoostEnabled} />
          </View>
        </View>

        <View style={styles.surgeRow}>
          <ZoneIndicator zone={zone} multiplier={zoneSurge} />
          <View style={styles.surgePill} accessibilityLabel={`Combined effective surge ${combinedSurge.toFixed(2)}x`}>
            <Text style={styles.surgeLabel}>Effective surge</Text>
            <Text style={styles.surgeValue}>{combinedSurge.toFixed(2)}×</Text>
          </View>
        </View>

        <Text style={[styles.note, { color: theme.textMuted }]}>
          Zone {zoneSurge.toFixed(2)}× · event boost {(1 + 0.5 * eventBoost.score).toFixed(2)}× · night {nightSurge.toFixed(2)}×{isNightTime() ? ' (active)' : ''}
        </Text>

        {eventBoost.contributors.length > 0 && (
          <Text style={[styles.note, { color: theme.textMuted }]}>
            Top event: {eventBoost.contributors[0].eventTitle} ({(eventBoost.contributors[0].contribution * 100).toFixed(0)}%)
          </Text>
        )}

        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <EventCard event={item} />}
          ListEmptyComponent={<Text style={{ color: theme.textMuted }}>No events found.</Text>}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  surgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  surgePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: '#1a73e8' },
  surgeLabel: { color: '#dfe9ff', fontSize: 10, fontWeight: '600' },
  surgeValue: { color: '#fff', fontWeight: '800' },
  note: { fontSize: 12, marginBottom: 4 },
});
