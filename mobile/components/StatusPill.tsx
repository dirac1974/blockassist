import { View, Text, StyleSheet } from 'react-native';
import type { OrderStatus, ListingStatus } from '../types';

type Status = OrderStatus | ListingStatus;

const COLORS: Record<Status, { bg: string; fg: string; label: string }> = {
  open:                 { bg: '#e3f2fd', fg: '#0d47a1', label: 'Open' },
  funded:               { bg: '#e8f5e9', fg: '#1b5e20', label: 'Funded' },
  in_progress:          { bg: '#fff8e1', fg: '#f57f17', label: 'In progress' },
  awaiting_acceptance:  { bg: '#fffde7', fg: '#f57f17', label: 'Awaiting acceptance' },
  completed:            { bg: '#e0f2f1', fg: '#004d40', label: 'Completed' },
  disputed:             { bg: '#fbe9e7', fg: '#bf360c', label: 'Disputed' },
  cancelled:            { bg: '#eceff1', fg: '#455a64', label: 'Cancelled' },
  expired:              { bg: '#eceff1', fg: '#455a64', label: 'Expired' },
};

export function StatusPill({ status }: { status: Status }): JSX.Element {
  const c = COLORS[status] ?? { bg: '#eee', fg: '#333', label: status };
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]} accessibilityLabel={`Status: ${c.label}`}>
      <Text style={[styles.text, { color: c.fg }]}>{c.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  text: { fontSize: 11, fontWeight: '700' },
});
