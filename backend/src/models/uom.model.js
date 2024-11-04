import mongoose, {Schema} from "mongoose";

const uomSchema = new Schema(
    {
        uomCode:{
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String
        },
        isActive:{
            type: Boolean,
            default: true
        }
    },
    {
        timestamps:true
    }
)

export const Uom = mongoose.model("Uom", uomSchema);