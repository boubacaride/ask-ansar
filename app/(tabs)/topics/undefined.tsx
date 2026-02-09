import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useSettings } from '@/store/settingsStore';
import { HelpCircle, BookOpen, Scale, Users, AlertCircle, ChevronDown, ChevronRight, Book, Gavel, Lightbulb, Globe, Clock, Sparkles } from 'lucide-react-native';

interface Subsection {
  title: string;
  content: string;
}

interface Section {
  icon: any;
  title: string;
  content: string[];
  subsections?: Subsection[];
}

interface MainPart {
  id: string;
  icon: any;
  title: string;
  arabicTitle: string;
  description: string;
  sections: Section[];
}

const mainParts: MainPart[] = [
  {
    id: 'theological',
    icon: Book,
    title: 'PREMIÈRE PARTIE: QUESTIONS THÉOLOGIQUES',
    arabicTitle: 'العقيدة',
    description: 'Questions relatives à la croyance et aux fondements de la foi',
    sections: [
      {
        icon: BookOpen,
        title: 'Les Attributs Divins (Sifât Allah)',
        content: ['Les savants divergent sur l\'interprétation de certains attributs divins mentionnés dans le Coran et la Sunna.'],
        subsections: [
          { title: 'Les Attributs Anthropomorphiques', content: 'Divergence entre l\'interprétation littérale (Salafisme) et l\'interprétation métaphorique (Ash\'arisme, Maturidisme) des versets évoquant la main, le visage, ou l\'établissement (Istiwâ) d\'Allah sur le Trône.' },
          { title: 'La Vision d\'Allah au Paradis', content: 'Consensus sur la possibilité de voir Allah au Paradis, mais divergence sur les modalités de cette vision.' },
          { title: 'La Parole d\'Allah', content: 'Débat sur la nature éternelle ou créée du Coran, résolu en affirmant que la Parole d\'Allah est éternelle, mais sa manifestation est créée.' }
        ]
      },
      {
        icon: Scale,
        title: 'Le Destin et le Libre Arbitre (Al-Qadar)',
        content: ['Question fondamentale sur la relation entre la prédestination divine et la responsabilité humaine.'],
        subsections: [
          { title: 'Le Déterminisme vs. Libre Arbitre', content: 'Les Ash\'arites soutiennent l\'acquisition (Kasb), où l\'homme acquiert ses actes créés par Allah. Les Maturidites accordent plus de place au libre arbitre.' },
          { title: 'La Prédestination du Bien et du Mal', content: 'Accord sur le fait qu\'Allah a prédestiné toute chose, mais divergence sur la compréhension de la responsabilité morale de l\'homme.' }
        ]
      },
      {
        icon: Users,
        title: 'Le Statut du Grand Pécheur (Al-Fâsiq)',
        content: ['Débat historique sur le statut du musulman qui commet des grands péchés sans se repentir.'],
        subsections: [
          { title: 'Position Sunnite', content: 'Le grand pécheur reste musulman, mais son Iman est affaibli. Il ne sort pas de l\'Islam tant qu\'il ne nie pas le caractère interdit de son péché.' },
          { title: 'Position des Khârijites', content: 'Le grand pécheur devient mécréant (Kâfir) et sort de l\'Islam.' },
          { title: 'Position des Mu\'tazilites', content: 'Le grand pécheur est dans une position intermédiaire entre foi et mécréance.' }
        ]
      },
      {
        icon: AlertCircle,
        title: 'L\'Intercession (Ash-Shafâ\'a)',
        content: ['Questions sur qui peut intercéder et pour qui le Jour du Jugement.'],
        subsections: [
          { title: 'Intercession du Prophète', content: 'Consensus sur l\'intercession du Prophète pour sa communauté, mais divergence sur ses limites et conditions.' },
          { title: 'Intercession des Anges et des Saints', content: 'Débat sur la possibilité et les conditions de l\'intercession d\'autres qu\'Allah et le Prophète.' }
        ]
      },
      {
        icon: BookOpen,
        title: 'Le Coran',
        content: ['Questions relatives à la nature et l\'interprétation du Coran.'],
        subsections: [
          { title: 'Versets Clairs et Ambigus', content: 'Divergence sur la méthode d\'interprétation des versets ambigus (Mutashâbihât).' },
          { title: 'L\'Abrogation (Naskh)', content: 'Débat sur l\'existence et l\'étendue de l\'abrogation dans le Coran.' }
        ]
      }
    ]
  },
  {
    id: 'juridical',
    icon: Gavel,
    title: 'DEUXIÈME PARTIE: QUESTIONS JURIDIQUES',
    arabicTitle: 'الفقه',
    description: 'Questions relatives aux pratiques religieuses et aux transactions',
    sections: [
      {
        icon: BookOpen,
        title: 'La Prière (As-Salât)',
        content: ['Divergences sur de nombreux détails de la prière.'],
        subsections: [
          { title: 'Position des Mains', content: 'Hanafites, Shafi\'ites et Hanbalites placent les mains sur la poitrine, Malikites les laissent le long du corps.' },
          { title: 'Récitation de la Fâtiha', content: 'Obligatoire selon les Shafi\'ites et Hanbalites, recommandée selon les Hanafites et Malikites pour le suiveur.' },
          { title: 'Le Amin à Haute Voix', content: 'Recommandé selon les Shafi\'ites et Hanbalites, non pratiqué selon les Hanafites et Malikites.' },
          { title: 'Le Qunût dans la Prière du Fajr', content: 'Recommandé selon les Shafi\'ites, non pratiqué selon les autres écoles sauf en cas de calamité.' }
        ]
      },
      {
        icon: Scale,
        title: 'La Purification (At-Tahâra)',
        content: ['Questions sur les ablutions et la pureté rituelle.'],
        subsections: [
          { title: 'Le Toucher de la Femme', content: 'Annule les ablutions selon les Shafi\'ites, ne les annule pas selon les Hanafites et Malikites sauf avec désir.' },
          { title: 'Le Tayammum (Ablution Sèche)', content: 'Divergence sur les conditions de validité et la manière de le pratiquer.' },
          { title: 'Les Chaussettes (Khuff)', content: 'Accord sur le principe d\'essuyer les chaussettes, divergence sur les conditions et la durée.' }
        ]
      },
      {
        icon: Clock,
        title: 'Le Jeûne (As-Siyâm)',
        content: ['Divergences sur ce qui annule ou n\'annule pas le jeûne.'],
        subsections: [
          { title: 'L\'Injection et la Perfusion', content: 'Débat sur si ces actes annulent le jeûne ou non.' },
          { title: 'L\'Inhalateur pour Asthmatiques', content: 'Certains savants le permettent, d\'autres considèrent qu\'il annule le jeûne.' },
          { title: 'Le Baiser entre Époux', content: 'Permis selon la majorité s\'il ne mène pas à l\'éjaculation, déconseillé selon d\'autres.' }
        ]
      },
      {
        icon: Users,
        title: 'La Zakât',
        content: ['Questions sur le calcul et la distribution de l\'aumône obligatoire.'],
        subsections: [
          { title: 'Zakât sur les Bijoux', content: 'Obligatoire selon les Hanafites, non obligatoire selon les autres écoles si portés.' },
          { title: 'Distribution de la Zakât', content: 'Divergence sur les catégories prioritaires et la possibilité de donner toute la Zakât à une seule catégorie.' }
        ]
      },
      {
        icon: Globe,
        title: 'Le Pèlerinage (Al-Hajj)',
        content: ['Divergences sur les rites du pèlerinage.'],
        subsections: [
          { title: 'L\'Ordre des Rites', content: 'Divergence sur l\'obligation de respecter l\'ordre des rites le jour du sacrifice.' },
          { title: 'Le Tawâf des Femmes en Menstruation', content: 'Interdit selon la majorité, permis en cas de nécessité selon certains avis contemporains.' }
        ]
      },
      {
        icon: Scale,
        title: 'Les Transactions Financières (Al-Mu\'âmalât)',
        content: ['Questions complexes sur la finance islamique.'],
        subsections: [
          { title: 'La Vente à Crédit avec Majoration', content: 'Permise selon la majorité si le prix est fixé au moment du contrat.' },
          { title: 'Les Assurances', content: 'Débat entre ceux qui les interdisent totalement et ceux qui distinguent entre assurances conventionnelles et coopératives (Takaful).' },
          { title: 'Les Actions et la Bourse', content: 'Divergence sur les conditions de licéité de l\'achat d\'actions.' }
        ]
      }
    ]
  },
  {
    id: 'contemporary',
    icon: Lightbulb,
    title: 'TROISIÈME PARTIE: QUESTIONS CONTEMPORAINES',
    arabicTitle: 'النوازل',
    description: 'Questions modernes nécessitant un Ijtihad renouvelé',
    sections: [
      {
        icon: BookOpen,
        title: 'Médecine et Bioéthique',
        content: ['Questions éthiques liées aux avancées médicales.'],
        subsections: [
          { title: 'La Transplantation d\'Organes', content: 'Permise selon la majorité des conseils de jurisprudence contemporains avec conditions strictes.' },
          { title: 'La Fécondation In Vitro (FIV)', content: 'Permise entre époux légitimes, interdite avec donneur extérieur.' },
          { title: 'L\'Euthanasie', content: 'Interdite, mais débat sur l\'arrêt des traitements pour les malades en phase terminale.' },
          { title: 'Le Don de Sang', content: 'Permis et encouragé selon la majorité.' },
          { title: 'Les Cellules Souches', content: 'Débat sur la source des cellules et les conditions éthiques.' }
        ]
      },
      {
        icon: Globe,
        title: 'Technologie et Communication',
        content: ['Questions liées aux nouvelles technologies.'],
        subsections: [
          { title: 'Les Cryptomonnaies', content: 'Débat intense : certains les considèrent comme permises, d\'autres les interdisent en raison de la spéculation et de l\'incertitude (Gharar).' },
          { title: 'Les Réseaux Sociaux', content: 'Permis en principe, mais avec des limites éthiques sur le contenu partagé.' },
          { title: 'Les Jeux Vidéo', content: 'Divergence selon le contenu et le temps consacré.' },
          { title: 'L\'Intelligence Artificielle', content: 'Questions émergentes sur l\'utilisation éthique de l\'IA et ses limites.' }
        ]
      },
      {
        icon: Users,
        title: 'Vie Sociale en Occident',
        content: ['Défis spécifiques aux musulmans vivant en minorité.'],
        subsections: [
          { title: 'La Participation Politique', content: 'Permise selon la majorité pour défendre les intérêts de la communauté.' },
          { title: 'Les Prêts Hypothécaires', content: 'Débat entre l\'interdiction stricte et la permission en cas de nécessité absolue.' },
          { title: 'La Scolarisation Mixte', content: 'Permise avec conditions selon les circonstances.' },
          { title: 'Les Fêtes Non-Musulmanes', content: 'Interdit d\'y participer religieusement, débat sur la participation sociale.' }
        ]
      },
      {
        icon: AlertCircle,
        title: 'Alimentation',
        content: ['Questions sur la licéité des aliments modernes.'],
        subsections: [
          { title: 'La Viande des Gens du Livre', content: 'Halal selon la majorité si les conditions d\'abattage sont respectées, débat sur les méthodes industrielles.' },
          { title: 'La Gélatine', content: 'Divergence selon son origine (porcine interdite, bovine débattue si transformée chimiquement).' },
          { title: 'Les Additifs Alimentaires', content: 'Nécessitent une vérification au cas par cas.' },
          { title: 'Les OGM', content: 'Débat sur leur licéité selon les risques sanitaires et éthiques.' }
        ]
      },
      {
        icon: Sparkles,
        title: 'Arts et Divertissement',
        content: ['Questions sur les formes d\'expression artistique.'],
        subsections: [
          { title: 'La Musique', content: 'Divergence majeure : interdite selon les Hanbalites et certains Malikites, permise avec conditions selon d\'autres.' },
          { title: 'La Photographie et le Cinéma', content: 'Permis selon la majorité contemporaine si le contenu est licite.' },
          { title: 'Le Théâtre', content: 'Débat sur sa licéité selon le contenu et l\'objectif.' },
          { title: 'Le Sport', content: 'Permis et encouragé, mais débat sur la mixité et les tenues.' }
        ]
      }
    ]
  },
  {
    id: 'political',
    icon: Globe,
    title: 'QUATRIÈME PARTIE: QUESTIONS POLITIQUES ET SOCIALES',
    arabicTitle: 'السياسة والمجتمع',
    description: 'Questions relatives à la gouvernance et à l\'organisation sociale',
    sections: [
      {
        icon: Scale,
        title: 'Le Système Politique',
        content: ['Questions sur la forme du gouvernement islamique.'],
        subsections: [
          { title: 'Le Califat', content: 'Débat sur son caractère obligatoire ou recommandé, et sur sa faisabilité aujourd\'hui.' },
          { title: 'La Démocratie', content: 'Divergence entre rejet total, acceptation avec conditions, et adaptation islamique (Shura).' },
          { title: 'La Séparation des Pouvoirs', content: 'Débat sur sa compatibilité avec les principes islamiques.' },
          { title: 'Les Droits de l\'Homme', content: 'Discussion sur l\'universalité vs. la spécificité islamique.' }
        ]
      },
      {
        icon: Globe,
        title: 'Relations Internationales',
        content: ['Questions sur les relations avec les non-musulmans.'],
        subsections: [
          { title: 'Le Jihad', content: 'Divergence sur sa définition : défensif uniquement selon certains, offensif selon d\'autres dans des conditions strictes.' },
          { title: 'Les Traités avec les Non-Musulmans', content: 'Permis selon tous, débat sur les conditions et la durée.' },
          { title: 'La Résidence en Terre Non-Musulmane', content: 'Permise selon la majorité contemporaine, surtout pour l\'appel à l\'Islam ou la nécessité.' }
        ]
      },
      {
        icon: Users,
        title: 'Questions de Genre',
        content: ['Questions relatives aux rôles et droits selon le genre.'],
        subsections: [
          { title: 'Le Voile (Hijab)', content: 'Obligatoire selon la majorité, débat sur ce qui doit être couvert exactement (visage, mains).' },
          { title: 'Le Travail de la Femme', content: 'Permis selon tous avec conditions de pudeur et de préservation des obligations familiales.' },
          { title: 'La Tutelle Matrimoniale (Wali)', content: 'Obligatoire selon la majorité, non obligatoire pour la femme majeure selon les Hanafites.' },
          { title: 'Le Leadership Féminin', content: 'Débat sur les postes que peut occuper une femme dans la société.' }
        ]
      },
      {
        icon: Scale,
        title: 'Justice et Peines',
        content: ['Questions sur l\'application des peines légales.'],
        subsections: [
          { title: 'Les Hudûd', content: 'Conditions strictes d\'application, débat sur leur mise en œuvre dans le contexte moderne.' },
          { title: 'La Peine de Mort pour l\'Apostasie', content: 'Débat entre ceux qui la maintiennent et ceux qui distinguent apostasie privée et trahison publique.' },
          { title: 'Les Peines Alternatives', content: 'Discussion sur l\'adaptation des peines aux contextes contemporains.' }
        ]
      }
    ]
  },
  {
    id: 'eschatological',
    icon: Clock,
    title: 'CINQUIÈME PARTIE: QUESTIONS ESCHATOLOGIQUES',
    arabicTitle: 'الآخرة',
    description: 'Questions relatives à la fin des temps et l\'au-delà',
    sections: [
      {
        icon: AlertCircle,
        title: 'Les Signes de la Fin des Temps',
        content: ['Interprétation des signes annoncés de la fin du monde.'],
        subsections: [
          { title: 'Les Signes Mineurs', content: 'Débat sur l\'identification de certains signes dans le contexte actuel.' },
          { title: 'Les Signes Majeurs', content: 'Accord sur les dix signes majeurs, divergence sur l\'ordre de leur apparition.' },
          { title: 'Le Mahdi', content: 'Croyance sunnite à sa venue, débat sur ses caractéristiques exactes.' },
          { title: 'Le Retour de \'Issa (Jésus)', content: 'Consensus sur son retour, débat sur les détails de sa mission.' }
        ]
      },
      {
        icon: Book,
        title: 'La Vie dans l\'Au-delà',
        content: ['Questions sur la nature de la vie après la mort.'],
        subsections: [
          { title: 'Le Supplice de la Tombe', content: 'Réalité affirmée, débat sur sa nature (physique, spirituelle, ou les deux).' },
          { title: 'La Durée du Paradis et de l\'Enfer', content: 'Éternité du Paradis consensuelle, débat sur l\'éternité de l\'Enfer pour les musulmans pécheurs.' },
          { title: 'Les Niveaux du Paradis', content: 'Accord sur l\'existence de degrés, divergence sur leurs caractéristiques précises.' },
          { title: 'L\'Intercession', content: 'Débat sur l\'étendue de l\'intercession du Prophète et d\'autres le Jour du Jugement.' }
        ]
      }
    ]
  },
  {
    id: 'practices',
    icon: Sparkles,
    title: 'SIXIÈME PARTIE: PRATIQUES RITUELLES CONTROVERSÉES',
    arabicTitle: 'الممارسات المختلف عليها',
    description: 'Pratiques sur lesquelles existe une divergence significative',
    sections: [
      {
        icon: BookOpen,
        title: 'Soufisme et Spiritualité',
        content: ['Questions sur les pratiques spirituelles.'],
        subsections: [
          { title: 'Le Dhikr Collectif', content: 'Permis selon les Soufis et certains savants, considéré comme innovation par d\'autres.' },
          { title: 'La Visite des Tombes de Saints', content: 'Permise pour se rappeler la mort selon la majorité, interdite si accompagnée de pratiques polythéistes.' },
          { title: 'Le Tawassul', content: 'Débat sur la licéité de demander l\'intercession des saints auprès d\'Allah.' },
          { title: 'La Musique Spirituelle (Samâ\')', content: 'Permise selon certains Soufis, interdite selon d\'autres écoles.' }
        ]
      },
      {
        icon: Sparkles,
        title: 'Célébrations',
        content: ['Débats sur la licéité de certaines célébrations.'],
        subsections: [
          { title: 'Le Mawlid (Anniversaire du Prophète)', content: 'Innovation louable selon certains, innovation blâmable selon d\'autres.' },
          { title: 'L\'Isrâ\' wal-Mi\'râj', content: 'Débat similaire au Mawlid sur sa célébration.' },
          { title: 'Les Anniversaires', content: 'Interdits selon certains comme imitation des non-musulmans, permis selon d\'autres si sans excès.' }
        ]
      },
      {
        icon: Users,
        title: 'Pratiques Funéraires',
        content: ['Divergences sur les rituels liés à la mort.'],
        subsections: [
          { title: 'La Lecture du Coran pour le Défunt', content: 'Bénéfique selon les Hanafites et Hanbalites, non bénéfique selon les Malikites et Shafi\'ites.' },
          { title: 'Les Condoléances à Durée Prolongée', content: 'Débat sur la durée et la forme appropriées.' },
          { title: 'La Construction sur les Tombes', content: 'Interdite selon la majorité, sauf pour préservation selon certains.' }
        ]
      }
    ]
  }
];

export default function UndefinedTopicScreen() {
  const { darkMode } = useSettings();
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  const togglePart = (partId: string) => {
    const newExpanded = new Set(expandedParts);
    if (newExpanded.has(partId)) {
      newExpanded.delete(partId);
    } else {
      newExpanded.add(partId);
    }
    setExpandedParts(newExpanded);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  return (
    <ScrollView
      style={[styles.container, darkMode && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <Text style={[styles.bismillah, darkMode && styles.bismillahDark]}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </Text>

          <View style={styles.headerDivider} />

          <Text style={[styles.mainTitle, darkMode && styles.mainTitleDark]}>
            LES QUESTIONS NON DÉFINIES ET SUJETS DE DIVERGENCE EN ISLAM
          </Text>

          <Text style={[styles.arabicSubtitle, darkMode && styles.arabicSubtitleDark]}>
            المسائل غير المحددة والخلافية في الإسلام
          </Text>

          <Text style={[styles.headerDescription, darkMode && styles.headerDescriptionDark]}>
            Guide Encyclopédique des Questions Théologiques, Juridiques et Contemporaines
          </Text>

          <Text style={[styles.headerCompiled, darkMode && styles.headerCompiledDark]}>
            Compilé pour Ask Ansar - Assistant de Connaissances Islamiques
          </Text>
        </View>

        <View style={[styles.introduction, darkMode && styles.introductionDark]}>
          <View style={styles.introHeader}>
            <BookOpen size={28} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
            <Text style={[styles.introTitle, darkMode && styles.introTitleDark]}>
              Introduction : L'Ikhtilâf (الاختلاف) en Islam
            </Text>
          </View>

          <Text style={[styles.introParagraph, darkMode && styles.introParagraphDark]}>
            L'Ikhtilâf désigne la divergence d'opinions entre les savants de l'Islam sur des questions juridiques, théologiques, ou pratiques. Ces divergences sont une réalité naturelle et une richesse de la pensée islamique, témoignant de la profondeur et de la flexibilité de la Charia.
          </Text>

          <Text style={[styles.introParagraph, darkMode && styles.introParagraphDark]}>
            Ce guide encyclopédique présente les principales questions sur lesquelles les savants ont divergé, en expliquant les différentes positions et leurs fondements. Il vise à aider les musulmans à comprendre la diversité de leur héritage intellectuel et à adopter une attitude équilibrée face aux divergences.
          </Text>

          <View style={[styles.noteBox, darkMode && styles.noteBoxDark]}>
            <AlertCircle size={20} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
            <Text style={[styles.noteText, darkMode && styles.noteTextDark]}>
              Note : Les divergences présentées ici concernent des questions secondaires (Furû'), non les fondements de la foi qui font consensus (Usûl).
            </Text>
          </View>
        </View>

        <View style={[styles.tocContainer, darkMode && styles.tocContainerDark]}>
          <Text style={[styles.tocTitle, darkMode && styles.tocTitleDark]}>
            TABLE DES MATIÈRES
          </Text>

          {mainParts.map((part, index) => (
            <View key={part.id} style={[styles.tocItem, darkMode && styles.tocItemDark]}>
              <View style={styles.tocItemHeader}>
                <part.icon size={20} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                <View style={styles.tocItemText}>
                  <Text style={[styles.tocItemTitle, darkMode && styles.tocItemTitleDark]}>
                    {index + 1}. {part.title}
                  </Text>
                  <Text style={[styles.tocItemArabic, darkMode && styles.tocItemArabicDark]}>
                    {part.arabicTitle}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {mainParts.map((part) => {
          const PartIcon = part.icon;
          const isPartExpanded = expandedParts.has(part.id);

          return (
            <View key={part.id} style={styles.partContainer}>
              <TouchableOpacity
                style={[styles.partHeader, darkMode && styles.partHeaderDark]}
                onPress={() => togglePart(part.id)}
                activeOpacity={0.7}
              >
                <View style={styles.partHeaderContent}>
                  <View style={[styles.partIconWrapper, darkMode && styles.partIconWrapperDark]}>
                    <PartIcon size={28} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                  </View>

                  <View style={styles.partHeaderText}>
                    <Text style={[styles.partTitle, darkMode && styles.partTitleDark]}>
                      {part.title}
                    </Text>
                    <Text style={[styles.partArabicTitle, darkMode && styles.partArabicTitleDark]}>
                      {part.arabicTitle}
                    </Text>
                    <Text style={[styles.partDescription, darkMode && styles.partDescriptionDark]}>
                      {part.description}
                    </Text>
                  </View>

                  {isPartExpanded ? (
                    <ChevronDown size={24} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                  ) : (
                    <ChevronRight size={24} color={darkMode ? '#94a3b8' : '#64748b'} strokeWidth={2} />
                  )}
                </View>
              </TouchableOpacity>

              {isPartExpanded && (
                <View style={[styles.partContent, darkMode && styles.partContentDark]}>
                  {part.sections.map((section, sectionIndex) => {
                    const SectionIcon = section.icon;
                    const sectionId = `${part.id}-${sectionIndex}`;
                    const isSectionExpanded = expandedSections.has(sectionId);

                    return (
                      <View key={sectionId} style={styles.sectionContainer}>
                        <TouchableOpacity
                          style={[styles.sectionHeader, darkMode && styles.sectionHeaderDark]}
                          onPress={() => toggleSection(sectionId)}
                          activeOpacity={0.7}
                        >
                          <View style={[styles.sectionIconWrapper, darkMode && styles.sectionIconWrapperDark]}>
                            <SectionIcon size={20} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                          </View>

                          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>
                            {section.title}
                          </Text>

                          {isSectionExpanded ? (
                            <ChevronDown size={20} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                          ) : (
                            <ChevronRight size={20} color={darkMode ? '#94a3b8' : '#64748b'} strokeWidth={2} />
                          )}
                        </TouchableOpacity>

                        {isSectionExpanded && (
                          <View style={styles.sectionContent}>
                            {section.content.map((paragraph, pIndex) => (
                              <Text
                                key={pIndex}
                                style={[styles.paragraph, darkMode && styles.paragraphDark]}
                              >
                                {paragraph}
                              </Text>
                            ))}

                            {section.subsections && (
                              <View style={styles.subsections}>
                                {section.subsections.map((subsection, subIndex) => (
                                  <View
                                    key={subIndex}
                                    style={[styles.subsection, darkMode && styles.subsectionDark]}
                                  >
                                    <Text style={[styles.subsectionTitle, darkMode && styles.subsectionTitleDark]}>
                                      {subsection.title}
                                    </Text>
                                    <Text style={[styles.subsectionContent, darkMode && styles.subsectionContentDark]}>
                                      {subsection.content}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}

        <View style={[styles.footer, darkMode && styles.footerDark]}>
          <Text style={[styles.footerText, darkMode && styles.footerTextDark]}>
            "La divergence de ma communauté est une miséricorde"
          </Text>
          <Text style={[styles.footerNote, darkMode && styles.footerNoteDark]}>
            Cette phrase célèbre, bien que son authenticité comme hadith soit débattue, exprime une réalité de la tradition islamique : la diversité d'opinions dans les questions secondaires est une source de richesse et de flexibilité pour la communauté musulmane.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  containerDark: {
    backgroundColor: '#0f172a',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 2,
    borderColor: '#0f766e',
  },
  headerDark: {
    backgroundColor: '#1e293b',
    borderColor: '#14b8a6',
    shadowOpacity: 0.3,
  },
  bismillah: {
    fontSize: 28,
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  bismillahDark: {
    color: '#14b8a6',
  },
  headerDivider: {
    height: 2,
    backgroundColor: '#0f766e',
    marginBottom: 16,
    opacity: 0.3,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 28,
    letterSpacing: 0.5,
  },
  mainTitleDark: {
    color: '#14b8a6',
  },
  arabicSubtitle: {
    fontSize: 22,
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  arabicSubtitleDark: {
    color: '#14b8a6',
  },
  headerDescription: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  headerDescriptionDark: {
    color: '#94a3b8',
  },
  headerCompiled: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  headerCompiledDark: {
    color: '#94a3b8',
  },
  introduction: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  introductionDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.25,
  },
  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f766e',
    flex: 1,
  },
  introTitleDark: {
    color: '#14b8a6',
  },
  introParagraph: {
    fontSize: 15,
    color: '#334155',
    lineHeight: 24,
    marginBottom: 12,
    textAlign: 'justify',
  },
  introParagraphDark: {
    color: '#cbd5e1',
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0f766e',
  },
  noteBoxDark: {
    backgroundColor: '#0f766e22',
    borderLeftColor: '#14b8a6',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  noteTextDark: {
    color: '#94a3b8',
  },
  tocContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tocContainerDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.25,
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  tocTitleDark: {
    color: '#14b8a6',
  },
  tocItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
  },
  tocItemDark: {
    backgroundColor: '#0f172a',
    borderLeftColor: '#14b8a6',
  },
  tocItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  tocItemText: {
    flex: 1,
  },
  tocItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
    lineHeight: 20,
  },
  tocItemTitleDark: {
    color: '#f1f5f9',
  },
  tocItemArabic: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '600',
  },
  tocItemArabicDark: {
    color: '#14b8a6',
  },
  partContainer: {
    marginBottom: 16,
  },
  partHeader: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  partHeaderDark: {
    backgroundColor: '#1e293b',
    shadowOpacity: 0.25,
  },
  partHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    gap: 12,
  },
  partIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  partIconWrapperDark: {
    backgroundColor: '#0f766e44',
  },
  partHeaderText: {
    flex: 1,
  },
  partTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0f766e',
    marginBottom: 4,
    lineHeight: 22,
  },
  partTitleDark: {
    color: '#14b8a6',
  },
  partArabicTitle: {
    fontSize: 18,
    color: '#0f766e',
    fontWeight: '600',
    marginBottom: 6,
  },
  partArabicTitleDark: {
    color: '#14b8a6',
  },
  partDescription: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  partDescriptionDark: {
    color: '#94a3b8',
  },
  partContent: {
    backgroundColor: '#f8fafc',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 16,
    paddingTop: 8,
  },
  partContentDark: {
    backgroundColor: '#0f172a',
  },
  sectionContainer: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  sectionHeaderDark: {
    backgroundColor: '#1e293b',
  },
  sectionIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0fdfa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionIconWrapperDark: {
    backgroundColor: '#0f766e33',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  sectionTitleDark: {
    color: '#f1f5f9',
  },
  sectionContent: {
    padding: 14,
    paddingTop: 8,
  },
  paragraph: {
    fontSize: 14,
    color: '#334155',
    lineHeight: 22,
    marginBottom: 10,
    textAlign: 'justify',
  },
  paragraphDark: {
    color: '#cbd5e1',
  },
  subsections: {
    marginTop: 8,
  },
  subsection: {
    backgroundColor: '#f0fdfa',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
  },
  subsectionDark: {
    backgroundColor: '#0f766e22',
    borderLeftColor: '#14b8a6',
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f766e',
    marginBottom: 6,
    lineHeight: 20,
  },
  subsectionTitleDark: {
    color: '#14b8a6',
  },
  subsectionContent: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    textAlign: 'justify',
  },
  subsectionContentDark: {
    color: '#94a3b8',
  },
  footer: {
    backgroundColor: '#f0fdfa',
    borderRadius: 16,
    padding: 20,
    marginTop: 8,
    borderWidth: 2,
    borderColor: '#14b8a6',
  },
  footerDark: {
    backgroundColor: '#0f766e22',
    borderColor: '#14b8a6',
  },
  footerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f766e',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  footerTextDark: {
    color: '#14b8a6',
  },
  footerNote: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 20,
    textAlign: 'center',
  },
  footerNoteDark: {
    color: '#94a3b8',
  },
});