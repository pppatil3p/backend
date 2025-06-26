import { asyncHandler } from "../utils/asyncHandler.js";
import {apierror} from "../utils/apierror.js"
import { User  } from "../model/user.model.js";
import{uploadOnCLoudinary} from "../utils/cloudinary.js"
import e from "cors";
import { apiresponse } from "../utils/apiresponse.js";
const registerUser =asyncHandler(async(req,res)=>{
 
  const{fullname,email,username,password}=req.body
   console.log("email: ",email) ;  
   if(
    [fullname,email,username,password].some((field)=>field?.trim()==="")
   ){
       throw new apierror(400,"All fields are required")
    }
    const existeduser=User.findOne({
      $or:[{username},{email}]
    })
    if(existeduser){
      throw new apierror(409,"User with email or username already exists")
    }
    const avatarLoclpth=req.files?.avatar[0]?.path;
   const coverimage= req.files?.coverImage[0]?.path;

if(!avatarLoclpth){
  throw new apierror(400,"Avatar file is required")
}
const avatar=await uploadOnCLoudinary(avatarLoclpth)
const coverImage=await uploadOnCLoudinary(coverimage)
if(!avatar){
  throw new apierror(400,"avatar file is required") 
}
User.create({
  fullname,
  avatar:avatar.url,
  coverimage:coverimage.url||"",
  email,
  password,
  username:username.tolowerCase()
})

const createduser=User.findById(User._id).select(
  "-password -refreshtoken"
)
if(!createduser){
  throw new apierror(500,"something went wrong")
}
return res.status(201).json(
new apiresponse(200,createduser,"User registred successfully")
)
  })

export{registerUser}