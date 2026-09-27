import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme/theme';

const TABS = [
  { key: 'about', label: 'About Competition' },
  { key: 'judging', label: 'Judging Parameters' },
  { key: 'rules', label: 'Rules & Eligibility' },
];

const COLLAPSED_LINES = 3;

export function InfoTabs({ about, judgingParameters, rulesAndEligibility }) {
  const [activeTab, setActiveTab] = useState('about');
  const [expanded, setExpanded] = useState(false);

  const content = { about, judging: judgingParameters, rules: rulesAndEligibility }[activeTab] || '';

  return (
    <Card>
      <View style={styles.tabRow}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabButton}
            onPress={() => {
              setActiveTab(tab.key);
              setExpanded(false);
            }}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            {activeTab === tab.key ? <View style={styles.tabUnderline} /> : null}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[typography.body, styles.content]} numberOfLines={expanded ? undefined : COLLAPSED_LINES}>
        {content || 'No details provided yet.'}
      </Text>

      {content && content.length > 120 ? (
        <TouchableOpacity style={styles.viewMoreRow} onPress={() => setExpanded((v) => !v)}>
          <Text style={styles.viewMoreText}>{expanded ? 'View less' : 'View more'}</Text>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabButton: { paddingBottom: spacing.sm },
  tabLabel: { ...typography.caption, fontWeight: '600' },
  tabLabelActive: { color: colors.primary },
  tabUnderline: { height: 2, backgroundColor: colors.primary, marginTop: 6, borderRadius: 2 },
  content: { color: colors.textSecondary, lineHeight: 20 },
  viewMoreRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: spacing.sm },
  viewMoreText: { ...typography.captionBold, color: colors.primary },
});
