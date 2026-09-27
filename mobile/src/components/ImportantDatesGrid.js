import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, spacing, typography } from '../theme/theme';
import { formatDate, formatTime } from '../utils/format';

function DateItem({ icon, label, iso }) {
  return (
    <View style={styles.item}>
      <View style={styles.iconWrap}>{icon}</View>
      <View>
        <Text style={typography.caption}>{label}</Text>
        <Text style={typography.bodyBold}>{formatDate(iso)}</Text>
        <Text style={typography.small}>{formatTime(iso)}</Text>
      </View>
    </View>
  );
}

export function ImportantDatesGrid({ dates }) {
  return (
    <Card>
      <Text style={[typography.h2, styles.heading]}>Important Dates</Text>
      <View style={styles.grid}>
        <DateItem
          icon={<Ionicons name="calendar-outline" size={16} color={colors.primary} />}
          label="Register Before"
          iso={dates.registrationDeadline}
        />
        <DateItem
          icon={<Feather name="send" size={15} color={colors.primary} />}
          label="Submission Starts"
          iso={dates.submissionStartsAt}
        />
        <DateItem
          icon={<Feather name="upload" size={15} color={colors.primary} />}
          label="Submission Ends"
          iso={dates.submissionEndsAt}
        />
        <DateItem
          icon={<MaterialCommunityIcons name="trophy-outline" size={16} color={colors.primary} />}
          label="Result Date"
          iso={dates.resultDate}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.lg },
  item: { flexDirection: 'row', width: '50%', gap: spacing.sm, paddingRight: spacing.sm },
  iconWrap: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
});
