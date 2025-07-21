import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    isEducator: {
        type: Boolean,
        default: false,
    },
    enrolledCourses: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'course',
        }
    ],
}, {minimize:false, timestamps: true});

const User = mongoose.model('user', userSchema);

export default User;