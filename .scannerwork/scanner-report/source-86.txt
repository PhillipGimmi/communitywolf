export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// Database Types based on your schema
export type UserRoleLevel = 'citizen' | 'authority' | 'admin';
export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical' | 'emergency';
export type ReportStatus = 'pending' | 'verified' | 'investigating' | 'resolved' | 'false_alarm';

export interface Database {
  public: {
    Tables: {
      countries: {
        Row: {
          id: string
          name: string
          code: string
          timezone: string
          currency: string
          emergency_number: string | null
          active: boolean
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          code: string
          timezone: string
          currency?: string
          emergency_number?: string | null
          active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          code?: string
          timezone?: string
          currency?: string
          emergency_number?: string | null
          active?: boolean
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
      user_roles: {
        Row: {
          id: string
          name: UserRoleLevel
          level: number
          description: string | null
          permissions: Json
          can_create_reports: boolean
          can_verify_reports: boolean
          can_manage_users: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: UserRoleLevel
          level: number
          description?: string | null
          permissions?: Json
          can_create_reports?: boolean
          can_verify_reports?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: UserRoleLevel
          level?: number
          description?: string | null
          permissions?: Json
          can_create_reports?: boolean
          can_verify_reports?: boolean
          can_manage_users?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          role_id: string
          country_id: string
          verified: boolean
          phone_number: string | null
          last_seen_at: string | null
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          role_id: string
          country_id: string
          verified?: boolean
          phone_number?: string | null
          last_seen_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          role_id?: string
          country_id?: string
          verified?: boolean
          phone_number?: string | null
          last_seen_at?: string | null
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      crime_reports: {
        Row: {
          id: string
          country_id: string
          created_by: string
          datetime: string
          location: Json
          address: string | null
          type: string
          severity: ReportSeverity
          status: ReportStatus
          official_report: boolean
          user_generated: boolean
          keywords: string[] | null
          summary: string | null
          description: string | null
          source_url: string | null
          evidence_urls: string[] | null
          witness_statements: string[] | null
          investigation_notes: string | null
          resolved_at: string | null
          verified_by: string | null
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          country_id: string
          created_by: string
          datetime: string
          location: Json
          address?: string | null
          type: string
          severity?: ReportSeverity
          status?: ReportStatus
          official_report?: boolean
          user_generated?: boolean
          keywords?: string[] | null
          summary?: string | null
          description?: string | null
          source_url?: string | null
          evidence_urls?: string[] | null
          witness_statements?: string[] | null
          investigation_notes?: string | null
          resolved_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          country_id?: string
          created_by?: string
          datetime?: string
          location?: Json
          address?: string | null
          type?: string
          severity?: ReportSeverity
          status?: ReportStatus
          official_report?: boolean
          user_generated?: boolean
          keywords?: string[] | null
          summary?: string | null
          description?: string | null
          source_url?: string | null
          evidence_urls?: string[] | null
          witness_statements?: string[] | null
          investigation_notes?: string | null
          resolved_at?: string | null
          verified_by?: string | null
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Additional interfaces for convenience
export interface Country {
  id: string;
  name: string;
  code: string;
  timezone: string;
  currency: string;
  emergency_number?: string;
  active: boolean;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  name: UserRoleLevel;
  level: number;
  description?: string;
  permissions: string[];
  can_create_reports: boolean;
  can_verify_reports: boolean;
  can_manage_users: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  country_id: string;
  verified: boolean;
  phone_number?: string;
  last_seen_at?: string;
  preferences: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface CrimeReport {
  id: string;
  country_id: string;
  created_by: string;
  datetime: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address?: string;
  type: string;
  severity: ReportSeverity;
  status: ReportStatus;
  official_report: boolean;
  user_generated: boolean;
  keywords?: string[];
  summary?: string;
  description?: string;
  source_url?: string;
  evidence_urls?: string[];
  witness_statements?: string[];
  investigation_notes?: string;
  resolved_at?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}