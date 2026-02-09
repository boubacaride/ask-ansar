/**
 * Lightweight markdown-like renderer for chat messages.
 * Supports: ## headings, **bold**, numbered lists, bullet lists, Arabic blocks.
 * No external dependencies — pure React Native.
 */
import { View, Text, StyleSheet } from 'react-native';
import { memo } from 'react';

interface FormattedTextProps {
  text: string;
  darkMode: boolean;
}

interface ParsedBlock {
  type: 'heading' | 'numbered' | 'bullet' | 'paragraph';
  content: string;
  number?: string;
}

function parseBlocks(text: string): ParsedBlock[] {
  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      blocks.push({ type: 'paragraph', content: currentParagraph.join('\n') });
      currentParagraph = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Empty line → flush paragraph
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    // Heading: ## or ###
    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'heading', content: trimmed.replace(/^#{1,3}\s+/, '') });
      continue;
    }

    // Numbered list: "1." or "1)"
    const numberedMatch = trimmed.match(/^(\d+)[.\)]\s+(.+)/);
    if (numberedMatch) {
      flushParagraph();
      blocks.push({ type: 'numbered', number: numberedMatch[1], content: numberedMatch[2] });
      continue;
    }

    // Bullet list: "- " or "• "
    if (/^[-•]\s+/.test(trimmed)) {
      flushParagraph();
      blocks.push({ type: 'bullet', content: trimmed.replace(/^[-•]\s+/, '') });
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
  // Match **bold** patterns
  const regex = /\*\*(.+?)\*\*/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Text before the bold
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }
    // Bold text
    elements.push(
      <Text key={`b${key++}`} style={[styles.bold, darkMode && styles.boldDark]}>
        {match[1]}
      </Text>
    );
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
    <View>
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
                  •
                </Text>
                <Text style={[styles.listContent, darkMode && styles.textDark]}>
                  {renderInline(block.content, darkMode)}
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
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 24,
  },
  headingDark: {
    color: '#4A9EFF',
  },
  paragraph: {
    fontSize: 15.5,
    color: '#1F2937',
    lineHeight: 24,
    marginBottom: 8,
  },
  textDark: {
    color: '#E5E7EB',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 4,
  },
  listNumber: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#0053C1',
    width: 30,
    lineHeight: 24,
  },
  listNumberDark: {
    color: '#4A9EFF',
  },
  listContent: {
    flex: 1,
    fontSize: 15.5,
    color: '#1F2937',
    lineHeight: 24,
  },
  bulletDot: {
    fontSize: 15.5,
    color: '#0053C1',
    width: 20,
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
});
