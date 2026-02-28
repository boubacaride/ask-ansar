import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  useWindowDimensions,
  Animated,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '@/store/settingsStore';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── CHAPTER DATA ────────────────────────────────────────────────

interface WuduStep {
  step: number;
  title: string;
  description: string;
  image?: string;
  repetitions?: string;
}

interface PrayerStep {
  step: number;
  title: string;
  arabicTitle?: string;
  position: string;
  description: string;
  arabic?: string;
  transliteration?: string;
  meaning?: string;
  repetitions?: string;
  image?: string;
  note?: string;
}

interface DailyPrayer {
  name: string;
  arabicName: string;
  time: string;
  fardRakah: number;
  sunnahBefore?: number;
  sunnahAfter?: number;
  recitationStyle: string;
  color: string;
}

const WUDU_STEPS: WuduStep[] = [
  {
    step: 1,
    title: 'Intention (Niyyah)',
    description: "Formulez mentalement l'intention de faire les ablutions pour la prière. L'intention se fait dans le cœur, aucune parole n'est requise.",
  },
  {
    step: 2,
    title: 'Dire Bismillah',
    description: "Prononcez \"Bismillah\" (Au nom d'Allah) silencieusement avant de commencer les ablutions.",
  },
  {
    step: 3,
    title: 'Laver les mains',
    description: 'Lavez les mains trois fois en commençant par la main droite, du bout des doigts jusqu\'au poignet, en vous assurant que chaque partie est bien nettoyée.',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-wash-hands.png',
    repetitions: '3 fois',
  },
  {
    step: 4,
    title: 'Rincer la bouche',
    description: "Prenez de l'eau dans la main droite, rincez-vous la bouche en la faisant circuler, puis recrachez. Répétez trois fois.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-rinse-mouth.png',
    repetitions: '3 fois',
  },
  {
    step: 5,
    title: 'Nettoyer le nez',
    description: "Aspirez doucement de l'eau dans les narines avec la main droite, puis expulsez-la. Répétez trois fois sans forcer.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-into-nose.png',
    repetitions: '3 fois',
  },
  {
    step: 6,
    title: 'Laver le visage',
    description: "Lavez le visage entier trois fois, d'une oreille à l'autre et du front au menton. Les hommes doivent aussi passer les mains mouillées dans la barbe.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-wash-face.png',
    repetitions: '3 fois',
  },
  {
    step: 7,
    title: 'Laver les bras',
    description: "Lavez le bras droit du bout des doigts jusqu'au coude, en vous assurant qu'aucune partie ne reste sèche. Répétez avec le bras gauche.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-wash-arms.png',
    repetitions: '3 fois chaque bras',
  },
  {
    step: 8,
    title: 'Essuyer la tête',
    description: "Passez les mains mouillées du front vers l'arrière de la tête, puis revenez vers le front. Une seule fois suffit.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-wash-hair.png',
    repetitions: '1 fois',
  },
  {
    step: 9,
    title: 'Nettoyer les oreilles',
    description: "Nettoyez l'intérieur des oreilles avec les index et l'arrière avec les pouces, en utilisant l'eau restante de l'étape précédente.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-clean-ears.png',
    repetitions: '1 fois',
  },
  {
    step: 10,
    title: 'Laver les pieds',
    description: "Lavez le pied droit trois fois, des orteils à la cheville, en passant entre les orteils et autour du talon. Répétez avec le pied gauche.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/wudu-wash-feet.png',
    repetitions: '3 fois chaque pied',
  },
  {
    step: 11,
    title: 'Shahada et Dou\'a',
    description: "Après le Wudu, récitez la Shahada et l'invocation de purification.",
  },
];

const PRAYER_STEPS: PrayerStep[] = [
  {
    step: 1,
    title: 'Intention (Niyyah)',
    arabicTitle: 'النية',
    position: 'Debout',
    description: "Formulez l'intention de prier dans votre cœur. L'intention doit être sincère et dirigée vers Allah seul. Orientez-vous vers la Qiblah (direction de la Ka'ba à la Mecque).",
    note: "L'intention se fait dans le cœur, il n'est pas nécessaire de la prononcer à voix haute.",
  },
  {
    step: 2,
    title: 'Takbirat al-Ihram',
    arabicTitle: 'تكبيرة الإحرام',
    position: 'Debout, mains levées aux oreilles',
    description: "Levez les mains au niveau des oreilles (ou des épaules) et dites \"Allahu Akbar\". C'est à ce moment que la prière commence officiellement.",
    arabic: 'اللهُ أَكْبَر',
    transliteration: 'Allahu Akbar',
    meaning: 'Allah est le Plus Grand',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/say-allahu-akbar-to-start-salah.jpg',
  },
  {
    step: 3,
    title: 'Position des mains',
    arabicTitle: 'وضع اليدين',
    position: 'Debout',
    description: "Placez la main droite sur la main gauche, au niveau de la poitrine ou du nombril. Gardez le regard fixé vers le point de prosternation devant vous.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/standing-for-salah-looking-at-ground.jpg',
  },
  {
    step: 4,
    title: "Dou'a d'ouverture (Istiftah)",
    arabicTitle: 'دعاء الاستفتاح',
    position: 'Debout',
    description: "Récitez l'invocation d'ouverture (recommandée mais pas obligatoire).",
    arabic: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ',
    transliteration: "Subhanakal-lahumma wa bihamdika wa tabarakas-muka wa ta'ala jadduka wa la ilaha ghayruka",
    meaning: "Gloire et louange à Toi, ô Allah. Béni soit Ton nom, exaltée soit Ta majesté, et il n'y a pas de divinité en dehors de Toi.",
  },
  {
    step: 5,
    title: 'Récitation de Sourate Al-Fatiha',
    arabicTitle: 'سورة الفاتحة',
    position: 'Debout',
    description: "Commencez par la demande de refuge, puis récitez Al-Fatiha en entier. Cette récitation est un pilier obligatoire de chaque rak'ah.",
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\nالرَّحْمَنِ الرَّحِيمِ\nمَالِكِ يَوْمِ الدِّينِ\nإِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ\nاهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ\nصِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ\nغَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    transliteration: "Bismillahir-Rahmanir-Rahim\nAl-hamdu lillahi Rabbil-'alamin\nAr-Rahmanir-Rahim\nMaliki yawmid-din\nIyyaka na'budu wa iyyaka nasta'in\nIhdinas-siratal-mustaqim\nSiratal-ladhina an'amta 'alayhim\nGhayril-maghdubi 'alayhim wa lad-dallin",
    meaning: "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux.\nLouange à Allah, Seigneur de l'univers.\nLe Tout Miséricordieux, le Très Miséricordieux.\nMaître du Jour de la Rétribution.\nC'est Toi que nous adorons, et c'est Toi dont nous implorons le secours.\nGuide-nous dans le droit chemin.\nLe chemin de ceux que Tu as comblés de faveurs,\nnon pas de ceux qui ont encouru Ta colère, ni des égarés.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/standing-in-salah-recite-surah-fatihah.jpg',
    note: "Après Al-Fatiha, dites \"Amin\". Dans les deux premières rak'ahs, récitez ensuite une sourate supplémentaire du Coran.",
  },
  {
    step: 6,
    title: "Ruku' (Inclinaison)",
    arabicTitle: 'الركوع',
    position: 'Incliné, dos droit, mains sur les genoux',
    description: "Dites \"Allahu Akbar\" et inclinez-vous en gardant le dos droit, les mains sur les genoux. Les yeux restent dirigés vers le sol.",
    arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيم',
    transliteration: "Subhana Rabbiyal-'Adhim",
    meaning: 'Gloire à mon Seigneur, le Magnifique',
    repetitions: 'Répéter 3 fois',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/how-to-make-ruku-bowing-down.jpg',
  },
  {
    step: 7,
    title: "Redressement après le Ruku'",
    arabicTitle: 'الرفع من الركوع',
    position: 'Debout',
    description: "Redressez-vous en disant \"Sami'Allahu liman hamidah\", puis une fois debout, dites \"Rabbana wa lakal hamd\".",
    arabic: 'سَمِعَ اللهُ لِمَنْ حَمِدَه\nرَبَّنَا وَلَكَ الْحَمْد',
    transliteration: "Sami'Allahu liman hamidah\nRabbana wa lakal hamd",
    meaning: "Allah entend celui qui Le loue.\nNotre Seigneur, à Toi la louange.",
  },
  {
    step: 8,
    title: 'Premier Sujud (Prosternation)',
    arabicTitle: 'السجود الأول',
    position: 'Front, nez, paumes, genoux et orteils au sol',
    description: "Dites \"Allahu Akbar\" et prosternez-vous. Sept parties du corps doivent toucher le sol : le front avec le nez, les deux paumes, les deux genoux, et les orteils des deux pieds.",
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: "Subhana Rabbiyal-A'la",
    meaning: 'Gloire à mon Seigneur, le Très Haut',
    repetitions: 'Répéter 3 fois',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/making-sujud-in-salah.jpg',
    note: "Le Sujud est le moment où le serviteur est le plus proche d'Allah. C'est un excellent moment pour faire des invocations.",
  },
  {
    step: 9,
    title: 'Assise entre les deux Sujuds',
    arabicTitle: 'الجلوس بين السجدتين',
    position: 'Assis sur la jambe gauche, pied droit relevé',
    description: "Dites \"Allahu Akbar\" en vous relevant, asseyez-vous sur votre jambe gauche avec le pied droit relevé, les mains posées sur les genoux.",
    arabic: 'رَبِّ اغْفِرْ لِي',
    transliteration: 'Rabbighfir li',
    meaning: 'Seigneur, pardonne-moi',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/sitting-between-sujud.jpg',
  },
  {
    step: 10,
    title: 'Deuxième Sujud',
    arabicTitle: 'السجود الثاني',
    position: 'Prosternation (identique au premier)',
    description: "Dites \"Allahu Akbar\" et effectuez la deuxième prosternation de la même manière que la première.",
    arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى',
    transliteration: "Subhana Rabbiyal-A'la",
    meaning: 'Gloire à mon Seigneur, le Très Haut',
    repetitions: 'Répéter 3 fois',
  },
  {
    step: 11,
    title: "Retour à la position debout / Fin d'une Rak'ah",
    arabicTitle: 'القيام / نهاية الركعة',
    position: 'Debout',
    description: "Dites \"Allahu Akbar\" et relevez-vous pour commencer la rak'ah suivante. Vous avez terminé une rak'ah complète.",
    note: "Après la 2ème et la dernière rak'ah, restez assis pour le Tashahud au lieu de vous relever.",
  },
  {
    step: 12,
    title: 'Tashahud (Attestation)',
    arabicTitle: 'التشهد',
    position: 'Assis, index droit levé',
    description: "Après la 2ème rak'ah (et la dernière), asseyez-vous et récitez le Tashahud en levant l'index droit.",
    arabic: 'التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ\nالسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللهِ وَبَرَكَاتُهُ\nالسَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللهِ الصَّالِحِينَ\nأَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: "At-Tahiyyatu lillahi was-salawatu wat-tayyibat\nAs-salamu 'alayka ayyuhan-Nabiyyu wa rahmatullahi wa barakatuh\nAs-salamu 'alayna wa 'ala 'ibadillahis-salihin\nAsh-hadu an la ilaha illAllah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh",
    meaning: "Les salutations sont pour Allah, ainsi que les prières et les bonnes œuvres.\nQue la paix soit sur toi, ô Prophète, ainsi que la miséricorde d'Allah et Ses bénédictions.\nQue la paix soit sur nous et sur les pieux serviteurs d'Allah.\nJ'atteste qu'il n'y a de divinité qu'Allah et j'atteste que Muhammad est Son serviteur et Son Messager.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/sitting-in-salah-and-tashahud.jpg',
  },
  {
    step: 13,
    title: 'Salat \'ala an-Nabi (Prière sur le Prophète)',
    arabicTitle: 'الصلاة على النبي',
    position: 'Assis (dernière rak\'ah uniquement)',
    description: "Dans la dernière rak'ah, après le Tashahud, ajoutez la prière Ibrahimiya (prière sur le Prophète).",
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ\nكَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ\nإِنَّكَ حَمِيدٌ مَجِيدٌ\nوَبَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ\nكَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ\nإِنَّكَ حَمِيدٌ مَجِيدٌ',
    transliteration: "Allahumma salli 'ala Muhammad wa 'ala ali Muhammad\nKama sallayta 'ala Ibrahim wa 'ala ali Ibrahim\nInnaka Hamidun Majid\nWa barik 'ala Muhammad wa 'ala ali Muhammad\nKama barakta 'ala Ibrahim wa 'ala ali Ibrahim\nInnaka Hamidun Majid",
    meaning: "Ô Allah, prie sur Muhammad et sur la famille de Muhammad,\ncomme Tu as prié sur Ibrahim et la famille d'Ibrahim.\nTu es certes digne de louange et de gloire.\nEt bénis Muhammad et la famille de Muhammad,\ncomme Tu as béni Ibrahim et la famille d'Ibrahim.\nTu es certes digne de louange et de gloire.",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/saying-tashahud-and-salah-an-nabi-prophet.jpg',
  },
  {
    step: 14,
    title: 'Taslim (Salutations finales)',
    arabicTitle: 'التسليم',
    position: 'Assis, tourner la tête à droite puis à gauche',
    description: "Pour terminer la prière, tournez la tête à droite puis à gauche en prononçant le Taslim à chaque côté.",
    arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللهِ',
    transliteration: "Assalamu 'alaykum wa rahmatullah",
    meaning: "Que la paix et la miséricorde d'Allah soient sur vous",
    image: 'https://www.mymasjid.ca/wp-content/uploads/2017/03/end-the-salah-with-tasleem-.jpg',
    note: 'La prière est maintenant terminée. Vous pouvez ensuite faire des invocations personnelles.',
  },
];

const DAILY_PRAYERS: DailyPrayer[] = [
  {
    name: 'Fajr',
    arabicName: 'الفجر',
    time: "De l'aube jusqu'au lever du soleil",
    fardRakah: 2,
    sunnahBefore: 2,
    recitationStyle: 'Récitation à voix haute',
    color: '#5C6BC0',
  },
  {
    name: 'Dhuhr',
    arabicName: 'الظهر',
    time: 'Du zénith du soleil jusqu\'à la mi-après-midi',
    fardRakah: 4,
    sunnahBefore: 4,
    sunnahAfter: 2,
    recitationStyle: 'Récitation silencieuse',
    color: '#FF8F00',
  },
  {
    name: "'Asr",
    arabicName: 'العصر',
    time: "De la mi-après-midi jusqu'au coucher du soleil",
    fardRakah: 4,
    sunnahBefore: 4,
    recitationStyle: 'Récitation silencieuse',
    color: '#EF6C00',
  },
  {
    name: 'Maghrib',
    arabicName: 'المغرب',
    time: 'Du coucher du soleil jusqu\'à la disparition du crépuscule',
    fardRakah: 3,
    sunnahAfter: 2,
    recitationStyle: 'Voix haute (rak\'ahs 1-2), silencieuse (rak\'ah 3)',
    color: '#E53935',
  },
  {
    name: "'Isha",
    arabicName: 'العشاء',
    time: "De la disparition du crépuscule jusqu'à l'aube",
    fardRakah: 4,
    sunnahAfter: 2,
    recitationStyle: 'Voix haute (rak\'ahs 1-2), silencieuse (rak\'ahs 3-4)',
    color: '#283593',
  },
];

const CHAPTERS = [
  {
    id: 1,
    title: "Qu'est-ce que la Salah ?",
    arabicTitle: 'ما هي الصلاة؟',
    icon: 'question-circle',
    color: '#5C6BC0',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/why-do-we-pray.png',
  },
  {
    id: 2,
    title: 'Les Ablutions (Wudu)',
    arabicTitle: 'الوضوء',
    icon: 'hand-holding-water',
    color: '#0097A7',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/make-wudu.png',
  },
  {
    id: 3,
    title: 'Préparation à la Prière',
    arabicTitle: 'التحضير للصلاة',
    icon: 'clipboard-check',
    color: '#43A047',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/checklist-for-salah.png',
  },
  {
    id: 4,
    title: 'Comment Prier, Étape par Étape',
    arabicTitle: 'كيفية الصلاة خطوة بخطوة',
    icon: 'pray',
    color: '#9c27b0',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/pray-salah.png',
  },
  {
    id: 5,
    title: 'Les 5 Prières Quotidiennes',
    arabicTitle: 'الصلوات الخمس',
    icon: 'clock',
    color: '#FF8F00',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/5-daily-salah.png',
  },
  {
    id: 6,
    title: 'Conditions et Piliers',
    arabicTitle: 'شروط وأركان الصلاة',
    icon: 'list-ol',
    color: '#00897b',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/conditions-and-pillars.png',
  },
  {
    id: 7,
    title: 'Erreurs Courantes à Éviter',
    arabicTitle: 'الأخطاء الشائعة',
    icon: 'exclamation-triangle',
    color: '#E53935',
    image: 'https://www.mymasjid.ca/wp-content/uploads/2016/10/common-mistakes-in-salah.png',
  },
];

const CONDITIONS = [
  { title: "L'Islam", desc: 'Être musulman(e).' },
  { title: 'La raison', desc: 'Être sain(e) d\'esprit.' },
  { title: "L'âge de discernement", desc: 'Avoir atteint l\'âge de raison.' },
  { title: 'La purification (Taharah)', desc: 'Avoir fait les ablutions (Wudu) ou le bain rituel (Ghusl).' },
  { title: "L'entrée du temps", desc: 'Prier dans le temps prescrit pour chaque prière.' },
  { title: 'Couvrir la Awra', desc: 'Couvrir les parties du corps requises.' },
  { title: "S'orienter vers la Qiblah", desc: 'Faire face à la direction de la Ka\'ba.' },
  { title: "L'intention (Niyyah)", desc: 'Avoir l\'intention de prier dans le cœur.' },
];

const PILLARS = [
  { title: 'Se tenir debout (Qiyam)', desc: 'Se tenir debout dans la prière obligatoire quand on en est capable.' },
  { title: "Takbirat al-Ihram", desc: 'Dire "Allahu Akbar" pour commencer la prière.' },
  { title: 'Réciter Al-Fatiha', desc: "Réciter la sourate Al-Fatiha dans chaque rak'ah." },
  { title: "Le Ruku' (Inclinaison)", desc: 'S\'incliner avec le dos droit.' },
  { title: 'Se redresser après le Ruku\'', desc: 'Revenir à la position debout après l\'inclinaison.' },
  { title: 'Le Sujud (Prosternation)', desc: 'Se prosterner sur les sept membres.' },
  { title: 'S\'asseoir entre les deux Sujuds', desc: 'S\'asseoir brièvement entre les deux prosternations.' },
  { title: 'Le dernier Tashahud', desc: 'Réciter l\'attestation de foi en position assise.' },
  { title: 'La Salat \'ala an-Nabi', desc: 'La prière sur le Prophète dans le dernier Tashahud.' },
  { title: 'Le Taslim', desc: 'Terminer la prière par les salutations.' },
  { title: 'L\'ordre (Tartib)', desc: 'Effectuer les actes dans l\'ordre prescrit.' },
  { title: 'La tranquillité (Tuma\'ninah)', desc: 'Observer le calme dans chaque position.' },
];

const COMMON_MISTAKES = [
  { title: 'Prier sans concentration (Khushu\')', desc: "Se laisser distraire par les pensées de la vie quotidienne au lieu de se concentrer sur la prière et le sens des paroles récitées.", fix: "Avant de commencer, prenez un moment de recueillement. Essayez de comprendre le sens de ce que vous récitez." },
  { title: 'Précipiter les mouvements', desc: "Effectuer les mouvements trop rapidement sans observer le calme (Tuma'ninah) dans chaque position.", fix: "Prenez le temps dans chaque position. Restez au moins le temps de dire \"Subhan Allah\" trois fois." },
  { title: 'Ne pas aligner le dos dans le Ruku\'', desc: "Se pencher insuffisamment ou avoir le dos arrondi pendant l'inclinaison.", fix: "Le dos doit être droit et parallèle au sol, les mains fermement posées sur les genoux." },
  { title: 'Ne pas poser les sept membres au sol dans le Sujud', desc: "Ne pas poser correctement le front, le nez, les deux mains, les deux genoux et les orteils au sol.", fix: "Assurez-vous que les sept parties du corps touchent bien le sol à chaque prosternation." },
  { title: 'Ne pas réciter Al-Fatiha correctement', desc: "Sauter des versets, mal prononcer les mots, ou ne pas réciter Al-Fatiha du tout.", fix: "Apprenez Al-Fatiha par cœur avec la bonne prononciation. Écoutez des récitations pour améliorer la vôtre." },
  { title: 'Regarder ailleurs pendant la prière', desc: "Regarder autour de soi, vers le plafond, ou se retourner pendant la prière.", fix: "Gardez les yeux fixés sur le point de prosternation devant vous tout au long de la prière." },
  { title: 'Prier en dehors du temps prescrit', desc: "Retarder la prière au-delà de son temps ou la prier avant l'entrée de son temps.", fix: "Utilisez une application de prière ou un calendrier pour connaître les horaires exacts dans votre ville." },
  { title: 'Bouger excessivement', desc: "Jouer avec les vêtements, se gratter constamment, ou faire des mouvements inutiles.", fix: "Restez immobile autant que possible. Les mouvements excessifs et continus peuvent invalider la prière." },
];

// ─── COMPONENT ────────────────────────────────────────────────

export default function SalahGuideScreen() {
  const { darkMode } = useSettings();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const isSmallScreen = screenWidth < 380;
  const isWideScreen = screenWidth > 768;
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const colors = {
    background: darkMode ? '#0a0a0a' : '#f8f9fa',
    card: darkMode ? '#1e1e2d' : '#ffffff',
    cardBorder: darkMode ? '#2d2d44' : '#e0e0e0',
    text: darkMode ? '#ffffff' : '#1a1a2e',
    textSecondary: darkMode ? '#a0a0b0' : '#6c757d',
    primary: '#9c27b0',
    primaryLight: darkMode ? 'rgba(156, 39, 176, 0.15)' : 'rgba(156, 39, 176, 0.08)',
    accent: '#c9a227',
    surface: darkMode ? '#161625' : '#f0f0f5',
    arabicBg: darkMode ? '#1a1a30' : '#faf5ff',
    arabicBorder: darkMode ? '#3d2d5c' : '#e8d5f5',
    stepBg: darkMode ? '#151525' : '#fafafa',
    success: '#43A047',
    error: '#E53935',
    warning: '#FF8F00',
  };

  const toggleChapter = (chapterId: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedChapter(expandedChapter === chapterId ? null : chapterId);
  };

  const handleImageError = (url: string) => {
    setImageErrors(prev => ({ ...prev, [url]: true }));
  };

  const renderImage = (url: string, height: number = 200) => {
    if (imageErrors[url]) return null;
    return (
      <View style={[s.imageContainer, { borderColor: colors.cardBorder }]}>
        <Image
          source={{ uri: url }}
          style={[s.chapterImage, { height }]}
          resizeMode="contain"
          onError={() => handleImageError(url)}
        />
      </View>
    );
  };

  const renderArabicBox = (arabic: string, transliteration?: string, meaning?: string, repetitions?: string) => (
    <View style={[s.arabicBox, { backgroundColor: colors.arabicBg, borderColor: colors.arabicBorder }]}>
      <Text style={[s.arabicText, { color: colors.text }]}>{arabic}</Text>
      {transliteration && (
        <Text style={[s.transliterationText, { color: colors.primary }]}>{transliteration}</Text>
      )}
      {meaning && (
        <Text style={[s.meaningText, { color: colors.textSecondary }]}>{meaning}</Text>
      )}
      {repetitions && (
        <View style={[s.repetitionBadge, { backgroundColor: `${colors.primary}20` }]}>
          <FontAwesome5 name="redo" size={10} color={colors.primary} />
          <Text style={[s.repetitionText, { color: colors.primary }]}>{repetitions}</Text>
        </View>
      )}
    </View>
  );

  // ─── Chapter 1: What is Salah ───
  const renderChapter1 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[0].image)}
      <Text style={[s.paragraph, { color: colors.text }]}>
        La Salah (الصلاة) est le deuxième pilier de l'Islam et l'acte d'adoration le plus important après la Shahada (attestation de foi). C'est un lien direct entre le serviteur et son Créateur, Allah.
      </Text>
      <View style={[s.highlightCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
        <FontAwesome5 name="quran" size={18} color={colors.primary} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.highlightTitle, { color: colors.primary }]}>Verset du Coran</Text>
          <Text style={[s.highlightArabic, { color: colors.text }]}>
            إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا
          </Text>
          <Text style={[s.highlightText, { color: colors.textSecondary }]}>
            "La prière demeure pour les croyants une prescription à temps déterminé." (An-Nisa 4:103)
          </Text>
        </View>
      </View>
      <Text style={[s.subHeading, { color: colors.text }]}>Pourquoi prions-nous ?</Text>
      <View style={s.bulletList}>
        {[
          "C'est un commandement direct d'Allah, le Très Haut.",
          "Elle purifie l'âme et rapproche le serviteur de son Seigneur.",
          "Elle efface les péchés mineurs entre chaque prière.",
          "Elle protège contre les actes blâmables et la turpitude.",
          "Elle sera la première chose sur laquelle nous serons interrogés le Jour du Jugement.",
        ].map((item, i) => (
          <View key={i} style={s.bulletItem}>
            <View style={[s.bulletDot, { backgroundColor: colors.primary }]} />
            <Text style={[s.bulletText, { color: colors.text }]}>{item}</Text>
          </View>
        ))}
      </View>
      <View style={[s.infoCard, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
        <FontAwesome5 name="info-circle" size={16} color={colors.warning} />
        <Text style={[s.infoText, { color: colors.textSecondary }]}>
          La prière est obligatoire pour tout musulman pubère et sain d'esprit. Elle est prescrite cinq fois par jour à des horaires spécifiques.
        </Text>
      </View>
    </View>
  );

  // ─── Chapter 2: Wudu ───
  const renderChapter2 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[1].image)}
      <Text style={[s.paragraph, { color: colors.text }]}>
        Le Wudu (الوضوء) est la purification rituelle par l'eau. Il est obligatoire avant chaque prière si votre état de pureté est rompu. Voici les étapes détaillées pour effectuer le Wudu correctement.
      </Text>
      {WUDU_STEPS.map((step) => (
        <View key={step.step} style={[s.stepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={s.stepHeader}>
            <View style={[s.stepNumber, { backgroundColor: CHAPTERS[1].color }]}>
              <Text style={s.stepNumberText}>{step.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.stepTitle, { color: colors.text }]}>{step.title}</Text>
              {step.repetitions && (
                <View style={[s.repBadgeSmall, { backgroundColor: `${CHAPTERS[1].color}20` }]}>
                  <Text style={[s.repBadgeText, { color: CHAPTERS[1].color }]}>{step.repetitions}</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={[s.stepDescription, { color: colors.textSecondary }]}>{step.description}</Text>
          {step.image && renderImage(step.image, 160)}
        </View>
      ))}
      <View style={[s.highlightCard, { backgroundColor: colors.arabicBg, borderColor: colors.arabicBorder }]}>
        <FontAwesome5 name="hands" size={18} color={colors.primary} style={{ marginRight: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={[s.highlightTitle, { color: colors.primary }]}>Dou'a après le Wudu</Text>
          <Text style={[s.highlightArabic, { color: colors.text }]}>
            أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ ، اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ
          </Text>
          <Text style={[s.highlightText, { color: colors.primary, fontStyle: 'italic' }]}>
            Ash-hadu an la ilaha illAllah wa ash-hadu anna Muhammadan 'abduhu wa rasuluh. Allahummaj'alni minat-tawwabin waj'alni minal-mutatahhirin.
          </Text>
          <Text style={[s.highlightText, { color: colors.textSecondary }]}>
            "J'atteste qu'il n'y a de divinité qu'Allah et que Muhammad est Son serviteur et Messager. Ô Allah, fais de moi un de ceux qui se repentent et un de ceux qui se purifient."
          </Text>
        </View>
      </View>
      <View style={[s.infoCard, { backgroundColor: `${colors.error}10`, borderColor: `${colors.error}30` }]}>
        <FontAwesome5 name="exclamation-circle" size={16} color={colors.error} />
        <Text style={[s.infoText, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Ce qui annule le Wudu : </Text>
          les besoins naturels, le sommeil profond, la perte de conscience et tout ce qui sort des voies naturelles.
        </Text>
      </View>
    </View>
  );

  // ─── Chapter 3: Preparation ───
  const renderChapter3 = () => {
    const checklist = [
      { icon: 'hand-holding-water', label: 'Avoir le Wudu (ablutions)', detail: "Assurez-vous que vos ablutions sont valides avant de commencer." },
      { icon: 'tshirt', label: 'Porter des vêtements propres', detail: "Les vêtements doivent être propres et couvrir la 'Awra (parties du corps à couvrir)." },
      { icon: 'compass', label: "S'orienter vers la Qiblah", detail: "Faites face à la direction de la Ka'ba à la Mecque. Utilisez une application boussole si nécessaire." },
      { icon: 'clock', label: "Vérifier l'heure de la prière", detail: "Chaque prière a un créneau horaire spécifique. Ne priez pas en dehors de ce temps." },
      { icon: 'map-marker-alt', label: 'Choisir un endroit propre', detail: "Le lieu de prière doit être propre. Utilisez un tapis de prière si possible." },
      { icon: 'brain', label: "Avoir l'intention (Niyyah)", detail: "Formulez dans votre cœur l'intention de prier la prière spécifique (ex: Dhuhr, Asr, etc.)." },
      { icon: 'volume-mute', label: 'Éliminer les distractions', detail: "Mettez votre téléphone en silencieux et éloignez-vous des sources de bruit." },
    ];
    return (
      <View style={s.chapterContent}>
        {renderImage(CHAPTERS[2].image)}
        <Text style={[s.paragraph, { color: colors.text }]}>
          Avant de commencer la prière, assurez-vous que toutes les conditions suivantes sont remplies. Cette liste de vérification vous aidera à vous préparer correctement.
        </Text>
        {checklist.map((item, i) => (
          <View key={i} style={[s.checklistCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[s.checklistIcon, { backgroundColor: `${CHAPTERS[2].color}15` }]}>
              <FontAwesome5 name={item.icon as any} size={18} color={CHAPTERS[2].color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.checklistLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[s.checklistDetail, { color: colors.textSecondary }]}>{item.detail}</Text>
            </View>
            <Ionicons name="checkmark-circle" size={22} color={CHAPTERS[2].color} />
          </View>
        ))}
      </View>
    );
  };

  // ─── Chapter 4: How to Pray Step by Step ───
  const renderChapter4 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[3].image)}
      <Text style={[s.paragraph, { color: colors.text }]}>
        Voici le guide complet pour effectuer une rak'ah (unité de prière). Chaque prière est composée de plusieurs rak'ahs. Suivez ces étapes attentivement.
      </Text>
      {PRAYER_STEPS.map((step) => (
        <View key={step.step} style={[s.prayerStepCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={s.prayerStepHeader}>
            <View style={[s.prayerStepNum, { backgroundColor: CHAPTERS[3].color }]}>
              <Text style={s.prayerStepNumText}>{step.step}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.prayerStepTitle, { color: colors.text }]}>{step.title}</Text>
              {step.arabicTitle && (
                <Text style={[s.prayerStepArabicTitle, { color: colors.primary }]}>{step.arabicTitle}</Text>
              )}
            </View>
          </View>
          <View style={[s.positionBadge, { backgroundColor: `${CHAPTERS[3].color}15` }]}>
            <FontAwesome5 name="male" size={12} color={CHAPTERS[3].color} />
            <Text style={[s.positionText, { color: CHAPTERS[3].color }]}>{step.position}</Text>
          </View>
          <Text style={[s.prayerStepDesc, { color: colors.textSecondary }]}>{step.description}</Text>
          {step.image && renderImage(step.image, 180)}
          {step.arabic && renderArabicBox(step.arabic, step.transliteration, step.meaning, step.repetitions)}
          {step.note && (
            <View style={[s.noteBox, { backgroundColor: `${colors.warning}10`, borderColor: `${colors.warning}30` }]}>
              <FontAwesome5 name="lightbulb" size={14} color={colors.warning} />
              <Text style={[s.noteText, { color: colors.textSecondary }]}>{step.note}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );

  // ─── Chapter 5: The 5 Daily Prayers ───
  const renderChapter5 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[4].image)}
      <Text style={[s.paragraph, { color: colors.text }]}>
        Allah a prescrit cinq prières quotidiennes obligatoires. Chacune a un nombre spécifique de rak'ahs et un horaire déterminé.
      </Text>
      {DAILY_PRAYERS.map((prayer, i) => (
        <View key={i} style={[s.dailyPrayerCard, { backgroundColor: colors.card, borderColor: prayer.color, borderLeftWidth: 4 }]}>
          <View style={s.dailyPrayerHeader}>
            <View style={[s.dailyPrayerIcon, { backgroundColor: `${prayer.color}20` }]}>
              <FontAwesome5 name="mosque" size={20} color={prayer.color} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.dailyPrayerName, { color: colors.text }]}>{prayer.name}</Text>
                <Text style={[s.dailyPrayerArabic, { color: prayer.color }]}>{prayer.arabicName}</Text>
              </View>
              <Text style={[s.dailyPrayerTime, { color: colors.textSecondary }]}>{prayer.time}</Text>
            </View>
          </View>
          <View style={s.rakahRow}>
            {prayer.sunnahBefore && (
              <View style={[s.rakahBadge, { backgroundColor: `${colors.accent}15` }]}>
                <Text style={[s.rakahLabel, { color: colors.accent }]}>Sunnah avant</Text>
                <Text style={[s.rakahCount, { color: colors.accent }]}>{prayer.sunnahBefore}</Text>
              </View>
            )}
            <View style={[s.rakahBadge, { backgroundColor: `${prayer.color}15` }]}>
              <Text style={[s.rakahLabel, { color: prayer.color }]}>Fard</Text>
              <Text style={[s.rakahCount, { color: prayer.color }]}>{prayer.fardRakah}</Text>
            </View>
            {prayer.sunnahAfter && (
              <View style={[s.rakahBadge, { backgroundColor: `${colors.accent}15` }]}>
                <Text style={[s.rakahLabel, { color: colors.accent }]}>Sunnah après</Text>
                <Text style={[s.rakahCount, { color: colors.accent }]}>{prayer.sunnahAfter}</Text>
              </View>
            )}
          </View>
          <View style={[s.recitationRow, { backgroundColor: colors.surface }]}>
            <FontAwesome5 name="volume-up" size={12} color={colors.textSecondary} />
            <Text style={[s.recitationText, { color: colors.textSecondary }]}>{prayer.recitationStyle}</Text>
          </View>
        </View>
      ))}
      <View style={[s.infoCard, { backgroundColor: colors.primaryLight, borderColor: `${colors.primary}30` }]}>
        <FontAwesome5 name="info-circle" size={16} color={colors.primary} />
        <Text style={[s.infoText, { color: colors.textSecondary }]}>
          <Text style={{ fontWeight: '700', color: colors.text }}>Sunnah (Rawatib) : </Text>
          Ce sont les prières surérogatoires qui accompagnent les prières obligatoires. Elles ne sont pas obligatoires mais fortement recommandées.
        </Text>
      </View>
    </View>
  );

  // ─── Chapter 6: Conditions and Pillars ───
  const renderChapter6 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[5].image)}
      <Text style={[s.subHeading, { color: colors.text }]}>Les Conditions de la Prière</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Ce sont les prérequis qui doivent être remplis avant de commencer la prière. Si une condition manque, la prière n'est pas valide.
      </Text>
      {CONDITIONS.map((item, i) => (
        <View key={i} style={[s.conditionItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[s.conditionNum, { backgroundColor: `${CHAPTERS[5].color}15` }]}>
            <Text style={[s.conditionNumText, { color: CHAPTERS[5].color }]}>{i + 1}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.conditionTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[s.conditionDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        </View>
      ))}
      <Text style={[s.subHeading, { color: colors.text, marginTop: 24 }]}>Les Piliers (Arkan) de la Prière</Text>
      <Text style={[s.paragraph, { color: colors.textSecondary }]}>
        Ce sont les actes essentiels de la prière. Si un pilier est omis intentionnellement ou par oubli sans le rattraper, la prière est invalide.
      </Text>
      {PILLARS.map((item, i) => (
        <View key={i} style={[s.pillarItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={[s.pillarIcon, { backgroundColor: `${colors.primary}15` }]}>
            <FontAwesome5 name="check" size={12} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.conditionTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[s.conditionDesc, { color: colors.textSecondary }]}>{item.desc}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  // ─── Chapter 7: Common Mistakes ───
  const renderChapter7 = () => (
    <View style={s.chapterContent}>
      {renderImage(CHAPTERS[6].image)}
      <Text style={[s.paragraph, { color: colors.text }]}>
        Voici les erreurs les plus courantes commises pendant la prière, avec des conseils pour les corriger. Prenez-en connaissance pour améliorer votre Salah.
      </Text>
      {COMMON_MISTAKES.map((mistake, i) => (
        <View key={i} style={[s.mistakeCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={s.mistakeHeader}>
            <View style={[s.mistakeNum, { backgroundColor: `${colors.error}15` }]}>
              <Text style={[s.mistakeNumText, { color: colors.error }]}>{i + 1}</Text>
            </View>
            <Text style={[s.mistakeTitle, { color: colors.text }]}>{mistake.title}</Text>
          </View>
          <Text style={[s.mistakeDesc, { color: colors.textSecondary }]}>{mistake.desc}</Text>
          <View style={[s.fixBox, { backgroundColor: `${colors.success}10`, borderColor: `${colors.success}30` }]}>
            <FontAwesome5 name="check-circle" size={14} color={colors.success} />
            <Text style={[s.fixText, { color: colors.text }]}>{mistake.fix}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderChapterContent = (chapterId: number) => {
    switch (chapterId) {
      case 1: return renderChapter1();
      case 2: return renderChapter2();
      case 3: return renderChapter3();
      case 4: return renderChapter4();
      case 5: return renderChapter5();
      case 6: return renderChapter6();
      case 7: return renderChapter7();
      default: return null;
    }
  };

  return (
    <View style={[s.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={darkMode ? ['#0a0a0a', '#1a1a2e', '#1a0a2e'] : ['#f8f9fa', '#f3e5f5', '#e8d5f5']}
        style={s.gradient}
      >
        {/* Header */}
        <View style={[s.header, { borderBottomColor: colors.cardBorder, paddingTop: (Platform.OS === 'web' ? 20 : insets.top) + 10 }]}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => router.back()} style={s.backButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={[s.headerTitle, { color: colors.text, fontSize: isSmallScreen ? 18 : 22 }]}>
                Guide de la Salah
              </Text>
              <Text style={[s.headerSubtitle, { color: colors.primary }]}>
                دليل تعلم الصلاة
              </Text>
            </View>
            <View style={[s.headerIconBg, { backgroundColor: `${colors.primary}15` }]}>
              <FontAwesome5 name="pray" size={22} color={colors.primary} />
            </View>
          </View>
        </View>

        <ScrollView
          style={s.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[s.scrollContent, { maxWidth: isWideScreen ? 800 : undefined, alignSelf: isWideScreen ? 'center' as const : undefined, width: isWideScreen ? '100%' : undefined }]}
        >
          {/* Hero Banner */}
          <View style={[s.heroBanner, { backgroundColor: colors.primaryLight, borderColor: colors.primary }]}>
            <View style={s.heroContent}>
              <View style={[s.heroIconCircle, { backgroundColor: `${colors.primary}25` }]}>
                <MaterialCommunityIcons name="book-open-page-variant" size={32} color={colors.primary} />
              </View>
              <Text style={[s.heroTitle, { color: colors.text }]}>
                Guide Complet Pour Apprendre à Prier
              </Text>
              <Text style={[s.heroSubtitle, { color: colors.textSecondary }]}>
                Un guide pas à pas couvrant tout ce que vous devez savoir sur la prière en Islam, des ablutions aux cinq prières quotidiennes.
              </Text>
            </View>
            {renderImage('https://www.mymasjid.ca/wp-content/uploads/2016/10/guide-to-praying-salah.png', 180)}
          </View>

          {/* Table of Contents */}
          <Text style={[s.sectionHeading, { color: colors.text }]}>Chapitres</Text>

          {CHAPTERS.map((chapter) => (
            <View key={chapter.id}>
              <TouchableOpacity
                style={[
                  s.chapterCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: expandedChapter === chapter.id ? chapter.color : colors.cardBorder,
                    borderWidth: expandedChapter === chapter.id ? 2 : 1,
                  },
                ]}
                onPress={() => toggleChapter(chapter.id)}
                activeOpacity={0.7}
              >
                <View style={s.chapterRow}>
                  <View style={[s.chapterIconCircle, { backgroundColor: `${chapter.color}15` }]}>
                    <FontAwesome5 name={chapter.icon as any} size={18} color={chapter.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.chapterNumber, { color: chapter.color }]}>
                      Chapitre {chapter.id}
                    </Text>
                    <Text style={[s.chapterTitle, { color: colors.text }]}>{chapter.title}</Text>
                    <Text style={[s.chapterArabicTitle, { color: colors.textSecondary }]}>
                      {chapter.arabicTitle}
                    </Text>
                  </View>
                  <Ionicons
                    name={expandedChapter === chapter.id ? 'chevron-up' : 'chevron-down'}
                    size={22}
                    color={colors.textSecondary}
                  />
                </View>
              </TouchableOpacity>
              {expandedChapter === chapter.id && (
                <View style={[s.expandedContent, { borderColor: chapter.color }]}>
                  {renderChapterContent(chapter.id)}
                </View>
              )}
            </View>
          ))}

          {/* Footer */}
          <View style={[s.footer, { borderTopColor: colors.cardBorder }]}>
            <View style={[s.footerIcon, { backgroundColor: `${colors.primary}15` }]}>
              <FontAwesome5 name="heart" size={16} color={colors.primary} />
            </View>
            <Text style={[s.footerText, { color: colors.textSecondary }]}>
              Qu'Allah accepte vos prières et vous guide sur le droit chemin.
            </Text>
            <Text style={[s.footerArabic, { color: colors.primary }]}>
              تقبّل الله صلاتكم
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

// ─── STYLES ────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
  headerIconBg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // Hero
  heroBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 24,
    overflow: 'hidden',
  },
  heroContent: {
    alignItems: 'center',
    marginBottom: 16,
  },
  heroIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  // Section heading
  sectionHeading: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },

  // Chapter card
  chapterCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  chapterIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chapterNumber: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  chapterTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  chapterArabicTitle: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },

  // Expanded content
  expandedContent: {
    borderLeftWidth: 3,
    marginLeft: 24,
    marginBottom: 16,
    paddingLeft: 16,
  },
  chapterContent: {
    paddingVertical: 8,
  },

  // Image
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    marginVertical: 12,
    backgroundColor: '#f5f5f5',
  },
  chapterImage: {
    width: '100%',
  },

  // Typography
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 8,
  },

  // Bullet list
  bulletList: {
    marginBottom: 16,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
    gap: 10,
  },
  bulletDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },

  // Highlight card
  highlightCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  highlightTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  highlightArabic: {
    fontSize: 18,
    lineHeight: 32,
    textAlign: 'right',
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 20,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginVertical: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  // Step card (Wudu)
  stepCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepDescription: {
    fontSize: 14,
    lineHeight: 22,
  },
  repBadgeSmall: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 4,
  },
  repBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Arabic box
  arabicBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginVertical: 12,
  },
  arabicText: {
    fontSize: 20,
    lineHeight: 36,
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginBottom: 12,
  },
  transliterationText: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  meaningText: {
    fontSize: 13,
    lineHeight: 20,
  },
  repetitionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginTop: 10,
  },
  repetitionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Prayer step card
  prayerStepCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  prayerStepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  prayerStepNum: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prayerStepNumText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  prayerStepTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  prayerStepArabicTitle: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    marginTop: 2,
  },
  positionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prayerStepDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },

  // Note box
  noteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginTop: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },

  // Checklist card
  checklistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  checklistIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checklistLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 3,
  },
  checklistDetail: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Daily prayer card
  dailyPrayerCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },
  dailyPrayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  dailyPrayerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyPrayerName: {
    fontSize: 18,
    fontWeight: '700',
  },
  dailyPrayerArabic: {
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
  dailyPrayerTime: {
    fontSize: 13,
    marginTop: 3,
  },
  rakahRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  rakahBadge: {
    flex: 1,
    minWidth: 80,
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  rakahLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rakahCount: {
    fontSize: 22,
    fontWeight: '800',
  },
  recitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  recitationText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Condition & Pillar items
  conditionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  conditionNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  conditionNumText: {
    fontSize: 13,
    fontWeight: '700',
  },
  conditionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  conditionDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  pillarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 12,
  },
  pillarIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Mistake card
  mistakeCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  mistakeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  mistakeNum: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mistakeNumText: {
    fontSize: 13,
    fontWeight: '700',
  },
  mistakeTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  mistakeDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  fixBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
  },
  fixText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  // Footer
  footer: {
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 24,
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  footerArabic: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
  },
});
