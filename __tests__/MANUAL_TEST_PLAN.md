# Manual Test Plan — Chat Refactor

## Pre-requisites
- Set `EXPO_PUBLIC_OPENAI_API_KEY` and/or `EXPO_PUBLIC_ANTHROPIC_API_KEY` in `.env`
- Run `npx expo start --web` (or on device)

## Test 1: Completeness — 99 Names of Allah (English)
- **Input**: "Give me the 99 names of Allah"
- **Expected**: A numbered list from 1 to 99, each with Arabic name and English meaning
- **Verify**: Count numbered items — must be >= 99
- **Verify**: No "etc.", "and so on", or truncation

## Test 2: Completeness — 99 Names (French)
- **Input**: "Donne moi les 99 noms d'Allah"
- **Expected**: Numbered list 1..99 in French (Arabic names + French meanings)
- **Verify**: Response language is French

## Test 3: Completeness — 99 Names (Arabic)
- **Input**: "أعطني أسماء الله الحسنى"
- **Expected**: Numbered list in Arabic
- **Verify**: Response is in Arabic script

## Test 4: Language Detection — French
- **Input**: "Qu'est-ce que le Hajj?"
- **Expected**: Response entirely in French
- **Verify**: No English headings or explanations

## Test 5: Language Detection — English
- **Input**: "What are the pillars of Islam?"
- **Expected**: Response in English listing 5 pillars
- **Verify**: 5 items returned

## Test 6: Simple Question (non-list)
- **Input**: "Who was Prophet Muhammad?"
- **Expected**: A normal paragraph response, not over-verbose
- **Verify**: Reasonable length (not a giant list)

## Test 7: UI French Labels
- **Verify on chat screen**:
  - Placeholder: "Posez votre question..."
  - Loading indicator: "Génération de la réponse..."
  - Empty state title: "Bienvenue sur Ask Ansar"
  - Copy button: "Copier" → "Copié !" after click
  - Share button: "Partager"
  - Share modal title: "Partager la réponse"
  - Share options: "Partager par e-mail", "Partager par WhatsApp", "Copier dans le presse-papiers"
  - Error message: "Désolé, une erreur est survenue..."

## Test 8: Input Box Behavior
- Type text → send button becomes active (blue)
- Press send → message appears, input clears
- Loading indicator appears during generation
- Enter/Return sends message (on web)
- Multiline: text wraps, input grows up to max height

## Test 9: Copy / Share (Regression)
- Bot responds → tap "Copier" → text copied, button shows "Copié !"
- Tap "Partager" → share modal opens (web) or native share sheet (mobile)
- Email/WhatsApp share links work

## Test 10: Scroll Behavior
- Send multiple messages → chat auto-scrolls to bottom
- Long response (99 names) → renders fully, scrollable

## Test 11: Error Handling
- Temporarily set invalid API key → send message
- **Expected**: French error message: "Désolé, une erreur est survenue..."
- App should not crash

## Test 12: Fallback Between Models
- Remove `EXPO_PUBLIC_ANTHROPIC_API_KEY` → should fall back to OpenAI only
- Remove `EXPO_PUBLIC_OPENAI_API_KEY` → should fall back to Claude only
- Remove both → offline error message in French

## Running Automated Tests
```bash
npx tsx __tests__/languageDetect.test.ts
npx tsx __tests__/completenessGuard.test.ts
```
Both should print "0 failed".
