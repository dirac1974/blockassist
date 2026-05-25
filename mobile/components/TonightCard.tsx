import { View, Text, StyleSheet } from 'react-native';
import type { Destination, VenueTag } from '../services/tourist-mode';
import { destinationsByTag } from '../services/tourist-mode';
import type { NightTheme } from '../services/night-mode';

interface Props {
  theme: NightTheme;
  /** Tag filter; defaults to ['24-hour'] which is the most useful night-time set. */
  tags?: VenueTag[];
  /** Maximum number of items to render. */
  limit?: number;
}

/**
 * "Tonight in Vegas" card. Renders nothing when no destinations match the
 * filter, so home can include it unconditionally during the night window
 * without ever showing an empty container.
 */
export default function TonightCard({ theme, tags = ['24-hour'], limit = 4 }: Props): JSX.Element | null {
  const list = destinationsByTag(tags).slice(0, limit);
  if (list.length === 0) return null;
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]} accessibilityLabel="Tonight in Vegas recommendations">
      <Text style={[styles.title, { color: theme.text }]}>🌙 Tonight in Vegas</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>
        Open now ({tags.join(' · ')})
      </Text>
      {list.map((d) => (
        <DestinationRow key={d.id} dest={d} theme={theme} />
      ))}
    </View>
  );
}

function DestinationRow({ dest, theme }: { dest: Destination; theme: NightTheme }): JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={[styles.name, { color: theme.text }]}>{dest.name}</Text>
      <Text style={[styles.blurb, { color: theme.textMuted }]}>{dest.blurb}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 8, padding: 14, borderWidth: 1, gap: 4 },
  title: { fontSize: 16, fontWeight: '700' },
  subtitle: { fontSize: 11, marginBottom: 6 },
  row: { paddingVertical: 4 },
  name: { fontWeight: '600' },
  blurb: { fontSize: 12 },
});
