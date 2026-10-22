// Review draft and reply templates. Used as a fallback when no AI key is configured.
// Templates only use details the customer or owner actually provided.

export const LANGUAGES = [
  'English', 'Hindi', 'Hinglish', 'Gujarati', 'Marathi', 'Bengali', 'Tamil', 'Telugu',
  'Kannada', 'Malayalam', 'Punjabi', 'Urdu', 'Odia', 'Assamese', 'Spanish', 'French',
  'German', 'Portuguese', 'Arabic', 'Indonesian', 'Turkish', 'Russian', 'Japanese', 'Korean'
];

const pick = list => list[Math.floor(Math.random() * list.length)];
const sentence = text => {
  const t = String(text || '').trim().replace(/[.\s]+$/, '');
  return t ? t.charAt(0).toUpperCase() + t.slice(1) + '.' : '';
};
const join = (...parts) => parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();

export function localDrafts({ business = 'this business', city = '', rating = 5, staff = '', service = '', keywords = '', note = '' }) {
  const where = city ? `${business} in ${city}` : business;
  const staffLine = staff ? `${staff} was helpful and attentive throughout.` : '';
  const serviceLine = service ? `My experience with ${service} was really good.` : '';
  const keywordLine = keywords ? `A good choice if you are looking for ${keywords}.` : '';
  const noteLine = sentence(note);

  if (rating >= 4) {
    const strong = rating === 5;
    return [
      join(pick(['Great experience at', 'Really happy with', 'Had a wonderful visit to']), where + '!', noteLine, staffLine, pick(['Highly recommend!', 'Will be back soon.']), pick(['😊', '⭐', '🙌'])),
      join(`I recently visited ${where}.`, serviceLine, noteLine, staffLine, keywordLine, strong ? 'Everything was smooth and professional. Thank you!' : 'A good experience overall. Thank you!'),
      join(`Thank you to the team at ${business}!`, staffLine, noteLine, serviceLine, pick(['Friendly service and a welcoming atmosphere.', 'Clean, professional and easy to deal with.']), pick(['👍', '✨', '😊']))
    ];
  }
  return [
    join(`My visit to ${where} was okay.`, noteLine, staffLine, 'There is some room for improvement, but I appreciate the effort.'),
    join(`Sharing honest feedback about ${business}.`, serviceLine, noteLine, 'I hope the team can build on this.'),
    join(`I visited ${business} recently.`, noteLine, 'A few things could be better, and I hope this feedback helps.')
  ];
}

export function localReply({ business = 'our team', city = '', rating = 5, reviewerName = '', keyword = '', ownerName = '' }) {
  const name = reviewerName ? ` ${reviewerName}` : '';
  const place = city ? ` in ${city}` : '';
  const sign = ownerName ? `- ${ownerName}, ${business}` : `- The ${business} team`;
  const kw = keyword ? ` We are glad you chose us for ${keyword}.` : '';
  if (rating >= 4) {
    return join(`Hi${name}! Thank you so much for your ${rating}-star review. 😊`, `We are delighted that you had a great experience with ${business}${place}.${kw}`, 'We look forward to welcoming you again soon!', sign);
  }
  if (rating === 3) {
    return join(`Hi${name}, thank you for your honest feedback.`, `We are glad parts of your visit to ${business} went well, and we are sorry we did not fully meet your expectations.`, 'We are working on the areas you mentioned and would love to welcome you back.', sign);
  }
  return join(`Hi${name}, we are sorry that your experience with ${business} fell short.`, 'Your feedback is important to us and we would like to make this right.', 'Please contact us directly so we can look into it and resolve the issue.', sign);
}
