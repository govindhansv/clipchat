# 🎬 FilmClip Chat

An AI-powered chat application that responds to user messages with contextually relevant film clips from Giphy. Built with Next.js, MongoDB, and Gemini AI for semantic matching.

## Features

- **AI-Powered Semantic Matching**: Uses Google's Gemini AI to understand user messages and find relevant film clips
- **Real-time Chat Interface**: Clean, responsive chat UI with message history
- **Film Clip Integration**: Searches and displays relevant movie/film GIFs from Giphy
- **Persistent Chat History**: Stores conversations in MongoDB for continuity
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **AI**: Google Gemini AI for semantic matching
- **Media**: Giphy API for film clips
- **Language**: TypeScript

## Getting Started

1. **Clone and install dependencies**:
```bash
npm install
```

2. **Set up environment variables**:
Create a `.env` file with:
```env
GEMINI_API_KEY=your_gemini_api_key
GIPHY_API_KEY=your_giphy_api_key
MONGODB_URI=your_mongodb_connection_string
```

3. **Run the development server**:
```bash
npm run dev
```

4. **Open your browser**:
Navigate to [http://localhost:3000](http://localhost:3000)

## How It Works

1. **User Input**: User types a message in the chat interface
2. **Semantic Analysis**: Gemini AI analyzes the message to extract relevant keywords and emotions
3. **Clip Search**: The system searches Giphy for film clips matching the semantic context
4. **Response Generation**: AI generates a contextual response referencing the selected clip
5. **Display**: Both the response and film clip are displayed in the chat
6. **Persistence**: The conversation is saved to MongoDB for future reference

## API Endpoints

- `POST /api/chat` - Send a message and receive a response with film clip
- `GET /api/chat/history?sessionId=<id>` - Retrieve chat history for a session

## Project Structure

```
src/
├── app/
│   ├── api/chat/          # Chat API endpoints
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main chat page
├── components/
│   ├── ChatInterface.tsx  # Main chat component
│   ├── ChatMessage.tsx    # Individual message component
│   └── ChatInput.tsx      # Message input component
└── lib/
    ├── mongodb.ts         # MongoDB connection
    ├── giphy.ts           # Giphy API integration
    ├── semantic-matcher.ts # AI semantic matching
    └── types.ts           # TypeScript types
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE).