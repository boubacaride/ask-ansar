type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  en: {
    welcome: 'Welcome to Ask Ansar',
    settings: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    chat: 'Chat',
    ask: 'Ask',
    sources: 'Sources',
    quran: "Qur'an",
    sunnah: 'Sunnah',
    topics: 'Topics',
    navigate: 'Navigate',
    askQuestion: 'Ask about Islamic teachings...',
    searching: 'Searching Islamic sources...',
    navigation: 'Navigation',
    destination: 'Destination',
    startNavigation: 'Start Navigation',
    addLocation: 'Add New Location',
    savedLocations: 'Saved Locations',
    currentLocation: 'Your Location',
    enableLocation: 'Enable Location',
  },
  fr: {
    welcome: 'Bienvenue sur Ask Ansar',
    settings: 'Paramètres',
    darkMode: 'Mode sombre',
    language: 'Langue',
    chat: 'Discussion',
    ask: 'Demander',
    sources: 'Sources',
    quran: 'Coran',
    sunnah: 'Sunnah',
    topics: 'Sujets',
    navigate: 'Naviguer',
    askQuestion: 'Posez des questions sur l\'enseignement islamique...',
    searching: 'Recherche dans les sources islamiques...',
    navigation: 'Navigation',
    destination: 'Destination',
    startNavigation: 'Démarrer la navigation',
    addLocation: 'Ajouter un lieu',
    savedLocations: 'Lieux enregistrés',
    currentLocation: 'Votre position',
    enableLocation: 'Activer la localisation',
  },
  ar: {
    welcome: 'مرحباً بكم في أنصار',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    chat: 'المحادثة',
    ask: 'اسأل',
    sources: 'المصادر',
    quran: 'القرآن',
    sunnah: 'السنة',
    topics: 'المواضيع',
    navigate: 'التنقل',
    askQuestion: 'اسأل عن التعاليم الإسلامية...',
    searching: 'البحث في المصادر الإسلامية...',
    navigation: 'الملاحة',
    destination: 'الوجهة',
    startNavigation: 'بدء الملاحة',
    addLocation: 'إضافة موقع جديد',
    savedLocations: 'المواقع المحفوظة',
    currentLocation: 'موقعك',
    enableLocation: 'تفعيل الموقع',
  },
};

export function translate(key: string, language: string): string {
  return translations[language]?.[key] || translations.en[key] || key;
}
