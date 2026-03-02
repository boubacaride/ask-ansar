-- Seed duas table with curated data from duaFallbacks.ts
-- Generated on 2026-02-27T00:34:50.521Z
-- Total categories: 23

-- Clear existing data
DELETE FROM duas WHERE id IS NOT NULL;

-- ═══ MORNING (8 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Dhikr du matin - Ayat al-Kursi',
  'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
  'Allah - there is no deity except Him, the Ever-Living, the Self-Sustaining. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.',
  'Allah ! Point de divinité à part Lui, le Vivant, Celui qui subsiste par Lui-même. Ni somnolence ni sommeil ne Le saisissent. A Lui appartient tout ce qui est dans les cieux et sur la terre. Qui peut interceder auprès de Lui sans Sa permission ? Il connait leur passé et leur futur. Et de Sa science, ils n''embrassent que ce qu''Il veut. Son Trône déborde les cieux et la terre, dont la garde ne Lui coûte aucune peine. Et Il est le Très Haut, le Très Grand.',
  'Allaahu laa ilaaha illaa Huwal-Hayyul-Qayyoom. Laa ta''khudhuhu sinatun wa laa nawm. Lahu maa fis-samaawaati wa maa fil-ard. Man dhal-ladhee yashfa''u ''indahu illaa bi-idhnih. Ya''lamu maa bayna aydeehim wa maa khalfahum. Wa laa yuheetoona bi shay''in min ''ilmihi illaa bimaa shaa''. Wasi''a kursiyyuhus-samaawaati wal-ard. Wa laa ya''ooduhu hifdhuhumaa. Wa Huwal-''Aliyyul-''Adheem.',
  'Coran 2:255',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Dou''a du matin - Protection',
  'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  'We have reached the morning and at this very time the whole kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah alone, without any partner. To Him belongs the dominion, and to Him belongs all praise, and He is over all things capable.',
  'Nous voilà au matin et le royaume appartient à Allah. Louange à Allah. Nul ne mérite d''être adoré sauf Allah, Unique, sans associé. A Lui la royauté, à Lui la louange et Il est capable de toute chose.',
  'Asbahnaa wa asbahal-mulku lillaah, walhamdu lillaah, laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer.',
  'Sahih Muslim 2723',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Dou''a du matin - Seigneur des mondes',
  'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
  'O Allah, by Your leave we have reached the morning and by Your leave we have reached the evening, by Your leave we live and die and unto You is our resurrection.',
  'Ô Allah, c''est par Toi que nous sommes arrivés au matin et c''est par Toi que nous sommes arrivés au soir. C''est par Toi que nous vivons et mourons, et vers Toi est la résurrection.',
  'Allaahumma bika asbahnaa, wa bika amsaynaa, wa bika nahyaa, wa bika namootu wa ilaykan-nushoor.',
  'Sunan at-Tirmidhi 3391',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Sayyid al-Istighfar',
  'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ خَلَقْتَنِي وَأَنَا عَبْدُكَ وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
  'O Allah, You are my Lord, none has the right to be worshipped except You. You created me and I am Your servant, and I abide by Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for verily none can forgive sins except You.',
  'Ô Allah, Tu es mon Seigneur, nul ne mérite d''être adoré sauf Toi. Tu m''as créé et je suis Ton serviteur, et je me conforme à Ton pacte et à Ta promesse autant que je le peux. Je cherche refuge auprès de Toi contre le mal que j''ai commis. Je reconnais Ton bienfait envers moi et je reconnais mon péché, pardonne-moi donc, car nul ne pardonne les péchés sauf Toi.',
  'Allaahumma Anta Rabbee laa ilaaha illaa Anta, khalaqtanee wa ana ''abduka, wa ana ''alaa ''ahdika wa wa''dika mastata''t. A''oodhu bika min sharri maa sana''t. Aboo''u laka bini''matika ''alayya, wa aboo''u bidhanbee, faghfir lee, fa innahu laa yaghfirudh-dhunooba illaa Ant.',
  'Sahih al-Bukhari 6306',
  1,
  4
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'SubhanAllah wa bihamdihi',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  'Glory is to Allah and praise is to Him.',
  'Gloire à Allah et louange à Lui.',
  'SubhaanAllaahi wa bihamdihi.',
  'Sahih Muslim 2692',
  100,
  5
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'La hawla wa la quwwata illa billah',
  'لا حَوْلَ وَلا قُوَّةَ إِلَّا بِاللَّهِ',
  'There is no might or power except with Allah.',
  'Il n''y a de force ni de puissance qu''en Allah.',
  'Laa hawla wa laa quwwata illaa billaah.',
  'Sahih al-Bukhari 4205, Sahih Muslim 2704',
  100,
  6
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Dou''a de protection du matin',
  'اللَّهُمَّ إِنَّي أَسْأَلُكَ الْعَافِيَةَ فَي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنَّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فَي دَينَي وَدُنْيَايَ وَأَهْلَي وَمَالَي',
  'O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth.',
  'Ô Allah, je Te demande le bien-être dans ce monde et dans l''au-delà. Ô Allah, je Te demande le pardon et le bien-être dans ma religion, ma vie d''ici-bas, ma famille et mes biens.',
  'Allaahumma innee as''alukal-''aafiyata fid-dunyaa wal-aakhirah. Allaahumma innee as''alukal-''afwa wal-''aafiyata fee deenee wa dunyaaya wa ahlee wa maalee.',
  'Sunan Abu Dawud 5074',
  1,
  7
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'morning',
  'Dou''a de satisfaction le matin',
  'رَضِينَا بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دَينًا وَبِمُحَمَّدٍ نَبِيًّا',
  'We are pleased with Allah as our Lord, Islam as our religion, and Muhammad as our Prophet.',
  'Nous agréons Allah comme Seigneur, l''Islam comme religion et Muhammad comme prophète.',
  'Radeenaa billaahi Rabbaa, wa bil-Islaami deenaa, wa bi-Muhammadin Nabiyyaa.',
  'Sunan Abu Dawud 5072',
  3,
  8
);

-- ═══ EVENING (6 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Dou''a du soir - Entree dans la soiree',
  'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  'We have reached the evening and at this very time the whole kingdom belongs to Allah. All praise is for Allah. None has the right to be worshipped except Allah alone, without any partner.',
  'Nous voilà au soir et le royaume appartient à Allah. Louange à Allah. Nul ne mérite d''être adoré sauf Allah, Unique, sans associé.',
  'Amsaynaa wa amsal-mulku lillaah, walhamdu lillaah, laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer.',
  'Sahih Muslim 2723',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Dou''a du soir - Refuge',
  'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
  'O Allah, by Your leave we have reached the evening and by Your leave we have reached the morning, by Your leave we live and die and unto You is our return.',
  'Ô Allah, c''est par Toi que nous sommes arrivés au soir et c''est par Toi que nous sommes arrivés au matin. C''est par Toi que nous vivons et mourons, et vers Toi est le retour.',
  'Allaahumma bika amsaynaa, wa bika asbahnaa, wa bika nahyaa, wa bika namootu wa ilaykal-maseer.',
  'Sunan at-Tirmidhi 3391',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Sourate Al-Ikhlas',
  'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
  'Say, "He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent."',
  'Dis : "Il est Allah, Unique. Allah, Le Seul à être imploré pour ce que nous désirons. Il n''a jamais engendré, ni n''a été engendré. Et nul n''est égal à Lui."',
  'Qul huwallaahu ahad. Allaahus-samad. Lam yalid wa lam yoolad. Wa lam yakul-lahu kufuwan ahad.',
  'Coran 112:1-4',
  3,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Dou''a du soir - Protection complète',
  'اللَّهُمَّ إِنَّي أَسْأَلُكَ الْعَافِيَةَ فَي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنَّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فَي دَينَي وَدُنْيَايَ وَأَهْلَي وَمَالَي، اللَّهُمَّ اسْتُرْ عَوْرَاتَي وَآمِنْ رَوْعَاتَي',
  'O Allah, I ask You for well-being in this world and the Hereafter. O Allah, I ask You for pardon and well-being in my religious and worldly affairs, and my family and my wealth. O Allah, conceal my faults and calm my fears.',
  'Ô Allah, je Te demande le bien-être dans ce monde et dans l''au-delà. Ô Allah, je Te demande le pardon et le bien-être dans ma religion, ma vie d''ici-bas, ma famille et mes biens. Ô Allah, couvre mes défauts et apaise mes craintes.',
  'Allaahumma innee as''alukal-''aafiyata fid-dunyaa wal-aakhirah. Allaahumma innee as''alukal-''afwa wal-''aafiyata fee deenee wa dunyaaya wa ahlee wa maalee. Allaahum-mastur ''awraatee wa aamin raw''aatee.',
  'Sunan Abu Dawud 5074',
  1,
  4
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Dou''a du soir - Satisfaction',
  'رَضِينَا بِاللَّهِ رَبًّا وَبِالْإِسْلَامِ دَينًا وَبِمُحَمَّدٍ نَبِيًّا',
  'We are pleased with Allah as our Lord, Islam as our religion, and Muhammad as our Prophet.',
  'Nous agréons Allah comme Seigneur, l''Islam comme religion et Muhammad comme prophète.',
  'Radeenaa billaahi Rabbaa, wa bil-Islaami deenaa, wa bi-Muhammadin Nabiyyaa.',
  'Sunan Abu Dawud 5072',
  3,
  5
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'evening',
  'Dhikr du soir - SubhanAllah wa bihamdihi',
  'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
  'Glory is to Allah and praise is to Him.',
  'Gloire à Allah et louange à Lui.',
  'SubhaanAllaahi wa bihamdihi.',
  'Sahih Muslim 2692',
  100,
  6
);

-- ═══ AFTER_SALAH (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'after_salah',
  'Apres la priere - Istighfar',
  'أَسْتَغْفِرُ اللَّهَ',
  'I seek the forgiveness of Allah.',
  'Je demande pardon à Allah.',
  'Astaghfirullaah.',
  'Sahih Muslim 591',
  3,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'after_salah',
  'Apres la priere - Tasbih',
  'سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَاللَّهُ أَكْبَرُ',
  'Glory is to Allah, praise is to Allah, and Allah is the Greatest.',
  'Gloire à Allah, louange à Allah, et Allah est le Plus Grand.',
  'SubhaanAllaah, walhamdu lillaah, wallaahu Akbar.',
  'Sahih Muslim 595',
  33,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'after_salah',
  'Apres la priere - Tahlil',
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  'None has the right to be worshipped except Allah, alone, without partner. To Him belongs all sovereignty and praise and He is over all things omnipotent.',
  'Nul ne mérite d''être adoré sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est Omnipotent.',
  'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer.',
  'Sahih al-Bukhari 6330',
  1,
  3
);

-- ═══ SLEEP (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sleep',
  'Dou''a avant de dormir',
  'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
  'In Your name O Allah, I live and die.',
  'En Ton nom, ô Allah, je meurs et je vis.',
  'Bismikallahumma amootu wa ahyaa.',
  'Sahih al-Bukhari 6324',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sleep',
  'Sourate Al-Mulk avant de dormir',
  'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
  'Blessed is He in whose hand is dominion, and He is over all things competent.',
  'Béni soit Celui dans la main de qui est la royauté, et Il est Omnipotent.',
  'Tabaarakal-ladhee biyadihil-mulku wa Huwa ''alaa kulli shay''in Qadeer.',
  'Coran 67:1 - Sunan at-Tirmidhi 2891',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sleep',
  'Dou''a de protection pendant le sommeil',
  'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
  'O Allah, protect me from Your punishment on the Day You resurrect Your servants.',
  'Ô Allah, protège-moi de Ton châtiment le Jour où Tu ressusciteras Tes serviteurs.',
  'Allaahumma qinee ''adhaabaka yawma tab''athu ''ibaadak.',
  'Sunan Abu Dawud 5045',
  3,
  3
);

-- ═══ TRAVEL (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'travel',
  'Dou''a du voyage',
  'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ',
  'Glory to Him who has subjected this to us, and we could never have it (by our efforts). And verily, to our Lord we shall return.',
  'Gloire à Celui qui nous a soumis tout cela alors que nous n''étions pas capables de les dominer. Et c''est vers notre Seigneur que nous retournerons.',
  'Subhaanal-ladhee sakhkhara lanaa haadha wa maa kunnaa lahu muqrineen. Wa innaa ilaa Rabbinaa lamunqaliboon.',
  'Coran 43:13-14',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'travel',
  'Dou''a d''entree dans une ville',
  'اللَّهُمَّ رَبَّ السَّمَاوَاتِ السَّبْعِ وَمَا أَظْلَلْنَ وَرَبَّ الأَرَضِينَ السَّبْعِ وَمَا أَقْلَلْنَ وَرَبَّ الشَّيَاطِينِ وَمَا أَضْلَلْنَ وَرَبَّ الرِّيَاحِ وَمَا ذَرَيْنَ أَسْأَلُكَ خَيْرَ هَذِهِ الْقَرْيَةِ وَخَيْرَ أَهْلِهَا وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ أَهْلِهَا وَشَرِّ مَا فِيهَا',
  'O Allah, Lord of the seven heavens and all that they envelop, Lord of the seven earths and all that they carry, Lord of the devils and all whom they misguide, Lord of the winds and all whom they whisk away. I ask You for the goodness of this village and the goodness of its people, and I seek refuge in You from its evil and the evil of its people and the evil that is within it.',
  'Ô Allah, Seigneur des sept cieux et de tout ce qu''ils couvrent, Seigneur des sept terres et de tout ce qu''elles portent, Seigneur des démons et de tous ceux qu''ils égarent, Seigneur des vents et de tout ce qu''ils emportent. Je Te demande le bien de cette ville et le bien de ses habitants, et je cherche refuge auprès de Toi contre son mal, le mal de ses habitants et le mal qui s''y trouve.',
  'Allaahumma Rabbas-samaawaatis-sab''i wa maa adhlalna, wa Rabbal-aradeenas-sab''i wa maa aqlalna, wa Rabbash-shayaateeni wa maa adhlalna, wa Rabbar-riyaahi wa maa dharayna. As''aluka khayra haadhihil-qaryati wa khayra ahlihaa, wa a''oodhu bika min sharrihaa wa sharri ahlihaa wa sharri maa feehaa.',
  'Mustadrak al-Hakim 2/100, Ibn as-Sunni 524',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'travel',
  'Dou''a du retour de voyage',
  'آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ',
  'We return repentant, worshipping, and praising our Lord.',
  'Nous revenons repentants, adorant et louant notre Seigneur.',
  'Aayiboona, taa''iboona, ''aabidoona, li Rabbinaa haamidoon.',
  'Sahih al-Bukhari 1797',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'travel',
  'Dou''a de protection en voyage',
  'اللَّهُمَّ إِنَّا نَسْأَلُكَ فَي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى',
  'O Allah, we ask You on this journey for righteousness, piety, and deeds which please You.',
  'Ô Allah, nous Te demandons dans ce voyage la piété, la crainte révérencielle et des œuvres qui Te satisfassent.',
  'Allaahumma innaa nas''aluka fee safarinaa haadhal-birra wat-taqwaa, wa minal-''amali maa tardaa.',
  'Sahih Muslim 1342',
  1,
  4
);

-- ═══ FOOD (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'food',
  'Avant de manger',
  'بِسْمِ اللَّهِ',
  'In the name of Allah.',
  'Au nom d''Allah.',
  'Bismillaah.',
  'Sahih al-Bukhari 5376',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'food',
  'Apres avoir mange',
  'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
  'Praise is to Allah who has fed me this and provided it for me without any power or might from myself.',
  'Louange à Allah qui m''a nourri de ceci et me l''a accordé sans force ni puissance de ma part.',
  'Alhamdu lillaahil-ladhee at''amanee haadhaa wa razaqaneehi min ghayri hawlin minnee wa laa quwwah.',
  'Sunan at-Tirmidhi 3458',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'food',
  'Dou''a en cas d''oubli de Bismillah',
  'بِسْمِ اللَّهِ أَوَّلَهُ وَآخِرَهُ',
  'In the name of Allah at its beginning and at its end.',
  'Au nom d''Allah à son début et à sa fin.',
  'Bismillaahi awwalahu wa aakhirah.',
  'Sunan Abu Dawud 3767',
  1,
  3
);

-- ═══ PROTECTION (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'protection',
  'Dou''a de protection contre le mal',
  'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
  'I seek refuge in the perfect words of Allah from the evil of what He has created.',
  'Je cherche refuge dans les paroles parfaites d''Allah contre le mal de ce qu''Il a créé.',
  'A''oodhu bikalimaatillaahit-taammaati min sharri maa khalaq.',
  'Sahih Muslim 2708',
  3,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'protection',
  'Les deux sourates protectrices - Al-Falaq',
  'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ',
  'Say, "I seek refuge in the Lord of daybreak, from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots, and from the evil of an envier when he envies."',
  'Dis : "Je cherche protection auprès du Seigneur de l''aube naissante, contre le mal des êtres qu''Il a créés, contre le mal de l''obscurité quand elle s''approfondit, contre le mal de celles qui soufflent sur les noeuds, et contre le mal de l''envieux quand il envie."',
  'Qul a''oodhu birabbil-falaq. Min sharri maa khalaq. Wa min sharri ghaasiqin idhaa waqab. Wa min sharrin-naffaathaati fil-''uqad. Wa min sharri haasidin idhaa hasad.',
  'Coran 113:1-5',
  3,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'protection',
  'Sourate An-Nas',
  'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ',
  'Say, "I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the retreating whisperer, who whispers in the breasts of mankind, among jinn and among mankind."',
  'Dis : "Je cherche protection auprès du Seigneur des hommes, le Souverain des hommes, Dieu des hommes, contre le mal du mauvais conseiller, furtif, qui souffle le mal dans les poitrines des hommes, qu''il soit djinn ou humain."',
  'Qul a''oodhu birabbin-naas. Malikin-naas. Ilaahin-naas. Min sharril-waswaasil-khannaas. Alladhee yuwaswisu fee sudoorin-naas. Minal-jinnati wannaas.',
  'Coran 114:1-6',
  3,
  3
);

-- ═══ FORGIVENESS (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'forgiveness',
  'Istighfar - Demande de pardon',
  'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
  'I seek the forgiveness of Allah the Mighty, whom there is none worthy of worship except Him, the Living, the Self-Sustaining, and I turn to Him in repentance.',
  'Je demande pardon à Allah le Magnifique, celui dont il n''y a de divinité digne d''adoration que Lui, le Vivant, le Subsistant, et je me repens à Lui.',
  'Astaghfirullaahal-''Adheem alladhee laa ilaaha illaa Huwal-Hayyul-Qayyoomu wa atoobu ilayh.',
  'Sunan Abu Dawud 1517',
  3,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'forgiveness',
  'Dou''a du repentir',
  'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
  'My Lord, forgive me and accept my repentance. Indeed, You are the Accepting of Repentance, the Merciful.',
  'Seigneur, pardonne-moi et accepte mon repentir. Certes, Tu es Celui qui accepte le repentir, le Miséricordieux.',
  'Rabbighfir lee wa tub ''alayya innaka Antat-Tawwaabur-Raheem.',
  'Sunan at-Tirmidhi 3434',
  100,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'forgiveness',
  'Dou''a du prophète Adam',
  'رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
  'Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers.',
  'Notre Seigneur, nous nous sommes fait du tort à nous-mêmes. Et si Tu ne nous pardonnes pas et ne nous fais pas miséricorde, nous serons certes parmi les perdants.',
  'Rabbanaa dhalamnaa anfusanaa wa il-lam taghfir lanaa wa tarhamnaa lanakoonanna minal-khaasireen.',
  'Coran 7:23',
  3,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'forgiveness',
  'Dou''a du prophète Yunus',
  'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنَّي كُنْتُ مِنَ الظَّالِمِينَ',
  'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
  'Pas de divinité à part Toi ! Gloire à Toi ! J''étais vraiment du nombre des injustes.',
  'Laa ilaaha illaa Anta, subhaanaka innee kuntu minadh-dhaalimeen.',
  'Coran 21:87, Sunan at-Tirmidhi 3505',
  3,
  4
);

-- ═══ DAILY (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'daily',
  'Dou''a en sortant de la maison',
  'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'In the name of Allah, I place my trust in Allah, and there is no might or power except with Allah.',
  'Au nom d''Allah, je place ma confiance en Allah, et il n''y a de force et de puissance qu''en Allah.',
  'Bismillaahi tawakkaltu ''alallaahi laa hawla wa laa quwwata illaa billaah.',
  'Sunan Abu Dawud 5095',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'daily',
  'Dou''a en entrant dans la maison',
  'بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى رَبِّنَا تَوَكَّلْنَا',
  'In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust.',
  'Au nom d''Allah nous entrons et au nom d''Allah nous sortons, et en notre Seigneur nous plaçons notre confiance.',
  'Bismillaahi walajnaa, wa bismillaahi kharajnaa, wa ''alaa Rabbinaa tawakkalnaa.',
  'Sunan Abu Dawud 5096',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'daily',
  'Dou''a en entrant aux toilettes',
  'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
  'O Allah, I seek refuge in You from the male and female unclean spirits.',
  'Ô Allah, je cherche refuge auprès de Toi contre les mauvais esprits mâles et femelles.',
  'Allaahumma innee a''oodhu bika minal-khubthi wal-khabaa''ith.',
  'Sahih al-Bukhari 142',
  1,
  3
);

-- ═══ QURAN (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'quran',
  'Dou''a d''ouverture du Coran',
  'اللَّهُمَّ انْفَعْنِي بِمَا عَلَّمْتَنِي وَعَلِّمْنِي مَا يَنْفَعُنِي وَزِدْنِي عِلْمًا',
  'O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge.',
  'Ô Allah, fais-moi tirer profit de ce que Tu m''as enseigné, enseigne-moi ce qui me sera utile et augmente-moi en science.',
  'Allaahum-manfa''nee bimaa ''allamtanee wa ''allimnee maa yanfa''unee wa zidnee ''ilmaa.',
  'Sunan at-Tirmidhi 3599',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'quran',
  'Dou''a pour la comprehension du Coran',
  'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
  'My Lord, expand for me my chest, ease my task for me, and remove the impediment from my speech so they may understand my words.',
  'Seigneur, ouvre-moi ma poitrine, facilite-moi ma mission, et dénoue un noeud en ma langue afin qu''ils comprennent mes paroles.',
  'Rabbish-rahlee sadree, wa yassir lee amree, wahlul ''uqdatam-mil-lisaanee yafqahoo qawlee.',
  'Coran 20:25-28',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'quran',
  'Dou''a pour ne pas oublier le Coran',
  'اللَّهُمَّ اجْعَلِ الْقُرْآنَ رَبِيعَ قَلْبَي وَنُورَ صَدْرَي وَجَلَاءَ حُزْنَي وَذَهَابَ هَمَّي',
  'O Allah, make the Quran the spring of my heart, the light of my chest, the departure of my sadness, and the relief of my anxiety.',
  'Ô Allah, fais du Coran le printemps de mon cœur, la lumière de ma poitrine, la dissipation de ma tristesse et la fin de mes soucis.',
  'Allaahummaj-''alil-Qur''aana rabee''a qalbee, wa noora sadree, wa jalaa''a huznee, wa dhahaaba hammee.',
  'Musnad Ahmad 1/391',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'quran',
  'Dou''a pour la guidance',
  'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
  'Guide us to the straight path, the path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.',
  'Guide-nous dans le droit chemin, le chemin de ceux que Tu as comblés de faveurs, non pas de ceux qui ont encouru Ta colère, ni des égarés.',
  'Ihdinas-siraatal-mustaqeem. Siraatal-ladheena an''amta ''alayhim, ghayril-maghdoobi ''alayhim wa lad-daaalleen.',
  'Coran 1:6-7',
  1,
  4
);

-- ═══ RABBANA (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'rabbana',
  'Rabbana - Bonte ici-bas et dans l''au-dela',
  'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
  'Notre Seigneur, accorde-nous belle part ici-bas, et belle part aussi dans l''au-delà ; et protège-nous du châtiment du Feu.',
  'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa ''adhaaban-naar.',
  'Coran 2:201',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'rabbana',
  'Rabbana - Patience et fermete',
  'رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا وَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
  'Our Lord, pour upon us patience and plant firmly our feet and give us victory over the disbelieving people.',
  'Notre Seigneur, déverse sur nous l''endurance, affermis nos pas et donne-nous la victoire sur les gens mécréants.',
  'Rabbanaa afrigh ''alaynaa sabran wa thabbit aqdaamanaa wansurnaa ''alal-qawmil-kaafireen.',
  'Coran 2:250',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'rabbana',
  'Rabbana - Ne nous charge pas',
  'رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِينَا أَوْ أَخْطَأْنَا رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِنْ قَبْلِنَا رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا أَنْتَ مَوْلَانَا فَانْصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ',
  'Our Lord, do not impose blame upon us if we have forgotten or erred. Our Lord, and lay not upon us a burden like that which You laid upon those before us. Our Lord, and burden us not with that which we have no ability to bear. And pardon us; and forgive us; and have mercy upon us. You are our protector, so give us victory over the disbelieving people.',
  'Notre Seigneur, ne nous châtie pas si nous oublions ou si nous nous trompons. Notre Seigneur, ne nous charge pas d''un fardeau comme celui dont Tu as chargé ceux qui vécurent avant nous. Notre Seigneur, ne nous impose pas ce que nous ne pouvons supporter. Efface nos fautes, pardonne-nous et fais-nous miséricorde. Tu es notre Maître, accorde-nous la victoire sur les gens mécréants.',
  'Rabbanaa laa tu''aakhidhnaa in naseenaa aw akhta''naa. Rabbanaa wa laa tahmil ''alaynaa isran kamaa hamaltahu ''alal-ladheena min qablinaa. Rabbanaa wa laa tuhammilnaa maa laa taaqata lanaa bih. Wa''fu ''annaa, waghfir lanaa, warhamnaa. Anta Mawlaanaa fansurnaa ''alal-qawmil-kaafireen.',
  'Coran 2:286',
  1,
  3
);

-- ═══ MISC (2 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'misc',
  'Dou''a pour soulager l''angoisse',
  'لَا إِلَهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ لَا إِلَهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ لَا إِلَهَ إِلَّا اللَّهُ رَبُّ السَّمَوَاتِ وَرَبُّ الأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
  'None has the right to be worshipped except Allah, the Mighty, the Forbearing. None has the right to be worshipped except Allah, Lord of the Magnificent Throne. None has the right to be worshipped except Allah, Lord of the heavens, Lord of the earth, and Lord of the Noble Throne.',
  'Nul ne mérite d''être adoré sauf Allah, le Magnifique, l''Indulgent. Nul ne mérite d''être adoré sauf Allah, le Seigneur du Trône Magnifique. Nul ne mérite d''être adoré sauf Allah, Seigneur des cieux, Seigneur de la terre et Seigneur du Trône Noble.',
  'Laa ilaaha illallaahul-''Adheemul-Haleem. Laa ilaaha illallaahu Rabbul-''Arshil-''Adheem. Laa ilaaha illallaahu Rabbus-samaawaati wa Rabbul-ardi wa Rabbul-''Arshil-Kareem.',
  'Sahih al-Bukhari 6346',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'misc',
  'Dou''a en cas de difficulte',
  'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
  'O Allah, nothing is easy except what You make easy, and You make the difficult easy if it be Your Will.',
  'Ô Allah, rien n''est facile sauf ce que Tu rends facile, et Tu rends le difficile facile si Tu le veux.',
  'Allaahumma laa sahla illaa maa ja''altahu sahlaa, wa Anta taj''alul-hazna idhaa shi''ta sahlaa.',
  'Ibn Hibban 2427',
  1,
  2
);

-- ═══ WAKING_UP (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'waking_up',
  'Dou''a au réveil',
  'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
  'All praise is for Allah who gave us life after having taken it from us, and unto Him is the resurrection.',
  'Louange à Allah qui nous a redonné la vie après nous avoir fait mourir, et vers Lui est la résurrection.',
  'Alhamdu lillaahil-ladhee ahyaanaa ba''da maa amaatanaa wa ilayhin-nushoor.',
  'Sahih al-Bukhari 6312',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'waking_up',
  'Dou''a au réveil - Témoignage',
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، سُبْحَانَ اللَّهِ، وَالْحَمْدُ لِلَّهِ، وَلَا إِلَهَ إِلَّا اللَّهُ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
  'None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He is over all things capable. Glory is to Allah, praise is to Allah, none has the right to be worshipped except Allah, Allah is the Greatest, and there is no might or power except with Allah.',
  'Nul ne mérite d''être adoré sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est Omnipotent. Gloire à Allah, louange à Allah, nul ne mérite d''être adoré sauf Allah, Allah est le Plus Grand, et il n''y a de force et de puissance qu''en Allah.',
  'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer. SubhaanAllaah, walhamdu lillaah, wa laa ilaaha illallaah, wallaahu Akbar, wa laa hawla wa laa quwwata illaa billaah.',
  'Sahih al-Bukhari 1154',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'waking_up',
  'Dou''a au réveil - Louange',
  'الْحَمْدُ لِلَّهِ الَّذِي عَافَانَي فَي جَسَدَي، وَرَدَّ عَلَيَّ رُوحَي، وَأَذِنَ لَي بِذِكْرِهِ',
  'All praise is for Allah who restored to me my health and returned my soul and has allowed me to remember Him.',
  'Louange à Allah qui m''a rendu la santé dans mon corps, m''a retourné mon âme et m''a permis de Le mentionner.',
  'Alhamdu lillaahil-ladhee ''aafaanee fee jasadee, wa radda ''alayya roohee, wa adhina lee bi-dhikrih.',
  'Sunan at-Tirmidhi 3401',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'waking_up',
  'Dou''a au réveil la nuit',
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، الْحَمْدُ لِلَّهِ، وَسُبْحَانَ اللَّهِ، وَاللَّهُ أَكْبَرُ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ، اللَّهُمَّ اغْفِرْ لَي',
  'None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He is over all things capable. Praise is to Allah, glory is to Allah, Allah is the Greatest, and there is no might or power except with Allah. O Allah, forgive me.',
  'Nul ne mérite d''être adoré sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est Omnipotent. Louange à Allah, gloire à Allah, Allah est le Plus Grand, et il n''y a de force et de puissance qu''en Allah. Ô Allah, pardonne-moi.',
  'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer. Alhamdu lillaah, wa SubhaanAllaah, wallaahu Akbar, wa laa hawla wa laa quwwata illaa billaah. Allaahum-maghfir lee.',
  'Sahih al-Bukhari 1154',
  1,
  4
);

-- ═══ WUDU (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'wudu',
  'Dou''a avant les ablutions',
  'بِسْمِ اللَّهِ',
  'In the name of Allah.',
  'Au nom d''Allah.',
  'Bismillaah.',
  'Sunan Abu Dawud 101, Sunan at-Tirmidhi 25',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'wudu',
  'Dou''a après les ablutions',
  'أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
  'I bear witness that none has the right to be worshipped except Allah, alone, without partner, and I bear witness that Muhammad is His slave and Messenger.',
  'J''atteste que nul ne mérite d''être adoré sauf Allah, Seul, sans associé, et j''atteste que Muhammad est Son serviteur et Son messager.',
  'Ash-hadu al-laa ilaaha illallaahu wahdahu laa shareeka lah, wa ash-hadu anna Muhammadan ''abduhu wa Rasooluhu.',
  'Sahih Muslim 234',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'wudu',
  'Dou''a complète après les ablutions',
  'اللَّهُمَّ اجْعَلْنَي مِنَ التَّوَّابِينَ وَاجْعَلْنَي مِنَ الْمُتَطَهِّرِينَ',
  'O Allah, make me of those who turn to You in repentance and make me of those who are purified.',
  'Ô Allah, fais de moi l''un de ceux qui se repentent et fais de moi l''un de ceux qui se purifient.',
  'Allaahummaj-''alnee minat-tawwaabeena waj-''alnee minal-mutatah-hireen.',
  'Sunan at-Tirmidhi 55',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'wudu',
  'Dou''a de lumière après les ablutions',
  'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
  'How perfect You are O Allah, and I praise You. I bear witness that none has the right to be worshipped except You. I seek Your forgiveness and turn in repentance to You.',
  'Gloire à Toi, ô Allah, et louange à Toi. J''atteste que nul ne mérite d''être adoré sauf Toi. Je Te demande pardon et je me repens à Toi.',
  'SubhaanakAllaahumma wa bihamdika, ash-hadu al-laa ilaaha illaa Anta, astaghfiruka wa atoobu ilayk.',
  'Sunan an-Nasa''i 9909',
  1,
  4
);

-- ═══ MASJID (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'masjid',
  'Dou''a en entrant à la mosquée',
  'اللَّهُمَّ افْتَحْ لَي أَبْوَابَ رَحْمَتِكَ',
  'O Allah, open for me the gates of Your mercy.',
  'Ô Allah, ouvre-moi les portes de Ta miséricorde.',
  'Allaahummaf-tah lee abwaaba rahmatik.',
  'Sahih Muslim 713',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'masjid',
  'Dou''a en sortant de la mosquée',
  'اللَّهُمَّ إِنَّي أَسْأَلُكَ مِنْ فَضْلِكَ',
  'O Allah, I ask You of Your bounty.',
  'Ô Allah, je Te demande de Ta grâce.',
  'Allaahumma innee as''aluka min fadlik.',
  'Sahih Muslim 713',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'masjid',
  'Dou''a complète d''entrée à la mosquée',
  'أَعُوذُ بِاللَّهِ الْعَظِيمِ وَبِوَجْهِهِ الْكَرِيمِ وَسُلْطَانِهِ الْقَدِيمِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
  'I seek refuge in Allah the Almighty, and in His Noble Face, and in His eternal power, from Satan the accursed.',
  'Je cherche refuge auprès d''Allah le Tout-Puissant, en Son Noble Visage et en Son pouvoir éternel, contre Satan le maudit.',
  'A''oodhu billaahil-''Adheem, wa bi-wajhihil-Kareem, wa sultaanihil-qadeem, minash-shaytaanir-rajeem.',
  'Sunan Abu Dawud 466',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'masjid',
  'Salat ''ala an-Nabi en entrant',
  'بِسْمِ اللَّهِ وَالصَّلَاةُ وَالسَّلَامُ عَلَى رَسُولِ اللَّهِ',
  'In the name of Allah, and peace and blessings be upon the Messenger of Allah.',
  'Au nom d''Allah, et que la prière et le salut soient sur le Messager d''Allah.',
  'Bismillaah, was-salaatu was-salaamu ''alaa Rasoolillaah.',
  'Sunan Abu Dawud 465',
  1,
  4
);

-- ═══ SICKNESS (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sickness',
  'Dou''a de guérison',
  'اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافَي لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
  'O Allah, Lord of mankind, remove the illness, cure the disease. You are the One who cures, there is no cure except Your cure, a cure that leaves no disease.',
  'Ô Allah, Seigneur des hommes, ôte le mal, guéris. Tu es le Guérisseur, il n''y a de guérison que Ta guérison, une guérison qui ne laisse aucune maladie.',
  'Allaahumma Rabban-naas, adh-hibil-ba''s, ishfi Antash-Shaafee laa shifaa''a illaa shifaa''uk, shifaa''an laa yughaadiru saqamaa.',
  'Sahih al-Bukhari 5675',
  3,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sickness',
  'Dou''a en visitant un malade',
  'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ',
  'Do not worry, it will be a purification (for you), Allah willing.',
  'Pas de mal, ce sera une purification si Allah le veut.',
  'Laa ba''sa, tahoorun in shaa''Allaah.',
  'Sahih al-Bukhari 3616',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sickness',
  'Dou''a pour placer sa main sur la douleur',
  'بِسْمِ اللَّهِ، أَعُوذُ بِعِزَّةِ اللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
  'In the name of Allah, I seek refuge in Allah''s might and power from the evil of what I feel and what I fear.',
  'Au nom d''Allah, je cherche refuge dans la puissance d''Allah et Son pouvoir contre le mal de ce que je ressens et de ce que je crains.',
  'Bismillaah, a''oodhu bi''izzatillaahi wa qudratihi min sharri maa ajidu wa uhaadhir.',
  'Sahih Muslim 2202',
  7,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'sickness',
  'Dou''a de Ruqya',
  'أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ',
  'I ask Allah the Almighty, Lord of the Magnificent Throne, to cure you.',
  'Je demande à Allah le Tout-Puissant, Seigneur du Trône Magnifique, de te guérir.',
  'As''alullaahal-''Adheema Rabbal-''Arshil-''Adheemi an yashfiyak.',
  'Sunan at-Tirmidhi 2083',
  7,
  4
);

-- ═══ HAJJ_UMRAH (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'hajj_umrah',
  'Talbiyah du Hajj et de la Umrah',
  'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
  'Here I am, O Allah, here I am. Here I am, You have no partner, here I am. Indeed, all praise, grace, and sovereignty belong to You. You have no partner.',
  'Me voici, ô Allah, me voici. Me voici, Tu n''as aucun associé, me voici. Certes, la louange, la grâce et la royauté T''appartiennent. Tu n''as aucun associé.',
  'Labbayk-Allaahumma labbayk, labbayka laa shareeka laka labbayk. Innal-hamda wan-ni''mata laka wal-mulk, laa shareeka lak.',
  'Sahih al-Bukhari 1549, Sahih Muslim 1184',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'hajj_umrah',
  'Dou''a lors du Tawaf',
  'رَبَّنَا آتِنَا فَي الدُّنْيَا حَسَنَةً وَفَي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
  'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
  'Notre Seigneur, accorde-nous belle part ici-bas, et belle part aussi dans l''au-delà, et protège-nous du châtiment du Feu.',
  'Rabbanaa aatinaa fid-dunyaa hasanatan wa fil-aakhirati hasanatan wa qinaa ''adhaaban-naar.',
  'Coran 2:201, Sahih Muslim 1218',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'hajj_umrah',
  'Dou''a sur le mont Safa et Marwa',
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ، أَنْجَزَ وَعْدَهُ وَنَصَرَ عَبْدَهُ وَهَزَمَ الْأَحْزَابَ وَحْدَهُ',
  'None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He is over all things capable. None has the right to be worshipped except Allah alone. He fulfilled His promise, aided His servant, and defeated the confederates alone.',
  'Nul ne mérite d''être adoré sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est Omnipotent. Nul ne mérite d''être adoré sauf Allah Seul. Il a tenu Sa promesse, secouru Son serviteur et défait les coalisés Seul.',
  'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer. Laa ilaaha illallaahu wahdah, anjaza wa''dah, wa nasara ''abdah, wa hazamal-ahzaaba wahdah.',
  'Sahih Muslim 1218',
  3,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'hajj_umrah',
  'Dou''a le jour de ''Arafah',
  'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
  'None has the right to be worshipped except Allah, alone, without partner. To Him belongs sovereignty and praise, and He is over all things capable.',
  'Nul ne mérite d''être adoré sauf Allah, Seul, sans associé. A Lui la royauté, à Lui la louange et Il est Omnipotent.',
  'Laa ilaaha illallaahu wahdahu laa shareeka lah, lahul-mulku wa lahul-hamdu wa Huwa ''alaa kulli shay''in Qadeer.',
  'Sunan at-Tirmidhi 3585',
  1,
  4
);

-- ═══ MARRIAGE (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'marriage',
  'Dou''a pour les mariés',
  'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فَي خَيْرٍ',
  'May Allah bless you, and shower His blessings upon you, and bring you together in goodness.',
  'Qu''Allah te bénisse, répande Ses bénédictions sur toi et vous réunisse dans le bien.',
  'BaarakAllaahu lak, wa baaraka ''alayk, wa jama''a baynakumaa fee khayr.',
  'Sunan at-Tirmidhi 1091',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'marriage',
  'Dou''a de la nuit de noces',
  'اللَّهُمَّ إِنَّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا جَبَلْتَهَا عَلَيْهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا جَبَلْتَهَا عَلَيْهِ',
  'O Allah, I ask You for her goodness and the goodness upon which You have created her, and I seek refuge in You from her evil and the evil upon which You have created her.',
  'Ô Allah, je Te demande son bien et le bien sur lequel Tu l''as créée, et je cherche refuge auprès de Toi contre son mal et le mal sur lequel Tu l''as créée.',
  'Allaahumma innee as''aluka khayrahaa wa khayra maa jabaltahaa ''alayh, wa a''oodhu bika min sharrihaa wa sharri maa jabaltahaa ''alayh.',
  'Sunan Abu Dawud 2160',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'marriage',
  'Dou''a pour un bon conjoint',
  'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
  'Our Lord, grant us from among our spouses and offspring comfort to our eyes and make us an example for the righteous.',
  'Notre Seigneur, fais que nos épouses et nos descendants soient la joie de nos yeux, et fais de nous un guide pour les pieux.',
  'Rabbanaa hab lanaa min azwaajinaa wa dhurriyyaatinaa qurrata a''yunin waj-''alnaa lil-muttaqeena imaamaa.',
  'Coran 25:74',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'marriage',
  'Dou''a d''Istikhara pour le mariage',
  'اللَّهُمَّ إِنَّي أَسْتَخِيرُكَ بِعِلْمِكَ وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ',
  'O Allah, I seek Your guidance by virtue of Your knowledge, and I seek ability by virtue of Your power, and I ask You of Your great bounty.',
  'Ô Allah, je Te consulte par Ta science, je Te demande la capacité par Ta puissance et je Te demande de Ta grâce immense.',
  'Allaahumma innee astakheeruka bi-''ilmik, wa astaqdiruka bi-qudratik, wa as''aluka min fadlikal-''adheem.',
  'Sahih al-Bukhari 1162',
  1,
  4
);

-- ═══ WEATHER (5 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'weather',
  'Dou''a quand il pleut',
  'اللَّهُمَّ صَيِّبًا نَافِعًا',
  'O Allah, let it be a beneficial rain.',
  'Ô Allah, fais que ce soit une pluie bénéfique.',
  'Allaahumma sayyiban naafi''aa.',
  'Sahih al-Bukhari 1032',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'weather',
  'Dou''a après la pluie',
  'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ',
  'We have been given rain by the grace and mercy of Allah.',
  'Il a plu par la grâce et la miséricorde d''Allah.',
  'Mutirnaa bi-fadlillaahi wa rahmatih.',
  'Sahih al-Bukhari 846',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'weather',
  'Dou''a en entendant le tonnerre',
  'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
  'Glory is to Him whom the thunder glorifies with His praise, and the angels from fear of Him.',
  'Gloire à Celui que le tonnerre glorifie par Sa louange, ainsi que les anges par crainte de Lui.',
  'Subhaanal-ladhee yusabbihur-ra''du bihamdihi wal-malaa''ikatu min kheefatih.',
  'Muwatta Malik 3641',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'weather',
  'Dou''a en cas de vent fort',
  'اللَّهُمَّ إِنَّي أَسْأَلُكَ خَيْرَهَا وَخَيْرَ مَا فَيهَا وَخَيْرَ مَا أُرْسِلَتْ بِهِ، وَأَعُوذُ بِكَ مِنْ شَرِّهَا وَشَرِّ مَا فَيهَا وَشَرِّ مَا أُرْسِلَتْ بِهِ',
  'O Allah, I ask You for its goodness, the goodness within it, and the goodness it was sent with. And I seek refuge in You from its evil, the evil within it, and the evil it was sent with.',
  'Ô Allah, je Te demande son bien, le bien qu''il contient et le bien avec lequel il a été envoyé. Et je cherche refuge auprès de Toi contre son mal, le mal qu''il contient et le mal avec lequel il a été envoyé.',
  'Allaahumma innee as''aluka khayrahaa wa khayra maa feehaa wa khayra maa ursilat bih, wa a''oodhu bika min sharrihaa wa sharri maa feehaa wa sharri maa ursilat bih.',
  'Sahih Muslim 899',
  1,
  4
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'weather',
  'Dou''a en cas de pluie excessive',
  'اللَّهُمَّ حَوَالَيْنَا وَلَا عَلَيْنَا',
  'O Allah, around us and not upon us.',
  'Ô Allah, autour de nous et pas sur nous.',
  'Allaahumma hawaalainaa wa laa ''alaynaa.',
  'Sahih al-Bukhari 1013',
  1,
  5
);

-- ═══ ANXIETY (5 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'anxiety',
  'Dou''a contre l''anxiété et la tristesse',
  'اللَّهُمَّ إِنَّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ وَغَلَبَةِ الرِّجَالِ',
  'O Allah, I seek refuge in You from worry and grief, from helplessness and laziness, from cowardice and stinginess, and from being heavily in debt and from being overpowered by men.',
  'Ô Allah, je cherche refuge auprès de Toi contre les soucis et la tristesse, l''incapacité et la paresse, l''avarice et la lâcheté, le fardeau des dettes et la domination des hommes.',
  'Allaahumma innee a''oodhu bika minal-hammi wal-hazan, wal-''ajzi wal-kasal, wal-bukhli wal-jubn, wa dala''id-dayni wa ghalabatir-rijaal.',
  'Sahih al-Bukhari 6369',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'anxiety',
  'Dou''a de détresse',
  'لَا إِلَهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنَّي كُنْتُ مِنَ الظَّالِمِينَ',
  'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
  'Pas de divinité à part Toi ! Gloire à Toi ! J''étais vraiment du nombre des injustes.',
  'Laa ilaaha illaa Anta, subhaanaka innee kuntu minadh-dhaalimeen.',
  'Coran 21:87, Sunan at-Tirmidhi 3505',
  3,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'anxiety',
  'Dou''a en cas d''affliction',
  'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنَي فَي مُصَيبَتَي وَاخْلُفْ لَي خَيْرًا مِنْهَا',
  'Indeed we belong to Allah, and indeed to Him we will return. O Allah, reward me in my affliction and replace it with something better.',
  'Certes, nous appartenons à Allah et c''est vers Lui que nous retournerons. Ô Allah, récompense-moi dans mon malheur et remplace-le par quelque chose de meilleur.',
  'Innaa lillaahi wa innaa ilayhi raaji''oon. Allaahumma''-jurnee fee museebatee wakhluf lee khayran minhaa.',
  'Sahih Muslim 918',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'anxiety',
  'Dou''a complète contre la détresse',
  'اللَّهُمَّ إِنَّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتَي بِيَدِكَ، مَاضٍ فَيَّ حُكْمُكَ، عَدْلٌ فَيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبَيعَ قَلْبَي وَنُورَ صَدْرَي وَجَلَاءَ حُزْنَي وَذَهَابَ هَمَّي',
  'O Allah, I am Your servant, son of Your servant, son of Your maidservant. My forelock is in Your hand. Your command over me is forever executed and Your decree over me is just. I ask You by every name belonging to You which You have named Yourself with, that You make the Quran the life of my heart, the light of my chest, and the departure of my sorrow and relief of my distress.',
  'Ô Allah, je suis Ton serviteur, fils de Ton serviteur, fils de Ta servante. Mon toupet est dans Ta main. Ton commandement sur moi s''accomplit toujours et Ton décret sur moi est juste. Je Te demande par chaque nom qui T''appartient, par lequel Tu T''es nommé, de faire du Coran le printemps de mon cœur, la lumière de ma poitrine, la dissipation de ma tristesse et la fin de mes soucis.',
  'Allaahumma innee ''abduk, ibnu ''abdik, ibnu amatik. Naasiyatee biyadik, maadin fiyya hukmuk, ''adlun fiyya qadaa''uk. As''aluka bi kulli ismin huwa laka sammayta bihi nafsak, an taj''alal-Qur''aana rabee''a qalbee, wa noora sadree, wa jalaa''a huznee, wa dhahaaba hammee.',
  'Musnad Ahmad 1/391',
  1,
  4
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'anxiety',
  'Dou''a de confiance en Allah',
  'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
  'Allah is sufficient for us, and He is the best disposer of affairs.',
  'Allah nous suffit, Il est notre meilleur garant.',
  'HasbunAllaahu wa ni''mal-wakeel.',
  'Coran 3:173, Sahih al-Bukhari 4563',
  7,
  5
);

-- ═══ PARENTS (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'parents',
  'Dou''a pour les parents',
  'رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانَي صَغَيرًا',
  'My Lord, have mercy upon them as they brought me up [when I was] small.',
  'Seigneur, fais-leur miséricorde comme ils m''ont élevé lorsque j''étais petit.',
  'Rabbir-hamhumaa kamaa rabbayaanee sagheeraa.',
  'Coran 17:24',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'parents',
  'Dou''a de pardon pour les parents',
  'رَبَّنَا اغْفِرْ لَي وَلِوَالِدَيَّ وَلِلْمُؤْمِنَينَ يَوْمَ يَقُومُ الْحِسَابُ',
  'Our Lord, forgive me and my parents and the believers the Day the account is established.',
  'Notre Seigneur, pardonne-moi, ainsi qu''à mes parents et aux croyants, le Jour où se dressera le compte.',
  'Rabbanagh-fir lee wa liwaalidayya wa lil-mu''mineena yawma yaqoomul-hisaab.',
  'Coran 14:41',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'parents',
  'Dou''a pour la famille et la descendance',
  'رَبِّ أَوْزِعْنَي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتَي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ وَأَنْ أَعْمَلَ صَالِحًا تَرْضَاهُ وَأَصْلِحْ لَي فَي ذُرِّيَّتَي إِنَّي تُبْتُ إِلَيْكَ وَإِنَّي مِنَ الْمُسْلِمَينَ',
  'My Lord, enable me to be grateful for Your favor which You have bestowed upon me and upon my parents and to work righteousness of which You will approve and make righteous for me my offspring. Indeed, I have repented to You, and indeed, I am of the Muslims.',
  'Seigneur, inspire-moi de rendre grâce pour le bienfait dont Tu m''as comblé, ainsi que mes parents, et de faire le bien qui Te plaise. Améliore ma descendance. Je me repens à Toi et je suis parmi les musulmans.',
  'Rabbi awzi''nee an ashkura ni''matakal-latee an''amta ''alayya wa ''alaa waalidayya wa an a''mala saalihan tardaahu wa aslih lee fee dhurriyyatee. Innee tubtu ilayka wa innee minal-muslimeen.',
  'Coran 46:15',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'parents',
  'Dou''a d''Ibrahim pour ses parents',
  'رَبَّنَا اغْفِرْ لَي وَلِوَالِدَيَّ وَلِلْمُؤْمِنَينَ يَوْمَ يَقُومُ الْحِسَابُ',
  'Our Lord, forgive me and my parents and the believers the Day the account is established.',
  'Seigneur ! Pardonne-moi, ainsi qu''à mes père et mère et aux croyants, le Jour de la reddition des comptes.',
  'Rabbanagh-fir lee wa liwaalidayya wa lil-mu''mineena yawma yaqoomul-hisaab.',
  'Coran 14:41',
  1,
  4
);

-- ═══ DEATH (4 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'death',
  'Dou''a en apprenant un décès',
  'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
  'Indeed we belong to Allah, and indeed to Him we will return.',
  'Certes, nous appartenons à Allah et c''est vers Lui que nous retournerons.',
  'Innaa lillaahi wa innaa ilayhi raaji''oon.',
  'Coran 2:156',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'death',
  'Dou''a pour le défunt - Prière mortuaire',
  'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ',
  'O Allah, forgive him, have mercy on him, keep him safe and sound, and pardon him. Honor the place where he will stay and make wide his entrance.',
  'Ô Allah, pardonne-lui, fais-lui miséricorde, accorde-lui le salut et le pardon. Honore sa demeure et élargis son entrée.',
  'Allaahummagh-fir lahu warhamhu wa ''aafihi wa''fu ''anhu, wa akrim nuzulahu, wa wassi'' mudkhalahu.',
  'Sahih Muslim 963',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'death',
  'Dou''a pour fermer les yeux du défunt',
  'اللَّهُمَّ اغْفِرْ لِفُلَانٍ وَارْفَعْ دَرَجَتَهُ فَي الْمَهْدِيِّينَ، وَاخْلُفْهُ فَي عَقِبِهِ فَي الْغَابِرَينَ',
  'O Allah, forgive [name] and elevate his station among those who are guided. Send him along the path of those who came before, and forgive us and him, O Lord of the worlds.',
  'Ô Allah, pardonne à [nom] et élève son rang parmi les bien-guidés. Remplace-le auprès de ceux qu''il laisse et pardonne-nous et pardonne-lui, Seigneur des mondes.',
  'Allaahummagh-fir li-fulaanin warfa'' darajatahu fil-mahdiyyeen, wakhlufhu fee ''aqibihi fil-ghaabireen.',
  'Sahih Muslim 920',
  1,
  3
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'death',
  'Dou''a pour visiter les tombes',
  'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنَينَ وَالْمُسْلِمَينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
  'Peace be upon you, people of this abode, from among the believers and the Muslims. And we shall, Allah willing, join you. We ask Allah for well-being for us and for you.',
  'Paix sur vous, habitants de ces demeures, parmi les croyants et les musulmans. Et nous vous rejoindrons, si Allah le veut. Nous demandons à Allah le salut pour nous et pour vous.',
  'As-salaamu ''alaykum ahlad-diyaari minal-mu''mineena wal-muslimeen, wa innaa in shaa''Allaahu bikum laahiqoon. Nas''alullaaha lanaa wa lakumul-''aafiyah.',
  'Sahih Muslim 975',
  1,
  4
);

-- ═══ TOILET (3 duas) ═══
INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'toilet',
  'Dou''a en entrant aux toilettes',
  'بِسْمِ اللَّهِ، اللَّهُمَّ إِنَّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
  'In the name of Allah. O Allah, I seek refuge in You from the male and female unclean spirits.',
  'Au nom d''Allah. Ô Allah, je cherche refuge auprès de Toi contre les mauvais esprits mâles et femelles.',
  'Bismillaah. Allaahumma innee a''oodhu bika minal-khubuthi wal-khabaa''ith.',
  'Sahih al-Bukhari 142, Sahih Muslim 375',
  1,
  1
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'toilet',
  'Dou''a en sortant des toilettes',
  'غُفْرَانَكَ',
  'I seek Your forgiveness.',
  'Je Te demande pardon.',
  'Ghufraanak.',
  'Sunan Abu Dawud 30, Sunan at-Tirmidhi 7',
  1,
  2
);

INSERT INTO duas (category, title, arabic_text, english_text, french_text, transliteration, reference, repetitions, sort_order) VALUES (
  'toilet',
  'Dou''a de louange en sortant des toilettes',
  'الْحَمْدُ لِلَّهِ الَّذِي أَذْهَبَ عَنِّي الْأَذَى وَعَافَانَي',
  'All praise is for Allah who relieved me of the discomfort and granted me well-being.',
  'Louange à Allah qui m''a débarrassé de la nuisance et m''a accordé le bien-être.',
  'Alhamdu lillaahil-ladhee adh-haba ''annil-adhaa wa ''aafaanee.',
  'Sunan Ibn Majah 301',
  1,
  3
);

-- Total: 91 duas inserted
-- Verify: SELECT category, COUNT(*) FROM duas GROUP BY category ORDER BY category;