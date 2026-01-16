export type ChatRole = 'user' | 'assistant' | 'system';

export type ChatMessage = {
  role: ChatRole;
  content: string;
  timestamp: number;
  messageId?: string; // Optional UUID for writer messages to enable audio replay
};
