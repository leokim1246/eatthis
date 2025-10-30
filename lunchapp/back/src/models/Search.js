import mongoose from 'mongoose';

const searchSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, index: true, required: true },
  query: {
    location: String,
    mood: String,
    budget: Number,
    companions: String
  },
  status: { type: String, enum: ['pending','done','failed'], default: 'pending' }
}, { timestamps: true });

export default mongoose.model('Search', searchSchema);

