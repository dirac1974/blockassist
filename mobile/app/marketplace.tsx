import { useEffect, useState } from 'react';
import { View, Text, FlatList, Switch, StyleSheet } from 'react-native';
import { fetchUpcomingEvents, Event } from '../services/events';
import EventCard from '../components/EventCard';

export default function MarketplaceScreen() {
  const [events, setEvents] = useState<Event[]>([]);
  const [eventBoostEnabled, setEventBoostEnabled] = useState(true);

  useEffect(() => {
    fetchUpcomingEvents().then(setEvents);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Las Vegas Events</Text>
        <View style={styles.toggleRow}>
          <Text>Event Boost</Text>
          <Switch value={eventBoostEnabled} onValueChange={setEventBoostEnabled} />
        </View>
      </View>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={<Text>No events found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: 'bold' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});