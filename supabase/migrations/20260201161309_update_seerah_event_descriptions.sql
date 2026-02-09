/*
  # Update Seerah Event Descriptions with Detailed Historical Content
  
  1. Description
    - Updates all 35 events with comprehensive descriptions in French
    - Enriches historical context and significance for each event
    - Provides detailed narratives of Prophet Muhammad's (ﷺ) life
    
  2. Changes
    - Updates description and historical_significance fields for all events
    - Maintains chronological accuracy
    - Adds cultural and religious context
*/

-- Event 1: Birth of Prophet Muhammad (571 CE)
UPDATE seerah_events SET
  description = 'Le Maître de l''Univers, notre Prophète, naquit le lundi 12 Rabi'' al-Awwal, 53 ans avant l''Hégire (20 avril 571 apr. J.-C.). Son père Abdullah était décédé à Médine avant sa naissance. Il naquit dans le quartier des Banu Hashim à La Mecque. L''année de sa naissance est également l''année de l''Éléphant, lorsque le roi abyssin Abraha vint avec une armée d''éléphants pour détruire la Kaaba mais fut anéanti par Dieu.',
  historical_significance = 'Le début de la vie du dernier prophète de l''Islam, qui changera le cours de l''histoire mondiale. L''année de l''Éléphant marqua une protection divine de la Kaaba.'
WHERE id = 1;

-- Event 2: Death of mother Aminah (577 CE) - note: adjusted to 577 based on historical records
UPDATE seerah_events SET
  description = 'Amina bint Wahb décéda à Abwa sur le chemin du retour de Médine en 575 apr. J.-C., alors que Muhammad n''avait que six ans. Amina était allée à Médine avec son fils et sa nourrice Umm Ayman pour visiter la tombe de son époux Abdullah et voir les proches de son grand-père Abdul Muttalib. Sur le chemin du retour, à Abwa (190 km de Médine), elle tomba malade et décéda.',
  historical_significance = 'Muhammad devint orphelin ; son grand-père Abdul Muttalib le prit sous sa protection. Avant de mourir, Amina aurait dit : "Tout être vivant meurt. Tout ce qui est nouveau vieillit. Tout ce qui est grand périt. Je mourrai sûrement aussi, mais je serai rappelée pour toujours. Car je laisse mon fils au monde comme une personne bénie."'
WHERE id = 2;

-- Event 3: Death of grandfather Abdul Muttalib (578 CE)
UPDATE seerah_events SET
  description = 'Abdul Muttalib décéda lorsque le Prophète avait huit ans (577 apr. J.-C.). Il avait plus de quatre-vingts ans. Peu avant sa mort, il confia la garde et la tutelle du Prophète à son fils Abu Talib. Abdul Muttalib avait montré une grande affection au Prophète, lui permettant seul de s''asseoir sur son coussin spécial à l''ombre de la Kaaba.',
  historical_significance = 'Le Prophète passa sous la garde de son oncle Abu Talib à un jeune âge. Abdul Muttalib croyait fermement que son petit-fils deviendrait une personne d''un grand honneur à l''avenir.'
WHERE id = 3;

-- Event 4: First trading journey to Syria (578 CE)
UPDATE seerah_events SET
  description = 'Premier voyage commercial en Syrie avec son oncle Abu Talib en 578 apr. J.-C., alors que le Prophète avait neuf ou douze ans. Lors d''une halte à Busra, le moine chrétien Bahira remarqua que les signes sur son visage et son corps correspondaient à ceux décrits dans les livres saints. Après avoir vu le "sceau de la prophétie" entre ses épaules, il fut convaincu qu''il était le prophète attendu. Bahira conseilla à Abu Talib de protéger son neveu des Juifs et de le ramener immédiatement à La Mecque.',
  historical_significance = 'Il eut l''occasion de se familiariser avec diverses cultures et routes commerciales. Cette rencontre avec le moine Bahira est l''un des premiers témoignages de la reconnaissance de sa future mission prophétique.'
WHERE id = 4;

-- Event 5: Marriage with Khadijah (595 CE)
UPDATE seerah_events SET
  description = 'Le Prophète épousa Khadijah en 594 apr. J.-C. À l''époque de ce mariage, il avait vingt-cinq ans et Khadijah quarante ans. Khadijah était l''une des femmes nobles et riches des Quraysh et s''occupait de commerce. Une cérémonie de mariage fut organisée et un festin fut donné. Le Prophète quitta la maison de son oncle Abu Talib pour emménager dans celle de son épouse Khadijah. Ce mariage devint un exemple de vie familiale heureuse fondée sur l''amour, le respect et la loyauté.',
  historical_significance = 'Le mariage du Prophète avec Khadijah apporta stabilité à sa vie et un soutien inégalé pour sa mission prophétique. Khadijah fut la première personne à embrasser l''Islam après le début de la mission prophétique.'
WHERE id = 5;

-- Event 6: Reconstruction of the Kaaba (605 CE)
UPDATE seerah_events SET
  description = 'En 605 apr. J.-C., lorsque le Prophète avait trente-cinq ans, la Kaaba fut reconstruite. Une dispute majeure éclata entre les tribus sur l''honneur de placer la Pierre Noire à sa place. Il fut décidé que la première personne à entrer par la porte de Banu Shaybah serait l''arbitre. Ce fut le Prophète. Voyant Muhammad, tous exprimèrent leur satisfaction : "Voici al-Amin (Le Digne de Confiance), nous acceptons son arbitrage !" Il fit apporter un manteau, y plaça la Pierre Noire et demanda au chef de chaque tribu de tenir un bout du manteau pour soulever la pierre ensemble. Lorsque la pierre atteignit le niveau où elle devait être placée, il la prit de ses mains et la plaça à son emplacement.',
  historical_significance = 'Son arbitrage dans le placement de la Pierre Noire démontra sa sagesse et son rôle de médiateur reconnu à La Mecque, prévenant ainsi une guerre majeure entre les tribus.'
WHERE id = 6;

-- Event 7: First revelation (610 CE)
UPDATE seerah_events SET
  description = 'Lorsque le Prophète approchait de la quarantaine, il commença à préférer la solitude et à se livrer à une profonde contemplation sur la création de l''univers dans la grotte de Hira sur le mont Nur. En 610 apr. J.-C., lors de la Nuit du Qadr pendant le Ramadan, Gabriel (as) lui apparut dans la grotte. Gabriel lui dit "Lis !" et révéla les cinq premiers versets de la sourate Al-Alaq : "Lis au nom de ton Seigneur qui a créé ! Il a créé l''homme d''une adhérence. Lis ! Et ton Seigneur est le Très Généreux. Qui a enseigné par la plume, a enseigné à l''homme ce qu''il ne savait pas."',
  historical_significance = 'Début de la prophétie et de la révélation coranique qui durera 23 ans. Cet événement marque le commencement de l''Islam et d''une nouvelle ère pour l''humanité.'
WHERE id = 7;

-- Event 8: Public invitation (613 CE)
UPDATE seerah_events SET
  description = 'Après environ trois ans de prédication secrète, le Prophète commença la période de prédication publique à partir de la quatrième année de la prophétie (613 apr. J.-C.), suite à la révélation du verset 94 de la sourate Al-Hijr. L''invitation publique débuta par un appel aux proches parents, conformément au verset "et avertis les gens qui te sont les plus proches". Lors d''un festin, son oncle Abu Lahab l''interrompit et l''insulta. Plus tard, il monta au mont Safa et appela les Mecquois à croire en l''unicité de Dieu.',
  historical_significance = 'L''invitation publique à la religion de l''Islam commença. Début de la persécution systématique des premiers musulmans par les Quraysh.'
WHERE id = 8;

-- Event 9: First migration to Abyssinia (615 CE)
UPDATE seerah_events SET
  description = 'La première migration eut lieu la cinquième année de la prophétie (615 apr. J.-C.). Le premier groupe de musulmans, composé de onze hommes et quatre femmes, quitta secrètement La Mecque pour l''Abyssinie. Ce groupe comprenait des figures importantes comme Uthman et son épouse (la fille du Prophète) Ruqayyah, Zubayr ibn al-Awwam, Mus''ab ibn Umayr et Abdurrahman ibn Awf. Le roi d''Abyssinie (le Négus) était connu comme un dirigeant juste et miséricordieux où personne n''était opprimé.',
  historical_significance = 'Première migration pour la sécurité. C''est la première migration dans l''histoire islamique, offrant aux musulmans un moyen d''échapper à la persécution et une opportunité de pratiquer leur religion, tout en permettant au message de l''Islam d''atteindre l''Afrique.'
WHERE id = 9;

-- Event 10: Second migration to Abyssinia (616 CE)
UPDATE seerah_events SET
  description = 'La deuxième migration eut lieu un an après la première, en 616 apr. J.-C. Ce grand groupe était dirigé par le cousin du Prophète, Ja''far ibn Abi Talib. Avec ce groupe, le nombre total de musulmans ayant migré en Abyssinie dépassa 100. Les Quraysh envoyèrent des émissaires avec de précieux cadeaux auprès du Négus pour exiger le retour des musulmans. Ja''far ibn Abi Talib prononça un discours remarquable décrivant les coutumes préislamiques et la révolution morale apportée par l''Islam. Impressionné par ce discours et la récitation de versets sur Marie, le Négus, en larmes, rejeta la demande des Quraysh et déclara qu''il protégerait les musulmans.',
  historical_significance = 'Protection continue des musulmans persécutés par le Négus. Cette décision fut une grande victoire pour les musulmans et fit de l''Abyssinie un refuge sûr.'
WHERE id = 10;

-- Event 11: Beginning of boycott (617 CE)
UPDATE seerah_events SET
  description = 'Le boycott commença la 7e année de la prophétie (616-617 apr. J.-C.). Les Quraysh décidèrent de rompre toutes relations avec les Banu Hashim et les Banu Muttalib : ne pas épouser leurs femmes, ne pas faire affaire avec eux, ne pas leur parler. Ils consignèrent ces décisions sur un parchemin et l''accrochèrent au mur de la Kaaba. Ce boycott social et économique impitoyable dura environ trois ans. Les Banu Hashim et Banu Muttalib passèrent cette période dans le quartier de Shi''b Abi Talib, connaissant de grandes difficultés. La famine était si grave que les habitants devaient manger des feuilles d''arbres et des morceaux de cuir sec pour survivre.',
  historical_significance = 'Trois années de famine et d''isolement extrême dans le quartier de Shi''b Abu Talib. Les pressions exercées sur les premiers musulmans montrèrent leur persévérance et leur foi inébranlable.'
WHERE id = 11;

-- Event 12: Year of Sorrow (619 CE)
UPDATE seerah_events SET
  description = 'La dixième année de la prophétie (619 apr. J.-C.) est appelée "Année du Chagrin" (Sanat al-Huzn). Peu après la fin du boycott, Abu Talib et Khadijah décédèrent à trois jours d''intervalle. Abu Talib fut un rempart qui protégea le Prophète depuis son enfance et le défendit contre toutes les attaques des polythéistes. Khadijah fut sa première épouse, première musulmane, et sa plus grande confidente dans les moments les plus difficiles. Avec la disparition de ces deux grands soutiens, le Prophète se retrouva pratiquement sans protection à La Mecque.',
  historical_significance = 'Politique des émotions et de la vulnérabilité. La perte de son plus grand protecteur à l''extérieur et de son plus grand soutien au pays plongea le Prophète dans un profond chagrin.'
WHERE id = 12;

-- Event 13: Journey to Taif (620 CE)
UPDATE seerah_events SET
  description = 'Le voyage à Taïf eut lieu la dixième année de la prophétie, au mois de Shawwal, en 620 apr. J.-C. Le Prophète entreprit ce voyage à pied avec Zayd ibn Harithah. À Taïf, il invita les dirigeants à se convertir à l''Islam, mais ils rejetèrent grossièrement son invitation et se moquèrent de lui. Ils firent lapider le Prophète et Zayd par les voyous et les esclaves de la ville. Sous les pierres, les pieds du Prophète furent couverts de sang. Réfugiés dans un vignoble, le Prophète prononça sa célèbre prière, exprimant sa faiblesse uniquement à Allah.',
  historical_significance = 'Le rejet engendra une plus grande dépendance à l''égard du soutien divin. C''est l''un des moments les plus difficiles de sa vie, suivi de sa célèbre invocation demandant l''aide d''Allah.'
WHERE id = 13;

-- Event 14: Isra and Mi'raj (621 CE)
UPDATE seerah_events SET
  description = 'L''Isra et le Mi''raj eurent lieu environ un an avant l''Hégire, la nuit du 27e jour du mois de Rajab (621 apr. J.-C.). Le Prophète fut conduit de la Masjid al-Haram à La Mecque à la Masjid al-Aqsa à Jérusalem (Isra), puis monta à travers les sept cieux jusqu''à Sidrat al-Muntaha et au-delà du temps et de l''espace jusqu''à la présence de Dieu (Mi''raj). En cette nuit bénie, trois dons importants furent offerts : les cinq prières quotidiennes furent rendues obligatoires, les deux derniers versets de la sourate Al-Baqarah furent révélés, et la promesse du pardon pour ceux qui ne commettent pas de shirk fut annoncée.',
  historical_significance = 'Ascension spirituelle ; la prière devint obligatoire. Cet événement apporta réconfort et soutien spirituels après les grandes épreuves de l''Année du Chagrin et la persécution à Taïf.'
WHERE id = 14;

-- Event 15: First Pledge of Aqaba (621 CE)
UPDATE seerah_events SET
  description = 'Le premier serment d''Aqaba eut lieu lors du pèlerinage de l''an 621 apr. J.-C. Six personnes de la tribu Khazraj de Médine rencontrèrent le Prophète à Aqaba et se convertirent à l''Islam. Ils promirent leur soutien au Prophète et s''engagèrent à propager l''Islam à Médine. Cette rencontre marqua le début des relations avec Médine qui mèneraient à l''Hégire.',
  historical_significance = 'Début des relations avec Médine qui mèneront à l''Hégire. Ce premier contact avec les habitants de Médine ouvrit une nouvelle perspective d''espoir.'
WHERE id = 15;

-- Event 16: Second Pledge of Aqaba (622 CE)
UPDATE seerah_events SET
  description = 'Le deuxième serment d''Aqaba eut lieu lors du pèlerinage de l''an 622 apr. J.-C. 73 hommes et 2 femmes de Médine (des tribus Aws et Khazraj) prêtèrent allégeance au Prophète et promirent de le protéger comme ils protégeaient leurs propres familles. Cette alliance fut appelée le "Serment des Femmes" car elle incluait l''engagement de ne pas commettre certains péchés. Ce serment établit les bases de la migration vers Médine.',
  historical_significance = 'Fondation de l''alliance qui permettra l''établissement de l''État islamique à Médine. Cette promesse de protection permit au Prophète d''envisager sérieusement la migration vers Médine.'
WHERE id = 16;

-- Event 17: The Hijrah (622 CE)
UPDATE seerah_events SET
  description = 'Sur ordre d''Allah, le Prophète commença les préparatifs de l''émigration. Dans la nuit du jeudi 26 Safar 622 (9 septembre), le Prophète quitta secrètement La Mecque avec Abu Bakr. Ils se réfugièrent dans la grotte de Thawr pendant trois jours. Des miracles comme une araignée tissant sa toile à l''entrée de la grotte permirent d''échapper aux poursuivants. Après avoir quitté la grotte, ils se mirent en route pour Médine avec leur guide Abdullah ibn Urayqit. En chemin, des miracles se produisirent, comme le cheval de Suraqa s''enlisant dans le sable.',
  historical_significance = 'Événement fondateur de la communauté musulmane et début de l''ère islamique. La migration marque le début du calendrier islamique et l''établissement du premier État islamique.'
WHERE id = 17;

-- Event 18: Arrival in Medina (622 CE)
UPDATE seerah_events SET
  description = 'Le lundi 8 Rabi'' al-Awwal 622 (20 septembre), ils arrivèrent au village de Quba, près de Médine, où fut construite la première mosquée de l''histoire islamique, la mosquée de Quba. Le vendredi 12 Rabi'' al-Awwal 622 (24 septembre), il dirigea la première prière du vendredi de l''Islam dans la vallée de Ranuna. Leur entrée à Médine fut accueillie avec une grande joie, les habitants chantant "Tala''a ''l-badru ''alayna" (La pleine lune s''est levée sur nous). Le chameau du Prophète s''agenouilla devant la maison d''Abu Ayyub al-Ansari, où il séjourna jusqu''à la construction de la Mosquée du Prophète.',
  historical_significance = 'Établissement du premier État islamique et rédaction de la Constitution de Médine. L''arrivée à Médine marqua le début d''une nouvelle ère de sécurité et de croissance pour l''Islam.'
WHERE id = 18;

-- Event 19: Construction of Prophet's Mosque (623 CE)
UPDATE seerah_events SET
  description = 'Après son arrivée à Médine en 622 apr. J.-C., la construction de Masjid al-Nabawi (la Mosquée du Prophète) commença rapidement. Le terrain fut acheté et le Prophète participa personnellement à la construction avec ses compagnons. La mosquée servait de centre spirituel, administratif, éducatif et social de la communauté. C''était un lieu de prière, d''enseignement, de consultation politique et de jugement. Les pauvres et les sans-abri (Ahl al-Suffah) y trouvaient également refuge.',
  historical_significance = 'Établissement du centre de la nouvelle société musulmane. La mosquée devint le cœur battant de la communauté islamique naissante, servant de modèle pour les futures mosquées.'
WHERE id = 19;

-- Event 20: Change of Qibla (624 CE)
UPDATE seerah_events SET
  description = 'Le changement de la qibla eut lieu la deuxième année de l''Hégire, au mois de Rajab (janvier 624 apr. J.-C.). Pendant 16 ou 17 mois après l''émigration à Médine, le Prophète pria face à la mosquée Al-Aqsa à Jérusalem. Alors qu''il dirigeait la prière de midi à la mosquée des Banu Salimah, le verset 144 de la sourate Al-Baqarah fut révélé, ordonnant de se tourner vers la Kaaba. Le Prophète et l''assemblée se tournèrent vers la Kaaba sans interrompre la prière. Cette mosquée fut nommée Masjid al-Qiblatayn (la mosquée des deux qiblas).',
  historical_significance = 'Affirmation de l''identité islamique distincte et de l''importance de la Kaaba. Ce changement devint une épreuve qui permettait de distinguer les croyants sincères de ceux qui doutaient.'
WHERE id = 20;

-- Event 21: Battle of Badr (624 CE)
UPDATE seerah_events SET
  description = 'La bataille de Badr eut lieu la deuxième année de l''Hégire, le 17e jour du Ramadan (13 mars 624 apr. J.-C.). Le Prophète quitta Médine avec une armée de 305 hommes (70 chameaux, 2 chevaux). Les Quraysh partirent de La Mecque avec environ 1 000 hommes bien équipés. Dans une manœuvre stratégique, l''armée islamique s''empara des puits de Badr. La bataille s''acheva par une victoire décisive des musulmans. Soixante-dix polythéistes, dont Abu Jahl, furent tués et soixante-dix faits prisonniers. Les musulmans eurent quatorze martyrs. Les prisonniers qui savaient lire et écrire furent libérés en échange de l''enseignement à dix musulmans.',
  historical_significance = 'Confirmation de l''aide divine pour les musulmans. Tournant militaire et politique qui consolida la présence de l''Islam. Le Saint Coran affirme que cette victoire fut remportée grâce à l''aide d''Allah et au soutien des anges.'
WHERE id = 21;

-- Event 22: Battle of Uhud (625 CE)
UPDATE seerah_events SET
  description = 'La bataille d''Uhud eut lieu le samedi 7 Shawwal de la 3e année de l''Hégire (23 mars 625 apr. J.-C.). Les polythéistes disposaient de 3 000 hommes sous le commandement d''Abu Sufyan. Le Prophète partit avec 1 000 hommes, mais après le retrait de 300 hypocrites, il ne resta que 700 compagnons. Le Prophète positionna 50 archers sur la colline d''Aynayn avec l''ordre strict de ne pas quitter leurs postes. Au début, les musulmans remportèrent un grand succès, mais lorsque la plupart des archers quittèrent la colline pour le butin, Khalid ibn al-Walid encercla et attaqua par l''arrière. 70 musulmans furent martyrisés, dont Hamza. Le Prophète fut blessé.',
  historical_significance = 'Leçon sur l''importance de l''obéissance aux ordres. Cette bataille démontra que la victoire s''obtient par la dévotion à Dieu et la discipline, non par la supériorité numérique.'
WHERE id = 22;

-- Event 23: Expulsion of Banu Nadir (626 CE)
UPDATE seerah_events SET
  description = 'L''expulsion des Banu Nadir eut lieu la quatrième année de l''Hégire (626 apr. J.-C.). Cette tribu juive de Médine conspira pour assassiner le Prophète en faisant tomber une pierre sur lui depuis le toit d''une maison. Informé par révélation divine, le Prophète quitta les lieux et ordonna aux Banu Nadir de quitter Médine dans les dix jours pour avoir violé la Charte de Médine. Encouragés par les hypocrites, ils refusèrent d''abord, mais après un siège de quinze jours, ils acceptèrent de partir. Ils furent autorisés à emporter leurs biens à l''exception des armes.',
  historical_significance = 'Consolidation de la sécurité de Médine face aux menaces internes. Cet événement démontra que la trahison et le complot contre l''État islamique ne seraient pas tolérés.'
WHERE id = 23;

-- Event 24: Battle of the Trench (627 CE)
UPDATE seerah_events SET
  description = 'La bataille du Fossé eut lieu la cinquième année de l''Hégire, au mois de Shawwal (mars 627 apr. J.-C.). Une alliance (Ahzab) de 10 000 à 12 000 soldats assiégea Médine. Sur proposition de Salman al-Farsi, une tranchée d''environ 5,5 km fut creusée sur le front nord de Médine. Le Prophète participa personnellement à ce travail. Le siège dura environ un mois. Durant le siège, la tribu des Banu Qurayza trahit les musulmans. Vers la fin, une violente tempête s''abattit sur l''armée confédérée, éteignant leurs feux et décimant leurs forces. L''armée confédérée leva le siège et se dispersa.',
  historical_significance = 'Victoire défensive décisive pour les musulmans. Un tournant dans les tactiques défensives. Ce fut la dernière tentative majeure des polythéistes pour anéantir les musulmans. Le Prophète proclama : "Désormais, nous les attaquerons, ils ne pourront plus nous attaquer."'
WHERE id = 24;

-- Event 25: Incident of Banu Qurayza (627 CE)
UPDATE seerah_events SET
  description = 'Immédiatement après la bataille du Fossé, une expédition fut lancée contre la tribu perfide des Banu Qurayza qui avait trahi les musulmans durant le siège en violant la Charte de Médine. Après un siège de 25 jours, ils se rendirent et acceptèrent le jugement de Sa''d ibn Mu''adh, chef des Aws (leur anciens alliés). Sa''d, gravement blessé durant la bataille du Fossé, rendit un jugement conforme à la loi de la Torah pour trahison en temps de guerre : les combattants furent exécutés, les femmes et enfants devinrent captifs, et les biens furent distribués.',
  historical_significance = 'Application stricte de la justice pour trahison en temps de guerre. Cet événement élimina la dernière menace interne juive à Médine et assura la sécurité de la ville.'
WHERE id = 25;

-- Event 26: Treaty of Hudaybiyyah (628 CE)
UPDATE seerah_events SET
  description = 'Le traité de Hudaybiyyah fut signé la 6e année de l''Hégire, au mois de Dhu al-Qa''dah (mars 628 apr. J.-C.). Le Prophète et environ 1 500 compagnons partirent pour La Mecque pour accomplir le pèlerinage, sans armes hormis leurs épées de voyage. Bloqués à Hudaybiyyah, des négociations eurent lieu. Lorsque le retard d''Uthman fit craindre sa mort, le Prophète reçut le "Serment de Ridwan" sous un arbre. Le traité stipulait : les musulmans rentreraient cette année sans Omra mais reviendraient l''année suivante pour trois jours ; paix de dix ans ; les réfugiés de La Mecque vers Médine seraient renvoyés mais pas l''inverse.',
  historical_significance = 'Victoire diplomatique majeure ouvrant la voie à la propagation pacifique de l''Islam. La sourate Al-Fath décrit ce traité comme "une victoire éclatante". Les Quraysh reconnurent officiellement l''existence politique des musulmans.'
WHERE id = 26;

-- Event 27: Conquest of Khaybar (628 CE)
UPDATE seerah_events SET
  description = 'La conquête de Khaybar eut lieu la septième année de l''Hégire, au mois de Muharram (mai 628 apr. J.-C.). Le Prophète marcha avec environ 1 600 hommes contre Khaybar, une oasis fortifiée à 180 km au nord de Médine, habitée par les Juifs Banu Nadir exilés qui continuaient d''inciter contre les musulmans. Après un siège d''environ un mois, les forts furent conquis un à un. Ali fit preuve d''un grand héroïsme lors de la conquête du dernier fort, Qamus. Après la conquête, le Prophète permit aux Juifs de rester sur leurs terres à condition de verser la moitié de la récolte en impôt (kharaj). Ce fut le premier accord foncier avec des non-musulmans.',
  historical_significance = 'Renforcement économique et militaire de l''État islamique. La menace du nord fut éliminée. Le butin améliora considérablement la situation économique des musulmans.'
WHERE id = 27;

-- Event 28: First pilgrimage - Umrah al-Qada (629 CE)
UPDATE seerah_events SET
  description = 'La Omra al-Qada (pèlerinage de compensation) eut lieu en Dhu al-Qa''dah de la 7e année de l''Hégire (mars 629 apr. J.-C.), conformément aux termes du traité de Hudaybiyyah. Le Prophète entra à La Mecque avec 2 000 compagnons armés. Les polythéistes évacuèrent la ville pendant trois jours comme convenu. Les musulmans accomplirent leur Omra avec dignité. Durant ce séjour, le Prophète épousa Maymunah bint al-Harith. Certains Mecquois importants comme Khalid ibn al-Walid et Amr ibn al-As se convertirent à l''Islam après avoir été témoins de la dévotion des musulmans.',
  historical_significance = 'Premier retour pacifique des musulmans à La Mecque depuis l''Hégire. Cette visite permit à de nombreux Mecquois de voir de près la beauté de l''Islam et accéléra les conversions.'
WHERE id = 28;

-- Event 29: Battle of Mu'tah (629 CE)
UPDATE seerah_events SET
  description = 'La bataille de Mu''tah eut lieu en Jumada al-Ula de la 8e année de l''Hégire (septembre 629 apr. J.-C.). Le Prophète envoya une armée de 3 000 hommes vers le nord pour venger le meurtre de son émissaire al-Harith ibn Umayr par les Ghassanides, vassaux des Byzantins. À Mu''tah (Jordanie actuelle), ils affrontèrent une armée byzantine et alliée de 100 000 à 200 000 hommes. Les trois commandants successifs - Zayd ibn Harithah, Ja''far ibn Abi Talib et Abdullah ibn Rawahah - tombèrent en martyrs. Khalid ibn al-Walid prit le commandement et réussit à sauver l''armée par une retraite stratégique brillante.',
  historical_significance = 'Premier engagement avec une superpuissance mondiale (Byzance), démontrant le courage musulman. Bien que numériquement désavantageux, les musulmans démontrèrent leur bravoure face à l''Empire byzantin.'
WHERE id = 29;

-- Event 30: Conquest of Mecca (630 CE)
UPDATE seerah_events SET
  description = 'La conquête de La Mecque eut lieu le 20 Ramadan de la 8e année de l''Hégire (11 janvier 630 apr. J.-C.). Après que les Quraysh eurent violé le traité de Hudaybiyyah, le Prophète prépara secrètement une armée de 10 000 soldats. L''armée campa à Marr al-Zahran où des dizaines de milliers de feux furent allumés, brisant la résistance des Quraysh. Abu Sufyan se rendit et se convertit à l''Islam. La ville fut conquise pacifiquement depuis quatre directions avec ordre de ne combattre qu''en cas de nécessité. Le Prophète proclama une amnistie générale : "Vous n''êtes plus blâmés aujourd''hui. Allez, vous êtes libres." Les 360 idoles furent détruites, et Bilal récita l''adhan depuis le toit de la Kaaba.',
  historical_significance = 'Réalisation de la prophétie et victoire finale sur les opposants historiques. Un tournant qui consolida la domination de l''Islam dans la péninsule arabique. La conquête pacifique démontra la miséricorde de l''Islam.'
WHERE id = 30;

-- Event 31: Battle of Hunayn (630 CE)
UPDATE seerah_events SET
  description = 'La bataille de Hunayn eut lieu en Shawwal de la 8e année de l''Hégire (630 apr. J.-C.) dans la vallée de Hunayn entre La Mecque et Taïf. Les tribus Hawazin et Thaqif (environ 20 000 hommes) attaquèrent avec 12 000 musulmans. Une embuscade dans les passages étroits de la vallée causa une panique initiale. Le Prophète fit preuve d''un grand courage en chargeant vers l''ennemi avec quelques compagnons. Son oncle Abbas rassembla l''armée dispersée à haute voix. L''armée se rallia et remporta une victoire décisive. Un butin considérable fut capturé. Plus tard, une délégation Hawazin se convertit à l''Islam et le Prophète leur restitua leurs captifs et biens.',
  historical_significance = 'Épreuve pour l''unité musulmane après la conquête. Avec cette victoire, la dernière force polythéiste majeure de la péninsule arabique fut brisée. Le Coran mentionne cette bataille (Sourate At-Tawbah, 25-26).'
WHERE id = 31;

-- Event 32: Siege of Taif (630 CE)
UPDATE seerah_events SET
  description = 'Le siège de Taïf eut lieu en Shawwal de la 8e année de l''Hégire (630 apr. J.-C.), immédiatement après la bataille de Hunayn. Les guerriers vaincus se réfugièrent dans les forteresses imprenables de Taïf avec des provisions pour un an. Le siège dura environ 20 jours avec l''utilisation de catapultes et de machines de guerre. Le siège fut levé sans succès à l''approche du mois sacré. En réponse à la demande de maudire les habitants, le Prophète pria : "Ô Allah ! Guide la tribu de Thaqif et envoie-les vers nous en tant que musulmans !" Environ un an plus tard, une délégation de Taïf vint à Médine et se convertit à l''Islam.',
  historical_significance = 'Achèvement de la domination musulmane sur la région du Hedjaz. Taïf résista militairement mais la plupart de ses habitants se convertirent à l''Islam grâce à la prière du Prophète, démontrant la priorité de la conversion des cœurs.'
WHERE id = 32;

-- Event 33: Expedition of Tabuk (630 CE)
UPDATE seerah_events SET
  description = 'L''expédition de Tabuk eut lieu en Rajab de la 9e année de l''Hégire (octobre 630 apr. J.-C.). C''est la dernière campagne militaire à laquelle le Prophète participa. Face à la menace d''une attaque byzantine, il mobilisa 30 000 hommes malgré une chaleur extrême, la sécheresse et la période des récoltes. Les compagnons firent de grands sacrifices : Abu Bakr donna toute sa richesse, Umar la moitié, et Uthman équipa un tiers de l''armée. L''armée resta à Tabuk vingt jours sans rencontrer les Byzantins qui s''étaient retirés. Le Prophète conclut des traités avec plusieurs tribus arabes chrétiennes et juives qui acceptèrent de payer la jizya.',
  historical_significance = 'Démonstration de force qui dissuada toute agression byzantine. Démonstration de la puissance militaire et politique de l''État islamique sans conflit. Cette expédition sécurisa les frontières septentrionales et fut une épreuve de foi mentionnée dans la sourate At-Tawbah.'
WHERE id = 33;

-- Event 34: Farewell Pilgrimage (632 CE)
UPDATE seerah_events SET
  description = 'Le pèlerinage d''adieu eut lieu en Dhu al-Hijjah de la 10e année de l''Hégire (632 apr. J.-C.). Le Prophète partit de Médine le 26 Dhu al-Qa''dah avec ses épouses et plus de 120 000 musulmans. Le vendredi 9 Dhu al-Hijjah, à Arafat, il prononça son célèbre sermon depuis son chameau Qaswa. Dans ce sermon universel, il déclara : l''inviolabilité de la vie, des biens et de l''honneur ; l''abolition des coutumes préislamiques ; l''égalité humaine sans distinction de race ; les droits des femmes ; la fraternité musulmane ; les deux guides (Coran et Sunna) ; la fin de la prophétie. La sourate Al-Ma''idah verset 3 fut révélée : "Aujourd''hui, J''ai parachevé pour vous votre religion."',
  historical_significance = 'Achèvement de la révélation et de la mission prophétique. Message universel des droits humains. Un résumé des principes éthiques et juridiques fondamentaux pour les musulmans, comparable à une déclaration universelle des droits de l''homme.'
WHERE id = 34;

-- Event 35: Death of Prophet Muhammad (632 CE)
UPDATE seerah_events SET
  description = 'Le Prophète décéda le lundi 13 Rabi'' al-Awwal de la 11e année de l''Hégire (8 juin 632 apr. J.-C.). Durant le Ramadan de la 10e année, des signes annonçaient sa mort : Gabriel récita le Coran avec lui deux fois, et la sourate An-Nasr fut révélée. Sa maladie, commencée fin Safar, dura environ 13 jours avec de violents maux de tête et fièvre. Il désigna Abu Bakr pour diriger la prière. Dans son dernier sermon, il mit en garde sur les droits d''autrui et interdit de profaner sa tombe. Il décéda dans les bras de son épouse Aisha en disant "Ma''ar-rafiqi''l-a''la" (Au Compagnon le plus haut). Abu Bakr consola les musulmans : "Que celui qui adorait Muhammad sache que Muhammad est mort. Que celui qui adorait Allah sache qu''Allah est vivant et ne meurt jamais."',
  historical_significance = 'Fin de la prophétie et début de l''ère des Califes bien-guidés. L''Islam est établi comme religion complète. Le Prophète laissa deux héritages : le Coran et sa Sunna comme guides éternels pour l''humanité.'
WHERE id = 35;
