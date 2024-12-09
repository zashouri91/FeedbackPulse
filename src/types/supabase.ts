export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          role: string;
          groups: string[];
          location_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: string;
          groups?: string[];
          location_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          role?: string;
          groups?: string[];
          location_id?: string;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          managers: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          managers: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          managers?: string[];
          created_at?: string;
        };
      };
      surveys: {
        Row: {
          id: string;
          creator_id: string;
          assignee_id: string;
          group_id: string;
          location_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          assignee_id: string;
          group_id: string;
          location_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          creator_id?: string;
          assignee_id?: string;
          group_id?: string;
          location_id?: string;
          created_at?: string;
        };
      };
      responses: {
        Row: {
          id: string;
          survey_id: string;
          rating: number;
          timestamp: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          rating: number;
          timestamp?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          rating?: number;
          timestamp?: string;
        };
      };
    };
  };
}
