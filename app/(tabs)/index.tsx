import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../../src/context/AppContext';
import { getDailyVerse, getPoets, getVerseById, getPoetById } from '../../src/data/loader';
import { DailyVerseCard } from '../../src/components/DailyVerseCard';
import { PoetCard } from '../../src/components/PoetCard';
import { DecorativeDivider } from '../../src/components/DecorativeDivider';
import { triggerHaptic } from '../../src/utils/haptics';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, lastRead, refreshUserData, settings } = useApp();
  const [refreshing, setRefreshing] = React.useState(false);

  const dailyVerse = useMemo(() => getDailyVerse(), []);
  const poets = useMemo(() => getPoets(), []);

  const lastReadVerse = useMemo(() => {
    if (!lastRead) return null;
    return getVerseById(lastRead.verseId);
  }, [lastRead]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshUserData();
    setRefreshing(false);
  };

  const handleContinueReading = () => {
    if (lastRead) {
      triggerHaptic('light', settings.hapticsEnabled);
      router.push(`/verse/${lastRead.poetId}/${lastRead.verseNumber}`);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        {/* Header App Banner */}
        <View style={styles.appBanner}>
          <View style={styles.titleRow}>
            <View>
              <Text style={[styles.appTitle, { color: theme.primaryDark }]}>
                ஆத்திச்சூடி
              </Text>
              <Text style={[styles.appSubtitle, { color: theme.textSecondary }]}>
                Tamil Wisdom for Every Day
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/search')}
              style={[styles.headerIconBtn, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              accessibilityLabel="தேடல் (Search)"
            >
              <Ionicons name="search" size={20} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Continue Reading Card if available */}
        {lastReadVerse && (
          <TouchableOpacity
            onPress={handleContinueReading}
            style={[
              styles.continueCard,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.accent,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`தொடர்ந்து படிக்க: பாடல் ${lastReadVerse.number}. ${lastReadVerse.poem}`}
          >
            <View style={styles.continueHeader}>
              <View style={styles.continueBadgeRow}>
                <Ionicons name="bookmark" size={16} color={theme.accent} />
                <Text style={[styles.continueBadge, { color: theme.accent }]}>
                  தொடர்ந்து படிக்க (CONTINUE READING)
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={16} color={theme.primary} />
            </View>
            <Text style={[styles.continuePoet, { color: theme.textMuted }]}>
              {getPoetById(lastReadVerse.poetId)?.nameTa} — பாடல் #{lastReadVerse.number}
            </Text>
            <Text style={[styles.continuePoem, { color: theme.primaryDark }]} numberOfLines={1}>
              "{lastReadVerse.poem}"
            </Text>
          </TouchableOpacity>
        )}

        {/* Daily Verse Featured Card */}
        <DailyVerseCard verse={dailyVerse} />

        {/* Quick Shortcuts Row */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity
            onPress={() => router.push('/daily-verse')}
            style={[styles.shortcutCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="sunny-outline" size={24} color={theme.accent} />
            <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>இன்றைய சிந்தனை</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/collections')}
            style={[styles.shortcutCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="albums-outline" size={24} color={theme.primary} />
            <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>தொகுப்புகள்</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/favorites')}
            style={[styles.shortcutCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          >
            <Ionicons name="heart-outline" size={24} color={theme.danger} />
            <Text style={[styles.shortcutText, { color: theme.textPrimary }]}>விருப்பங்கள்</Text>
          </TouchableOpacity>
        </View>

        <DecorativeDivider symbol="❦" />

        {/* Poets Collections Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            ஆத்திச்சூடி நூல்கள் (Collections)
          </Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
            செம்மொழி நீதி இலக்கியங்கள்
          </Text>
        </View>

        {poets.map(poet => (
          <PoetCard key={poet.id} poet={poet} />
        ))}

        {/* Reflection / Educational Info Card */}
        <View style={[styles.reflectionCard, { backgroundColor: theme.cardSurface, borderColor: theme.borderLight }]}>
          <View style={styles.reflectionHeader}>
            <Ionicons name="sparkles" size={18} color={theme.accent} />
            <Text style={[styles.reflectionTitle, { color: theme.primaryDark }]}>
              நீதி நூல் மரபு (Literary Heritage)
            </Text>
          </View>
          <Text style={[styles.reflectionBody, { color: theme.textSecondary }]}>
            ஆத்திச்சூடி என்பது அகரவரிசையில் அமைந்த வாழ்வியல் நெறிகளை எளிய மொழியில் உணர்த்தும் தமிழ் மரபு.
            ஔவையாரின் பழமையான ஆத்திச்சூடி அறவழியைப் போதிக்கிறது; பாரதியாரின் புதிய ஆத்திச்சூடி நவீன வீரத்தையும் அறிவையும் ஊட்டுகிறது.
          </Text>
        </View>

        <View style={{ height: 24 }} />
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
  appBanner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  headerIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueCard: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  continueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  continueBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  continueBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  continuePoet: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  continuePoem: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 6,
  },
  shortcutCard: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  shortcutText: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  reflectionCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  reflectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  reflectionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  reflectionBody: {
    fontSize: 13,
    lineHeight: 20,
  },
});
