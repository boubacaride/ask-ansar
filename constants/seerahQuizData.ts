import type { EventQuizData } from '@/types/seerahQuiz';

/**
 * Seerah Quiz Data - 35 events × 5 questions each = 175 questions
 * Correct answer is ALWAYS at index 0 (shuffled at runtime)
 * Types: factual, comprehension, significance
 */
export const SEERAH_QUIZ_DATA: EventQuizData[] = [
  // ─── EVENT 1: Naissance du Prophète ─────────────────────
  {
    eventId: 1,
    eventTitle: 'Naissance du Prophete Muhammad (ﷺ)',
    eventYear: '571 apr. J.-C.',
    questions: [
      {
        id: 'e1_q1', eventId: 1, type: 'factual',
        question: 'En quelle annee est ne le Prophete Muhammad (ﷺ) ?',
        choices: ['571 apr. J.-C.', '610 apr. J.-C.', '622 apr. J.-C.', '632 apr. J.-C.'],
        correctIndex: 0,
        explanation: 'Le Prophete (ﷺ) est ne en 571 apr. J.-C., l\'annee de l\'Elephant.',
      },
      {
        id: 'e1_q2', eventId: 1, type: 'factual',
        question: 'Dans quel quartier de La Mecque est ne le Prophete (ﷺ) ?',
        choices: ['Banu Hashim', 'Banu Umayya', 'Banu Makhzum', 'Banu Zuhra'],
        correctIndex: 0,
        explanation: 'Il est ne dans le quartier des Banu Hashim a La Mecque.',
      },
      {
        id: 'e1_q3', eventId: 1, type: 'comprehension',
        question: 'Pourquoi l\'annee de sa naissance est-elle appelee l\'annee de l\'Elephant ?',
        choices: [
          'Car le roi Abraha vint avec une armee d\'elephants pour detruire la Kaaba',
          'Car un elephant rare fut offert au grand-pere du Prophete',
          'Car la tribu Quraysh adopta l\'elephant comme symbole',
          'Car un elephant s\'agenouilla devant la Kaaba cette annee-la',
        ],
        correctIndex: 0,
        explanation: 'Abraha, le roi abyssin, vint avec une armee d\'elephants pour detruire la Kaaba mais fut aneanti par Dieu.',
      },
      {
        id: 'e1_q4', eventId: 1, type: 'comprehension',
        question: 'Quel etait le sort du pere du Prophete, Abdullah, au moment de sa naissance ?',
        choices: [
          'Il etait deja decede a Medine',
          'Il etait en voyage commercial en Syrie',
          'Il vivait a Taif',
          'Il etait present a La Mecque',
        ],
        correctIndex: 0,
        explanation: 'Son pere Abdullah etait decede a Medine avant sa naissance.',
      },
      {
        id: 'e1_q5', eventId: 1, type: 'significance',
        question: 'Quelle est la signification majeure de la naissance du Prophete (ﷺ) ?',
        choices: [
          'Le debut de la vie du dernier prophete qui changera l\'histoire mondiale',
          'Le debut de la construction de la Kaaba',
          'L\'unification des tribus arabes',
          'La fin de l\'idolatrie a La Mecque',
        ],
        correctIndex: 0,
        explanation: 'Sa naissance marque le debut de la vie du dernier prophete de l\'Islam, qui changera le cours de l\'histoire mondiale.',
      },
    ],
  },

  // ─── EVENT 2: Décès de sa mère Amina ─────────────────────
  {
    eventId: 2,
    eventTitle: 'Deces de sa mere Amina',
    eventYear: '577 apr. J.-C.',
    questions: [
      {
        id: 'e2_q1', eventId: 2, type: 'factual',
        question: 'Quel age avait Muhammad (ﷺ) lorsque sa mere Amina deceda ?',
        choices: ['Six ans', 'Quatre ans', 'Huit ans', 'Dix ans'],
        correctIndex: 0,
        explanation: 'Amina bint Wahb deceda alors que Muhammad n\'avait que six ans.',
      },
      {
        id: 'e2_q2', eventId: 2, type: 'factual',
        question: 'Ou Amina bint Wahb est-elle decedee ?',
        choices: ['A Abwa', 'A La Mecque', 'A Medine', 'A Taif'],
        correctIndex: 0,
        explanation: 'Amina deceda a Abwa, sur le chemin du retour de Medine.',
      },
      {
        id: 'e2_q3', eventId: 2, type: 'comprehension',
        question: 'Pourquoi Amina s\'etait-elle rendue a Medine avec son fils ?',
        choices: [
          'Pour visiter la tombe de son epoux Abdullah',
          'Pour fuir la persecution a La Mecque',
          'Pour commercer avec les tribus de Medine',
          'Pour consulter un medecin renomme',
        ],
        correctIndex: 0,
        explanation: 'Amina etait allee a Medine pour visiter la tombe de son epoux Abdullah et voir les proches de son grand-pere.',
      },
      {
        id: 'e2_q4', eventId: 2, type: 'comprehension',
        question: 'Qui accompagnait Amina et Muhammad lors de ce voyage ?',
        choices: ['Umm Ayman, sa nourrice', 'Abu Talib, son oncle', 'Abdul Muttalib, son grand-pere', 'Halima Sa\'diya'],
        correctIndex: 0,
        explanation: 'Amina etait accompagnee de son fils et de sa nourrice Umm Ayman.',
      },
      {
        id: 'e2_q5', eventId: 2, type: 'significance',
        question: 'Qui prit Muhammad sous sa protection apres la mort de sa mere ?',
        choices: [
          'Son grand-pere Abdul Muttalib',
          'Son oncle Abu Talib',
          'Son oncle Abbas',
          'Sa nourrice Halima',
        ],
        correctIndex: 0,
        explanation: 'Apres la mort d\'Amina, son grand-pere Abdul Muttalib le prit sous sa protection.',
      },
    ],
  },

  // ─── EVENT 3: Décès d'Abdul Muttalib ─────────────────────
  {
    eventId: 3,
    eventTitle: 'Deces de son grand-pere Abdul Muttalib',
    eventYear: '578 apr. J.-C.',
    questions: [
      {
        id: 'e3_q1', eventId: 3, type: 'factual',
        question: 'Quel age avait le Prophete (ﷺ) lorsque Abdul Muttalib deceda ?',
        choices: ['Huit ans', 'Six ans', 'Dix ans', 'Douze ans'],
        correctIndex: 0,
        explanation: 'Abdul Muttalib deceda lorsque le Prophete avait huit ans.',
      },
      {
        id: 'e3_q2', eventId: 3, type: 'factual',
        question: 'A qui Abdul Muttalib confia-t-il la garde du Prophete avant sa mort ?',
        choices: ['Abu Talib', 'Abu Lahab', 'Abbas', 'Hamza'],
        correctIndex: 0,
        explanation: 'Peu avant sa mort, il confia la garde et la tutelle du Prophete a son fils Abu Talib.',
      },
      {
        id: 'e3_q3', eventId: 3, type: 'comprehension',
        question: 'Quel privilege special Abdul Muttalib accordait-il au jeune Muhammad ?',
        choices: [
          'S\'asseoir sur son coussin special a l\'ombre de la Kaaba',
          'L\'accompagner dans ses voyages commerciaux',
          'Diriger les prieres a la Kaaba',
          'Porter les cles de la Kaaba',
        ],
        correctIndex: 0,
        explanation: 'Abdul Muttalib lui permettait seul de s\'asseoir sur son coussin special a l\'ombre de la Kaaba.',
      },
      {
        id: 'e3_q4', eventId: 3, type: 'comprehension',
        question: 'Quel age avait Abdul Muttalib a sa mort ?',
        choices: ['Plus de quatre-vingts ans', 'Soixante ans', 'Soixante-dix ans', 'Cinquante ans'],
        correctIndex: 0,
        explanation: 'Abdul Muttalib avait plus de quatre-vingts ans lors de son deces.',
      },
      {
        id: 'e3_q5', eventId: 3, type: 'significance',
        question: 'Que croyait Abdul Muttalib au sujet de son petit-fils ?',
        choices: [
          'Qu\'il deviendrait une personne d\'un grand honneur',
          'Qu\'il serait un grand commercant',
          'Qu\'il dirigerait la tribu Quraysh',
          'Qu\'il serait un poete celebre',
        ],
        correctIndex: 0,
        explanation: 'Abdul Muttalib croyait fermement que son petit-fils deviendrait une personne d\'un grand honneur a l\'avenir.',
      },
    ],
  },

  // ─── EVENT 4: Premier voyage en Syrie ─────────────────────
  {
    eventId: 4,
    eventTitle: 'Premier voyage commercial en Syrie',
    eventYear: '578 apr. J.-C.',
    questions: [
      {
        id: 'e4_q1', eventId: 4, type: 'factual',
        question: 'Avec qui le jeune Muhammad effectua-t-il son premier voyage en Syrie ?',
        choices: ['Son oncle Abu Talib', 'Son grand-pere Abdul Muttalib', 'Sa mere Amina', 'Son oncle Abbas'],
        correctIndex: 0,
        explanation: 'Il effectua ce premier voyage commercial avec son oncle Abu Talib.',
      },
      {
        id: 'e4_q2', eventId: 4, type: 'factual',
        question: 'Quel moine chretien reconnut les signes de la prophetie chez Muhammad ?',
        choices: ['Bahira', 'Waraqa', 'Nestorius', 'Addas'],
        correctIndex: 0,
        explanation: 'Le moine chretien Bahira a Busra reconnut les signes de la prophetie.',
      },
      {
        id: 'e4_q3', eventId: 4, type: 'comprehension',
        question: 'Quel signe physique convainquit le moine Bahira ?',
        choices: [
          'Le sceau de la prophetie entre ses epaules',
          'Une lumiere autour de sa tete',
          'Ses yeux brillants',
          'Sa grande taille',
        ],
        correctIndex: 0,
        explanation: 'Apres avoir vu le "sceau de la prophetie" entre ses epaules, Bahira fut convaincu.',
      },
      {
        id: 'e4_q4', eventId: 4, type: 'comprehension',
        question: 'Quel conseil Bahira donna-t-il a Abu Talib ?',
        choices: [
          'Proteger Muhammad et le ramener immediatement a La Mecque',
          'Envoyer Muhammad etudier en Syrie',
          'Lui enseigner la religion chretienne',
          'Le garder a Busra pour sa securite',
        ],
        correctIndex: 0,
        explanation: 'Bahira conseilla a Abu Talib de proteger son neveu et de le ramener immediatement a La Mecque.',
      },
      {
        id: 'e4_q5', eventId: 4, type: 'significance',
        question: 'Quelle est l\'importance de cette rencontre avec Bahira ?',
        choices: [
          'L\'un des premiers temoignages de la reconnaissance de sa future mission prophetique',
          'Le debut de la predication en Syrie',
          'L\'etablissement du commerce entre La Mecque et la Syrie',
          'La conversion du moine Bahira a l\'Islam',
        ],
        correctIndex: 0,
        explanation: 'Cette rencontre est l\'un des premiers temoignages de la reconnaissance de sa future mission prophetique.',
      },
    ],
  },

  // ─── EVENT 5: Mariage avec Khadijah ─────────────────────
  {
    eventId: 5,
    eventTitle: 'Mariage avec Khadijah',
    eventYear: '595 apr. J.-C.',
    questions: [
      {
        id: 'e5_q1', eventId: 5, type: 'factual',
        question: 'Quel age avait le Prophete (ﷺ) lors de son mariage avec Khadijah ?',
        choices: ['Vingt-cinq ans', 'Trente ans', 'Vingt ans', 'Trente-cinq ans'],
        correctIndex: 0,
        explanation: 'Le Prophete avait vingt-cinq ans lors de ce mariage.',
      },
      {
        id: 'e5_q2', eventId: 5, type: 'factual',
        question: 'Quel age avait Khadijah lors de leur mariage ?',
        choices: ['Quarante ans', 'Trente ans', 'Vingt-cinq ans', 'Trente-cinq ans'],
        correctIndex: 0,
        explanation: 'Khadijah avait quarante ans au moment du mariage.',
      },
      {
        id: 'e5_q3', eventId: 5, type: 'comprehension',
        question: 'Quelle etait la profession de Khadijah avant le mariage ?',
        choices: [
          'Commercante noble et riche',
          'Enseignante',
          'Couturiere',
          'Medecin',
        ],
        correctIndex: 0,
        explanation: 'Khadijah etait l\'une des femmes nobles et riches des Quraysh et s\'occupait de commerce.',
      },
      {
        id: 'e5_q4', eventId: 5, type: 'comprehension',
        question: 'Chez qui le Prophete emmenagea-t-il apres le mariage ?',
        choices: [
          'Dans la maison de Khadijah',
          'Dans la maison d\'Abu Talib',
          'Dans une nouvelle maison construite pour eux',
          'Pres de la Kaaba',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete quitta la maison de son oncle Abu Talib pour emmenager dans celle de son epouse Khadijah.',
      },
      {
        id: 'e5_q5', eventId: 5, type: 'significance',
        question: 'Quel role historique Khadijah joua-t-elle dans l\'Islam ?',
        choices: [
          'Elle fut la premiere personne a embrasser l\'Islam',
          'Elle fut la premiere a construire une mosquee',
          'Elle dirigea la premiere priere collective',
          'Elle ecrivit les premieres sourates du Coran',
        ],
        correctIndex: 0,
        explanation: 'Khadijah fut la premiere personne a embrasser l\'Islam apres le debut de la mission prophetique.',
      },
    ],
  },

  // ─── EVENT 6: Reconstruction de la Kaaba ─────────────────────
  {
    eventId: 6,
    eventTitle: 'Reconstruction de la Kaaba',
    eventYear: '605 apr. J.-C.',
    questions: [
      {
        id: 'e6_q1', eventId: 6, type: 'factual',
        question: 'Quel age avait le Prophete (ﷺ) lors de la reconstruction de la Kaaba ?',
        choices: ['Trente-cinq ans', 'Quarante ans', 'Vingt-cinq ans', 'Trente ans'],
        correctIndex: 0,
        explanation: 'Le Prophete avait trente-cinq ans en 605 apr. J.-C. lors de la reconstruction.',
      },
      {
        id: 'e6_q2', eventId: 6, type: 'factual',
        question: 'Quel surnom les Mecquois donnerent-ils a Muhammad lorsqu\'il fut choisi comme arbitre ?',
        choices: ['Al-Amin (Le Digne de Confiance)', 'Al-Sadiq (Le Veridique)', 'Al-Hakim (Le Sage)', 'Al-Adil (Le Juste)'],
        correctIndex: 0,
        explanation: 'Voyant Muhammad, tous exprimerent leur satisfaction : "Voici al-Amin, nous acceptons son arbitrage !"',
      },
      {
        id: 'e6_q3', eventId: 6, type: 'comprehension',
        question: 'Comment le Prophete resolut-il la dispute au sujet de la Pierre Noire ?',
        choices: [
          'Il placa la pierre sur un manteau que chaque chef de tribu souleva ensemble',
          'Il tira au sort pour choisir une tribu',
          'Il demanda a la plus ancienne tribu de placer la pierre',
          'Il placa lui-meme la pierre sans consulter les tribus',
        ],
        correctIndex: 0,
        explanation: 'Il fit apporter un manteau, y placa la Pierre Noire et demanda a chaque chef de tribu de soulever ensemble.',
      },
      {
        id: 'e6_q4', eventId: 6, type: 'comprehension',
        question: 'Comment fut choisi l\'arbitre pour la dispute de la Pierre Noire ?',
        choices: [
          'La premiere personne a entrer par la porte de Banu Shaybah',
          'Le chef de la plus grande tribu',
          'Par un vote des anciens',
          'Par tirage au sort',
        ],
        correctIndex: 0,
        explanation: 'Il fut decide que la premiere personne a entrer par la porte de Banu Shaybah serait l\'arbitre.',
      },
      {
        id: 'e6_q5', eventId: 6, type: 'significance',
        question: 'Que demontra l\'arbitrage du Prophete dans cet evenement ?',
        choices: [
          'Sa sagesse et son role de mediateur reconnu, prevenant une guerre entre les tribus',
          'Sa force physique superieure',
          'Son pouvoir politique sur les Quraysh',
          'Sa connaissance de la construction',
        ],
        correctIndex: 0,
        explanation: 'Son arbitrage demontra sa sagesse et son role de mediateur reconnu a La Mecque.',
      },
    ],
  },

  // ─── EVENT 7: La première révélation ─────────────────────
  {
    eventId: 7,
    eventTitle: 'La premiere revelation',
    eventYear: '610 apr. J.-C.',
    questions: [
      {
        id: 'e7_q1', eventId: 7, type: 'factual',
        question: 'Ou le Prophete (ﷺ) recut-il la premiere revelation ?',
        choices: ['Dans la grotte de Hira sur le mont Nur', 'A la Kaaba', 'Dans sa maison', 'Au mont Safa'],
        correctIndex: 0,
        explanation: 'La premiere revelation eut lieu dans la grotte de Hira sur le mont Nur.',
      },
      {
        id: 'e7_q2', eventId: 7, type: 'factual',
        question: 'Quelle sourate contient les premiers versets reveles ?',
        choices: ['Sourate Al-Alaq', 'Sourate Al-Fatiha', 'Sourate Al-Baqarah', 'Sourate Al-Ikhlas'],
        correctIndex: 0,
        explanation: 'Les cinq premiers versets de la sourate Al-Alaq furent les premiers reveles.',
      },
      {
        id: 'e7_q3', eventId: 7, type: 'comprehension',
        question: 'Quel fut le premier mot revele au Prophete (ﷺ) ?',
        choices: ['Lis ! (Iqra)', 'Prie !', 'Leve-toi !', 'Crois !'],
        correctIndex: 0,
        explanation: 'Gabriel lui dit "Lis !" (Iqra) et revela les premiers versets.',
      },
      {
        id: 'e7_q4', eventId: 7, type: 'comprehension',
        question: 'Durant quelle nuit sacree eut lieu la premiere revelation ?',
        choices: [
          'La Nuit du Qadr pendant le Ramadan',
          'La nuit du 27 Rajab',
          'La nuit du 15 Sha\'ban',
          'La premiere nuit de Muharram',
        ],
        correctIndex: 0,
        explanation: 'La premiere revelation eut lieu lors de la Nuit du Qadr pendant le Ramadan.',
      },
      {
        id: 'e7_q5', eventId: 7, type: 'significance',
        question: 'Combien de temps dura la revelation coranique au total ?',
        choices: ['23 ans', '10 ans', '13 ans', '30 ans'],
        correctIndex: 0,
        explanation: 'La revelation coranique dura 23 ans, de 610 a 632 apr. J.-C.',
      },
    ],
  },

  // ─── EVENT 8: Début de la prédication publique ─────────────────────
  {
    eventId: 8,
    eventTitle: 'Debut de la predication publique',
    eventYear: '613 apr. J.-C.',
    questions: [
      {
        id: 'e8_q1', eventId: 8, type: 'factual',
        question: 'Combien d\'annees dura la predication secrete avant la phase publique ?',
        choices: ['Environ trois ans', 'Un an', 'Cinq ans', 'Sept ans'],
        correctIndex: 0,
        explanation: 'Apres environ trois ans de predication secrete, la phase publique commenca.',
      },
      {
        id: 'e8_q2', eventId: 8, type: 'factual',
        question: 'Depuis quel lieu le Prophete appela-t-il publiquement les Mecquois ?',
        choices: ['Le mont Safa', 'La Kaaba', 'Le mont Hira', 'Le marche de La Mecque'],
        correctIndex: 0,
        explanation: 'Il monta au mont Safa et appela les Mecquois a croire en l\'unicite de Dieu.',
      },
      {
        id: 'e8_q3', eventId: 8, type: 'comprehension',
        question: 'Quel oncle du Prophete l\'interrompit et l\'insulta lors du festin ?',
        choices: ['Abu Lahab', 'Abu Talib', 'Abbas', 'Hamza'],
        correctIndex: 0,
        explanation: 'Lors d\'un festin, son oncle Abu Lahab l\'interrompit et l\'insulta.',
      },
      {
        id: 'e8_q4', eventId: 8, type: 'comprehension',
        question: 'Par quoi debuta l\'invitation publique a l\'Islam ?',
        choices: [
          'Un appel aux proches parents',
          'Un discours a la Kaaba',
          'Une lettre aux chefs de tribus',
          'Une invitation aux commercants',
        ],
        correctIndex: 0,
        explanation: 'L\'invitation publique debuta par un appel aux proches parents.',
      },
      {
        id: 'e8_q5', eventId: 8, type: 'significance',
        question: 'Quelle consequence eut le debut de la predication publique ?',
        choices: [
          'Le debut de la persecution systematique des premiers musulmans',
          'La conversion immediate de toute La Mecque',
          'L\'alliance avec les tribus voisines',
          'La construction de la premiere mosquee',
        ],
        correctIndex: 0,
        explanation: 'La predication publique entraina le debut de la persecution systematique des premiers musulmans par les Quraysh.',
      },
    ],
  },

  // ─── EVENT 9: Première migration en Abyssinie ─────────────────────
  {
    eventId: 9,
    eventTitle: 'Premiere migration en Abyssinie',
    eventYear: '615 apr. J.-C.',
    questions: [
      {
        id: 'e9_q1', eventId: 9, type: 'factual',
        question: 'Combien de personnes composaient le premier groupe de migrants en Abyssinie ?',
        choices: ['Onze hommes et quatre femmes', 'Vingt hommes', 'Cinquante personnes', 'Cent personnes'],
        correctIndex: 0,
        explanation: 'Le premier groupe etait compose de onze hommes et quatre femmes.',
      },
      {
        id: 'e9_q2', eventId: 9, type: 'factual',
        question: 'Quel compagnon et son epouse Ruqayyah faisaient partie de ce groupe ?',
        choices: ['Uthman', 'Abu Bakr', 'Umar', 'Ali'],
        correctIndex: 0,
        explanation: 'Uthman et son epouse Ruqayyah (fille du Prophete) faisaient partie du groupe.',
      },
      {
        id: 'e9_q3', eventId: 9, type: 'comprehension',
        question: 'Pourquoi les musulmans choisirent-ils l\'Abyssinie comme destination ?',
        choices: [
          'Le roi (Negus) etait connu comme un dirigeant juste et misericordieux',
          'L\'Abyssinie etait un pays musulman',
          'Les Quraysh avaient des alliances avec l\'Abyssinie',
          'C\'etait le pays le plus proche',
        ],
        correctIndex: 0,
        explanation: 'Le roi d\'Abyssinie (le Negus) etait connu comme un dirigeant juste ou personne n\'etait opprime.',
      },
      {
        id: 'e9_q4', eventId: 9, type: 'comprehension',
        question: 'Comment les musulmans quitterent-ils La Mecque ?',
        choices: ['Secretement', 'En caravane officielle', 'Avec la permission des Quraysh', 'En armee organisee'],
        correctIndex: 0,
        explanation: 'Le premier groupe quitta secretement La Mecque pour l\'Abyssinie.',
      },
      {
        id: 'e9_q5', eventId: 9, type: 'significance',
        question: 'Quelle est l\'importance historique de cette premiere migration ?',
        choices: [
          'C\'est la premiere migration de l\'histoire islamique, permettant d\'echapper a la persecution',
          'Elle marqua la fondation d\'un Etat islamique en Afrique',
          'Elle entraina la conversion du Negus',
          'Elle provoqua la fin de la persecution a La Mecque',
        ],
        correctIndex: 0,
        explanation: 'C\'est la premiere migration dans l\'histoire islamique, offrant un moyen d\'echapper a la persecution.',
      },
    ],
  },

  // ─── EVENT 10: Deuxième migration en Abyssinie ─────────────────────
  {
    eventId: 10,
    eventTitle: 'Deuxieme migration en Abyssinie',
    eventYear: '616 apr. J.-C.',
    questions: [
      {
        id: 'e10_q1', eventId: 10, type: 'factual',
        question: 'Qui dirigeait le deuxieme groupe de migrants en Abyssinie ?',
        choices: ['Ja\'far ibn Abi Talib', 'Uthman ibn Affan', 'Abu Bakr', 'Zubayr ibn al-Awwam'],
        correctIndex: 0,
        explanation: 'Ce grand groupe etait dirige par le cousin du Prophete, Ja\'far ibn Abi Talib.',
      },
      {
        id: 'e10_q2', eventId: 10, type: 'factual',
        question: 'Combien de musulmans au total migrerent en Abyssinie apres la deuxieme migration ?',
        choices: ['Plus de 100', 'Environ 50', 'Environ 200', 'Environ 30'],
        correctIndex: 0,
        explanation: 'Avec ce groupe, le nombre total depassa 100.',
      },
      {
        id: 'e10_q3', eventId: 10, type: 'comprehension',
        question: 'Que firent les Quraysh pour tenter de recuperer les musulmans ?',
        choices: [
          'Ils envoyerent des emissaires avec des cadeaux precieux aupres du Negus',
          'Ils envoyerent une armee',
          'Ils bloquerent les routes commerciales',
          'Ils negocierent avec les tribus africaines',
        ],
        correctIndex: 0,
        explanation: 'Les Quraysh envoyerent des emissaires avec de precieux cadeaux aupres du Negus.',
      },
      {
        id: 'e10_q4', eventId: 10, type: 'comprehension',
        question: 'Qu\'est-ce qui impressionna le Negus lors du discours de Ja\'far ?',
        choices: [
          'Le discours sur la revolution morale de l\'Islam et la recitation de versets sur Marie',
          'Les cadeaux offerts par les musulmans',
          'La force militaire des musulmans',
          'Les richesses commerciales apportees',
        ],
        correctIndex: 0,
        explanation: 'Impressionne par le discours et la recitation de versets sur Marie, le Negus protegea les musulmans.',
      },
      {
        id: 'e10_q5', eventId: 10, type: 'significance',
        question: 'Quelle fut la decision du Negus concernant les musulmans ?',
        choices: [
          'Il rejeta la demande des Quraysh et declara qu\'il protegerait les musulmans',
          'Il renvoya les musulmans a La Mecque',
          'Il accepta les cadeaux et resta neutre',
          'Il exigea que les musulmans se convertissent au christianisme',
        ],
        correctIndex: 0,
        explanation: 'Le Negus, en larmes, rejeta la demande des Quraysh et declara qu\'il protegerait les musulmans.',
      },
    ],
  },

  // ─── EVENT 11: Début du boycott ─────────────────────
  {
    eventId: 11,
    eventTitle: 'Debut du boycott',
    eventYear: '617 apr. J.-C.',
    questions: [
      {
        id: 'e11_q1', eventId: 11, type: 'factual',
        question: 'Combien de temps dura le boycott contre les Banu Hashim ?',
        choices: ['Environ trois ans', 'Un an', 'Six mois', 'Cinq ans'],
        correctIndex: 0,
        explanation: 'Ce boycott social et economique dura environ trois ans.',
      },
      {
        id: 'e11_q2', eventId: 11, type: 'factual',
        question: 'Ou les Quraysh accrocherent-ils le parchemin du boycott ?',
        choices: ['Au mur de la Kaaba', 'A la porte de la ville', 'Au marche principal', 'A la maison d\'Abu Talib'],
        correctIndex: 0,
        explanation: 'Ils consignerent ces decisions sur un parchemin et l\'accrocherent au mur de la Kaaba.',
      },
      {
        id: 'e11_q3', eventId: 11, type: 'comprehension',
        question: 'Que devaient manger les victimes du boycott pour survivre ?',
        choices: [
          'Des feuilles d\'arbres et des morceaux de cuir sec',
          'Des rations envoyees secretement par des allies',
          'Des fruits sauvages du desert',
          'Des provisions cachees dans la Kaaba',
        ],
        correctIndex: 0,
        explanation: 'La famine etait si grave qu\'ils devaient manger des feuilles d\'arbres et des morceaux de cuir sec.',
      },
      {
        id: 'e11_q4', eventId: 11, type: 'comprehension',
        question: 'Quelles tribus furent visees par le boycott ?',
        choices: [
          'Les Banu Hashim et les Banu Muttalib',
          'Uniquement les Banu Hashim',
          'Toutes les tribus de La Mecque',
          'Les Banu Umayya',
        ],
        correctIndex: 0,
        explanation: 'Les Quraysh deciderent de rompre toutes relations avec les Banu Hashim et les Banu Muttalib.',
      },
      {
        id: 'e11_q5', eventId: 11, type: 'significance',
        question: 'Que demontra le boycott concernant les premiers musulmans ?',
        choices: [
          'Leur perseverance et leur foi inebranlable',
          'Leur faiblesse militaire',
          'Leur isolement total de l\'Islam',
          'Leur volonte de negocier avec les Quraysh',
        ],
        correctIndex: 0,
        explanation: 'Les pressions montrerent la perseverance et la foi inebranlable des premiers musulmans.',
      },
    ],
  },

  // ─── EVENT 12: L'Année du Chagrin ─────────────────────
  {
    eventId: 12,
    eventTitle: "L'Annee du Chagrin",
    eventYear: '619 apr. J.-C.',
    questions: [
      {
        id: 'e12_q1', eventId: 12, type: 'factual',
        question: 'Quelles deux personnes importantes decederent durant l\'Annee du Chagrin ?',
        choices: ['Abu Talib et Khadijah', 'Abdul Muttalib et Amina', 'Hamza et Ja\'far', 'Abu Bakr et Umar'],
        correctIndex: 0,
        explanation: 'Abu Talib et Khadijah decederent a trois jours d\'intervalle.',
      },
      {
        id: 'e12_q2', eventId: 12, type: 'factual',
        question: 'Comment appelle-t-on l\'annee 619 apr. J.-C. en arabe ?',
        choices: ['Sanat al-Huzn', 'Sanat al-Fath', 'Sanat al-Wufud', 'Sanat al-Hijra'],
        correctIndex: 0,
        explanation: 'L\'annee 619 est appelee "Sanat al-Huzn" (l\'Annee du Chagrin).',
      },
      {
        id: 'e12_q3', eventId: 12, type: 'comprehension',
        question: 'Quel role Abu Talib jouait-il pour le Prophete ?',
        choices: [
          'Un rempart qui le protegeait contre les attaques des polytheistes',
          'Son conseiller financier',
          'Le chef de sa garde personnelle',
          'Son professeur de commerce',
        ],
        correctIndex: 0,
        explanation: 'Abu Talib fut un rempart qui protegea le Prophete et le defendit contre les attaques des polytheistes.',
      },
      {
        id: 'e12_q4', eventId: 12, type: 'comprehension',
        question: 'Quel role Khadijah jouait-elle pour le Prophete ?',
        choices: [
          'Sa premiere epouse, premiere musulmane et plus grande confidente',
          'Sa cousine et conseillere politique',
          'Sa secretaire et scribe',
          'Son ambassadrice aupres des tribus',
        ],
        correctIndex: 0,
        explanation: 'Khadijah fut sa premiere epouse, premiere musulmane, et sa plus grande confidente.',
      },
      {
        id: 'e12_q5', eventId: 12, type: 'significance',
        question: 'Quelle fut la consequence de cette double perte pour le Prophete ?',
        choices: [
          'Il se retrouva pratiquement sans protection a La Mecque',
          'Il decida immediatement de migrer a Medine',
          'Il arreta temporairement la predication',
          'Il forma une armee pour se defendre',
        ],
        correctIndex: 0,
        explanation: 'Avec la disparition de ces deux grands soutiens, le Prophete se retrouva pratiquement sans protection a La Mecque.',
      },
    ],
  },

  // ─── EVENT 13: Voyage à Taïf ─────────────────────
  {
    eventId: 13,
    eventTitle: 'Voyage a Taif',
    eventYear: '620 apr. J.-C.',
    questions: [
      {
        id: 'e13_q1', eventId: 13, type: 'factual',
        question: 'Avec qui le Prophete (ﷺ) entreprit-il le voyage a Taif ?',
        choices: ['Zayd ibn Harithah', 'Abu Bakr', 'Ali ibn Abi Talib', 'Umar ibn al-Khattab'],
        correctIndex: 0,
        explanation: 'Le Prophete entreprit ce voyage a pied avec Zayd ibn Harithah.',
      },
      {
        id: 'e13_q2', eventId: 13, type: 'factual',
        question: 'Comment les habitants de Taif reagirent-ils a l\'invitation du Prophete ?',
        choices: [
          'Ils le rejetterent et le firent lapider',
          'Ils accepterent l\'Islam',
          'Ils resterent indifferents',
          'Ils l\'inviterent a revenir plus tard',
        ],
        correctIndex: 0,
        explanation: 'Ils rejetterent grossierement son invitation et le firent lapider par les voyous.',
      },
      {
        id: 'e13_q3', eventId: 13, type: 'comprehension',
        question: 'Ou le Prophete et Zayd se refugierent-ils apres avoir ete lapides ?',
        choices: ['Dans un vignoble', 'Dans une grotte', 'Dans une maison amie', 'Au sommet d\'une montagne'],
        correctIndex: 0,
        explanation: 'Refugies dans un vignoble, le Prophete prononca sa celebre priere.',
      },
      {
        id: 'e13_q4', eventId: 13, type: 'comprehension',
        question: 'Quelle fut la reaction du Prophete face a ce rejet violent ?',
        choices: [
          'Il prononca une celebre priere exprimant sa faiblesse uniquement a Allah',
          'Il maudit les habitants de Taif',
          'Il jura de revenir avec une armee',
          'Il abandonna sa mission',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete prononca sa celebre priere, exprimant sa faiblesse uniquement a Allah.',
      },
      {
        id: 'e13_q5', eventId: 13, type: 'significance',
        question: 'Quelle lecon tire-t-on de cet episode douloureux ?',
        choices: [
          'Le rejet engendra une plus grande dependance a l\'egard du soutien divin',
          'Il faut eviter les villes hostiles',
          'La violence est parfois necessaire en reponse',
          'Les prophetes ne doivent pas voyager seuls',
        ],
        correctIndex: 0,
        explanation: 'Le rejet engendra une plus grande dependance a l\'egard du soutien divin.',
      },
    ],
  },

  // ─── EVENT 14: L'Isra et le Mi'raj ─────────────────────
  {
    eventId: 14,
    eventTitle: "L'Isra et le Mi'raj",
    eventYear: '621 apr. J.-C.',
    questions: [
      {
        id: 'e14_q1', eventId: 14, type: 'factual',
        question: 'Que designe le terme "Isra" ?',
        choices: [
          'Le voyage nocturne de La Mecque a Jerusalem',
          'L\'ascension a travers les cieux',
          'La migration vers Medine',
          'Le retour de Taif',
        ],
        correctIndex: 0,
        explanation: 'L\'Isra designe le voyage nocturne de la Masjid al-Haram a la Masjid al-Aqsa a Jerusalem.',
      },
      {
        id: 'e14_q2', eventId: 14, type: 'factual',
        question: 'Quel don majeur fut accorde aux musulmans lors du Mi\'raj ?',
        choices: [
          'Les cinq prieres quotidiennes obligatoires',
          'Le jeune du Ramadan',
          'Le pelerinage a La Mecque',
          'L\'aumone obligatoire (Zakat)',
        ],
        correctIndex: 0,
        explanation: 'Les cinq prieres quotidiennes furent rendues obligatoires lors de cette nuit benie.',
      },
      {
        id: 'e14_q3', eventId: 14, type: 'comprehension',
        question: 'Quels autres dons furent accordes lors de cette nuit, en plus des prieres ?',
        choices: [
          'Les derniers versets d\'Al-Baqarah et la promesse de pardon pour ceux qui evitent le shirk',
          'La sourate Al-Fatiha et les regles du jeune',
          'Les regles du pelerinage et de la Zakat',
          'Les dix commandements de l\'Islam',
        ],
        correctIndex: 0,
        explanation: 'Les deux derniers versets de la sourate Al-Baqarah furent reveles et la promesse du pardon fut annoncee.',
      },
      {
        id: 'e14_q4', eventId: 14, type: 'comprehension',
        question: 'Jusqu\'ou le Prophete monta-t-il lors du Mi\'raj ?',
        choices: [
          'Sidrat al-Muntaha, au-dela du temps et de l\'espace',
          'Le septieme ciel uniquement',
          'Le troisieme ciel',
          'La Masjid al-Aqsa',
        ],
        correctIndex: 0,
        explanation: 'Il monta jusqu\'a Sidrat al-Muntaha et au-dela du temps et de l\'espace jusqu\'a la presence de Dieu.',
      },
      {
        id: 'e14_q5', eventId: 14, type: 'significance',
        question: 'Quel reconfort cet evenement apporta-t-il au Prophete ?',
        choices: [
          'Un soutien spirituel apres les epreuves de l\'Annee du Chagrin et de Taif',
          'Une victoire militaire imminente',
          'La soumission des Quraysh',
          'La fin de la persecution',
        ],
        correctIndex: 0,
        explanation: 'Cet evenement apporta reconfort et soutien spirituels apres les grandes epreuves.',
      },
    ],
  },

  // ─── EVENT 15: Premier serment d'Aqaba ─────────────────────
  {
    eventId: 15,
    eventTitle: "Premier serment d'Aqaba",
    eventYear: '621 apr. J.-C.',
    questions: [
      {
        id: 'e15_q1', eventId: 15, type: 'factual',
        question: 'Combien de personnes de Medine preterent serment lors du premier serment d\'Aqaba ?',
        choices: ['Six personnes', 'Douze personnes', 'Soixante-treize personnes', 'Cent personnes'],
        correctIndex: 0,
        explanation: 'Six personnes de la tribu Khazraj rencontrerent le Prophete et se convertirent.',
      },
      {
        id: 'e15_q2', eventId: 15, type: 'factual',
        question: 'De quelle tribu venaient les premiers convertis de Medine ?',
        choices: ['Khazraj', 'Aws', 'Quraysh', 'Banu Hashim'],
        correctIndex: 0,
        explanation: 'Ces six personnes venaient de la tribu Khazraj de Medine.',
      },
      {
        id: 'e15_q3', eventId: 15, type: 'comprehension',
        question: 'Que promirent ces convertis au Prophete ?',
        choices: [
          'Leur soutien et de propager l\'Islam a Medine',
          'De construire une mosquee',
          'De former une armee',
          'De financer la predication',
        ],
        correctIndex: 0,
        explanation: 'Ils promirent leur soutien et s\'engagerent a propager l\'Islam a Medine.',
      },
      {
        id: 'e15_q4', eventId: 15, type: 'comprehension',
        question: 'Lors de quel evenement annuel cette rencontre eut-elle lieu ?',
        choices: ['Le pelerinage', 'Le marche d\'Ukaz', 'La foire de Mina', 'Le festival de La Mecque'],
        correctIndex: 0,
        explanation: 'Le premier serment d\'Aqaba eut lieu lors du pelerinage.',
      },
      {
        id: 'e15_q5', eventId: 15, type: 'significance',
        question: 'Quelle perspective cet evenement ouvrit-il ?',
        choices: [
          'Une nouvelle perspective d\'espoir et le debut des relations avec Medine',
          'La fin de la persecution a La Mecque',
          'La creation d\'une armee musulmane',
          'L\'etablissement d\'une route commerciale',
        ],
        correctIndex: 0,
        explanation: 'Ce premier contact ouvrit une nouvelle perspective d\'espoir menant a l\'Hegire.',
      },
    ],
  },

  // ─── EVENT 16: Deuxième serment d'Aqaba ─────────────────────
  {
    eventId: 16,
    eventTitle: "Deuxieme serment d'Aqaba",
    eventYear: '622 apr. J.-C.',
    questions: [
      {
        id: 'e16_q1', eventId: 16, type: 'factual',
        question: 'Combien de personnes preterent serment lors du deuxieme serment d\'Aqaba ?',
        choices: ['73 hommes et 2 femmes', '12 hommes', '100 personnes', '50 hommes et 10 femmes'],
        correctIndex: 0,
        explanation: '73 hommes et 2 femmes de Medine preterent allegeance au Prophete.',
      },
      {
        id: 'e16_q2', eventId: 16, type: 'factual',
        question: 'De quelles tribus de Medine venaient ces convertis ?',
        choices: ['Aws et Khazraj', 'Khazraj uniquement', 'Banu Qaynuqa et Banu Nadir', 'Quraysh et Banu Hashim'],
        correctIndex: 0,
        explanation: 'Ils venaient des tribus Aws et Khazraj de Medine.',
      },
      {
        id: 'e16_q3', eventId: 16, type: 'comprehension',
        question: 'Que promirent-ils specifiquement au Prophete ?',
        choices: [
          'De le proteger comme ils protegeaient leurs propres familles',
          'De lui envoyer des provisions mensuelles',
          'De conquérir La Mecque pour lui',
          'De l\'accueillir en tant que roi',
        ],
        correctIndex: 0,
        explanation: 'Ils promirent de le proteger comme ils protegeaient leurs propres familles.',
      },
      {
        id: 'e16_q4', eventId: 16, type: 'comprehension',
        question: 'Quel engagement moral etait inclus dans ce serment ?',
        choices: [
          'L\'engagement de ne pas commettre certains peches',
          'L\'engagement de payer un impot',
          'L\'engagement de combattre les Quraysh',
          'L\'engagement de construire une mosquee',
        ],
        correctIndex: 0,
        explanation: 'Cette alliance incluait l\'engagement de ne pas commettre certains peches.',
      },
      {
        id: 'e16_q5', eventId: 16, type: 'significance',
        question: 'Quelle fut l\'importance majeure de ce serment ?',
        choices: [
          'Il etablit les bases de la migration vers Medine et de l\'Etat islamique',
          'Il marqua la fin de la persecution a La Mecque',
          'Il declencha une guerre entre Medine et La Mecque',
          'Il unifia toutes les tribus arabes',
        ],
        correctIndex: 0,
        explanation: 'Ce serment etablit les bases de la migration vers Medine et permit l\'etablissement de l\'Etat islamique.',
      },
    ],
  },

  // ─── EVENT 17: L'Hégire ─────────────────────
  {
    eventId: 17,
    eventTitle: "L'Hegire - Migration vers Medine",
    eventYear: '622 apr. J.-C.',
    questions: [
      {
        id: 'e17_q1', eventId: 17, type: 'factual',
        question: 'Avec qui le Prophete (ﷺ) quitta-t-il secretement La Mecque ?',
        choices: ['Abu Bakr', 'Ali', 'Umar', 'Uthman'],
        correctIndex: 0,
        explanation: 'Le Prophete quitta secretement La Mecque avec Abu Bakr.',
      },
      {
        id: 'e17_q2', eventId: 17, type: 'factual',
        question: 'Dans quelle grotte se cacherent-ils pendant trois jours ?',
        choices: ['La grotte de Thawr', 'La grotte de Hira', 'La grotte de Safa', 'La grotte d\'Uhud'],
        correctIndex: 0,
        explanation: 'Ils se refugierent dans la grotte de Thawr pendant trois jours.',
      },
      {
        id: 'e17_q3', eventId: 17, type: 'comprehension',
        question: 'Quel miracle protegea les fugitifs dans la grotte ?',
        choices: [
          'Une araignee tissa sa toile a l\'entree de la grotte',
          'Un nuage couvrit la grotte',
          'Un tremblement de terre bloqua le passage',
          'Un aigle attaqua les poursuivants',
        ],
        correctIndex: 0,
        explanation: 'Des miracles comme une araignee tissant sa toile a l\'entree permirent d\'echapper aux poursuivants.',
      },
      {
        id: 'e17_q4', eventId: 17, type: 'comprehension',
        question: 'Que se passa-t-il avec le cheval de Suraqa en chemin ?',
        choices: [
          'Il s\'enlisa dans le sable',
          'Il tomba malade',
          'Il s\'enfuit dans le desert',
          'Il refusa d\'avancer',
        ],
        correctIndex: 0,
        explanation: 'Le cheval de Suraqa s\'enlisa dans le sable, un miracle qui les protegea.',
      },
      {
        id: 'e17_q5', eventId: 17, type: 'significance',
        question: 'Quelle est l\'importance historique de l\'Hegire ?',
        choices: [
          'Elle marque le debut du calendrier islamique et du premier Etat islamique',
          'Elle marque la premiere victoire militaire de l\'Islam',
          'Elle marque la fin de la revelation coranique',
          'Elle marque l\'unification de toutes les tribus arabes',
        ],
        correctIndex: 0,
        explanation: 'La migration marque le debut du calendrier islamique et l\'etablissement du premier Etat islamique.',
      },
    ],
  },

  // ─── EVENT 18: Arrivée à Médine ─────────────────────
  {
    eventId: 18,
    eventTitle: 'Arrivee a Medine',
    eventYear: '622 apr. J.-C.',
    questions: [
      {
        id: 'e18_q1', eventId: 18, type: 'factual',
        question: 'Quelle fut la premiere mosquee construite en Islam ?',
        choices: ['La mosquee de Quba', 'Masjid al-Nabawi', 'Masjid al-Haram', 'Masjid al-Aqsa'],
        correctIndex: 0,
        explanation: 'La mosquee de Quba au village de Quba fut la premiere mosquee construite.',
      },
      {
        id: 'e18_q2', eventId: 18, type: 'factual',
        question: 'Chez quel compagnon le Prophete sejourna-t-il a Medine ?',
        choices: ['Abu Ayyub al-Ansari', 'Sa\'d ibn Mu\'adh', 'Anas ibn Malik', 'Bilal ibn Rabah'],
        correctIndex: 0,
        explanation: 'Le chameau du Prophete s\'agenouilla devant la maison d\'Abu Ayyub al-Ansari.',
      },
      {
        id: 'e18_q3', eventId: 18, type: 'comprehension',
        question: 'Quel chant celebre les habitants entonnerent-ils a l\'arrivee du Prophete ?',
        choices: [
          'Tala\'a l-badru alayna (La pleine lune s\'est levee)',
          'Allahu Akbar (Dieu est le Plus Grand)',
          'La ilaha illa Allah (Il n\'y a de dieu qu\'Allah)',
          'SubhanAllah (Gloire a Dieu)',
        ],
        correctIndex: 0,
        explanation: 'Les habitants chanterent "Tala\'a l-badru alayna" (La pleine lune s\'est levee sur nous).',
      },
      {
        id: 'e18_q4', eventId: 18, type: 'comprehension',
        question: 'Ou le Prophete dirigea-t-il la premiere priere du vendredi ?',
        choices: [
          'Dans la vallee de Ranuna',
          'A la mosquee de Quba',
          'A Masjid al-Nabawi',
          'Au centre de Medine',
        ],
        correctIndex: 0,
        explanation: 'Il dirigea la premiere priere du vendredi de l\'Islam dans la vallee de Ranuna.',
      },
      {
        id: 'e18_q5', eventId: 18, type: 'significance',
        question: 'Quel document fondateur fut redige apres l\'arrivee a Medine ?',
        choices: [
          'La Constitution de Medine',
          'Le traite de Hudaybiyyah',
          'La Charte de La Mecque',
          'Le Pacte des Tribus',
        ],
        correctIndex: 0,
        explanation: 'L\'arrivee a Medine mena a la redaction de la Constitution de Medine.',
      },
    ],
  },

  // ─── EVENT 19: Construction de la Mosquée du Prophète ─────────────────────
  {
    eventId: 19,
    eventTitle: 'Construction de la Mosquee du Prophete',
    eventYear: '623 apr. J.-C.',
    questions: [
      {
        id: 'e19_q1', eventId: 19, type: 'factual',
        question: 'Quel est le nom de la mosquee construite par le Prophete a Medine ?',
        choices: ['Masjid al-Nabawi', 'Masjid al-Quba', 'Masjid al-Haram', 'Masjid al-Aqsa'],
        correctIndex: 0,
        explanation: 'La Mosquee du Prophete est appelee Masjid al-Nabawi.',
      },
      {
        id: 'e19_q2', eventId: 19, type: 'factual',
        question: 'Qui participa personnellement a la construction de la mosquee ?',
        choices: ['Le Prophete lui-meme avec ses compagnons', 'Uniquement les artisans de Medine', 'Des ouvriers payes', 'Les tribus juives de Medine'],
        correctIndex: 0,
        explanation: 'Le Prophete participa personnellement a la construction avec ses compagnons.',
      },
      {
        id: 'e19_q3', eventId: 19, type: 'comprehension',
        question: 'Quelles fonctions la mosquee remplissait-elle, en plus de la priere ?',
        choices: [
          'Centre administratif, educatif, social et refuge pour les pauvres',
          'Uniquement un lieu de priere',
          'Un marche commercial',
          'Un fort militaire',
        ],
        correctIndex: 0,
        explanation: 'La mosquee servait de centre spirituel, administratif, educatif et social.',
      },
      {
        id: 'e19_q4', eventId: 19, type: 'comprehension',
        question: 'Comment appelait-on les pauvres et sans-abri qui trouvaient refuge a la mosquee ?',
        choices: ['Ahl al-Suffah', 'Les Muhajirin', 'Les Ansar', 'Les Muallafat'],
        correctIndex: 0,
        explanation: 'Les pauvres et les sans-abri (Ahl al-Suffah) y trouvaient refuge.',
      },
      {
        id: 'e19_q5', eventId: 19, type: 'significance',
        question: 'Quel role la mosquee joua-t-elle dans la communaute naissante ?',
        choices: [
          'Elle devint le coeur battant de la communaute islamique et un modele pour les futures mosquees',
          'Elle servit uniquement de lieu de culte',
          'Elle fut principalement une forteresse militaire',
          'Elle etait reservee aux chefs de tribus',
        ],
        correctIndex: 0,
        explanation: 'La mosquee devint le coeur battant de la communaute islamique naissante, servant de modele.',
      },
    ],
  },

  // ─── EVENT 20: Changement de la Qibla ─────────────────────
  {
    eventId: 20,
    eventTitle: 'Changement de la Qibla',
    eventYear: '624 apr. J.-C.',
    questions: [
      {
        id: 'e20_q1', eventId: 20, type: 'factual',
        question: 'Vers quelle direction les musulmans priaient-ils avant le changement de qibla ?',
        choices: ['Vers la mosquee Al-Aqsa a Jerusalem', 'Vers la Kaaba a La Mecque', 'Vers le nord', 'Vers l\'est'],
        correctIndex: 0,
        explanation: 'Pendant 16-17 mois, le Prophete pria face a la mosquee Al-Aqsa a Jerusalem.',
      },
      {
        id: 'e20_q2', eventId: 20, type: 'factual',
        question: 'Quel verset ordonna le changement de qibla ?',
        choices: ['Verset 144 de la sourate Al-Baqarah', 'Verset 1 de la sourate Al-Fatiha', 'Verset 255 de la sourate Al-Baqarah', 'Verset 1 de la sourate Al-Ikhlas'],
        correctIndex: 0,
        explanation: 'Le verset 144 de la sourate Al-Baqarah fut revele, ordonnant de se tourner vers la Kaaba.',
      },
      {
        id: 'e20_q3', eventId: 20, type: 'comprehension',
        question: 'Comment s\'appelle la mosquee ou ce changement eut lieu ?',
        choices: [
          'Masjid al-Qiblatayn (la mosquee des deux qiblas)',
          'Masjid al-Nabawi',
          'Masjid al-Quba',
          'Masjid al-Haram',
        ],
        correctIndex: 0,
        explanation: 'Cette mosquee fut nommee Masjid al-Qiblatayn (la mosquee des deux qiblas).',
      },
      {
        id: 'e20_q4', eventId: 20, type: 'comprehension',
        question: 'Combien de temps les musulmans prierent-ils vers Jerusalem apres l\'Hegire ?',
        choices: ['16 ou 17 mois', '3 mois', '1 an', '5 ans'],
        correctIndex: 0,
        explanation: 'Pendant 16 ou 17 mois apres l\'emigration, ils prierent vers Jerusalem.',
      },
      {
        id: 'e20_q5', eventId: 20, type: 'significance',
        question: 'Que representait ce changement de qibla ?',
        choices: [
          'L\'affirmation de l\'identite islamique distincte et de l\'importance de la Kaaba',
          'La rupture avec les Juifs de Medine',
          'Un simple changement de direction',
          'L\'abandon de la mosquee Al-Aqsa',
        ],
        correctIndex: 0,
        explanation: 'Ce changement affirma l\'identite islamique distincte et l\'importance de la Kaaba.',
      },
    ],
  },

  // ─── EVENT 21: Bataille de Badr ─────────────────────
  {
    eventId: 21,
    eventTitle: 'Bataille de Badr',
    eventYear: '624 apr. J.-C.',
    questions: [
      {
        id: 'e21_q1', eventId: 21, type: 'factual',
        question: 'Combien de combattants musulmans participaient a la bataille de Badr ?',
        choices: ['305 hommes', '1 000 hommes', '700 hommes', '3 000 hommes'],
        correctIndex: 0,
        explanation: 'Le Prophete quitta Medine avec 305 hommes.',
      },
      {
        id: 'e21_q2', eventId: 21, type: 'factual',
        question: 'Combien de polytheistes furent tues, dont Abu Jahl ?',
        choices: ['Soixante-dix', 'Trente', 'Cent', 'Cinquante'],
        correctIndex: 0,
        explanation: 'Soixante-dix polytheistes, dont Abu Jahl, furent tues.',
      },
      {
        id: 'e21_q3', eventId: 21, type: 'comprehension',
        question: 'Comment les prisonniers lettres furent-ils liberes ?',
        choices: [
          'En echange de l\'enseignement a dix musulmans chacun',
          'En payant une rancon',
          'En se convertissant a l\'Islam',
          'En pretant serment de non-agression',
        ],
        correctIndex: 0,
        explanation: 'Les prisonniers qui savaient lire et ecrire furent liberes en echange de l\'enseignement a dix musulmans.',
      },
      {
        id: 'e21_q4', eventId: 21, type: 'comprehension',
        question: 'Quelle manoeuvre strategique les musulmans effectuerent-ils ?',
        choices: [
          'Ils s\'emparerent des puits de Badr',
          'Ils creuserent une tranchee',
          'Ils attaquerent de nuit',
          'Ils encerclerent l\'ennemi',
        ],
        correctIndex: 0,
        explanation: 'Dans une manoeuvre strategique, l\'armee islamique s\'empara des puits de Badr.',
      },
      {
        id: 'e21_q5', eventId: 21, type: 'significance',
        question: 'Que confirma cette victoire selon le Coran ?',
        choices: [
          'L\'aide divine et le soutien des anges pour les musulmans',
          'La superiorite numerique des musulmans',
          'L\'inutilite de la diplomatie',
          'La fin definitive des Quraysh',
        ],
        correctIndex: 0,
        explanation: 'Le Coran affirme que cette victoire fut remportee grace a l\'aide d\'Allah et au soutien des anges.',
      },
    ],
  },

  // ─── EVENT 22: Bataille d'Uhud ─────────────────────
  {
    eventId: 22,
    eventTitle: "Bataille d'Uhud",
    eventYear: '625 apr. J.-C.',
    questions: [
      {
        id: 'e22_q1', eventId: 22, type: 'factual',
        question: 'Combien d\'archers le Prophete positionna-t-il sur la colline d\'Aynayn ?',
        choices: ['50 archers', '100 archers', '30 archers', '200 archers'],
        correctIndex: 0,
        explanation: 'Le Prophete positionna 50 archers sur la colline d\'Aynayn.',
      },
      {
        id: 'e22_q2', eventId: 22, type: 'factual',
        question: 'Combien de musulmans furent martyrises a Uhud ?',
        choices: ['70', '14', '100', '30'],
        correctIndex: 0,
        explanation: '70 musulmans furent martyrises, dont Hamza.',
      },
      {
        id: 'e22_q3', eventId: 22, type: 'comprehension',
        question: 'Pourquoi les musulmans perdirent-ils l\'avantage lors de la bataille ?',
        choices: [
          'La plupart des archers quitterent leur poste pour le butin',
          'L\'armee etait trop petite',
          'Les armes etaient insuffisantes',
          'Le Prophete fut capture',
        ],
        correctIndex: 0,
        explanation: 'Lorsque la plupart des archers quitterent la colline pour le butin, Khalid ibn al-Walid attaqua par l\'arriere.',
      },
      {
        id: 'e22_q4', eventId: 22, type: 'comprehension',
        question: 'Qui commanda le retrait de 300 hommes avant la bataille ?',
        choices: [
          'Les hypocrites (al-Munafiqun)',
          'Les Juifs de Medine',
          'Les Quraysh infiltres',
          'Les blesses de Badr',
        ],
        correctIndex: 0,
        explanation: 'Apres le retrait de 300 hypocrites, il ne resta que 700 compagnons.',
      },
      {
        id: 'e22_q5', eventId: 22, type: 'significance',
        question: 'Quelle lecon principale tire-t-on de la bataille d\'Uhud ?',
        choices: [
          'L\'importance de l\'obeissance aux ordres et de la discipline',
          'La necessite d\'avoir une armee plus grande',
          'L\'importance des armures et armes',
          'La necessite de ne jamais attaquer',
        ],
        correctIndex: 0,
        explanation: 'Cette bataille demontra que la victoire s\'obtient par la devotion a Dieu et la discipline.',
      },
    ],
  },

  // ─── EVENT 23: Expulsion des Banu Nadir ─────────────────────
  {
    eventId: 23,
    eventTitle: 'Expulsion des Banu Nadir',
    eventYear: '626 apr. J.-C.',
    questions: [
      {
        id: 'e23_q1', eventId: 23, type: 'factual',
        question: 'Comment les Banu Nadir tenterent-ils d\'assassiner le Prophete ?',
        choices: [
          'En faisant tomber une pierre sur lui depuis un toit',
          'En empoisonnant sa nourriture',
          'En l\'attaquant avec des epees',
          'En envoyant un tireur a l\'arc',
        ],
        correctIndex: 0,
        explanation: 'Ils conspirerent pour faire tomber une pierre sur lui depuis le toit d\'une maison.',
      },
      {
        id: 'e23_q2', eventId: 23, type: 'factual',
        question: 'Combien de jours dura le siege des Banu Nadir ?',
        choices: ['Quinze jours', 'Dix jours', 'Vingt-cinq jours', 'Trente jours'],
        correctIndex: 0,
        explanation: 'Apres un siege de quinze jours, ils accepterent de partir.',
      },
      {
        id: 'e23_q3', eventId: 23, type: 'comprehension',
        question: 'Qu\'avaient viole les Banu Nadir pour justifier leur expulsion ?',
        choices: [
          'La Charte de Medine',
          'Un traite commercial',
          'Le serment d\'Aqaba',
          'Un accord de non-agression',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete ordonna leur expulsion pour avoir viole la Charte de Medine.',
      },
      {
        id: 'e23_q4', eventId: 23, type: 'comprehension',
        question: 'Qui encouragea les Banu Nadir a refuser de partir ?',
        choices: ['Les hypocrites', 'Les Quraysh', 'Les Banu Qurayza', 'Les Banu Qaynuqa'],
        correctIndex: 0,
        explanation: 'Encourages par les hypocrites, ils refuserent d\'abord de partir.',
      },
      {
        id: 'e23_q5', eventId: 23, type: 'significance',
        question: 'Quelle lecon cet evenement enseigne-t-il ?',
        choices: [
          'Que la trahison et le complot contre l\'Etat islamique ne seraient pas toleres',
          'Que tous les non-musulmans devaient quitter Medine',
          'Que la guerre etait la seule solution',
          'Que les traites sont inutiles',
        ],
        correctIndex: 0,
        explanation: 'Cet evenement demontra que la trahison et le complot ne seraient pas toleres.',
      },
    ],
  },

  // ─── EVENT 24: Bataille du Fossé ─────────────────────
  {
    eventId: 24,
    eventTitle: 'Bataille du Fosse (Khandaq)',
    eventYear: '627 apr. J.-C.',
    questions: [
      {
        id: 'e24_q1', eventId: 24, type: 'factual',
        question: 'Qui proposa l\'idee de creuser une tranchee autour de Medine ?',
        choices: ['Salman al-Farsi', 'Abu Bakr', 'Umar', 'Khalid ibn al-Walid'],
        correctIndex: 0,
        explanation: 'Sur proposition de Salman al-Farsi, une tranchee fut creusee.',
      },
      {
        id: 'e24_q2', eventId: 24, type: 'factual',
        question: 'Quelle etait la taille approximative de l\'armee confederee ?',
        choices: ['10 000 a 12 000 soldats', '3 000 soldats', '5 000 soldats', '20 000 soldats'],
        correctIndex: 0,
        explanation: 'Une alliance de 10 000 a 12 000 soldats assiegea Medine.',
      },
      {
        id: 'e24_q3', eventId: 24, type: 'comprehension',
        question: 'Qu\'est-ce qui mit fin au siege ?',
        choices: [
          'Une violente tempete s\'abattit sur l\'armee confederee',
          'Les musulmans attaquerent en force',
          'Les Quraysh manquerent de provisions',
          'Un traite de paix fut signe',
        ],
        correctIndex: 0,
        explanation: 'Une violente tempete eteignit leurs feux et decima leurs forces, mettant fin au siege.',
      },
      {
        id: 'e24_q4', eventId: 24, type: 'comprehension',
        question: 'Quelle tribu trahit les musulmans pendant le siege ?',
        choices: ['Les Banu Qurayza', 'Les Banu Nadir', 'Les Banu Qaynuqa', 'Les Aws'],
        correctIndex: 0,
        explanation: 'Durant le siege, la tribu des Banu Qurayza trahit les musulmans.',
      },
      {
        id: 'e24_q5', eventId: 24, type: 'significance',
        question: 'Que proclama le Prophete apres cette victoire ?',
        choices: [
          '"Desormais, nous les attaquerons, ils ne pourront plus nous attaquer"',
          '"La paix est notre seule arme"',
          '"Nous devons construire des murs plus grands"',
          '"Tous les ennemis doivent etre pardonnes"',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete proclama : "Desormais, nous les attaquerons, ils ne pourront plus nous attaquer."',
      },
    ],
  },

  // ─── EVENT 25: Incident des Banu Qurayza ─────────────────────
  {
    eventId: 25,
    eventTitle: 'Incident des Banu Qurayza',
    eventYear: '627 apr. J.-C.',
    questions: [
      {
        id: 'e25_q1', eventId: 25, type: 'factual',
        question: 'Combien de jours dura le siege des Banu Qurayza ?',
        choices: ['25 jours', '15 jours', '10 jours', '40 jours'],
        correctIndex: 0,
        explanation: 'Apres un siege de 25 jours, ils se rendirent.',
      },
      {
        id: 'e25_q2', eventId: 25, type: 'factual',
        question: 'Qui rendit le jugement sur les Banu Qurayza ?',
        choices: ['Sa\'d ibn Mu\'adh', 'Abu Bakr', 'Le Prophete lui-meme', 'Umar ibn al-Khattab'],
        correctIndex: 0,
        explanation: 'Ils accepterent le jugement de Sa\'d ibn Mu\'adh, chef des Aws.',
      },
      {
        id: 'e25_q3', eventId: 25, type: 'comprehension',
        question: 'Selon quelle loi Sa\'d ibn Mu\'adh rendit-il son jugement ?',
        choices: [
          'La loi de la Torah pour trahison en temps de guerre',
          'La loi islamique du pardon',
          'La coutume arabe du bannissement',
          'Sa propre decision personnelle',
        ],
        correctIndex: 0,
        explanation: 'Sa\'d rendit un jugement conforme a la loi de la Torah pour trahison en temps de guerre.',
      },
      {
        id: 'e25_q4', eventId: 25, type: 'comprehension',
        question: 'Pourquoi les Banu Qurayza furent-ils juges ?',
        choices: [
          'Pour avoir trahi les musulmans durant le siege en violant la Charte de Medine',
          'Pour avoir refuse de payer des impots',
          'Pour avoir insulte le Prophete',
          'Pour avoir aide les refugies',
        ],
        correctIndex: 0,
        explanation: 'Ils avaient trahi les musulmans durant le siege en violant la Charte de Medine.',
      },
      {
        id: 'e25_q5', eventId: 25, type: 'significance',
        question: 'Quelle consequence eut cet evenement pour la securite de Medine ?',
        choices: [
          'Il elimina la derniere menace interne et assura la securite de la ville',
          'Il provoqua de nouvelles tensions avec les tribus voisines',
          'Il affaiblit l\'autorite du Prophete',
          'Il entraina une nouvelle migration',
        ],
        correctIndex: 0,
        explanation: 'Cet evenement elimina la derniere menace interne juive a Medine et assura la securite de la ville.',
      },
    ],
  },

  // ─── EVENT 26: Traité de Hudaybiyyah ─────────────────────
  {
    eventId: 26,
    eventTitle: 'Traite de Hudaybiyyah',
    eventYear: '628 apr. J.-C.',
    questions: [
      {
        id: 'e26_q1', eventId: 26, type: 'factual',
        question: 'Combien de compagnons accompagnaient le Prophete a Hudaybiyyah ?',
        choices: ['Environ 1 500', 'Environ 10 000', 'Environ 3 000', 'Environ 500'],
        correctIndex: 0,
        explanation: 'Le Prophete et environ 1 500 compagnons partirent pour La Mecque.',
      },
      {
        id: 'e26_q2', eventId: 26, type: 'factual',
        question: 'Comment le Coran qualifie-t-il le traite de Hudaybiyyah ?',
        choices: ['Une victoire eclatante (dans la sourate Al-Fath)', 'Une epreuve difficile', 'Un compromis acceptable', 'Un accord temporaire'],
        correctIndex: 0,
        explanation: 'La sourate Al-Fath decrit ce traite comme "une victoire eclatante".',
      },
      {
        id: 'e26_q3', eventId: 26, type: 'comprehension',
        question: 'Quel serment le Prophete recut-il sous un arbre ?',
        choices: [
          'Le Serment de Ridwan',
          'Le Serment d\'Aqaba',
          'Le Serment d\'Alliance',
          'Le Serment de Paix',
        ],
        correctIndex: 0,
        explanation: 'Lorsque le retard d\'Uthman fit craindre sa mort, le Prophete recut le "Serment de Ridwan" sous un arbre.',
      },
      {
        id: 'e26_q4', eventId: 26, type: 'comprehension',
        question: 'Quelle duree de paix le traite prevoyait-il ?',
        choices: ['Dix ans', 'Cinq ans', 'Trois ans', 'Un an'],
        correctIndex: 0,
        explanation: 'Le traite prevoyait une paix de dix ans.',
      },
      {
        id: 'e26_q5', eventId: 26, type: 'significance',
        question: 'Quelle reconnaissance politique majeure ce traite apporta-t-il ?',
        choices: [
          'Les Quraysh reconnurent officiellement l\'existence politique des musulmans',
          'Les musulmans furent reconnus comme une tribu de La Mecque',
          'Le Prophete fut reconnu comme roi de Medine',
          'Les musulmans obtinrent des droits commerciaux',
        ],
        correctIndex: 0,
        explanation: 'Les Quraysh reconnurent officiellement l\'existence politique des musulmans.',
      },
    ],
  },

  // ─── EVENT 27: Conquête de Khaybar ─────────────────────
  {
    eventId: 27,
    eventTitle: 'Conquete de Khaybar',
    eventYear: '628 apr. J.-C.',
    questions: [
      {
        id: 'e27_q1', eventId: 27, type: 'factual',
        question: 'A quelle distance de Medine se trouvait Khaybar ?',
        choices: ['180 km au nord', '50 km au sud', '300 km a l\'est', '100 km a l\'ouest'],
        correctIndex: 0,
        explanation: 'Khaybar etait une oasis fortifiee a 180 km au nord de Medine.',
      },
      {
        id: 'e27_q2', eventId: 27, type: 'factual',
        question: 'Quel compagnon fit preuve d\'un grand heroisme lors de la prise du fort Qamus ?',
        choices: ['Ali', 'Umar', 'Khalid ibn al-Walid', 'Abu Bakr'],
        correctIndex: 0,
        explanation: 'Ali fit preuve d\'un grand heroisme lors de la conquete du dernier fort, Qamus.',
      },
      {
        id: 'e27_q3', eventId: 27, type: 'comprehension',
        question: 'Quel accord le Prophete conclut-il avec les Juifs de Khaybar apres la conquete ?',
        choices: [
          'Ils pouvaient rester sur leurs terres en versant la moitie de la recolte',
          'Ils devaient quitter Khaybar immediatement',
          'Ils devaient se convertir a l\'Islam',
          'Ils furent exiles en Abyssinie',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete permit aux Juifs de rester en versant la moitie de la recolte en impot (kharaj).',
      },
      {
        id: 'e27_q4', eventId: 27, type: 'comprehension',
        question: 'Pourquoi l\'expedition contre Khaybar fut-elle necessaire ?',
        choices: [
          'Les Banu Nadir exiles y incitaient contre les musulmans',
          'Khaybar avait attaque Medine',
          'Les musulmans avaient besoin de terres agricoles',
          'C\'etait une route commerciale strategique',
        ],
        correctIndex: 0,
        explanation: 'Khaybar etait habitee par les Juifs Banu Nadir exiles qui continuaient d\'inciter contre les musulmans.',
      },
      {
        id: 'e27_q5', eventId: 27, type: 'significance',
        question: 'Quel impact economique eut la conquete de Khaybar ?',
        choices: [
          'Le butin ameliora considerablement la situation economique des musulmans',
          'Les musulmans devinrent pauvres a cause du siege prolonge',
          'Aucun impact economique notable',
          'Les musulmans partagerent toutes leurs richesses avec les vaincus',
        ],
        correctIndex: 0,
        explanation: 'Le butin ameliora considerablement la situation economique des musulmans.',
      },
    ],
  },

  // ─── EVENT 28: Omra al-Qada ─────────────────────
  {
    eventId: 28,
    eventTitle: 'Omra al-Qada (Premier pelerinage)',
    eventYear: '629 apr. J.-C.',
    questions: [
      {
        id: 'e28_q1', eventId: 28, type: 'factual',
        question: 'Combien de compagnons accompagnerent le Prophete pour l\'Omra al-Qada ?',
        choices: ['2 000', '1 500', '10 000', '500'],
        correctIndex: 0,
        explanation: 'Le Prophete entra a La Mecque avec 2 000 compagnons.',
      },
      {
        id: 'e28_q2', eventId: 28, type: 'factual',
        question: 'Quels Mecquois celebres se convertirent apres avoir vu la devotion des musulmans ?',
        choices: ['Khalid ibn al-Walid et Amr ibn al-As', 'Abu Sufyan et Hind', 'Abu Jahl et Abu Lahab', 'Suhail ibn Amr et Ikrimah'],
        correctIndex: 0,
        explanation: 'Khalid ibn al-Walid et Amr ibn al-As se convertirent apres avoir ete temoins de la devotion des musulmans.',
      },
      {
        id: 'e28_q3', eventId: 28, type: 'comprehension',
        question: 'Combien de jours les musulmans resterent-ils a La Mecque ?',
        choices: ['Trois jours', 'Sept jours', 'Un jour', 'Dix jours'],
        correctIndex: 0,
        explanation: 'Les polytheistes evacuerent la ville pendant trois jours comme convenu dans le traite.',
      },
      {
        id: 'e28_q4', eventId: 28, type: 'comprehension',
        question: 'En vertu de quel accord cette Omra fut-elle effectuee ?',
        choices: [
          'Le traite de Hudaybiyyah',
          'Le serment d\'Aqaba',
          'La Constitution de Medine',
          'Un accord direct avec Abu Sufyan',
        ],
        correctIndex: 0,
        explanation: 'L\'Omra al-Qada fut effectuee conformement aux termes du traite de Hudaybiyyah.',
      },
      {
        id: 'e28_q5', eventId: 28, type: 'significance',
        question: 'Quel impact cette visite eut-elle sur les Mecquois ?',
        choices: [
          'Elle permit a beaucoup de voir la beaute de l\'Islam et accelera les conversions',
          'Elle provoqua une guerre immediate',
          'Elle n\'eut aucun impact',
          'Elle effraya les habitants de La Mecque',
        ],
        correctIndex: 0,
        explanation: 'Cette visite permit a de nombreux Mecquois de voir de pres la beaute de l\'Islam.',
      },
    ],
  },

  // ─── EVENT 29: Bataille de Mu'tah ─────────────────────
  {
    eventId: 29,
    eventTitle: "Bataille de Mu'tah",
    eventYear: '629 apr. J.-C.',
    questions: [
      {
        id: 'e29_q1', eventId: 29, type: 'factual',
        question: 'Combien de soldats musulmans furent envoyes a Mu\'tah ?',
        choices: ['3 000', '10 000', '1 000', '30 000'],
        correctIndex: 0,
        explanation: 'Le Prophete envoya une armee de 3 000 hommes.',
      },
      {
        id: 'e29_q2', eventId: 29, type: 'factual',
        question: 'Combien de commandants musulmans tomberent en martyrs successivement ?',
        choices: ['Trois', 'Un', 'Deux', 'Quatre'],
        correctIndex: 0,
        explanation: 'Les trois commandants successifs - Zayd, Ja\'far et Abdullah ibn Rawahah - tomberent en martyrs.',
      },
      {
        id: 'e29_q3', eventId: 29, type: 'comprehension',
        question: 'Qui prit le commandement apres la mort des trois commandants ?',
        choices: ['Khalid ibn al-Walid', 'Abu Bakr', 'Ali ibn Abi Talib', 'Umar ibn al-Khattab'],
        correctIndex: 0,
        explanation: 'Khalid ibn al-Walid prit le commandement et sauva l\'armee par une retraite strategique.',
      },
      {
        id: 'e29_q4', eventId: 29, type: 'comprehension',
        question: 'Pourquoi cette bataille eut-elle lieu ?',
        choices: [
          'Pour venger le meurtre de l\'emissaire du Prophete par les Ghassanides',
          'Pour conquérir la Jordanie',
          'Pour proteger une caravane commerciale',
          'Pour punir une tribu rebelle',
        ],
        correctIndex: 0,
        explanation: 'L\'armee fut envoyee pour venger le meurtre de l\'emissaire al-Harith ibn Umayr.',
      },
      {
        id: 'e29_q5', eventId: 29, type: 'significance',
        question: 'Quelle est l\'importance historique de la bataille de Mu\'tah ?',
        choices: [
          'Le premier engagement avec une superpuissance mondiale (Byzance)',
          'La derniere bataille du Prophete',
          'La plus grande victoire militaire de l\'Islam',
          'La premiere utilisation de la cavalerie',
        ],
        correctIndex: 0,
        explanation: 'Ce fut le premier engagement avec l\'Empire byzantin, demontrant le courage musulman.',
      },
    ],
  },

  // ─── EVENT 30: Conquête de La Mecque ─────────────────────
  {
    eventId: 30,
    eventTitle: 'Conquete de La Mecque',
    eventYear: '630 apr. J.-C.',
    questions: [
      {
        id: 'e30_q1', eventId: 30, type: 'factual',
        question: 'Combien de soldats composaient l\'armee musulmane lors de la conquete ?',
        choices: ['10 000', '3 000', '30 000', '1 500'],
        correctIndex: 0,
        explanation: 'Le Prophete prepara secretement une armee de 10 000 soldats.',
      },
      {
        id: 'e30_q2', eventId: 30, type: 'factual',
        question: 'Combien d\'idoles furent detruites a la Kaaba ?',
        choices: ['360', '100', '200', '500'],
        correctIndex: 0,
        explanation: 'Les 360 idoles furent detruites a la Kaaba.',
      },
      {
        id: 'e30_q3', eventId: 30, type: 'comprehension',
        question: 'Que declara le Prophete aux Mecquois apres la conquete ?',
        choices: [
          '"Allez, vous etes libres" (amnistie generale)',
          '"Vous devez tous vous convertir"',
          '"Payez une rancon pour votre liberte"',
          '"Quittez La Mecque immediatement"',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete proclama une amnistie generale : "Allez, vous etes libres."',
      },
      {
        id: 'e30_q4', eventId: 30, type: 'comprehension',
        question: 'Qui recita l\'adhan depuis le toit de la Kaaba ?',
        choices: ['Bilal', 'Abu Bakr', 'Ali', 'Umar'],
        correctIndex: 0,
        explanation: 'Bilal recita l\'adhan depuis le toit de la Kaaba.',
      },
      {
        id: 'e30_q5', eventId: 30, type: 'significance',
        question: 'Que demontra la conquete pacifique de La Mecque ?',
        choices: [
          'La misericorde de l\'Islam',
          'La superiorite militaire absolue',
          'L\'inutilite de la diplomatie',
          'La vengeance du Prophete',
        ],
        correctIndex: 0,
        explanation: 'La conquete pacifique demontra la misericorde de l\'Islam.',
      },
    ],
  },

  // ─── EVENT 31: Bataille de Hunayn ─────────────────────
  {
    eventId: 31,
    eventTitle: 'Bataille de Hunayn',
    eventYear: '630 apr. J.-C.',
    questions: [
      {
        id: 'e31_q1', eventId: 31, type: 'factual',
        question: 'Combien de musulmans participerent a la bataille de Hunayn ?',
        choices: ['12 000', '3 000', '1 000', '30 000'],
        correctIndex: 0,
        explanation: '12 000 musulmans participerent a cette bataille.',
      },
      {
        id: 'e31_q2', eventId: 31, type: 'factual',
        question: 'Quelles tribus attaquerent les musulmans a Hunayn ?',
        choices: ['Hawazin et Thaqif', 'Quraysh et Banu Nadir', 'Aws et Khazraj', 'Ghassanides et Byzantins'],
        correctIndex: 0,
        explanation: 'Les tribus Hawazin et Thaqif attaquerent les musulmans.',
      },
      {
        id: 'e31_q3', eventId: 31, type: 'comprehension',
        question: 'Qui rassembla l\'armee dispersee a haute voix pendant la panique ?',
        choices: ['Abbas, l\'oncle du Prophete', 'Abu Bakr', 'Khalid ibn al-Walid', 'Umar ibn al-Khattab'],
        correctIndex: 0,
        explanation: 'Son oncle Abbas rassembla l\'armee dispersee a haute voix.',
      },
      {
        id: 'e31_q4', eventId: 31, type: 'comprehension',
        question: 'Que fit le Prophete apres la victoire envers les captifs Hawazin ?',
        choices: [
          'Il leur restitua leurs captifs et biens apres leur conversion',
          'Il les garda comme prisonniers',
          'Il les exila dans le desert',
          'Il exigea une lourde rancon',
        ],
        correctIndex: 0,
        explanation: 'Une delegation Hawazin se convertit et le Prophete leur restitua leurs captifs et biens.',
      },
      {
        id: 'e31_q5', eventId: 31, type: 'significance',
        question: 'Que brisa cette victoire dans la peninsule arabique ?',
        choices: [
          'La derniere force polytheiste majeure',
          'L\'empire byzantin',
          'Les routes commerciales ennemies',
          'Les fortifications de Taif',
        ],
        correctIndex: 0,
        explanation: 'Avec cette victoire, la derniere force polytheiste majeure de la peninsule fut brisee.',
      },
    ],
  },

  // ─── EVENT 32: Siège de Taïf ─────────────────────
  {
    eventId: 32,
    eventTitle: 'Siege de Taif',
    eventYear: '630 apr. J.-C.',
    questions: [
      {
        id: 'e32_q1', eventId: 32, type: 'factual',
        question: 'Combien de jours dura le siege de Taif ?',
        choices: ['Environ 20 jours', '10 jours', '40 jours', '5 jours'],
        correctIndex: 0,
        explanation: 'Le siege dura environ 20 jours avec l\'utilisation de catapultes.',
      },
      {
        id: 'e32_q2', eventId: 32, type: 'factual',
        question: 'Quelles armes furent utilisees lors du siege ?',
        choices: ['Des catapultes et machines de guerre', 'Uniquement des epees', 'Des arcs et fleches', 'Des tunnels souterrains'],
        correctIndex: 0,
        explanation: 'Le siege utilisa des catapultes et des machines de guerre.',
      },
      {
        id: 'e32_q3', eventId: 32, type: 'comprehension',
        question: 'Que pria le Prophete au lieu de maudire les habitants de Taif ?',
        choices: [
          '"O Allah ! Guide la tribu de Thaqif et envoie-les vers nous en tant que musulmans"',
          '"O Allah ! Detruis les habitants de Taif"',
          '"O Allah ! Donne-nous la victoire sur Taif"',
          '"O Allah ! Protege-nous de Taif"',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete pria pour leur guidee plutot que leur destruction.',
      },
      {
        id: 'e32_q4', eventId: 32, type: 'comprehension',
        question: 'Comment les habitants de Taif se convertirent-ils finalement ?',
        choices: [
          'Une delegation vint a Medine environ un an plus tard',
          'Ils furent contraints par la force',
          'Ils se convertirent pendant le siege',
          'Ils ne se convertirent jamais',
        ],
        correctIndex: 0,
        explanation: 'Environ un an plus tard, une delegation de Taif vint a Medine et se convertit.',
      },
      {
        id: 'e32_q5', eventId: 32, type: 'significance',
        question: 'Quelle priorite cet episode demontre-t-il ?',
        choices: [
          'La priorite de la conversion des coeurs sur la conquete militaire',
          'La necessite de sieges prolonges',
          'L\'inutilite de la priere dans les conflits',
          'La superiorite des forteresses sur les armees',
        ],
        correctIndex: 0,
        explanation: 'Cet episode demontra la priorite de la conversion des coeurs sur la conquete militaire.',
      },
    ],
  },

  // ─── EVENT 33: Expédition de Tabuk ─────────────────────
  {
    eventId: 33,
    eventTitle: 'Expedition de Tabuk',
    eventYear: '630 apr. J.-C.',
    questions: [
      {
        id: 'e33_q1', eventId: 33, type: 'factual',
        question: 'Combien d\'hommes le Prophete mobilisa-t-il pour l\'expedition de Tabuk ?',
        choices: ['30 000', '10 000', '3 000', '50 000'],
        correctIndex: 0,
        explanation: 'Il mobilisa 30 000 hommes malgre des conditions difficiles.',
      },
      {
        id: 'e33_q2', eventId: 33, type: 'factual',
        question: 'Quel compagnon equipa un tiers de l\'armee a ses frais ?',
        choices: ['Uthman', 'Abu Bakr', 'Umar', 'Ali'],
        correctIndex: 0,
        explanation: 'Uthman equipa un tiers de l\'armee par ses propres moyens.',
      },
      {
        id: 'e33_q3', eventId: 33, type: 'comprehension',
        question: 'Pourquoi cette expedition etait-elle une epreuve de foi ?',
        choices: [
          'Elle eut lieu en pleine chaleur extreme et periode des recoltes',
          'Les musulmans devaient combattre leurs propres tribus',
          'Le voyage etait court mais dangereux',
          'Les armes manquaient cruellement',
        ],
        correctIndex: 0,
        explanation: 'L\'expedition eut lieu malgre une chaleur extreme, la secheresse et la periode des recoltes.',
      },
      {
        id: 'e33_q4', eventId: 33, type: 'comprehension',
        question: 'Que fit Abu Bakr pour financer l\'expedition ?',
        choices: [
          'Il donna toute sa richesse',
          'Il donna la moitie de sa richesse',
          'Il equipa un tiers de l\'armee',
          'Il vendit sa maison',
        ],
        correctIndex: 0,
        explanation: 'Abu Bakr donna toute sa richesse, Umar la moitie, et Uthman equipa un tiers de l\'armee.',
      },
      {
        id: 'e33_q5', eventId: 33, type: 'significance',
        question: 'Quel fut le resultat strategique de cette expedition ?',
        choices: [
          'Elle dissuada toute agression byzantine et securisa les frontieres nord',
          'Elle mena a la conquete de Constantinople',
          'Elle causa une defaite majeure pour les musulmans',
          'Elle n\'eut aucun impact',
        ],
        correctIndex: 0,
        explanation: 'L\'expedition securisa les frontieres septentrionales et dissuada toute agression byzantine.',
      },
    ],
  },

  // ─── EVENT 34: Pèlerinage d'Adieu ─────────────────────
  {
    eventId: 34,
    eventTitle: "Pelerinage d'Adieu",
    eventYear: '632 apr. J.-C.',
    questions: [
      {
        id: 'e34_q1', eventId: 34, type: 'factual',
        question: 'Combien de musulmans accompagnerent le Prophete lors du pelerinage d\'adieu ?',
        choices: ['Plus de 120 000', 'Environ 10 000', 'Environ 30 000', 'Environ 50 000'],
        correctIndex: 0,
        explanation: 'Le Prophete partit avec ses epouses et plus de 120 000 musulmans.',
      },
      {
        id: 'e34_q2', eventId: 34, type: 'factual',
        question: 'Quel verset fut revele lors de ce pelerinage ?',
        choices: [
          '"Aujourd\'hui, J\'ai paracheve pour vous votre religion" (Al-Ma\'idah, 3)',
          '"Lis au nom de ton Seigneur" (Al-Alaq, 1)',
          '"Dis : Il est Allah, Unique" (Al-Ikhlas, 1)',
          '"Par le temps, l\'homme est en perdition" (Al-Asr, 1)',
        ],
        correctIndex: 0,
        explanation: 'La sourate Al-Ma\'idah verset 3 fut revelee : "Aujourd\'hui, J\'ai paracheve pour vous votre religion."',
      },
      {
        id: 'e34_q3', eventId: 34, type: 'comprehension',
        question: 'Quels principes fondamentaux le Prophete declara-t-il dans son sermon ?',
        choices: [
          'L\'egalite humaine, les droits des femmes, la fraternite musulmane',
          'Les regles du commerce et de la finance',
          'Les techniques de guerre et de defense',
          'Les rituels de priere et de jeune',
        ],
        correctIndex: 0,
        explanation: 'Il declara l\'egalite humaine, les droits des femmes, la fraternite musulmane et bien plus.',
      },
      {
        id: 'e34_q4', eventId: 34, type: 'comprehension',
        question: 'Quels deux guides le Prophete laissa-t-il aux musulmans ?',
        choices: [
          'Le Coran et la Sunna',
          'Abu Bakr et Umar',
          'La priere et le jeune',
          'La Kaaba et la mosquee de Medine',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete indiqua les deux guides : le Coran et la Sunna.',
      },
      {
        id: 'e34_q5', eventId: 34, type: 'significance',
        question: 'A quoi compare-t-on souvent le sermon du pelerinage d\'adieu ?',
        choices: [
          'A une declaration universelle des droits de l\'homme',
          'A un traite de commerce international',
          'A un accord militaire',
          'A un programme educatif',
        ],
        correctIndex: 0,
        explanation: 'Ce sermon est souvent compare a une declaration universelle des droits de l\'homme.',
      },
    ],
  },

  // ─── EVENT 35: Décès du Prophète (ﷺ) ─────────────────────
  {
    eventId: 35,
    eventTitle: 'Deces du Prophete Muhammad (ﷺ)',
    eventYear: '632 apr. J.-C.',
    questions: [
      {
        id: 'e35_q1', eventId: 35, type: 'factual',
        question: 'Quand le Prophete (ﷺ) deceda-t-il ?',
        choices: [
          'Le lundi 13 Rabi\' al-Awwal (8 juin 632)',
          'Le vendredi 1er Muharram (632)',
          'Le 27 Ramadan (632)',
          'Le 10 Dhu al-Hijjah (632)',
        ],
        correctIndex: 0,
        explanation: 'Le Prophete deceda le lundi 13 Rabi\' al-Awwal de la 11e annee de l\'Hegire.',
      },
      {
        id: 'e35_q2', eventId: 35, type: 'factual',
        question: 'Dans les bras de quelle epouse le Prophete deceda-t-il ?',
        choices: ['Aisha', 'Khadijah', 'Hafsa', 'Umm Salama'],
        correctIndex: 0,
        explanation: 'Il deceda dans les bras de son epouse Aisha.',
      },
      {
        id: 'e35_q3', eventId: 35, type: 'comprehension',
        question: 'Quelles furent les dernieres paroles du Prophete (ﷺ) ?',
        choices: [
          '"Ma\'ar-rafiqi l-a\'la" (Au Compagnon le plus haut)',
          '"La ilaha illa Allah"',
          '"Protegez la Kaaba"',
          '"Unissez-vous"',
        ],
        correctIndex: 0,
        explanation: 'Ses dernieres paroles furent "Ma\'ar-rafiqi l-a\'la" (Au Compagnon le plus haut).',
      },
      {
        id: 'e35_q4', eventId: 35, type: 'comprehension',
        question: 'Qui le Prophete designa-t-il pour diriger la priere durant sa maladie ?',
        choices: ['Abu Bakr', 'Umar', 'Ali', 'Uthman'],
        correctIndex: 0,
        explanation: 'Il designa Abu Bakr pour diriger la priere.',
      },
      {
        id: 'e35_q5', eventId: 35, type: 'significance',
        question: 'Que declara Abu Bakr pour consoler les musulmans ?',
        choices: [
          '"Que celui qui adorait Muhammad sache qu\'il est mort. Celui qui adorait Allah sache qu\'Il ne meurt jamais"',
          '"Le Prophete reviendra un jour"',
          '"Nous devons elire un nouveau prophete"',
          '"Retournons tous a La Mecque"',
        ],
        correctIndex: 0,
        explanation: 'Abu Bakr consola les musulmans en distinguant l\'adoration de Dieu de l\'attachement au Prophete.',
      },
    ],
  },
];
