import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import 'dotenv/config';

// ✅ Configure Cloudinary with your .env variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadOnCLoudinary = async (localFilePath) => {
  if (!localFilePath) return null;

  try {
    console.log("Uploading to Cloudinary:", localFilePath);
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    }); 

    // Remove the local file after upload
    fs.unlinkSync(localFilePath);

    console.log("Cloudinary upload success:", result.url);
    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
};
  