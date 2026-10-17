import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Collection } from '../../src/types';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { getCollections, deleteCollection } from '../../src/database/repository';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CollectionsListScreen() {
  const router = useRouter();
  const { theme, settings } = useApp();
  const [collections, setCollections] = useState<Collection[]>([]);

  const loadData = async () => {
    const list = await getCollections();
    setCollections(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = (item: Collection) => {
    triggerHaptic('medium', settings.hapticsEnabled);
    Alert.alert(
      'தொகுப்பை நீக்கவா?',
      `"${item.name}" தொகுப்பை நீக்க விரும்புகிறீர்களா? இத்தொகுப்பில் உள்ள பாடல்கள் பொதுப் பட்டியலிலிருந்து நீங்காது.`,
      [
        { text: 'ரத்து செய்', style: 'cancel' },
        {
          text: 'நீக்கு',
          style: 'destructive',
          onPress: async () => {
            await deleteCollection(item.id);
            await loadData();
            triggerHaptic('success', settings.hapticsEnabled);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header
        title="தனிப்பயன் தொகுப்புகள்"
        subtitle="உங்கள் சொந்தப் பாடல் தொகுப்புகள்"
        showBack
        rightAction={{
          icon: 'add-circle-outline',
          onPress: () => router.push('/collections/create'),
          accessibilityLabel: 'புதிய தொகுப்பு உருவாக்கு',
        }}
      />

      {collections.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="albums-outline" size={64} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>
            தொகுப்புகள் எதுவும் இல்லை
          </Text>
          <Text style={[styles.emptyDesc, { color: theme.textSecondary }]}>
            காலைப் படிப்பு, பள்ளி மனனம், குடும்ப வாசிப்பு போன்ற தலைப்புகளில் உங்கள் சொந்தப் பாடல் தொகுப்புகளை உருவாக்கலாம்.
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/collections/create')}
            style={[styles.createBtn, { backgroundColor: theme.primary }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.createBtnText}>புதிய தொகுப்பை உருவாக்கு</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push(`/collections/${item.id}`)}
              style={[styles.colCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              accessibilityRole="button"
              accessibilityLabel={`${item.name}, ${item.verseCount} பாடல்கள்`}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.iconBox, { backgroundColor: theme.cardSurface }]}>
                  <Ionicons name="folder-outline" size={24} color={theme.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.colName, { color: theme.textPrimary }]}>{item.name}</Text>
                  <Text style={[styles.colMeta, { color: theme.textMuted }]}>
                    {item.verseCount} பாடல்கள் • {new Date(item.createdAt).toLocaleDateString('ta-IN')}
                  </Text>
                </View>
              </View>

              <View style={styles.cardRight}>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={styles.deleteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityLabel="Delete collection"
                >
                  <Ionicons name="trash-outline" size={18} color={theme.textMuted} />
                </TouchableOpacity>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
              </View>
            </TouchableOpacity>
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
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  colCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colName: {
    fontSize: 16,
    fontWeight: '700',
  },
  colMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  deleteBtn: {
    padding: 4,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
