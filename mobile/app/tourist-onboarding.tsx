import { ScrollView, View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import {
  CATALOG,
  Language,
  LANGUAGE_LABEL,
  POPULAR_DESTINATIONS,
  TIPPING_GUIDE,
  t,
} from '../services/tourist-mode';

type Step = 'language' | 'destinations' | 'tipping' | 'confirm';

export default function TouristOnboarding(): JSX.Element {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');
  const [step, setStep] = useState<Step>('language');

  const next = () => {
    if (step === 'language') setStep('destinations');
    else if (step === 'destinations') setStep('tipping');
    else if (step === 'tipping') setStep('confirm');
    else router.back();
  };

  const skip = () => router.back();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>{t(language, 'welcome')}</Text>
      <Text style={styles.muted}>{t(language, 'enable_tourist_mode')}</Text>

      {step === 'language' && <LanguageStep value={language} onChange={setLanguage} />}
      {step === 'destinations' && <DestinationsStep language={language} />}
      {step === 'tipping' && <TippingStep language={language} />}
      {step === 'confirm' && <ConfirmStep language={language} />}

      <View style={styles.actionsRow}>
        <Button label={t(language, 'skip')} variant="secondary" onPress={skip} />
        <Button label={step === 'confirm' ? t(language, 'continue') : t(language, 'continue')} onPress={next} />
      </View>
    </ScrollView>
  );
}

function LanguageStep({ value, onChange }: { value: Language; onChange: (v: Language) => void }): JSX.Element {
  return (
    <Card title={t(value, 'choose_language')}>
      {(Object.keys(LANGUAGE_LABEL) as Language[]).map((code) => (
        <Pressable
          key={code}
          accessibilityRole="radio"
          accessibilityState={{ selected: value === code }}
          onPress={() => onChange(code)}
          style={[styles.langRow, value === code && styles.langSelected]}
        >
          <Text style={styles.langCode}>{code.toUpperCase()}</Text>
          <Text style={styles.langName}>{LANGUAGE_LABEL[code]}</Text>
          {value === code && <Text style={styles.langCheck}>✓</Text>}
        </Pressable>
      ))}
    </Card>
  );
}

function DestinationsStep({ language }: { language: Language }): JSX.Element {
  return (
    <Card title={t(language, 'popular_destinations')}>
      {POPULAR_DESTINATIONS.map((d) => (
        <View key={d.id} style={styles.destRow}>
          <Text style={styles.destName}>{d.name}</Text>
          <Text style={styles.destBlurb}>{d.blurb}</Text>
        </View>
      ))}
    </Card>
  );
}

function TippingStep({ language }: { language: Language }): JSX.Element {
  return (
    <Card title={t(language, 'tipping_guide')}>
      <Text style={styles.tipIntro}>{t(language, 'tipping_guide_intro')}</Text>
      {TIPPING_GUIDE.map((row) => (
        <View key={row.service} style={styles.tipRow}>
          <Text style={styles.tipService}>{row.service}</Text>
          <Text style={styles.tipRange}>{row.range}</Text>
          {row.note && <Text style={styles.tipNote}>{row.note}</Text>}
        </View>
      ))}
    </Card>
  );
}

function ConfirmStep({ language }: { language: Language }): JSX.Element {
  return (
    <Card title="You're set">
      <Text style={styles.muted}>
        Tourist Mode is on. Your home screen will surface visitor-relevant cards
        first, and tipping cues will appear at checkout.
      </Text>
      <Text style={styles.muted}>
        Lang: {CATALOG[language]?.welcome ?? '—'}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  heading: { fontSize: 22, fontWeight: '700' },
  muted: { color: '#555' },
  langRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12, borderBottomColor: '#eee', borderBottomWidth: 1 },
  langSelected: { backgroundColor: '#eef6ff' },
  langCode: { fontWeight: '700', minWidth: 38 },
  langName: { flex: 1 },
  langCheck: { color: '#1a73e8', fontWeight: '700' },
  destRow: { paddingVertical: 6 },
  destName: { fontWeight: '600' },
  destBlurb: { color: '#555', fontSize: 12 },
  tipIntro: { color: '#444', marginBottom: 8 },
  tipRow: { paddingVertical: 4 },
  tipService: { fontWeight: '600' },
  tipRange: { color: '#1a73e8' },
  tipNote: { color: '#777', fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 12 },
});
