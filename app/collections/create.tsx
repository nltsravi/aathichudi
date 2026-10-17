import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { createCollection } from '../../src/database/repository';
import { triggerHaptic } from '../../src/utils/haptics';

export default function CreateCollectionScreen() {
  const router = useRouter();
  const { theme, settings } = useApp();
  const [name, setName] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('பிழை', 'தயவுசெய்து தொகுப்பின் பெயரை உள்ளிடவும்.');
      return;
    }

    triggerHaptic('medium', settings.hapticsEnabled);
    const col = await createCollection(name.trim());
    triggerHaptic('success', settings.hapticsEnabled);
    router.replace(`/collections/${col.id}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="புதிய தொகுப்பு" subtitle="சொந்தப் பாடல் தொகுப்பை உருவாக்குக" showBack />

      <View style={styles.formContainer}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>
          தொகுப்பின் பெயர் (Collection Name):
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="எ.கா: காலை வாசிப்பு, பள்ளிப் பாடங்கள், நினைவில் கொள்ள வேண்டியவை"
          placeholderTextColor={theme.textMuted}
          style={[
            styles.input,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
              color: theme.textPrimary,
            },
          ]}
          autoFocus
        />

        <Text style={[styles.hint, { color: theme.textMuted }]}>
          தொகுப்பை உருவாக்கிய பின், எந்தப் பாடலின் விரிவான பக்கத்திலிருந்தும் "தொகுப்பில் சேர்" பொத்தானை அழுத்திப் பாடல்களைச் சேர்க்கலாம்.
        </Text>

        <TouchableOpacity
          onPress={handleCreate}
          style={[styles.submitBtn, { backgroundColor: theme.primary }]}
        >
          <Text style={styles.submitBtnText}>தொகுப்பை உருவாக்கு</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 24,
  },
  submitBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
