export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  title?: string;
  phone?: string;
  groups: string[];
  primary_location_id?: string;
  locations: string[];
  created_at: string;
}

export interface SurveyTemplate {
  id: string;
  name: string;
  description?: string;
  rating_type: 'numeric' | 'stars' | 'emoji';
  scale_min: number;
  scale_max: number;
  thank_you_message: string;
  follow_up_message: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_users: string[];
  assigned_groups: string[];
  assigned_locations: string[];
}

export interface Location {
  id: string;
  name: string;
  description?: string;
  parent_location_id?: string;
  created_at: string;
}

export interface ResponseDriver {
  id: string;
  template_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface SurveyResponse {
  id: string;
  template_id: string;
  user_id: string;
  group_id?: string;
  location_id?: string;
  rating: number;
  feedback?: string;
  selected_drivers: string[];
  created_at: string;
}

export interface Analytics {
  groupBy: 'user' | 'group' | 'location';
  filters: {
    dateRange?: { start: string; end: string };
    users?: string[];
    groups?: string[];
    locations?: string[];
    ratingRange?: { min: number; max: number };
    drivers?: string[];
  };
  metrics: {
    averageRating: number;
    responseCount: number;
    topDrivers: { id: string; count: number }[];
    ratingDistribution: { rating: number; count: number }[];
  };
}
