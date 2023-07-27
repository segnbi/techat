
const file_input = document.getElementById("file-input");
const file_input_label = document.getElementById("file-input-label");
const image_error = document.getElementById("image-error");

file_input.addEventListener("change", (e) => {
	file_input_label.textContent = e.target.files[0].name
	image_error.textContent = ''
})

submit_button.addEventListener("click", (e) => {
	e.preventDefault();

	const formData = new FormData(form);

	fetch("http://localhost:8000/users", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((response_body) => {
			if(!response_body.messages) {
				window.location = 'sign-in.html'
			}

			if(error = response_body.messages.user_name) {
				user_error.textContent = error
			}

			if(error = response_body.messages.user_password) {
				password_error.textContent = error
			}

			if(error = response_body.messages.user_image) {
				image_error.textContent = error
			}
		})
		.catch((error) => {
			console.error(error)
		});
});
