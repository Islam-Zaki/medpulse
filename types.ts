
// FIX: import React to use React.ReactNode
import React from 'react';

export type Language = 'ar' | 'en';

export interface LocalizedString {
  ar: string;
  en: string;
}

export interface SEOConfig {
  meta_title_ar: string;
  meta_title_en: string;
  meta_description_ar: string;
  meta_description_en: string;
  keywords_ar: string;
  keywords_en: string;
}

export interface ConfigGoal {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigValue {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigService {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigTeamMember {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigDifferentiator {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigVisionPoint {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

// New Home Specific Config Types
export interface ConfigHomePoint {
  icon: string;
  text_ar: string;
  text_en: string;
}

export interface ConfigHomeWhyCard {
  icon: string;
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

export interface ConfigHomeStep {
  title_ar: string;
  title_en: string;
  desc_ar: string;
  desc_en: string;
}

// Contact Page Specific Config Types
export interface ConfigContactPoint {
  text_ar: string;
  text_en: string;
}

export interface ConfigContactCard {
  title_ar: string;
  title_en: string;
  points: ConfigContactPoint[];
}

// Flexible Founder Section Types
export interface ConfigFounderSection {
  icon: string;
  title_ar: string;
  title_en: string;
  content_ar: string;
  content_en: string;
}

export interface ConfigFounderSidebarItem {
  label_ar: string;
  label_en: string;
  value_ar: string;
  value_en: string;
}

export interface ConfigFounderSidebarCard {
  title_ar: string;
  title_en: string;
  content_ar: string; 
  content_en: string;
  items: ConfigFounderSidebarItem[];
}

export interface SiteConfig {
  fonts: {
    ar: { headings: string; body: string };
    en: { headings: string; body: string };
  };
  home: {
    seo?: SEOConfig;
    hero_title_ar: string; 
    hero_title_en: string;
    hero_subtitle_ar: string; 
    hero_subtitle_en: string;
    hero_desc_ar: string; 
    hero_desc_en: string;
    hero_btn1_ar: string; 
    hero_btn1_en: string;
    hero_btn2_ar: string; 
    hero_btn2_en: string;
    
    about_title_ar: string; 
    about_title_en: string;
    about_desc_ar: string; 
    about_desc_en: string;
    about_items: ConfigHomePoint[];
    
    mv_title_ar: string; 
    mv_title_en: string;
    mission_icon: string;
    mission_title_ar: string; 
    mission_title_en: string;
    mission_text_ar: string; 
    mission_text_en: string;
    mission_summary_ar?: string;
    mission_summary_en?: string;
    
    vision_icon: string;
    vision_title_ar: string; 
    vision_title_en: string;
    vision_text_ar: string; 
    vision_text_en: string;
    vision_summary_ar?: string;
    vision_summary_en?: string;

    why_title_ar: string; 
    why_title_en: string;
    why_desc_ar: string; 
    why_desc_en: string;
    why_items: ConfigHomeWhyCard[];

    how_title_ar: string; 
    how_title_en: string;
    how_desc_ar: string; 
    how_desc_en: string;
    how_steps: ConfigHomeStep[];
    how_goal_ar: string; 
    how_goal_en: string;

    latest_conf_title_ar: string; 
    latest_conf_title_en: string;
    latest_art_title_ar: string; 
    latest_art_title_en: string;

    founder_sec_title_ar: string; 
    founder_sec_title_en: string;
    founder_sec_desc_ar: string; 
    founder_sec_desc_en: string;

    cta_title_ar: string; 
    cta_title_en: string;
    cta_desc_ar: string; 
    cta_desc_en: string;
    cta_btn_ar: string; 
    cta_btn_en: string;

    social_links?: {
      facebook?: string;
      instagram?: string;
      x?: string;
      tiktok?: string;
      youtube?: string;
    };
  };
  about: {
    seo?: SEOConfig;
    h1_ar: string; h1_en: string;
    subtitle_ar: string; subtitle_en: string;
    intro_icon: string;
    intro_title_ar: string; intro_title_en: string;
    intro_p1_ar: string; intro_p1_en: string;
    intro_p2_ar: string; intro_p2_en: string;
    
    mission_icon: string;
    mission_title_ar: string; mission_title_en: string;
    mission_text_ar: string; mission_text_en: string;
    mission_summary_ar: string; mission_summary_en: string;
    
    vision_icon: string;
    vision_title_ar: string; vision_title_en: string;
    vision_text_ar: string; vision_text_en: string;
    vision_summary_ar: string; vision_summary_en: string;
    
    goals_icon: string;
    goals: ConfigGoal[];
    
    values_icon: string;
    core_values_intro_ar: string;
    core_values_intro_en: string;
    values: ConfigValue[];
    
    services_icon: string;
    services: ConfigService[];
    
    team_icon: string;
    team: ConfigTeamMember[];
    
    diff_icon: string;
    differentiators: ConfigDifferentiator[];
    
    future_vision_icon: string;
    future_vision_title_ar: string;
    future_vision_title_en: string;
    future_vision_intro_ar: string;
    future_vision_intro_en: string;
    future_vision: ConfigVisionPoint[];
    future_vision_summary_ar: string;
    future_vision_summary_en: string;
    
    cta_title_ar: string; cta_title_en: string;
    cta_desc_ar: string; cta_desc_en: string;
    cta_btn_ar: string; cta_btn_en: string;
  };
  founder: {
    seo?: SEOConfig;
    name_ar: string; name_en: string;
    main_title_ar: string; main_title_en: string;
    main_image: any;
    sections: ConfigFounderSection[];
    sidebar_cards: ConfigFounderSidebarCard[];
    gallery: any[];
    contact_title_ar: string; contact_title_en: string;
    contact_content_ar: string; contact_content_en: string;
  };
  contact: {
    seo?: SEOConfig;
    h1_ar: string; h1_en: string;
    intro_ar: string; intro_en: string;
    why_title_ar: string; why_title_en: string;
    why_cards: ConfigContactCard[];
    form_title_ar: string; form_title_en: string;
    form_intro_ar: string; form_intro_en: string;
    email_label_ar: string; email_label_en: string;
    email_val: string;
    phone_label_ar: string; phone_label_en: string;
    phone_val: string;
  };
  conferences?: { seo?: SEOConfig };
  articles?: { seo?: SEOConfig };
  experts?: { seo?: SEOConfig };
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
  coordinates?: { latitude: number; longitude: number };
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
  location_ar?: string;
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
