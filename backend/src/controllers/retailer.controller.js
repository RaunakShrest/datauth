import { ApiResponse } from "../utils/ApiResponse.js"
import { UserModel } from "../models/user.model.js"


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
export{getRetailers}