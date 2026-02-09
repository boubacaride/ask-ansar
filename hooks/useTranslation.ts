// React Hook for Translation with caching
import { useState, useEffect } from 'react';
import { translateToFrench } from '@/utils/translation-service';

export function useTranslation(
  text: string,
    sourceType: 'quran' | 'hadith' | 'general',
      sourceId: string
      ) {
        const [translation, setTranslation] = useState<string>(text);
          const [isLoading, setIsLoading] = useState(true);
            const [error, setError] = useState<string | null>(null);

              useEffect(() => {
                  let isMounted = true;

                      async function fetchTranslation() {
                            if (!text) {
                                    setIsLoading(false);
                                            return;
                                                  }

                                                        try {
                                                                setIsLoading(true);
                                                                        const result = await translateToFrench(text, sourceType, sourceId);
                                                                                if (isMounted) {
                                                                                          setTranslation(result);
                                                                                                    setError(null);
                                                                                                            }
                                                                                                                  } catch (err) {
                                                                                                                          if (isMounted) {
                                                                                                                                    setError('Erreur de traduction');
                                                                                                                                              setTranslation(text);
                                                                                                                                                      }
                                                                                                                                                            } finally {
                                                                                                                                                                    if (isMounted) {
                                                                                                                                                                              setIsLoading(false);
                                                                                                                                                                                      }
                                                                                                                                                                                            }
                                                                                                                                                                                                }
                                                                                                                                                                                                
                                                                                                                                                                                                    fetchTranslation();
                                                                                                                                                                                                    
                                                                                                                                                                                                        return () => {
                                                                                                                                                                                                              isMounted = false;
                                                                                                                                                                                                                  };
                                                                                                                                                                                                                    }, [text, sourceType, sourceId]);
                                                                                                                                                                                                                    
                                                                                                                                                                                                                      return { translation, isLoading, error };
                                                                                                                                                                                                                      }
                                                                                                                                                                                                                      
                                                                                                                                                                                                                      // Specialized hook for Quran verses
                                                                                                                                                                                                                      export function useQuranTranslation(surah: number, ayah: number, englishText: string) {
                                                                                                                                                                                                                        return useTranslation(englishText, 'quran', `${surah}:${ayah}`);
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                        
                                                                                                                                                                                                                        // Specialized hook for Hadith
                                                                                                                                                                                                                        export function useHadithTranslation(collection: string, hadithNumber: string, englishText: string) {
                                                                                                                                                                                                                          return useTranslation(englishText, 'hadith', `${collection}_${hadithNumber}`);
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                          
                                                                                                                                                                                                                          // Hook for general text translation
                                                                                                                                                                                                                          export function useGeneralTranslation(text: string, identifier: string) {
                                                                                                                                                                                                                            return useTranslation(text, 'general', identifier);
                                                                                                                                                                                                                            }
                                                                                                                                                                                                                          }
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                      }
                                                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                            }
                                                                                                                          }
                                                                                                                  }
                                                                                }
                                                        }
                            }
                      }
              })
      }
)