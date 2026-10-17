import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

export interface ImageShareOptions {
  title?: string;
}

export async function captureAndShareVerseCard(
  viewRef: React.RefObject<any>,
  options: ImageShareOptions = {}
): Promise<{ success: boolean; uri?: string }> {
  try {
    if (!viewRef.current) {
      throw new Error('View reference is not attached');
    }

    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1.0,
      result: 'tmpfile',
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: options.title || 'Share to WhatsApp Status / Social Media',
        UTI: 'public.png',
      });
    }

    return { success: true, uri };
  } catch (error) {
    console.warn('Verse card image share error:', error);
    return { success: false };
  }
}
