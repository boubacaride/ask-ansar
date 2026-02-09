# Ask Ansar - Islamic Q&A Assistant

An intelligent Islamic Q&A mobile application built with React Native and Expo, powered by AI to provide accurate answers based on Quran, Hadith, and Islamic scholarly sources.

## Features

- **AI-Powered Responses**: Get accurate Islamic answers using OpenAI's GPT-4
- **Authentic Sources**: References from Quran verses and authentic Hadith collections
- **Multi-Language Support**: Available in English and Arabic
- **Voice Input**: Ask questions using voice commands
- **Topic Categories**: Browse predefined Islamic topics
- **Chat History**: Save and review previous conversations
- **User Authentication**: Secure user accounts with Supabase Auth
- **Privacy Controls**: Manage conversation history and privacy settings
- **Offline Support**: Access knowledge base even without internet

## Technologies

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI**: OpenAI GPT-4
- **State Management**: Zustand
- **Styling**: React Native StyleSheet
- **Icons**: Lucide React Native

## Prerequisites

Before you begin, ensure you have:

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- A Supabase account and project
- An OpenAI API key

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/boubacaride/Ask-Ansar.git
   cd Ask-Ansar
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the root directory with:

   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

   Get these values from:
   - Supabase: https://app.supabase.com (Project Settings > API)
   - OpenAI: https://platform.openai.com/api-keys

4. **Set up Supabase:**

   The database migrations are in the `supabase/migrations` folder. Apply them to your Supabase project:

   - Install Supabase CLI: `npm install -g supabase`
   - Link your project: `supabase link --project-ref your-project-ref`
   - Apply migrations: `supabase db push`

   Or manually run the SQL files in your Supabase SQL editor.

5. **Deploy Edge Functions (Optional):**

   If you want to use the scraper functions:
   ```bash
   supabase functions deploy scraper
   supabase functions deploy hadith-scraper
   supabase functions deploy divine-names-scraper
   ```

## Running the App

### Development Mode

```bash
npm run dev
```

This will start the Expo development server with tunnel mode enabled.

### Web Build

```bash
npm run build:web
```

### Running on Physical Device

1. Install the Expo Go app on your iOS or Android device
2. Scan the QR code shown in the terminal
3. The app will load on your device

## Project Structure

```
Ask-Ansar/
├── app/                      # Expo Router pages
│   ├── (auth)/              # Authentication screens
│   ├── (tabs)/              # Main tab navigation
│   └── api/                 # API routes
├── components/              # Reusable components
├── hooks/                   # Custom React hooks
├── store/                   # Zustand state stores
├── types/                   # TypeScript type definitions
├── utils/                   # Utility functions
├── supabase/               # Supabase migrations & functions
└── assets/                 # Images and static assets
```

## Key Features Explained

### Authentication
- Email/password authentication via Supabase
- Secure session management
- Password reset functionality

### Chat System
- Real-time AI responses
- Message history stored in Supabase
- Copy, share, and provide feedback on responses
- Reference citations for Quran and Hadith

### Knowledge Base
- Pre-loaded Islamic topics
- Quran verses with translations
- Authentic Hadith collections
- 99 Names of Allah with meanings

### Privacy & Settings
- Toggle conversation history saving
- Delete chat history
- Language preferences
- Privacy policy and terms

## Database Schema

The app uses these main tables:
- `chat_histories`: Stores user conversations
- `quran_verses`: Quran verses and translations
- `hadith_collection`: Authentic Hadith references
- `divine_names`: 99 Names of Allah

See `supabase/migrations/` for complete schema.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.

## Acknowledgments

- Quran data from various authentic sources
- Hadith collections from Sunnah.com
- OpenAI for AI capabilities
- Supabase for backend infrastructure
