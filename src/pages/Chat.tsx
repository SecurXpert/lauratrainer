import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Search } from 'lucide-react';
import { mockChats } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<typeof mockChats[0] | null>(mockChats[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const mockMessages = [
    { id: 1, sender: 'student', text: 'When is the next quiz scheduled?', time: '10:25 AM' },
    { id: 2, sender: 'instructor', text: 'The next quiz is scheduled for January 20th at 10:00 AM.', time: '10:30 AM' },
    { id: 3, sender: 'student', text: 'Thank you! What topics will it cover?', time: '10:32 AM' },
    { id: 4, sender: 'instructor', text: 'It will cover ES6 features, async/await, and promises.', time: '10:35 AM' }
  ];

  const handleSend = () => {
    if (message.trim()) {
      // Mock sending message
      setMessage('');
    }
  };

  const filteredChats = mockChats.filter(chat =>
    chat.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.studentId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Chat</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
        {/* Chat List */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by student ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
          <CardContent className="p-0">
            <ScrollArea className="h-[calc(100vh-420px)]">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id ? 'bg-muted' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedChat(chat)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {chat.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold truncate">{chat.studentName}</h4>
                        {chat.unread && (
                          <Badge className="bg-primary">New</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {chat.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 shadow-soft flex flex-col">
          {selectedChat ? (
            <>
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {selectedChat.studentName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{selectedChat.studentName}</CardTitle>
                    <p className="text-sm text-muted-foreground">Student ID: {selectedChat.studentId}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-[calc(100vh-500px)] p-4">
                  <div className="space-y-4">
                    {mockMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'instructor' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            msg.sender === 'instructor'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'instructor'
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}>
                            {msg.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button onClick={handleSend}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Select a chat to start messaging</p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Chat;
