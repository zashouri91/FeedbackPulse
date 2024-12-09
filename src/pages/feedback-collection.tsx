import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEnhancedSurveys } from '../lib/hooks/use-enhanced-surveys';
import { ResponseDriver, SurveyTemplate } from '../lib/types';

export default function FeedbackCollection() {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const { templates, submitResponse } = useEnhancedSurveys();

  const [template, setTemplate] = useState<
    SurveyTemplate & { response_drivers: ResponseDriver[] }
  >();
  const [rating, setRating] = useState<number>();
  const [feedback, setFeedback] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!trackingId) return;

    // Decode tracking ID to get template and user IDs
    const [templateId, userId] = atob(trackingId).split(':');
    const foundTemplate = templates?.find(t => t.id === templateId);
    if (foundTemplate) setTemplate(foundTemplate);
  }, [trackingId, templates]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template || !rating || !trackingId) return;

    const [templateId, userId] = atob(trackingId).split(':');

    await submitResponse({
      templateId,
      userId,
      rating,
      feedback,
      drivers: selectedDrivers,
    });

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {template?.thank_you_message || 'Thank you for your feedback!'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">{template?.follow_up_message}</p>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rating Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              How would you rate your experience?
            </h2>
            <div className="flex justify-center space-x-4">
              {template.rating_type === 'numeric' &&
                Array.from(
                  { length: template.scale_max - template.scale_min + 1 },
                  (_, i) => i + template.scale_min
                ).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`w-12 h-12 rounded-full ${rating === n ? 'bg-blue-500 text-white' : 'bg-white border-2 border-gray-300'}`}
                  >
                    {n}
                  </button>
                ))}
              {template.rating_type === 'stars' &&
                Array.from({ length: template.scale_max }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={`text-2xl ${rating && n <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ⭐
                  </button>
                ))}
              {template.rating_type === 'emoji' &&
                ['😡', '😕', '😐', '🙂', '😊'].map((emoji, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    className={`text-2xl ${rating === i + 1 ? 'transform scale-125' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
            </div>
          </div>

          {/* Response Drivers */}
          {template.response_drivers.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                What influenced your rating?
              </h3>
              <div className="space-y-2">
                {template.response_drivers.map(driver => (
                  <label key={driver.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDrivers.includes(driver.id)}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedDrivers([...selectedDrivers, driver.id]);
                        } else {
                          setSelectedDrivers(selectedDrivers.filter(id => id !== driver.id));
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">{driver.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Additional Feedback */}
          <div>
            <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
              Additional Feedback (Optional)
            </label>
            <textarea
              id="feedback"
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Please share any additional thoughts..."
            />
          </div>

          <button
            type="submit"
            disabled={!rating}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
