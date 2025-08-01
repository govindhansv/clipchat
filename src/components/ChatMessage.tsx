'use client';

import { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-200 text-gray-800'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        
        {message.clipUrl && (
          <div className="mt-2">
            <img
              src={message.clipUrl}
              alt={message.clipTitle || 'Film clip'}
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
            />
            {message.clipTitle && (
              <p className="text-xs mt-1 opacity-75">{message.clipTitle}</p>
            )}
          </div>
        )}
        
        <p className="text-xs mt-1 opacity-75">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}