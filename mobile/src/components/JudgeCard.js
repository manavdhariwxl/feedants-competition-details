import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, radii, spacing, typography } from '../theme/theme';

export function JudgeCard({ judge }) {
  if (!judge) return null;

  return (
    <Card style={styles.row}>
      {judge.photoUrl ? (
        <Image source={{ uri: judge.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarFallback]}>
          <Ionicons name="person" size={24} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.info}>
        <Text style={typography.caption}>Judge</Text>
        <Text style={typography.h2}>{judge.name}</Text>
        <Text style={typography.caption}>{judge.title}</Text>
        {judge.experienceYears ? (
          <Text style={typography.caption}>{judge.experienceYears}+ Years of Experience</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.videoButton} accessibilityRole="button" accessibilityLabel="Play judge intro video">
        <View style={styles.playCircle}>
          <Ionicons name="play" size={16} color={colors.white} />
        </View>
        <Text style={styles.videoLabel}>Intro Video</Text>
      </TouchableOpacity>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: radii.pill, marginRight: spacing.md },
  avatarFallback: { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  videoButton: { alignItems: 'center', gap: 4 },
  playCircle: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoLabel: { ...typography.small, color: colors.primary },
});
