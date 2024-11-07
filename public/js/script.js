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