import mongoose, {Schema} from "mongoose";

const itemSchema = new Schema(
    {
        itemCode:{
            type: String,
            required: true,
            unique: true,
            index: true
        },
        description:{
            type: string,
            required : [true, "Descripion is Mandatory!!"],
            unique: true
        },
        shName:{
            type: String,
            required: [true, "Short Name is Mandatory!!"]
        },
        itemCategory:{
            type: String
        },
        gstRate:{
            type: Number,
            required: [true, "GST Rate is Mandatory!!"]
        },
        hsnCode:{
            type: Number,
            required: [true, "HSN Code is Mandatory!!"]
        },
        itemType:{
            type: String,
            enum: ["captialGoods", "services", "goods"],
            required: true
        },
        uom:{
            type: Schema.Types.ObjectId,
            ref: "Uom"
        },
        isActive:{
            type: Boolean,
            default: true
        }
    }
)

itemSchema.pre("save", async function (next) {
    if (this.isNew) {
        try {
            const nextItemId = await NextTransactionId.findOneAndUpdate(
                { menuId: 'item' },
                { $inc: { sequenceValue: 1 } },
                { new: true, upsert: true } // Create if it doesn't exist
            );

            let prefix;
            switch (this.itemType.toLowerCase()) {
                case "capitalgoods":
                    prefix = "CG";
                    break;
                case "services":
                    prefix = "S";
                    break;
                default:
                    prefix = "G";
            }

            this.itemCode = `${prefix}-${String(nextItemId.sequenceValue).padStart(3, '0')}`;
            next();
        } catch (error) {
            next(error); // Pass error to next middleware
        }
    }
});


export const Item = mongoose.model("Item", itemSchema);