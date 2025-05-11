import mongoose, { Schema } from "mongoose";

export interface IMessage {
  roomId: string;
  message: string;
  sender: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: string; // 'image', 'video', 'audio', 'document'
  fileName?: string;
  readBy?: string[]; // Array of usernames who have read the message
  messageId?: string; // Unique identifier for each message
}

const MessageSchema = new Schema<IMessage>({
  roomId: {
    type: String,
    required: true,
    index: true
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  mediaUrl: {
    type: String,
    required: false
  },
  mediaType: {
    type: String,
    required: false,
    enum: ['image', 'video', 'audio', 'document', null]
  },
  fileName: {
    type: String,
    required: false
  },
  readBy: {
    type: [String],
    default: []
  },
  messageId: {
    type: String,
    default: () => new mongoose.Types.ObjectId().toString()
  }
});

const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

export default Message;
