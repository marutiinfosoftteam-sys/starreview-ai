// Review draft and reply templates. Used for fast, reliable review suggestions in multiple languages.
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

export function localDrafts({ business = 'this business', city = '', rating = 5, staff = '', service = '', keywords = '', note = '', language = 'English' }) {
  const where = city ? `${business} in ${city}` : business;
  const lang = String(language || 'English').toLowerCase();

  // 1. GUJARATI
  if (lang.includes('gujarat')) {
    const sLine = staff ? `${staff} ભાઈ/બહેન નો વ્યવહાર અને સેવા ખૂબ જ પ્રશંસનીય હતી.` : '';
    const srvLine = service ? `${service} ની સર્વિસ ખરેખર શ્રેષ્ઠ રહી.` : '';
    const nLine = note ? `${note}.` : '';
    if (rating >= 4) {
      return [
        join(`${where} માં મારો અનુભવ ખૂબ જ ઉત્તમ રહ્યો!`, sLine, srvLine, nLine, 'સ્ટાફ ઘણો નમ્ર અને સહાયક છે. ખૂબ ખૂબ આભાર! ⭐', '😊'),
        join(`મેં તાજેતરમાં ${where} ની મુલાકાત લીધી.`, srvLine, sLine, nLine, 'બધું જ ખૂબ વ્યવસ્થિત અને ઉત્કૃષ્ટ હતું. Highly recommended! 👍'),
        join(`${business} ની આખી ટીમને દિલથી ધન્યવાદ!`, sLine, nLine, 'સુવિધા અને સર્વિસ ખૂબ જ સરસ છે. હું ચોક્કસ ફરી મુલાકાત લઈશ. ✨')
      ];
    }
    return [
      join(`${where} ની મુલાકાત ઠીક રહી.`, nLine, sLine, 'થોડા સુધારાની જરૂર છે, પરંતુ સ્ટાફનો પ્રયાસ સારો હતો.'),
      join(`${business} વિશે પ્રામાણિક પ્રતિસાદ.`, srvLine, nLine, 'આશા છે કે આગામી સમયમાં સર્વિસ વધુ બહેતર બનશે.'),
      join(`${where} માં સેવા સામાન્ય રહી.`, nLine, 'સર્વિસ ક્વોલિટી પર થોડું ધ્યાન આપવાની વિનંતી.')
    ];
  }

  // 2. HINDI
  if (lang.includes('hind') && !lang.includes('hing')) {
    const sLine = staff ? `${staff} जी का व्यवहार और सर्विस बहुत ही शानदार थी।` : '';
    const srvLine = service ? `${service} की सर्विस वाकई में बेहतरीन रही।` : '';
    const nLine = note ? `${note}।` : '';
    if (rating >= 4) {
      return [
        join(`${where} में मेरा अनुभव बहुत ही शानदार रहा!`, sLine, srvLine, nLine, 'यहाँ का स्टाफ बहुत मददगार और विनम्र है। धन्यवाद! ⭐', '😊'),
        join(`मैंने हाल ही में ${where} विज़िट किया था।`, srvLine, sLine, nLine, 'सब कुछ बहुत प्रोफेशनल और अच्छा था। Highly recommended! 👍'),
        join(`${business} की पूरी टीम को बहुत-बहुत धन्यवाद!`, sLine, nLine, 'शानदार सर्विस और बेहतरीन माहौल। ज़रूर दोबारा आऊंगा। ✨')
      ];
    }
    return [
      join(`${where} में मेरा अनुभव सामान्य रहा।`, nLine, sLine, 'कुछ चीजों में सुधार की गुंजाइश है, पर कोशिश अच्छी थी।'),
      join(`${business} के बारे में मेरा फीडबैक।`, srvLine, nLine, 'उम्मीद है कि आने वाले समय में सर्विस और बेहतर होगी।'),
      join(`${where} में सर्विस ठीक-ठाक थी।`, nLine, 'क्वालिटी को और बेहतर करने का सुझाव है।')
    ];
  }

  // 3. HINGLISH
  if (lang.includes('hing') || lang.includes('hindi-eng')) {
    const sLine = staff ? `${staff} was very polite aur helpful.` : '';
    const srvLine = service ? `${service} ki service kaafi badhiya rahi.` : '';
    const nLine = sentence(note);
    if (rating >= 4) {
      return [
        join(`${where} par mera experience bohot accha raha!`, sLine, srvLine, nLine, 'Sab kuch super smooth aur organized tha. Definitely recommend karunga! ⭐', '😊'),
        join(`Recently visited ${where}.`, srvLine, sLine, nLine, 'Staff ka nature kaafi supportive tha aur service timely mili. Thank you!', '👍'),
        join(`Big thanks to the team at ${business}!`, sLine, nLine, 'Great atmosphere and truly professional service. Will visit again soon! ✨')
      ];
    }
    return [
      join(`My visit to ${where} was okay.`, nLine, sLine, 'Kuch areas me improvement ki zarurat hai.'),
      join(`Honest feedback for ${business}.`, srvLine, nLine, 'Hope team work karegi iss par.'),
      join(`Visited ${where} recently.`, nLine, 'Service could be slightly better next time.')
    ];
  }

  // 4. MARATHI
  if (lang.includes('marath')) {
    const sLine = staff ? `${staff} यांनी उत्तम सहकार्य केले.` : '';
    const srvLine = service ? `${service} ची सेवा खरोखरच खूप छान होती.` : '';
    const nLine = note ? `${note}.` : '';
    if (rating >= 4) {
      return [
        join(`${where} मधील अनुभव अत्यंत उत्कृष्ट होता!`, sLine, srvLine, nLine, 'सर्व्हिस आणि स्टाफ दोन्ही खूप चांगले आहेत. खूप खूप धन्यवाद! ⭐'),
        join(`मी नुकतीच ${where} ला भेट दिली.`, srvLine, sLine, nLine, 'सर्व गोष्टी वेळेवर आणि चांगल्या प्रकारे झाल्या. नक्की पुन्हा भेट देईन! 👍'),
        join(`${business} च्या संपूर्ण टीमचे मनापासून आभार!`, sLine, nLine, 'अतिशय विनम्र सेवा. Highly recommended! ✨')
      ];
    }
  }

  // 5. ENGLISH (DEFAULT)
  const staffLine = staff ? `${staff} was very polite and helpful throughout.` : '';
  const noteLine = sentence(note);

  if (rating >= 5) {
    const list5 = [
      join(pick(['Outstanding experience at', 'Exceptional service at', 'Had a wonderful visit to']), where + '!', noteLine, staffLine, pick(['The staff was exceptionally welcoming, professional, and quick.', 'Smooth, easy, and top quality.']), pick(['5 stars all the way! ⭐⭐⭐⭐⭐', 'Highly recommended to everyone! 😊', 'Will definitely be a regular! ✨'])),
      join(`Hands down one of the best in the area!`, `Everything at ${where} exceeded my expectations.`, staffLine, noteLine, pick(['Super polite staff and prompt response.', 'Clean environment and first-class customer care.']), pick(['👍', '⭐', '🙌'])),
      join(`Thank you to the entire team at ${business}!`, staffLine, noteLine, pick(['Clean, welcoming and extremely easy to deal with.', 'Top-notch service from start to finish.']), pick(['Will definitely be back! ✨', '10/10 experience! ⭐', 'Highly recommended! 👍']))
    ];
    return list5;
  }

  if (rating === 4) {
    const list4 = [
      join(pick(['Really good experience at', 'Very happy with my visit to']), where + '!', noteLine, staffLine, pick(['The staff was very polite, prompt, and attentive.', 'Everything was smooth and well-managed.']), pick(['Definitely recommended! 👍', 'Great team effort! ⭐', 'Will certainly visit again! 😊'])),
      join(`Pleasant experience at ${where}.`, staffLine, noteLine, 'Good customer support and quality service.', pick(['Just a minor wait, but overall very impressed.', 'Keep up the good work! 👍', 'Happy with the service! ✨'])),
      join(`Solid 4-star service from ${business}!`, staffLine, noteLine, 'Courteous staff and dependable assistance throughout.', pick(['Recommended! 👍', 'Will visit again soon.', 'Good overall experience!']))
    ];
    return list4;
  }

  const list3 = [
    join(`My visit to ${where} was overall decent.`, noteLine, staffLine, 'The staff was polite and helpful. There is a bit of room for improvement in speed, but appreciate the effort.'),
    join(`Average experience at ${business}.`, noteLine, 'The premises were clean and the team assisted nicely. Service could be a little faster, but overall okay.'),
    join(`Fair and honest feedback for ${where}.`, staffLine, noteLine, 'Friendly customer support. A few minor delays, but the team handled things respectfully.')
  ];
  return list3;
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
