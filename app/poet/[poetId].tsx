import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PoetId, Verse } from '../../src/types';
import { getPoetById, getVersesByPoet } from '../../src/data/loader';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { VerseListItem } from '../../src/components/VerseListItem';
import { DecorativeDivider } from '../../src/components/DecorativeDivider';
import { triggerHaptic } from '../../src/utils/haptics';

export default function PoetDetailScreen() {
  const params = useLocalSearchParams();
  const poetId = (params.poetId as PoetId) || 'avvaiyar';
  const { theme, readVerseIds, settings } = useApp();

  const poet = useMemo(() => getPoetById(poetId), [poetId]);
  const allVerses = useMemo(() => getVersesByPoet(poetId), [poetId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread' | 'read'>('all');
  const [isPrayerExpanded, setIsPrayerExpanded] = useState(false);

  const readCount = useMemo(() => {
    return allVerses.filter(v => readVerseIds.has(v.id)).length;
  }, [allVerses, readVerseIds]);

  const filteredVerses = useMemo(() => {
    let list = allVerses;

    if (filterMode === 'read') {
      list = list.filter(v => readVerseIds.has(v.id));
    } else if (filterMode === 'unread') {
      list = list.filter(v => !readVerseIds.has(v.id));
    }

    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      const qNum = /^\d+$/.test(q) ? parseInt(q, 10) : null;
      list = list.filter(v => {
        if (qNum !== null && v.number === qNum) return true;
        if (v.poem.toLowerCase().includes(q)) return true;
        if (v.meaning && v.meaning.toLowerCase().includes(q)) return true;
        if (v.translation && v.translation.toLowerCase().includes(q)) return true;
        if (v.transliteration && v.transliteration.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    return list;
  }, [allVerses, filterMode, searchQuery, readVerseIds]);

  if (!poet) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="புலவர் தகவல்" showBack />
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.textPrimary }}>புலவர் விபரம் கிடைக்கவில்லை.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const prayer = poet.kadavulVaazthu;

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      {/* Overview Info */}
      <View style={[styles.poetBanner, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.poetNameTa, { color: theme.primaryDark }]}>{poet.nameTa}</Text>
        <Text style={[styles.poetNameEn, { color: theme.textSecondary }]}>{poet.nameEn}</Text>
        <Text style={[styles.poetPeriod, { color: theme.accent }]}>காலம்: {poet.period}</Text>
        <Text style={[styles.poetDesc, { color: theme.textPrimary }]}>{poet.descriptionTa}</Text>

        {/* Read progress */}
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: theme.textMuted }]}>
            படித்தவை: {readCount} / {poet.totalVerses}
          </Text>
          <Text style={[styles.progressPercent, { color: theme.accent }]}>
            {Math.round((readCount / poet.totalVerses) * 100)}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.borderLight }]}>
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.primary,
                width: `${Math.min(100, (readCount / poet.totalVerses) * 100)}%`,
              },
            ]}
          />
        </View>
      </View>

      {/* Introductory Prayer (கடவுள் வாழ்த்து) */}
      {prayer && (
        <View
          style={[
            styles.prayerCard,
            {
              backgroundColor: theme.cardSurface,
              borderColor: theme.accent,
            },
          ]}
        >
          <TouchableOpacity
            onPress={() => {
              triggerHaptic('light', settings.hapticsEnabled);
              setIsPrayerExpanded(!isPrayerExpanded);
            }}
            style={styles.prayerHeader}
            accessibilityRole="button"
            accessibilityLabel="கடவுள் வாழ்த்து"
          >
            <View style={styles.prayerTitleRow}>
              <Text style={[styles.prayerMotif, { color: theme.accent }]}>❖</Text>
              <Text style={[styles.prayerTitle, { color: theme.primaryDark }]}>
                {prayer.title} (Introductory Prayer)
              </Text>
            </View>
            <Ionicons
              name={isPrayerExpanded ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.primary}
            />
          </TouchableOpacity>

          <View style={styles.prayerLinesBox}>
            {prayer.lines.map((line, idx) => (
              <Text key={idx} style={[styles.prayerLine, { color: theme.primaryDark }]}>
                {line}
              </Text>
            ))}
          </View>

          {isPrayerExpanded && (
            <View style={[styles.prayerMeaningBox, { borderTopColor: theme.borderLight }]}>
              {prayer.meaning && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={[styles.meaningHeading, { color: theme.accent }]}>பொருள்:</Text>
                  <Text style={[styles.meaningBody, { color: theme.textPrimary }]}>{prayer.meaning}</Text>
                </View>
              )}
              {prayer.paraphrase && (
                <View style={{ marginBottom: 6 }}>
                  <Text style={[styles.meaningHeading, { color: theme.accent }]}>விளக்கம்:</Text>
                  <Text style={[styles.meaningBody, { color: theme.textPrimary }]}>{prayer.paraphrase}</Text>
                </View>
              )}
              {prayer.translation && (
                <View>
                  <Text style={[styles.meaningHeading, { color: theme.accent }]}>Translation:</Text>
                  <Text style={[styles.meaningBody, { color: theme.textSecondary, fontStyle: 'italic' }]}>
                    {prayer.translation}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      <DecorativeDivider symbol="❦" />

      {/* In-Collection Search and Filter Row */}
      <View style={styles.controlsSection}>
        <View style={[styles.searchBox, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Ionicons name="search" size={18} color={theme.textMuted} />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="இத்தொகுப்பில் தேடுக (பாடல், எண்)..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.textPrimary }]}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filterPillsRow}>
          {(['all', 'unread', 'read'] as const).map(f => {
            const label = f === 'all' ? `அனைத்தும் (${allVerses.length})` : f === 'unread' ? `படிக்காதவை (${allVerses.length - readCount})` : `படித்தவை (${readCount})`;
            const active = filterMode === f;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => {
                  triggerHaptic('light', settings.hapticsEnabled);
                  setFilterMode(f);
                }}
                style={[
                  styles.filterPill,
                  { borderColor: theme.border },
                  active && { backgroundColor: theme.primary, borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.filterPillText, { color: active ? '#FFF' : theme.textSecondary }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={poet.nameTa}
        subtitle={`${poet.totalVerses} பாடல்கள்`}
        showBack
      />

      <FlatList
        data={filteredVerses}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <VerseListItem verse={item} showMeaning />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              பொருத்தமான பாடல்கள் எதுவும் இல்லை.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 28,
  },
  headerComponent: {
    paddingTop: 12,
  },
  poetBanner: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
  },
  poetNameTa: {
    fontSize: 24,
    fontWeight: '800',
  },
  poetNameEn: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  poetPeriod: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  poetDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 8,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  prayerCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
  },
  prayerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  prayerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  prayerMotif: {
    fontSize: 14,
  },
  prayerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  prayerLinesBox: {
    marginVertical: 10,
    paddingLeft: 4,
  },
  prayerLine: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 24,
  },
  prayerMeaningBox: {
    paddingTop: 10,
    borderTopWidth: 1,
  },
  meaningHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  meaningBody: {
    fontSize: 13,
    lineHeight: 20,
  },
  controlsSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
