import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Verse } from '../types';
import { getPoetById } from '../data/loader';
import { useApp } from '../context/AppContext';
import { triggerHaptic } from '../utils/haptics';

interface DailyVerseCardProps {
  verse: Verse;
}

export const DailyVerseCard: React.FC<DailyVerseCardProps> = ({ verse }) => {
  const router = useRouter();
  const { theme, isFav, toggleFav, settings } = useApp();
  const poet = getPoetById(verse.poetId);
  const poetName = poet ? poet.nameTa : (verse.poetId === 'avvaiyar' ? 'ஔவையார்' : 'பாரதியார்');
  const fav = isFav(verse.id);

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
          borderColor: theme.accent,
        },
      ]}
    >
      {/* Top Banner with standalone Favorite Button */}
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          style={styles.tagContainer}
          accessibilityRole="button"
          accessibilityLabel="இன்றைய சிந்தனை"
        >
          <View style={[styles.goldDot, { backgroundColor: theme.accent }]} />
          <Text style={[styles.tagText, { color: theme.accent }]}>
            இன்றைய சிந்தனை • DAILY VERSE
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleFavoriteToggle}
          style={styles.favButton}
          accessibilityRole="button"
          accessibilityLabel={fav ? 'Remove from favorites' : 'Add to favorites'}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <Ionicons
            name={fav ? 'heart' : 'heart-outline'}
            size={22}
            color={fav ? theme.primaryLight : theme.textMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Main Card Body */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`பாடல் எண் ${verse.number}: ${verse.poem}`}
        accessibilityHint="முழு விளக்கம் படிக்கத் தொடவும்"
      >
        {/* Poet & Number */}
        <Text style={[styles.poetHeading, { color: theme.primary }]}>
          {poetName} ஆத்திச்சூடி — பாடல் {verse.number}
        </Text>

        {/* Tamil Poem */}
        <Text
          style={[
            styles.poemText,
            {
              color: theme.primaryDark,
              fontSize: settings.poemFontSize + 2,
            },
          ]}
        >
          "{verse.poem}"
        </Text>

        {/* Meaning / Paraphrase if available */}
        {verse.meaning && (
          <View style={styles.meaningBox}>
            <Text style={[styles.meaningLabel, { color: theme.accent }]}>பொருள்:</Text>
            <Text style={[styles.meaningText, { color: theme.textPrimary }]} numberOfLines={3}>
              {verse.meaning}
            </Text>
          </View>
        )}

        {/* English Translation if available */}
        {verse.translation && (
          <Text style={[styles.translationText, { color: theme.textSecondary }]} numberOfLines={2}>
            "{verse.translation}"
          </Text>
        )}

        {/* CTA Footer */}
        <View style={[styles.footerRow, { borderTopColor: theme.borderLight }]}>
          <Text style={[styles.ctaText, { color: theme.primary }]}>
            முழு விளக்கம் படிக்க
          </Text>
          <Ionicons name="arrow-forward" size={16} color={theme.primary} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 20,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  goldDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  favButton: {
    padding: 4,
  },
  poetHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  poemText: {
    fontWeight: '800',
    lineHeight: 34,
    letterSpacing: 0.4,
    marginBottom: 12,
  },
  meaningBox: {
    marginBottom: 8,
  },
  meaningLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  meaningText: {
    fontSize: 15,
    lineHeight: 22,
  },
  translationText: {
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
