import mongoose, {Schema} from "mongoose";

const crtermSchema = new Schema(
    {
        termCode:{
            type: String,
            required: [true, "Code is Mandatory!!"]
        },
        description:{
            type: String
        },
        days:{
            type: Number,
            required: [true, "Number of Days are Mandatory!!"]
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

export const Crtem = mongoose.model("Crterm", crtermSchema);