import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Conversation interface
export interface IConversation extends Document {
  participants: string[];  // userIds
  lastMessage: string;
  updatedAt: Date;
  createdAt: Date;
}

// Şema tanımı
const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  lastMessage: {
    type: String,
    default: ''
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Katılımcılar için benzersiz indeks oluşturma
// Önceki indeks, aynı katılımcılar arasında birden fazla konuşma oluşturulmasını engelliyordu
// Yeni indeks, katılımcıların sıralanmış bir şekilde benzersiz olmasını sağlayacak
conversationSchema.index({ participants: 1 }, { unique: false });

// Model oluşturma
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;
