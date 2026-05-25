import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { HOT_ZONES, HotZone, getAllZonesAt, getCentroid } from '../services/hot-zones';

interface Props {
  /** Caller's location; renders a marker pill if inside any zone. */
  userLocation?: { lat: number; lng: number };
}

/**
 * Placeholder for the native map view. Renders a textual list of zones
 * and the user's current zone(s). Swap to react-native-maps once the
 * Mobile Lead commits to the dependency.
 */
export default function HotZoneMap({ userLocation }: Props): JSX.Element {
  const userZones = userLocation ? getAllZonesAt(userLocation.lat, userLocation.lng) : [];

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Las Vegas demand zones</Text>
      {userLocation ? (
        <Text style={styles.userLoc} accessibilityLabel="Your location">
          You: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </Text>
      ) : (
        <Text style={styles.userLocMissing}>Location off — turn on to see zone surge.</Text>
      )}

      <ScrollView contentContainerStyle={styles.list}>
        {HOT_ZONES.map((z) => {
          const inside = userZones.find((uz) => uz.id === z.id);
          return <ZoneRow key={z.id} zone={z} inside={!!inside} />;
        })}
      </ScrollView>

      <Text style={styles.footnote}>
        Map view coming with native maps. Surge multipliers are placeholders pending
        Tokenomics calibration on real pilot data.
      </Text>
    </View>
  );
}

function ZoneRow({ zone, inside }: { zone: HotZone; inside: boolean }): JSX.Element {
  const c = getCentroid(zone);
  return (
    <View style={[styles.row, inside && styles.rowInside]}>
      <View style={styles.rowMain}>
        <Text style={styles.rowName}>{inside ? '● ' : '○ '}{zone.name}</Text>
        <Text style={styles.rowSurge}>{zone.demandMultiplier.toFixed(2)}×</Text>
      </View>
      <Text style={styles.rowDesc}>{zone.description}</Text>
      <Text style={styles.rowCoords}>~{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 12, gap: 8, flex: 1 },
  heading: { fontSize: 18, fontWeight: '700' },
  userLoc: { fontSize: 12, color: '#444' },
  userLocMissing: { fontSize: 12, color: '#888' },
  list: { gap: 8, paddingBottom: 12 },
  row: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, gap: 4 },
  rowInside: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  rowMain: { flexDirection: 'row', justifyContent: 'space-between' },
  rowName: { fontWeight: '600' },
  rowSurge: { fontWeight: '700', color: '#9a4b00' },
  rowDesc: { color: '#444', fontSize: 12 },
  rowCoords: { color: '#888', fontSize: 11, fontFamily: 'Menlo' },
  footnote: { fontSize: 11, color: '#888', marginTop: 4 },
});
