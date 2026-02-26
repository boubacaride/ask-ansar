/**
 * Lightweight markdown-like renderer for chat messages and topic answers.
 * Supports: ## headings, ### sub-headings, **bold**, *italic*, numbered lists,
 * bullet lists, > blockquotes, --- dividers, Arabic text blocks.
 * No external dependencies — pure React Native.
 */
import { View, Text, StyleSheet } from 'react-native';
import { memo } from 'react';

interface FormattedTextProps {
  text: string;
  darkMode: boolean;
}

interface ParsedBlock {
  type: 'heading' | 'subheading' | 'numbered' | 'bullet' | 'blockquote' | 'divider' | 'arabic' | 'paragraph';
  content: string;
  number?: string;
}

// Arabic/RTL character detection
const ARABIC_REGEX = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
function isArabicLine(text: string): boolean {
  const arabicChars = (text.match(new RegExp(ARABIC_REGEX.source, 'g')) || []).length;
  return arabicChars > text.length * 0.3;
}

function parseBlocks(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const joined = currentParagraph.join('\n');
      // Check if this paragraph is primarily Arabic text
      if (isArabicLine(joined)) {
        blocks.push({ type: 'arabic', content: joined });
      } else {
        blocks.push({ type: 'paragraph', content: joined });
      }
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line -> flush paragraph
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Horizontal rule: --- or ***
    if (/^[-*]{3,}$/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'divider', content: '' });
      continue;
    }

    // Sub-heading: ### (before heading check)
    if (/^###\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'subheading', content: trimmed.replace(/^###\s+/, '') });
      continue;
    }

    // Heading: ## or #
    if (/^#{1,2}\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'heading', content: trimmed.replace(/^#{1,2}\s+/, '') });
      continue;
    }

    // Blockquote: > text
    if (/^>\s*/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'blockquote', content: trimmed.replace(/^>\s*/, '') });
      continue;
    }

    // Numbered list: "1." or "1)"
    const numberedMatch = trimmed.match(/^(\d+)[.\)]\s+(.+)/);
    if (numberedMatch) {
      flushParagraph();
      blocks.push({ type: 'numbered', number: numberedMatch[1], content: numberedMatch[2] });
      continue;
    }

    // Bullet list: "- " or "• " or "* " (but not **bold**)
    if (/^[-•]\s+/.test(trimmed) || (/^\*\s+/.test(trimmed) && !/^\*\*/.test(trimmed))) {
      flushParagraph();
      blocks.push({ type: 'bullet', content: trimmed.replace(/^[-•*]\s+/, '') });
      continue;
    }

    // Regular text
    currentParagraph.push(trimmed);
  }

  flushParagraph();
  return blocks;
}

/**
 * Render inline formatting: **bold** and *italic*
 */
function renderInline(text: string, darkMode: boolean): (string | JSX.Element)[] {
  const elements: (string | JSX.Element)[] = [];
  // Match **bold** and *italic* patterns
  const regex = /\*\*(.+?)\*\*|\*(.+?)\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before the match
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      // **bold**
      elements.push(
        <Text key={`b${key++}`} style={[styles.bold, darkMode && styles.boldDark]}>
          {match[1]}
        </Text>
      );
    } else if (match[2]) {
      // *italic*
      elements.push(
        <Text key={`i${key++}`} style={styles.italic}>
          {match[2]}
        </Text>
      );
    }
    lastIndex = regex.lastIndex;
  }

  // Remaining text
  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements.length > 0 ? elements : [text];
}

function FormattedTextInner({ text, darkMode }: FormattedTextProps) {
  const blocks = parseBlocks(text);

  return (
    <View style={{ direction: 'ltr' as any }}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Text
                key={i}
                style={[styles.heading, darkMode && styles.headingDark]}
              >
                {renderInline(block.content, darkMode)}
              </Text>
            );

          case 'subheading':
            return (
              <Text
                key={i}
                style={[styles.subheading, darkMode && styles.subheadingDark]}
              >
                {renderInline(block.content, darkMode)}
              </Text>
            );

          case 'numbered':
            return (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.listNumber, darkMode && styles.listNumberDark]}>
                  {block.number}.
                </Text>
                <Text style={[styles.listContent, darkMode && styles.textDark]}>
                  {renderInline(block.content, darkMode)}
                </Text>
              </View>
            );

          case 'bullet':
            return (
              <View key={i} style={styles.listItem}>
                <Text style={[styles.bulletDot, darkMode && styles.bulletDotDark]}>
                  {'\u2022'}
                </Text>
                <Text style={[styles.listContent, darkMode && styles.textDark]}>
                  {renderInline(block.content, darkMode)}
                </Text>
              </View>
            );

          case 'blockquote':
            return (
              <View key={i} style={[styles.blockquote, darkMode && styles.blockquoteDark]}>
                <Text style={[styles.blockquoteText, darkMode && styles.blockquoteTextDark]}>
                  {renderInline(block.content, darkMode)}
                </Text>
              </View>
            );

          case 'divider':
            return (
              <View key={i} style={[styles.divider, darkMode && styles.dividerDark]} />
            );

          case 'arabic':
            return (
              <View key={i} style={[styles.arabicBlock, darkMode && styles.arabicBlockDark]}>
                <Text style={[styles.arabicText, darkMode && styles.arabicTextDark]}>
                  {block.content}
                </Text>
              </View>
            );

          case 'paragraph':
          default:
            return (
              <Text
                key={i}
                style={[styles.paragraph, darkMode && styles.textDark]}
              >
                {renderInline(block.content, darkMode)}
              </Text>
            );
        }
      })}
    </View>
  );
}

export default memo(FormattedTextInner);

const styles = StyleSheet.create({
  heading: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0053C1',
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 24,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  headingDark: {
    color: '#4A9EFF',
  },
  subheading: {
    fontSize: 15.5,
    fontWeight: '700',
    color: '#0f766e',
    marginTop: 10,
    marginBottom: 4,
    lineHeight: 22,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  subheadingDark: {
    color: '#14b8a6',
  },
  paragraph: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 8,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  textDark: {
    color: '#E5E7EB',
  },
  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 4,
    paddingLeft: 4,
    writingDirection: 'ltr' as const,
  },
  listNumber: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0053C1',
    width: 28,
    lineHeight: 24,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  listNumberDark: {
    color: '#4A9EFF',
  },
  listContent: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 24,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  bulletDot: {
    fontSize: 15,
    color: '#0053C1',
    width: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
  bulletDotDark: {
    color: '#4A9EFF',
  },
  bold: {
    fontWeight: '700',
    color: '#111827',
  },
  boldDark: {
    color: '#F3F4F6',
  },
  italic: {
    fontStyle: 'italic',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#0f766e',
    backgroundColor: '#f0fdfa',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginVertical: 6,
    borderRadius: 4,
    direction: 'ltr' as any,
  },
  blockquoteDark: {
    borderLeftColor: '#14b8a6',
    backgroundColor: '#0f766e22',
  },
  blockquoteText: {
    fontSize: 14.5,
    color: '#334155',
    lineHeight: 22,
    fontStyle: 'italic' as const,
    textAlign: 'left' as const,
    writingDirection: 'ltr' as const,
  },
  blockquoteTextDark: {
    color: '#cbd5e1',
  },
  divider: {
    height: 1,
    backgroundColor: '#e2e8f0',
    marginVertical: 12,
  },
  dividerDark: {
    backgroundColor: '#334155',
  },
  arabicBlock: {
    backgroundColor: '#eff6ff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  arabicBlockDark: {
    backgroundColor: '#1e3a5f',
    borderColor: '#2563eb44',
  },
  arabicText: {
    fontSize: 18,
    color: '#1e3a5f',
    textAlign: 'right',
    lineHeight: 32,
    writingDirection: 'rtl',
  },
  arabicTextDark: {
    color: '#93c5fd',
  },
});
