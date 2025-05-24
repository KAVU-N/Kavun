import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICount extends Document {
  total: number;
}

const CountSchema = new Schema<ICount>({
  total: { type: Number, required: true, default: 0 },
});

export default models.Count || model<ICount>('Count', CountSchema);
