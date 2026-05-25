import { View, Text, StyleSheet } from 'react-native';

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

const COLORS: Record<Tier, { bg: string; fg: string }> = {
  Bronze:   { bg: '#7a4f1d', fg: '#fff' },
  Silver:   { bg: '#7d8b96', fg: '#fff' },
  Gold:     { bg: '#b88419', fg: '#fff' },
  Platinum: { bg: '#3a3a3a', fg: '#fff' },
};

export function TierBadge({ tier }: { tier: Tier }): JSX.Element {
  const c = COLORS[tier];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]} accessibilityLabel={`Tier: ${tier}`}>
      <Text style={[styles.text, { color: c.fg }]}>{tier}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  text: { fontSize: 12, fontWeight: '700' },
});
