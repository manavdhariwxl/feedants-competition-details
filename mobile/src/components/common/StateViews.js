import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme/theme';

export function LoadingView({ label = 'Loading competition…' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[typography.body, styles.spacedTop]}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={40} color={colors.danger} />
      <Text style={[typography.bodyBold, styles.spacedTop, styles.centerText]}>Something went wrong</Text>
      <Text style={[typography.caption, styles.centerText]}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyView({ message = 'No competitions are available right now.' }) {
  return (
    <View style={styles.center}>
      <Ionicons name="trophy-outline" size={40} color={colors.textMuted} />
      <Text style={[typography.body, styles.spacedTop, styles.centerText]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  spacedTop: { marginTop: spacing.md },
  centerText: { textAlign: 'center', paddingHorizontal: spacing.lg },
  retryButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: 999,
  },
  retryText: { color: colors.white, fontWeight: '700' },
});
