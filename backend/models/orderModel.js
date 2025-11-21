import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional for guest
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      productSnapshot: { type: mongoose.Schema.Types.Mixed },
      option: { type: Object },
      quantity: { type: Number, default: 1 },
      price: { type: Number, default: 0 },
    }
  ],
  amount: { type: Number, default: 0 },
  status: { type: String, default: 'new' }, // new / pending / ready / out-for-delivery / delivered / cancelled
  deliveryInfo: { type: Object },
  paymentMethod: { type: String, default: 'cod' },
  date: { type: Date, default: Date.now },
  tracking: {
    courier: { type: String, default: '' },
    trackingNumber: { type: String, default: '' },
    driver: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' }
    },
    history: [{
      status: String,
      at: Date,
      note: String,
      courier: String,
      trackingNumber: String
    }],
    lastUpdated: { type: Date, default: Date.now }
  }
}, { timestamps: true });


const order = mongoose.models.order || mongoose.model('order', orderSchema);
export default order;