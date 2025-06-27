import { asyncHandler } from "../utils/asyncHandler.js";
import { apierror } from "../utils/apierror.js";
import { User } from "../model/user.model.js";
import { uploadOnCLoudinary } from "../utils/cloudinary.js";
import { apiresponse } from "../utils/apiresponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;

  console.log("email:", email);

  // Validate fields
  if ([fullname, email, username, password].some(field => field?.trim() === "")) {
    throw new apierror(400, "All fields are required");
  }

  // Check if user exists
  const existedUser = await User.findOne({
    $or: [{ username }, { email }]
  });
  if (existedUser) {
    throw new apierror(409, "User with email or username already exists");
  }

  // Handle uploaded files
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImagePath = req.files?.coverImage?.[0]?.path;

  console.log("Avatar local path:", avatarLocalPath);
  console.log("Cover image local path:", coverImagePath);

  if (!avatarLocalPath) {
    throw new apierror(400, "Avatar file is required");
  }

  // Upload to Cloudinary
  const avatar = await uploadOnCLoudinary(avatarLocalPath);
  const coverImage = coverImagePath
    ? await uploadOnCLoudinary(coverImagePath)
    : null;

  if (!avatar) {
    throw new apierror(400, "Avatar upload failed");
  }

  // Create user
  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverimage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase()
  });

  // Fetch user without sensitive fields
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshtoken"
  );

  if (!createdUser) {
    throw new apierror(500, "Something went wrong");
  }

  // Send response
  return res.status(201).json(
    new apiresponse(200, createdUser, "User registered successfully")
  );
});

export { registerUser };
