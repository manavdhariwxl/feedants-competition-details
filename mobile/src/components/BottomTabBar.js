import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

const TABS = [
  { key: 'home', label: 'Home', icon: 'home-outline' },
  { key: 'explore', label: 'Explore', icon: 'search-outline' },
  { key: 'add', label: '', icon: 'add' },
  { key: 'competitions', label: 'Competitions', icon: 'trophy-outline', active: true },
  { key: 'profile', label: 'Profile', icon: 'person-outline' },
];

/**
 * The design mock shows this as part of the app's persistent shell, not the
 * competition-details screen itself. It's included here purely for visual fidelity to
 * the provided screenshot; wiring it to real navigation between screens is out of
 * scope for this single-screen assignment (see README).
 */
export function BottomTabBar() {
  return (
    <View style={styles.row}>
      {TABS.map((tab) =>
        tab.key === 'add' ? (
          <View key={tab.key} style={styles.addButton}>
            <Ionicons name="add" size={22} color={colors.white} />
          </View>
        ) : (
          <TouchableOpacity key={tab.key} style={styles.tab} accessibilityRole="button">
            <Ionicons name={tab.icon} size={20} color={tab.active ? colors.primary : colors.textMuted} />
            <Text style={[styles.label, tab.active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: spacing.sm,
    backgroundColor: colors.card,
  },
  tab: { alignItems: 'center', gap: 2, flex: 1 },
  label: { ...typography.small },
  labelActive: { color: colors.primary, fontWeight: '700' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    backgroundColor: colors.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
});
