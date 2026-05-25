import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Polygon, PROVIDER_GOOGLE } from 'react-native-maps';
import { HOT_ZONES, HotZone, getAllZonesAt, getCentroid } from '../services/hot-zones';

interface Props {
  /** Caller's location; renders a marker if provided + highlights any zone the user is inside. */
  userLocation?: { lat: number; lng: number };
}

// Bounds chosen to frame Las Vegas Strip + Downtown by default.
const LV_INITIAL_REGION = {
  latitude: 36.140,
  longitude: -115.160,
  latitudeDelta: 0.18,
  longitudeDelta: 0.12,
};

const ZONE_FILL = 'rgba(245, 158, 11, 0.25)';
const ZONE_STROKE = 'rgba(245, 158, 11, 1)';
const USER_INSIDE_FILL = 'rgba(220, 38, 38, 0.30)';
const USER_INSIDE_STROKE = 'rgba(220, 38, 38, 1)';

/**
 * LV-002: real map view backed by react-native-maps.
 *
 * Web fallback: react-native-maps does not ship a web implementation. When
 * the runtime is web (`Platform.OS === 'web'`), render the existing
 * textual list view so the dashboard still works.
 */
export default function HotZoneMap({ userLocation }: Props): JSX.Element {
  if (Platform.OS === 'web') return <TextualFallback userLocation={userLocation} />;

  const userZoneIds = userLocation
    ? new Set(getAllZonesAt(userLocation.lat, userLocation.lng).map((z) => z.id))
    : new Set<string>();

  return (
    <View style={styles.container} accessibilityLabel="Las Vegas demand-zone map">
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={LV_INITIAL_REGION}
        showsUserLocation={!!userLocation}
        showsMyLocationButton
        showsCompass
        toolbarEnabled={false}
      >
        {HOT_ZONES.map((zone) => {
          const inside = userZoneIds.has(zone.id);
          return (
            <Polygon
              key={zone.id}
              coordinates={zone.polygon.map((p) => ({ latitude: p.lat, longitude: p.lng }))}
              fillColor={inside ? USER_INSIDE_FILL : ZONE_FILL}
              strokeColor={inside ? USER_INSIDE_STROKE : ZONE_STROKE}
              strokeWidth={inside ? 3 : 1.5}
              tappable
            />
          );
        })}
        {HOT_ZONES.map((zone) => {
          const c = getCentroid(zone);
          return (
            <Marker
              key={`m-${zone.id}`}
              coordinate={{ latitude: c.lat, longitude: c.lng }}
              title={zone.name}
              description={`${zone.demandMultiplier.toFixed(2)}× demand · ${zone.description}`}
            />
          );
        })}
        {userLocation && (
          <Marker
            coordinate={{ latitude: userLocation.lat, longitude: userLocation.lng }}
            title="You"
            pinColor="#1a73e8"
          />
        )}
      </MapView>
      <View style={styles.legend} pointerEvents="none">
        <Text style={styles.legendText}>
          {userZoneIds.size > 0 ? `In ${userZoneIds.size} hot zone${userZoneIds.size > 1 ? 's' : ''}` : 'Outside hot zones'}
        </Text>
      </View>
    </View>
  );
}

function TextualFallback({ userLocation }: Props): JSX.Element {
  const userZones = userLocation ? getAllZonesAt(userLocation.lat, userLocation.lng) : [];
  return (
    <View style={styles.fallback}>
      <Text style={styles.fbHeading}>Las Vegas demand zones</Text>
      {userLocation ? (
        <Text style={styles.fbUser}>
          You: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
        </Text>
      ) : (
        <Text style={styles.fbUserMissing}>Location off — turn on to see zone surge.</Text>
      )}
      {HOT_ZONES.map((z) => {
        const c = getCentroid(z);
        const inside = userZones.find((uz) => uz.id === z.id);
        return (
          <View key={z.id} style={[styles.fbRow, inside && styles.fbRowInside]}>
            <Text style={styles.fbName}>{inside ? '● ' : '○ '}{z.name}</Text>
            <Text style={styles.fbSurge}>{z.demandMultiplier.toFixed(2)}×</Text>
            <Text style={styles.fbDesc}>{z.description}</Text>
            <Text style={styles.fbCoords}>~{c.lat.toFixed(4)}, {c.lng.toFixed(4)}</Text>
          </View>
        );
      })}
      <Text style={styles.fbFootnote}>
        Web preview: textual fallback. Native iOS/Android uses Google Maps.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  legend: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    elevation: 2,
  },
  legendText: { fontSize: 12, fontWeight: '600' },

  fallback: { flex: 1, padding: 12, gap: 8 },
  fbHeading: { fontSize: 18, fontWeight: '700' },
  fbUser: { fontSize: 12, color: '#444' },
  fbUserMissing: { fontSize: 12, color: '#888' },
  fbRow: { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 10, gap: 4 },
  fbRowInside: { borderColor: '#f59e0b', backgroundColor: '#fffbeb' },
  fbName: { fontWeight: '600' },
  fbSurge: { fontWeight: '700', color: '#9a4b00' },
  fbDesc: { color: '#444', fontSize: 12 },
  fbCoords: { color: '#888', fontSize: 11, fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }) },
  fbFootnote: { fontSize: 11, color: '#888', marginTop: 4 },
});
