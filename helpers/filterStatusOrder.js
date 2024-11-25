module.exports = (query) => {
    // Định nghĩa trạng thái lọc
    const filterStatus = [
        { name: "Tất cả", status: "", class: "" },
        { name: "Chưa thanh toán", status: "unpaid", class: "" },
        { name: "Đã thanh toán", status: "paid", class: "" }
    ];

    // Xác định trạng thái hiện tại và thêm class "active"
    if (query.status) {
        const index = filterStatus.findIndex(item => item.status === query.status);
        if (index !== -1) {
            filterStatus[index].class = "active";
        }
    } else {
        // Mặc định trạng thái "Tất cả" là active
        const index = filterStatus.findIndex(item => item.status === "");
        filterStatus[index].class = "active";
    }

    return filterStatus;
};
