import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatCurrency } from '../utils/format';

function rankIcon(rank) {
  if (rank === 1) return <Ionicons name="trophy" size={16} color={colors.gold} />;
  if (rank === 2) return <Ionicons name="medal" size={16} color={colors.silver} />;
  if (rank === 3) return <Ionicons name="medal" size={16} color={colors.bronze} />;
  return <Ionicons name="star-outline" size={15} color={colors.textMuted} />;
}

export function RewardsTable({ rewards, currency }) {
  if (!rewards || rewards.length === 0) return null;

  return (
    <Card>
      <View style={styles.headerRow}>
        <Text style={typography.h2}>Rewards</Text>
        <Text style={typography.caption}>(All Positions)</Text>
      </View>
      {rewards.map((reward) => (
        <View key={reward.rank} style={styles.row}>
          <View style={styles.left}>
            {rankIcon(reward.rank)}
            <Text style={typography.body}>{reward.label}</Text>
          </View>
          <Text style={typography.bodyBold}>{formatCurrency(reward.amount, currency)}</Text>
        </View>
      ))}
    </Card>
  );
}

export function DisclaimerBanner({ text }) {
  if (!text) return null;
  return (
    <View style={styles.disclaimer}>
      <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
      <Text style={styles.disclaimerText}>
        <Text style={styles.disclaimerBold}>Disclaimer: </Text>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderTopWidth: 1,
    borderTopColor: colors.background,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  disclaimer: {
    flexDirection: 'row',
    gap: spacing.sm,
    backgroundColor: colors.mint,
    borderRadius: radii.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  disclaimerText: { ...typography.caption, flex: 1, color: colors.textPrimary, lineHeight: 18 },
  disclaimerBold: { fontWeight: '700', color: colors.primary },
});
