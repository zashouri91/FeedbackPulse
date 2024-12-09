import { z } from 'zod';

export type RatingType = 'numeric' | 'stars' | 'emoji';

export interface SurveyTemplate {
  id: string;
  name: string;
  description: string | null;
  rating_type: RatingType;
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
  assigned_users: string[];
  assigned_groups: string[];
  assigned_locations: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ResponseDriver {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  order_index: number;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  template_id: string;
  rating: number;
  selected_drivers: string[];
  respondent_email: string | null;
  feedback: string | null;
  created_at: string;
}

// Zod schema for runtime validation
export const surveyTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  description: z.string().nullable(),
  rating_type: z.enum(['numeric', 'stars', 'emoji']).default('numeric'),
  scale_min: z.number().min(0).max(10).default(1),
  scale_max: z.number().min(0).max(10).default(5),
  thank_you_message: z.string().default('Thank you for your feedback!'),
  follow_up_message: z.string().default('Is there anything else you would like to share?'),
  assigned_users: z.array(z.string().uuid()).default([]),
  assigned_groups: z.array(z.string().uuid()).default([]),
  assigned_locations: z.array(z.string().uuid()).default([]),
});
