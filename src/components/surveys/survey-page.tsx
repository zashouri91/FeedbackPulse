import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RatingSelector } from './rating-selector';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface ResponseDriver {
  id: string;
  name: string;
  description: string;
}

interface SurveyTemplate {
  id: string;
  name: string;
  rating_type: 'stars' | 'smileys' | 'emojis' | 'numbers';
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
}

export default function SurveyPage() {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<SurveyTemplate | null>(null);
  const [drivers, setDrivers] = useState<ResponseDriver[]>([]);
  const [rating, setRating] = useState<number | null>(null);
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [step, setStep] = useState<'rating' | 'drivers' | 'thank-you'>('rating');

  useEffect(() => {
    async function loadSurveyData() {
      if (!templateId) return;

      const [templateResult, driversResult] = await Promise.all([
        supabase.from('survey_templates').select('*').eq('id', templateId).single(),
        supabase
          .from('response_drivers')
          .select('*')
          .eq('template_id', templateId)
          .order('order_index'),
      ]);

      if (templateResult.error) {
        toast.error('Failed to load survey');
        return;
      }

      setTemplate(templateResult.data);
      if (driversResult.data) {
        setDrivers(driversResult.data);
      }
    }

    loadSurveyData();
  }, [templateId]);

  const handleRatingSelect = async (value: number) => {
    setRating(value);
    if (drivers.length > 0) {
      setStep('drivers');
    } else {
      await submitResponse(value, []);
      setStep('thank-you');
    }
  };

  const handleDriverSelect = (driverId: string) => {
    setSelectedDrivers(prev =>
      prev.includes(driverId) ? prev.filter(id => id !== driverId) : [...prev, driverId]
    );
  };

  const submitResponse = async (finalRating: number, finalDrivers: string[]) => {
    if (!templateId) return;

    const { error } = await supabase.from('survey_responses').insert({
      template_id: templateId,
      rating: finalRating,
      selected_drivers: finalDrivers,
      respondent_email: email || null,
    });

    if (error) {
      toast.error('Failed to submit response');
    }
  };

  const handleSubmitDrivers = async () => {
    if (rating === null) return;
    await submitResponse(rating, selectedDrivers);
    setStep('thank-you');
  };

  if (!template) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-6 space-y-6">
        {step === 'rating' && (
          <>
            <h1 className="text-2xl font-bold text-center">How would you rate your experience?</h1>
            <RatingSelector
              type={template.rating_type}
              min={template.scale_min}
              max={template.scale_max}
              onSelect={handleRatingSelect}
              className="my-8"
            />
          </>
        )}

        {step === 'drivers' && (
          <>
            <h2 className="text-xl font-semibold text-center">{template.follow_up_message}</h2>
            <div className="grid grid-cols-2 gap-4 my-6">
              {drivers.map(driver => (
                <Button
                  key={driver.id}
                  variant={selectedDrivers.includes(driver.id) ? 'default' : 'outline'}
                  onClick={() => handleDriverSelect(driver.id)}
                  className="h-auto py-4 text-left"
                >
                  {driver.name}
                </Button>
              ))}
            </div>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email (optional)"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
              />
              <Button onClick={handleSubmitDrivers} className="w-full">
                Submit
              </Button>
            </div>
          </>
        )}

        {step === 'thank-you' && (
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{template.thank_you_message}</h2>
            <p className="text-muted-foreground">Your feedback helps us improve our service.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
