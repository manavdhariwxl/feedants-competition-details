import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

export function PaymentInfoSection({ payment }) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.leftCard} accessibilityRole="button">
        <View style={styles.playCircle}>
          <Ionicons name="play" size={14} color={colors.white} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={typography.captionBold}>How will you receive{'\n'}prize money?</Text>
          <Text style={typography.small}>Watch video to know more</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.rightCol}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
          <Text style={typography.caption}>Refund policy</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
          <Text style={typography.caption}>Secure payments powered by {payment?.provider || 'Razorpay'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md, gap: spacing.md },
  leftCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    padding: spacing.md,
  },
  playCircle: {
    width: 30,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightCol: { flex: 1, justifyContent: 'center', gap: spacing.sm },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
