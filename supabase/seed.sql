-- Create initial super admin user
insert into auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role
) values (
  gen_random_uuid(),
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"role": "super_admin"}',
  now(),
  now(),
  'authenticated'
);

-- Insert default survey templates
insert into public.templates (name, description, questions) values
  ('Customer Satisfaction', 'Basic customer satisfaction survey', '[{"type": "rating", "text": "How satisfied are you with our service?", "required": true}]'),
  ('Service Feedback', 'Collect feedback about service quality', '[{"type": "rating", "text": "How would you rate our service quality?", "required": true}]'),
  ('Product Feedback', 'Gather feedback about product experience', '[{"type": "rating", "text": "How likely are you to recommend our product?", "required": true}]');