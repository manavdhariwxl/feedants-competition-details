import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, radii, spacing, typography } from '../theme/theme';
import { formatCurrency } from '../utils/format';

export function CompetitionSummaryCard({ competition }) {
  const { title, tags, hasCertificate, prizePool, entryFee, currency, capacity, registration } = competition;
  const bookedRatio = capacity.total > 0 ? capacity.booked / capacity.total : 0;

  return (
    <Card>
      <View style={styles.topRow}>
        <Text style={[typography.h1, styles.title]}>{title}</Text>
        {registration.isRegistered ? (
          <View style={styles.registeredBadge}>
            <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
            <Text style={styles.registeredText}>Registered</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.tagsRow}>
        {tags.map((tag) => (
          <View key={tag} style={styles.tagPill}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
        {hasCertificate ? (
          <View style={styles.certRow}>
            <MaterialCommunityIcons name="certificate-outline" size={15} color={colors.primary} />
            <Text style={styles.certText}>Winners get certificate</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricBlock}>
          <Text style={typography.caption}>Prize Pool</Text>
          <Text style={styles.metricValue}>{formatCurrency(prizePool, currency)}</Text>
        </View>
        <View style={styles.metricBlock}>
          <Text style={typography.caption}>Entry Fee</Text>
          <Text style={styles.metricValue}>{formatCurrency(entryFee, currency)}</Text>
        </View>
        <View style={styles.spotsBlock}>
          <View style={styles.spotsHeaderRow}>
            <Ionicons name="people-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.spotsHeaderText}>
              {capacity.isFull ? 'Spots full' : `Only ${capacity.left} spots left`}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.min(bookedRatio * 100, 100)}%` }]} />
          </View>
          <Text style={typography.small}>
            {capacity.booked} / {capacity.total} Booked
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { flex: 1, marginRight: spacing.sm },
  registeredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.mint,
    borderWidth: 1,
    borderColor: colors.mintBorder,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
  },
  registeredText: { ...typography.captionBold, color: colors.primary },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  tagPill: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  tagText: { ...typography.caption, color: colors.textPrimary },
  certRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  certText: { ...typography.caption, color: colors.primary },
  metricsRow: { flexDirection: 'row', marginTop: spacing.lg, gap: spacing.lg },
  metricBlock: { flex: 1 },
  metricValue: { ...typography.h2, marginTop: 2 },
  spotsBlock: { flex: 1.4 },
  spotsHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  spotsHeaderText: { ...typography.captionBold, color: colors.textSecondary },
  progressTrack: {
    height: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: radii.pill },
});
