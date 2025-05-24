import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface ICounter extends Document {
  key: string;
  value: number;
}

const CounterSchema = new Schema<ICounter>({
  key: { type: String, required: true, unique: true },
  value: { type: Number, required: true, default: 0 },
});

export default models.Counter || model<ICounter>('Counter', CounterSchema);
