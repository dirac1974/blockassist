import { forwardRef } from 'react';
import { Pressable, Text, StyleSheet, View, type GestureResponderEvent } from 'react-native';

type Variant = 'primary' | 'secondary' | 'danger';

export type ButtonProps = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  disabled?: boolean;
};

export const Button = forwardRef<View, ButtonProps>(function Button(
  { label, onPress, variant = 'primary', disabled = false },
  ref,
): JSX.Element {
  return (
    <Pressable
      ref={ref}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.base,
        styleForVariant(variant),
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, variant === 'secondary' && styles.labelSecondary]}>{label}</Text>
    </Pressable>
  );
});

function styleForVariant(v: Variant): object {
  switch (v) {
    case 'primary': return styles.primary;
    case 'secondary': return styles.secondary;
    case 'danger': return styles.danger;
  }
}

const styles = StyleSheet.create({
  base: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 6, alignItems: 'center', marginVertical: 4 },
  primary: { backgroundColor: '#1a73e8' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#1a73e8' },
  danger: { backgroundColor: '#b00020' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { color: '#fff', fontSize: 16, fontWeight: '600' },
  labelSecondary: { color: '#1a73e8' },
});
