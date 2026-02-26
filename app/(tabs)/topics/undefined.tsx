import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Pressable } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useState, useRef, useCallback } from 'react';
import { useSettings } from '@/store/settingsStore';
import { HelpCircle, BookOpen, Scale, Users, AlertCircle, ChevronDown, ChevronRight, Book, Gavel, Lightbulb, Globe, Clock, Sparkles, RefreshCw, Copy, Share } from 'lucide-react-native';
import { generateChatResponseStream } from '@/llm';
import FormattedText from '@/components/FormattedText';
import ShareModal from '@/components/ShareModal';

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

interface AnswerState {
  text: string;
  loading: boolean;
  error?: string;
}

const mainParts: MainPart[] = [
  {
    id: 'theological',
    icon: Book,
    title: 'PREMI\u00c8RE PARTIE: QUESTIONS TH\u00c9OLOGIQUES',
    arabicTitle: '\u0627\u0644\u0639\u0642\u064a\u062f\u0629',
    description: 'Questions relatives \u00e0 la croyance et aux fondements de la foi',
    sections: [
      {
        icon: BookOpen,
        title: 'Les Attributs Divins (Sif\u00e2t Allah)',
        content: ['Les savants divergent sur l\'interpr\u00e9tation de certains attributs divins mentionn\u00e9s dans le Coran et la Sunna.'],
        subsections: [
          { title: 'Les Attributs Anthropomorphiques', content: 'Divergence entre l\'interpr\u00e9tation litt\u00e9rale (Salafisme) et l\'interpr\u00e9tation m\u00e9taphorique (Ash\'arisme, Maturidisme) des versets \u00e9voquant la main, le visage, ou l\'\u00e9tablissement (Istiw\u00e2) d\'Allah sur le Tr\u00f4ne.' },
          { title: 'La Vision d\'Allah au Paradis', content: 'Consensus sur la possibilit\u00e9 de voir Allah au Paradis, mais divergence sur les modalit\u00e9s de cette vision.' },
          { title: 'La Parole d\'Allah', content: 'D\u00e9bat sur la nature \u00e9ternelle ou cr\u00e9\u00e9e du Coran, r\u00e9solu en affirmant que la Parole d\'Allah est \u00e9ternelle, mais sa manifestation est cr\u00e9\u00e9e.' }
        ]
      },
      {
        icon: Scale,
        title: 'Le Destin et le Libre Arbitre (Al-Qadar)',
        content: ['Question fondamentale sur la relation entre la pr\u00e9destination divine et la responsabilit\u00e9 humaine.'],
        subsections: [
          { title: 'Le D\u00e9terminisme vs. Libre Arbitre', content: 'Les Ash\'arites soutiennent l\'acquisition (Kasb), o\u00f9 l\'homme acquiert ses actes cr\u00e9\u00e9s par Allah. Les Maturidites accordent plus de place au libre arbitre.' },
          { title: 'La Pr\u00e9destination du Bien et du Mal', content: 'Accord sur le fait qu\'Allah a pr\u00e9destin\u00e9 toute chose, mais divergence sur la compr\u00e9hension de la responsabilit\u00e9 morale de l\'homme.' }
        ]
      },
      {
        icon: Users,
        title: 'Le Statut du Grand P\u00e9cheur (Al-F\u00e2siq)',
        content: ['D\u00e9bat historique sur le statut du musulman qui commet des grands p\u00e9ch\u00e9s sans se repentir.'],
        subsections: [
          { title: 'Position Sunnite', content: 'Le grand p\u00e9cheur reste musulman, mais son Iman est affaibli. Il ne sort pas de l\'Islam tant qu\'il ne nie pas le caract\u00e8re interdit de son p\u00e9ch\u00e9.' },
          { title: 'Position des Kh\u00e2rijites', content: 'Le grand p\u00e9cheur devient m\u00e9cr\u00e9ant (K\u00e2fir) et sort de l\'Islam.' },
          { title: 'Position des Mu\'tazilites', content: 'Le grand p\u00e9cheur est dans une position interm\u00e9diaire entre foi et m\u00e9cr\u00e9ance.' }
        ]
      },
      {
        icon: AlertCircle,
        title: 'L\'Intercession (Ash-Shaf\u00e2\'a)',
        content: ['Questions sur qui peut interc\u00e9der et pour qui le Jour du Jugement.'],
        subsections: [
          { title: 'Intercession du Proph\u00e8te', content: 'Consensus sur l\'intercession du Proph\u00e8te pour sa communaut\u00e9, mais divergence sur ses limites et conditions.' },
          { title: 'Intercession des Anges et des Saints', content: 'D\u00e9bat sur la possibilit\u00e9 et les conditions de l\'intercession d\'autres qu\'Allah et le Proph\u00e8te.' }
        ]
      },
      {
        icon: BookOpen,
        title: 'Le Coran',
        content: ['Questions relatives \u00e0 la nature et l\'interpr\u00e9tation du Coran.'],
        subsections: [
          { title: 'Versets Clairs et Ambigus', content: 'Divergence sur la m\u00e9thode d\'interpr\u00e9tation des versets ambigus (Mutash\u00e2bih\u00e2t).' },
          { title: 'L\'Abrogation (Naskh)', content: 'D\u00e9bat sur l\'existence et l\'\u00e9tendue de l\'abrogation dans le Coran.' }
        ]
      }
    ]
  },
  {
    id: 'juridical',
    icon: Gavel,
    title: 'DEUXI\u00c8ME PARTIE: QUESTIONS JURIDIQUES',
    arabicTitle: '\u0627\u0644\u0641\u0642\u0647',
    description: 'Questions relatives aux pratiques religieuses et aux transactions',
    sections: [
      {
        icon: BookOpen,
        title: 'La Pri\u00e8re (As-Sal\u00e2t)',
        content: ['Divergences sur de nombreux d\u00e9tails de la pri\u00e8re.'],
        subsections: [
          { title: 'Position des Mains', content: 'Hanafites, Shafi\'ites et Hanbalites placent les mains sur la poitrine, Malikites les laissent le long du corps.' },
          { title: 'R\u00e9citation de la F\u00e2tiha', content: 'Obligatoire selon les Shafi\'ites et Hanbalites, recommand\u00e9e selon les Hanafites et Malikites pour le suiveur.' },
          { title: 'Le Amin \u00e0 Haute Voix', content: 'Recommand\u00e9 selon les Shafi\'ites et Hanbalites, non pratiqu\u00e9 selon les Hanafites et Malikites.' },
          { title: 'Le Qun\u00fbt dans la Pri\u00e8re du Fajr', content: 'Recommand\u00e9 selon les Shafi\'ites, non pratiqu\u00e9 selon les autres \u00e9coles sauf en cas de calamit\u00e9.' }
        ]
      },
      {
        icon: Scale,
        title: 'La Purification (At-Tah\u00e2ra)',
        content: ['Questions sur les ablutions et la puret\u00e9 rituelle.'],
        subsections: [
          { title: 'Le Toucher de la Femme', content: 'Annule les ablutions selon les Shafi\'ites, ne les annule pas selon les Hanafites et Malikites sauf avec d\u00e9sir.' },
          { title: 'Le Tayammum (Ablution S\u00e8che)', content: 'Divergence sur les conditions de validit\u00e9 et la mani\u00e8re de le pratiquer.' },
          { title: 'Les Chaussettes (Khuff)', content: 'Accord sur le principe d\'essuyer les chaussettes, divergence sur les conditions et la dur\u00e9e.' }
        ]
      },
      {
        icon: Clock,
        title: 'Le Je\u00fbne (As-Siy\u00e2m)',
        content: ['Divergences sur ce qui annule ou n\'annule pas le je\u00fbne.'],
        subsections: [
          { title: 'L\'Injection et la Perfusion', content: 'D\u00e9bat sur si ces actes annulent le je\u00fbne ou non.' },
          { title: 'L\'Inhalateur pour Asthmatiques', content: 'Certains savants le permettent, d\'autres consid\u00e8rent qu\'il annule le je\u00fbne.' },
          { title: 'Le Baiser entre \u00c9poux', content: 'Permis selon la majorit\u00e9 s\'il ne m\u00e8ne pas \u00e0 l\'\u00e9jaculation, d\u00e9conseill\u00e9 selon d\'autres.' }
        ]
      },
      {
        icon: Users,
        title: 'La Zak\u00e2t',
        content: ['Questions sur le calcul et la distribution de l\'aum\u00f4ne obligatoire.'],
        subsections: [
          { title: 'Zak\u00e2t sur les Bijoux', content: 'Obligatoire selon les Hanafites, non obligatoire selon les autres \u00e9coles si port\u00e9s.' },
          { title: 'Distribution de la Zak\u00e2t', content: 'Divergence sur les cat\u00e9gories prioritaires et la possibilit\u00e9 de donner toute la Zak\u00e2t \u00e0 une seule cat\u00e9gorie.' }
        ]
      },
      {
        icon: Globe,
        title: 'Le P\u00e8lerinage (Al-Hajj)',
        content: ['Divergences sur les rites du p\u00e8lerinage.'],
        subsections: [
          { title: 'L\'Ordre des Rites', content: 'Divergence sur l\'obligation de respecter l\'ordre des rites le jour du sacrifice.' },
          { title: 'Le Taw\u00e2f des Femmes en Menstruation', content: 'Interdit selon la majorit\u00e9, permis en cas de n\u00e9cessit\u00e9 selon certains avis contemporains.' }
        ]
      },
      {
        icon: Scale,
        title: 'Les Transactions Financi\u00e8res (Al-Mu\'\u00e2mal\u00e2t)',
        content: ['Questions complexes sur la finance islamique.'],
        subsections: [
          { title: 'La Vente \u00e0 Cr\u00e9dit avec Majoration', content: 'Permise selon la majorit\u00e9 si le prix est fix\u00e9 au moment du contrat.' },
          { title: 'Les Assurances', content: 'D\u00e9bat entre ceux qui les interdisent totalement et ceux qui distinguent entre assurances conventionnelles et coop\u00e9ratives (Takaful).' },
          { title: 'Les Actions et la Bourse', content: 'Divergence sur les conditions de lic\u00e9it\u00e9 de l\'achat d\'actions.' }
        ]
      }
    ]
  },
  {
    id: 'contemporary',
    icon: Lightbulb,
    title: 'TROISI\u00c8ME PARTIE: QUESTIONS CONTEMPORAINES',
    arabicTitle: '\u0627\u0644\u0646\u0648\u0627\u0632\u0644',
    description: 'Questions modernes n\u00e9cessitant un Ijtihad renouvel\u00e9',
    sections: [
      {
        icon: BookOpen,
        title: 'M\u00e9decine et Bio\u00e9thique',
        content: ['Questions \u00e9thiques li\u00e9es aux avanc\u00e9es m\u00e9dicales.'],
        subsections: [
          { title: 'La Transplantation d\'Organes', content: 'Permise selon la majorit\u00e9 des conseils de jurisprudence contemporains avec conditions strictes.' },
          { title: 'La F\u00e9condation In Vitro (FIV)', content: 'Permise entre \u00e9poux l\u00e9gitimes, interdite avec donneur ext\u00e9rieur.' },
          { title: 'L\'Euthanasie', content: 'Interdite, mais d\u00e9bat sur l\'arr\u00eat des traitements pour les malades en phase terminale.' },
          { title: 'Le Don de Sang', content: 'Permis et encourag\u00e9 selon la majorit\u00e9.' },
          { title: 'Les Cellules Souches', content: 'D\u00e9bat sur la source des cellules et les conditions \u00e9thiques.' }
        ]
      },
      {
        icon: Globe,
        title: 'Technologie et Communication',
        content: ['Questions li\u00e9es aux nouvelles technologies.'],
        subsections: [
          { title: 'Les Cryptomonnaies', content: 'D\u00e9bat intense : certains les consid\u00e8rent comme permises, d\'autres les interdisent en raison de la sp\u00e9culation et de l\'incertitude (Gharar).' },
          { title: 'Les R\u00e9seaux Sociaux', content: 'Permis en principe, mais avec des limites \u00e9thiques sur le contenu partag\u00e9.' },
          { title: 'Les Jeux Vid\u00e9o', content: 'Divergence selon le contenu et le temps consacr\u00e9.' },
          { title: 'L\'Intelligence Artificielle', content: 'Questions \u00e9mergentes sur l\'utilisation \u00e9thique de l\'IA et ses limites.' }
        ]
      },
      {
        icon: Users,
        title: 'Vie Sociale en Occident',
        content: ['D\u00e9fis sp\u00e9cifiques aux musulmans vivant en minorit\u00e9.'],
        subsections: [
          { title: 'La Participation Politique', content: 'Permise selon la majorit\u00e9 pour d\u00e9fendre les int\u00e9r\u00eats de la communaut\u00e9.' },
          { title: 'Les Pr\u00eats Hypoth\u00e9caires', content: 'D\u00e9bat entre l\'interdiction stricte et la permission en cas de n\u00e9cessit\u00e9 absolue.' },
          { title: 'La Scolarisation Mixte', content: 'Permise avec conditions selon les circonstances.' },
          { title: 'Les F\u00eates Non-Musulmanes', content: 'Interdit d\'y participer religieusement, d\u00e9bat sur la participation sociale.' }
        ]
      },
      {
        icon: AlertCircle,
        title: 'Alimentation',
        content: ['Questions sur la lic\u00e9it\u00e9 des aliments modernes.'],
        subsections: [
          { title: 'La Viande des Gens du Livre', content: 'Halal selon la majorit\u00e9 si les conditions d\'abattage sont respect\u00e9es, d\u00e9bat sur les m\u00e9thodes industrielles.' },
          { title: 'La G\u00e9latine', content: 'Divergence selon son origine (porcine interdite, bovine d\u00e9battue si transform\u00e9e chimiquement).' },
          { title: 'Les Additifs Alimentaires', content: 'N\u00e9cessitent une v\u00e9rification au cas par cas.' },
          { title: 'Les OGM', content: 'D\u00e9bat sur leur lic\u00e9it\u00e9 selon les risques sanitaires et \u00e9thiques.' }
        ]
      },
      {
        icon: Sparkles,
        title: 'Arts et Divertissement',
        content: ['Questions sur les formes d\'expression artistique.'],
        subsections: [
          { title: 'La Musique', content: 'Divergence majeure : interdite selon les Hanbalites et certains Malikites, permise avec conditions selon d\'autres.' },
          { title: 'La Photographie et le Cin\u00e9ma', content: 'Permis selon la majorit\u00e9 contemporaine si le contenu est licite.' },
          { title: 'Le Th\u00e9\u00e2tre', content: 'D\u00e9bat sur sa lic\u00e9it\u00e9 selon le contenu et l\'objectif.' },
          { title: 'Le Sport', content: 'Permis et encourag\u00e9, mais d\u00e9bat sur la mixit\u00e9 et les tenues.' }
        ]
      }
    ]
  },
  {
    id: 'political',
    icon: Globe,
    title: 'QUATRI\u00c8ME PARTIE: QUESTIONS POLITIQUES ET SOCIALES',
    arabicTitle: '\u0627\u0644\u0633\u064a\u0627\u0633\u0629 \u0648\u0627\u0644\u0645\u062c\u062a\u0645\u0639',
    description: 'Questions relatives \u00e0 la gouvernance et \u00e0 l\'organisation sociale',
    sections: [
      {
        icon: Scale,
        title: 'Le Syst\u00e8me Politique',
        content: ['Questions sur la forme du gouvernement islamique.'],
        subsections: [
          { title: 'Le Califat', content: 'D\u00e9bat sur son caract\u00e8re obligatoire ou recommand\u00e9, et sur sa faisabilit\u00e9 aujourd\'hui.' },
          { title: 'La D\u00e9mocratie', content: 'Divergence entre rejet total, acceptation avec conditions, et adaptation islamique (Shura).' },
          { title: 'La S\u00e9paration des Pouvoirs', content: 'D\u00e9bat sur sa compatibilit\u00e9 avec les principes islamiques.' },
          { title: 'Les Droits de l\'Homme', content: 'Discussion sur l\'universalit\u00e9 vs. la sp\u00e9cificit\u00e9 islamique.' }
        ]
      },
      {
        icon: Globe,
        title: 'Relations Internationales',
        content: ['Questions sur les relations avec les non-musulmans.'],
        subsections: [
          { title: 'Le Jihad', content: 'Divergence sur sa d\u00e9finition : d\u00e9fensif uniquement selon certains, offensif selon d\'autres dans des conditions strictes.' },
          { title: 'Les Trait\u00e9s avec les Non-Musulmans', content: 'Permis selon tous, d\u00e9bat sur les conditions et la dur\u00e9e.' },
          { title: 'La R\u00e9sidence en Terre Non-Musulmane', content: 'Permise selon la majorit\u00e9 contemporaine, surtout pour l\'appel \u00e0 l\'Islam ou la n\u00e9cessit\u00e9.' }
        ]
      },
      {
        icon: Users,
        title: 'Questions de Genre',
        content: ['Questions relatives aux r\u00f4les et droits selon le genre.'],
        subsections: [
          { title: 'Le Voile (Hijab)', content: 'Obligatoire selon la majorit\u00e9, d\u00e9bat sur ce qui doit \u00eatre couvert exactement (visage, mains).' },
          { title: 'Le Travail de la Femme', content: 'Permis selon tous avec conditions de pudeur et de pr\u00e9servation des obligations familiales.' },
          { title: 'La Tutelle Matrimoniale (Wali)', content: 'Obligatoire selon la majorit\u00e9, non obligatoire pour la femme majeure selon les Hanafites.' },
          { title: 'Le Leadership F\u00e9minin', content: 'D\u00e9bat sur les postes que peut occuper une femme dans la soci\u00e9t\u00e9.' }
        ]
      },
      {
        icon: Scale,
        title: 'Justice et Peines',
        content: ['Questions sur l\'application des peines l\u00e9gales.'],
        subsections: [
          { title: 'Les Hud\u00fbd', content: 'Conditions strictes d\'application, d\u00e9bat sur leur mise en \u0153uvre dans le contexte moderne.' },
          { title: 'La Peine de Mort pour l\'Apostasie', content: 'D\u00e9bat entre ceux qui la maintiennent et ceux qui distinguent apostasie priv\u00e9e et trahison publique.' },
          { title: 'Les Peines Alternatives', content: 'Discussion sur l\'adaptation des peines aux contextes contemporains.' }
        ]
      }
    ]
  },
  {
    id: 'eschatological',
    icon: Clock,
    title: 'CINQUI\u00c8ME PARTIE: QUESTIONS ESCHATOLOGIQUES',
    arabicTitle: '\u0627\u0644\u0622\u062e\u0631\u0629',
    description: 'Questions relatives \u00e0 la fin des temps et l\'au-del\u00e0',
    sections: [
      {
        icon: AlertCircle,
        title: 'Les Signes de la Fin des Temps',
        content: ['Interpr\u00e9tation des signes annonc\u00e9s de la fin du monde.'],
        subsections: [
          { title: 'Les Signes Mineurs', content: 'D\u00e9bat sur l\'identification de certains signes dans le contexte actuel.' },
          { title: 'Les Signes Majeurs', content: 'Accord sur les dix signes majeurs, divergence sur l\'ordre de leur apparition.' },
          { title: 'Le Mahdi', content: 'Croyance sunnite \u00e0 sa venue, d\u00e9bat sur ses caract\u00e9ristiques exactes.' },
          { title: 'Le Retour de \'Issa (J\u00e9sus)', content: 'Consensus sur son retour, d\u00e9bat sur les d\u00e9tails de sa mission.' }
        ]
      },
      {
        icon: Book,
        title: 'La Vie dans l\'Au-del\u00e0',
        content: ['Questions sur la nature de la vie apr\u00e8s la mort.'],
        subsections: [
          { title: 'Le Supplice de la Tombe', content: 'R\u00e9alit\u00e9 affirm\u00e9e, d\u00e9bat sur sa nature (physique, spirituelle, ou les deux).' },
          { title: 'La Dur\u00e9e du Paradis et de l\'Enfer', content: '\u00c9ternit\u00e9 du Paradis consensuelle, d\u00e9bat sur l\'\u00e9ternit\u00e9 de l\'Enfer pour les musulmans p\u00e9cheurs.' },
          { title: 'Les Niveaux du Paradis', content: 'Accord sur l\'existence de degr\u00e9s, divergence sur leurs caract\u00e9ristiques pr\u00e9cises.' },
          { title: 'L\'Intercession', content: 'D\u00e9bat sur l\'\u00e9tendue de l\'intercession du Proph\u00e8te et d\'autres le Jour du Jugement.' }
        ]
      }
    ]
  },
  {
    id: 'practices',
    icon: Sparkles,
    title: 'SIXI\u00c8ME PARTIE: PRATIQUES RITUELLES CONTROVERS\u00c9ES',
    arabicTitle: '\u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0627\u0644\u0645\u062e\u062a\u0644\u0641 \u0639\u0644\u064a\u0647\u0627',
    description: 'Pratiques sur lesquelles existe une divergence significative',
    sections: [
      {
        icon: BookOpen,
        title: 'Soufisme et Spiritualit\u00e9',
        content: ['Questions sur les pratiques spirituelles.'],
        subsections: [
          { title: 'Le Dhikr Collectif', content: 'Permis selon les Soufis et certains savants, consid\u00e9r\u00e9 comme innovation par d\'autres.' },
          { title: 'La Visite des Tombes de Saints', content: 'Permise pour se rappeler la mort selon la majorit\u00e9, interdite si accompagn\u00e9e de pratiques polyth\u00e9istes.' },
          { title: 'Le Tawassul', content: 'D\u00e9bat sur la lic\u00e9it\u00e9 de demander l\'intercession des saints aupr\u00e8s d\'Allah.' },
          { title: 'La Musique Spirituelle (Sam\u00e2\')', content: 'Permise selon certains Soufis, interdite selon d\'autres \u00e9coles.' }
        ]
      },
      {
        icon: Sparkles,
        title: 'C\u00e9l\u00e9brations',
        content: ['D\u00e9bats sur la lic\u00e9it\u00e9 de certaines c\u00e9l\u00e9brations.'],
        subsections: [
          { title: 'Le Mawlid (Anniversaire du Proph\u00e8te)', content: 'Innovation louable selon certains, innovation bl\u00e2mable selon d\'autres.' },
          { title: 'L\'Isr\u00e2\' wal-Mi\'r\u00e2j', content: 'D\u00e9bat similaire au Mawlid sur sa c\u00e9l\u00e9bration.' },
          { title: 'Les Anniversaires', content: 'Interdits selon certains comme imitation des non-musulmans, permis selon d\'autres si sans exc\u00e8s.' }
        ]
      },
      {
        icon: Users,
        title: 'Pratiques Fun\u00e9raires',
        content: ['Divergences sur les rituels li\u00e9s \u00e0 la mort.'],
        subsections: [
          { title: 'La Lecture du Coran pour le D\u00e9funt', content: 'B\u00e9n\u00e9fique selon les Hanafites et Hanbalites, non b\u00e9n\u00e9fique selon les Malikites et Shafi\'ites.' },
          { title: 'Les Condol\u00e9ances \u00e0 Dur\u00e9e Prolong\u00e9e', content: 'D\u00e9bat sur la dur\u00e9e et la forme appropri\u00e9es.' },
          { title: 'La Construction sur les Tombes', content: 'Interdite selon la majorit\u00e9, sauf pour pr\u00e9servation selon certains.' }
        ]
      }
    ]
  }
];

function buildSubsectionPrompt(sectionTitle: string, subTitle: string, subContent: string): string {
  return `En tant qu'expert en sciences islamiques et en Usul al-Fiqh, explique en d\u00e9tail et en profondeur le sujet suivant dans le contexte de "${sectionTitle}" :

**${subTitle}** : ${subContent}

R\u00e9ponds en fran\u00e7ais avec une analyse approfondie. Structure ta r\u00e9ponse ainsi :
1. **Contexte et enjeux** : Explique pourquoi ce sujet est important et source de divergence
2. **Les diff\u00e9rentes positions des savants** : Pr\u00e9sente chaque position avec ses arguments
3. **Preuves du Coran** : Cite les versets pertinents en arabe avec traduction
4. **Preuves de la Sunnah** : Cite des hadiths authentiques (sahih) avec la source compl\u00e8te (collection, num\u00e9ro, grade d'authenticit\u00e9). Inclus le texte arabe du hadith.
5. **Conclusion** : R\u00e9sume la position majoritaire et le conseil pratique

Important : Ne cite QUE des hadiths sahih ou hasan. Pr\u00e9cise toujours la collection (Bukhari, Muslim, Tirmidhi, etc.) et le num\u00e9ro du hadith.`;
}

export default function UndefinedTopicScreen() {
  const { darkMode } = useSettings();
  const [expandedParts, setExpandedParts] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [expandedSubs, setExpandedSubs] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [shareText, setShareText] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleCopy = useCallback(async (text: string, key: string) => {
    await Clipboard.setStringAsync(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

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

  const handleSubsectionPress = useCallback((
    key: string,
    sectionTitle: string,
    subTitle: string,
    subContent: string,
  ) => {
    // Toggle collapse
    if (expandedSubs === key) {
      setExpandedSubs(null);
      return;
    }

    setExpandedSubs(key);

    // Already fetched
    const existing = answers.get(key);
    if (existing?.text && !existing.error) {
      return;
    }

    // Abort previous request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setAnswers(prev => {
      const next = new Map(prev);
      next.set(key, { text: '', loading: true });
      return next;
    });

    const prompt = buildSubsectionPrompt(sectionTitle, subTitle, subContent);

    generateChatResponseStream(
      prompt,
      (token) => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(key);
          next.set(key, { text: (current?.text ?? '') + token, loading: true });
          return next;
        });
      },
      controller.signal,
    )
      .then(() => {
        if (controller.signal.aborted) return;
        setAnswers(prev => {
          const next = new Map(prev);
          const current = next.get(key);
          next.set(key, { text: current?.text ?? '', loading: false });
          return next;
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setAnswers(prev => {
          const next = new Map(prev);
          next.set(key, {
            text: '',
            loading: false,
            error: 'Impossible de charger la r\u00e9ponse. V\u00e9rifiez votre connexion.',
          });
          return next;
        });
      });
  }, [expandedSubs, answers]);

  const retrySubsection = useCallback((
    key: string,
    sectionTitle: string,
    subTitle: string,
    subContent: string,
  ) => {
    // Clear old answer and retry
    setAnswers(prev => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
    setExpandedSubs(null);
    setTimeout(() => handleSubsectionPress(key, sectionTitle, subTitle, subContent), 50);
  }, [handleSubsectionPress]);

  return (
    <ScrollView
      style={[styles.container, darkMode && styles.containerDark]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        <View style={[styles.header, darkMode && styles.headerDark]}>
          <Text style={[styles.bismillah, darkMode && styles.bismillahDark]}>
            {'\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650'}
          </Text>

          <View style={styles.headerDivider} />

          <Text style={[styles.mainTitle, darkMode && styles.mainTitleDark]}>
            LES QUESTIONS NON DÉFINIES ET SUJETS DE DIVERGENCE EN ISLAM
          </Text>

          <Text style={[styles.arabicSubtitle, darkMode && styles.arabicSubtitleDark]}>
            {'\u0627\u0644\u0645\u0633\u0627\u0626\u0644 \u063a\u064a\u0631 \u0627\u0644\u0645\u062d\u062f\u062f\u0629 \u0648\u0627\u0644\u062e\u0644\u0627\u0641\u064a\u0629 \u0641\u064a \u0627\u0644\u0625\u0633\u0644\u0627\u0645'}
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
              {"Introduction : L\u2019Ikhtil\u00e2f (\u0627\u0644\u0627\u062e\u062a\u0644\u0627\u0641) en Islam"}
            </Text>
          </View>

          <Text style={[styles.introParagraph, darkMode && styles.introParagraphDark]}>
            {"L\u2019Ikhtil\u00e2f d\u00e9signe la divergence d\u2019opinions entre les savants de l\u2019Islam sur des questions juridiques, th\u00e9ologiques, ou pratiques. Ces divergences sont une r\u00e9alit\u00e9 naturelle et une richesse de la pens\u00e9e islamique, t\u00e9moignant de la profondeur et de la flexibilit\u00e9 de la Charia."}
          </Text>

          <Text style={[styles.introParagraph, darkMode && styles.introParagraphDark]}>
            {"Ce guide encyclop\u00e9dique pr\u00e9sente les principales questions sur lesquelles les savants ont diverg\u00e9, en expliquant les diff\u00e9rentes positions et leurs fondements. Appuyez sur chaque sujet pour obtenir une analyse approfondie avec des hadiths authentiques."}
          </Text>

          <View style={[styles.noteBox, darkMode && styles.noteBoxDark]}>
            <AlertCircle size={20} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
            <Text style={[styles.noteText, darkMode && styles.noteTextDark]}>
              {"Note : Les divergences pr\u00e9sent\u00e9es ici concernent des questions secondaires (Fur\u00fb\u2019), non les fondements de la foi qui font consensus (Us\u00fbl)."}
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
                                {section.subsections.map((subsection, subIndex) => {
                                  const subKey = `${sectionId}-${subIndex}`;
                                  const isSubExpanded = expandedSubs === subKey;
                                  const answer = answers.get(subKey);

                                  return (
                                    <View key={subIndex}>
                                      <Pressable
                                        style={({ pressed }) => [
                                          styles.subsection,
                                          darkMode && styles.subsectionDark,
                                          isSubExpanded && styles.subsectionExpanded,
                                          isSubExpanded && darkMode && styles.subsectionExpandedDark,
                                          pressed && styles.subsectionPressed,
                                        ]}
                                        onPress={() => handleSubsectionPress(
                                          subKey,
                                          section.title,
                                          subsection.title,
                                          subsection.content,
                                        )}
                                      >
                                        <View style={styles.subsectionRow}>
                                          <View style={{ flex: 1 }}>
                                            <Text style={[styles.subsectionTitle, darkMode && styles.subsectionTitleDark]}>
                                              {subsection.title}
                                            </Text>
                                            <Text style={[styles.subsectionContent, darkMode && styles.subsectionContentDark]}>
                                              {subsection.content}
                                            </Text>
                                          </View>
                                          <View style={styles.subsectionChevron}>
                                            {isSubExpanded ? (
                                              <ChevronDown size={16} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                                            ) : (
                                              <ChevronRight size={16} color={darkMode ? '#64748b' : '#94a3b8'} strokeWidth={2} />
                                            )}
                                          </View>
                                        </View>

                                        {!isSubExpanded && !answer?.text && (
                                          <Text style={[styles.tapHint, darkMode && styles.tapHintDark]}>
                                            Appuyez pour une analyse approfondie
                                          </Text>
                                        )}
                                      </Pressable>

                                      {isSubExpanded && (
                                        <View style={[styles.aiAnswerContainer, darkMode && styles.aiAnswerContainerDark]}>
                                          {answer?.loading && !answer.text && (
                                            <View style={styles.loadingContainer}>
                                              <ActivityIndicator size="small" color={darkMode ? '#14b8a6' : '#0f766e'} />
                                              <Text style={[styles.loadingText, darkMode && styles.loadingTextDark]}>
                                                Analyse approfondie en cours...
                                              </Text>
                                            </View>
                                          )}

                                          {answer?.text ? (
                                            <View>
                                              <FormattedText text={answer.text} darkMode={darkMode} />
                                              {answer.loading && (
                                                <Text style={[styles.streamingDots, darkMode && styles.streamingDotsDark]}>...</Text>
                                              )}
                                              {!answer.loading && (
                                                <View style={styles.answerActions}>
                                                  <Pressable
                                                    style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                                                    onPress={() => handleCopy(answer.text, subKey)}
                                                  >
                                                    <Copy size={14} color={darkMode ? '#14b8a6' : '#0f766e'} />
                                                    <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                                                      {copiedKey === subKey ? 'Copié !' : 'Copier'}
                                                    </Text>
                                                  </Pressable>
                                                  <Pressable
                                                    style={[styles.actionButton, darkMode && styles.actionButtonDark]}
                                                    onPress={() => setShareText(answer.text)}
                                                  >
                                                    <Share size={14} color={darkMode ? '#14b8a6' : '#0f766e'} />
                                                    <Text style={[styles.actionButtonText, darkMode && styles.actionButtonTextDark]}>
                                                      Partager
                                                    </Text>
                                                  </Pressable>
                                                </View>
                                              )}
                                            </View>
                                          ) : null}

                                          {answer?.error && (
                                            <View style={styles.errorRow}>
                                              <Text style={[styles.answerError, darkMode && styles.answerErrorDark]}>
                                                {answer.error}
                                              </Text>
                                              <Pressable
                                                style={[styles.retryButton, darkMode && styles.retryButtonDark]}
                                                onPress={() => retrySubsection(
                                                  subKey,
                                                  section.title,
                                                  subsection.title,
                                                  subsection.content,
                                                )}
                                              >
                                                <RefreshCw size={14} color={darkMode ? '#14b8a6' : '#0f766e'} strokeWidth={2} />
                                                <Text style={[styles.retryText, darkMode && styles.retryTextDark]}>
                                                  R\u00e9essayer
                                                </Text>
                                              </Pressable>
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
            {"\u00ab La divergence de ma communaut\u00e9 est une mis\u00e9ricorde \u00bb"}
          </Text>
          <Text style={[styles.footerNote, darkMode && styles.footerNoteDark]}>
            {"Cette phrase c\u00e9l\u00e8bre, bien que son authenticit\u00e9 comme hadith soit d\u00e9battue, exprime une r\u00e9alit\u00e9 de la tradition islamique : la diversit\u00e9 d\u2019opinions dans les questions secondaires est une source de richesse et de flexibilit\u00e9 pour la communaut\u00e9 musulmane."}
          </Text>
        </View>
      </View>

      <ShareModal
        visible={shareText !== null}
        onClose={() => setShareText(null)}
        text={shareText ?? ''}
        darkMode={darkMode}
      />
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
  subsectionExpanded: {
    backgroundColor: '#e0f2fe',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
    borderLeftColor: '#0284c7',
  },
  subsectionExpandedDark: {
    backgroundColor: '#0c4a6e44',
    borderLeftColor: '#38bdf8',
  },
  subsectionPressed: {
    opacity: 0.7,
  },
  subsectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  subsectionChevron: {
    marginLeft: 8,
    marginTop: 2,
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
  tapHint: {
    fontSize: 11,
    color: '#0f766e',
    marginTop: 8,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  tapHintDark: {
    color: '#14b8a6',
  },
  aiAnswerContainer: {
    backgroundColor: '#f0f9ff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    padding: 16,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0284c7',
    borderTopWidth: 1,
    borderTopColor: '#bae6fd',
  },
  aiAnswerContainerDark: {
    backgroundColor: '#1e293b',
    borderLeftColor: '#38bdf8',
    borderTopColor: '#334155',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  loadingTextDark: {
    color: '#94a3b8',
  },
  streamingDots: {
    fontSize: 16,
    color: '#0f766e',
    fontWeight: '700',
    marginTop: 4,
  },
  streamingDotsDark: {
    color: '#14b8a6',
  },
  answerActions: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    gap: 6,
  },
  actionButtonDark: {
    backgroundColor: '#0f766e33',
  },
  actionButtonText: {
    fontSize: 13,
    color: '#0f766e',
    fontWeight: '600',
  },
  actionButtonTextDark: {
    color: '#14b8a6',
  },
  errorRow: {
    gap: 8,
  },
  answerError: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  answerErrorDark: {
    color: '#f87171',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0fdfa',
  },
  retryButtonDark: {
    backgroundColor: '#0f766e33',
  },
  retryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0f766e',
  },
  retryTextDark: {
    color: '#14b8a6',
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
