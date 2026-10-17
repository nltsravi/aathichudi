import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { getPoets } from '../../src/data/loader';
import { Header } from '../../src/components/Header';
import { PoetCard } from '../../src/components/PoetCard';
import { DecorativeDivider } from '../../src/components/DecorativeDivider';

export default function PoetsScreen() {
  const { theme } = useApp();
  const poets = useMemo(() => getPoets(), []);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="புலவர்கள்" subtitle="ஔவையார் & மகாகவி பாரதியார்" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.introBox}>
          <Text style={[styles.introText, { color: theme.textSecondary }]}>
            தமிழ் இலக்கிய மரபின் தலைசிறந்த இரு நீதிநூல் படைப்புகளை இங்கே பயிலலாம்.
            காலத்தால் முற்பட்ட ஔவையாரின் ஆத்திச்சூடியும், இருபதாம் நூற்றாண்டின் மகாகவி பாரதியாரின் புதிய ஆத்திச்சூடியும் இவண் தொகுக்கப்பட்டுள்ளன.
          </Text>
        </View>

        <DecorativeDivider symbol="❖" />

        {poets.map(poet => (
          <PoetCard key={poet.id} poet={poet} />
        ))}

        <View style={[styles.editorialNotice, { backgroundColor: theme.cardSurface, borderColor: theme.borderLight }]}>
          <Text style={[styles.noticeTitle, { color: theme.accent }]}>
            ஆசிரிய குறிப்பு (Editorial Information)
          </Text>
          <Text style={[styles.noticeText, { color: theme.textMuted }]}>
            இச்செயலியிலுள்ள பாடல்களின் மூலத் தரவு மற்றும் பாடல்களின் எண்ணிக்கை மாற்றமின்றி அப்படியே பேணப்பட்டுள்ளன. ஔவையார் ஆத்திச்சூடி 109 பாடல்களையும், பாரதியாரின் புதிய ஆத்திச்சூடி 110 பாடல்களையும் கொண்டுள்ளன.
          </Text>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  introBox: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 4,
  },
  introText: {
    fontSize: 14,
    lineHeight: 22,
  },
  editorialNotice: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  noticeTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  noticeText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
