import cloudinary from "cloudinary";
import fs from "fs";

const { v2: cloudinaryV2 } = cloudinary;

cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCLoudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;

        const response = await cloudinaryV2.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return response;

    } catch (error) {
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }
        return null;
    }
};

export { uploadOnCLoudinary };