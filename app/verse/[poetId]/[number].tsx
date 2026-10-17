import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PoetId, Verse } from '../../../src/types';
import {
  getVerseByPoetAndNumber,
  getAdjacentVerses,
  getPoetById,
} from '../../../src/data/loader';
import { useApp } from '../../../src/context/AppContext';
import { Header } from '../../../src/components/Header';
import { DecorativeDivider } from '../../../src/components/DecorativeDivider';
import { VerseCardImageModal } from '../../../src/components/VerseCardImageModal';
import { AddToCollectionModal } from '../../../src/components/AddToCollectionModal';
import { formatVerseText, shareText, copyTextToClipboard } from '../../../src/sharing/shareText';
import { triggerHaptic } from '../../../src/utils/haptics';

export default function VerseDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const poetId = (params.poetId as PoetId) || 'avvaiyar';
  const verseNumber = parseInt(params.number as string, 10) || 1;

  const {
    theme,
    isFav,
    toggleFav,
    isRead,
    toggleRead,
    recordLastRead,
    settings,
  } = useApp();

  const verse = useMemo(() => {
    return getVerseByPoetAndNumber(poetId, verseNumber);
  }, [poetId, verseNumber]);

  const poet = useMemo(() => getPoetById(poetId), [poetId]);
  const poetName = poet ? poet.nameTa : (poetId === 'avvaiyar' ? 'ஔவையார்' : 'பாரதியார்');

  const { prevVerse, nextVerse, currentIndex, total } = useMemo(() => {
    return getAdjacentVerses(poetId, verseNumber);
  }, [poetId, verseNumber]);

  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [collectionModalVisible, setCollectionModalVisible] = useState(false);

  // Automatically record this verse as last read in local storage
  useEffect(() => {
    if (verse) {
      recordLastRead(verse.poetId, verse.number, verse.id);
    }
  }, [verse, recordLastRead]);

  if (!verse) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="பாடல் விபரம்" showBack />
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.textPrimary }]}>
            பாடல் எண் #{verseNumber} கிடைக்கவில்லை.
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/')}
            style={[styles.backHomeBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.backHomeText}>முகப்புக்குச் செல்</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const fav = isFav(verse.id);
  const read = isRead(verse.id);

  const handlePrev = () => {
    if (prevVerse) {
      triggerHaptic('light', settings.hapticsEnabled);
      router.replace(`/verse/${prevVerse.poetId}/${prevVerse.number}`);
    }
  };

  const handleNext = () => {
    if (nextVerse) {
      triggerHaptic('light', settings.hapticsEnabled);
      router.replace(`/verse/${nextVerse.poetId}/${nextVerse.number}`);
    }
  };

  const handleToggleFav = async () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    await toggleFav(verse.id);
  };

  const handleToggleRead = async () => {
    triggerHaptic('light', settings.hapticsEnabled);
    await toggleRead(verse.id);
  };

  const handleCopyPoem = async () => {
    triggerHaptic('light', settings.hapticsEnabled);
    await copyTextToClipboard(verse.poem);
    Alert.alert('நகலெடுக்கப்பட்டது', 'பாடல் உரை கிளிப்போர்டில் நகலெடுக்கப்பட்டது.');
  };

  const handleCopyAll = async () => {
    triggerHaptic('light', settings.hapticsEnabled);
    const text = formatVerseText(verse, { includeAttribution: settings.includeAttribution });
    await copyTextToClipboard(text);
    Alert.alert('நகலெடுக்கப்பட்டது', 'பாடல் மற்றும் பொருள் முழுமையாக நகலெடுக்கப்பட்டது.');
  };

  const handleShareText = async () => {
    triggerHaptic('light', settings.hapticsEnabled);
    const text = formatVerseText(verse, { includeAttribution: settings.includeAttribution });
    await shareText(text, `${poetName} ஆத்திச்சூடி பாடல் ${verse.number}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={`${poetName} ஆத்திச்சூடி`}
        subtitle={`பாடல் ${verse.number} / ${total}`}
        showBack
        rightAction={{
          icon: fav ? 'heart' : 'heart-outline',
          onPress: handleToggleFav,
          accessibilityLabel: fav ? 'Remove from favorites' : 'Add to favorites',
        }}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Verse Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {/* Header Metadata */}
          <View style={styles.heroTopRow}>
            <View style={[styles.numberBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.numberBadgeText}>பாடல் {verse.number}</Text>
            </View>

            <TouchableOpacity
              onPress={handleToggleRead}
              style={[
                styles.readStatusBtn,
                {
                  backgroundColor: read ? theme.accentSoft : theme.cardSurface,
                  borderColor: read ? theme.accent : theme.border,
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={read ? 'Mark as unread' : 'Mark as read'}
            >
              <Ionicons
                name={read ? 'checkmark-circle' : 'ellipse-outline'}
                size={16}
                color={read ? theme.primaryDark : theme.textMuted}
              />
              <Text style={[styles.readStatusText, { color: read ? theme.primaryDark : theme.textMuted }]}>
                {read ? 'படித்தவை' : 'படித்ததாகக் குறி'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Prominent Tamil Poem */}
          <Text
            style={[
              styles.poemText,
              {
                color: theme.primaryDark,
                fontSize: settings.poemFontSize + 4,
                lineHeight: (settings.poemFontSize + 4) * settings.lineSpacingMultiplier,
              },
            ]}
            selectable
          >
            "{verse.poem}"
          </Text>

          <DecorativeDivider symbol="❖" />

          {/* Meaning Section (Shown only if valid) */}
          {verse.meaning && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.accent }]}>பொருள் (Meaning)</Text>
              <Text
                style={[
                  styles.sectionBody,
                  {
                    color: theme.textPrimary,
                    fontSize: settings.meaningFontSize,
                    lineHeight: settings.meaningFontSize * settings.lineSpacingMultiplier,
                  },
                ]}
                selectable
              >
                {verse.meaning}
              </Text>
            </View>
          )}

          {/* Paraphrase Section (Shown only if valid) */}
          {verse.paraphrase && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.accent }]}>விளக்கம் (Paraphrase)</Text>
              <Text
                style={[
                  styles.sectionBody,
                  {
                    color: theme.textPrimary,
                    fontSize: settings.meaningFontSize,
                    lineHeight: settings.meaningFontSize * settings.lineSpacingMultiplier,
                  },
                ]}
                selectable
              >
                {verse.paraphrase}
              </Text>
            </View>
          )}

          {/* Transliteration Section (Shown only if valid) */}
          {verse.transliteration && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.accent }]}>Transliteration</Text>
              <Text
                style={[
                  styles.sectionBodyEn,
                  {
                    color: theme.textSecondary,
                    fontSize: settings.meaningFontSize - 1,
                  },
                ]}
                selectable
              >
                {verse.transliteration}
              </Text>
            </View>
          )}

          {/* English Translation Section (Shown only if valid) */}
          {verse.translation && (
            <View style={styles.sectionBlock}>
              <Text style={[styles.sectionHeading, { color: theme.accent }]}>English Translation</Text>
              <Text
                style={[
                  styles.sectionBodyEn,
                  {
                    color: theme.textSecondary,
                    fontSize: settings.meaningFontSize,
                    fontStyle: 'italic',
                  },
                ]}
                selectable
              >
                "{verse.translation}"
              </Text>
            </View>
          )}
        </View>

        {/* Action Grid */}
        <View style={styles.actionGrid}>
          <TouchableOpacity
            onPress={() => setImageModalVisible(true)}
            style={[styles.actionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="image-outline" size={20} color={theme.accent} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>Status படம்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setCollectionModalVisible(true)}
            style={[styles.actionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="folder-open-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>தொகுப்பில் சேர்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareText}
            style={[styles.actionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="share-social-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>பகிர் (Share)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleCopyAll}
            style={[styles.actionBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="copy-outline" size={20} color={theme.primary} />
            <Text style={[styles.actionBtnText, { color: theme.textPrimary }]}>நகலெடு (Copy)</Text>
          </TouchableOpacity>
        </View>

        {/* Complete Collection Link */}
        <TouchableOpacity
          onPress={() => router.push(`/poet/${poetId}`)}
          style={[styles.fullListBtn, { backgroundColor: theme.cardSurface, borderColor: theme.borderLight }]}
        >
          <Ionicons name="list-outline" size={18} color={theme.primary} />
          <Text style={[styles.fullListText, { color: theme.primary }]}>
            {poetName} அனைத்துப் பாடல்களையும் காண்க ({total})
          </Text>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Floating Bottom Navigation Bar (Previous & Next) */}
      <View style={[styles.bottomNavBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.borderLight }]}>
        <TouchableOpacity
          onPress={handlePrev}
          disabled={!prevVerse}
          style={[
            styles.navBtn,
            { backgroundColor: prevVerse ? theme.cardSurface : 'transparent', borderColor: theme.border },
            !prevVerse && { opacity: 0.35 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="முந்தைய பாடல் (Previous verse)"
        >
          <Ionicons name="chevron-back" size={20} color={theme.textPrimary} />
          <Text style={[styles.navBtnText, { color: theme.textPrimary }]}>முந்தையது</Text>
        </TouchableOpacity>

        <View style={styles.indexIndicator}>
          <Text style={[styles.indexIndicatorText, { color: theme.accent }]}>
            {currentIndex + 1} / {total}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleNext}
          disabled={!nextVerse}
          style={[
            styles.navBtn,
            { backgroundColor: nextVerse ? theme.cardSurface : 'transparent', borderColor: theme.border },
            !nextVerse && { opacity: 0.35 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="அடுத்த பாடல் (Next verse)"
        >
          <Text style={[styles.navBtnText, { color: theme.textPrimary }]}>அடுத்தது</Text>
          <Ionicons name="chevron-forward" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* WhatsApp Status Card Modal */}
      <VerseCardImageModal
        visible={imageModalVisible}
        verse={verse}
        onClose={() => setImageModalVisible(false)}
      />

      {/* Add To Collection Modal */}
      <AddToCollectionModal
        visible={collectionModalVisible}
        verse={verse}
        onClose={() => setCollectionModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  numberBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  numberBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  readStatusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  readStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  poemText: {
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginVertical: 10,
  },
  sectionBlock: {
    marginTop: 14,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  sectionBody: {
    fontWeight: '500',
  },
  sectionBodyEn: {
    lineHeight: 22,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fullListBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  fullListText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderTopWidth: 1,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  indexIndicator: {
    alignItems: 'center',
  },
  indexIndicatorText: {
    fontSize: 13,
    fontWeight: '800',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  backHomeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backHomeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
