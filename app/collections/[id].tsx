import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Collection, Verse } from '../../src/types';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import {
  getCollections,
  getCollectionVerses,
  removeVerseFromCollection,
  reorderCollectionVerses,
  updateCollectionName,
  deleteCollection,
} from '../../src/database/repository';
import { exportVersesToPdf } from '../../src/sharing/sharePdf';
import { formatCollectionText, shareText } from '../../src/sharing/shareText';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CollectionDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const collectionId = params.id as string;
  const { theme, settings } = useApp();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const loadData = useCallback(async () => {
    const list = await getCollections();
    const found = list.find(c => c.id === collectionId);
    if (found) {
      setCollection(found);
      setNameInput(found.name);
      const items = await getCollectionVerses(found.id);
      setVerses(items);
    }
  }, [collectionId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    triggerHaptic('medium', settings.hapticsEnabled);
    await updateCollectionName(collectionId, nameInput.trim());
    setIsEditingName(false);
    await loadData();
  };

  const handleRemoveVerse = async (verse: Verse) => {
    triggerHaptic('light', settings.hapticsEnabled);
    Alert.alert(
      'பாடலை நீக்கவா?',
      `"${verse.poem}" பாடலை இத்தொகுப்பிலிருந்து நீக்க விரும்புகிறீர்களா?`,
      [
        { text: 'ரத்து செய்', style: 'cancel' },
        {
          text: 'நீக்கு',
          style: 'destructive',
          onPress: async () => {
            await removeVerseFromCollection(collectionId, verse.id);
            await loadData();
          },
        },
      ]
    );
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    triggerHaptic('light', settings.hapticsEnabled);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= verses.length) return;

    const newVerses = [...verses];
    const temp = newVerses[index];
    newVerses[index] = newVerses[targetIndex];
    newVerses[targetIndex] = temp;

    setVerses(newVerses);
    await reorderCollectionVerses(collectionId, newVerses.map(v => v.id));
  };

  const handleExportPdf = async () => {
    if (verses.length === 0) {
      Alert.alert('அறிவிப்பு', 'தொகுப்பில் பாடல்கள் எதுவும் இல்லை.');
      return;
    }

    triggerHaptic('medium', settings.hapticsEnabled);
    setIsExporting(true);
    try {
      await exportVersesToPdf({
        title: collection?.name || 'ஆத்திச்சூடி பாடல் தொகுப்பு',
        subtitle: `மொத்தப் பாடல்கள்: ${verses.length}`,
        verses,
      });
      triggerHaptic('success', settings.hapticsEnabled);
    } catch (e) {
      Alert.alert('பிழை', 'PDF ஏற்றுமதி தோல்வியடைந்தது.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareText = async () => {
    if (verses.length === 0) {
      Alert.alert('அறிவிப்பு', 'தொகுப்பில் பாடல்கள் எதுவும் இல்லை.');
      return;
    }

    triggerHaptic('light', settings.hapticsEnabled);
    const text = formatCollectionText(
      collection?.name || 'ஆத்திச்சூடி தொகுப்பு',
      verses,
      settings.includeAttribution
    );
    await shareText(text, collection?.name);
  };

  const handleDeleteCollection = () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    Alert.alert(
      'தொகுப்பை நீக்கவா?',
      `"${collection?.name}" தொகுப்பை நிரந்தரமாக நீக்கவா?`,
      [
        { text: 'ரத்து செய்', style: 'cancel' },
        {
          text: 'ஆம், நீக்கு',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(collectionId);
            router.replace('/collections');
          },
        },
      ]
    );
  };

  if (!collection) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <Header title="தொகுப்பு" showBack />
        <View style={styles.emptyContainer}>
          <Text style={{ color: theme.textSecondary }}>தொகுப்பு காணப்படவில்லை.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title={collection.name}
        subtitle={`${verses.length} பாடல்கள்`}
        showBack
        rightAction={{
          icon: 'share-outline',
          onPress: handleShareText,
          accessibilityLabel: 'Share collection',
        }}
      />

      {/* Title Edit & Management Bar */}
      <View style={[styles.titleBar, { backgroundColor: theme.cardBackground, borderBottomColor: theme.borderLight }]}>
        {!isEditingName ? (
          <View style={styles.nameRow}>
            <Text style={[styles.titleText, { color: theme.primaryDark }]}>{collection.name}</Text>
            <TouchableOpacity
              onPress={() => setIsEditingName(true)}
              style={styles.editBtn}
              accessibilityLabel="Edit collection name"
            >
              <Ionicons name="pencil" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editRow}>
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              style={[
                styles.nameInput,
                {
                  color: theme.textPrimary,
                  borderColor: theme.primary,
                  backgroundColor: theme.cardSurface,
                },
              ]}
              autoFocus
            />
            <TouchableOpacity onPress={handleSaveName} style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="checkmark" size={18} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditingName(false)} style={styles.cancelBtn}>
              <Ionicons name="close" size={18} color={theme.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Action Buttons: PDF Export, Delete */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={handleExportPdf}
            disabled={isExporting}
            style={[styles.exportBtn, { backgroundColor: theme.cardSurface, borderColor: theme.border }]}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color={theme.primary} />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={16} color={theme.primary} />
                <Text style={[styles.exportBtnText, { color: theme.primary }]}>PDF ஏற்றுமதி</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleShareText}
            style={[styles.exportBtn, { backgroundColor: theme.cardSurface, borderColor: theme.border }]}
          >
            <Ionicons name="share-social-outline" size={16} color={theme.primary} />
            <Text style={[styles.exportBtnText, { color: theme.primary }]}>உரை பகிர்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDeleteCollection}
            style={[styles.exportBtn, { backgroundColor: theme.cardSurface, borderColor: theme.border }]}
          >
            <Ionicons name="trash-outline" size={16} color={theme.danger} />
            <Text style={[styles.exportBtnText, { color: theme.danger }]}>நீக்கு</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Verse List */}
      {verses.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="file-tray-outline" size={54} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            இத்தொகுப்பில் இன்னும் பாடல்கள் இல்லை
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            எந்தவொரு பாடலின் விரிவான பக்கத்திற்கும் சென்று "தொகுப்பில் சேர்" பொத்தானை அழுத்துவதன் மூலம் பாடல்களை இங்கே சேர்க்கலாம்.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/poets')}
            style={[styles.browseBtn, { backgroundColor: theme.primary }]}
          >
            <Text style={styles.browseBtnText}>பாடல்களைத் தேடுக</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={verses}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View style={[styles.verseCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              {/* Left Content */}
              <TouchableOpacity
                onPress={() => router.push(`/verse/${item.poetId}/${item.number}`)}
                style={{ flex: 1 }}
              >
                <View style={styles.verseHeaderRow}>
                  <Text style={[styles.versePoetBadge, { color: theme.accent }]}>
                    {item.poetId === 'avvaiyar' ? 'ஔவையார்' : 'பாரதியார்'} • பாடல் #{item.number}
                  </Text>
                </View>
                <Text style={[styles.versePoem, { color: theme.primaryDark }]}>{item.poem}</Text>
                {item.meaning && (
                  <Text style={[styles.verseMeaning, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.meaning}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Reorder and Delete Controls */}
              <View style={styles.controlsCol}>
                <TouchableOpacity
                  onPress={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  style={[styles.arrowBtn, index === 0 && { opacity: 0.25 }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-up" size={18} color={theme.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleMove(index, 'down')}
                  disabled={index === verses.length - 1}
                  style={[styles.arrowBtn, index === verses.length - 1 && { opacity: 0.25 }]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="chevron-down" size={18} color={theme.textPrimary} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleRemoveVerse(item)}
                  style={styles.removeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle-outline" size={20} color={theme.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  titleBar: {
    padding: 16,
    borderBottomWidth: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '800',
  },
  editBtn: {
    padding: 4,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    padding: 6,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  verseCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  verseHeaderRow: {
    marginBottom: 4,
  },
  versePoetBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
  versePoem: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 4,
  },
  verseMeaning: {
    fontSize: 13,
    lineHeight: 18,
  },
  controlsCol: {
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: '#E8DFD1',
    marginLeft: 12,
  },
  arrowBtn: {
    padding: 2,
  },
  removeBtn: {
    padding: 2,
    marginTop: 4,
  },
  emptyContainer: {
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
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  browseBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  browseBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
