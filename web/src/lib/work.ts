import type { CareerPathId, Character, Employment, EmploymentType, JobApplication, JobOffer, PromotionOffer } from './types';
import { addCalendarDays } from './calendar';

export interface CareerRole {
  id: string;
  pathId: CareerPathId;
  pathName: string;
  title: string;
  level: number;
  description: string;
  minAge: number;
  maxAge: number;
  minIntelligence: number;
  minExperienceYears: number;
  requiresHigherEducation: boolean;
  annualSalaryMin: number;
  annualSalaryMax: number;
  nextRoleId?: string;
}

export interface JobListing {
  id: string;
  roleId: string;
  title: string;
  pathName: string;
  employer: string;
  sector: string;
  location: string;
  type: EmploymentType;
  annualSalary: number;
  postedWeek: string;
}

export interface CareerRequirement {
  label: string;
  met: boolean;
  detail: string;
}

export const CAREER_ROLES: CareerRole[] = [
  { id: 'service-assistant', pathId: 'customer-service', pathName: 'Customer service', title: 'Service assistant', level: 1, description: 'Help customers, answer questions and solve everyday service issues.', minAge: 16, maxAge: 120, minIntelligence: 25, minExperienceYears: 0, requiresHigherEducation: false, annualSalaryMin: 6000, annualSalaryMax: 12000, nextRoleId: 'service-specialist' },
  { id: 'service-specialist', pathId: 'customer-service', pathName: 'Customer service', title: 'Service specialist', level: 2, description: 'Handle complex requests and support consistent service quality.', minAge: 18, maxAge: 120, minIntelligence: 42, minExperienceYears: 2, requiresHigherEducation: false, annualSalaryMin: 14000, annualSalaryMax: 24000, nextRoleId: 'service-supervisor' },
  { id: 'service-supervisor', pathId: 'customer-service', pathName: 'Customer service', title: 'Service supervisor', level: 3, description: 'Coordinate a team, resolve escalations and improve service delivery.', minAge: 21, maxAge: 120, minIntelligence: 52, minExperienceYears: 4, requiresHigherEducation: false, annualSalaryMin: 24000, annualSalaryMax: 38000 },
  { id: 'operations-assistant', pathId: 'operations', pathName: 'Operations', title: 'Operations assistant', level: 1, description: 'Support daily operations, records and routine coordination.', minAge: 16, maxAge: 120, minIntelligence: 32, minExperienceYears: 0, requiresHigherEducation: false, annualSalaryMin: 7000, annualSalaryMax: 14000, nextRoleId: 'operations-coordinator' },
  { id: 'operations-coordinator', pathId: 'operations', pathName: 'Operations', title: 'Operations coordinator', level: 2, description: 'Coordinate processes, schedules and cross-team work.', minAge: 18, maxAge: 120, minIntelligence: 48, minExperienceYears: 2, requiresHigherEducation: false, annualSalaryMin: 16000, annualSalaryMax: 28000, nextRoleId: 'operations-manager' },
  { id: 'operations-manager', pathId: 'operations', pathName: 'Operations', title: 'Operations manager', level: 3, description: 'Lead an operational team and take responsibility for delivery.', minAge: 23, maxAge: 120, minIntelligence: 58, minExperienceYears: 5, requiresHigherEducation: false, annualSalaryMin: 30000, annualSalaryMax: 50000 },
  { id: 'it-support', pathId: 'technology', pathName: 'Technology', title: 'IT support technician', level: 1, description: 'Troubleshoot devices, accounts and common technical issues.', minAge: 18, maxAge: 120, minIntelligence: 55, minExperienceYears: 0, requiresHigherEducation: false, annualSalaryMin: 18000, annualSalaryMax: 30000, nextRoleId: 'software-developer' },
  { id: 'software-developer', pathId: 'technology', pathName: 'Technology', title: 'Software developer', level: 2, description: 'Build, test and maintain software used by customers or teams.', minAge: 18, maxAge: 120, minIntelligence: 65, minExperienceYears: 2, requiresHigherEducation: true, annualSalaryMin: 32000, annualSalaryMax: 56000, nextRoleId: 'senior-developer' },
  { id: 'senior-developer', pathId: 'technology', pathName: 'Technology', title: 'Senior software developer', level: 3, description: 'Own technical decisions, mentor developers and deliver complex work.', minAge: 23, maxAge: 120, minIntelligence: 72, minExperienceYears: 5, requiresHigherEducation: true, annualSalaryMin: 55000, annualSalaryMax: 85000 },
  { id: 'sales-associate', pathId: 'sales', pathName: 'Sales', title: 'Sales associate', level: 1, description: 'Understand customer needs and help people choose suitable products.', minAge: 16, maxAge: 120, minIntelligence: 30, minExperienceYears: 0, requiresHigherEducation: false, annualSalaryMin: 6500, annualSalaryMax: 13000, nextRoleId: 'account-executive' },
  { id: 'account-executive', pathId: 'sales', pathName: 'Sales', title: 'Account executive', level: 2, description: 'Manage customer accounts and develop long-term business relationships.', minAge: 18, maxAge: 120, minIntelligence: 48, minExperienceYears: 2, requiresHigherEducation: false, annualSalaryMin: 18000, annualSalaryMax: 32000, nextRoleId: 'sales-manager' },
  { id: 'sales-manager', pathId: 'sales', pathName: 'Sales', title: 'Sales manager', level: 3, description: 'Lead a sales team and take responsibility for team results.', minAge: 23, maxAge: 120, minIntelligence: 58, minExperienceYears: 5, requiresHigherEducation: false, annualSalaryMin: 32000, annualSalaryMax: 54000 }
];

const EMPLOYERS = [
  { name: 'Northstar Services', sector: 'Customer services' },
  { name: 'Cedarline Group', sector: 'Business operations' },
  { name: 'Brightpath Systems', sector: 'Technology' },
  { name: 'Harbor & Field', sector: 'Retail and sales' },
  { name: 'Everwell Partners', sector: 'Professional services' },
  { name: 'Summit Works', sector: 'Business services' },
  { name: 'Bluegate Digital', sector: 'Technology' },
  { name: 'MarketSquare Co.', sector: 'Retail and sales' }
];

const hash = (value: string): number => {
  let result = 2166136261;
  for (let i = 0; i < value.length; i += 1) result = Math.imul(result ^ value.charCodeAt(i), 16777619);
  return result >>> 0;
};

function seeded(seed: string): () => number {
  let state = hash(seed) || 1;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function getCareerRole(roleId?: string, title?: string): CareerRole | null {
  if (roleId) {
    const exact = CAREER_ROLES.find((role) => role.id === roleId);
    if (exact) return exact;
  }
  if (title) {
    const normalized = title.toLowerCase();
    if (normalized.includes('service')) return CAREER_ROLES.find((role) => role.id === 'service-assistant') ?? null;
    if (normalized.includes('sales')) return CAREER_ROLES.find((role) => role.id === 'sales-associate') ?? null;
    if (normalized.includes('developer') || normalized.includes('technician')) return CAREER_ROLES.find((role) => role.id === 'it-support') ?? null;
    if (normalized.includes('operation') || normalized.includes('associate') || normalized.includes('assistant')) return CAREER_ROLES.find((role) => role.id === 'operations-assistant') ?? null;
  }
  return null;
}

export function getCareerExperience(character: Character): number {
  return Math.max(0, Math.floor(character.careerExperienceYears ?? character.employment?.experienceYears ?? 0));
}

export function getCareerRequirements(character: Character, role: CareerRole): CareerRequirement[] {
  const experience = getCareerExperience(character);
  return [
    { label: 'Age', met: character.age >= role.minAge && character.age <= role.maxAge, detail: role.minAge >= 65 ? 'Later-life role' : role.minAge > 16 ? 'Age ' + role.minAge + ' or older' : 'Age 16 or older' },
    { label: 'Education', met: !role.requiresHigherEducation || character.education === 'Higher education', detail: role.requiresHigherEducation ? 'Higher education' : 'No specific degree required' },
    { label: 'Knowledge', met: character.intelligence >= role.minIntelligence, detail: 'Intelligence ' + role.minIntelligence + '+' },
    { label: 'Experience', met: experience >= role.minExperienceYears, detail: role.minExperienceYears + '+ years of career experience' }
  ];
}

export function isEligibleForRole(character: Character, role: CareerRole): boolean {
  return getCareerRequirements(character, role).every((requirement) => requirement.met);
}

export function getJobListings(character: Character): JobListing[] {
  const week = character.calendar?.currentDate ?? character.year + '-01-01';
  const eligibleAge = CAREER_ROLES.filter((role) => character.age >= role.minAge && character.age <= role.maxAge);
  const candidates = eligibleAge.filter((role) => {
    const currentRole = getCareerRole(character.employment?.roleId, character.employment?.title);
    return !currentRole || role.id !== currentRole.id;
  });
  if (!candidates.length) return [];
  const random = seeded(character.name + '|' + character.age + '|' + week + '|' + character.country);
  const shuffled = [...candidates];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  const scale = character.currencyScale ?? 1;
  const type: EmploymentType = character.age < 18 ? 'part-time' : character.age >= 65 ? 'flexible' : 'full-time';
  const location = character.birthplace ?? 'Local area';
  return shuffled.slice(0, 5).map((role, index) => {
    const employer = EMPLOYERS[(hash(week + role.id + character.name) + index) % EMPLOYERS.length];
    const salarySeed = seeded(week + role.id + character.name + '|salary');
    const midpoint = role.annualSalaryMin + (role.annualSalaryMax - role.annualSalaryMin) * salarySeed();
    const ageFactor = type === 'part-time' ? 0.45 : type === 'flexible' ? 0.7 : 1;
    return {
      id: role.id + '-' + week,
      roleId: role.id,
      title: role.title,
      pathName: role.pathName,
      employer: employer.name,
      sector: employer.sector,
      location,
      type,
      annualSalary: Math.round(midpoint * scale * ageFactor),
      postedWeek: week
    };
  });
}

export function getCareerPath(pathId: CareerPathId): CareerRole[] {
  return CAREER_ROLES.filter((role) => role.pathId === pathId).sort((a, b) => a.level - b.level);
}

export function getNextCareerRole(employment: Employment): CareerRole | null {
  const current = getCareerRole(employment.roleId, employment.title);
  if (!current?.nextRoleId) return null;
  return getCareerRole(current.nextRoleId);
}

export function getPromotionReadiness(character: Character): { role: CareerRole | null; requirements: CareerRequirement[]; ready: boolean; salaryEstimate: { min: number; max: number } | null } {
  const employment = character.employment;
  if (!employment) return { role: null, requirements: [], ready: false, salaryEstimate: null };
  const role = getNextCareerRole(employment);
  if (!role) return { role: null, requirements: [], ready: false, salaryEstimate: null };
  const requirements = getCareerRequirements(character, role);
  const performanceMet = employment.performance >= 80;
  requirements.push({ label: 'Performance', met: performanceMet, detail: 'Performance 80/100 or higher' });
  const scale = character.currencyScale ?? 1;
  return {
    role,
    requirements,
    ready: requirements.every((requirement) => requirement.met),
    salaryEstimate: { min: Math.round(role.annualSalaryMin * scale), max: Math.round(role.annualSalaryMax * scale) }
  };
}

export function createPromotionOffer(character: Character, issuedAt: string): PromotionOffer | null {
  if (!character.employment || character.promotionOffer) return null;
  const readiness = getPromotionReadiness(character);
  if (!readiness.ready || !readiness.role) return null;
  const salary = Math.max(character.employment.annualSalary, Math.round(character.employment.annualSalary * 1.15));
  return {
    roleId: readiness.role.id,
    title: readiness.role.title,
    annualSalary: salary,
    issuedAt,
    expiresAt: addCalendarDays(issuedAt, 14)
  };
}

export function resolveJobApplication(character: Character, listingId: string, random: () => number): Character {
  const listing = getJobListings(character).find((job) => job.id === listingId);
  if (!listing || (character.jobApplications ?? []).some((application) => application.listingId === listingId)) return character;
  const role = getCareerRole(listing.roleId);
  if (!role || !isEligibleForRole(character, role)) return character;
  const requirements = getCareerRequirements(character, role);
  const fit = requirements.length ? requirements.filter((item) => item.met).length / requirements.length : 0;
  const performance = character.employment?.performance ?? 55;
  const chance = Math.max(0.2, Math.min(0.9, 0.35 + fit * 0.35 + (performance - 50) / 500));
  const invited = random() < chance;
  const application: JobApplication = {
    id: 'application-' + listing.id,
    listingId: listing.id,
    roleId: listing.roleId,
    title: listing.title,
    employer: listing.employer,
    type: listing.type,
    annualSalary: listing.annualSalary,
    appliedAt: character.calendar?.currentDate ?? character.year + '-01-01',
    status: invited ? 'interview' : 'rejected',
    outcome: invited ? 'Your application was shortlisted. Schedule an interview to continue.' : 'The employer selected other candidates. You can build experience and try another opening.'
  };
  const next = { ...character, jobApplications: [...(character.jobApplications ?? []), application], history: [...character.history] };
  next.history.unshift({
    id: 'job-application-' + listing.id,
    year: character.year,
    age: character.age,
    title: invited ? 'Interview invitation received' : 'Job application unsuccessful',
    description: invited ? 'Your application to ' + listing.employer + ' for ' + listing.title + ' was shortlisted.' : 'Your application to ' + listing.employer + ' for ' + listing.title + ' was not selected.',
    kind: invited ? 'event' : 'activity'
  });
  return next;
}

export function resolveJobInterview(character: Character, applicationId: string, random: () => number): Character {
  const application = (character.jobApplications ?? []).find((item) => item.id === applicationId && item.status === 'interview');
  if (!application) return character;
  const role = getCareerRole(application.roleId);
  if (!role || !isEligibleForRole(character, role)) return character;
  const performance = character.employment?.performance ?? 55;
  const qualification = character.education === 'Higher education' ? 0.12 : 0;
  const personality = (character.personality ?? []).some((trait) => trait === 'Ambitious' || trait === 'Disciplined') ? 0.06 : 0;
  const chance = Math.max(0.2, Math.min(0.9, 0.48 + (character.intelligence - 50) / 300 + (performance - 50) / 500 + qualification + personality));
  const passed = random() < chance;
  const issuedAt = character.calendar?.currentDate ?? character.year + '-01-01';
  const offer: JobOffer | null = passed ? {
    id: 'offer-' + application.id,
    applicationId: application.id,
    roleId: application.roleId,
    title: application.title,
    employer: application.employer,
    type: application.type,
    annualSalary: application.annualSalary,
    issuedAt,
    expiresAt: addCalendarDays(issuedAt, 14)
  } : null;
  const applications = (character.jobApplications ?? []).map((item) => item.id === application.id
    ? { ...item, status: passed ? 'offered' as const : 'rejected' as const, outcome: passed ? 'The interview went well. You have received an offer.' : 'The interview did not lead to an offer.' }
    : item);
  const next = {
    ...character,
    jobApplications: applications,
    jobOffers: passed ? [...(character.jobOffers ?? []).filter((item) => item.id !== offer!.id), offer!] : character.jobOffers,
    history: [...character.history]
  };
  next.history.unshift({
    id: 'job-interview-' + application.id,
    year: character.year,
    age: character.age,
    title: passed ? 'Job offer received' : 'Interview unsuccessful',
    description: passed ? application.employer + ' offered you the ' + application.title + ' role at ' + formatSalary(character, application.annualSalary) + ' per year.' : 'The interview with ' + application.employer + ' was unsuccessful.',
    kind: passed ? 'milestone' : 'activity'
  });
  return next;
}

function formatSalary(character: Character, amount: number): string {
  const currency = character.currency ?? 'USD';
  return currency + ' ' + Math.round(amount).toLocaleString('en-US');
}

export function acceptJobOffer(character: Character, offerId: string): Character {
  const offer = (character.jobOffers ?? []).find((item) => item.id === offerId);
  const today = character.calendar?.currentDate ?? character.year + '-01-01';
  if (!offer || today > offer.expiresAt) return character;
  const role = getCareerRole(offer.roleId);
  if (!role || !isEligibleForRole(character, role)) return character;
  const employment: Employment = {
    title: offer.title,
    type: offer.type,
    annualSalary: offer.annualSalary,
    experienceYears: 0,
    performance: 60,
    promotions: 0,
    startedAtAge: character.age,
    roleId: role.id,
    careerPathId: role.pathId,
    employer: offer.employer,
    level: role.level,
    startedAtDate: today
  };
  const next = {
    ...character,
    employment,
    jobOffers: (character.jobOffers ?? []).filter((item) => item.id !== offerId),
    jobApplications: (character.jobApplications ?? []).map((item) => item.id === offer.applicationId ? { ...item, status: 'accepted' as const, outcome: 'Offer accepted. You started a new role.' } : item),
    history: [...character.history]
  };
  next.history.unshift({
    id: 'job-start-' + offer.id,
    year: character.year,
    age: character.age,
    title: 'Started a new job',
    description: 'You joined ' + offer.employer + ' as ' + offer.title + '. Annual pay: ' + formatSalary(character, offer.annualSalary) + '.',
    kind: 'milestone'
  });
  return next;
}

export function declineJobOffer(character: Character, offerId: string): Character {
  const offer = (character.jobOffers ?? []).find((item) => item.id === offerId);
  if (!offer) return character;
  return {
    ...character,
    jobOffers: (character.jobOffers ?? []).filter((item) => item.id !== offerId),
    jobApplications: (character.jobApplications ?? []).map((item) => item.id === offer.applicationId ? { ...item, status: 'declined' as const, outcome: 'You declined the offer.' } : item)
  };
}

export function acceptPromotionOffer(character: Character): Character {
  const offer = character.promotionOffer;
  const today = character.calendar?.currentDate ?? character.year + '-01-01';
  if (!offer || today > offer.expiresAt || !character.employment) return character;
  const role = getCareerRole(offer.roleId);
  if (!role || !getPromotionReadiness(character).ready) return character;
  const oldTitle = character.employment.title;
  const employment = {
    ...character.employment,
    title: offer.title,
    roleId: role.id,
    careerPathId: role.pathId,
    level: role.level,
    annualSalary: offer.annualSalary,
    performance: 65,
    promotions: character.employment.promotions + 1
  };
  const next = { ...character, employment, promotionOffer: null, history: [...character.history] };
  next.history.unshift({
    id: 'promotion-' + role.id + '-' + character.year,
    year: character.year,
    age: character.age,
    title: 'Promotion accepted',
    description: 'You advanced from ' + oldTitle + ' to ' + role.title + ' at ' + formatSalary(character, offer.annualSalary) + ' annual pay.',
    kind: 'milestone'
  });
  return next;
}


export function expireWorkOffers(character: Character, currentDate: string): Character {
  const expired = (character.jobOffers ?? []).filter((offer) => currentDate > offer.expiresAt);
  const promotionExpired = Boolean(character.promotionOffer && currentDate > character.promotionOffer.expiresAt);
  if (!expired.length && !promotionExpired) return character;
  const expiredIds = new Set(expired.map((offer) => offer.applicationId));
  const next = {
    ...character,
    jobOffers: (character.jobOffers ?? []).filter((offer) => currentDate <= offer.expiresAt),
    jobApplications: (character.jobApplications ?? []).map((application) => expiredIds.has(application.id)
      ? { ...application, status: 'expired' as const, outcome: 'The offer expired before you responded.' }
      : application),
    promotionOffer: promotionExpired ? null : character.promotionOffer
  };
  return next;
}

export function declinePromotionOffer(character: Character): Character {
  if (!character.promotionOffer) return character;
  const next = { ...character, promotionOffer: null, history: [...character.history] };
  next.history.unshift({
    id: 'promotion-declined-' + character.year + '-' + character.employment?.promotions,
    year: character.year,
    age: character.age,
    title: 'Promotion declined',
    description: 'You chose to remain in your current role for now.',
    kind: 'activity'
  });
  return next;
}
