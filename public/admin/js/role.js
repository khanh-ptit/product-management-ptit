// Delete roles
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
// End delete roles

// Permission
const tablePermissions = document.querySelector("[table-permissions]")
if (tablePermissions) {
    const btnSubmit = document.querySelector("[button-submit]")
    btnSubmit.addEventListener("click", () => {
        let permissions = []
        const rows = tablePermissions.querySelectorAll("[data-name]")

        rows.forEach((row) => {
            const dataName = row.getAttribute("data-name")
            const checkBoxes = row.querySelectorAll("input")
            if (dataName == "id") {
                checkBoxes.forEach(checkBox => {
                    permissions.push({
                        id: checkBox.value,
                        permissions: []
                    })
                })
            } else {
                checkBoxes.forEach((checkBox, index) => {
                    if (checkBox.checked) {
                        // console.log(checkBox)
                        permissions[index].permissions.push(dataName)
                    }
                })
            }
        })
        if (permissions.length > 0) {
            const formChangePermissions = document.querySelector("#form-change-permissions")
            if (formChangePermissions) {
                const inputSend = formChangePermissions.querySelector("input[name='permissions']")
                inputSend.value = JSON.stringify(permissions)
                formChangePermissions.submit()
            }
        }
    })
}
// End permission

// Permission data default
const dataRecords = document.querySelector("[data-records]")
if (dataRecords) {
    const tablePermissions = document.querySelector("[table-permissions]")
    if (tablePermissions) {
        // console.log(dataRecords)
        const records = JSON.parse(dataRecords.getAttribute("data-records"))
        // console.log(records)

        records.forEach((record, index) => {
            const permissions = record.permissions
            permissions.forEach(permission => {
                const row = tablePermissions.querySelector(`[data-name='${permission}']`);
                console.log(row)
                const input = row.querySelectorAll("input")[index]
                input.checked = true
            })
            // console.log(permissions)
        })
    }
}
// End permission data default