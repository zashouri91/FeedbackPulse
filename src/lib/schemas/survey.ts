import { z } from 'zod';

export const surveySchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional().nullable(),
  rating_type: z.enum(['numeric', 'stars', 'emoji']),
  scale_min: z.coerce.number().min(0).max(10),
  scale_max: z.coerce.number().min(0).max(10),
  thank_you_message: z.string(),
  follow_up_message: z.string(),
  assigned_users: z.array(z.string()).nullable().default([]),
  assigned_groups: z.array(z.string()).nullable().default([]),
  assigned_locations: z.array(z.string()).nullable().default([]),
});

export type SurveyForm = z.infer<typeof surveySchema>;
