export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  clipUrl?: string;
  clipTitle?: string;
  hasSound?: boolean;
}

export interface GiphyClip {
  id: string;
  url: string;
  title: string;
  images: {
    original: {
      url: string;
    };
    fixed_height: {
      url: string;
    };
  };
}

export interface ChatSession {
  _id?: string;
  sessionId: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}