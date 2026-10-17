import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { PoetId, Verse } from '../../src/types';
import { getFavorites } from '../../src/database/repository';
import { VerseListItem } from '../../src/components/VerseListItem';
import { Header } from '../../src/components/Header';
import { triggerHaptic } from '../../src/utils/haptics';

export default function FavoritesScreen() {
  const { theme, favoriteIds, settings } = useApp();
  const [filter, setFilter] = useState<PoetId | 'all'>('all');
  const [favVerses, setFavVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getFavorites('all').then(verses => {
      if (active) {
        setFavVerses(verses);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [favoriteIds]);

  const filteredVerses = useMemo(() => {
    if (filter === 'all') return favVerses;
    return favVerses.filter(v => v.poetId === filter);
  }, [favVerses, filter]);

  const handleFilter = (f: PoetId | 'all') => {
    triggerHaptic('light', settings.hapticsEnabled);
    setFilter(f);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title="விருப்பங்கள் (Favorites)"
        subtitle={`மொத்தம் ${favVerses.length} பாடல்கள்`}
      />

      {/* Filter Row */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          onPress={() => handleFilter('all')}
          style={[
            styles.filterPill,
            { borderColor: theme.border },
            filter === 'all' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text style={[styles.filterText, { color: filter === 'all' ? '#FFF' : theme.textSecondary }]}>
            அனைத்தும் ({favVerses.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilter('avvaiyar')}
          style={[
            styles.filterPill,
            { borderColor: theme.border },
            filter === 'avvaiyar' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text style={[styles.filterText, { color: filter === 'avvaiyar' ? '#FFF' : theme.textSecondary }]}>
            ஔவையார் ({favVerses.filter(v => v.poetId === 'avvaiyar').length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleFilter('bharathiyar')}
          style={[
            styles.filterPill,
            { borderColor: theme.border },
            filter === 'bharathiyar' && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text style={[styles.filterText, { color: filter === 'bharathiyar' ? '#FFF' : theme.textSecondary }]}>
            பாரதியார் ({favVerses.filter(v => v.poetId === 'bharathiyar').length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List / Empty State */}
      {filteredVerses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-dislike-outline" size={56} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            விருப்பப் பாடல்கள் எதுவும் இல்லை
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            நீங்கள் விரும்பும் பாடலின் பக்கத்தில் உள்ள இதயக் குறியீட்டைத் (♡) தொட்டு இங்கே சேர்க்கலாம்.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredVerses}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <VerseListItem verse={item} showMeaning />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
