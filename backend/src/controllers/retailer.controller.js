import { ApiResponse } from "../utils/ApiResponse.js"
import { UserModel } from "../models/user.model.js"
import {sendBulkEmail} from "../middlewares/sendEmail.middleware.js"

const getRetailers= async(req,res,next)=>{
    try {
        const retailers= await UserModel.find({userType:"retailer"})
        return res.status(200).json(new ApiResponse(200, retailers,"Retailers fetched sucessfully"))
    } catch (error) {
        if(!error.message){
            error.message="something went wrong while fetching retailers"
        }
        next(error)
        
    }
}
const updateRetailerStatus = async (req, res, next) => {
  const { id } = req.params; 
  const { status } = req.body; 
  const trimmedId = id.trim();
  if (!trimmedId || !status) {
    return res.status(400).json(new ApiResponse(400, null, "Retailer ID and status are required."));
  }

  try {
    const updatedRetailer = await UserModel.findByIdAndUpdate(
      trimmedId, 
      { status: status }, 
      { new: true, select: "-__v -password -refreshToken" } 
    );
    if (!updatedRetailer) {
      return res.status(404).json(new ApiResponse(404, null, "Retailer not found."));
    }
    if (status.toLowerCase() === 'verified') {
      const emailOptions = [{
        from: process.env.SENDER_ADDRESS,
        to: updatedRetailer.email, 
        subject: 'Retailer Verified',
        text: `Dear ${updatedRetailer.companyName}, your retailer status has been  "verified" .`,
        html: `<p>Dear ${updatedRetailer.companyName},</p><p>Your retailer status has been updated to <strong>"verified"</strong>.</p>`,
      }];

      const emailResult = await sendBulkEmail(emailOptions);
      console.log('Email sent: ', emailResult);
    }

    return res.status(200).json(new ApiResponse(200, updatedRetailer, "Company status updated successfully."));
  } catch (error) {
    if (!error.message) {
      error.message = "Something went wrong while updating the company status.";
    }
    next(error);
  }
};
export{getRetailers,updateRetailerStatus}