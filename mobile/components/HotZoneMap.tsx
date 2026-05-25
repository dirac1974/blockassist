import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polygon } from 'react-native-maps';

export default function HotZoneMap() {
  const [selectedZone, setSelectedZone] = useState(null);

  // Las Vegas Hot Zones (LV-002)
  const hotZones = [
    {
      id: 'strip',
      name: 'Las Vegas Strip',
      coordinates: [
        { latitude: 36.1147, longitude: -115.1728 },
        { latitude: 36.1147, longitude: -115.1400 },
        { latitude: 36.0900, longitude: -115.1400 },
        { latitude: 36.0900, longitude: -115.1728 },
      ],
      color: '#FF3B30',
    },
    {
      id: 'downtown',
      name: 'Downtown Las Vegas',
      coordinates: [
        { latitude: 36.1690, longitude: -115.1400 },
        { latitude: 36.1690, longitude: -115.1200 },
        { latitude: 36.1550, longitude: -115.1200 },
        { latitude: 36.1550, longitude: -115.1400 },
      ],
      color: '#007AFF',
    },
    {
      id: 'airport',
      name: 'Harry Reid Airport',
      coordinates: [
        { latitude: 36.0800, longitude: -115.1500 },
        { latitude: 36.0800, longitude: -115.1200 },
        { latitude: 36.0600, longitude: -115.1200 },
        { latitude: 36.0600, longitude: -115.1500 },
      ],
      color: '#34C759',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Las Vegas Hot Zones</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 36.1147,
          longitude: -115.1728,
          latitudeDelta: 0.15,
          longitudeDelta: 0.15,
        }}
      >
        {hotZones.map((zone) => (
          <Polygon
            key={zone.id}
            coordinates={zone.coordinates}
            fillColor={zone.color + '40'} // 25% opacity
            strokeColor={zone.color}
            strokeWidth={2}
            onPress={() => setSelectedZone(zone)}
          />
        ))}
      </MapView>

      {selectedZone && (
        <View style={styles.infoBox}>
          <Text style={styles.zoneName}>{selectedZone.name}</Text>
          <Text>High demand area - Boosted matching active</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: 'bold', padding: 16 },
  map: { flex: 1 },
  infoBox: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  zoneName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});