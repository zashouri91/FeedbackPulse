import { trackEvent } from '@/lib/monitoring';

export function trackSurveyCreated(surveyId: string) {
  trackEvent('survey.created', { surveyId });
}

export function trackSurveyResponse(surveyId: string, rating: number) {
  trackEvent('survey.response', { surveyId, rating });
}

export function trackUserCreated(userId: string) {
  trackEvent('user.created', { userId });
}

export function trackLocationCreated(locationId: string) {
  trackEvent('location.created', { locationId });
}

export function trackGroupCreated(groupId: string) {
  trackEvent('group.created', { groupId });
}
