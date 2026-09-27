import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/theme';
import { useCompetitionDetails } from '../hooks/useCompetitionDetails';
import { LoadingView, ErrorView, EmptyView } from '../components/common/StateViews';
import { HeaderBar } from '../components/HeaderBar';
import { CompetitionSummaryCard } from '../components/CompetitionSummaryCard';
import { JudgeCard } from '../components/JudgeCard';
import { CountdownBanner } from '../components/CountdownBanner';
import { ImportantDatesGrid } from '../components/ImportantDatesGrid';
import { PreviousWinnersCarousel } from '../components/PreviousWinnersCarousel';
import { InfoTabs } from '../components/InfoTabs';
import { RewardsTable, DisclaimerBanner } from '../components/RewardsAndDisclaimer';
import { PaymentInfoSection } from '../components/PaymentInfoSection';
import { ReferralSection } from '../components/ReferralSection';
import { TestimonialsRow, AdPlaceholder } from '../components/MiscRows';
import { BottomCTA } from '../components/BottomCTA';
import { BottomTabBar } from '../components/BottomTabBar';

export function CompetitionDetailsScreen() {
  const { status, competition, error, reload, register, registering, registerError } = useCompetitionDetails();

  if (status === 'loading') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (status === 'error') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HeaderBar />
        <ErrorView message={error?.message} onRetry={reload} />
      </SafeAreaView>
    );
  }

  if (status === 'empty') {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <HeaderBar />
        <EmptyView />
      </SafeAreaView>
    );
  }

  const showCountdown = competition.lifecycle.stage === 'REGISTRATION_OPEN';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <HeaderBar />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={reload} tintColor={colors.primary} />}
      >
        <CompetitionSummaryCard competition={competition} />
        <JudgeCard judge={competition.judge} />

        {showCountdown ? (
          <CountdownBanner deadlineIso={competition.importantDates.registrationDeadline} serverTimeIso={competition.serverTime} />
        ) : null}

        <ImportantDatesGrid dates={competition.importantDates} />
        <PreviousWinnersCarousel winners={competition.previousWinners} />

        <InfoTabs
          about={competition.about}
          judgingParameters={competition.judgingParameters}
          rulesAndEligibility={competition.rulesAndEligibility}
        />

        <RewardsTable rewards={competition.rewards} currency={competition.currency} />
        <DisclaimerBanner text={competition.disclaimer} />

        <PaymentInfoSection payment={competition.payment} />
        <ReferralSection referral={competition.referral} />

        <TestimonialsRow />
        <AdPlaceholder />
      </ScrollView>

      <View style={styles.footer}>
        <BottomCTA
          cta={competition.cta}
          registering={registering}
          onPress={register}
          errorMessage={registerError?.message}
        />
        <BottomTabBar />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: { paddingBottom: 12 },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
