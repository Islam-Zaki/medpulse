// FIX: import React to use React.ReactNode
import React from 'react';

export type Language = 'ar' | 'en';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface SiteConfig {
  fonts: {
    ar: { headings: string; body: string };
    en: { headings: string; body: string };
  };
  home: {
    hero_title_ar: string; hero_title_en: string;
    hero_subtitle_ar: string; hero_subtitle_en: string;
    hero_desc_ar: string; hero_desc_en: string;
    about_title_ar: string; about_title_en: string;
    about_desc_ar: string; about_desc_en: string;
    about_p1_ar: string; about_p1_en: string;
    about_p2_ar: string; about_p2_en: string;
    about_p3_ar: string; about_p3_en: string;
    about_p4_ar: string; about_p4_en: string;
    founder_sec_title_ar: string; founder_sec_title_en: string;
    founder_sec_desc_ar: string; founder_sec_desc_en: string;
  };
  about: {
    h1_ar: string; h1_en: string;
    subtitle_ar: string; subtitle_en: string;
    intro_title_ar: string; intro_title_en: string;
    intro_p1_ar: string; intro_p1_en: string;
    intro_p2_ar: string; intro_p2_en: string;
    mission_title_ar: string; mission_title_en: string;
    mission_summary_ar: string; mission_summary_en: string;
    vision_title_ar: string; vision_title_en: string;
    vision_text_ar: string; vision_text_en: string;
    cta_title_ar: string; cta_title_en: string;
    cta_desc_ar: string; cta_desc_en: string;
    cta_btn_ar: string; cta_btn_en: string;
  };
  founder: {
    name_ar: string; name_en: string;
    main_title_ar: string; main_title_en: string;
    intro_title_ar: string; intro_title_en: string;
    intro_ar: string; intro_en: string;
    quote_ar: string; quote_en: string;
    exp_title_ar: string; exp_title_en: string;
    exp_current_title_ar: string; exp_current_title_en: string;
    academic_title_ar: string; academic_title_en: string;
    academic_summary_ar: string; academic_summary_en: string;
    profile_title_ar: string; profile_title_en: string;
    profile_item1_label_ar: string; profile_item1_label_en: string;
    profile_item1_val_ar: string; profile_item1_val_en: string;
    profile_item2_label_ar: string; profile_item2_label_en: string;
    profile_item2_val_ar: string; profile_item2_val_en: string;
    profile_item3_label_ar: string; profile_item3_label_en: string;
    profile_item3_val_ar: string; profile_item3_val_en: string;
    profile_item4_label_ar: string; profile_item4_label_en: string;
    profile_item4_val_ar: string; profile_item4_val_en: string;
  };
  contact: {
    h1_ar: string; h1_en: string;
    intro_ar: string; intro_en: string;
    why_title_ar: string; why_title_en: string;
    why_p1_title_ar: string; why_p1_title_en: string;
    why_p1_i1_ar: string; why_p1_i1_en: string;
    why_p1_i2_ar: string; why_p1_i2_en: string;
    why_p2_title_ar: string; why_p2_title_en: string;
    why_p2_i1_ar: string; why_p2_i1_en: string;
    why_p2_i2_ar: string; why_p2_i2_en: string;
    why_p3_title_ar: string; why_p3_title_en: string;
    why_p3_i1_ar: string; why_p3_i1_en: string;
    why_p3_i2_ar: string; why_p3_i2_en: string;
    why_p4_title_ar: string; why_p4_title_en: string;
    why_p4_i1_ar: string; why_p4_i1_en: string;
    why_p4_i2_ar: string; why_p4_i2_en: string;
    form_title_ar: string; form_title_en: string;
    form_intro_ar: string; form_intro_en: string;
    email_label_ar: string; email_label_en: string;
    email_val: string;
    phone_label_ar: string; phone_label_en: string;
    phone_val: string;
  };
}

export type NavigateFunction = (page: string, params?: Record<string, any>) => void;

export interface PageState {
  name: string;
  params: Record<string, any>;
}

export interface NavLink {
  page: string;
  label: LocalizedString;
}

export interface Evaluation {
  scientificContent: [number, number];
  organization: [number, number];
  speakers: [number, number];
  sponsors: [number, number];
  socialImpact: [number, number];
}

export interface Conference {
  id: number;
  title: LocalizedString;
  organizer: LocalizedString;
  city: LocalizedString;
  date: LocalizedString;
  image: string;
  score: number;
  evaluation: Evaluation;
  specialty: LocalizedString;
  year: number;
  description: LocalizedString;
  scoreText: LocalizedString;
  location: LocalizedString;
  stars?: number;
}

export interface Article {
  id: number;
  title: LocalizedString;
  category: LocalizedString;
  intro: LocalizedString;
  author: LocalizedString;
  image: string;
  created_at?: string;
}

export interface FounderExperience {
    title: LocalizedString;
    items: LocalizedString[];
}

export interface Founder {
    name: LocalizedString;
    title: LocalizedString;
    image: string;
    summary: LocalizedString;
    experience: FounderExperience[];
}

export interface EvaluationCriterion {
    key: keyof Evaluation;
    title: LocalizedString;
    weight: number;
}

export interface ContactInquiryType {
  key: string;
  label: LocalizedString;
}

export interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
}

export interface Expert {
  id: number;
  name: LocalizedString;
  specialty: LocalizedString;
  role: LocalizedString;
  image: string;
  conferencesEvaluated: number;
}

// Backend API Image Structure
export interface ApiImage {
  id: number;
  base_url: string;
  type: string;
  name: string;
  article_id?: number | null;
  author_id?: number | null;
  expert_id?: number | null;
  event_id?: number | null;
  front_sittings_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertContact {
  id: number;
  expert_id: number;
  name_en: string;
  name_ar: string;
  link: string;
  created_at?: string;
  updated_at?: string;
}

// Backend API Expert Structure
export interface ApiExpert {
  id?: number;
  name_en: string;
  name_ar: string;
  job_en: string;
  job_ar: string;
  medpulse_role_en: string;
  medpulse_role_ar: string;
  medpulse_role_description_en?: string;
  medpulse_role_description_ar?: string;
  current_job_en: string;
  current_job_ar: string;
  current_job_description_en?: string;
  current_job_description_ar?: string;
  coverage_type_en: string;
  coverage_type_ar: string;
  number_of_events: number;
  years_of_experience: number;
  description_en?: string;
  description_ar?: string;
  evaluated_specialties_en?: string[];
  evaluated_specialties_ar?: string[];
  subspecialities_en?: string[];
  subspecialities_ar?: string[];
  membership_en?: string[];
  membership_ar?: string[];
  image_url?: string;
  images?: ApiImage[];
  contacts?: ExpertContact[];
  videos?: any[]; // Added videos
}

export interface DoctorProfile {
    id: number;
    jobTitle: LocalizedString;
    bio: {
        summary: LocalizedString;
        background: LocalizedString;
        experienceYears: number;
        specialties: LocalizedString[];
        memberships: LocalizedString[];
    };
    medpulseContribution: {
        role: LocalizedString;
        coverageType: LocalizedString;
        specialtiesEvaluated: LocalizedString[];
    };
    coveredConferenceIds: number[];
    videos?: { url: string; title: LocalizedString; }[];
    contactLinks?: {
        linkedin?: string;
        email?: string;
        academic?: string;
    };
}

// --- API Types ---

export interface Permission {
  id: number;
  name: string;
  description?: string;
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions?: Permission[];
  guard_name?: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role_id?: number;
  role?: Role | null;
  roles?: Role[]; // Sometimes API returns roles array
  token?: string; 
}

export interface ContactFormSubmission {
  id: number;
  full_name: string;
  organisation: string;
  email: string;
  number: string;
  asking_type: string;
  details: string;
  status: 'new' | 'read' | 'accepted' | 'rejected';
  created_at: string;
}

export interface Category {
  id: number;
  name_en: string;
  name_ar: string;
}

export interface ApiAuthor {
  id: number;
  name_en: string;
  name_ar: string;
  speciality_en: string;
  speciality_ar: string;
  image_url?: string;
  images?: ApiImage[];
}

export interface EventAnalysis {
  id?: number;
  event_id?: number;
  description_en: string;
  description_ar: string;
  content_rate: number;
  content_rate_description_en: string;
  content_rate_description_ar: string;
  organisation_rate: number;
  organisation_rate_description_en: string;
  organisation_rate_description_ar: string;
  speaker_rate: number;
  speaker_rate_description_en: string;
  speaker_rate_description_ar: string;
  sponsering_rate: number;
  sponsering_rate_description_en: string;
  sponsering_rate_description_ar: string;
  scientific_impact_rate: number;
  scientific_impact_rate_description_en: string;
  scientific_impact_rate_description_ar: string;
}

export interface ApiEvent {
  id: number;
  title_en: string;
  title_ar: string;
  location: string;
  date_of_happening: string;
  rate: number | string; // API might return string
  stars: number; // Out of 5
  organizer_en: string;
  organizer_ar: string;
  description_en: string;
  description_ar: string;
  
  // Updated fields to arrays
  subjects_en?: string[];
  subjects_ar?: string[];
  subjects_description_en?: string[];
  subjects_description_ar?: string[];
  
  // Legacy / Optional compatibility
  subjects?: string[]; 
  
  authors_description_en?: string;
  authors_description_ar?: string;
  comments_for_medpulse_en?: string;
  comments_for_medpulse_ar?: string;
  
  analysis?: EventAnalysis; 
  event_analysis?: EventAnalysis; // Handle inconsistent API naming if necessary
  
  authors?: ApiAuthor[];
  images?: ApiImage[];
  videos?: any[]; // Added videos
}

export interface ApiArticle {
  id: number;
  title_en: string;
  title_ar: string;
  description_en: string;
  description_ar: string;
  category_id: number;
  category?: Category;
  author_id?: number; // Legacy
  authors?: ApiAuthor[]; // Multiple authors
  images?: ApiImage[];
  videos?: any[];
  created_at?: string;
}

export interface FrontSetting {
  id: number;
  mode: 'video' | 'images';
  video_url?: string;
  images?: string[]; 
}

export interface GeneralSetting {
  id: number;
  events_count: number;
  articles_count: number;
}