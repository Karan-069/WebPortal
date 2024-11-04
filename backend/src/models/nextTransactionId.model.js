import mongoose, {Schema} from "mongoose";

const nextTransactionIdSchema = new Schema(
    {
        menuId:{
            type: String,
            required: true
        },
        prefix:{
            type: String,
            required: true
        },
        sequenceValue:{
            type: Number,
            default: 0
        }
    }
)

export const NextTransactionId = mongoose.model("NextTransactionId", nextTransactionIdSchema);