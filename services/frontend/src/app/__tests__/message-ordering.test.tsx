import { render, screen } from '@testing-library/react';
import ChatInterface from '../../components/chat/ChatInterface';
import { ChatMessage } from '../../types/chatHistory';

// Mock the BubbleTrail component
jest.mock('../BubbleTrail', () => ({
  __esModule: true,
  default: () => <div data-testid='bubble-trail' />,
}));

describe('Message Ordering Tests', () => {
  test('should display messages in chronological order by timestamp', () => {
    // Create messages with timestamps that would be out of order if sorted by array index
    const chatHistory: ChatMessage[] = [
      {
        role: 'user',
        content: 'First message (timestamp 1000)',
        timestamp: 1000,
      },
      {
        role: 'assistant',
        content: 'Second message (timestamp 3000)',
        timestamp: 3000,
      },
      {
        role: 'user',
        content: 'Third message (timestamp 2000)',
        timestamp: 2000,
      },
    ];

    render(
      <ChatInterface
        chatHistory={chatHistory}
        pendingResponses={[]}
        onResponseSelect={() => {}}
        isConnected={false}
        currentSpeakerMessage=''
      />,
    );

    // Check that all messages are present and in correct chronological order
    expect(
      screen.getByText('First message (timestamp 1000)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Third message (timestamp 2000)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Second message (timestamp 3000)'),
    ).toBeInTheDocument();

    // Get all message text content in document order
    const messageTexts = screen.getAllByText(/message \(timestamp \d+\)/);
    expect(messageTexts).toHaveLength(3);

    // Verify they appear in chronological order (1000, 2000, 3000)
    expect(messageTexts[0]).toHaveTextContent('First message (timestamp 1000)');
    expect(messageTexts[1]).toHaveTextContent('Third message (timestamp 2000)');
    expect(messageTexts[2]).toHaveTextContent(
      'Second message (timestamp 3000)',
    );
  });

  test('should handle messages with same timestamp', () => {
    const chatHistory: ChatMessage[] = [
      {
        role: 'user',
        content: 'Message A',
        timestamp: 1000,
      },
      {
        role: 'assistant',
        content: 'Message B',
        timestamp: 1000,
      },
    ];

    render(
      <ChatInterface
        chatHistory={chatHistory}
        pendingResponses={[]}
        onResponseSelect={() => {}}
        isConnected={false}
        currentSpeakerMessage=''
      />,
    );

    // Should render both messages without errors
    expect(screen.getByText('Message A')).toBeInTheDocument();
    expect(screen.getByText('Message B')).toBeInTheDocument();
  });

  test('should handle empty chat history', () => {
    render(
      <ChatInterface
        chatHistory={[]}
        currentSpeakerMessage=''
        isConnected={false}
        onSendMessage={() => {}}
        textInput=''
        onTextInputChange={() => {}}
        errors={[]}
        setErrors={() => {}}
      />,
    );

    // Should show empty state message
    expect(screen.getByText('Connect to get started')).toBeInTheDocument();
  });
});
