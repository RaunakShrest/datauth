import mongoose from "mongoose"
import { config } from "dotenv"

config()

const batchSchema = new mongoose.Schema(
    {
    //  _id: mongoose.Schema.Types.ObjectId,
        batchId: {
      type: String,
      required: true,
      unique:true
    },

    productName:{
        type:String,
        required:false
    },
  },
  { timestamps: true }
)

const BatchIdModal = mongoose.model("Batch", batchSchema)

export { BatchIdModal }
