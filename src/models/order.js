import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coupon_id: {
    type: Schema.Types.ObjectId,
    ref: 'Coupon'
  },
  order_number: {
    type: String,
    unique: true,
    required: true
  },
  order_date: {
    type: Date,
    default: Date.now
  },
  shipping_address: {
    fullname: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    street: {
      type: String,
      required: true,
      trim: true
    },
    ward: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      default: "Việt Nam",
      trim: true
    }
  },
  payment_method: {
    type: String,
    enum: ['cod', 'bank_transfer', 'credit_card', 'momo', 'vnpay'],
    required: true
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  discount_amount: {
    type: Number,
    default: 0
  },
  shipping_fee: {
    type: Number,
    default: 0
  },
  total_amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  note: {
    type: String,
    trim: true
  },
  tracking_number: {
    type: String,
    trim: true
  },
  estimated_delivery: {
    type: Date
  },
  delivered_at: {
    type: Date
  },
  cancelled_at: {
    type: Date
  },
  cancelled_reason: {
    type: String,
    trim: true
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
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  indexes: [
    { key: { user_id: 1 } },
    { key: { order_number: 1 } },
    { key: { status: 1 } },
    { key: { order_date: -1 } }
  ]
});

OrderSchema.pre('save', function(next) {
  if (!this.order_number) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.order_number = `ORD${timestamp}${random}`;
  }
  next();
});

export default mongoose.model('Order', OrderSchema);