import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import { Verse } from '../types';
import { getPoetById } from '../data/loader';
import { useApp } from '../context/AppContext';
import { captureAndShareVerseCard } from '../sharing/shareImage';
import { triggerHaptic } from '../utils/haptics';

interface VerseCardImageModalProps {
  visible: boolean;
  verse: Verse;
  onClose: () => void;
}

type CardContentOption = 'poem_only' | 'poem_meaning' | 'poem_translation' | 'poem_transliteration';
type CardTheme = 'maroon' | 'parchment';

export const VerseCardImageModal: React.FC<VerseCardImageModalProps> = ({
  visible,
  verse,
  onClose,
}) => {
  const { theme, settings } = useApp();
  const viewShotRef = useRef<any>(null);
  const [contentOption, setContentOption] = useState<CardContentOption>('poem_meaning');
  const [cardTheme, setCardTheme] = useState<CardTheme>('maroon');
  const [isExporting, setIsExporting] = useState(false);

  const poet = getPoetById(verse.poetId);
  const poetName = poet ? poet.nameTa : verse.poetId;

  const handleShare = async () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    setIsExporting(true);
    try {
      const result = await captureAndShareVerseCard(viewShotRef, {
        title: `${poetName} ஆத்திச்சூடி பாடல் ${verse.number}`,
      });
      if (result.success) {
        triggerHaptic('success', settings.hapticsEnabled);
      }
    } catch (e) {
      Alert.alert('பிழை', 'படம் உருவாக்குவதில் சிக்கல் ஏற்பட்டது.');
    } finally {
      setIsExporting(false);
    }
  };

  const isMaroon = cardTheme === 'maroon';
  const cardBg = isMaroon ? '#4A0E17' : '#FDFBF7';
  const cardBorder = isMaroon ? '#C59B27' : '#B8860B';
  const goldAccent = '#D4AF37';
  const poemColor = isMaroon ? '#FFF8E7' : '#4A0E17';
  const bodyTextColor = isMaroon ? '#E8DFD1' : '#241816';
  const subTextColor = isMaroon ? '#C7B7A3' : '#6A5650';

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.modalRoot, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.headerBar, { borderBottomColor: theme.borderLight }]}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            accessibilityLabel="Close"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={26} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>
            படம் உருவாக்கம் (Card Creator)
          </Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Controls: Theme selection */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>வண்ணத் தேர்வு (Color Theme):</Text>
          <View style={styles.optionRow}>
            <TouchableOpacity
              onPress={() => setCardTheme('maroon')}
              style={[
                styles.themeBtn,
                { backgroundColor: '#4A0E17' },
                cardTheme === 'maroon' && styles.themeBtnActive,
              ]}
            >
              <Text style={styles.themeBtnTextLight}>செவ்வண்ணம் (Maroon)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setCardTheme('parchment')}
              style={[
                styles.themeBtn,
                { backgroundColor: '#FDFBF7', borderColor: '#C59B27', borderWidth: 1 },
                cardTheme === 'parchment' && styles.themeBtnActive,
              ]}
            >
              <Text style={styles.themeBtnTextDark}>ஏட்டுச் சுவடி (Parchment)</Text>
            </TouchableOpacity>
          </View>

          {/* Controls: Content selection */}
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>அடக்கம் (Content):</Text>
          <View style={styles.chipScroll}>
            <TouchableOpacity
              onPress={() => setContentOption('poem_meaning')}
              style={[
                styles.chip,
                { borderColor: theme.border },
                contentOption === 'poem_meaning' && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: contentOption === 'poem_meaning' ? '#FFF' : theme.textPrimary },
                ]}
              >
                பாடல் + பொருள்
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setContentOption('poem_only')}
              style={[
                styles.chip,
                { borderColor: theme.border },
                contentOption === 'poem_only' && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: contentOption === 'poem_only' ? '#FFF' : theme.textPrimary },
                ]}
              >
                பாடல் மட்டும்
              </Text>
            </TouchableOpacity>

            {verse.translation && (
              <TouchableOpacity
                onPress={() => setContentOption('poem_translation')}
                style={[
                  styles.chip,
                  { borderColor: theme.border },
                  contentOption === 'poem_translation' && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: contentOption === 'poem_translation' ? '#FFF' : theme.textPrimary },
                  ]}
                >
                  English Translation
                </Text>
              </TouchableOpacity>
            )}

            {verse.transliteration && (
              <TouchableOpacity
                onPress={() => setContentOption('poem_transliteration')}
                style={[
                  styles.chip,
                  { borderColor: theme.border },
                  contentOption === 'poem_transliteration' && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: contentOption === 'poem_transliteration' ? '#FFF' : theme.textPrimary },
                  ]}
                >
                  Transliteration
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Instructions box */}
          <View style={[styles.hintCard, { backgroundColor: theme.cardSurface, borderColor: theme.border }]}>
            <Ionicons name="information-circle-outline" size={18} color={theme.accent} />
            <Text style={[styles.hintText, { color: theme.textSecondary }]}>
              WhatsApp Status அல்லது Instagram Story-ல் பகிர 9:16 வடிவில் வடிவமைக்கப்பட்டுள்ளது.
            </Text>
          </View>

          {/* 9:16 Visual Card to Capture */}
          <View style={styles.cardPreviewWrapper}>
            <ViewShot
              ref={viewShotRef}
              options={{ format: 'png', quality: 1.0 }}
              style={[
                styles.shotContainer,
                {
                  backgroundColor: cardBg,
                  borderColor: cardBorder,
                },
              ]}
            >
              {/* Traditional Gold Borders */}
              <View style={[styles.innerBorder, { borderColor: goldAccent }]}>
                {/* Header Motif */}
                <View style={styles.cardHeader}>
                  <Text style={[styles.headerMotif, { color: goldAccent }]}>❖ ══════ ❖ ══════ ❖</Text>
                  <Text style={[styles.cardAppTitle, { color: goldAccent }]}>
                    ஆத்திச்சூடி • AATHICHUDI
                  </Text>
                  <Text style={[styles.cardPoetBadge, { color: bodyTextColor }]}>
                    {poetName} — பாடல் {verse.number}
                  </Text>
                </View>

                {/* Main Poem */}
                <View style={styles.cardCenter}>
                  <Text style={[styles.cardPoem, { color: poemColor }]}>
                    {verse.poem}
                  </Text>

                  {/* Body Content according to option */}
                  {contentOption === 'poem_meaning' && (verse.meaning || verse.paraphrase) && (
                    <View style={[styles.cardMeaningBox, { backgroundColor: isMaroon ? 'rgba(0,0,0,0.25)' : '#F5EFE4' }]}>
                      <Text style={[styles.cardMeaningLabel, { color: goldAccent }]}>பொருள்:</Text>
                      <Text style={[styles.cardMeaningText, { color: bodyTextColor }]}>
                        {verse.meaning || verse.paraphrase}
                      </Text>
                    </View>
                  )}

                  {contentOption === 'poem_translation' && verse.translation && (
                    <View style={[styles.cardMeaningBox, { backgroundColor: isMaroon ? 'rgba(0,0,0,0.25)' : '#F5EFE4' }]}>
                      <Text style={[styles.cardMeaningLabel, { color: goldAccent }]}>Translation:</Text>
                      <Text style={[styles.cardMeaningText, { color: bodyTextColor, fontStyle: 'italic' }]}>
                        "{verse.translation}"
                      </Text>
                    </View>
                  )}

                  {contentOption === 'poem_transliteration' && verse.transliteration && (
                    <View style={[styles.cardMeaningBox, { backgroundColor: isMaroon ? 'rgba(0,0,0,0.25)' : '#F5EFE4' }]}>
                      <Text style={[styles.cardMeaningLabel, { color: goldAccent }]}>Transliteration:</Text>
                      <Text style={[styles.cardMeaningText, { color: bodyTextColor }]}>
                        {verse.transliteration}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Footer Attribution */}
                <View style={styles.cardFooter}>
                  <Text style={[styles.footerMotif, { color: goldAccent }]}>— ❦ —</Text>
                  <Text style={[styles.cardAttribution, { color: subTextColor }]}>
                    ஆத்திச்சூடி செயலி • Tamil Wisdom for Every Day
                  </Text>
                </View>
              </View>
            </ViewShot>
          </View>
        </ScrollView>

        {/* Bottom Action Sheet */}
        <View style={[styles.bottomBar, { backgroundColor: theme.cardBackground, borderTopColor: theme.borderLight }]}>
          <TouchableOpacity
            onPress={handleShare}
            disabled={isExporting}
            style={[styles.shareBtn, { backgroundColor: theme.primary }]}
            accessibilityRole="button"
            accessibilityLabel="பகிர் அல்லது WhatsApp Status-ல் வை"
          >
            {isExporting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="logo-whatsapp" size={22} color="#FFFFFF" />
                <Text style={styles.shareBtnText}>WhatsApp Status / பகிர்</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const CARD_WIDTH = Math.min(Dimensions.get('window').width - 32, 360);
const CARD_HEIGHT = Math.round(CARD_WIDTH * (16 / 9));

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  headerBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  themeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeBtnActive: {
    borderWidth: 2,
    borderColor: '#C59B27',
  },
  themeBtnTextLight: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  themeBtnTextDark: {
    color: '#4A0E17',
    fontSize: 12,
    fontWeight: '700',
  },
  chipScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    width: '100%',
    marginBottom: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    width: '100%',
    marginBottom: 18,
  },
  hintText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  cardPreviewWrapper: {
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  shotContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    borderWidth: 2,
    padding: 14,
  },
  innerBorder: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeader: {
    alignItems: 'center',
  },
  headerMotif: {
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardAppTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  cardPoetBadge: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  cardCenter: {
    width: '100%',
    alignItems: 'center',
    marginVertical: 20,
  },
  cardPoem: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
    marginBottom: 20,
  },
  cardMeaningBox: {
    width: '100%',
    padding: 14,
    borderRadius: 12,
  },
  cardMeaningLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMeaningText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  cardFooter: {
    alignItems: 'center',
  },
  footerMotif: {
    fontSize: 14,
    marginBottom: 4,
  },
  cardAttribution: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
