import mongoose from 'mongoose';

// One-time sign-in links for the admin. Only a SHA-256 of the token is stored, so a
// database read cannot be replayed as a login. Rows delete themselves at expiresAt.
const LoginTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
    usedAt: { type: Date, default: null }
  },
  { timestamps: { createdAt: true, updatedAt: false }, versionKey: false }
);

export default mongoose.models.LoginToken ||
  mongoose.model('LoginToken', LoginTokenSchema, 'login_tokens');
