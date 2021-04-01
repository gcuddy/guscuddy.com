// Email Confirmation Green Thing

// inline this
const emailInput = document.querySelector('.cta__fields input[type=email]');
const submitButton = document.querySelector('.cta__fields button[type=submit].button');

if (submitButton && emailInput) {
    var currentBg = window.getComputedStyle(submitButton).backgroundColor;
    emailInput.onkeyup = function() {
        const emailRegex = /[^@]+@[^\.]+\...+/
        if (emailRegex.test(this.value)) {
            submitButton.style.backgroundColor = "var(--color-green)";
        } else {
            submitButton.style.backgroundColor = currentBg;
        }
    }
}
