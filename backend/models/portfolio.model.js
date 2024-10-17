import mongoose from 'mongoose';

const assetSchema = new mongoose.Schema({
  coinId: { type: String, required: true },
  amount: { type: Number, required: true },
  purchasePrice: { type: Number },
  purchaseDate: { type: Date }
});

const portfolioSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  assets: [assetSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;