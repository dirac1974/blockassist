import { View, Text, StyleSheet } from 'react-native';
import { Event, isEventActive } from '../services/events';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const active = isEventActive(event);

  return (
    <View style={[styles.card, active && styles.activeCard]}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.venue}>{event.venue}</Text>
      <Text style={styles.time}>
        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
        {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      {active && <Text style={styles.liveTag}>🔥 LIVE - Matching Boosted</Text>}
      <Text style={styles.category}>{event.category.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 16, marginVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#ddd' },
  activeCard: { borderColor: '#FF3B30', backgroundColor: '#FFF5F5' },
  title: { fontSize: 17, fontWeight: '700' },
  venue: { color: '#555', marginTop: 4 },
  time: { color: '#777', marginTop: 4 },
  liveTag: { color: '#FF3B30', fontWeight: 'bold', marginTop: 8 },
  category: { color: '#007AFF', fontSize: 12, marginTop: 6 },
});