"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

type Message = {
  roomId: string;
  sender: string;
  message: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  fileName?: string;
  readBy?: string[]; // Array of usernames who have read the message
  messageId?: string; // Unique identifier for each message
};

type Participant = {
  userId: string;
  userName: string;
};

const ChatRoom = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const params = useParams();
  const router = useRouter();
  const roomId = params.roomId as string;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Setup intersection observer to mark messages as read when they become visible
  useEffect(() => {
    const userName = localStorage.getItem("userName");
    if (!userName) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute('data-message-id');
            const messageSender = entry.target.getAttribute('data-sender');
            
            // Only mark messages from others as read
            if (messageId && messageSender !== userName) {
              // Find the message to check if it's already been read by this user
              const message = messages.find(m => m.messageId === messageId);
              if (message && (!message.readBy || !message.readBy.includes(userName))) {
                markMessageAsRead(messageId, userName);
              }
              
              // Stop observing this message once it's been read
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.5 }
    );
    
    // Observe all message elements that have messageIds and aren't from the current user
    messageRefs.current.forEach((element, messageId) => {
      const sender = element.getAttribute('data-sender');
      if (sender !== userName) {
        observer.observe(element);
      }
    });
    
    return () => {
      observer.disconnect();
    };
  }, [messages]);
  useEffect(() => {
    if (roomId) {
      const storedMessages = localStorage.getItem(`chat_messages_${roomId}`);
      if (storedMessages) {
        try {
          setMessages(JSON.parse(storedMessages));
        } catch (error) {
          console.error("Error parsing stored messages:", error);
        }
      }
    }
  }, [roomId]);

  useEffect(() => {
    if (roomId && messages.length > 0) {
      localStorage.setItem(`chat_messages_${roomId}`, JSON.stringify(messages));
    }
  }, [messages, roomId]);
  useEffect(() => {
    if (!roomId) return;

    const userName = localStorage.getItem("userName");

    if (!userName) {
      toast.error("Please set your username first");
      router.push("/");
      return;
    }

    fetch(`/api/messages?roomId=${roomId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          
          // Mark all messages as read
          data.messages.forEach((msg: Message) => {
            if (msg.sender !== userName && msg.messageId && (!msg.readBy || !msg.readBy.includes(userName))) {
              markMessageAsRead(msg.messageId, userName);
            }
          });
        }
      })
      .catch((err) => console.error("Error loading messages:", err));

    socket.emit("join-room", {
      roomId,
      userName,
    });    const handleReceiveMessage = (message: Message) => {
      setMessages((prev) => [...prev, message]);
      
      // Mark the message as read immediately (since we just received it)
      const userName = localStorage.getItem("userName");
      if (userName && message.messageId && message.sender !== userName) {
        markMessageAsRead(message.messageId, userName);
      }
    };
    
    const handleMessageRead = ({ messageId, userName }: { messageId: string, userName: string }) => {
      // Update message read status in our local state
      setMessages(prev => 
        prev.map(msg => 
          msg.messageId === messageId 
            ? { ...msg, readBy: [...(msg.readBy || []), userName] }
            : msg
        )
      );
    };
    const handleUserJoined = ({
      userName,
      timestamp,
    }: {
      userName: string;
      timestamp: Date;
    }) => {
      toast.info(`${userName} joined the room`);
      setParticipants((prev) => {
        // Only add user if they're not already in the list
        return prev.includes(userName) ? prev : [...prev, userName];
      });
    };

    const handleUserLeft = ({ userName }: { userName: string }) => {
      toast.info(`${userName} left the room`);
      setParticipants((prev) => prev.filter((name) => name !== userName));
    };

    const handleRoomJoined = ({
      roomName,
      participants,
    }: {
      roomName: string;
      participants: string[];
    }) => {
      setRoomName(roomName);
      setParticipants(participants);
    };    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-joined", handleUserJoined);
    socket.on("user-left", handleUserLeft);
    socket.on("room-joined", handleRoomJoined);
    socket.on("message-read", handleMessageRead);

    return () => {
      socket.emit("leave-room", { roomId });
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-joined", handleUserJoined);
      socket.off("user-left", handleUserLeft);
      socket.off("room-joined", handleRoomJoined);
      socket.off("message-read", handleMessageRead);
    };
  }, [roomId, router]);  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("File size must be less than 10MB");
      return;
    }

    const userName = localStorage.getItem("userName");
    if (!userName) {
      toast.error("Username not found");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          return newProgress >= 98 ? 98 : newProgress;
        });
      }, 300);

      // Upload the file
      const response = await fetch(`/api/upload?type=chat&roomId=${roomId}`, {
        method: "POST",
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      if (!response.ok) {
        throw new Error("Upload failed");
      }
      
      setUploadProgress(100);

      const data = await response.json();
      
      // Create message with media
      const timestamp = new Date();
      const messageData: Message = {
        roomId,
        message: file.name, // Use filename as message text
        sender: userName,
        timestamp,
        mediaUrl: data.url,
        mediaType: data.mediaType,
        fileName: data.fileName,
      };

      // Send via socket
      socket.emit("send-message", messageData);

      // Update local state
      setMessages((prev) => [...prev, messageData]);

      // Save to database
      await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  // Function to mark a message as read
  const markMessageAsRead = (messageId: string, userName: string) => {
    // Update on the server
    fetch("/api/messages", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messageId, userName }),
    }).catch(err => console.error("Error marking message as read:", err));
    
    // Notify other users via socket
    socket.emit("mark-message-read", { messageId, roomId, userName });
    
    // Update local state
    setMessages(prev => 
      prev.map(msg => 
        msg.messageId === messageId 
          ? { ...msg, readBy: [...(msg.readBy || []), userName] }
          : msg
      )
    );
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const userName = localStorage.getItem("userName");

    if (!userName) {
      toast.error("Username not found");
      return;
    }

    const timestamp = new Date();
    const messageId = new Date().getTime().toString(); // Generate a unique ID
    const messageData = {
      roomId,
      message: newMessage.trim(),
      sender: userName,
      timestamp,
      messageId,
      readBy: [userName], // Initially read by sender
    };

    socket.emit("send-message", messageData);

    setMessages((prev) => [...prev, messageData]);

    setNewMessage("");

    fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    }).catch((err) => console.error("Error saving message:", err));
  };

  return (
    <div className="flex flex-col h-[95vh] max-w-4xl mt-2 mx-auto">
      <div className="bg-purple-500 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">{roomName || "Chat Room"}</h2>
        <p className="text-sm">{participants.length} participants</p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 bg-white">          {messages.map((msg, idx) => {
            const isCurrentUser = msg.sender === localStorage.getItem("userName");
            return (              <div
                key={idx}
                ref={el => {
                  if (el && msg.messageId) {
                    messageRefs.current.set(msg.messageId, el);
                  }
                }}
                data-message-id={msg.messageId}
                data-sender={msg.sender}
                className={`p-3 rounded-lg my-2 max-w-sm ${
                  isCurrentUser
                    ? "ml-auto bg-purple-100"
                    : "mr-auto bg-gray-100"
                }`}
              ><div className="flex justify-between items-center mb-1">
                  <p className="text-xs text-gray-500 font-medium">{msg.sender}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                
                {/* Display media content based on type */}
                {msg.mediaUrl && msg.mediaType === 'image' && (
                  <div className="my-2 relative group">
                    <img 
                      src={msg.mediaUrl} 
                      alt={msg.fileName || "Image"} 
                      className="max-w-full rounded-md border border-gray-200 shadow-sm" 
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <a 
                        href={msg.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-white rounded-full shadow-md"
                        title="View original"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
                
                {msg.mediaUrl && msg.mediaType === 'video' && (
                  <div className="my-2">
                    <video 
                      src={msg.mediaUrl} 
                      controls 
                      className="max-w-full rounded-md border border-gray-200"
                      preload="metadata"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                )}
                
                {msg.mediaUrl && msg.mediaType === 'audio' && (
                  <div className="my-2">
                    <audio 
                      src={msg.mediaUrl} 
                      controls 
                      className="w-full"
                      preload="metadata"
                    >
                      Your browser does not support audio playback.
                    </audio>
                  </div>
                )}
                
                {msg.mediaUrl && msg.mediaType === 'document' && (
                  <div className="my-2 p-3 bg-white rounded-md border border-gray-200 flex items-center shadow-sm hover:shadow transition-shadow">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <a 
                        href={msg.mediaUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline font-medium truncate block"
                        download={msg.fileName}
                      >
                        {msg.fileName || "Document"}
                      </a>
                      <span className="text-xs text-gray-500">Click to download</span>
                    </div>
                  </div>
                )}
                  {/* Show message text if it's not just the filename */}
                {(!msg.mediaUrl || (msg.fileName && msg.message !== msg.fileName)) && (
                  <p className="break-words">{msg.message}</p>
                )}
                  {/* Add read receipt indicators */}
                {isCurrentUser && msg.readBy && msg.readBy.length > 1 && (
                  <div className="flex justify-end mt-1 relative group">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-3 w-3 mr-1 text-blue-500" 
                        viewBox="0 0 20 20" 
                        fill="currentColor"
                      >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Read by {msg.readBy.length - 1} {msg.readBy.length - 1 === 1 ? 'person' : 'people'}
                    </div>
                    
                    {/* Tooltip showing who read the message */}
                    <div className="absolute bottom-full right-0 mb-2 bg-black bg-opacity-75 text-white p-2 rounded text-xs 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 min-w-[120px] z-10 pointer-events-none">
                      <p className="font-semibold">Read by:</p>
                      <ul className="mt-1">
                        {msg.readBy
                          .filter(reader => reader !== msg.sender)
                          .map((reader, i) => (
                            <li key={i}>{reader}</li>
                          ))
                        }
                      </ul>
                      <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-black bg-opacity-75"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        {/* Participants sidebar */}{" "}
        <div className="w-64 bg-gray-100 p-4 overflow-y-auto hidden md:block">
          <h3 className="font-bold mb-2">
            Participants ({participants.length})
          </h3>
          <ul className="divide-y divide-gray-200">
            {participants.map((name, idx) => (
              <li key={idx} className="py-2 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                {name}
              </li>
            ))}
            {participants.length === 0 && (
              <li className="py-2 text-gray-500 italic">No participants yet</li>
            )}
          </ul>
        </div>
      </div>      {/* Message input */}
      <div className="p-4 bg-white border-t flex items-center">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
        />
          {/* File attachment button */}
        <Button 
          type="button"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className={`rounded-full p-2 h-10 w-10 flex items-center justify-center mr-2 ${isUploading ? 'animate-pulse bg-purple-100' : ''}`}
          title={isUploading ? "Uploading..." : "Attach media or document"}
        >
          {isUploading ? (
            <svg className="animate-spin h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
            </svg>
          )}
        </Button>
        
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={isUploading ? "Uploading..." : "Type a message..."}
          className="flex-1 mr-2"
          onKeyDown={(e) => e.key === "Enter" && !isUploading && sendMessage()}
          disabled={isUploading}
        />
        <Button onClick={sendMessage} disabled={!newMessage.trim() || isUploading}>
          Send
        </Button>
      </div>
    </div>
  );
};

export default ChatRoom;
