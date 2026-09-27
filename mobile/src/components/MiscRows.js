import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

export function TestimonialsRow() {
  return (
    <TouchableOpacity style={styles.row} accessibilityRole="button">
      <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
      <View style={{ flex: 1 }}>
        <Text style={typography.bodyBold}>Hear From Our Users</Text>
        <Text style={typography.caption}>See what participants say about Feedants</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

/** Placeholder slot for a future ad unit — intentionally inert, matching the design's "Ad Here" block. */
export function AdPlaceholder() {
  return (
    <View style={styles.adBox}>
      <Ionicons name="megaphone-outline" size={16} color={colors.textMuted} />
      <Text style={styles.adText}>Ad Here</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  adBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
  },
  adText: { ...typography.caption, color: colors.textMuted },
});
