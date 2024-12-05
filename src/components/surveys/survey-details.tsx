import { Card } from '@/components/ui/card';
import { SurveyLinkGenerator } from './survey-link-generator';
import { SurveyAnalytics } from './survey-analytics';
import { SurveyStatus } from './survey-status';
import { Separator } from '@/components/ui/separator';

type SurveyDetailsProps = {
  survey: {
    id: string;
    created_at: string;
    assignee_name: string;
    responses: Array<{
      rating: number;
      timestamp: string;
    }>;
  };
};

export function SurveyDetails({ survey }: SurveyDetailsProps) {
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-4">Survey Details</h2>
          <SurveyStatus
            createdAt={survey.created_at}
            responseCount={survey.responses.length}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Share Survey</h3>
          <SurveyLinkGenerator
            surveyId={survey.id}
            assigneeName={survey.assignee_name}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Analytics</h3>
          <SurveyAnalytics responses={survey.responses} />
        </div>
      </div>
    </Card>
  );
}