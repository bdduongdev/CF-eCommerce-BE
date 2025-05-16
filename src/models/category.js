import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const categorySchema = new Schema({
  category_name: {
    type: String,
    required: true,
    maxlength: 50
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

export default mongoose.model('Category', categorySchema);