import HotZoneMap from '../components/HotZoneMap';

// LV-002: Strip & Downtown Hot Zones — temporary placeholder route until a
// native MapView (react-native-maps) lands.
export default function ZonesScreen(): JSX.Element {
  // Demo location near Bellagio; replaces with expo-location once geolocation lands.
  const demoLoc = { lat: 36.1147, lng: -115.1728 };
  return <HotZoneMap userLocation={demoLoc} />;
}
