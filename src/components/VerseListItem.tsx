import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Verse } from '../types';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';

interface VerseListItemProps {
  verse: Verse;
  showMeaning?: boolean;
}

export const VerseListItem: React.FC<VerseListItemProps> = ({
  verse,
  showMeaning = true,
}) => {
  const router = useRouter();
  const { theme, isFav, toggleFav, isRead, settings } = useApp();
  const fav = isFav(verse.id);
  const read = isRead(verse.id);

  const handlePress = () => {
    triggerHaptic('light', settings.hapticsEnabled);
    router.push(`/verse/${verse.poetId}/${verse.number}`);
  };

  const handleFavoriteToggle = () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    toggleFav(verse.id);
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.7}
          style={styles.numberRow}
          accessibilityRole="button"
          accessibilityLabel={`பாடல் எண் ${verse.number}`}
        >
          <View
            style={[
              styles.numberBadge,
              { backgroundColor: theme.primary, borderColor: theme.accent },
            ]}
          >
            <Text style={styles.numberText}>{verse.number}</Text>
          </View>
          {read && (
            <View style={[styles.readBadge, { backgroundColor: theme.accentSoft }]}>
              <Ionicons name="checkmark-circle" size={14} color={theme.accent} />
              <Text style={[styles.readText, { color: theme.primaryDark }]}>படித்தவை</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={styles.favButton}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'விருப்பப்பட்டியலில் இருந்து நீக்கு' : 'விருப்பப்பட்டியலில் சேர்'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={22}
            color={fav ? theme.primaryLight : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.7}
        style={styles.bodyTouchable}
        accessibilityRole="button"
        accessibilityLabel={`${verse.poem}. முழு விளக்கம் படிக்கத் தொடவும்.`}
      >
        <Text
          style={[
            styles.poemText,
            {
              color: theme.primaryDark,
              fontSize: Math.min(settings.poemFontSize, 22),
            },
          ]}
          numberOfLines={2}
        >
          {verse.poem}
        </Text>

        {showMeaning && (verse.meaning || verse.paraphrase) && (
          <Text
            style={[styles.meaningSnippet, { color: theme.textSecondary }]}
            numberOfLines={2}
          >
            {verse.meaning || verse.paraphrase}
          </Text>
        )}

        {verse.translation && !showMeaning && (
          <Text
            style={[styles.translationSnippet, { color: theme.textMuted }]}
            numberOfLines={1}
          >
            {verse.translation}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  numberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  readText: {
    fontSize: 11,
    fontWeight: '600',
  },
  favButton: {
    padding: 4,
  },
  bodyTouchable: {
    paddingTop: 2,
  },
  poemText: {
    fontWeight: '700',
    lineHeight: 28,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  meaningSnippet: {
    fontSize: 14,
    lineHeight: 20,
  },
  translationSnippet: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
