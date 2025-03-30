import mongoose, { Document } from 'mongoose';
import { Schema } from 'mongoose';

// Message interface
export interface IMessage extends Document {
  sender: string;   // userId
  receiver: string; // userId
  content: string;
  read: boolean;
  createdAt: Date;
}

// Şema tanımı
const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Gönderen alanı zorunludur']
  },
  receiver: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Alıcı alanı zorunludur']
  },
  content: {
    type: String,
    required: [true, 'Mesaj içeriği zorunludur'],
    trim: true,
    maxlength: [500, 'Mesaj en fazla 500 karakter olabilir']
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Model oluşturma
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
