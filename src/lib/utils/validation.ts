import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const surveySchema = z.object({
  assignee_id: z.string().min(1, 'Assignee is required'),
  group_id: z.string().min(1, 'Group is required'),
  location_id: z.string().min(1, 'Location is required'),
});

export const locationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  managers: z.array(z.string()),
});

export const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  manager_id: z.string().min(1, 'Manager is required'),
  location_id: z.string().min(1, 'Location is required'),
});

export const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  phone_number: z.string().min(1, 'Phone number is required'),
  role: z.enum(['super_admin', 'admin', 'manager', 'user']),
  location_id: z.string().min(1, 'Location is required'),
  groups: z.array(z.string()),
});
