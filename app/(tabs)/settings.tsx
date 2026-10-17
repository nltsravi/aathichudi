import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { Header } from '../../src/components/Header';
import { DecorativeDivider } from '../../src/components/DecorativeDivider';
import {
  scheduleDailyVerseNotification,
  cancelAllDailyNotifications,
} from '../../src/notifications/scheduler';
import {
  requestNotificationPermission,
  checkNotificationPermission,
} from '../../src/notifications/permissions';
import { resetReadingProgress } from '../../src/database/repository';
import { triggerHaptic } from '../../src/utils/haptics';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, isDark, settings, updateSettings, refreshUserData } = useApp();

  const [notificationEnabled, setNotificationEnabled] = useState(false);
  const [notificationTime, setNotificationTime] = useState('07:00');
  const [notificationSource, setNotificationSource] = useState<'avvaiyar' | 'bharathiyar' | 'both'>('both');

  const handleThemeChange = async (mode: 'system' | 'light' | 'dark') => {
    triggerHaptic('light', settings.hapticsEnabled);
    await updateSettings({ themeMode: mode });
  };

  const handleNotificationToggle = async (val: boolean) => {
    triggerHaptic('medium', settings.hapticsEnabled);
    if (val) {
      const hasPerm = await checkNotificationPermission();
      if (!hasPerm) {
        const granted = await requestNotificationPermission();
        if (!granted) {
          Alert.alert(
            'அனுமதி தேவை',
            'அறிவிப்புகளைப் பெற அமைப்புகளில் சென்று அனுமதி வழங்கவும் (Notification permission required).'
          );
          setNotificationEnabled(false);
          return;
        }
      }

      setNotificationEnabled(true);
      await scheduleDailyVerseNotification({
        enabled: true,
        time: notificationTime,
        source: notificationSource,
      });
      Alert.alert(
        'அறிவிப்பு அமைக்கப்பட்டது',
        `தினமும் காலை ${notificationTime} மணிக்கு ஆத்திச்சூடி பாடல் உங்களுக்கு நினைவூட்டப்படும்.`
      );
    } else {
      setNotificationEnabled(false);
      await cancelAllDailyNotifications();
    }
  };

  const handleSourceChange = async (src: 'avvaiyar' | 'bharathiyar' | 'both') => {
    triggerHaptic('light', settings.hapticsEnabled);
    setNotificationSource(src);
    if (notificationEnabled) {
      await scheduleDailyVerseNotification({
        enabled: true,
        time: notificationTime,
        source: src,
      });
    }
  };

  const handleTimeChange = async (time: string) => {
    triggerHaptic('light', settings.hapticsEnabled);
    setNotificationTime(time);
    if (notificationEnabled) {
      await scheduleDailyVerseNotification({
        enabled: true,
        time,
        source: notificationSource,
      });
    }
  };

  const handleResetReading = () => {
    triggerHaptic('medium', settings.hapticsEnabled);
    Alert.alert(
      'படிப்பு முன்னேற்றத்தை மீட்டமைக்கவா?',
      'நீங்கள் படித்ததாகக் குறித்த பாடல்கள் மற்றும் கடைசியாகப் படித்த இடம் மீட்டமைக்கப்படும். உங்கள் விருப்பப் பாடல்கள் மற்றும் தனிப்பயன் தொகுப்புகள் அழியாது.',
      [
        { text: 'ரத்து செய்', style: 'cancel' },
        {
          text: 'ஆம், மீட்டமை',
          style: 'destructive',
          onPress: async () => {
            await resetReadingProgress();
            await refreshUserData();
            triggerHaptic('success', settings.hapticsEnabled);
            Alert.alert('வெற்றி', 'படிப்பு முன்னேற்றம் வெற்றிகரமாக மீட்டமைக்கப்பட்டது.');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <Header title="அமைப்புகள்" subtitle="தோற்றம், எழுத்துரு & அறிவிப்புகள்" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Section: Theme */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>தோற்றம் (Theme)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.themeSelectorRow}>
            {(['system', 'light', 'dark'] as const).map(mode => {
              const label = mode === 'system' ? 'இயல்பு (System)' : mode === 'light' ? 'பகல் (Light)' : 'இரவு (Dark)';
              const icon = mode === 'system' ? 'phone-portrait-outline' : mode === 'light' ? 'sunny-outline' : 'moon-outline';
              const active = settings.themeMode === mode;

              return (
                <TouchableOpacity
                  key={mode}
                  onPress={() => handleThemeChange(mode)}
                  style={[
                    styles.themeOptionBtn,
                    { borderColor: theme.borderLight },
                    active && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  <Ionicons name={icon as any} size={20} color={active ? '#FFF' : theme.textPrimary} />
                  <Text style={[styles.themeOptionText, { color: active ? '#FFF' : theme.textPrimary }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Section: Typography */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>எழுத்துரு அளவு (Typography)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {/* Poem Font Size */}
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>பாடல் எழுத்துரு அளவு</Text>
              <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                தற்போதைய அளவு: {settings.poemFontSize} pt
              </Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => updateSettings({ poemFontSize: Math.max(18, settings.poemFontSize - 2) })}
                style={[styles.stepperBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateSettings({ poemFontSize: Math.min(36, settings.poemFontSize + 2) })}
                style={[styles.stepperBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="add" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          {/* Meaning Font Size */}
          <View style={styles.rowBetween}>
            <View>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>பொருள் எழுத்துரு அளவு</Text>
              <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                தற்போதைய அளவு: {settings.meaningFontSize} pt
              </Text>
            </View>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                onPress={() => updateSettings({ meaningFontSize: Math.max(12, settings.meaningFontSize - 1) })}
                style={[styles.stepperBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="remove" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateSettings({ meaningFontSize: Math.min(24, settings.meaningFontSize + 1) })}
                style={[styles.stepperBtn, { borderColor: theme.border }]}
              >
                <Ionicons name="add" size={18} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Section: Daily Notifications */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>தினசரி நினைவூட்டல் (Daily Notification)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>
                தினசரி ஆத்திச்சூடி அறிவிப்பு
              </Text>
              <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                இணையம் தேவையின்றி சாதனத்திலேயே செயல்படும்.
              </Text>
            </View>
            <Switch
              value={notificationEnabled}
              onValueChange={handleNotificationToggle}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={notificationEnabled ? theme.accent : '#f4f3f4'}
            />
          </View>

          {notificationEnabled && (
            <>
              <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

              {/* Time selection */}
              <View style={styles.columnOption}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary, marginBottom: 8 }]}>
                  நினைவூட்டும் நேரம் (Preferred Time):
                </Text>
                <View style={styles.timeOptionsRow}>
                  {['06:00', '07:00', '08:00', '20:00'].map(t => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => handleTimeChange(t)}
                      style={[
                        styles.timePill,
                        { borderColor: theme.border },
                        notificationTime === t && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.timePillText,
                          { color: notificationTime === t ? '#FFF' : theme.textPrimary },
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

              {/* Source selection */}
              <View style={styles.columnOption}>
                <Text style={[styles.settingLabel, { color: theme.textPrimary, marginBottom: 8 }]}>
                  நூல் தேர்வு (Source Pool):
                </Text>
                <View style={styles.sourceOptionsRow}>
                  {[
                    { id: 'both', label: 'இரண்டும் (Both)' },
                    { id: 'avvaiyar', label: 'ஔவையார்' },
                    { id: 'bharathiyar', label: 'பாரதியார்' },
                  ].map(s => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => handleSourceChange(s.id as any)}
                      style={[
                        styles.sourcePill,
                        { borderColor: theme.border },
                        notificationSource === s.id && { backgroundColor: theme.primary, borderColor: theme.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sourcePillText,
                          { color: notificationSource === s.id ? '#FFF' : theme.textPrimary },
                        ]}
                      >
                        {s.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>

        {/* Section: Sharing and Interaction */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>பகிர்வு & தொடு உணர்வு (Preferences)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>பகிர்வில் செயலிப் பெயர் சேர்க்க</Text>
              <Text style={[styles.settingSub, { color: theme.textMuted }]}>
                பகிரப்படும் உரையின் இறுதியில் ஆத்திச்சூடி குறிப்பு.
              </Text>
            </View>
            <Switch
              value={settings.includeAttribution}
              onValueChange={v => updateSettings({ includeAttribution: v })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.includeAttribution ? theme.accent : '#f4f3f4'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <View style={styles.rowBetween}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.settingLabel, { color: theme.textPrimary }]}>தொடு அதிர்வு (Haptic Feedback)</Text>
              <Text style={[styles.settingSub, { color: theme.textMuted }]}>பொத்தான்களை அழுத்தும் போது மெல்லிய அதிர்வு.</Text>
            </View>
            <Switch
              value={settings.hapticsEnabled}
              onValueChange={v => updateSettings({ hapticsEnabled: v })}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor={settings.hapticsEnabled ? theme.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Section: Data & Maintenance */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>தரவு மேலாண்மை (Data)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.push('/collections')} style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <Ionicons name="albums-outline" size={20} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.textPrimary }]}>தனிப்பயன் தொகுப்புகள் (Manage Collections)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity onPress={handleResetReading} style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <Ionicons name="refresh-outline" size={20} color={theme.danger} />
              <Text style={[styles.linkText, { color: theme.danger }]}>படிப்பு முன்னேற்றத்தை மீட்டமை (Reset Progress)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Section: Information */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>செயலித் தகவல் (About & Privacy)</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <TouchableOpacity onPress={() => router.push('/about')} style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <Ionicons name="information-circle-outline" size={20} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.textPrimary }]}>செயலியைப் பற்றி (About Aathichudi)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

          <TouchableOpacity onPress={() => router.push('/privacy')} style={styles.linkRow}>
            <View style={styles.linkLeft}>
              <Ionicons name="shield-checkmark-outline" size={20} color={theme.primary} />
              <Text style={[styles.linkText, { color: theme.textPrimary }]}>தனியுரிமைக் கொள்கை (Privacy Policy)</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Footer Build Info */}
        <View style={styles.footerInfo}>
          <Text style={[styles.versionText, { color: theme.textMuted }]}>
            Aathichudi (ஆத்திச்சூடி) v1.0.0 (Build 1)
          </Text>
          <Text style={[styles.offlineBadge, { color: theme.accent }]}>
            ✓ 100% Offline • Zero Analytics • விளம்பரங்கள் இல்லை
          </Text>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  themeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOptionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 6,
  },
  themeOptionText: {
    fontSize: 11,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  settingSub: {
    fontSize: 12,
    marginTop: 2,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  columnOption: {
    paddingVertical: 4,
  },
  timeOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  timePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  sourceOptionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sourcePill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  sourcePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerInfo: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  offlineBadge: {
    fontSize: 12,
    fontWeight: '700',
  },
});
