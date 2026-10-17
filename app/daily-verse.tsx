import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getDailyVerse, getPoetById } from '../src/data/loader';
import { useApp } from '../src/context/AppContext';
import { Header } from '../src/components/Header';
import { DecorativeDivider } from '../src/components/DecorativeDivider';
import { VerseCardImageModal } from '../src/components/VerseCardImageModal';
import { formatVerseText, shareText } from '../src/sharing/shareText';
import { triggerHaptic } from '../src/utils/haptics';

export default function DailyVerseScreen() {
  const router = useRouter();
  const { theme, isFav, toggleFav, settings } = useApp();
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const verse = useMemo(() => getDailyVerse(), []);
  const poet = useMemo(() => getPoetById(verse.poetId), [verse.poetId]);
  const poetName = poet ? poet.nameTa : verse.poetId;
  const fav = isFav(verse.id);

  const todayDateTa = new Date().toLocaleDateString('ta-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleShare = async () => {
    triggerHaptic('light', settings.hapticsEnabled);
    const text = formatVerseText(verse, { includeAttribution: settings.includeAttribution });
    await shareText(text, `இன்றைய ஆத்திச்சூடி — ${poetName}`);
  };

  const handleToggleFav = async () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    await toggleFav(verse.id);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="இன்றைய சிந்தனை" subtitle="Daily Wisdom & Reflection" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Date Stamp */}
        <View style={styles.dateStamp}>
          <Ionicons name="calendar-outline" size={16} color={theme.accent} />
          <Text style={[styles.dateText, { color: theme.accent }]}>{todayDateTa}</Text>
        </View>

        {/* Hero Card */}
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.accent }]}>
          <View style={styles.topRow}>
            <View style={[styles.poetBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.poetBadgeText}>{poetName} • பாடல் #{verse.number}</Text>
            </View>

            <TouchableOpacity onPress={handleToggleFav} style={styles.favBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name={fav ? 'heart' : 'heart-outline'}
                size={24}
                color={fav ? theme.primaryLight : theme.textMuted}
              />
            </TouchableOpacity>
          </View>

          <Text style={[styles.poem, { color: theme.primaryDark, fontSize: settings.poemFontSize + 6 }]}>
            "{verse.poem}"
          </Text>

          <DecorativeDivider symbol="❦" />

          {verse.meaning && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.accent }]}>பொருள்:</Text>
              <Text style={[styles.sectionBody, { color: theme.textPrimary, fontSize: settings.meaningFontSize }]}>
                {verse.meaning}
              </Text>
            </View>
          )}

          {verse.paraphrase && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.accent }]}>வாழ்வியல் விளக்கம்:</Text>
              <Text style={[styles.sectionBody, { color: theme.textPrimary, fontSize: settings.meaningFontSize }]}>
                {verse.paraphrase}
              </Text>
            </View>
          )}

          {verse.translation && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.accent }]}>English Translation:</Text>
              <Text style={[styles.sectionBody, { color: theme.textSecondary, fontStyle: 'italic', fontSize: settings.meaningFontSize }]}>
                "{verse.translation}"
              </Text>
            </View>
          )}
        </View>

        {/* Reflection Guide */}
        <View style={[styles.reflectionBox, { backgroundColor: theme.cardSurface, borderColor: theme.borderLight }]}>
          <View style={styles.reflectionHeader}>
            <Ionicons name="bulb-outline" size={20} color={theme.accent} />
            <Text style={[styles.reflectionHeading, { color: theme.primaryDark }]}>
              இன்றைய வாழ்வில் செயல்படுத்துவது எப்படி?
            </Text>
          </View>
          <Text style={[styles.reflectionText, { color: theme.textSecondary }]}>
            ஆத்திச்சூடி என்பது வெறும் மனனப் பாடல் அன்று; அன்றாட வாழ்வின் வழிகாட்டி.
            இன்றைய நாளில் இந்த நற்பண்பை உங்கள் பேச்சிலும் செயலிலும் எவ்வாறு கடைப்பிடிக்கலாம் என எண்ணிப்பாருங்கள்.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={() => setImageModalVisible(true)}
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="logo-whatsapp" size={20} color="#FFF" />
            <Text style={styles.actionBtnText}>WhatsApp Status உருவாக்க</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShare}
            style={[styles.actionBtnSecondary, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnSecondaryText, { color: theme.primary }]}>பகிர் (Share)</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <VerseCardImageModal
        visible={imageModalVisible}
        verse={verse}
        onClose={() => setImageModalVisible(false)}
      />
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
  dateStamp: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  poetBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  poetBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  favBtn: {
    padding: 4,
  },
  poem: {
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginVertical: 10,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  sectionBody: {
    lineHeight: 24,
  },
  reflectionBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reflectionHeading: {
    fontSize: 14,
    fontWeight: '700',
  },
  reflectionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  actionRow: {
    gap: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
