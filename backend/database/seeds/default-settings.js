'use strict';

/**
 * Default website settings. Inserted with INSERT IGNORE, so values edited in the
 * admin panel are never overwritten by re-running the seed.
 *
 * Only verified company information is pre-filled. Optional items (social links,
 * office hours, testimonials) start empty and are hidden on the website until set.
 */
module.exports = [
  // ---- Company (verified) ----
  { key: 'company_name', value: 'Krishna International Overseas Services', group: 'company' },
  { key: 'contact_person', value: 'Aviral Pandey', group: 'company' },
  { key: 'email', value: 'krishnainternationalgkp@gmail.com', group: 'company' },
  { key: 'phone_primary', value: '+91 98719 62867', group: 'company' },
  { key: 'phone_alternate', value: '+91 94509 24034', group: 'company' },
  { key: 'whatsapp_number', value: '919871962867', group: 'company' },
  { key: 'whatsapp_number_alt', value: '919450924034', group: 'company' },
  { key: 'whatsapp_number_alt2', value: '919455861117', group: 'company' },
  { key: 'address', value: 'X055 Singhariya, Near Ashoka Gas Godam, Kudaghat, Gorakhpur, Uttar Pradesh – 273008, India', group: 'company', type: 'text' },
  { key: 'business_type', value: 'Manpower Supply', group: 'company' },
  { key: 'registration_number', value: 'UPSA59017079', group: 'company' },
  { key: 'registration_authority', value: 'Shop & Establishment Registration, Government of Uttar Pradesh', group: 'company' },
  { key: 'registered_owner', value: 'Dimpal Pandey', group: 'company' },
  { key: 'office_hours', value: '', group: 'company' },
  { key: 'map_query', value: 'Singhariya, Kudaghat, Gorakhpur, Uttar Pradesh 273008', group: 'company' },

  // ---- Social (empty until the company provides official profiles) ----
  { key: 'facebook_url', value: 'https://www.facebook.com/share/19qDeYVVtK/', group: 'social' },
  { key: 'instagram_url', value: 'https://www.instagram.com/krishnainternational_gkp/', group: 'social' },
  { key: 'linkedin_url', value: '', group: 'social' },
  { key: 'youtube_url', value: 'https://www.youtube.com/@krishnainternationalgkp', group: 'social' },

  // ---- Editable content ----
  { key: 'hero_title', value: 'Connecting Global Employers with Skilled Talent', group: 'content' },
  {
    key: 'hero_subtitle',
    value:
      'Krishna International Overseas Services sources, screens and prepares skilled and semi-skilled workers from India for employers abroad — with clear communication at every step for both the employer and the candidate.',
    group: 'content',
    type: 'text',
  },
  {
    key: 'about_summary',
    value:
      'Based in Gorakhpur, Uttar Pradesh, Krishna International Overseas Services is a manpower supply firm that helps employers find dependable workers and helps job seekers find genuine employment opportunities.',
    group: 'content',
    type: 'text',
  },
  {
    key: 'about_body',
    value:
      'Eastern Uttar Pradesh has a large pool of hard-working tradespeople, technicians and service staff. We connect that talent with employers who need reliable people — sourcing candidates through our local network, verifying their documents and experience, and arranging interviews and trade assessments so that employers meet candidates who are ready for the role.\n\nFor candidates, we aim to be a trustworthy first point of contact: explaining the job, the employer and the process in plain language, and keeping them informed until they are placed.',
    group: 'content',
    type: 'text',
  },
  {
    key: 'vision',
    value: 'To be a trusted name in workforce supply from Eastern Uttar Pradesh, known for honest dealings with both employers and workers.',
    group: 'content',
    type: 'text',
  },
  {
    key: 'mission',
    value:
      'To match employers with suitably skilled, verified candidates; to treat every job seeker with transparency and respect; and to make the recruitment process clear, documented and accountable.',
    group: 'content',
    type: 'text',
  },
  {
    key: 'objectives',
    value: JSON.stringify([
      'Understand each employer’s requirement in detail before sourcing begins.',
      'Screen candidates for skills, experience and documentation.',
      'Give candidates accurate information about the role, employer and terms.',
      'Maintain records of every requirement, application and placement.',
    ]),
    group: 'content',
    type: 'json',
  },
  {
    key: 'management_intro',
    value:
      'The company is managed by Aviral Pandey, who oversees employer relationships, candidate sourcing and day-to-day operations from the Gorakhpur office.',
    group: 'content',
    type: 'text',
  },
  // Testimonials: [{ "name": "", "role": "", "quote": "" }] — add only real, consented testimonials.
  { key: 'testimonials', value: '[]', group: 'content', type: 'json' },

  // ---- SEO ----
  {
    key: 'meta_description',
    value:
      'Krishna International Overseas Services, Gorakhpur — manpower supply and recruitment support for employers, and job opportunities for skilled and semi-skilled candidates.',
    group: 'seo',
    type: 'text',
  },
];
