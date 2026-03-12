/**
 * French UI strings for the chat screen.
 * All user-facing UI chrome on the chat screen must be in French.
 */
export const FR = {
  // Empty state
  emptyStateTitle: 'Bienvenue sur Ask Ansar',
  emptyStateText:
    'Posez vos questions sur l\'Islam et recevez des réponses basées sur des sources authentiques',

  // Input
  placeholder: 'Posez votre question...',

  // Loading
  searching: 'Recherche dans les sources islamiques...',
  generating: 'Génération de la réponse...',

  // Actions
  copy: 'Copier',
  copied: 'Copié !',
  share: 'Partager',

  // Share modal
  shareTitle: 'Partager la réponse',
  shareEmail: 'Partager par e-mail',
  shareWhatsApp: 'Partager par WhatsApp',
  copyClipboard: 'Copier dans le presse-papiers',

  // Errors
  errorGeneric:
    'Désolé, une erreur est survenue. Veuillez réessayer.',
  errorNetwork:
    'Problème de connexion. Veuillez vérifier votre internet et réessayer.',
  errorNoApiKey:
    'Aucune clé API configurée. Veuillez ajouter EXPO_PUBLIC_ANTHROPIC_API_KEY ou EXPO_PUBLIC_OPENAI_API_KEY dans votre fichier .env',
  errorAuthFailed:
    'Erreur d\'authentification API. Veuillez vérifier vos clés API dans le fichier .env',
  retry: 'Réessayer',

  // Sources
  sources: 'Sources',
  fromCache: 'Réponse instantanée',
  gradeSahih: 'Authentique',
  gradeHasan: 'Bon',

  // Voice input
  voiceRecording: 'Enregistrement en cours...',
  voiceProcessing: 'Traitement...',
  voiceReleaseToSend: 'Rel\u00e2cher pour envoyer',
  voiceSlideToCancel: '\u2190 Glisser pour annuler',
  voiceTapToStop: 'Appuyez pour arr\u00eater',
  voiceNotAvailable: 'La reconnaissance vocale n\'est pas disponible',
  voicePermissionDenied: 'Permission du microphone refus\u00e9e',
  voiceTimeout: 'Temps d\'enregistrement expir\u00e9',
  voiceNotUnderstood: 'Je n\'ai pas compris, veuillez r\u00e9essayer',

  // Voice modes
  voiceModeTitle: 'Mode d\'enregistrement',
  voiceModeHold: 'Maintenir pour parler',
  voiceModeHoldDesc: 'Maintenez le bouton enfonc\u00e9 pour enregistrer',
  voiceModeTap: 'Appuyer pour basculer',
  voiceModeTapDesc: 'Appuyez une fois pour commencer, une autre pour arr\u00eater',
  voiceModeConversation: 'Conversation vocale',
  voiceModeConversationDesc: 'Mode mains libres, conversation continue',

  // TTS
  listen: '\u00c9couter',
  stopListening: 'Arr\u00eater',
  autoRead: 'Lecture auto',
  autoReadOn: 'Lecture automatique activ\u00e9e',
  autoReadOff: 'Lecture automatique d\u00e9sactiv\u00e9e',

  // Voice conversation
  voiceGreetingFr: 'Assalamu alaykum. Je suis Ansar, votre compagnon de savoir islamique. Comment puis-je vous aider ?',
  voiceGreetingEn: 'Assalamu alaikum. I\'m Ansar, your Islamic knowledge companion. How can I help you?',
  voiceGreetingAr: '\u0627\u0644\u0633\u0644\u0627\u0645 \u0639\u0644\u064A\u0643\u0645. \u0623\u0646\u0627 \u0623\u0646\u0635\u0627\u0631\u060C \u0645\u0631\u0627\u0641\u0642\u0643 \u0641\u064A \u0627\u0644\u0639\u0644\u0645 \u0627\u0644\u0625\u0633\u0644\u0627\u0645\u064A. \u0643\u064A\u0641 \u064A\u0645\u0643\u0646\u0646\u064A \u0645\u0633\u0627\u0639\u062F\u062A\u0643\u061F',
  voiceListening: '\u00c9coute en cours...',
  voiceThinking: 'Traitement de votre question...',
  voiceSpeaking: 'R\u00e9ponse...',
  voiceIdle: 'Dites quelque chose...',
  voiceGoodbye: 'Au revoir !',
  voiceInactivity: 'Session termin\u00e9e pour inactivit\u00e9',
} as const;
