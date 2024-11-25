// Button status
const buttonsStatus = document.querySelectorAll("[button-status]")
if (buttonsStatus.length > 0) {
    let url = new URL(window.location.href)
    // console.log(url)
    buttonsStatus.forEach(button => {
        button.addEventListener("click", () => {
            const status = button.getAttribute("button-status")
            console.log(status)
            if (status) {
                url.searchParams.set("status", status)
            } else {
                url.searchParams.delete("status")
            }
            console.log(url.href)
            window.location.href = url.href // Chuyển hướng sang trang khác
        })
    })
}

// Form Search
const formSearch = document.querySelector("#form-search")
let url = new URL(window.location.href)
if (formSearch) {
    formSearch.addEventListener("submit", (e) => {
        e.preventDefault()
        const keyword = e.target.elements.keyword.value
        console.log(keyword)
        if (keyword) {
            url.searchParams.set("keyword", keyword)
        } else {
            url.searchParams.delete("keyword")
        }
        window.location.href = url.href
    })
}

// Pagination
const buttonsPagination = document.querySelectorAll("[button-pagination]")
// console.log(buttonsPagination)
if (buttonsPagination.length > 0) {
    let url = new URL(window.location.href)
    console.log(url.href)
    buttonsPagination.forEach(button => {
        button.addEventListener("click", () => {
            const page = button.getAttribute("button-pagination")
            console.log(page)
            if (page) {
                url.searchParams.set("page", page)
            } else {
                url.searchParams.delete("page")
            }
            window.location.href = url.href
        })
    })

}
// End pagination

// Checkbox multi
const checkboxMulti = document.querySelector("[checkbox-multi]")
if (checkboxMulti) {
    const inputCheckAll = checkboxMulti.querySelector("input[name='checkall']")
    // console.log(inputCheckAll.checked)
    const inputsSingle = document.querySelectorAll("input[name='id']")

    inputCheckAll.addEventListener("click", () => {
        if (inputCheckAll.checked == true) {
            inputsSingle.forEach(input => {
                input.checked = true
            })
        } else {
            inputsSingle.forEach(input => {
                input.checked = false
            })
        }
    })

    inputsSingle.forEach(input => {
        input.addEventListener("click", () => {
            const countSingle = document.querySelectorAll("input[name='id']:checked").length // checked: css selector
            const countAll = document.querySelectorAll("input[name='id']").length
            // console.log(countAll)
            // console.log(countSingle)
            if (countSingle == countAll) {
                inputCheckAll.checked = true
            } else {
                inputCheckAll.checked = false
            }
        })
    })
}
// End checkbox multi

// Form change multi
const formChangeMulti = document.querySelector("[form-change-multi]")
if (formChangeMulti) {
    formChangeMulti.addEventListener("submit", (e) => {
        e.preventDefault(); // Ngừng form submit ngay lập tức
        const checkboxMulti = document.querySelector("[checkbox-multi]");
        const inputsChecked = checkboxMulti.querySelectorAll("input[name='id']:checked");

        const typeChange = e.target.elements.type.value;
        console.log(typeChange);

        if (typeChange === "--Chọn hành động--") {
            Swal.fire({
                icon: 'warning',
                title: 'Chưa chọn hành động!',
                text: 'Vui lòng chọn hành động muốn thực hiện!'
            });
            return;
        }

        // Xử lý delete-all
        if (typeChange == "delete-all") {
            if (inputsChecked.length == 0) {
                Swal.fire({
                    icon: 'error',
                    title: 'Lỗi!',
                    text: 'Vui lòng chọn ít nhất một bản ghi!',
                });
                return; 
            } 
            
            Swal.fire({
                title: 'Bạn có muốn xóa tất cả các bản ghi này?',
                text: "Không thể phục hồi sau khi xóa!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (!result.isConfirmed) {
                    return; // Dừng lại nếu người dùng chọn Hủy
                }

                // Lấy mảng ids từ các checkbox đã chọn
                let ids = [];
                inputsChecked.forEach(input => {
                    ids.push(input.value); // Lấy giá trị từ attribute "value" của từng checkbox
                });

                // Đưa mảng ids vào input hidden trong form
                const inputIds = formChangeMulti.querySelector("input[name='ids']");
                inputIds.value = ids.join(", "); // Chuyển mảng thành chuỗi và gán vào input

                // Tiếp tục gửi form sau khi đã set ids
                processFormSubmit();
            });
            return; // Ngừng xử lý submit cho đến khi xác nhận xóa
        }

        // Nếu có ít nhất 1 checkbox được chọn
        if (inputsChecked.length > 0) {
            let ids = [];
            const inputIds = formChangeMulti.querySelector("input[name='ids']");
            let stringIDs = '';
            inputsChecked.forEach(input => {
                const id = input.getAttribute("value");
                if (typeChange == "change-position") {
                    const pos = input.closest("tr").querySelector("input[name='position']").value;
                    let send = `${id}-${pos}`;
                    ids.push(send);
                } else {
                    ids.push(id);
                }
            });
            stringIDs = ids.join(", ");
            inputIds.value = stringIDs;
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi!',
                text: 'Vui lòng chọn ít nhất một bản ghi!',
            });
            return;
        }

        // Tiến hành gửi form nếu không phải là thao tác xóa
        if (typeChange !== "delete-all") {
            processFormSubmit();
        }
    });
}

// Hàm xử lý gửi form
function processFormSubmit() {
    const formChangeMulti = document.querySelector("[form-change-multi]");
    formChangeMulti.submit(); // Chỉ gửi form khi người dùng xác nhận xóa hoặc khi không phải thao tác delete-all
}


// Hàm xử lý gửi form
function processFormSubmit() {
    const formChangeMulti = document.querySelector("[form-change-multi]");
    formChangeMulti.submit(); // Chỉ gửi form khi người dùng xác nhận xóa hoặc khi không phải thao tác delete-all
}


// Sort
const sort = document.querySelector("[sort]");

if (sort) {
    let url = new URL(window.location.href);
    const sortSelect = sort.querySelector("[sort-select]");
    const btnClear = sort.querySelector("[sort-clear]");

    // Set the selected option based on URL parameters
    const sortKey = url.searchParams.get("sortKey");
    const sortValue = url.searchParams.get("sortValue");
    if (sortKey && sortValue) {
        const selectedValue = `${sortKey}-${sortValue}`;
        console.log(selectedValue);

        // Cách 2: Lấy option với giá trị tương ứng và chọn nó
        const selected = sortSelect.querySelector(`option[value='${selectedValue}']`);
        if (selected) {
            selected.selected = true; // Ensure the option is selected
        }
    }

    // Handle sort selection change
    if (sortSelect) {
        sortSelect.addEventListener("change", () => {
            let str = sortSelect.value.split('-');
            let sortKey = str[0];
            let sortValue = str[1];
            console.log(sortKey + " " + sortValue);

            // Update URL parameters with the selected sort option
            url.searchParams.set("sortKey", sortKey);
            url.searchParams.set("sortValue", sortValue);

            window.location.href = url.href;
        });
    }

    // Clear the sort selection
    if (btnClear) {
        btnClear.addEventListener("click", () => {
            url.searchParams.delete("sortKey");
            url.searchParams.delete("sortValue");
            window.location.href = url.href;
        });
    }
}
// End sort

// Show success status
document.addEventListener("DOMContentLoaded", function () {
    const showAlert = document.querySelector("[show-alert]");
    // const btnCancel = showAlert.querySelector("span.alert-hidden")
    if (showAlert) {
        const btnCancel = showAlert.querySelector("span.btn-cancel")
        // console.log(btnCancel)
        btnCancel.addEventListener("click", () => {
            showAlert.classList.add("alert-hidden")
        })
        const time = parseInt(showAlert.getAttribute("data-time"));
        setTimeout(() => {
            showAlert.classList.add("alert-hidden");
        }, time);
    }
});
// End show success status

// Upload image
const uploadImages = document.querySelectorAll("[upload-image]");
// console.log(uploadImages)

if (uploadImages.length > 0) {
    uploadImages.forEach(uploadImage => {
        const btnCancel = uploadImage.querySelector(".image-container .button-cancel");
        const uploadImageInput = uploadImage.querySelector("[upload-image-input]");
        const uploadImagePreview = uploadImage.querySelector("[upload-image-preview]");

        btnCancel.classList.add("hidden")

        if (uploadImageInput && uploadImagePreview && btnCancel) {
            uploadImageInput.addEventListener("change", (e) => {
                const file = e.target.files[0]; // Lấy ra giá trị đầu tiên
                if (file) {
                    uploadImagePreview.src = URL.createObjectURL(file);
                    btnCancel.classList.remove("hidden"); // Hiển thị nút khi có ảnh
                }
            });

            btnCancel.addEventListener("click", () => {
                btnCancel.classList.add("hidden");
                uploadImagePreview.src = ""; // Xóa ảnh preview
                uploadImageInput.value = ""; // Xóa giá trị input
            });

            // Kiểm tra nếu không có file được chọn, ẩn nút hủy
            uploadImageInput.addEventListener("input", () => {
                if (!uploadImageInput.value) {
                    btnCancel.classList.add("hidden");
                }
            });
        }
    })
}
// End upload image