import mongoose,{Schema} from "mongoose";

const subscriptionSchema =new Schema({
    suscriber:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    channel:{
        type: Schema.Types.ObjectId,
        ref:"User"
    },
},
{timestamps})

export const Suscription = mongoose.model("subscripton",subscriptionSchema)