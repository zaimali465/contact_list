import mongoose from 'mongoose'
import { hash, compare } from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await hash(this.password, 12)
  }
  next()
})

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return compare(candidatePassword, this.password)
}

export default mongoose.models.User || mongoose.model('User', userSchema)
