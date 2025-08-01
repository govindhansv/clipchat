import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { searchFilmClips } from '@/lib/giphy';
import { generateClipSearchQuery, generateBotResponse } from '@/lib/semantic-matcher';
import { ChatMessage, ChatSession } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: 'Message and sessionId are required' },
        { status: 400 }
      );
    }

    // Generate semantic search query
    const searchQuery = await generateClipSearchQuery(message);
    
    // Search for relevant clips
    const clips = await searchFilmClips(searchQuery, 5);
    
    // Select the best clip (first one for now, can be improved with better ranking)
    const selectedClip = clips[0];
    
    // Generate bot response
    const botResponseText = await generateBotResponse(message, selectedClip?.title);

    // Create user message
    const userMessage: ChatMessage = {
      id: uuidv4(),
      text: message,
      isUser: true,
      timestamp: new Date(),
    };

    // Create bot message with clip
    const botMessage: ChatMessage = {
      id: uuidv4(),
      text: botResponseText,
      isUser: false,
      timestamp: new Date(),
      clipUrl: selectedClip?.images.fixed_height.url,
      clipTitle: selectedClip?.title,
    };

    // Save to MongoDB
    const client = await clientPromise;
    const db = client.db('filmclipchat');
    const sessions = db.collection<ChatSession>('sessions');

    // Update or create session
    await sessions.updateOne(
      { sessionId },
      {
        $push: { messages: { $each: [userMessage, botMessage] } },
        $set: { updatedAt: new Date() },
        $setOnInsert: { 
          sessionId, 
          createdAt: new Date() 
        }
      },
      { upsert: true }
    );

    return NextResponse.json({
      userMessage,
      botMessage,
      searchQuery, // For debugging
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}