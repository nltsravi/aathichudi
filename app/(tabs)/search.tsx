import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { PoetId } from '../../src/types';
import { searchVerses, SearchResult } from '../../src/features/search/searchService';
import { VerseListItem } from '../../src/components/VerseListItem';
import { Header } from '../../src/components/Header';
import { triggerHaptic } from '../../src/utils/haptics';

export default function SearchScreen() {
  const { theme, settings } = useApp();
  const [query, setQuery] = useState('');
  const [poetFilter, setPoetFilter] = useState<PoetId | 'all'>('all');

  const results = useMemo(() => {
    return searchVerses(query, { poetId: poetFilter });
  }, [query, poetFilter]);

  const handleClear = () => {
    triggerHaptic('light', settings.hapticsEnabled);
    setQuery('');
    Keyboard.dismiss();
  };

  const setFilter = (f: PoetId | 'all') => {
    triggerHaptic('light', settings.hapticsEnabled);
    setPoetFilter(f);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="தேடல் (Search)" subtitle="அனைத்துப் பாடல்களிலும் தேடுக" />

      {/* Search Input Bar */}
      <View style={styles.inputContainer}>
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.cardBackground,
              borderColor: query ? theme.primary : theme.border,
            },
          ]}
        >
          <Ionicons name="search" size={20} color={theme.textMuted} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="பாடல், பொருள், எண், translation..."
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { color: theme.textPrimary }]}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn} accessibilityLabel="Clear query">
              <Ionicons name="close-circle" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            onPress={() => setFilter('all')}
            style={[
              styles.filterPill,
              { borderColor: theme.border },
              poetFilter === 'all' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: poetFilter === 'all' ? '#FFF' : theme.textSecondary },
              ]}
            >
              அனைத்தும் (All)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('avvaiyar')}
            style={[
              styles.filterPill,
              { borderColor: theme.border },
              poetFilter === 'avvaiyar' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: poetFilter === 'avvaiyar' ? '#FFF' : theme.textSecondary },
              ]}
            >
              ஔவையார் (109)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setFilter('bharathiyar')}
            style={[
              styles.filterPill,
              { borderColor: theme.border },
              poetFilter === 'bharathiyar' && { backgroundColor: theme.primary, borderColor: theme.primary },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: poetFilter === 'bharathiyar' ? '#FFF' : theme.textSecondary },
              ]}
            >
              பாரதியார் (110)
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results List or Empty State */}
      {query.trim().length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="search-outline" size={54} color={theme.border} />
          <Text style={[styles.emptyTitle, { color: theme.textSecondary }]}>
            பாடலைத் தேடத் தொடங்கவும்
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textMuted }]}>
            தமிழ் பாடல் வரிகள், பொருள், விளக்கம், பாடல் எண் அல்லது ஆங்கில மொழிபெயர்ப்பு மூலம் தேடலாம்.
          </Text>
          <View style={styles.suggestionsBox}>
            <Text style={[styles.suggestionHeading, { color: theme.accent }]}>மாதிரி தேடல்கள்:</Text>
            <View style={styles.tagsRow}>
              {['அறம்', 'சினம்', 'Acham', 'Anger', '1', 'கல்வி'].map(tag => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setQuery(tag)}
                  style={[styles.tag, { backgroundColor: theme.cardSurface, borderColor: theme.borderLight }]}
                >
                  <Text style={[styles.tagText, { color: theme.primaryDark }]}>{tag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="alert-circle-outline" size={54} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            முடிவுகள் எதுவும் கிடைக்கவில்லை
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            "{query}" என்ற சொல்லுக்குப் பொருத்தமான பாடல்கள் எதுவும் கிடைக்கவில்லை. எழுத்துப் பிழைகளைச் சரிபார்க்கவும் அல்லது வேறு சொல்லை முயலவும்.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={item => item.verse.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: theme.textMuted }]}>
              கண்டறியப்பட்ட பாடல்கள்: {results.length}
            </Text>
          }
          renderItem={({ item }) => <VerseListItem verse={item.verse} showMeaning />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  clearBtn: {
    padding: 6,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
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
  resultsCount: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  emptyStateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  suggestionsBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  suggestionHeading: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
