import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const productStorageSchema = new Schema({
  storage_name: {
    type: String,
    required: true,
    maxlength: 100
  },
  price: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

export default mongoose.model('ProductStorage', productStorageSchema);