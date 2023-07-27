const checkbox_input = document.getElementById("checkbox");
const checkbox_button = document.getElementById("checkbox-button");

checkbox_input.addEventListener("change", (e) => {
	checkbox_button.classList.toggle('unchecked-box')
})

submit_button.addEventListener("click", (e) => {
	e.preventDefault();

	const formData = new FormData(form);

	fetch("http://localhost:8000/authentication", {
		credentials: "include",
		method: "POST",
		body: formData
	})
		.then((response) => response.json())
		.then((response_body) => {
			if(!response_body.messages) {
				return window.location = 'index.html'
			}

			if(error = response_body.messages.user_name) {
				user_error.textContent = error
			}

			if(error = response_body.messages.user_password) {
				password_error.textContent = error
			}
		})
		.catch((error) => {
			console.error(error)
		});
});