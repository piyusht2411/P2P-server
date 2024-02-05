import mongoose from 'mongoose';
//schema of users
const schema = new mongoose.Schema({
  refreshToken: {
    type: String,
    required: true
  },
  tokenId: {
    type: String,
    required: true
  }
}, { timestamps: true });


export default mongoose.model('Refresh', schema)