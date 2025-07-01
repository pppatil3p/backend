import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";
import jwt from "jsonwebtoken";

// Generate tokens for a user
const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new apierror(404, "User not found when generating tokens");
    }

    if (typeof user.generateAccessToken !== 'function' || typeof user.generateRefreshToken !== 'function') {
      throw new apierror(500, "User model is missing token generation methods");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error in generateAccessAndRefreshToken:", error);
    throw new apierror(500, error.message || "Something went wrong");
  }
};



// Register User
const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email:", email);

  if ([fullname, email, username, password].some(field => !field?.trim())) {
    throw new apierror(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existedUser) {
    throw new apierror(409, "User with email or username already exists");
  }

  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar local path:", avatarLocalPath);
  console.log("Cover image local path:", coverImagePath);

  if (!avatarLocalPath) {
    throw new apierror(400, "Avatar file is required");
  }

  const avatar = await uploadOnCLoudinary(avatarLocalPath);
  const coverImage = coverImagePath
    ? await uploadOnCLoudinary(coverImagePath)
    : null;

  if (!avatar) {
    throw new apierror(400, "Avatar upload failed");
  }

  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new apierror(500, "Something went wrong");
  }

  return res.status(201).json(
    new apiresponse(200, createdUser, "User registered successfully")
  );
});

// Login User
const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  console.log("login req.body", req.body);

  if ((!username && !email) || !password) {
    throw new apierror(400, "Username/email and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }]
  });
  if (!user) {
    throw new apierror(404, "User not found");
  }

  const isPassValid = await user.isPasswordCorrect(password);
  if (!isPassValid) {
    throw new apierror(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const safeUser = await User.findById(user._id).select("-password -refreshToken");

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000  // 1 day
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new apiresponse(
        200,
        { user: safeUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

// Logout User
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict"
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new apiresponse(200, null, "User logged out"));
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomeingRefranceToken =req.cookies.refreshtoken||req.body.refreshtoken
  if(!incomeingRefranceToken){
    throw new apierror(401,"unauthorized request ")
  }
  const decodedToken=jwt.verify(incomeingRefranceToken,
    process.env.REFRESH_TOKEN_SECRET
  )

  const user= await User.findById(decodedToken?._id)
  if(!user){
    throw new apierror(401,"invalid refresh token")
  }
  if(incomeingRefranceToken!==user?.refreshToken){
    throw new apierror(401,"refresh token is expired or used")
  }
   const options={
    gttpOnly:true,
    ecure:true
   }
   const{accessToken,newrefreshToken}=await generateAccessAndRefreshToken(user._id)

   return res 
   .status(200)
   .cookie("accessToken", accessToken,options)
   .cookie("refreshToken",newrefreshToken,options)
   .json(
    new apiresponse(
      200,
      {accessToken,newrefreshToken},
      "Access token refreshe"))
})
const changecrrpass=asyncHandler( async (req,res)=>{
  const {oldpassword,newpassword}= req.body
  const user = await User.findById(req.user?._id)
  const isPasswordCorrect=await user.isPasswordCorrect(oldpassword)
  if(!isPasswordCorrect){
    throw new apierror(400,"invalid old password")
  }

  user.password=newpassword
  await user.save({validateBeforeSave:false})
  return res
  .status(200)
  .json(new apiresponse(200,{},"password changed"))
 })

 const getcurruser=asyncHandler(async(req,res)=>{
  return res 
  .status(200)
  .json(200,req.user,"current user fetched successfully")
 })
const updateAcc =asyncHandler(async(req,res)=>{
const {fullname,email}=req.body

if(!fullname||!email){
  throw new apierror(400,"all feild required")
}
User.findByIdAndUpdate(
  req.user?._id,
  {
$set:{
  fullname,
  email: email
}
  },
  {new:true}


).select("-password")

return res
.status(200)
.json(new apiresponse(200,user,"account details updated"))
})

const updateavatar=asyncHandler(async(req,res)=>{
  const avatarLocalPath=  req.file?.path
  if(!avatarLocalPath){

    throw new apierror(400,"avatar file is missing")

  }

  if(!avatar.url){
    throw new apierror(400,"error in uploading")
  }

const user=await User.findByIdAndUpdate(req.user?._id,

  {
    $set:{
      avatar:avatar.url
    }
  },
  {new: true}
).selsect("-password")
return res
.status(200)
.json(
  new apiresponse(200,"avatar image updated")
)
})
const updatecover=asyncHandler(async(req,res)=>{
  const coverImagePath=  req.file?.path
  if(!coverImagePath){

    throw new apierror(400,"cover image file is missing")

  }
const coverImage=await uploadOnCLoudinary(coverImagePath)
  if(!coverImage.url){
    throw new apierror(400,"error in uploading")
  }

const user=await User.findByIdAndUpdate(req.user?._id,

  {
    $set:{
      coverImage:coverImage.url
    }
  },
  {new: true}
).selsect("-password")
return res
.status(200)
.json(
  new apiresponse(200,"cover image updated")
)

})



export { registerUser, loginUser, logoutUser,refreshAccessToken ,getcurruser,changecrrpass,updateAcc,updateavatar,updatecover};
