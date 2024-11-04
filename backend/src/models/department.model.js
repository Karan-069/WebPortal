import mongoose, {Schema} from "mongoose";

const departmentSchema = new Schema(
    {
        deptCode:{
            type: String,
            required: true,
            unique: true
        },
        description:{
            type: String
        },
        departmentHead:{
            type: String
        },
        location:{
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

export const Department = mongoose.model("Department", departmentSchema);