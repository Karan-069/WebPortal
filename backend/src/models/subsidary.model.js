import mongoose, {Schema} from "mongoose";


const subsidarySchema = new Schema(
    {
        code:{
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String,
            required : true,
            unique: true
        },
        address1:{
            type: String
        },
        address2:{
            type: String
        },
        city:{
            type: Schema.Types.ObjectId,
            ref : "City",
            required: [true, "City is Mandatory!!"]
        },
        stateCode:{
            type: Schema.Types.ObjectId,
            ref: "StateCode",
            required: [true, "State Code is Mandatory!!"]
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


export const Subsidary = mongoose.model("Subsidary", subsidarySchema);