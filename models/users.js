import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    personal_id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String
    },
    phone_number: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    }
}, { timestamps: true });

export default mongoose.model('Users', userSchema);