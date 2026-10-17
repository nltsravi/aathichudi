import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { DecorativeDivider } from '../src/components/DecorativeDivider';

export default function AboutScreen() {
  const router = useRouter();
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="செயலியைப் பற்றி" subtitle="Aathichudi (ஆத்திச்சூடி) v1.0.0" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* App Emblem Box */}
        <View style={styles.emblemContainer}>
          <View style={[styles.emblemCircle, { backgroundColor: theme.primary, borderColor: theme.accent }]}>
            <Text style={[styles.emblemLetter, { color: theme.accent }]}>ஆ</Text>
          </View>
          <Text style={[styles.appName, { color: theme.primaryDark }]}>ஆத்திச்சூடி</Text>
          <Text style={[styles.appTagline, { color: theme.textSecondary }]}>
            Tamil Wisdom for Every Day
          </Text>
        </View>

        <DecorativeDivider symbol="❖" />

        {/* Purpose */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>நோக்கம் (Mission)</Text>
          <Text style={[styles.cardBody, { color: theme.textPrimary }]}>
            தமிழ் இலக்கியத்தின் தலையாய நீதி நூல்களான ஔவையாரின் ஆத்திச்சூடி மற்றும் மகாகவி சுப்பிரமணிய பாரதியாரின் புதிய ஆத்திச்சூடி ஆகியவற்றை நவீன தலைமுறையினர், மாணவர்கள் மற்றும் தமிழ் ஆர்வலர்கள் எளிய முறையில் பயிலவும் பகிரவும் உருவாக்கப்பட்ட முழுமையான மற்றும் தனித்துவமான செயலியாகும்.
          </Text>
        </View>

        {/* Privacy & Offline Guarantee */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>முழுமையான தனிமை & ஆஃப்லைன் உறுதிமொழி</Text>
          <View style={styles.featureRow}>
            <Ionicons name="cloud-offline-outline" size={20} color={theme.accent} />
            <Text style={[styles.featureText, { color: theme.textPrimary }]}>
              100% ஆஃப்லைன் — இணைய இணைப்பு தேவையின்றி முழுமையாக இயங்கும்.
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="shield-outline" size={20} color={theme.accent} />
            <Text style={[styles.featureText, { color: theme.textPrimary }]}>
              விளம்பரங்கள் இல்லை — எந்தவொரு விளம்பர இடைநிறுத்தமும் இன்றி வாசிக்கலாம்.
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Ionicons name="person-outline" size={20} color={theme.accent} />
            <Text style={[styles.featureText, { color: theme.textPrimary }]}>
              கணக்கு தேவையில்லை — பதிவு, உள்நுழைவு அல்லது தனிநபர் தகவல் சேகரிப்பு இல்லை.
            </Text>
          </View>
        </View>

        {/* Content Sources */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.primary }]}>நூல்களின் தொகுப்பு விபரம்</Text>
          <Text style={[styles.cardBody, { color: theme.textSecondary }]}>
            • ஔவையார் ஆத்திச்சூடி: 109 பாடல்கள் (கடவுள் வாழ்த்துடன்){'\n'}
            • மகாகவி பாரதியார் புதிய ஆத்திச்சூடி: 110 பாடல்கள் (கடவுள் வாழ்த்துடன்){'\n'}
            • மூல நூலின் பாடல்கள், சொற்பொருள், விளக்கவுரை, ஆங்கில ஒலிபெயர்ப்பு மற்றும் ஆங்கில மொழிபெயர்ப்பு ஆகியவை அடங்கியுள்ளன.
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => router.push('/privacy')}
          style={[styles.privacyLink, { borderColor: theme.border }]}
        >
          <Ionicons name="document-text-outline" size={18} color={theme.primary} />
          <Text style={[styles.privacyLinkText, { color: theme.primary }]}>
            தனியுரிமைக் கொள்கையைக் காண்க (Privacy Policy)
          </Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emblemContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  emblemCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  emblemLetter: {
    fontSize: 38,
    fontWeight: '800',
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appTagline: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 6,
  },
  featureText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
  privacyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 8,
  },
  privacyLinkText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
