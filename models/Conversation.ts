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

// Katılımcılar için indeks oluşturma
// Benzersiz indeksi tamamen kaldırıyoruz, çünkü aynı katılımcılar arasında birden fazla konuşma olabilir
// Bunun yerine, konuşmaları daha hızlı bulmak için standart bir indeks kullanıyoruz
conversationSchema.index({ participants: 1 });

// Model oluşturma
const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);

export default Conversation;
