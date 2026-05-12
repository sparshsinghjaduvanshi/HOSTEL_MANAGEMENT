import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("===== CLOUDINARY SDK CONFIG =====");

console.log(cloudinary.config());

console.log("=================================");

const uploadOnCLoudinary = async (localFilePath) => {

    try {

        if (!localFilePath) {
            return null;
        }

        console.log("Uploading:", localFilePath);

        const response =
            await cloudinary.uploader.upload(
                localFilePath,
                {
                    resource_type: "raw"
                }
            );

        console.log("UPLOAD SUCCESS");

        console.log(response);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return response;

    } catch (error) {

        console.log("CLOUDINARY ERROR:");

        console.log(error);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
        }

        return null;
    }
};

export { uploadOnCLoudinary };