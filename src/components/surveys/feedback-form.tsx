import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmojiRating } from './emoji-rating';
import { useSubmitFeedback } from '@/lib/hooks/use-feedback';
import { Loader2Icon } from 'lucide-react';

type FeedbackFormProps = {
  surveyId: string;
};

export function FeedbackForm({ surveyId }: FeedbackFormProps) {
  const [rating, setRating] = useState<number | null>(null);
  const { submitFeedback, isPending } = useSubmitFeedback();

  const handleSubmit = async () => {
    if (rating === null) return;
    await submitFeedback.mutateAsync({
      survey_id: surveyId,
      rating,
    });
  };

  return (
    <Card className="max-w-3xl mx-auto p-12 shadow-lg">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          How was your experience?
        </h1>
        <p className="text-lg text-muted-foreground">
          Your feedback helps us improve our service and deliver better experiences
        </p>
      </div>

      <EmojiRating
        value={rating}
        onChange={setRating}
        disabled={isPending}
      />

      <div className="mt-12 text-center">
        <Button
          size="lg"
          onClick={handleSubmit}
          disabled={rating === null || isPending}
          className="px-8 py-6 text-lg"
        >
          {isPending && <Loader2Icon className="mr-2 h-5 w-5 animate-spin" />}
          Submit Feedback
        </Button>
      </div>
    </Card>
  );
}