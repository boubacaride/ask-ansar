import { CategoryHadith } from './categoryHadithUtils';

export const FALLBACK_HADITHS: Record<string, CategoryHadith[]> = {
  faith: [
    {
      hadithNumber: '1',
      arabicText: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالحَجِّ، وَصَوْمِ رَمَضَانَ',
      englishText: "Islam is built upon five: testifying that there is no deity worthy of worship except Allah and that Muhammad is the Messenger of Allah, establishing the prayer, paying the Zakat, making the pilgrimage to the House, and fasting in Ramadan.",
      frenchText: "L'Islam repose sur cinq piliers : témoigner qu'il n'y a de divinité digne d'adoration qu'Allah et que Muhammad est le Messager d'Allah, accomplir la prière, verser la Zakat, effectuer le pèlerinage à la Maison sacrée, et jeûner pendant le Ramadan.",
      reference: 'Sahih al-Bukhari 8',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
    {
      hadithNumber: '2',
      arabicText: 'الإِيمَانُ بِضْعٌ وَسَبْعُونَ شُعْبَةً، فَأَفْضَلُهَا قَوْلُ لاَ إِلَهَ إِلاَّ اللَّهُ، وَأَدْنَاهَا إِمَاطَةُ الأَذَى عَنِ الطَّرِيقِ، وَالحَيَاءُ شُعْبَةٌ مِنَ الإِيمَانِ',
      englishText: "Faith has over seventy branches, the most excellent of which is the declaration that there is no deity worthy of worship except Allah, and the lowest of which is the removal of harmful objects from the road. And modesty is a branch of faith.",
      frenchText: "La foi compte plus de soixante-dix branches, la plus excellente étant la déclaration qu'il n'y a de divinité digne d'adoration qu'Allah, et la plus basse étant l'enlèvement des objets nuisibles de la route. Et la pudeur est une branche de la foi.",
      reference: 'Sahih Muslim 35',
      collectionName: 'Sahih Muslim',
      collectionId: 'muslim',
    },
  ],
  prayer: [
    {
      hadithNumber: '528',
      arabicText: 'الصَّلاَةُ عِمَادُ الدِّينِ',
      englishText: "Prayer is the pillar of religion.",
      frenchText: "La prière est le pilier de la religion.",
      reference: 'Sahih al-Bukhari 528',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
    {
      hadithNumber: '393',
      arabicText: 'صَلُّوا كَمَا رَأَيْتُمُونِي أُصَلِّي',
      englishText: "Pray as you have seen me praying.",
      frenchText: "Priez comme vous m'avez vu prier.",
      reference: 'Sahih al-Bukhari 631',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
  ],
  fasting: [
    {
      hadithNumber: '1904',
      arabicText: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
      englishText: "Whoever fasts Ramadan out of faith and seeking reward, his previous sins will be forgiven.",
      frenchText: "Quiconque jeûne le Ramadan par foi et en quête de récompense, ses péchés antérieurs lui seront pardonnés.",
      reference: 'Sahih al-Bukhari 1901',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
    {
      hadithNumber: '1151',
      arabicText: 'الصِّيَامُ جُنَّةٌ',
      englishText: "Fasting is a shield.",
      frenchText: "Le jeûne est un bouclier.",
      reference: 'Sahih Muslim 1151',
      collectionName: 'Sahih Muslim',
      collectionId: 'muslim',
    },
  ],
  zakat: [
    {
      hadithNumber: '1395',
      arabicText: 'تَصَدَّقُوا وَلَوْ بِتَمْرَةٍ',
      englishText: "Give charity even if it is only a date.",
      frenchText: "Faites l'aumône, même si ce n'est qu'une datte.",
      reference: 'Sahih al-Bukhari 1417',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
    {
      hadithNumber: '2588',
      arabicText: 'الصَّدَقَةُ تُطْفِئُ الخَطِيئَةَ كَمَا يُطْفِئُ المَاءُ النَّارَ',
      englishText: "Charity extinguishes sin as water extinguishes fire.",
      frenchText: "L'aumône éteint le péché comme l'eau éteint le feu.",
      reference: 'Sunan at-Tirmidhi 2616',
      collectionName: 'Jami at-Tirmidhi',
      collectionId: 'tirmidhi',
    },
  ],
  hajj: [
    {
      hadithNumber: '1521',
      arabicText: 'مَنْ حَجَّ فَلَمْ يَرْفُثْ وَلَمْ يَفْسُقْ رَجَعَ كَيَوْمِ وَلَدَتْهُ أُمُّهُ',
      englishText: "Whoever performs Hajj and does not commit any obscenity or transgression will return (free from sins) as on the day his mother bore him.",
      frenchText: "Quiconque effectue le Hajj sans commettre d'obscénité ni de transgression reviendra (libéré de ses péchés) comme le jour où sa mère l'a mis au monde.",
      reference: 'Sahih al-Bukhari 1521',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
  ],
  manners: [
    {
      hadithNumber: '6029',
      arabicText: 'إِنَّمَا بُعِثْتُ لِأُتَمِّمَ صَالِحَ الأَخْلاَقِ',
      englishText: "I was sent to perfect good character.",
      frenchText: "J'ai été envoyé pour perfectionner le bon caractère.",
      reference: 'Sahih al-Bukhari 6029',
      collectionName: 'Sahih al-Bukhari',
      collectionId: 'bukhari',
    },
    {
      hadithNumber: '2593',
      arabicText: 'أَكْمَلُ المُؤْمِنِينَ إِيمَانًا أَحْسَنُهُمْ خُلُقًا',
      englishText: "The most complete of the believers in faith are those with the best character.",
      frenchText: "Les plus complets des croyants en foi sont ceux qui ont le meilleur caractère.",
      reference: 'Sunan Abu Dawud 4682',
      collectionName: 'Sunan Abu Dawud',
      collectionId: 'abudawud',
    },
  ],
  family: [
    {
      hadithNumber: '5971',
      arabicText: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي',
      englishText: "The best of you are those who are best to their families, and I am the best of you to my family.",
      frenchText: "Les meilleurs d'entre vous sont ceux qui sont les meilleurs envers leurs familles, et je suis le meilleur d'entre vous envers ma famille.",
      reference: 'Sunan at-Tirmidhi 3895',
      collectionName: 'Jami at-Tirmidhi',
      collectionId: 'tirmidhi',
    },
  ],
  business: [
    {
      hadithNumber: '2086',
      arabicText: 'التَّاجِرُ الصَّدُوقُ الأَمِينُ مَعَ النَّبِيِّينَ وَالصِّدِّيقِينَ وَالشُّهَدَاءِ',
      englishText: "The truthful and trustworthy merchant will be with the prophets, the truthful, and the martyrs.",
      frenchText: "Le commerçant véridique et digne de confiance sera avec les prophètes, les véridiques et les martyrs.",
      reference: 'Sunan at-Tirmidhi 1209',
      collectionName: 'Jami at-Tirmidhi',
      collectionId: 'tirmidhi',
    },
  ],
};

export function getFallbackHadiths(categoryId: string): CategoryHadith[] {
  return FALLBACK_HADITHS[categoryId] || [];
}
