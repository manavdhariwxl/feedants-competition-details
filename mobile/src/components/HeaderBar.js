import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

/**
 * The design shows a back button and an English/Hindi language toggle in the header.
 * This assignment is scoped to a single screen (there is nowhere to "go back" to, and
 * no second locale to switch into), so both are rendered for visual fidelity but are
 * intentionally non-functional beyond a local, cosmetic toggle — see README for scope
 * notes on what a production build would add here (real navigation + i18n).
 */
export function HeaderBar({ onBack }) {
  const [lang, setLang] = useState('ENG');

  return (
    <View style={styles.row}>
      <TouchableOpacity style={styles.backRow} onPress={onBack} accessibilityRole="button" accessibilityLabel="Go back">
        <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
        <Text style={styles.backText}>Go back</Text>
      </TouchableOpacity>

      <View style={styles.langToggle}>
        <TouchableOpacity
          style={[styles.langPill, lang === 'ENG' && styles.langPillActive]}
          onPress={() => setLang('ENG')}
        >
          <Text style={[styles.langText, lang === 'ENG' && styles.langTextActive]}>ENG</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.langPill, lang === 'HIN' && styles.langPillActive]}
          onPress={() => setLang('HIN')}
        >
          <Text style={[styles.langText, lang === 'HIN' && styles.langTextActive]}>हिंदी</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backText: { ...typography.bodyBold },
  langToggle: {
    flexDirection: 'row',
    backgroundColor: colors.mint,
    borderRadius: radii.pill,
    padding: 3,
  },
  langPill: { paddingHorizontal: spacing.md, paddingVertical: 4, borderRadius: radii.pill },
  langPillActive: { backgroundColor: colors.primary },
  langText: { ...typography.captionBold, color: colors.primary },
  langTextActive: { color: colors.white },
});
