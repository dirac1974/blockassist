import type { ReactNode } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';

export type CardProps = {
  title?: string;
  right?: ReactNode;
  children?: ReactNode;
  onPress?: () => void;
};

export function Card({ title, right, children, onPress }: CardProps): JSX.Element {
  const inner = (
    <View style={styles.card}>
      {(title || right) && (
        <View style={styles.headerRow}>
          {title && <Text style={styles.title}>{title}</Text>}
          {right ? <View>{right}</View> : null}
        </View>
      )}
      {children}
    </View>
  );

  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} accessibilityRole="button">
      {inner}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 4,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  title: { fontSize: 16, fontWeight: '700' },
});
