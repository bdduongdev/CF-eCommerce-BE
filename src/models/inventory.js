import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const inventorySchema = new Schema({
  product_id: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  change_type: {
    type: String,
    required: true,
    enum: ['import', 'sale', 'return', 'adjustment'],
    maxlength: 20
  },
  quantity_change: {
    type: Number,
    required: true
  },
  stock_after_change: {
    type: Number
  },
  note: {
    type: String
  },
  changed_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'changed_at' }
});

export default mongoose.model('Inventory', inventorySchema);