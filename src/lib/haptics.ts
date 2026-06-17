import * as Haptics from 'expo-haptics';

export async function triggerMediumImpact() {
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
}

export async function triggerSelectionFeedback() {
  await Haptics.selectionAsync();
}
