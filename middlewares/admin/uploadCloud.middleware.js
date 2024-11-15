const uploadToCloudinary = require("../../helpers/uploadToCloudinary");

module.exports.upload = async (req, res, next) => {
    try {
        // Xử lý single file upload
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);;
            req.body[req.file.fieldname] = result;
        }

        // Xử lý multiple file upload
        if (req.files) {
            console.log(req.files)
            for (const fieldname of Object.keys(req.files)) {
                const result = await uploadToCloudinary(req.files[fieldname][0].buffer);
                req.body[fieldname] = result;
            }
        }

        // Chuyển tiếp xử lý nếu không có lỗi
        next();
    } catch (error) {
        console.error("Error uploading files to Cloudinary:", error);
        res.status(500).json({
            error: "Error uploading files"
        });
    }
};