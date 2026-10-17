import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Collection, Verse } from '../types';
import { useApp } from '../context/AppContext';
import {
  getCollections,
  createCollection,
  addVerseToCollection,
  getCollectionVerses,
} from '../database/repository';
import { triggerHaptic } from '../utils/haptics';

interface AddToCollectionModalProps {
  visible: boolean;
  verse: Verse;
  onClose: () => void;
}

export const AddToCollectionModal: React.FC<AddToCollectionModalProps> = ({
  visible,
  verse,
  onClose,
}) => {
  const { theme, settings } = useApp();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newColName, setNewColName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [inCollections, setInCollections] = useState<Set<string>>(new Set());

  const loadCollections = async () => {
    const list = await getCollections();
    setCollections(list);

    // Check which collections already have this verse
    const membership = new Set<string>();
    for (const c of list) {
      const verses = await getCollectionVerses(c.id);
      if (verses.some(v => v.id === verse.id)) {
        membership.add(c.id);
      }
    }
    setInCollections(membership);
  };

  useEffect(() => {
    if (visible) {
      loadCollections();
      setIsCreating(false);
      setNewColName('');
    }
  }, [visible, verse.id]);

  const handleSelectCollection = async (collection: Collection) => {
    triggerHaptic('medium', settings.hapticsEnabled);
    if (inCollections.has(collection.id)) {
      Alert.alert('அறிவிப்பு', `இந்தப் பாடல் ஏற்கனவே "${collection.name}" தொகுப்பில் உள்ளது.`);
      return;
    }

    const added = await addVerseToCollection(collection.id, verse.id);
    if (added) {
      triggerHaptic('success', settings.hapticsEnabled);
      Alert.alert('வெற்றி', `"${collection.name}" தொகுப்பில் பாடல் சேர்க்கப்பட்டது!`);
      onClose();
    }
  };

  const handleCreateAndAdd = async () => {
    if (!newColName.trim()) {
      Alert.alert('பிழை', 'தயவுசெய்து தொகுப்பின் பெயரை உள்ளிடவும்.');
      return;
    }

    triggerHaptic('medium', settings.hapticsEnabled);
    const created = await createCollection(newColName.trim());
    await addVerseToCollection(created.id, verse.id);
    triggerHaptic('success', settings.hapticsEnabled);
    Alert.alert('வெற்றி', `"${created.name}" உருவாக்கப்பட்டு பாடல் சேர்க்கப்பட்டது!`);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>தொகுப்பில் சேர்க்க</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={theme.textMuted} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.verseSubtitle, { color: theme.primary }]}>
            "{verse.poem}" (பாடல் #{verse.number})
          </Text>

          {!isCreating ? (
            <>
              {collections.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                    உங்களிடம் இன்னும் தனிப்பயன் தொகுப்புகள் இல்லை.
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={collections}
                  keyExtractor={item => item.id}
                  style={styles.list}
                  renderItem={({ item }) => {
                    const alreadyIn = inCollections.has(item.id);
                    return (
                      <TouchableOpacity
                        onPress={() => handleSelectCollection(item)}
                        style={[
                          styles.colItem,
                          {
                            backgroundColor: theme.cardSurface,
                            borderColor: theme.borderLight,
                          },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.colName, { color: theme.textPrimary }]}>{item.name}</Text>
                          <Text style={[styles.colCount, { color: theme.textMuted }]}>
                            {item.verseCount} பாடல்கள்
                          </Text>
                        </View>
                        {alreadyIn ? (
                          <View style={styles.inBadge}>
                            <Ionicons name="checkmark-circle" size={18} color={theme.accent} />
                            <Text style={[styles.inBadgeText, { color: theme.accent }]}>சேர்க்கப்பட்டது</Text>
                          </View>
                        ) : (
                          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
              )}

              <TouchableOpacity
                onPress={() => setIsCreating(true)}
                style={[styles.createBtn, { borderColor: theme.primary }]}
              >
                <Ionicons name="add" size={20} color={theme.primary} />
                <Text style={[styles.createBtnText, { color: theme.primary }]}>
                  புதிய தொகுப்பை உருவாக்கு (Create New)
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.createBox}>
              <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>
                தொகுப்பின் பெயர் (Collection Name):
              </Text>
              <TextInput
                value={newColName}
                onChangeText={setNewColName}
                placeholder="எ.கா: காலைப் படிப்பு, பள்ளி மனனம்..."
                placeholderTextColor={theme.textMuted}
                style={[
                  styles.input,
                  {
                    color: theme.textPrimary,
                    borderColor: theme.border,
                    backgroundColor: theme.cardSurface,
                  },
                ]}
                autoFocus
              />
              <View style={styles.createActionRow}>
                <TouchableOpacity
                  onPress={() => setIsCreating(false)}
                  style={[styles.cancelBtn, { borderColor: theme.border }]}
                >
                  <Text style={[styles.cancelBtnText, { color: theme.textSecondary }]}>ரத்து செய்</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateAndAdd}
                  style={[styles.saveBtn, { backgroundColor: theme.primary }]}
                >
                  <Text style={styles.saveBtnText}>உருவாக்கிச் சேர்</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  verseSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 16,
  },
  emptyContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  list: {
    maxHeight: 260,
  },
  colItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  colName: {
    fontSize: 15,
    fontWeight: '700',
  },
  colCount: {
    fontSize: 12,
    marginTop: 2,
  },
  inBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginTop: 12,
  },
  createBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  createBox: {
    marginTop: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 15,
    marginBottom: 16,
  },
  createActionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveBtnText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
