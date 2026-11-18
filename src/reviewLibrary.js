// Offline review library for the "magic review" QR page. No API, no network.
// Hand-written sentences per business type and star rating are combined (opener + highlight +
// staff/service line + closer, in several shapes), which gives every business type thousands of
// distinct, natural-sounding reviews for each of 3, 4 and 5 stars.
// Placeholders: {biz} business name, {where} " in <city>" (or empty), {staff}, {service}.

const GROUPS = [
  {
    key: 'jewellery',
    match: ['jewel', 'gold', 'diamond', 'silver', 'ornament'],
    5: [
      'The designs are stunning and the craftsmanship is top-notch',
      'Pricing was completely transparent, with the weight and making charges explained clearly',
      'They have a huge collection for every budget, from daily wear to bridal sets',
      'The purity is certified and they gave proper bills and certificates',
      'They helped us pick the perfect set for a wedding without any pressure',
      'Their custom design work came out exactly the way we imagined',
      'The showroom is beautiful and you feel completely safe shopping here',
      'Old gold exchange was quick and the valuation was fair',
      'Every piece we bought has a lovely finish and shine',
      'They patiently showed us dozens of designs until we found the right one'
    ],
    4: [
      'Good collection with fair making charges',
      'Nice designs and an honest explanation of the pricing',
      'The billing and certificates were all in order',
      'They had good options in our budget',
      'Exchange of old jewellery was handled smoothly',
      'The custom order was delivered on time and looks nice',
      'Comfortable showroom and a no-pressure buying experience',
      'Quality of the finish is very good'
    ],
    3: [
      'Good designs, though the showroom was quite crowded',
      'Nice collection; the custom order took a little longer than promised',
      'Fair pricing overall, with a few designs a bit expensive for us',
      'Good quality pieces, and the billing just took some time',
      'Decent experience and helpful staff during a busy hour',
      'The designs we liked were good, the collection could be a little bigger'
    ]
  },
  {
    key: 'salon',
    match: ['salon', 'spa', 'beauty', 'parlour', 'parlor', 'barber', 'hair', 'haircut', 'hairstyle', 'makeup', 'make-up', 'nail', 'nails', 'unisex', 'grooming', 'bridal'],
    5: [
      'My haircut came out exactly the way I wanted',
      'The place is spotless and all the tools are properly sanitised',
      'They use good quality branded products, and you can feel the difference',
      'The facial left my skin glowing for days',
      'The massage was so relaxing that I almost fell asleep',
      'They listened carefully before starting and gave honest suggestions',
      'The bridal makeup looked flawless in every photo and lasted all day',
      'Hair colour came out even and natural looking',
      'Appointments run on time, so there was no waiting around',
      'The ambience is calm and very comfortable',
      'Prices are very reasonable for the quality of service'
    ],
    4: [
      'The haircut was neat and well done',
      'Clean place with good hygiene',
      'The facial was relaxing and the results were good',
      'They used good quality products',
      'Prices are fair for the service',
      'They listened to what I wanted',
      'The makeup was nice and lasted well',
      'Comfortable seating and a pleasant atmosphere'
    ],
    3: [
      'The haircut was good, though I had to wait a bit past my appointment',
      'Nice service overall; the place was busy on the weekend',
      'Good results, with slightly higher prices than expected',
      'The facial was nice; the room could have been a little quieter',
      'Decent service and a polite team, just a little rushed',
      'Happy with the final look, though it took longer than planned'
    ]
  },
  {
    key: 'health',
    match: ['clinic', 'doctor', 'dr.', 'dr', 'hospital', 'dental', 'dentist', 'physio', 'eye', 'skin', 'skincare', 'derma', 'diagnostic', 'lab', 'labs', 'laboratory', 'patholog', 'health', 'ayurved', 'homeopath', 'nursing', 'ortho', 'pediatric', 'paediatric', 'gyn', 'gynec', 'gynaec', 'ent', 'veterinar', 'pet care'],
    5: [
      'The doctor listened patiently and explained everything in simple words',
      'The diagnosis was accurate and the treatment worked quickly',
      'The clinic is very clean and well-maintained',
      'The waiting time was short and the appointment ran on time',
      'They never pushed unnecessary tests or medicines',
      'The whole procedure was painless and I felt comfortable throughout',
      'They followed up afterwards to check how I was feeling',
      'Reports were ready on time and clearly explained',
      'The consultation fees are very reasonable',
      'The doctor was calm and reassuring, which made a big difference',
      'They have modern equipment and maintain proper hygiene'
    ],
    4: [
      'The doctor explained the treatment clearly',
      'Clean and hygienic clinic',
      'The treatment helped and I am feeling better',
      'Reasonable consultation charges',
      'Reports were delivered on time',
      'The procedure went smoothly',
      'Appointments are easy to book',
      'Good follow-up after the visit'
    ],
    3: [
      'Good treatment, though the waiting time was a little long',
      'The doctor was helpful; the clinic was very crowded that day',
      'Treatment was effective, and the billing counter was slow',
      'The care was decent overall, though parking was difficult',
      'Good consultation, and the reports took a day longer than said',
      'Helpful staff and a busy clinic, but the treatment was fine'
    ]
  },
  {
    key: 'pharmacy',
    match: ['pharmacy', 'chemist', 'medical store', 'medicals', 'drug store', 'druggist'],
    5: [
      'They had every medicine on my prescription in stock',
      'Genuine medicines at a fair discount',
      'The pharmacist explained the dosage clearly',
      'Home delivery was fast and on time',
      'They quickly arranged a medicine that was hard to find elsewhere',
      'The store is clean and well organised',
      'Billing was quick and they always give a proper bill',
      'They are open late, which is a real help in emergencies'
    ],
    4: [
      'Good availability of medicines',
      'Fair prices with a small discount',
      'Quick billing',
      'The pharmacist was knowledgeable',
      'Home delivery worked well',
      'Clean and well stocked store'
    ],
    3: [
      'Most medicines were available, and one had to be ordered',
      'Good service, though there was a short queue',
      'Fair prices; the delivery came a little late',
      'Helpful pharmacist and a busy counter',
      'Decent store overall'
    ]
  },
  {
    key: 'stay',
    match: ['hotel', 'resort', 'guest house', 'guesthouse', 'lodge', 'homestay', 'hostel', 'inn', 'villa', 'banquet', 'party plot', 'farmhouse'],
    5: [
      'The room was spotless and very comfortable',
      'Check-in was quick and the front desk was very welcoming',
      'The breakfast spread was fresh and had lots of variety',
      'Beds were comfortable and the room was nice and quiet',
      'The location is perfect, with everything close by',
      'Housekeeping kept everything clean throughout our stay',
      'The view from our room was beautiful',
      'Excellent value for money compared with other places nearby',
      'Our event was managed perfectly, from decoration to catering',
      'Wi-Fi, AC and hot water all worked without any issues'
    ],
    4: [
      'Clean and comfortable rooms',
      'Smooth check-in and check-out',
      'Good breakfast options',
      'Convenient location',
      'Fair price for the facilities',
      'Housekeeping was regular and neat',
      'Peaceful stay overall',
      'The event arrangements were good'
    ],
    3: [
      'The room was clean, though a little smaller than expected',
      'Good location; breakfast could have more variety',
      'Comfortable stay overall, and check-in took some time',
      'Decent facilities with a bit of noise at night',
      'Good value, and a few things in the room needed attention',
      'Fine stay with helpful staff'
    ]
  },
  {
    key: 'cafe',
    match: ['cafe', 'café', 'coffee', 'tea', 'chai', 'bakery', 'bakers', 'cake', 'cakes', 'sweet', 'mithai', 'ice cream', 'icecream', 'dessert', 'juice', 'shake', 'snack', 'farsan', 'namkeen', 'chocolate'],
    5: [
      'The coffee is rich and perfectly made',
      'The cakes are fresh, soft and not overly sweet',
      'Their sweets taste pure and authentic, just like home',
      'The cosy ambience is perfect for spending a few hours',
      'Everything on the menu tastes fresh and well made',
      'The custom birthday cake looked beautiful and tasted even better',
      'Great place to hang out with friends',
      'Snacks were crispy, fresh and served hot',
      'Prices are very pocket-friendly for the quality',
      'Packaging was neat and perfect for gifting',
      'The shakes and desserts are absolutely delicious'
    ],
    4: [
      'Good coffee and a nice ambience',
      'Fresh cakes and pastries',
      'Sweets were tasty and fresh',
      'Good place to sit and relax',
      'Fair prices',
      'Neat packaging for takeaway',
      'Nice variety on the menu',
      'Snacks were fresh and tasty'
    ],
    3: [
      'Good coffee, though the place was crowded',
      'Tasty desserts; seating is a bit limited',
      'Fresh sweets, and the billing queue was long',
      'Nice taste overall, with slightly high prices',
      'Good snacks; service was a little slow',
      'Pleasant place, though the music was a bit loud'
    ]
  },
  {
    key: 'food',
    match: ['restaurant', 'food', 'foods', 'pizza', 'dhaba', 'biryani', 'kitchen', 'diner', 'thali', 'burger', 'meal', 'meals', 'takeaway', 'cuisine', 'chinese', 'punjabi', 'south indian', 'grill', 'bbq', 'tiffin', 'caterer', 'catering', 'eatery', 'mess', 'dining', 'domino', 'kfc', 'mcdonald', 'subway'],
    5: [
      'The food was fresh, hot and full of flavour',
      'Every dish we ordered tasted amazing',
      'Portions were generous and the taste was just like home-made',
      'Hygiene and cleanliness are clearly a priority here',
      'The food arrived quickly even though it was a busy evening',
      'Great value for money, with tasty food at fair prices',
      'The ambience is lovely and perfect for a family dinner',
      'They adjusted the spice level exactly the way we asked',
      'The menu has great variety and everything we tried was delicious',
      'Our takeaway was packed neatly and the food stayed hot',
      'Their signature dishes are a must-try',
      'Fresh ingredients and authentic taste in every bite'
    ],
    4: [
      'The food was tasty and served fresh',
      'Good taste and decent portions for the price',
      'Nice ambience and quick service',
      'Most dishes were really good',
      'Clean place and well-behaved staff',
      'The food took a little time but was worth the wait',
      'Good variety on the menu',
      'Reasonable prices for the quality'
    ],
    3: [
      'The food was good, though it took a while to arrive',
      'Tasty food, but the place was quite crowded',
      'Decent food and fair prices; the seating could be more comfortable',
      'Most dishes were good, and a few could use a little more flavour',
      'Good food overall, though the service was slow during the rush',
      'Nice taste, though portions could be slightly bigger'
    ]
  },
  {
    key: 'fashion',
    match: ['cloth', 'garment', 'boutique', 'fashion', 'saree', 'sari', 'textile', 'apparel', 'shoe', 'shoes', 'footwear', 'tailor', 'ethnic', 'wear', 'dress', 'kurti', 'menswear', 'readymade'],
    5: [
      'Amazing collection with the latest designs',
      'The fabric quality is excellent and lasts long',
      'They had options in every size and colour I needed',
      'Prices are very reasonable for this quality',
      'Alterations were done quickly and fit perfectly',
      'They patiently showed me many options without any pressure',
      'The stitching and finishing are perfect',
      'They have a great wedding and festive collection',
      'The trial rooms are clean and comfortable',
      'Exchange was hassle-free when I needed a different size'
    ],
    4: [
      'Good collection and quality',
      'Fair prices',
      'Alterations were done on time',
      'Nice variety of designs',
      'Good fabric and finishing',
      'The exchange process was easy',
      'Comfortable shopping experience',
      'Good festive collection'
    ],
    3: [
      'Good collection, though some sizes were not available',
      'Nice designs; the trial room queue was long',
      'Fair quality, and the alteration took an extra day',
      'Decent variety with slightly high prices',
      'Good options, and billing was a bit slow',
      'Nice store, though it was very crowded on the weekend'
    ]
  },
  {
    key: 'electronics',
    match: ['electronic', 'mobile', 'phone', 'computer', 'laptop', 'appliance', 'gadget', 'camera', 'tv', 'television', 'ac repair', 'refrigerator', 'cctv', 'printer'],
    5: [
      'They had the latest models at the best prices in the area',
      'The repair was done quickly and the device works like new',
      'They explained all the features and helped me compare options honestly',
      'Genuine products with a proper bill and warranty',
      'Setup and data transfer were done for free',
      'They suggested the right product for my budget instead of the most expensive one',
      'After-sales support is genuinely helpful',
      'Installation was done on time and very neatly',
      'Great exchange offer on my old device',
      'They diagnosed the problem correctly and charged a fair price'
    ],
    4: [
      'Good range of products',
      'The repair was done well',
      'Fair prices with a proper bill',
      'Helpful product demo',
      'Installation was on time',
      'Good after-sales support',
      'Genuine products with warranty',
      'Good exchange value'
    ],
    3: [
      'The repair was good, though it took a day more than promised',
      'Good products; the stock of some models was limited',
      'Fair pricing, and installation was a little delayed',
      'Helpful staff during a busy time',
      'Decent experience overall',
      'The device works fine now, and the update on its status could be quicker'
    ]
  },
  {
    key: 'auto',
    match: ['car', 'cars', 'bike', 'bikes', 'auto', 'garage', 'motor', 'tyre', 'tyres', 'tire', 'service center', 'service centre', 'showroom', 'vehicle', 'scooter', 'automobile', 'wash', 'detailing', 'honda', 'hero', 'maruti suzuki', 'tata motors', 'hyundai', 'mahindra', 'toyota', 'yamaha', 'bajaj', 'tvs'],
    5: [
      'My vehicle was serviced thoroughly and returned on time',
      'They explained every repair and the cost before starting',
      'Billing was transparent with no hidden charges',
      'My car came back spotless after the service',
      'They fixed an issue other garages could not find',
      'Genuine spare parts at fair prices',
      'The pick-up and drop facility was very convenient',
      'The vehicle drives much smoother after the service',
      'The test drive and delivery process was smooth and well organised',
      'They kept me updated on the work throughout the day'
    ],
    4: [
      'Good service and on-time delivery',
      'Transparent billing',
      'The vehicle was washed and cleaned nicely',
      'The issue was fixed properly',
      'Genuine spare parts used',
      'Helpful service advisor',
      'Convenient pick-up and drop',
      'Smooth delivery process'
    ],
    3: [
      'The service was good, though delivery was a few hours late',
      'Issue fixed, and the waiting area could be more comfortable',
      'Fair work overall; billing took some time',
      'Good service with slightly higher labour charges',
      'Decent experience with a polite service team',
      'The vehicle runs fine now, and updates during the service could be better'
    ]
  },
  {
    key: 'education',
    match: ['school', 'coaching', 'classes', 'academy', 'institute', 'tuition', 'college', 'training', 'education', 'tutor', 'learning', 'study', 'ielts', 'english speaking'],
    5: [
      'The teachers are experienced, patient and explain concepts very clearly',
      'My child has improved a lot in just a few months',
      'Regular tests and feedback helped track progress',
      'Small batch sizes mean every student gets personal attention',
      'Study material is well prepared and to the point',
      'Doubt-solving sessions are really helpful',
      'The environment is disciplined yet friendly',
      'They keep parents updated about progress regularly',
      'The practical training made the concepts easy to understand',
      'Fees are reasonable for the quality of teaching'
    ],
    4: [
      'Good teachers and clear explanations',
      'Regular tests and feedback',
      'Helpful study material',
      'Visible improvement in results',
      'Good doubt-solving support',
      'Disciplined environment',
      'Reasonable fees',
      'Good communication with parents'
    ],
    3: [
      'Good teaching, though batches are a little large',
      'Helpful faculty; the schedule changed a few times',
      'Decent study material and good doubt sessions',
      'Fair fees, and the classroom could be more spacious',
      'Good experience overall with some room to improve',
      'Teachers are good, and updates to parents could be more regular'
    ]
  },
  {
    key: 'fitness',
    match: ['gym', 'fitness', 'yoga', 'zumba', 'crossfit', 'sports', 'dance', 'martial', 'karate', 'swimming', 'pilates', 'aerobics'],
    5: [
      'The trainers are knowledgeable and genuinely motivating',
      'Modern equipment that is always well maintained',
      'I saw real results within the first couple of months',
      'The workout plan was personalised for my goals',
      'The gym is clean, spacious and well ventilated',
      'The yoga sessions are calm, well guided and very effective',
      'Great energy and a friendly crowd',
      'The diet guidance alongside training made a big difference',
      'Flexible timings that suit a busy schedule',
      'Fair membership fees for the facilities on offer'
    ],
    4: [
      'Good trainers and equipment',
      'Clean and well maintained',
      'Helpful workout guidance',
      'Good results so far',
      'Flexible timings',
      'Motivating environment',
      'Fair membership plans',
      'Well guided sessions'
    ],
    3: [
      'Good equipment, though it gets crowded in the evenings',
      'Helpful trainers; the changing room could be cleaner',
      'Decent sessions with a bit of waiting for machines',
      'Fair fees and a good atmosphere overall',
      'Good classes, and the timings could be more flexible',
      'Nice place overall with some room for improvement'
    ]
  },
  {
    key: 'realestate',
    match: ['real estate', 'realty', 'property', 'properties', 'builder', 'developer', 'construction', 'interior', 'architect', 'estate agent', 'broker'],
    5: [
      'They understood our requirements and showed only relevant properties',
      'All the paperwork was handled smoothly and transparently',
      'The construction quality is excellent and delivered as promised',
      'The interior design turned our home into exactly what we dreamed of',
      'They were honest about pricing and never pushed us',
      'The project was completed on time and within budget',
      'Site visits were well organised and informative',
      'Very professional team with great attention to detail',
      'They helped us with the loan process as well',
      'After-handover support has been excellent'
    ],
    4: [
      'Good options within our budget',
      'Smooth documentation',
      'Good construction quality',
      'Nice interior work',
      'Transparent dealings',
      'Well organised site visits',
      'Professional team',
      'Helpful with the loan process'
    ],
    3: [
      'Good work overall, though the timeline stretched a little',
      'Helpful team; the paperwork took longer than expected',
      'Decent quality with a few small finishing issues',
      'Fair dealings, and communication could be faster',
      'Good options, though the site visits had to be rescheduled',
      'Satisfied overall with some room to improve'
    ]
  },
  {
    key: 'tech',
    match: ['software', 'infotech', 'infosoft', 'technolog', 'digital', 'marketing', 'web', 'it services', 'it solutions', 'solutions', 'app develop', 'seo', 'agency', 'design studio', 'branding', 'media', 'printing', 'advertis'],
    5: [
      'They understood our requirements quickly and delivered exactly what we needed',
      'The website they built is fast, modern and easy to manage',
      'The project was delivered on time with regular updates along the way',
      'Very responsive support even after the project was completed',
      'Their digital marketing brought us real enquiries within weeks',
      'Clean, professional work with great attention to detail',
      'Pricing was transparent and very reasonable',
      'They explained the technical things in simple language',
      'The design work was creative and matched our brand perfectly',
      'Changes were handled quickly and without any fuss'
    ],
    4: [
      'Good quality work',
      'Delivered on time',
      'Responsive support',
      'Clear communication',
      'Fair pricing',
      'Professional team',
      'Good design sense',
      'Changes were handled well'
    ],
    3: [
      'Good work overall, though delivery took a little longer',
      'Helpful team; a few revisions were needed',
      'Decent results, and updates could be more frequent',
      'Fair pricing with good support',
      'Satisfied with the final output after some back and forth',
      'Good team with some room to improve in timelines'
    ]
  },
  {
    key: 'travel',
    match: ['travel', 'tour', 'tours', 'tourism', 'holiday', 'ticket', 'visa', 'cab', 'taxi', 'rental', 'transport', 'logistics', 'courier', 'packers', 'movers'],
    5: [
      'The whole trip was planned perfectly, with no hassles at all',
      'Hotels, transfers and sightseeing were exactly as promised',
      'They got us the best fares and were available on call throughout',
      'The visa process was handled smoothly and quickly',
      'The driver was punctual, polite and drove very safely',
      'Our goods were packed carefully and delivered without a scratch',
      'Great package at a very reasonable price',
      'They handled a last-minute change without any trouble',
      'Delivery was fast and the tracking updates were accurate',
      'Every detail of the itinerary was well thought out'
    ],
    4: [
      'Well planned trip',
      'Good hotels and transfers',
      'Reasonable package price',
      'Punctual and safe driver',
      'Smooth visa process',
      'Careful packing and delivery',
      'Helpful on call during the trip',
      'On-time delivery'
    ],
    3: [
      'Good trip overall, though one hotel was average',
      'Fair package; the pickup was slightly late',
      'Decent service and helpful staff',
      'The delivery arrived a day late, but everything was intact',
      'Good arrangements with some small hiccups',
      'Satisfied overall with some room to improve'
    ]
  },
  {
    key: 'grocery',
    match: ['grocery', 'grocer', 'supermarket', 'kirana', 'mart', 'provision', 'vegetable', 'fruit', 'dairy', 'general store', 'departmental', 'hypermarket', 'organic'],
    5: [
      'Everything I needed was available under one roof',
      'Fresh fruits and vegetables every single time',
      'Prices are lower than other stores nearby',
      'Home delivery is quick and they never miss an item',
      'The store is clean and very well organised',
      'Billing is fast even when it is busy',
      'Good offers and discounts every week',
      'They keep good quality branded and local products'
    ],
    4: [
      'Good variety of products',
      'Fresh stock',
      'Fair prices',
      'Quick home delivery',
      'Clean and organised store',
      'Fast billing',
      'Good weekly offers'
    ],
    3: [
      'Good store, though a few items were out of stock',
      'Fresh products; the billing queue was long',
      'Fair prices, and the delivery came a bit late',
      'Decent variety overall',
      'Good store with limited parking'
    ]
  }
];

const GENERAL = {
  key: 'general',
  5: [
    'The service was quick, professional and exactly what I needed',
    'Everything was handled smoothly from start to finish',
    'The quality of work is excellent',
    'They were transparent about pricing with no hidden charges',
    'Very reliable, and the work was done on time',
    'They understood my requirement immediately',
    'The place is clean, well organised and welcoming',
    'Great value for money',
    'They paid attention to every small detail',
    'Problem solved on the first visit itself',
    'Very easy to reach and quick to respond'
  ],
  4: [
    'Good service and fair prices',
    'Work was done on time',
    'Professional and reliable',
    'Clean and well organised place',
    'Good quality of work',
    'Transparent pricing',
    'Quick response',
    'Smooth experience overall'
  ],
  3: [
    'Good service, though it took a little longer than expected',
    'Decent work overall with some room to improve',
    'Fair pricing and a helpful team during a busy time',
    'The work was fine, and communication could be a little quicker',
    'Satisfied overall with a few small hiccups',
    'Good experience, though the place was quite busy'
  ]
};

const OPENERS = {
  5: [
    'Absolutely loved my experience at {biz}{where}!',
    'Highly recommend {biz} to everyone!',
    '{biz} is easily a 5-star experience.',
    'Had a fantastic experience at {biz}.',
    'Really impressed with {biz}{where}.',
    'So glad I chose {biz}!',
    'Excellent experience from start to finish at {biz}.',
    "Couldn't be happier with {biz}.",
    'Visited {biz}{where} and it was wonderful.',
    'Top-class experience at {biz}!',
    '{biz} truly deserves 5 stars.',
    'One of the best experiences I have had{where}, thanks to {biz}.'
  ],
  4: [
    'Very good experience at {biz}{where}.',
    'Happy with my visit to {biz}.',
    '{biz} is a good choice{where}.',
    'Had a nice experience at {biz}.',
    'Good experience overall at {biz}.',
    'Pleasant visit to {biz}{where}.',
    'Pretty satisfied with {biz}.',
    'Would recommend {biz}.',
    'Liked my experience at {biz}.',
    'A solid 4 stars for {biz}.'
  ],
  3: [
    'Decent experience at {biz}{where}.',
    'My visit to {biz} was good overall.',
    '{biz} is a fair option{where}.',
    'Mostly positive experience at {biz}.',
    'Had a reasonable experience at {biz}.',
    'Good visit to {biz} with a little room to improve.',
    '{biz} did a decent job.',
    'Overall a fine experience at {biz}{where}.'
  ]
};

const PEOPLE = {
  5: [
    'The staff was friendly, polite and very helpful.',
    'Everyone on the team was warm and professional.',
    'The team explained everything clearly and patiently.',
    'Customer service here is genuinely excellent.',
    'They went out of their way to make us comfortable.',
    'Quick responses and very courteous behaviour.',
    'You can tell the team really cares about its customers.',
    'Every question was answered with a smile.'
  ],
  4: [
    'The staff was polite and helpful.',
    'The team was courteous and responsive.',
    'Service was prompt and friendly.',
    'Staff answered all our questions patiently.',
    'Friendly people and good service.',
    'The team was professional throughout.'
  ],
  3: [
    'The staff was polite, though a bit busy.',
    'The team was helpful once they were free.',
    'Service was okay and the staff was courteous.',
    'Staff was friendly but could be a little quicker.',
    'The team tried their best during a rush.'
  ]
};
const STAFF_LINES = {
  5: ['Special thanks to {staff} for taking such good care of us.', '{staff} was extremely helpful and professional.', 'A big thank you to {staff} for the excellent service.'],
  4: ['{staff} was very helpful.', 'Thanks to {staff} for the good service.'],
  3: ['{staff} helped us well.', 'Thanks to {staff} for the help.']
};
const SERVICE_LINES = {
  5: ['Tried their {service} and it was excellent.', 'Their {service} is the best I have experienced.', 'Loved the {service}, it was worth every rupee.'],
  4: ['The {service} was really good.', 'Happy with the {service}.'],
  3: ['The {service} was good overall.', 'The {service} was decent.']
};

const CLOSERS = {
  5: [
    'Will definitely visit again!',
    'Highly recommended! ⭐⭐⭐⭐⭐',
    'Keep up the great work!',
    'Thank you, {biz}!',
    'Recommending this to all my friends and family.',
    '10/10, would come back anytime.',
    'Worth every rupee!',
    "Can't wait to come back. 😊",
    'Five stars, well deserved!',
    'Truly a wonderful experience. 🙌'
  ],
  4: [
    'Will come again.',
    'Recommended.',
    'Keep it up! 👍',
    'Good job, team.',
    'Would visit again for sure.',
    'Happy overall.',
    'Worth a visit.',
    'Thanks, {biz}!'
  ],
  3: [
    'Would give it another try.',
    'Hope to see small improvements next time.',
    'Overall a fair experience.',
    'Good effort by the team.',
    'Might visit again.',
    'Thanks to the team for their help.'
  ]
};

const pick = (arr, used) => {
  const fresh = used ? arr.filter(x => !used.has(x)) : arr;
  const list = fresh.length ? fresh : arr;
  const v = list[Math.floor(Math.random() * list.length)];
  if (used) used.add(v);
  return v;
};
const sentence = s => {
  const t = String(s).trim();
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return /[.!?]$/.test(cap) || /\p{Extended_Pictographic}$/u.test(cap) ? cap : cap + '.';
};

// Finds the business type from its category (and name as a backup).
// Keywords match at the start of a word; short ones (4 letters or less) must be the whole word,
// so "spa" does not match "space" and "tea" does not match "team".
const norm = v => ` ${String(v || '').toLowerCase().replace(/[_/&,|()-]+/g, ' ')} `;
const kwRegex = new Map();
const hasKeyword = (text, kw) => {
  const k = kw.trim().toLowerCase();
  if (!kwRegex.has(k)) {
    const esc = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    kwRegex.set(k, new RegExp(`(^|[^a-z0-9])${esc}${k.length <= 4 ? '($|[^a-z0-9])' : ''}`));
  }
  return kwRegex.get(k).test(text);
};
const matchGroup = text => GROUPS.find(g => g.match.some(m => hasKeyword(text, m)));

export function reviewGroupFor(category = '', name = '') {
  return matchGroup(norm(category)) || matchGroup(norm(name)) || GENERAL;
}

// How many distinct reviews the library can produce for a business type and star rating
export function reviewVariety(category = '', rating = 5) {
  const g = reviewGroupFor(category);
  const r = rating >= 5 ? 5 : rating === 4 ? 4 : 3;
  const h = g[r].length, o = OPENERS[r].length, p = PEOPLE[r].length, c = CLOSERS[r].length;
  // shapes: opener+highlight+people+closer, opener+2 highlights+closer, highlight+people+closer, opener+highlight+closer
  return o * h * p * c + o * h * (h - 1) * c + h * p * c + o * h * c;
}

/**
 * Builds `count` different ready-to-post reviews for a 3, 4 or 5 star rating.
 * @param {{ rating:number, name?:string, city?:string, category?:string, staff?:string[], services?:string[], count?:number }} opts
 */
export function buildReviewDrafts({ rating = 5, name = '', city = '', category = '', staff = [], services = [], count = 3 } = {}) {
  const r = rating >= 5 ? 5 : rating === 4 ? 4 : 3;
  const g = reviewGroupFor(category, name);
  const biz = (name || '').trim() || 'this place';
  const where = city ? ` in ${city}` : '';
  const staffList = (Array.isArray(staff) ? staff : String(staff || '').split(',')).map(s => String(s).trim()).filter(Boolean);
  const serviceList = (Array.isArray(services) ? services : String(services || '').split(',')).map(s => String(s).trim()).filter(Boolean);
  const fill = s => s.replace(/\{biz\}/g, biz).replace(/\{where\}/g, where);

  const usedHighlights = new Set();
  const usedOpeners = new Set();
  const usedPeople = new Set();
  const usedClosers = new Set();
  const shapes = ['full', 'double', 'short', 'simple'].sort(() => Math.random() - 0.5);
  const out = [];

  for (let i = 0; out.length < count && i < count * 6; i++) {
    const shape = shapes[i % shapes.length];
    const opener = fill(pick(OPENERS[r], usedOpeners));
    const h1 = sentence(fill(pick(g[r], usedHighlights)));
    const h2 = sentence(fill(pick(g[r], usedHighlights)));
    let people = pick(PEOPLE[r], usedPeople);
    // Mention a real staff member or service now and then, when the business has listed them
    if (staffList.length && Math.random() < 0.45) people = pick(STAFF_LINES[r]).replace('{staff}', pick(staffList));
    else if (serviceList.length && Math.random() < 0.45) people = pick(SERVICE_LINES[r]).replace('{service}', pick(serviceList));
    const closer = fill(pick(CLOSERS[r], usedClosers));

    let parts;
    if (shape === 'full') parts = [opener, h1, people, closer];
    else if (shape === 'double') parts = [opener, h1, h2, closer];
    else if (shape === 'short') parts = [h1, people, closer];
    else parts = [opener, h1, closer];
    const text = parts.join(' ').replace(/\s+/g, ' ').trim();
    if (!out.includes(text)) out.push(text);
  }
  return out;
}
