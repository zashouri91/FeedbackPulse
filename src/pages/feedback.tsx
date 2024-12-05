import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FeedbackForm } from '@/components/surveys/feedback-form';
import { Card } from '@/components/ui/card';
import { CheckCircle2Icon } from 'lucide-react';

export function FeedbackPage() {
  const [searchParams] = useSearchParams();
  const surveyId = searchParams.get('id');
  const submitted = searchParams.get('submitted') === 'true';

  useEffect(() => {
    // Track feedback page view
    // This could be integrated with analytics later
  }, [surveyId]);

  if (!surveyId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-6 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">
            Invalid Survey Link
          </h1>
          <p className="text-muted-foreground">
            This feedback link appears to be invalid or has expired.
          </p>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <CheckCircle2Icon className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Thank You!</h1>
          <p className="text-muted-foreground">
            Your feedback has been successfully recorded.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <FeedbackForm surveyId={surveyId} />
    </div>
  );
}