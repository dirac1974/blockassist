import { ScrollView, View, Text, TextInput, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';

const MAX_TITLE = 80;
const MAX_DESCRIPTION = 1000;

export default function CreateListingScreen(): JSX.Element {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceUsdc, setPriceUsdc] = useState('');
  const [city, setCity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const priceCents = parsePriceCents(priceUsdc);
  const validTitle = title.trim().length > 2 && title.length <= MAX_TITLE;
  const validDescription = description.trim().length > 5 && description.length <= MAX_DESCRIPTION;
  const validPrice = priceCents !== null && priceCents > 0 && priceCents <= 100_000_00; // hard cap $100k for sanity
  const validCity = city.trim().length > 1;
  const canSubmit = !submitting && validTitle && validDescription && validPrice && validCity;

  const onSubmit = async (): Promise<void> => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      // TODO: SDK call to marketplace program. Placeholder for now.
      await new Promise((r) => setTimeout(r, 600));
      router.back();
    } catch (e) {
      Alert.alert('Could not create listing', (e as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card title="New listing">
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          maxLength={MAX_TITLE}
          placeholder="What do you need done?"
          autoCorrect
        />
        <Text style={styles.counter}>{title.length}/{MAX_TITLE}</Text>

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
          maxLength={MAX_DESCRIPTION}
          placeholder="Time, place, what success looks like."
        />
        <Text style={styles.counter}>{description.length}/{MAX_DESCRIPTION}</Text>

        <Text style={styles.label}>Price (USDC)</Text>
        <TextInput
          value={priceUsdc}
          onChangeText={setPriceUsdc}
          style={styles.input}
          keyboardType="decimal-pad"
          placeholder="0.00"
        />
        {!validPrice && priceUsdc.length > 0 && (
          <Text style={styles.error}>Enter a positive USD amount (up to $100,000).</Text>
        )}

        <Text style={styles.label}>City</Text>
        <TextInput
          value={city}
          onChangeText={setCity}
          style={styles.input}
          placeholder="e.g. Lisbon"
          autoCapitalize="words"
        />

        <Button label={submitting ? 'Posting…' : 'Post listing'} onPress={onSubmit} disabled={!canSubmit} />

        <Text style={styles.footnote}>
          A small listing fee (refunded on completion) is deducted to prevent spam.
        </Text>
      </Card>
    </ScrollView>
  );
}

function parsePriceCents(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return null;
  // Accept only digits + optional one decimal point with up to 2 decimals.
  if (!/^\d+(\.\d{0,2})?$/.test(trimmed)) return null;
  const dollars = Number.parseFloat(trimmed);
  if (!Number.isFinite(dollars)) return null;
  return Math.round(dollars * 100);
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  label: { fontWeight: '600', marginTop: 12, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 10, fontSize: 16 },
  multiline: { minHeight: 100, textAlignVertical: 'top' },
  counter: { fontSize: 11, color: '#888', textAlign: 'right' },
  error: { color: '#b00020', fontSize: 12 },
  footnote: { fontSize: 11, color: '#888', marginTop: 12 },
});
