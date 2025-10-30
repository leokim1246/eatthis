import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema({
  name: String,
  address: String,
  priceRange: String,
  distanceM: Number,
  placeId: String,
  link: String,
  reason: String
}, { _id: false });

const recSchema = new mongoose.Schema({
  searchId: { type: mongoose.Types.ObjectId, unique: true, index: true, required: true },
  summary: {
    weather: String,
    pick_reason: String
  },
  restaurants: [placeSchema],
  cafes: [placeSchema],
  raw: mongoose.Schema.Types.Mixed
}, { timestamps: true });

export default mongoose.model('Recommendation', recSchema);

