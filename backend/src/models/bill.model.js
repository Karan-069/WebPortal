import mongoose, {Schema} from "mongoose";


const itemDetailSchema = new Schema(
    {
        billTransactionId:{
            type: Schema.Types.ObjectId,
            ref: "Bill"
        },
        itemCode:{
            type: Schema.Types.ObjectId,
            ref: "Item"
        },
        uom:{
            type: Schema.Types.ObjectId,
            ref: "Uom"
        },
        quantity:{
            type: Number,
            min: [0, "Quantity cannot be lesss than 0"]
        },
        rate:{
            type: mongoose.Types.Decimal128
        },
        taxRate:{
            type: Number
        },
        taxAmount:{
            type: mongoose.Types.Decimal128
        },
        totalAmount:{
            type: mongoose.Types.Decimal128
        },
        remarks:{
            type: String,
            maxLength: 150
        }
    }
)

// Unique Compound Index for billTransactionId and itemCode
itemDetailSchema.index({ billTransactionId: 1, itemCode: 1 }, { unique: true });

// Pre-save middleware for itemDetailSchema
itemDetailSchema.pre("save", function(next) {
    // Calculate the expected amounts
    const calculatedTaxAmount = (this.quantity * this.rate) * (this.taxRate / 100);
    const calculatedTotal = (this.quantity * this.rate) + calculatedTaxAmount;

    // Convert calculated values to Decimal128
    const calculatedTaxAmountDecimal = mongoose.Types.Decimal128.fromString(calculatedTaxAmount.toFixed(2));
    const calculatedTotalDecimal = mongoose.Types.Decimal128.fromString(calculatedTotal.toFixed(2));

    // Check if the provided taxAmount matches the calculated tax amount
    if (this.taxAmount && this.taxAmount.toString() !== calculatedTaxAmountDecimal.toString()) {
        return next(new Error(`The provided taxAmount ${this.taxAmount} does not match the calculated tax amount ${calculatedTaxAmountDecimal}.`));
    }

    // Check if the provided totalAmount matches the calculated total
    if (this.totalAmount && this.totalAmount.toString() !== calculatedTotalDecimal.toString()) {
        return next(new Error(`The provided totalAmount ${this.totalAmount} does not match the calculated total ${calculatedTotalDecimal}.`));
    }

    // If all checks pass, proceed
    next();
});

const ItemDetail = mongoose.model("ItemDetail", itemDetailSchema)


const billSchema = new Schema(
    {
        transactionId:{
            type: String,
            required: true,
            unique: true,
            index: true
        },
        transactionStatus:{
            type: String,
            enum: ["save", "submit"]
        },
        vendor:{
            type: Schema.Types.ObjectId,
            ref: "Vendor",
            required: [true, "Vendor is Mandatory!!"],
            index: true
        },
        subsidiary:{
            type: Schema.Types.ObjectId,
            ref: "Subsidary"
        },
        department:{
            type: Schema.Types.ObjectId,
            ref: "Department"
        },
        invoiceNo:{
            type: String,
            required: true,
            unique: [true, "Duplicate Invoice Number!!"]
        },
        invoiceDate:{
            type: Date
        },
        remarks:{
            type: String,
            maxLength: 200
        },
        workflowId:{
            type: Schema.Types.ObjectId,
            ref: "Workflow"
        },
        workflowStatus:{
            type: String,
            enum: ["pending","completed"],
            default: "pending"
        },
        invoiceType:{
            type: String
        },
        invoiceClassification:{
            type: String,
            enum: ["opex", "capex"]
        },
        createdBy:{
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        billTotalAmount:{
            type : mongoose.Types.Decimal128
        },
        attachmnetUrl:{
            type: String
        },
        itemDetails: [itemDetailSchema]

    },
    {
        timestamps: true
    }
)

// Pre-save middleware to calculate total and validate
billSchema.pre("save", function(next) {
    // Calculate total amount based on itemDetails
    const calculatedTotal = this.itemDetails.reduce((total, item) => {
        const itemTotal = item.quantity * item.rate * (1 + item.taxRate / 100);
        return total + itemTotal;
    }, 0);

    // Convert calculatedTotal to Decimal128
    const calculatedTotalDecimal = mongoose.Types.Decimal128.fromString(calculatedTotal.toFixed(2));

    // Check if the provided billTotalAmount matches the calculated total
    if (this.billTotalAmount && this.billTotalAmount.toString() !== calculatedTotalDecimal.toString()) {
    return next(new Error(`Total amount mismatch: provided ${this.billTotalAmount} vs calculated ${calculatedTotalDecimal}`));
    }


    // If all checks pass, proceed
    next();
});


const Bill = mongoose.model("Bill", billSchema);

module.exports = {
    ItemDetail,
    Bill
};