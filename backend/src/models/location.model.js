import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const locationSchema = new Schema(
    {
  locationCode: {
    type: String,
    required: true,
    index: true,
  },
  description: {
    type: String,
    required: true,
  },
  subsidary: {
    type: Schema.Types.ObjectId,
    ref: "Subsidary",
    required: true
  },
  isActive:{
    type: Boolean,
    default: false,
    required: true
  }
},
{
    timestamps: true
});
