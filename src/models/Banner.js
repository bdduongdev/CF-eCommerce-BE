import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const BannerSchema = new Schema({
  title: {
    type: String,
    maxlength: 100
  },
  image_url: {
    type: String,
    required: true,
    maxlength: 255
  },
  link_url: {
    type: String,
    maxlength: 255
  },
  position: {
    type: String,
    maxlength: 50
  },
  is_active: {
    type: Boolean,
    default: true
  },
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  is_deleted: {
    type: Boolean,
    default: false
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

export default mongoose.model('Banner', BannerSchema);