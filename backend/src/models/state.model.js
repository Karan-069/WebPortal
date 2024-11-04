import mongoose, {Schema} from "mongoose";

const stateSchema = new Schema(
    {
        description:{
            type: String,
            required: true,
            unique: true
        },
        shortName:{
            type: String
        },
        gstCode:{
            type: String,
            required: true,
            unique: true
        },
        region:{
            type: String
        },
        isActive:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
)


export const State = mongoose.model("State", stateSchema);