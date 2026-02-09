/*
  # Insert Complete Seerah Timeline Events (571 CE - 632 CE)
  
  1. Description
    - Inserts all 35 major events from the life of Prophet Muhammad (peace be upon him)
    - Chronologically ordered from birth (571 CE) to death (632 CE)
    - Each event includes year, title, location, coordinates, description, and historical significance
    
  2. Event Coverage
    - Early Life: Birth, childhood, youth, marriage (571-610 CE)
    - Prophethood: First revelation, early preaching, persecution (610-622 CE)
    - Migration & Medina Period: Hijrah, battles, treaties (622-632 CE)
    - Final Years: Conquest of Mecca, Farewell Pilgrimage, death (629-632 CE)
    
  3. Notes
    - Uses ON CONFLICT to avoid duplicates when re-running migration
    - Geographic coordinates are historically accurate for major Arabian Peninsula locations
*/

-- Delete existing events to ensure clean slate
DELETE FROM seerah_events;

-- Insert all 35 events in chronological order
INSERT INTO seerah_events (id, year, title, location, latitude, longitude, description, historical_significance) VALUES
  (1, '571 ap. J.-C.', 'Naissance du Prophète Muhammad (PSL)', 'La Mecque', 21.4225, 39.8262, 'Naissance dans le clan Banu Hashim de la tribu Quraysh. Son père Abdullah est décédé avant sa naissance.', 'Le début de la vie du dernier prophète de l''Islam, qui changera le cours de l''histoire mondiale.'),
  
  (2, '577 ap. J.-C.', 'Décès de sa mère Aminah', 'Al-Abwa (entre La Mecque et Médine)', 23.2944, 38.9444, 'Muhammad perd sa mère lors d''un voyage. Il est recueilli par son grand-père Abdul Muttalib.', 'Début d''une période d''orphelinat qui façonnera sa compassion pour les démunis.'),
  
  (3, '578 ap. J.-C.', 'Décès de son grand-père', 'La Mecque', 21.4225, 39.8262, 'Abdul Muttalib décède. Muhammad est confié à son oncle Abu Talib.', 'Abu Talib deviendra son protecteur et défenseur durant toute la période mecquoise.'),
  
  (4, '583 ap. J.-C.', 'Voyage en Syrie avec Abu Talib', 'Syrie (Bosra)', 32.5167, 36.4833, 'Premier grand voyage commercial où le moine Bahira reconnaît en lui les signes de la prophétie.', 'Première exposition au commerce international et aux traditions chrétiennes.'),
  
  (5, '595 ap. J.-C.', 'Mariage avec Khadija', 'La Mecque', 21.4225, 39.8262, 'À 25 ans, il épouse Khadija bint Khuwaylid, une riche commerçante de 40 ans.', 'Début d''un mariage exemplaire de 25 ans. Khadija sera la première à croire en sa mission.'),
  
  (6, '605 ap. J.-C.', 'Reconstruction de la Kaaba', 'La Mecque (Kaaba)', 21.4225, 39.8262, 'Muhammad résout le conflit des tribus sur qui placera la Pierre Noire, évitant une guerre.', 'Démontre sa sagesse et son rôle de médiateur reconnu à La Mecque.'),
  
  (7, '610 ap. J.-C.', 'Première révélation', 'Grotte de Hira (Mont Nour)', 21.4595, 39.8579, 'L''ange Gabriel lui apparaît et révèle les premiers versets du Coran (Sourate Al-Alaq).', 'Début de la prophétie et de la révélation coranique qui durera 23 ans.'),
  
  (8, '613 ap. J.-C.', 'Début de la prédication publique', 'La Mecque (Mont Safa)', 21.4225, 39.8262, 'Après trois ans de prédication secrète, Muhammad appelle publiquement les Mecquois à l''Islam.', 'Début de la persécution systématique des premiers musulmans par les Quraysh.'),
  
  (9, '615 ap. J.-C.', 'Première émigration en Abyssinie', 'Abyssinie (Éthiopie)', 9.0320, 38.7469, 'Un groupe de musulmans fuit la persécution vers le royaume chrétien du Négus.', 'Première migration de l''Islam et reconnaissance par un roi chrétien.'),
  
  (10, '616 ap. J.-C.', 'Deuxième émigration en Abyssinie', 'Abyssinie (Éthiopie)', 9.0320, 38.7469, 'Plus de 80 musulmans rejoignent la première vague de migrants.', 'Protection continue des musulmans persécutés par le Négus.'),
  
  (11, '617 ap. J.-C.', 'Début du boycott des Banu Hashim', 'La Mecque (Shi''b Abu Talib)', 21.4225, 39.8262, 'Les Quraysh imposent un boycott économique et social total contre le clan du Prophète.', 'Trois années de famine et d''isolement extrême dans le quartier de Shi''b Abu Talib.'),
  
  (12, '619 ap. J.-C.', 'Année de la tristesse (Am al-Huzn)', 'La Mecque', 21.4225, 39.8262, 'Décès de Khadija et d''Abu Talib la même année. Intensification de la persécution.', 'Perte des deux piliers de soutien du Prophète, aggravant sa situation.'),
  
  (13, '620 ap. J.-C.', 'Voyage à Taïf', 'Taïf', 21.2622, 40.4156, 'Recherche de soutien auprès de la tribu Thaqif, mais il est rejeté et lapidé.', 'Un des moments les plus difficiles de sa vie, suivi de sa célèbre invocation.'),
  
  (14, '621 ap. J.-C.', 'Voyage nocturne (Isra et Mi''raj)', 'Jérusalem et les cieux', 31.7767, 35.2345, 'Voyage miraculeux de La Mecque à Jérusalem puis ascension vers les cieux.', 'Événement spirituel majeur établissant la prière quotidienne obligatoire.'),
  
  (15, '621 ap. J.-C.', 'Premier serment d''Aqaba', 'Mina (près de La Mecque)', 21.4203, 39.8889, 'Six personnes de Médine embrassent l''Islam et promettent leur soutien.', 'Début des relations avec Médine qui mèneront à l''Hégire.'),
  
  (16, '622 ap. J.-C.', 'Deuxième serment d''Aqaba', 'Mina (près de La Mecque)', 21.4203, 39.8889, '73 hommes et 2 femmes de Médine prêtent allégeance et promettent protection.', 'Fondation de l''alliance qui permettra l''établissement de l''État islamique à Médine.'),
  
  (17, '622 ap. J.-C.', 'L''Hégire (Migration vers Médine)', 'La Mecque vers Médine', 24.4672, 39.6111, 'Migration du Prophète de La Mecque à Médine, marquant le début du calendrier islamique.', 'Événement fondateur de la communauté musulmane et début de l''ère islamique.'),
  
  (18, '622 ap. J.-C.', 'Arrivée à Médine', 'Quba puis Médine', 24.4672, 39.6111, 'Construction de la mosquée de Quba, première mosquée de l''Islam, puis arrivée à Médine.', 'Établissement du premier État islamique et rédaction de la Constitution de Médine.'),
  
  (19, '623 ap. J.-C.', 'Construction de la Mosquée du Prophète', 'Médine', 24.4672, 39.6111, 'Construction de Masjid al-Nabawi, centre spirituel et administratif de la communauté.', 'Établissement du centre de la nouvelle société musulmane.'),
  
  (20, '624 ap. J.-C.', 'Changement de Qibla', 'Médine', 24.4672, 39.6111, 'Direction de la prière changée de Jérusalem vers la Kaaba à La Mecque.', 'Affirmation de l''identité islamique distincte et de l''importance de la Kaaba.'),
  
  (21, '624 ap. J.-C.', 'Bataille de Badr', 'Badr', 23.7422, 38.7733, 'Victoire décisive de 313 musulmans contre 1000 Quraysh. Premier affrontement majeur.', 'Tournant militaire et moral crucial démontrant le soutien divin à la communauté musulmane.'),
  
  (22, '625 ap. J.-C.', 'Bataille d''Uhud', 'Mont Uhud (Médine)', 24.4969, 39.6189, 'Les musulmans subissent de lourdes pertes après avoir désobéi aux ordres. Le Prophète est blessé.', 'Leçon sur l''importance de la discipline et de l''obéissance aux commandements.'),
  
  (23, '626 ap. J.-C.', 'Expulsion des Banu Nadir', 'Médine', 24.4672, 39.6111, 'Exil de la tribu juive Banu Nadir pour trahison et complot contre le Prophète.', 'Consolidation de la sécurité de Médine face aux menaces internes.'),
  
  (24, '627 ap. J.-C.', 'Bataille de la Tranchée (Al-Ahzab)', 'Médine', 24.4672, 39.6111, 'Défense de Médine contre une coalition de 10 000 ennemis grâce à la stratégie de la tranchée.', 'Victoire défensive majeure qui brise la coalition mecquoise et leurs alliés.'),
  
  (25, '627 ap. J.-C.', 'Incident des Banu Qurayza', 'Médine', 24.4672, 39.6111, 'Jugement de la tribu Banu Qurayza pour trahison durant le siège de Médine.', 'Application stricte de la justice pour trahison en temps de guerre.'),
  
  (26, '628 ap. J.-C.', 'Traité de Hudaybiyyah', 'Hudaybiyyah (Al-Shumaisi)', 21.4461, 39.6931, 'Accord de paix de 10 ans avec les Quraysh permettant aux musulmans le pèlerinage l''année suivante.', 'Victoire diplomatique majeure ouvrant la voie à la propagation pacifique de l''Islam.'),
  
  (27, '628 ap. J.-C.', 'Conquête de Khaybar', 'Khaybar', 25.7000, 39.3000, 'Victoire contre la forteresse juive de Khaybar qui complotait contre Médine.', 'Renforcement économique et militaire de l''État islamique.'),
  
  (28, '629 ap. J.-C.', 'Premier pèlerinage (Umrah al-Qada)', 'La Mecque', 21.4225, 39.8262, 'Accomplissement de la Omra selon les termes du traité de Hudaybiyyah.', 'Premier retour pacifique des musulmans à La Mecque depuis l''Hégire.'),
  
  (29, '629 ap. J.-C.', 'Bataille de Mu''tah', 'Mu''tah (Jordanie)', 31.4333, 35.7333, 'Affrontement contre l''Empire byzantin. Trois commandants musulmans tombent en martyrs.', 'Premier engagement avec une superpuissance mondiale, démontrant le courage musulman.'),
  
  (30, '630 ap. J.-C.', 'Conquête de La Mecque (Fath Makkah)', 'La Mecque', 21.4225, 39.8262, 'Entrée pacifique à La Mecque avec 10 000 compagnons. Pardon général accordé aux Mecquois.', 'Réalisation de la prophétie et victoire finale sur les opposants historiques.'),
  
  (31, '630 ap. J.-C.', 'Bataille de Hunayn', 'Vallée de Hunayn', 21.2547, 40.2531, 'Victoire contre les tribus Hawazin et Thaqif après un début difficile.', 'Consolidation du pouvoir musulman dans toute la péninsule arabique.'),
  
  (32, '630 ap. J.-C.', 'Siège de Taïf', 'Taïf', 21.2622, 40.4156, 'Siège de la ville de Taïf qui résiste puis se rend plus tard.', 'Achèvement de la domination musulmane sur la région du Hedjaz.'),
  
  (33, '630 ap. J.-C.', 'Expédition de Tabuk', 'Tabuk', 28.3838, 36.5720, 'Dernière grande expédition militaire vers le nord pour faire face aux Byzantins.', 'Démonstration de force qui dissuade toute agression byzantine.'),
  
  (34, '632 ap. J.-C.', 'Pèlerinage d''adieu', 'Mont Arafat, La Mecque', 21.3550, 39.8450, 'Dernier pèlerinage du Prophète avec plus de 100 000 musulmans. Sermon historique d''adieu.', 'Achèvement de la révélation et de la mission prophétique. Message universel des droits humains.'),
  
  (35, '632 ap. J.-C.', 'Décès du Prophète Muhammad (PSL)', 'Médine (Maison d''Aïcha)', 24.4672, 39.6111, 'Le Prophète décède à l''âge de 63 ans dans les bras de son épouse Aïcha.', 'Fin de la prophétie et début de l''ère des Califes bien-guidés. L''Islam est établi comme religion complète.')
ON CONFLICT (id) DO UPDATE SET
  year = EXCLUDED.year,
  title = EXCLUDED.title,
  location = EXCLUDED.location,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  description = EXCLUDED.description,
  historical_significance = EXCLUDED.historical_significance,
  updated_at = now();
