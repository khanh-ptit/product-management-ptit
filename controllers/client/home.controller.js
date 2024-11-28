const sendMailHelper = require("../../helpers/sendMailClient")

module.exports.index = async (req, res) => {
    res.render("client/pages/home/index.pug")
}

// Controller đăng ký nhân viên
module.exports.registerStaff = async (req, res) => {
    try {
        // Lấy thông tin từ req.body
        const { fullName, email, subject, role, message } = req.body;

        // Tạo nội dung HTML cho email
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4; border-radius: 8px; border: 1px solid #ddd;">
                <div style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 8px 8px 0 0;">
                    <h2 style="margin: 0; font-size: 24px;">Đăng Ký Nhân Viên Mới</h2>
                </div>

                <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                        <strong>Họ và Tên:</strong> ${fullName}
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                        <strong>Email:</strong> ${email}
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                        <strong>Chức Vụ Mong Muốn:</strong> ${role}
                    </p>
                    <p style="font-size: 16px; color: #333333; line-height: 1.6;">
                        <strong>Lý Do Đăng Ký:</strong> ${message}
                    </p>
                </div>

                <div style="padding: 20px; text-align: center; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
                    <p style="font-size: 14px; color: #888888;">Cảm ơn bạn đã quan tâm đến việc đăng ký nhân viên!</p>
                </div>
            </div>
        `;

        // Gửi email thông qua helper
        await sendMailHelper.sendMail("khanhlq.b21at110@stu.ptit.edu.vn", subject, html);

        // Thông báo gửi email thành công
        req.flash("info", "Email đăng ký nhân viên đã được gửi đến cửa hàng !");
        res.redirect("back");  // Quay lại trang trước

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Đã xảy ra lỗi khi gửi email. Vui lòng thử lại sau!" });
    }
};