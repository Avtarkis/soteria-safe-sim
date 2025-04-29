
import React, { useState, useRef } from 'react';
import { format } from 'date-fns';
import { TicketMessage } from '@/types/support';
import { MessageCircle, Send, Paperclip } from 'lucide-react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface ConversationPanelProps {
  messages: TicketMessage[];
  ticketStatus: string;
  userEmail?: string;
  sendingMessage: boolean;
  onSendMessage: (message: string) => void;
}

export const ConversationPanel = ({
  messages,
  ticketStatus,
  userEmail,
  sendingMessage,
  onSendMessage
}: ConversationPanelProps) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2" />
          Conversation
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6 max-h-[500px] overflow-y-auto pb-6">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>No messages yet. Start the conversation by sending a message below.</p>
            </div>
          ) : (
            messages.map(message => (
              <div key={message.id} className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex ${message.isAdmin ? 'flex-row-reverse' : 'flex-row'} gap-3 max-w-[80%]`}>
                  <Avatar className="h-8 w-8">
                    {!message.isAdmin ? (
                      <AvatarFallback>
                        {userEmail?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    ) : (
                      <>
                        <AvatarImage src="/logo.svg" alt="Support Agent" />
                        <AvatarFallback className="bg-primary text-primary-foreground">SA</AvatarFallback>
                      </>
                    )}
                  </Avatar>
                  
                  <div>
                    <div className={`rounded-lg p-3 ${
                      message.isAdmin 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}>
                      <p className="whitespace-pre-wrap">{message.message}</p>
                      {message.attachmentUrl && (
                        <div className="mt-2">
                          <a 
                            href={message.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm underline"
                          >
                            <Paperclip className="h-3 w-3 mr-1" />
                            Attachment
                          </a>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(message.createdAt), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {ticketStatus !== 'closed' && (
        <>
          <Separator />
          <CardFooter className="pt-4">
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="Type your response here..."
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  onClick={handleSend}
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendingMessage ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  );
};
