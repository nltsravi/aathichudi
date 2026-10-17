import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { DecorativeDivider } from '../src/components/DecorativeDivider';

export default function PrivacyScreen() {
  const { theme } = useApp();

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="தனியுரிமைக் கொள்கை" subtitle="Privacy Policy" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.primary }]}>முன்னுரை (Introduction)</Text>
          <Text style={[styles.body, { color: theme.textPrimary }]}>
            ஆத்திச்சூடி (Aathichudi) செயலி பயனர்களின் தனிப்பட்ட தகவல்களின் பாதுகாப்பிற்கும் தனியுரிமைக்கும் முழுமையான முன்னுரிமை அளிக்கிறது. இச்செயலி எவ்விதக் கட்டணமோ அல்லது விளம்பரங்களோ இன்றி முற்றிலும் இலவசமாகவும், முழுமையான ஆஃப்லைன் பயன்பாட்டுக்காகவும் வடிவமைக்கப்பட்டுள்ளது.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.primary }]}>1. தகவல் சேகரிப்பு இன்மை (Zero Data Collection)</Text>
          <Text style={[styles.body, { color: theme.textPrimary }]}>
            • இச்செயலியைப் பயன்படுத்த பயனர் கணக்கு, மின்னஞ்சல், கடவுச்சொல் அல்லது பதிவு எதுவும் தேவையில்லை.{'\n'}
            • எந்தவொரு தனிநபர் அடையாளத் தகவலும் (Personal Identifiable Information) சேகரிக்கப்படுவதோ, தொலைதூர சேவையகங்களுக்கு அனுப்பப்படுவதோ இல்லை.{'\n'}
            • எந்தவிதமான விளம்பர SDK, பகுப்பாய்வு டிராக்கர்கள் (Analytics) அல்லது கண்காணிப்பு பிக்சல்கள் இச்செயலியில் இணைக்கப்படவில்லை.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.primary }]}>2. உள்ளூர் சேமிப்பகம் (Local Device Storage)</Text>
          <Text style={[styles.body, { color: theme.textPrimary }]}>
            • உங்கள் விருப்பப் பாடல்கள் (Favorites), தனிப்பயன் தொகுப்புகள் (Custom Collections), மற்றும் வாசிப்பு முன்னேற்றம் (Reading Progress) ஆகியவை உங்கள் மொபைல் சாதனத்தில் மட்டுமே உள்ளூர் SQLite தரவுத்தளத்தில் சேமிக்கப்படுகின்றன.{'\n'}
            • இந்தத் தரவுகள் உங்கள் சாதனத்தை விட்டு வெளியே ஒருபோதும் பகிரப்படுவதில்லை.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.primary }]}>3. சாதன அனுமதிகள் (Device Permissions)</Text>
          <Text style={[styles.body, { color: theme.textPrimary }]}>
            • அறிவிப்புகள் (Notifications): நீங்கள் தினசரி பாடல் நினைவூட்டலைத் தேர்வுசெய்தால் மட்டுமே உள்ளூர் அறிவிப்புக்கான அனுமதி கோரப்படும்.{'\n'}
            • புகைப்படக் காப்பகம் (Photo Library): நீங்கள் உருவாக்கும் பாடல் படங்களை கேலரியில் சேமிக்கத் தேர்வு செய்யும் போது மட்டுமே அதற்கான அனுமதி கோரப்படும்.{'\n'}
            • இருப்பிடம் (Location), தொடர்புகள் (Contacts), மைக்ரோஃபோன் அல்லது கேமரா அனுமதிகள் எதுவும் இச்செயலிக்குத் தேவையில்லை.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={[styles.heading, { color: theme.primary }]}>4. பகிர்வு வசதி (Sharing Features)</Text>
          <Text style={[styles.body, { color: theme.textPrimary }]}>
            பாடல்களையோ அல்லது படங்களையோ பகிரும்போது, இயங்குதளத்தின் பொதுவான பகிர்வு சாளரம் (System Native Share Sheet) மட்டுமே பயன்படுத்தப்படுகிறது. நீங்கள் யாரிடம் பகிர்கிறீர்கள் அல்லது எந்த செயலியைப் பயன்படுத்துகிறீர்கள் என்ற தகவல்கள் எங்களால் பதிவு செய்யப்படுவதில்லை.
          </Text>
        </View>

        <DecorativeDivider symbol="❦" />

        <View style={styles.footerInfo}>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            கடைசியாகப் புதுப்பிக்கப்பட்டது: அக்டோபர் 2026
          </Text>
          <Text style={[styles.dateText, { color: theme.textMuted }]}>
            ஆத்திச்சூடி செயலி • தனியுரிமை முதன்மைப் பாதுகாப்பு
          </Text>
        </View>

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
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 14,
  },
  heading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
});
