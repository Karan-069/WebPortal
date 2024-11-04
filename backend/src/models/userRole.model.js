import mongoose, {Schema} from "mongoose";

const userRoleSchema = new Schema(
    {
        roleCode:{
            type: String,
            required: [true, "Role Code is Mandatory!!"],
            unique: true
        },        
        menuId:{
            type: Schema.Types.ObjectId,
            ref: "appMenu",
            required: [true, "Menu is Mandatory!!"]
        },
        description:{
            type: String,
            required: true
        },
        permissions:{
            type: [String],
            enum: ["add","edit","approve","view","submit"],
            required: [true, "Permissions are Mandatory!!"]
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

export const UserRole = mongoose.model("UserRole", userRoleSchema)