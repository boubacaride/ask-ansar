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
    sources: 'Sources',
    askQuestion: 'Ask about Islamic teachings...',
    searching: 'Searching Islamic sources...',
    listening: 'Listening...',
  },
  fr: {
    welcome: 'Bienvenue sur Ask Ansar',
    settings: 'Paramètres',
    darkMode: 'Mode sombre',
    language: 'Langue',
    chat: 'Discussion',
    sources: 'Sources',
    askQuestion: 'Posez des questions sur l\'enseignement islamique...',
    searching: 'Recherche dans les sources islamiques...',
    listening: 'Écoute en cours...',
  },
  ar: {
    welcome: 'مرحباً بكم في أنصار',
    settings: 'الإعدادات',
    darkMode: 'الوضع الداكن',
    language: 'اللغة',
    chat: 'المحادثة',
    sources: 'المصادر',
    askQuestion: 'اسأل عن التعاليم الإسلامية...',
    searching: 'البحث في المصادر الإسلامية...',
    listening: '...جارٍ الاستماع',
  },
};

export function translate(key: string, language: string): string {
  return translations[language]?.[key] || translations.en[key] || key;
}