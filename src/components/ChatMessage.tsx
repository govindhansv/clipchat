'use client';

import Image from 'next/image';
import { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <div className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.isUser
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white shadow-sm'
        }`}
      >
        <p className="text-sm">{message.text}</p>
        
        {message.clipUrl && (
          <div className="mt-2">
            {message.clipUrl.endsWith('.mp4') ? (
              <video
                src={message.clipUrl}
                className="rounded-lg max-w-full h-auto"
                controls
                autoPlay
                muted={false}
                loop
              />
            ) : (
              <Image
                src={message.clipUrl}
                alt={message.clipTitle || 'Film clip'}
                className="rounded-lg max-w-full h-auto"
                width={400}
                height={300}
                loading="lazy"
              />
            )}
            {message.clipTitle && (
              <p className="text-xs mt-1 opacity-75">{message.clipTitle}</p>
            )}
          </div>
        )}
        
        <p className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}