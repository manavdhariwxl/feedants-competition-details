import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../theme/theme';

export function PreviousWinnersCarousel({ winners }) {
  if (!winners || winners.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <Text style={[typography.h2, styles.heading]}>Previous Winners</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {winners.map((winner, index) => (
          <TouchableOpacity key={`${winner.name}-${index}`} style={styles.item} accessibilityRole="button">
            {winner.imageUrl ? (
              <Image source={{ uri: winner.imageUrl }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoFallback]}>
                <Ionicons name="person" size={22} color={colors.textMuted} />
              </View>
            )}
            <View style={styles.playBadge}>
              <Ionicons name="play" size={10} color={colors.white} />
            </View>
            <Text numberOfLines={1} style={styles.name}>
              {winner.name}
            </Text>
            <Text style={styles.rankLabel}>{winner.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const CARD_WIDTH = 88;

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing.md },
  heading: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  scrollContent: { paddingHorizontal: spacing.lg, gap: spacing.md },
  item: { width: CARD_WIDTH },
  photo: { width: CARD_WIDTH, height: CARD_WIDTH * 1.15, borderRadius: radii.md, backgroundColor: colors.background },
  photoFallback: { alignItems: 'center', justifyContent: 'center' },
  playBadge: {
    position: 'absolute',
    top: CARD_WIDTH * 1.15 - 20,
    left: CARD_WIDTH / 2 - 12,
    width: 24,
    height: 24,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  name: { ...typography.captionBold, marginTop: 6, textAlign: 'center' },
  rankLabel: { ...typography.small, textAlign: 'center' },
});
