export type Role = 'pt' | 'user';

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  bio?: string;
  password?: string;
  notification_email?: string;
  email_notifications_enabled?: number;
  contract_start?: string;
  contract_end?: string;
  experience_years?: number;
  age?: number;
}

export interface Message {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string;
  is_read: number;
  sender_name?: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  muscle_group?: string;
}

export interface PlanItem {
  id?: number;
  day?: string;
  exercise_name: string;
  category: string;
  sets: string;
  reps: string;
  weight?: string;
  pt_notes: string;
  user_notes?: string;
  recovery?: string;
  notes?: string;
}

export interface Plan {
  id: number;
  user_id: number;
  pt_id: number;
  created_at: string;
  items: PlanItem[];
}

export interface ModelPlan {
  id: number;
  name: string;
  description: string;
  created_at: string;
  items?: PlanItem[];
}

