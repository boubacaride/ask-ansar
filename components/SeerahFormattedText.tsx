/**
 * Rich text renderer for Seerah event descriptions.
 * Highlights key names, dates, places and Quranic references.
 * Adds drop cap for first paragraph and styled paragraph breaks.
 */
import React, { memo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface SeerahFormattedTextProps {
  text: string;
  darkMode: boolean;
  /** Accent color for highlights (default: #C4A35A gold) */
  accentColor?: string;
  /** If true, renders with italic base style (for significance section) */
  italic?: boolean;
}

// Key Islamic names to highlight
const NAMES = [
  'Muhammad', 'Prophète', 'prophète', 'Prophet',
  'Gabriel', 'Jibrîl', 'Jibril',
  'Khadijah', 'Khadija',
  'Abu Talib', 'Abou Talib',
  'Abu Bakr', 'Abou Bakr',
  'Omar', 'Umar', 'ʿUmar',
  'Uthman', 'Othman', '\'Uthman',
  'Ali', '\'Ali',
  'Fatima', 'Fâtima',
  'Aisha', 'Aïcha', '\'Aïcha',
  'Hamza', 'Hamzah',
  'Bilal', 'Bilâl',
  'Khalid', 'Khâlid',
  'Amr', '\'Amr',
  'Ja\'far', 'Jafar', 'Ja\'far',
  'Abdul Muttalib', '\'Abdul Muttalib',
  'Abdullah', '\'Abdullah',
  'Aminah', 'Amina', 'Âmina',
  'Abu Lahab', 'Abou Lahab',
  'Abu Sufyan', 'Abou Soufyane',
  'Bahira', 'Bahîra',
  'Négus', 'Najashi',
  'Mus\'ab', 'Musab', 'Mus\'ab',
  'Zubayr', 'Zoubayr',
  'Ruqayyah', 'Ruqayya',
  'Umm Ayman',
  'al-Amin',
];

// Key places to highlight
const PLACES = [
  'La Mecque', 'Mecque', 'Makkah', 'Mekka',
  'Médine', 'Medina', 'Yathrib',
  'Kaaba', 'Ka\'ba', 'Ka\'bah',
  'Abyssinie', 'Éthiopie', 'Habasha',
  'Taïf', 'Ta\'if',
  'Jérusalem', 'Al-Aqsa',
  'Hira', 'Hirâ',
  'Uhud', 'Ouhoud',
  'Badr', 'Badre',
  'Hudaybiyyah', 'Houdaybiya',
  'Khaybar', 'Khaibar',
  'Tabuk', 'Tabouk',
  'Hunayn', 'Hounayn',
  'Abwa', 'Busra',
  'Safa', 'Safâ',
  'Quba', 'Qoubâ',
  'Shi\'b Abi Talib', 'Shi\'b Abu Talib',
  'Syrie',
  'Mu\'tah', 'Moutah',
  'Arafat', '\'Arafat',
];

// Quranic / religious terms to highlight
const QURAN_TERMS = [
  'sourate', 'Sourate', 'surah', 'Surah',
  'Al-Alaq', 'Al-Hijr', 'Al-Fatiha',
  'Ramadan', 'Qadr', 'Nuit du Qadr',
  'Isra', 'Mi\'raj', 'Miraj',
  'Hégire', 'Hijra',
  'Coran', 'Quran', 'Qur\'an',
  'Pierre Noire',
  'Aqaba', '\'Aqaba',
  'Qibla', 'Qiblah',
];

/**
 * Build a regex that matches any of the given terms as whole words.
 * Sorted by length descending so longer matches win.
 */
function buildHighlightRegex(terms: string[]): RegExp {
  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  return new RegExp(`(${escaped.join('|')})`, 'g');
}

const nameRegex = buildHighlightRegex(NAMES);
const placeRegex = buildHighlightRegex(PLACES);
const quranRegex = buildHighlightRegex(QURAN_TERMS);
// Date patterns: years like "571", "610 apr. J.-C.", "53 ans", etc.
const dateRegex = /(\d{3,4}\s*(?:apr\.\s*J\.-C\.|av\.\s*J\.-C\.)?|\d+e?\s*(?:année|an(?:née)?s?)\s*(?:de la prophétie)?)/g;

type Segment = { text: string; type: 'plain' | 'name' | 'place' | 'quran' | 'date' };

function tokenize(text: string): Segment[] {
  // First pass: split by dates
  const segments: Segment[] = [];
  let remaining = text;

  // Combine all patterns into one pass for efficiency
  const combined = new RegExp(
    `(${dateRegex.source})|(${nameRegex.source})|(${placeRegex.source})|(${quranRegex.source})`,
    'g'
  );

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = combined.exec(text)) !== null) {
    // Add plain text before match
    if (match.index > lastIndex) {
      segments.push({ text: text.slice(lastIndex, match.index), type: 'plain' });
    }

    // Determine which group matched
    if (match[1]) {
      segments.push({ text: match[0], type: 'date' });
    } else if (match[2]) {
      segments.push({ text: match[0], type: 'name' });
    } else if (match[3]) {
      segments.push({ text: match[0], type: 'place' });
    } else if (match[4]) {
      segments.push({ text: match[0], type: 'quran' });
    }

    lastIndex = combined.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), type: 'plain' });
  }

  return segments.length > 0 ? segments : [{ text, type: 'plain' }];
}

function SeerahFormattedTextInner({
  text,
  darkMode,
  accentColor = '#C4A35A',
  italic = false,
}: SeerahFormattedTextProps) {
  if (!text) return null;

  // Split into sentences for paragraph-like rendering
  // Use ". " as sentence boundary but keep the period
  const paragraphs = text.split(/(?<=\.)\s+(?=[A-ZÀÂÇÉÈÊËÎÏÔÙÛÜŸŒÆ«])/);

  return (
    <View>
      {paragraphs.map((paragraph, pIndex) => {
        const segments = tokenize(paragraph);
        const isFirst = pIndex === 0;

        return (
          <View key={pIndex} style={pIndex > 0 ? seerahStyles.paragraphSpacing : undefined}>
            <Text
              style={[
                seerahStyles.baseText,
                italic && seerahStyles.italicText,
                darkMode && seerahStyles.baseTextDark,
              ]}
            >
              {segments.map((seg, sIndex) => {
                // Drop cap for very first character
                if (isFirst && sIndex === 0 && seg.type === 'plain' && seg.text.length > 0) {
                  const firstChar = seg.text[0];
                  const rest = seg.text.slice(1);
                  return (
                    <React.Fragment key={sIndex}>
                      <Text
                        style={[
                          seerahStyles.dropCap,
                          { color: accentColor },
                        ]}
                      >
                        {firstChar}
                      </Text>
                      {rest}
                    </React.Fragment>
                  );
                }

                switch (seg.type) {
                  case 'name':
                    return (
                      <Text
                        key={sIndex}
                        style={[
                          seerahStyles.nameHighlight,
                          darkMode && seerahStyles.nameHighlightDark,
                        ]}
                      >
                        {seg.text}
                      </Text>
                    );
                  case 'place':
                    return (
                      <Text
                        key={sIndex}
                        style={[
                          seerahStyles.placeHighlight,
                          darkMode && seerahStyles.placeHighlightDark,
                        ]}
                      >
                        {seg.text}
                      </Text>
                    );
                  case 'quran':
                    return (
                      <Text
                        key={sIndex}
                        style={[
                          seerahStyles.quranHighlight,
                          { color: accentColor },
                        ]}
                      >
                        {seg.text}
                      </Text>
                    );
                  case 'date':
                    return (
                      <Text
                        key={sIndex}
                        style={[
                          seerahStyles.dateHighlight,
                          darkMode && seerahStyles.dateHighlightDark,
                        ]}
                      >
                        {seg.text}
                      </Text>
                    );
                  default:
                    return <React.Fragment key={sIndex}>{seg.text}</React.Fragment>;
                }
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

export default memo(SeerahFormattedTextInner);

const seerahStyles = StyleSheet.create({
  baseText: {
    fontSize: 15.5,
    lineHeight: 27,
    color: '#1a1a2e',
    letterSpacing: 0.15,
  },
  baseTextDark: {
    color: '#e0e0e0',
  },
  italicText: {
    fontStyle: 'italic',
  },
  paragraphSpacing: {
    marginTop: 10,
  },
  dropCap: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  nameHighlight: {
    fontWeight: '700',
    color: '#0D5C63',
  },
  nameHighlightDark: {
    color: '#4DB6AC',
  },
  placeHighlight: {
    fontWeight: '600',
    color: '#5D4037',
    fontStyle: 'italic',
  },
  placeHighlightDark: {
    color: '#BCAAA4',
  },
  quranHighlight: {
    fontWeight: '700',
    fontStyle: 'italic',
  },
  dateHighlight: {
    fontWeight: '600',
    color: '#4527A0',
  },
  dateHighlightDark: {
    color: '#B39DDB',
  },
});
