import React, { useState } from 'react';
import * as Clipboard from 'expo-clipboard';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

export function ReferralSection({ referral }) {
  const [copied, setCopied] = useState(false);
  if (!referral || !referral.link) return null;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referral.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Ionicons name="megaphone-outline" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={typography.bodyBold}>Refer & Earn more discount</Text>
        </View>
      </View>

      <View style={styles.linkRow}>
        <Text style={styles.linkText} numberOfLines={1}>
          {referral.link}
        </Text>
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
          <Text style={styles.copyButtonText}>{copied ? 'Copied!' : 'Copy Link'}</Text>
        </TouchableOpacity>
      </View>

      {referral.rewardAmount ? (
        <Text style={typography.small}>You earn ₹{referral.rewardAmount} for every signup</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.mint,
    borderRadius: radii.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  linkText: {
    flex: 1,
    ...typography.caption,
    backgroundColor: colors.card,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  copyButton: { backgroundColor: colors.primary, borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  copyButtonText: { color: colors.white, fontWeight: '700', fontSize: 12 },
});
