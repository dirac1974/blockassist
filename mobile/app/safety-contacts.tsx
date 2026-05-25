import { ScrollView, View, Text, TextInput, StyleSheet, Pressable, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { themeFor } from '../services/night-mode';
import {
  EmergencyContact,
  MAX_EMERGENCY_CONTACTS,
  isValidPhone,
  loadEmergencyContacts,
  saveEmergencyContacts,
} from '../lib/secure-store';

// MANAGE-001: add / edit / delete emergency contacts. Backed by
// expo-secure-store via mobile/lib/secure-store.ts.

export default function SafetyContactsScreen(): JSX.Element {
  const theme = themeFor();
  const router = useRouter();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [draft, setDraft] = useState<{ name: string; phone: string; relation: string }>({ name: '', phone: '', relation: '' });
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadEmergencyContacts()
      .then((list) => { setContacts(list); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const canAddMore = contacts.length < MAX_EMERGENCY_CONTACTS;
  const trimmedName = draft.name.trim();
  const trimmedPhone = draft.phone.trim();
  const draftValid = trimmedName.length > 0 && isValidPhone(trimmedPhone);

  const onAdd = async (): Promise<void> => {
    setError(null);
    if (!draftValid) {
      setError('Enter a name and a valid phone (E.164 e.g. +15551234567 or US 10-digit).');
      return;
    }
    if (!canAddMore) {
      setError(`Maximum ${MAX_EMERGENCY_CONTACTS} contacts. Delete one to add another.`);
      return;
    }
    const next: EmergencyContact[] = [
      ...contacts,
      {
        id: `c-${Date.now()}`,
        name: trimmedName,
        phone: trimmedPhone,
        relation: draft.relation.trim() || undefined,
      },
    ];
    setContacts(next);
    setDraft({ name: '', phone: '', relation: '' });
    try {
      await saveEmergencyContacts(next);
    } catch (e) {
      Alert.alert('Could not save', (e as Error).message);
    }
  };

  const onDelete = async (id: string): Promise<void> => {
    const next = contacts.filter((c) => c.id !== id);
    setContacts(next);
    try { await saveEmergencyContacts(next); }
    catch (e) { Alert.alert('Could not save', (e as Error).message); }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.heading, { color: theme.text }]}>Emergency contacts</Text>
      <Text style={[styles.muted, { color: theme.textMuted }]}>
        Stored only on this device. Used to page during a safety SOS — never auto-dialed; you act inside the app.
      </Text>

      <Card title={`Saved (${contacts.length}/${MAX_EMERGENCY_CONTACTS})`}>
        {!loaded && <Text style={{ color: theme.textMuted }}>Loading…</Text>}
        {loaded && contacts.length === 0 && (
          <Text style={[styles.muted, { color: theme.textMuted }]}>No contacts yet.</Text>
        )}
        {contacts.map((c) => (
          <View key={c.id} style={[styles.row, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowName, { color: theme.text }]}>{c.name}</Text>
              <Text style={[styles.rowMeta, { color: theme.textMuted }]}>
                {c.phone}{c.relation ? ` · ${c.relation}` : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => void onDelete(c.id)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${c.name}`}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </Pressable>
          </View>
        ))}
      </Card>

      <Card title="Add">
        <Text style={[styles.label, { color: theme.text }]}>Name</Text>
        <TextInput
          value={draft.name}
          onChangeText={(name) => setDraft((d) => ({ ...d, name }))}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Mom"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="words"
        />

        <Text style={[styles.label, { color: theme.text }]}>Phone</Text>
        <TextInput
          value={draft.phone}
          onChangeText={(phone) => setDraft((d) => ({ ...d, phone }))}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="+15551234567"
          placeholderTextColor={theme.textMuted}
          keyboardType="phone-pad"
          autoCorrect={false}
        />

        <Text style={[styles.label, { color: theme.text }]}>Relation (optional)</Text>
        <TextInput
          value={draft.relation}
          onChangeText={(relation) => setDraft((d) => ({ ...d, relation }))}
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          placeholder="Family"
          placeholderTextColor={theme.textMuted}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button label={canAddMore ? 'Add contact' : 'Maximum reached'} onPress={onAdd} disabled={!canAddMore} />
      </Card>

      <Button label="Done" variant="secondary" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12, flexGrow: 1 },
  heading: { fontSize: 22, fontWeight: '700' },
  muted: { fontSize: 12 },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingVertical: 8 },
  rowName: { fontWeight: '600' },
  rowMeta: { fontSize: 12 },
  deleteBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: '#fee2e2' },
  deleteText: { color: '#b91c1c', fontWeight: '700', fontSize: 12 },
  label: { fontWeight: '600', marginTop: 8, marginBottom: 2 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 16 },
  error: { color: '#b91c1c', marginTop: 8, fontSize: 12 },
});
