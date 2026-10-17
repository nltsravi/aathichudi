import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export function triggerHaptic(type: 'light' | 'medium' | 'success' = 'light', enabled: boolean = true) {
  if (!enabled || Platform.OS === 'web') return;

  try {
    if (type === 'light') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else if (type === 'medium') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (type === 'success') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  } catch {
    // Graceful fallback if haptics fail
  }
}
