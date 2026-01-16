import { STATIC_MESSAGE_UUIDS, STATIC_MESSAGES } from '@/constants';
import { ChatMessage } from '@/types/chatHistory';
import { Conversation, isSpeakerMessage, isWriterMessage } from './userData';

export function convertConversationToChat(
  conversation: Conversation,
): ChatMessage[] {
  return conversation.messages.map((message, index): ChatMessage => {
    if (isSpeakerMessage(message)) {
      return {
        role: 'user',
        content: message.content,
        timestamp: Date.now() + index,
      };
    }
    if (isWriterMessage(message)) {
      return {
        role: 'assistant',
        content: message.content,
        timestamp: Date.now() + index,
      };
    }
    return {
      role: 'user',
      content: 'Unknown message type',
      timestamp: Date.now() + index,
    };
  });
}

export const STATIC_CONTEXT_OPTION = {
  id: 'static-context-question',
  text: STATIC_MESSAGES.CONTEXT_QUESTION,
  isComplete: true,
  messageId: STATIC_MESSAGE_UUIDS.CONTEXT_QUESTION,
};

export const STATIC_REPEAT_OPTION = {
  id: 'static-repeat-question',
  text: STATIC_MESSAGES.REPEAT_QUESTION,
  isComplete: true,
  messageId: STATIC_MESSAGE_UUIDS.REPEAT_QUESTION,
};
