import { View, Text, StyleSheet } from 'react-native';
import { Event } from '../services/events';

interface EventCardProps {
  event: Event;
  onPress?: () => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const isActive = new Date(event.startTime) <= new Date() && new Date(event.endTime) >= new Date();

  return (
    <View style={[styles.card, isActive && styles.activeCard]}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.venue}>{event.venue}</Text>
      <Text style={styles.time}>
        {new Date(event.startTime).toLocaleTimeString()} - {new Date(event.endTime).toLocaleTimeString()}
      </Text>
      {isActive && <Text style={styles.live}>LIVE - Boosted Matching</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activeCard: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  title: { fontSize: 16, fontWeight: 'bold' },
  venue: { color: '#666', marginTop: 4 },
  time: { color: '#888', marginTop: 4 },
  live: { color: '#007AFF', fontWeight: 'bold', marginTop: 8 },
});