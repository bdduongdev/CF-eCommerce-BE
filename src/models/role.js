import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const roleSchema = new Schema({
  role_name: {
    type: String,
    required: true,
    unique: true,
    maxlength: 50
  }
});

export default mongoose.model('Role', roleSchema);