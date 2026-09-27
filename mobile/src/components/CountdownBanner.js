import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';
import { useCountdown, formatDuration } from '../hooks/useCountdown';

export function CountdownBanner({ deadlineIso, serverTimeIso }) {
  const msRemaining = useCountdown(deadlineIso, serverTimeIso);
  const isUrgent = msRemaining < 24 * 60 * 60 * 1000; // under 1 day

  return (
    <View style={styles.banner}>
      <View style={styles.left}>
        <Ionicons name="hourglass-outline" size={16} color={colors.primary} />
        <Text style={styles.label}>Registration closes in</Text>
      </View>
      <Text style={styles.time}>{formatDuration(msRemaining)}</Text>
      {isUrgent ? (
        <View style={styles.hurryRow}>
          <Ionicons name="alarm-outline" size={14} color={colors.warning} />
          <Text style={styles.hurryText}>Hurry up!</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.mint,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    flexWrap: 'wrap',
    gap: 6,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { ...typography.captionBold, color: colors.primary },
  time: { ...typography.bodyBold, color: colors.textPrimary },
  hurryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hurryText: { ...typography.captionBold, color: colors.warning },
});
