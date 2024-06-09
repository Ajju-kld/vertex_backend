

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({ 
sender:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
receiver:{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
    content: {
        type: String,
        required: false
    },
    media:{
        type: String,
required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

export default messageSchema;