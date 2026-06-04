-- Add onboarding tracking to profiles
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed boolean NOT NULL DEFAULT false;

-- Mark existing users as onboarded
UPDATE public.profiles SET onboarding_completed = true;