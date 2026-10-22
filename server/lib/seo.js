// Google Business Profile health check based on details the owner enters.
// This is a self-assessment scorer. It does not read data from Google.

const num = v => (Number.isFinite(Number(v)) ? Number(v) : 0);
const yes = v => v === true || v === 'true' || v === 'yes';

const CHECKS = [
  { group: 'Basic info', weight: 5, label: 'Address is added', tip: 'Add your full business address so customers and Google can verify your location.', test: i => yes(i.hasAddress) },
  { group: 'Basic info', weight: 5, label: 'Phone number is added', tip: 'Add a phone number that is answered during opening hours.', test: i => yes(i.hasPhone) },
  { group: 'Basic info', weight: 5, label: 'Website is linked', tip: 'Link your website or a simple landing page to your profile.', test: i => yes(i.hasWebsite) },
  { group: 'Basic info', weight: 5, label: 'Opening hours are set', tip: 'Set regular and holiday hours so customers see accurate timings.', test: i => yes(i.hasHours) },
  { group: 'Basic info', weight: 5, label: 'Name, address and phone match everywhere', tip: 'Use the exact same name, address and phone on your website and directories.', test: i => yes(i.napConsistent) },
  { group: 'Content', weight: 6, label: 'Description is 250+ characters', tip: 'Write a clear description of what you offer, who you serve and where.', test: i => num(i.descriptionLength) >= 250 },
  { group: 'Content', weight: 4, label: 'Description mentions your main keywords', tip: 'Naturally mention your main services and your city in the description.', test: i => yes(i.keywordInDescription) },
  { group: 'Content', weight: 5, label: 'Primary and secondary categories set', tip: 'Choose the most accurate primary category and add relevant secondary ones.', test: i => num(i.categoryCount) >= 2 },
  { group: 'Content', weight: 5, label: 'Services or products are listed', tip: 'List your services or products with short descriptions.', test: i => yes(i.hasServices) },
  { group: 'Visuals', weight: 7, label: '10+ photos uploaded', tip: 'Upload at least 10 real photos of your place, team and work.', test: i => num(i.photoCount) >= 10 },
  { group: 'Visuals', weight: 4, label: 'Logo is uploaded', tip: 'Upload a clear square logo.', test: i => yes(i.hasLogo) },
  { group: 'Visuals', weight: 4, label: 'Cover photo is set', tip: 'Choose a bright cover photo that represents your business.', test: i => yes(i.hasCover) },
  { group: 'Reviews', weight: 8, label: 'Rating is 4.3 or higher', tip: 'Improve service issues raised in feedback and ask happy customers for honest reviews.', test: i => num(i.rating) >= 4.3 },
  { group: 'Reviews', weight: 6, label: '50+ total reviews', tip: 'Show your review QR code at checkout to collect more genuine reviews.', test: i => num(i.reviewCount) >= 50 },
  { group: 'Reviews', weight: 6, label: '5+ reviews in the last 30 days', tip: 'Fresh reviews matter. Ask customers consistently every week.', test: i => num(i.reviewsLast30Days) >= 5 },
  { group: 'Reviews', weight: 5, label: 'You reply to 80%+ of reviews', tip: 'Reply to every review, especially negative ones, within a day or two.', test: i => num(i.replyRatePercent) >= 80 },
  { group: 'Engagement', weight: 6, label: '4+ posts in the last 30 days', tip: 'Share offers, updates or photos at least once a week.', test: i => num(i.postsLast30Days) >= 4 },
  { group: 'Engagement', weight: 3, label: 'Questions and answers are filled in', tip: 'Add and answer common customer questions in the Q&A section.', test: i => yes(i.hasQA) },
  { group: 'Engagement', weight: 3, label: 'Booking or order link is added', tip: 'Add an appointment, booking or order link if it applies to you.', test: i => yes(i.hasBookingLink) },
  { group: 'Engagement', weight: 3, label: 'Attributes are selected', tip: 'Select attributes such as Wi-Fi, parking, accessibility or payment types.', test: i => yes(i.hasAttributes) }
];

export function runSeoAudit(input = {}) {
  const passed = [], failed = [], groups = {};
  let score = 0;
  for (const c of CHECKS) {
    groups[c.group] ??= { name: c.group, score: 0, max: 0 };
    groups[c.group].max += c.weight;
    if (c.test(input)) { score += c.weight; groups[c.group].score += c.weight; passed.push(c.label); }
    else failed.push({ label: c.label, tip: c.tip, weight: c.weight });
  }
  failed.sort((a, b) => b.weight - a.weight);
  const grade = score >= 85 ? 'Excellent' : score >= 65 ? 'Good' : score >= 40 ? 'Needs work' : 'Weak';
  return { score, grade, checks: CHECKS.length, passed, failed, dimensions: Object.values(groups) };
}
