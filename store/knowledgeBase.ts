import { create } from 'zustand';

export type UmrahPackage = {
  startDate: string;
  endDate: string;
  price: string;
};

export type HajjPackage = {
  name: string;
  description: string;
  rooms: {
    type: string;
    price: string;
  }[];
};

export type ContactInfo = {
  email: string;
  secondaryEmail?: string;
  phone: string;
  location: string;
};

type KnowledgeBaseStore = {
  umrahPackages: UmrahPackage[];
  hajjPackages: HajjPackage[];
  contacts: ContactInfo[];
  aboutUs: string;
  hajjInfo: string;
  umrahInfo: string;
};

export const useKnowledgeBase = create<KnowledgeBaseStore>(() => ({
  umrahPackages: [
    {
      startDate: 'Dec 20, 2024',
      endDate: 'Dec 30, 2024',
      price: '1 700 000 CFA',
    },
    {
      startDate: 'Mar 17, 2025',
      endDate: 'Mar 30, 2025',
      price: '1 700 000 CFA',
    },
    {
      startDate: 'Jui 20, 2025',
      endDate: 'Jui 30, 2025',
      price: '1 550 000 CFA',
    },
  ],
  hajjPackages: [
    {
      name: 'Ansar Vip',
      description: 'Premium package with accommodation within 1km of holy sites',
      rooms: [
        { type: 'Double', price: '9 050 000 CFA' },
        { type: 'Triple', price: '8 500 000 CFA' },
        { type: 'Quadruple', price: '7 300 000 CFA' },
      ],
    },
    {
      name: 'Ansar Standard',
      description: 'Standard package with comfortable accommodations',
      rooms: [
        { type: 'Double', price: '7 900 000 CFA' },
        { type: 'Triple', price: '7 300 000 CFA' },
        { type: 'Quadruple', price: '3 500 000 CFA' },
      ],
    },
  ],
  contacts: [
    {
      email: 'contact@ansarvoyage.com',
      phone: '227 87 27 27 20',
      location: 'Niamey, Niger',
    },
  ],
  aboutUs: 'Ansar Voyage is dedicated to providing exceptional Hajj and Umrah services.',
  hajjInfo: `Le Hajj est le pèlerinage musulman à La Mecque, qui a lieu au dernier mois de l'année, et doit être accompli au moins une fois dans sa vie par tout musulman adulte qui en a les moyens physiques et financiers. C'est l'un des cinq piliers de l'Islam.

Le pèlerinage a lieu du 8 au 12 de Dhou al-Hijja, le dernier mois du calendrier islamique. Les pèlerins entrent dans un état spirituel spécial appelé "Ihram" et accomplissent une série de rituels incluant:
- Le Tawaf (sept tours autour de la Kaaba)
- Le Sa'i (allers-retours entre Al-Safa et Al-Marwah)
- La station à Arafat
- La nuit à Muzdalifa
- La lapidation des stèles
- Le sacrifice rituel
- La célébration de l'Aïd al-Adha`,
  umrahInfo: `La Oumra est un pèlerinage volontaire à La Mecque qui peut être accompli à tout moment de l'année. En arabe, Oumra signifie "visiter un lieu peuplé".

Les rituels principaux de la Oumra incluent:
- L'entrée en état d'Ihram
- Le Tawaf autour de la Kaaba
- Le Sa'i entre Al-Safa et Al-Marwah

Bien que non obligatoire, la Oumra est fortement recommandée. Elle ne remplace pas l'obligation du Hajj pour ceux qui en ont les moyens.`,
}));