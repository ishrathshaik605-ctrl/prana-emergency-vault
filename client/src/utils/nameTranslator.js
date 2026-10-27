/**
 * nameTranslator.js
 * Comprehensive Indic Localization for User Names, Personas, and Relationships.
 * Supports Telugu (te), Hindi (hi), Kannada (kn), Tamil (ta), Bengali (bn), Marathi (mr), and English (en).
 */

// Full Name Exact Dictionaries
export const FULL_NAMES = {
  'ramesh patel': {
    te: 'రమేష్ పటేల్',
    hi: 'रमेश पटेल',
    kn: 'ರಮೇಶ್ ಪಟೇಲ್',
    ta: 'ரமேஷ் படேல்',
    bn: 'রমেশ প্যাটেল',
    mr: 'रमेश पटेल'
  },
  'priya sharma': {
    te: 'ప్రియా శర్మ',
    hi: 'प्रिया शर्मा',
    kn: 'ಪ್ರಿಯಾ ಶರ್ಮಾ',
    ta: 'பிரியா சர்மா',
    bn: 'প্রিয়া শর্মা',
    mr: 'प्रिया शर्मा'
  },
  'suresh patel': {
    te: 'సురేష్ పటేల్',
    hi: 'सुरेश पटेल',
    kn: 'ಸುರೇಶ್ ಪಟೇಲ್',
    ta: 'சுரேஷ் படேல்',
    bn: 'সুরেশ প্যাটেল',
    mr: 'सुरेश पटेल'
  },
  'geeta patel': {
    te: 'గీతా పటేల్',
    hi: 'गीता पटेल',
    kn: 'ಗೀತಾ ಪಟೇಲ್',
    ta: 'கீதா படேல்',
    bn: 'গীতা প্যাটেল',
    mr: 'गीता पटेल'
  },
  'rahul sharma': {
    te: 'రాహుల్ శర్మ',
    hi: 'राहुल शर्मा',
    kn: 'ರಾಹುಲ್ ಶರ್ಮಾ',
    ta: 'ராகுல் சர்மா',
    bn: 'রাহুল শর্মা',
    mr: 'राहुल शर्मा'
  },
  'ananya sen': {
    te: 'అనన్యా సేన్',
    hi: 'अनन्या सेन',
    kn: 'ಅನನ್ಯಾ ಸೇನ್',
    ta: 'அனன்யா சென்',
    bn: 'অনন্যা সেন',
    mr: 'अनन्या सेन'
  },
  'harish bhai patel': {
    te: 'హరీష్ భాయ్ పటేల్',
    hi: 'हरीश भाई पटेल',
    kn: 'ಹರೀಶ್ ಭಾಯಿ ಪಟೇಲ್',
    ta: 'ஹரீஷ் பாய் படேல்',
    bn: 'হরিশ ভাই প্যাটেল',
    mr: 'हरीश भाई पटेल'
  },
  'harish patel': {
    te: 'హరీష్ పటేల్',
    hi: 'हरीश पटेल',
    kn: 'ಹರೀಶ್ ಪಟೇಲ್',
    ta: 'ஹரீஷ் படேல்',
    bn: 'হরিশ প্যাটেল',
    mr: 'हरीश पटेल'
  },
  'neha roy': {
    te: 'నేహా రాయ్',
    hi: 'नेहा रॉय',
    kn: 'ನೇಹಾ ರಾಯ್',
    ta: 'நேஹா ராய்',
    bn: 'নেহা রায়',
    mr: 'नेहा रॉय'
  },
  'dr. rajesh mehta': {
    te: 'డాక్టర్ రాజేష్ మెహతా',
    hi: 'डॉ. राजेश मेहता',
    kn: 'ಡಾ. ರಾಜೇಶ್ ಮೆಹ್ತಾ',
    ta: 'டாக்டர் ராஜேஷ் மேத்தா',
    bn: 'ডা. রাজেশ মেহতা',
    mr: 'डॉ. राजेश मेहता'
  },
  'rajesh mehta': {
    te: 'రాజేష్ మెహతా',
    hi: 'राजेश मेहता',
    kn: 'ರಾಜೇಶ್ ಮೆಹ್ತಾ',
    ta: 'ராஜேஷ் மேத்தா',
    bn: 'রাজেশ মেহতা',
    mr: 'राजेश मेहता'
  },
  'emergency patient': {
    te: 'అత్యవసర రోగి',
    hi: 'आपातकालीन मरीज',
    kn: 'ತುರ್ತು ರೋಗಿ',
    ta: 'அவசர நோயாளி',
    bn: 'জরুরি রোগী',
    mr: 'आपत्कालीन रुग्ण'
  },
  'shaik ishrath': {
    te: 'షేక్ ఇష్రత్',
    hi: 'शेख इशरत',
    kn: 'ಶೇಕ್ ಇಶ್ರತ್',
    ta: 'ஷேக் இஷ்ரத்',
    bn: 'শেখ ইশরাত',
    mr: 'शेख इशरत'
  }
};

// Word / Name Token Dictionary for Given Names, Surnames, Titles
export const NAME_TOKENS = {
  // Titles
  'dr': { te: 'డా.', hi: 'डॉ.', kn: 'ಡಾ.', ta: 'டாக்டர்', bn: 'ডা.', mr: 'डॉ.' },
  'dr.': { te: 'డా.', hi: 'डॉ.', kn: 'ಡಾ.', ta: 'டாக்டர்', bn: 'ডা.', mr: 'डॉ.' },
  'doctor': { te: 'వైద్యుడు', hi: 'डॉक्टर', kn: 'ವೈದ್ಯರು', ta: 'மருத்துவர்', bn: 'ডাক্তার', mr: 'डॉक्टर' },
  'mr': { te: 'శ్రీ', hi: 'श्री', kn: 'ಶ್ರೀ', ta: 'திரு', bn: 'শ্রী', mr: 'श्री' },
  'mr.': { te: 'శ్రీ', hi: 'श्री', kn: 'ಶ್ರೀ', ta: 'திரு', bn: 'শ্রী', mr: 'श्री' },
  'mrs': { te: 'శ్రీమతి', hi: 'श्रीमती', kn: 'ಶ್ರೀಮತಿ', ta: 'திருமதி', bn: 'শ্রীমতি', mr: 'श्रीमती' },
  'mrs.': { te: 'శ్రీమతి', hi: 'श्रीमती', kn: 'ಶ್ರೀಮತಿ', ta: 'திருமதி', bn: 'শ্রীমতি', mr: 'श्रीमती' },

  // First Names
  'ramesh': { te: 'రమేష్', hi: 'रमेश', kn: 'ರಮೇಶ್', ta: 'ரமேஷ்', bn: 'রমেশ', mr: 'रमेश' },
  'priya': { te: 'ప్రియ', hi: 'प्रिया', kn: 'ಪ್ರಿಯಾ', ta: 'பிரியா', bn: 'প্রিয়া', mr: 'प्रिया' },
  'suresh': { te: 'సురేష్', hi: 'सुरेश', kn: 'ಸುರೇಶ್', ta: 'சுரேஷ்', bn: 'সুরেশ', mr: 'सुरेश' },
  'geeta': { te: 'గీత', hi: 'गीता', kn: 'ಗೀತಾ', ta: 'கீதா', bn: 'গীতা', mr: 'गीता' },
  'gita': { te: 'గీత', hi: 'गीता', kn: 'ಗೀತಾ', ta: 'கீதா', bn: 'গীতা', mr: 'गीता' },
  'rahul': { te: 'రాహుల్', hi: 'राहुल', kn: 'ರಾಹುಲ್', ta: 'ராகுல்', bn: 'রাহুল', mr: 'राहुल' },
  'ananya': { te: 'అనన్య', hi: 'अनन्या', kn: 'ಅನನ್ಯಾ', ta: 'அனன்யா', bn: 'অনন্যা', mr: 'अनन्या' },
  'harish': { te: 'హరీష్', hi: 'हरीश', kn: 'ಹರೀಶ್', ta: 'ஹரீஷ்', bn: 'হরিশ', mr: 'हरीश' },
  'neha': { te: 'నేహా', hi: 'नेहा', kn: 'ನೇಹಾ', ta: 'நேஹா', bn: 'নেহা', mr: 'नेहा' },
  'rajesh': { te: 'రాజేష్', hi: 'राजेश', kn: 'ರಾಜೇಶ್', ta: 'ராஜேஷ்', bn: 'রাজেশ', mr: 'राजेश' },
  'vikram': { te: 'విక్రమ్', hi: 'विक्रम', kn: 'ವಿಕ್ರಮ್', ta: 'விக்ரம்', bn: 'বিক্রম', mr: 'विक्रम' },
  'amit': { te: 'అమిత్', hi: 'अमित', kn: 'ಅಮಿತ್', ta: 'அமித்', bn: 'অমিত', mr: 'अमित' },
  'sumit': { te: 'సుమిత్', hi: 'सुमित', kn: 'ಸುಮಿತ್', ta: 'சுமித்', bn: 'সুমিত', mr: 'सुमित' },
  'rohit': { te: 'రోహిత్', hi: 'रोहित', kn: 'ರೋಹಿತ್', ta: 'ரோஹித்', bn: 'রোহিত', mr: 'रोहित' },
  'ankit': { te: 'అంకిత్', hi: 'अंकित', kn: 'ಅಂಕಿತ್', ta: 'அங்கித்', bn: 'অঙ্কিত', mr: 'अंकित' },
  'deepak': { te: 'దీపక్', hi: 'दीपक', kn: 'ದೀಪಕ್', ta: 'தீபக்', bn: 'দীপক', mr: 'दीपक' },
  'manoj': { te: 'మనోజ్', hi: 'मनोज', kn: 'ಮನೋಜ್', ta: 'மனோஜ்', bn: 'মনোজ', mr: 'मनोज' },
  'sanjay': { te: 'సంజయ్', hi: 'संजय', kn: 'ಸಂಜಯ್', ta: 'சஞ்சய்', bn: 'সঞ্জয়', mr: 'संजय' },
  'vijay': { te: 'విజయ్', hi: 'विजय', kn: 'ವಿಜಯ್', ta: 'விஜய்', bn: 'বিজয়', mr: 'विजय' },
  'ajay': { te: 'అజయ్', hi: 'अजय', kn: 'ಅಜಯ್', ta: 'அஜய்', bn: 'অজয়', mr: 'अजय' },
  'ravi': { te: 'రవి', hi: 'रवि', kn: 'ರವಿ', ta: 'ரவி', bn: 'রবি', mr: 'रवि' },
  'krishna': { te: 'కృష్ణ', hi: 'कृष्ण', kn: 'ಕೃಷ್ಣ', ta: 'கிருஷ்ணா', bn: 'কৃষ্ণ', mr: 'कृष्ण' },
  'mahesh': { te: 'మహేష్', hi: 'महेश', kn: 'ಮಹೇಶ್', ta: 'மகேஷ்', bn: 'মহেশ', mr: 'महेश' },
  'ganesh': { te: 'గణేష్', hi: 'गणेश', kn: 'ಗಣೇಶ್', ta: 'கணேஷ்', bn: 'গণেশ', mr: 'गणेश' },
  'dinesh': { te: 'దినేష్', hi: 'दिनेश', kn: 'ದಿನೇಶ್', ta: 'தினேஷ்', bn: 'দীনেশ', mr: 'दिनेश' },
  'sunil': { te: 'సునీల్', hi: 'सुनील', kn: 'ಸುನಿಲ್', ta: 'சுனில்', bn: 'সুনীল', mr: 'सुनील' },
  'anil': { te: 'అనిల్', hi: 'अनिल', kn: 'ಅನಿಲ್', ta: 'அனில்', bn: 'অনিল', mr: 'अनिल' },
  'arjun': { te: 'అర్జున్', hi: 'अर्जुन', kn: 'ಅರ್ಜುನ್', ta: 'அர்ஜுன்', bn: 'অর্জুন', mr: 'अर्जुन' },
  'karthik': { te: 'కార్తీక్', hi: 'कार्तिक', kn: 'ಕಾರ್ತಿಕ್', ta: 'கார்த்திக்', bn: 'কার্তিক', mr: 'कार्तिक' },
  'sai': { te: 'సాయి', hi: 'साई', kn: 'ಸಾಯಿ', ta: 'சாய்', bn: 'সাই', mr: 'साई' },
  'surya': { te: 'సూర్య', hi: 'सूर्य', kn: 'ಸೂರ್ಯ', ta: 'சூர்யா', bn: 'সূর্য', mr: 'सूर्य' },
  'naveen': { te: 'నవీన్', hi: 'नवीन', kn: 'ನವೀನ್', ta: 'நவீன்', bn: 'নবীন', mr: 'नवीन' },
  'charan': { te: 'చరణ్', hi: 'चरण', kn: 'ಚರಣ್', ta: 'சரண்', bn: 'চরণ', mr: 'चरण' },
  'teja': { te: 'తేజ', hi: 'तेजा', kn: 'ತೇಜ', ta: 'தேஜா', bn: 'তেজা', mr: 'तेजा' },
  'pranav': { te: 'ప్రణవ్', hi: 'प्रणव', kn: 'ಪ್ರಣವ್', ta: 'பிரணவ்', bn: 'প্রণব', mr: 'प्रणव' },
  'aditya': { te: 'ఆదిత్య', hi: 'आदित्य', kn: 'ಆದಿತ್ಯ', ta: 'ஆதித்யா', bn: 'আদিত্য', mr: 'आदित्य' },
  'kiran': { te: 'కిరణ్', hi: 'किरण', kn: 'ಕಿರಣ್', ta: 'கிரண்', bn: 'কিরণ', mr: 'किरण' },
  'sandeep': { te: 'సందీప్', hi: 'संदीप', kn: 'ಸಂದೀಪ್', ta: 'சந்தீப்', bn: 'সন্দীপ', mr: 'संदीप' },
  'divya': { te: 'దివ్య', hi: 'दिव्या', kn: 'ದಿವ್ಯ', ta: 'திவ்யா', bn: 'দিব্যা', mr: 'दिव्या' },
  'kavya': { te: 'కావ్య', hi: 'काव्या', kn: 'ಕಾವ್ಯ', ta: 'காவ்யா', bn: 'কাব্যা', mr: 'काव्या' },
  'swathi': { te: 'స్వాతి', hi: 'स्वाति', kn: 'ಸ್ವಾತಿ', ta: 'சுவாதி', bn: 'স্বাতী', mr: 'स्वाती' },
  'bhavani': { te: 'భవాని', hi: 'भवानी', kn: 'ಭವಾನಿ', ta: 'பவானி', bn: 'ভবানী', mr: 'भवानी' },
  'padma': { te: 'పద్మ', hi: 'पद्मा', kn: 'ಪದ್ಮ', ta: 'பத்மா', bn: 'পদ্মা', mr: 'पद्मा' },
  'radha': { te: 'రాధ', hi: 'राधा', kn: 'ರಾಧಾ', ta: 'ராதா', bn: 'রাধা', mr: 'राधा' },
  'shanti': { te: 'శాంతి', hi: 'शांति', kn: 'ಶಾಂತಿ', ta: 'சாந்தி', bn: 'শান্তি', mr: 'शांती' },
  'meena': { te: 'మీనా', hi: 'मीना', kn: 'ಮೀನಾ', ta: 'மீனா', bn: 'মীনা', mr: 'मीना' },
  'rekha': { te: 'రేఖ', hi: 'रेखा', kn: 'ರೇಖಾ', ta: 'ரேகா', bn: 'রেখা', mr: 'रेखा' },
  'pooja': { te: 'పూజ', hi: 'पूजा', kn: 'ಪೂಜಾ', ta: 'பூஜா', bn: 'পূজা', mr: 'पूजा' },
  'sneha': { te: 'స్నేహ', hi: 'स्नेहा', kn: 'ಸ್ನೇಹಾ', ta: 'சினேகா', bn: 'স্নেহা', mr: 'स्नेहा' },
  'sunita': { te: 'సునీత', hi: 'सुनीता', kn: 'ಸುನೀತಾ', ta: 'சுனிதா', bn: 'সুনিতা', mr: 'सुनीता' },
  'anita': { te: 'అనిత', hi: 'अनीता', kn: 'ಅನಿತಾ', ta: 'அனிதா', bn: 'অনিতা', mr: 'अनिता' },
  'lakshmi': { te: 'లక్ష్మి', hi: 'लक्ष्मी', kn: 'ಲಕ್ಷ್ಮಿ', ta: 'லட்சுமி', bn: 'লক্ষ্মী', mr: 'लक्ष्मी' },
  'shaik': { te: 'షేక్', hi: 'शेख', kn: 'ಶೇಕ್', ta: 'ஷேக்', bn: 'শেখ', mr: 'शेख' },
  'ishrath': { te: 'ఇష్రత్', hi: 'इशरत', kn: 'ಇಶ್ರತ್', ta: 'இஷ்ரத்', bn: 'ইশরাত', mr: 'इशरत' },
  'israth': { te: 'ఇష్రత్', hi: 'इशरत', kn: 'ಇಶ್ರತ್', ta: 'இஷ்ரத்', bn: 'ইশরাত', mr: 'इशरत' },
  'mohammed': { te: 'మహమ్మద్', hi: 'मोहम्मद', kn: 'ಮೊಹಮ್ಮದ್', ta: 'முகம்மது', bn: 'মোহাম্মদ', mr: 'मोहम्मद' },
  'ahmed': { te: 'అహ్మద్', hi: 'अहमद', kn: 'ಅಹ್ಮದ್', ta: 'அகமது', bn: 'আহমেদ', mr: 'अहमद' },
  'ali': { te: 'అలీ', hi: 'अली', kn: 'ಅಲಿ', ta: 'அலி', bn: 'আলী', mr: 'अली' },
  'fatima': { te: 'ఫాతిమా', hi: 'फातिमा', kn: 'ಫಾತಿಮಾ', ta: 'பாத்திமா', bn: 'ফাতিমা', mr: 'फातिमा' },
  'imran': { te: 'ఇమ్రాన్', hi: 'इमरान', kn: 'ಇಮ್ರಾನ್', ta: 'இம்ரான்', bn: 'ইমরান', mr: 'इम्रान' },

  // Surnames and Family Names
  'patel': { te: 'పటేల్', hi: 'पटेल', kn: 'ಪಟೇಲ್', ta: 'படேல்', bn: 'প্যাটেল', mr: 'पटेल' },
  'sharma': { te: 'శర్మ', hi: 'शर्मा', kn: 'ಶರ್ಮಾ', ta: 'சர்மா', bn: 'শর্মা', mr: 'शर्मा' },
  'sen': { te: 'సేన్', hi: 'सेन', kn: 'ಸೇನ್', ta: 'சென்', bn: 'সেন', mr: 'सेन' },
  'mehta': { te: 'మెహతా', hi: 'मेहता', kn: 'ಮೆಹ್ತಾ', ta: 'மேத்தா', bn: 'মেহতা', mr: 'मेहता' },
  'roy': { te: 'రాయ్', hi: 'रॉय', kn: 'ರಾಯ್', ta: 'ராய்', bn: 'রায়', mr: 'रॉय' },
  'kumar': { te: 'కుమార్', hi: 'कुमार', kn: 'ಕುಮಾರ್', ta: 'குமார்', bn: 'কুমার', mr: 'कुमार' },
  'singh': { te: 'సింగ్', hi: 'सिंह', kn: 'ಸಿಂಗ್', ta: 'சிங்', bn: 'সিংহ', mr: 'सिंग' },
  'gupta': { te: 'గుప్తా', hi: 'गुप्ता', kn: 'ಗುಪ್ತಾ', ta: 'குப்தா', bn: 'গুপ্ত', mr: 'गुप्ता' },
  'rao': { te: 'రావు', hi: 'राव', kn: 'ರಾವ್', ta: 'ராவ்', bn: 'রাও', mr: 'राव' },
  'reddy': { te: 'రెడ్డి', hi: 'रेड्डी', kn: 'ರೆಡ್ಡಿ', ta: 'ரெட்டி', bn: 'রেড্ডি', mr: 'रेड्डी' },
  'naidu': { te: 'నాయుడు', hi: 'नायडू', kn: 'ನಾಯ್ಡು', ta: 'நாயுடு', bn: 'নাইডু', mr: 'नायडू' },
  'verma': { te: 'వర్మ', hi: 'वर्मा', kn: 'ವರ್ಮಾ', ta: 'வர்மா', bn: 'বর্মা', mr: 'वर्मा' },
  'mishra': { te: 'మిశ్రా', hi: 'मिश्रा', kn: 'ಮಿಶ್ರಾ', ta: 'மிஸ்ரா', bn: 'মিশ্র', mr: 'मिश्रा' },
  'joshi': { te: 'జోషి', hi: 'जोशी', kn: 'ಜೋಶಿ', ta: 'ஜோஷி', bn: 'যোশী', mr: 'जोशी' },
  'bhat': { te: 'భట్', hi: 'भट', kn: 'ಭಟ್', ta: 'பட்', bn: 'ভাট', mr: 'भट' },
  'kulkarni': { te: 'కుల్కర్ణి', hi: 'कुलकर्णी', kn: 'ಕುಲಕರ್ಣಿ', ta: 'குல்கர்னி', bn: 'কুলকার্নি', mr: 'कुलकर्णी' },
  'deshmukh': { te: 'దేశ్‌ముఖ్', hi: 'देशमुख', kn: 'ದೇಶ್‌ಮುಖ್', ta: 'தேஷ்முக்', bn: 'দেশমুখ', mr: 'देशमुख' },
  'shinde': { te: 'షిండే', hi: 'शिंदे', kn: 'ಶಿಂಧೆ', ta: 'ஷிண்டே', bn: 'শিন্ডে', mr: 'शिंदे' },
  'patil': { te: 'పాటిల్', hi: 'पाटिल', kn: 'ಪಾಟೀಲ್', ta: 'பாட்டீல்', bn: 'পাটিল', mr: 'पाटील' },
  'das': { te: 'దాస్', hi: 'दास', kn: 'ದಾಸ್', ta: 'தாஸ்', bn: 'দাস', mr: 'दास' },
  'banerjee': { te: 'బెనర్జీ', hi: 'बनर्जी', kn: 'ಬ್ಯಾನರ್ಜಿ', ta: 'பானர்ஜி', bn: 'ব্যানার্জি', mr: 'बॅनर्जी' },
  'mukherjee': { te: 'ముఖర్జీ', hi: 'मुखर्जी', kn: 'ಮುಖರ್ಜಿ', ta: 'முகர்ஜி', bn: 'মুখার্জি', mr: 'मुखर्जी' },
  'chatterjee': { te: 'ఛటర్జీ', hi: 'चटर्जी', kn: 'ಚಟರ್ಜಿ', ta: 'சட்டர்ஜி', bn: 'চ্যাটার্জি', mr: 'चटर्जी' },
  'dutta': { te: 'దత్తా', hi: 'दत्ता', kn: 'ದತ್ತಾ', ta: 'தத்தா', bn: 'দত্ত', mr: 'दत्ता' },
  'khan': { te: 'ఖాన్', hi: 'खान', kn: 'ಖಾನ್', ta: 'கான்', bn: 'খান', mr: 'खान' },
  'bhai': { te: 'భాయ్', hi: 'भाई', kn: 'ಭಾಯಿ', ta: 'பாய்', bn: 'ভাই', mr: 'भाई' },
  'devi': { te: 'దేవి', hi: 'देवी', kn: 'ದೇವಿ', ta: 'தேவி', bn: 'দেবী', mr: 'देवी' },
  'prasad': { te: 'ప్రసాద్', hi: 'प्रसाद', kn: 'ಪ್ರಸಾದ್', ta: 'பிரசாத்', bn: 'প্রসাদ', mr: 'प्रसाद' }
};

// Family Relationships
export const RELATIONSHIPS = {
  'son': { te: 'కొడుకు', hi: 'बेटा', kn: 'ಮಗ', ta: 'மகன்', bn: 'ছেলে', mr: 'मुलगा' },
  'daughter': { te: 'కూతురు', hi: 'बेटी', kn: 'ಮಗಳು', ta: 'மகள்', bn: 'মেয়ে', mr: 'मुलगी' },
  'brother': { te: 'సోదరుడు', hi: 'भाई', kn: 'ಸಹೋದರ', ta: 'சகோதரர்', bn: 'ভাই', mr: 'भाऊ' },
  'sister': { te: 'సోదరి', hi: 'बहन', kn: 'ಸಹೋದರಿ', ta: 'சகோதரி', bn: 'বোন', mr: 'बहीण' },
  'father': { te: 'తండ్రి', hi: 'पिता', kn: 'ತಂದೆ', ta: 'தந்தை', bn: 'বাবা', mr: 'वडील' },
  'mother': { te: 'తల్లి', hi: 'माता', kn: 'ತಾಯಿ', ta: 'தாய்', bn: 'মা', mr: 'आई' },
  'spouse': { te: 'భార్య/భర్త', hi: 'जीवनसाथी', kn: 'ಪತಿ/ಪತ್ನಿ', ta: 'துணைவர்', bn: 'স্বামী/স্ত্রী', mr: 'जोडीदार' },
  'wife': { te: 'భార్య', hi: 'पत्नी', kn: 'ಪತ್ನಿ', ta: 'மனைவி', bn: 'স্ত্রী', mr: 'पत्नी' },
  'husband': { te: 'భర్త', hi: 'पति', kn: 'ಪತಿ', ta: 'கணவர்', bn: 'স্বামী', mr: 'पती' },
  'primary guardian': { te: 'ప్రాథమిక సంరక్షకుడు', hi: 'प्राथमिक अभिभावक', kn: 'ಪ್ರಾಥಮಿಕ ಪೋಷಕರು', ta: 'முதன்மை பாதுகாவலர்', bn: 'প্রাথমিক অভিভাবক', mr: 'प्राथमिक पालक' },
  'guardian': { te: 'సంరక్షకుడు', hi: 'अभिभावक', kn: 'ಪೋಷಕರು', ta: 'பாதுகாவலர்', bn: 'অভিভাবক', mr: 'पालक' },
  'flatmate / close friend': { te: 'స్నేహితుడు', hi: 'मित्र / दोस्त', kn: 'ಸ್ನೇಹಿತ', ta: 'நண்பர்', bn: 'বন্ধু', mr: 'मित्र' },
  'friend': { te: 'స్నేహితుడు', hi: 'मित्र', kn: 'ಸ್ನೇಹಿತ', ta: 'நண்பர்', bn: 'বন্ধু', mr: 'मित्र' },
  'relative': { te: 'బంధువు', hi: 'रिश्तेदार', kn: 'ಸಂಬಂಧಿ', ta: 'உறவினர்', bn: 'আত্মীয়', mr: 'नातेवाईक' }
};

/**
 * Phonetic Indic Syllable Transliteration Engine
 * Used as fallback for any custom user name not present in the dictionary.
 */
const INDIC_PHONETICS = {
  te: {
    vowels: { 'aa': 'ా', 'a': '', 'ee': 'ీ', 'ii': 'ీ', 'i': 'ి', 'oo': 'ూ', 'uu': 'ూ', 'u': 'ు', 'ai': 'ై', 'au': 'ౌ', 'ou': 'ౌ', 'e': 'ె', 'o': 'ొ' },
    initVowels: { 'aa': 'ఆ', 'a': 'అ', 'ee': 'ఈ', 'ii': 'ఈ', 'i': 'ఇ', 'oo': 'ఊ', 'uu': 'ఊ', 'u': 'ఉ', 'ai': 'ఐ', 'au': 'ఔ', 'ou': 'ఔ', 'e': 'ఎ', 'o': 'ఒ' },
    consonants: {
      'sh': 'శ', 'ch': 'చ', 'th': 'త', 'dh': 'ధ', 'bh': 'భ', 'kh': 'ఖ', 'gh': 'ఘ', 'jh': 'ఝ', 'ph': 'ఫ',
      'k': 'క', 'g': 'గ', 'j': 'జ', 't': 'ట', 'd': 'ద', 'n': 'న', 'p': 'ప', 'b': 'బ', 'm': 'మ',
      'y': 'య', 'r': 'ర', 'l': 'ల', 'v': 'వ', 'w': 'వ', 's': 'స', 'h': 'హ', 'f': 'ఫ'
    },
    virama: '్'
  },
  hi: {
    vowels: { 'aa': 'ा', 'a': '', 'ee': 'ी', 'ii': 'ी', 'i': 'ि', 'oo': 'ू', 'uu': 'ू', 'u': 'ु', 'ai': 'ै', 'au': 'ौ', 'ou': 'ौ', 'e': 'े', 'o': 'ो' },
    initVowels: { 'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'ii': 'ई', 'i': 'इ', 'oo': 'ऊ', 'uu': 'ऊ', 'u': 'उ', 'ai': 'ऐ', 'au': 'औ', 'ou': 'औ', 'e': 'ए', 'o': 'ओ' },
    consonants: {
      'sh': 'श', 'ch': 'च', 'th': 'थ', 'dh': 'ध', 'bh': 'भ', 'kh': 'ख', 'gh': 'घ', 'jh': 'झ', 'ph': 'फ',
      'k': 'क', 'g': 'ग', 'j': 'ज', 't': 'ट', 'd': 'द', 'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म',
      'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह', 'f': 'फ़'
    },
    virama: '्'
  },
  kn: {
    vowels: { 'aa': 'ಾ', 'a': '', 'ee': 'ೀ', 'ii': 'ೀ', 'i': 'ಿ', 'oo': 'ೂ', 'uu': 'ೂ', 'u': 'ು', 'ai': 'ೈ', 'au': 'ೌ', 'ou': 'ೌ', 'e': 'ೆ', 'o': 'ೊ' },
    initVowels: { 'aa': 'ಆ', 'a': 'ಅ', 'ee': 'ಈ', 'ii': 'ಈ', 'i': 'ಇ', 'oo': 'ಊ', 'uu': 'ಊ', 'u': 'ಉ', 'ai': 'ಐ', 'au': 'ಔ', 'ou': 'ಔ', 'e': 'ಎ', 'o': 'ಒ' },
    consonants: {
      'sh': 'ಶ', 'ch': 'ಚ', 'th': 'ತ', 'dh': 'ಧ', 'bh': 'ಭ', 'kh': 'ಖ', 'gh': 'ಘ', 'jh': 'ಝ', 'ph': 'ಫ',
      'k': 'ಕ', 'g': 'ಗ', 'j': 'ಜ', 't': 'ಟ', 'd': 'ದ', 'n': 'ನ', 'p': 'ಪ', 'b': 'ಬ', 'm': 'ಮ',
      'y': 'ಯ', 'r': 'ರ', 'l': 'ಲ', 'v': 'ವ', 'w': 'ವ', 's': 'ಸ', 'h': 'ಹ', 'f': 'ಫ'
    },
    virama: '್'
  },
  ta: {
    vowels: { 'aa': 'ா', 'a': '', 'ee': 'ீ', 'ii': 'ீ', 'i': 'ி', 'oo': 'ூ', 'uu': 'ூ', 'u': 'ு', 'ai': 'ை', 'au': 'ௌ', 'ou': 'ௌ', 'e': 'ெ', 'o': 'ொ' },
    initVowels: { 'aa': 'ஆ', 'a': 'அ', 'ee': 'ஈ', 'ii': 'ஈ', 'i': 'இ', 'oo': 'ஊ', 'uu': 'ஊ', 'u': 'உ', 'ai': 'ஐ', 'au': 'ஔ', 'ou': 'ஔ', 'e': 'எ', 'o': 'ஒ' },
    consonants: {
      'sh': 'ஷ', 'ch': 'ச', 'th': 'த', 'dh': 'த', 'bh': 'ப', 'kh': 'க', 'gh': 'க', 'jh': 'ஜ', 'ph': 'ப',
      'k': 'க', 'g': 'க', 'j': 'ஜ', 't': 'ட', 'd': 'ட', 'n': 'ந', 'p': 'ப', 'b': 'ப', 'm': 'ம',
      'y': 'ய', 'r': 'ர', 'l': 'ல', 'v': 'வ', 'w': 'வ', 's': 'ஸ', 'h': 'ஹ', 'f': 'ப'
    },
    virama: '்'
  },
  bn: {
    vowels: { 'aa': 'া', 'a': '', 'ee': 'ী', 'ii': 'ী', 'i': 'ি', 'oo': 'ূ', 'uu': 'ূ', 'u': 'ু', 'ai': 'ৈ', 'au': 'ৌ', 'ou': 'ৌ', 'e': 'ে', 'o': 'ো' },
    initVowels: { 'aa': 'আ', 'a': 'অ', 'ee': 'ঈ', 'ii': 'ঈ', 'i': 'ই', 'oo': 'ঊ', 'uu': 'ঊ', 'u': 'উ', 'ai': 'ঐ', 'au': 'ঔ', 'ou': 'ঔ', 'e': 'এ', 'o': 'ও' },
    consonants: {
      'sh': 'শ', 'ch': 'চ', 'th': 'থ', 'dh': 'ধ', 'bh': 'ভ', 'kh': 'খ', 'gh': 'ঘ', 'jh': 'ঝ', 'ph': 'ফ',
      'k': 'ক', 'g': 'গ', 'j': 'জ', 't': 'ট', 'd': 'দ', 'n': 'ন', 'p': 'প', 'b': 'ব', 'm': 'ম',
      'y': 'য', 'r': 'র', 'l': 'ল', 'v': 'ভ', 'w': 'ওয়', 's': 'স', 'h': 'হ', 'f': 'ফ'
    },
    virama: '্'
  },
  mr: {
    vowels: { 'aa': 'ा', 'a': '', 'ee': 'ी', 'ii': 'ी', 'i': 'ि', 'oo': 'ू', 'uu': 'ू', 'u': 'ु', 'ai': 'ै', 'au': 'ौ', 'ou': 'ौ', 'e': 'े', 'o': 'ो' },
    initVowels: { 'aa': 'आ', 'a': 'अ', 'ee': 'ई', 'ii': 'ई', 'i': 'इ', 'oo': 'ऊ', 'uu': 'ऊ', 'u': 'उ', 'ai': 'ऐ', 'au': 'औ', 'ou': 'औ', 'e': 'ए', 'o': 'ओ' },
    consonants: {
      'sh': 'श', 'ch': 'च', 'th': 'थ', 'dh': 'ध', 'bh': 'भ', 'kh': 'ख', 'gh': 'घ', 'jh': 'झ', 'ph': 'फ',
      'k': 'क', 'g': 'ग', 'j': 'ज', 't': 'ट', 'd': 'द', 'n': 'न', 'p': 'प', 'b': 'ब', 'm': 'म',
      'y': 'य', 'r': 'र', 'l': 'ल', 'v': 'व', 'w': 'व', 's': 'स', 'h': 'ह', 'f': 'फ'
    },
    virama: '्'
  }
};

/**
 * Phonetically transliterates an unknown English word to the target Indic script.
 */
export function phoneticTransliterate(word, targetLang) {
  const table = INDIC_PHONETICS[targetLang];
  if (!table || !word) return word;

  const w = word.toLowerCase();
  let result = '';
  let i = 0;
  let isStart = true;

  while (i < w.length) {
    // Check initial or standalone vowels
    if (isStart) {
      let matchedVowel = null;
      for (const len of [2, 1]) {
        const sub = w.substr(i, len);
        if (table.initVowels[sub]) {
          matchedVowel = { key: sub, val: table.initVowels[sub] };
          break;
        }
      }
      if (matchedVowel) {
        result += matchedVowel.val;
        i += matchedVowel.key.length;
        isStart = false;
        continue;
      }
    }

    // Match consonant (2-char first like 'sh', 'th', then 1-char)
    let matchedCons = null;
    for (const len of [2, 1]) {
      const sub = w.substr(i, len);
      if (table.consonants[sub]) {
        matchedCons = { key: sub, val: table.consonants[sub] };
        break;
      }
    }

    if (matchedCons) {
      result += matchedCons.val;
      i += matchedCons.key.length;
      isStart = false;

      // Check following vowel matra
      let matchedMatra = null;
      for (const len of [2, 1]) {
        const sub = w.substr(i, len);
        if (table.vowels[sub] !== undefined) {
          matchedMatra = { key: sub, val: table.vowels[sub] };
          break;
        }
      }

      if (matchedMatra) {
        result += matchedMatra.val;
        i += matchedMatra.key.length;
      } else {
        // If consonant is at end of word or followed by another consonant, apply halant/virama
        if (i >= w.length) {
          result += table.virama;
        } else {
          // Check if next char is also consonant
          const nextSub = w.substr(i, 1);
          if (table.consonants[nextSub]) {
            result += table.virama;
          }
        }
      }
    } else {
      // Non-phonetic or special symbol
      result += w[i];
      i++;
      isStart = true;
    }
  }

  return result;
}

/**
 * Translates a user's full name, persona, or arbitrary name into the active language script.
 * 
 * Example:
 * translateName('Ramesh Patel', 'te') => 'రమేష్ పటేల్'
 * translateName('Priya Sharma', 'te') => 'ప్రియా శర్మ'
 * translateName('Shaik Ishrath', 'te') => 'షేక్ ఇష్రత్'
 */
export function translateName(name, targetLang = 'en') {
  if (!name || typeof name !== 'string') return '';
  if (!targetLang || targetLang === 'en') return name;

  const trimmed = name.trim();
  if (!trimmed) return '';

  // If already written in an Indic or non-Latin script, return directly
  if (/[\u0900-\u0D7F]/.test(trimmed)) {
    return trimmed;
  }

  const lower = trimmed.toLowerCase();

  // 1. Check Full Name Dictionary
  if (FULL_NAMES[lower]?.[targetLang]) {
    return FULL_NAMES[lower][targetLang];
  }

  // 2. Tokenize by space, hyphens, or brackets
  const tokens = trimmed.split(/(\s+|,|\(|\)|\/|-)/);
  const translatedTokens = tokens.map((part) => {
    if (!part || /^\s+$/.test(part) || /^[,()/-]$/.test(part)) {
      return part;
    }

    const partLower = part.toLowerCase();

    // Check token dictionary
    if (NAME_TOKENS[partLower]?.[targetLang]) {
      return NAME_TOKENS[partLower][targetLang];
    }

    // Check relationship dictionary (e.g. if name string contains "(Son)")
    if (RELATIONSHIPS[partLower]?.[targetLang]) {
      return RELATIONSHIPS[partLower][targetLang];
    }

    // Fall back to phonetic Indic transliterator
    return phoneticTransliterate(part, targetLang);
  });

  return translatedTokens.join('');
}

/**
 * Translates relationship descriptions like "Son", "Daughter", "Primary Guardian", etc.
 */
export function translateRelationship(rel, targetLang = 'en') {
  if (!rel || typeof rel !== 'string') return '';
  if (!targetLang || targetLang === 'en') return rel;

  const trimmed = rel.trim();
  if (/[\u0900-\u0D7F]/.test(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  if (RELATIONSHIPS[lower]?.[targetLang]) {
    return RELATIONSHIPS[lower][targetLang];
  }

  // Tokenize compound relationships (e.g. "Flatmate / Close Friend")
  const parts = trimmed.split(/(\s*\/\s*|\s*,\s*|\s+)/);
  const translated = parts.map((p) => {
    const clean = p.trim().toLowerCase();
    return RELATIONSHIPS[clean]?.[targetLang] || p;
  });

  return translated.join('');
}
