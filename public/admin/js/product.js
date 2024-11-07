// Change status
const buttonChangeStatus = document.querySelectorAll("[button-change-status]")

if (buttonChangeStatus.length > 0) {
    const formChangeStatus = document.querySelector("#form-change-status")
    const path = formChangeStatus.getAttribute("data-path")

    buttonChangeStatus.forEach(button => {
        button.addEventListener("click", () => {
            const currentStatus = button.getAttribute("data-status")
            const id = button.getAttribute("data-id")

            let changeStatus = currentStatus == "active" ? "inactive" : "active"
            console.log(currentStatus + " " + id + " " + changeStatus)

            const action = path + `/${changeStatus}/${id}?_method=PATCH`
            formChangeStatus.action = action
            console.log(action)
            formChangeStatus.submit()
        })
    })
}