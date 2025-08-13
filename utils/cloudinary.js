import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});





export const uploadImage = async (base64String) => {
    if (!base64String || typeof base64String !== "string") return null;

    // Clean up the Base64 string in case it has line breaks
    const sanitized = base64String.replace(/\r?\n|\r/g, "");

    const uploadResponse = await cloudinary.uploader.upload(sanitized, {
        folder: "FormBuilder",
        resource_type: "auto",
    });

    return uploadResponse.secure_url;
};

