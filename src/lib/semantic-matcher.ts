import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('Please add your Gemini API key to .env');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateClipSearchQuery(userMessage: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are an AI that helps find relevant film clips for user messages.
    Generate 2-4 SHORT, specific keywords that would help find appropriate movie/film clips or GIFs.
    
    IMPORTANT CONSTRAINTS:
    - Maximum 50 characters total for all keywords combined
    - Focus on the MOST important emotions, actions, or themes
    - Prioritize: emotions > actions > descriptive words
    - Avoid generic words like "good", "bad", "nice"
    - Don't include "movie", "film", "cinema" (added automatically)
    
    Examples:
    "I'm feeling betrayed by my friend" → "betrayal trust broken"
    "Having an identity crisis at work" → "identity crisis confusion"
    "So excited for the weekend!" → "excited celebration joy"
    
    User message: "${userMessage}"
    
    Respond with ONLY the keywords, separated by spaces. Keep it under 50 characters total.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating search query:', error);
    // Fallback to simple keyword extraction
    return userMessage.split(' ').slice(0, 3).join(' ');
  }
}

export async function generateBotResponse(userMessage: string, clipTitle?: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
    You are a friendly chat bot that responds to user messages with film/movie references and shares relevant clips.
    
    User message: "${userMessage}"
    ${clipTitle ? `Selected clip: "${clipTitle}"` : ''}
    
    Generate a brief, conversational response (1-2 sentences) that:
    - Acknowledges the user's message
    - References the film clip you're sharing (if provided)
    - Maintains a casual, friendly tone
    - Relates to movies/cinema when appropriate
    
    Keep it short and engaging!
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating bot response:', error);
    return "I found a great clip that matches your vibe! 🎬";
  }
}