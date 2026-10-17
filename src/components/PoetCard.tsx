import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { PoetMeta } from '../types';
import { useApp } from '../context/AppContext';
import { getReadCountByPoet } from '../database/repository';
import { triggerHaptic } from '../utils/haptics';

interface PoetCardProps {
  poet: PoetMeta;
}

export const PoetCard: React.FC<PoetCardProps> = ({ poet }) => {
  const router = useRouter();
  const { theme, readVerseIds, settings } = useApp();
  const [readCount, setReadCount] = useState(0);

  useEffect(() => {
    getReadCountByPoet(poet.id).then(setReadCount);
  }, [poet.id, readVerseIds]);

  const handlePress = () => {
    triggerHaptic('light', settings.hapticsEnabled);
    router.push(`/poet/${poet.id}`);
  };

  const progressPercent = poet.totalVerses > 0 ? (readCount / poet.totalVerses) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${poet.nameTa} ஆத்திச்சூடி, ${poet.totalVerses} பாடல்கள்`}
      accessibilityHint="பாடல்களைப் படிக்கத் தொடவும்"
    >
      <View style={styles.topRow}>
        <View style={styles.titleArea}>
          <Text style={[styles.nameTa, { color: theme.primaryDark }]}>{poet.nameTa}</Text>
          <Text style={[styles.nameEn, { color: theme.textSecondary }]}>{poet.nameEn}</Text>
        </View>

        <View style={[styles.countBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.countText}>{poet.totalVerses} பாடல்கள்</Text>
        </View>
      </View>

      <Text style={[styles.periodText, { color: theme.accent }]}>
        காலம்: {poet.period}
      </Text>

      <Text style={[styles.descText, { color: theme.textPrimary }]} numberOfLines={3}>
        {poet.descriptionTa}
      </Text>

      {/* Reading Progress Indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
            படித்தவை (Progress): {readCount}/{poet.totalVerses}
          </Text>
          <Text style={[styles.progressPercent, { color: theme.accent }]}>
            {Math.round(progressPercent)}%
          </Text>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: theme.borderLight }]}>
          <View
            style={[
              styles.progressBarFill,
              {
                backgroundColor: theme.primaryLight,
                width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Action button */}
      <View style={[styles.actionRow, { borderTopColor: theme.borderLight }]}>
        <Text style={[styles.actionText, { color: theme.primary }]}>
          பாடல்களைப் படிக்க (Explore Verses)
        </Text>
        <Ionicons name="chevron-forward" size={18} color={theme.primary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginHorizontal: 16,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  titleArea: {
    flex: 1,
  },
  nameTa: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  nameEn: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  periodText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  descText: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
