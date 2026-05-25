import HotZoneMap from '../components/HotZoneMap';
import { useUserLocation, resolveLocation } from '../hooks/useUserLocation';

// LV-002: Strip & Downtown Hot Zones — temporary placeholder route until a
// native MapView (react-native-maps) lands.
export default function ZonesScreen(): JSX.Element {
  const { location } = useUserLocation();
  const loc = resolveLocation(location);
  return <HotZoneMap userLocation={{ lat: loc.lat, lng: loc.lng }} />;
}
