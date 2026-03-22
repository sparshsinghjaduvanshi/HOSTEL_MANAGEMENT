import { vs as cloudinary } from 'cloudinary'
import fs from "fs"

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET       
})

const uploadOnCLoudinary = async (localFIlePath) => {
    try{
        if(!localFIlePath) return null
        const response = await cloudinary.uploader.upload(localFIlePath,{
            resource_type: "auto"
        })

        fs.unlinkSync(localFilePath)
        return response;
    }
    catch(error){
        fs.unlinkSync(localFilePath)
        return null
    }
}

export {uploadOnCLoudinary}