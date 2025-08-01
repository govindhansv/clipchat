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

    // Generate search query with timeout
    const searchQuery = await Promise.race([
      generateClipSearchQuery(message),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Search query timeout')), 5000)
      )
    ]).catch(() => {
      console.warn('Search query generation timed out, using fallback');
      return message.split(' ').slice(0, 3).join(' '); // Simple fallback
    });
    
    // Search for clips
    const clips = await searchFilmClips(searchQuery, 5);
    const selectedClip = clips[0];
    
    // Generate bot response with timeout (now that we have the clip)
    const botResponseText = await Promise.race([
      generateBotResponse(message, selectedClip?.title),
      new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Bot response timeout')), 5000)
      )
    ]).catch(() => {
      console.warn('Bot response generation timed out, using fallback');
      return selectedClip?.title 
        ? `Check out this "${selectedClip.title}" clip! 🎬`
        : "Here's a clip that matches your vibe! 🎬";
    });

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