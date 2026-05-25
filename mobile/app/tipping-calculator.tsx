import { ScrollView, View, Text, TextInput, StyleSheet } from 'react-native';
import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { TIPPING_GUIDE, suggestTips } from '../services/tourist-mode';
import { themeFor } from '../services/night-mode';

export default function TippingCalculatorScreen(): JSX.Element {
  const theme = themeFor();
  const [orderUsd, setOrderUsd] = useState('100');
  const [qty, setQty] = useState('1');

  const order = Number.parseFloat(orderUsd) || 0;
  const quantity = Number.parseInt(qty, 10) || 1;

  const suggestions = useMemo(() => suggestTips(TIPPING_GUIDE, order, quantity), [order, quantity]);

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Tipping calculator</Text>

      <Card title="Inputs">
        <Text style={[styles.label, { color: theme.text }]}>Order amount (USD, used by percent tips)</Text>
        <TextInput
          value={orderUsd}
          onChangeText={setOrderUsd}
          keyboardType="decimal-pad"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="100.00"
          placeholderTextColor={theme.textMuted}
        />

        <Text style={[styles.label, { color: theme.text, marginTop: 8 }]}>Quantity (drinks / bags / nights — used by flat tips)</Text>
        <TextInput
          value={qty}
          onChangeText={setQty}
          keyboardType="number-pad"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="1"
          placeholderTextColor={theme.textMuted}
        />
      </Card>

      <Card title="Suggestions">
        {suggestions.map((s) => (
          <View key={s.service} style={styles.row}>
            <Text style={[styles.svc, { color: theme.text }]}>{s.service}</Text>
            <Text style={[styles.range, { color: theme.text }]}>
              ${s.low.toFixed(2)} — ${s.high.toFixed(2)}
              {s.unit ? ` (${quantity} × ${s.unit})` : ''}
            </Text>
            <Text style={[styles.mid, { color: theme.textMuted }]}>mid ${s.mid.toFixed(2)}</Text>
          </View>
        ))}
      </Card>

      <Text style={[styles.footnote, { color: theme.textMuted }]}>
        Pre-tax. Las Vegas conventions auto-add gratuity for large parties — check the bill.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 16, marginTop: 4 },
  row: { paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  svc: { fontWeight: '600' },
  range: { fontSize: 14 },
  mid: { fontSize: 11 },
  footnote: { fontSize: 11, marginTop: 8 },
});
