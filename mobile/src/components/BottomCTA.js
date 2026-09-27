import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../theme/theme';

/**
 * Renders exactly what the backend's `cta` object says (label / secondaryLabel /
 * enabled / action) — this component makes no state decisions of its own. That keeps
 * the four lifecycle states + full/registered/etc. combinations correct in exactly one
 * place (the server), instead of being re-derived (and risking drifting out of sync)
 * on the client.
 */
export function BottomCTA({ cta, registering, onPress, errorMessage }) {
  const disabled = !cta.enabled || registering;
  const handlePress = cta.action === 'REGISTER' ? onPress : undefined;

  return (
    <View style={styles.wrapper}>
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        disabled={disabled || !handlePress}
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
      >
        {registering ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.buttonLabel}>{cta.label}</Text>
        )}
        {cta.secondaryLabel && !registering ? <Text style={styles.secondaryLabel}>{cta.secondaryLabel}</Text> : null}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: colors.textMuted },
  buttonLabel: { color: colors.white, fontSize: 15, fontWeight: '700' },
  secondaryLabel: { color: colors.mint, fontSize: 11, marginTop: 2 },
  error: { ...typography.caption, color: colors.danger, textAlign: 'center', marginBottom: spacing.xs },
});
