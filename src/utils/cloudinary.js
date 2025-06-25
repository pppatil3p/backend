import { v2 as cloudinary} from "cloudinary";
import fs from "fs"

cloudinary.config({ 
        cloud_name: 'process.env.ClOUDINARY_API_NAME', 
        api_key: 'process.env.ClOUDINARY_API_KEY', 
        api_secret: 'ClOUDINARY_API_SERET' 
      });
      const uploadOnCLoudinary = async(localFilePath)=>{
        try{
          if(!localFilePath) return null
const response =await  cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto"
          })
            console.log("file is uploaded on cloudinary",
            response.url);
            return response
        }
        catch(error){
             fs.unlinkSync(localFilePath)//remove temp file as upload get failed
             return null
        }
      }
       