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
} as const;
