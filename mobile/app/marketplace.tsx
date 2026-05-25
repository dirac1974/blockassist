import { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { fetchUpcomingEvents, Event } from '../services/events';
import EventCard from '../components/EventCard';

export default function MarketplaceScreen() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchUpcomingEvents().then(setEvents);
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 12 }}>Upcoming Events in Las Vegas</Text>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <EventCard event={item} />}
        ListEmptyComponent={<Text>No upcoming events found.</Text>}
      />
    </View>
  );
}