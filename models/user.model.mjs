import mongoose from "mongoose";
import cron from 'node-cron';
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    profile:{
        type:String,
        required:false
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    followers:
    {   type: Array,
        ref: "User",
        default: [],
        required: true
        
    },
    following:
    {
        type: Array,
        default: [],
        ref: "User",
       required: false
    },
    private: {
        type: Boolean,
        default: false,
    } ,
    time:{
        type: Number,
        required:false,
        default:120
    
    }  // private account

    
});

const User = mongoose.model('User', userSchema);


// Function to update time for all users
const updateUsersTime = async () => {
    try {
        const users = await User.find();
        const currentTime = new Date();
        const twoHoursLater = new Date(currentTime.getTime() + (2 * 60 * 60 * 1000)); // 2 hours later
        
        // Format time as needed (e.g., HH:mm)
        const formattedTime = `${twoHoursLater.getHours()}:${twoHoursLater.getMinutes()}`;
        //convert it into minutes
        const minutes = twoHoursLater.getHours()*60 + twoHoursLater.getMinutes();

        // Update time for each user
        for (const user of users) {
            user.time = minutes;
            await user.save();
        }

        console.log('Time updated for all users.');
    } catch (err) {
        console.error('Error updating time for users:', err);
    }
};

// Schedule the function to run every day at midnight
cron.schedule('0 0 * * *', () => {
    updateUsersTime();
    console.log('Daily time update task completed.');
});

export default User;