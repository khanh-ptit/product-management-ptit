// Delete products
const btnDelete = document.querySelectorAll("[button-delete]");
if (btnDelete.length > 0) {
    const formDeleteItems = document.querySelector("#form-delete-item");
    const path = formDeleteItems.getAttribute("data-path");

    btnDelete.forEach(button => {
        button.addEventListener("click", () => {
            Swal.fire({
                title: 'Bạn có chắc chắn muốn xóa nhóm quyền này?',
                text: "Hành động này không thể phục hồi!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Có, xóa!',
                cancelButtonText: 'Hủy'
            }).then((result) => {
                if (result.isConfirmed) {
                    const id = button.getAttribute("data-id");
                    const action = `${path}/${id}?_method=DELETE`;
                    console.log(action);
                    formDeleteItems.action = action;
                    formDeleteItems.submit();
                }
            });
        });
    });
}
// End delete products