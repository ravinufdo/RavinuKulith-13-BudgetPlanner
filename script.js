generateBtn.addEventListener("click", () => {

    const income = Number(
        incomeInput.value.replace(/,/g, "")
    );

    if (!income) {
        alert("Please enter your monthly income.");
        return;
    }

    localStorage.setItem("monthlyIncome", income);
    window.location.href = "dashboard.html";

});