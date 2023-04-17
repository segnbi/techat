const form = document.getElementById("form");
const submit_button = document.getElementById("submit-button");
const user_name_input = document.getElementById("user-name-input");
const password_input = document.getElementById("password-input");
const display_password_button = document.getElementById("display-password-button");
const user_error = document.getElementById("user-error");
const password_error = document.getElementById("password-error");

display_password_button.addEventListener("click", (e) => {
	e.target.classList.toggle('hide-password-image')

	if(password_input.type == 'password') {
		return password_input.type = 'text'
	}

	return password_input.type = 'password'
})

user_name_input.addEventListener("input", (e) => {
	if(user_error.textContent) {
		user_error.textContent = ''
	}
})

password_input.addEventListener("input", (e) => {
	if(password_error.textContent) {
		password_error.textContent = ''
	}
})