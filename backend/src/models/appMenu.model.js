import mongoose, {Schema} from "mongoose";

const appMenuSchema = new Schema(
    {
        description:{
            type: String,
            unique: true,
            required: [true, "Description is Mandatory"]
        },
        parentMenu:{
            type: String
        },
        sortOrder:{
            type: Number,
            required: true
        },
        icon:{
            type: String
        },
        permissions:{
            type: [String],
            enum: ["add","edit","submit","approve","view"],
            required: true
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

export const AppMenu = mongoose.model("AppMenu", appMenuSchema);