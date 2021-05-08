// Email Confirmation Green Thing

// inline this
const emailInput = document.querySelector(
    '.email-capture__fields input[type=email]'
)
const submitButton = document.querySelector(
    '.email-capture__fields button[type=submit].button'
)

if (submitButton && emailInput) {
    var currentBg = window.getComputedStyle(submitButton).backgroundColor
    var currentColor = window.getComputedStyle(submitButton).color
    emailInput.onkeyup = function () {
        const emailRegex = /[^@]+@[^\.]+\...+/
        if (emailRegex.test(this.value)) {
            if (submitButton.getAttribute('data-variant') == 'ghost') {
                submitButton.style.color = 'var(--color-green)'
            } else {
                submitButton.style.backgroundColor = 'var(--color-green)'
            }
        } else {
            submitButton.style.backgroundColor = currentBg
            submitButton.style.color = currentColor
        }
    }
}
