import { View, Text, StyleSheet } from 'react-native';
import type { HotZone } from '../services/hot-zones';

interface Props {
  zone: HotZone | null;
  /** Optional surge label such as "1.5×". */
  multiplier?: number;
}

export default function ZoneIndicator({ zone, multiplier }: Props): JSX.Element {
  if (!zone) {
    return (
      <View style={[styles.pill, styles.neutral]} accessibilityLabel="Outside hot zone">
        <Text style={styles.text}>· Outside hot zone</Text>
      </View>
    );
  }
  const surge = multiplier ?? zone.demandMultiplier;
  return (
    <View style={[styles.pill, styles.hot]} accessibilityLabel={`In ${zone.name}, ${surge.toFixed(2)}x demand`}>
      <Text style={styles.text}>● {zone.name}</Text>
      <Text style={styles.surge}>{surge.toFixed(2)}×</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 8,
    alignSelf: 'flex-start',
  },
  neutral: { backgroundColor: '#eef0f3' },
  hot: { backgroundColor: '#fde9c8' },
  text: { fontSize: 12, fontWeight: '600', color: '#222' },
  surge: { fontSize: 12, fontWeight: '700', color: '#9a4b00' },
});
