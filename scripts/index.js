const plus_button_component = document.querySelector("#button-components .plus-button-component");
const minus_button_component = document.querySelector("#button-components .minus-button-component");
const reply_button_component = document.querySelector("#button-components .reply-button-component");
const delete_button_component = document.querySelector("#button-components .delete-button-component");
const edit_button_component = document.querySelector("#button-components .edit-button-component");

const app = document.getElementById("app");
const comments_container = document.getElementById("comments-container");

const state = {};

/**
 * init state and rendering
 */
document.addEventListener("DOMContentLoaded",async () => {
	try {
		const response = await fetch("http://localhost:8080/comments", {
			credentials: "include"
		})

		const response_json = await response.json()
	
		if(response_json.messages) {
			return console.log(response_json.messages)
		}

		state.current_user = response_json.current_user
		state.comments = response_json.comments

		await render_comments(state.comments)
		await render_comment_form(state.current_user)

		// setInterval(update_comments_rendered, 1000)
	} catch(error) {
		console.error(error)
	}
});

/**
 * update rendering state
 */
async function update_comments_rendered() {
	try {
		const response = await fetch("http://localhost:8080/comments", {
			credentials: "include"
		})

		const response_json = await response.json()
	
		if(response_json.messages) {
			return console.log(response_json.messages)
		}
	
		for(let i = 0; i < response_json.comments.length; i++) {
			let comment = state.comments.find(comment => comment.id == response_json.comments[i].id)

			if(!comment) {
				state.comments.push(response_json.comments[i])
				await render_comment(response_json.comments[i], comments_container)
			}

			if(comment) {
				let comment_index = state.comments.indexOf(comment)

				if(comment.score != response_json.comments[i].score) {
					state.comments[comment_index].score = response_json.comments[i].score

					const score = document.querySelector(`#comment-${response_json.comments[i].id} .score`)
					score.textContent = response_json.comments[i].score
				}

				if(comment.content != response_json.comments[i].content) {
					state.comments[comment_index].content = response_json.comments[i].content

					const content = document.querySelector(`#comment-${response_json.comments[i].id} .content`)
					content.textContent = response_json.comments[i].content
					content.style.display = ''
				}
			}
		}
	
		for(let i = 0; i < state.comments.length; i++) {
			let comment = response_json.comments.find(comment => comment.id == state.comments[i].id)

			if(!comment) {
				comment = document.getElementById('comment-' + state.comments[i].id)
				if(comment) {
					comment.remove()
					state.comments.splice(i, 1)
				}
			}
		}
	
		for(let i = 0; i < response_json.comments.length; i++) {
			let comment_index = state.comments.findIndex(comment => comment.id == response_json.comments[i].id)

			response_json.comments[i].replies.forEach(server_reply => {
				let reply = state.comments[comment_index].replies.find(reply => reply.id == server_reply.id)
				
				if(!reply) {
					state.comments[comment_index].replies.push(server_reply)
					const section = document.getElementById('comment-' + response_json.comments[i].id + '-replies-container')
					section.appendChild(build_comment_item(server_reply))
				}
				
				if(reply) {
					let reply_index = state.comments[comment_index].replies.indexOf(reply)

					if(server_reply.score != reply.score) {
						state.comments[comment_index].replies[reply_index].score = server_reply.score

						const score = document.querySelector(`#comment-${server_reply.id} .score`)
						score.textContent = server_reply.score
					}

					if(server_reply.content != reply.content) {
						state.comments[comment_index].replies[reply_index].content = server_reply.content

						const content = document.querySelector(`#comment-${server_reply.id} .content`)
						content.textContent = server_reply.content
						content.style.display = ''
					}
				}
			})
		}
	
		for(let i = 0; i < state.comments.length; i++) {
			let comment_index = response_json.comments.findIndex(comment => comment.id == state.comments[i].id)

			state.comments[i].replies.forEach(state_reply => {
				let server_reply = response_json.comments[comment_index].replies.find(reply => reply.id == state_reply.id)
				
				if(!server_reply) {
					let reply_index = state.comments[comment_index].replies.indexOf(state_reply)
					reply = document.getElementById('comment-' + state.comments[i].replies[reply_index].id)

					if(reply) {
						reply.remove()
						state.comments[i].replies.splice(reply_index, 1)
					}
				}
			})
		}
	} catch(error) {
		console.error(error)
	}
}

/**
 * render a list of comments
 */
async function render_comments(comments) {
	const dom_fragment = document.createDocumentFragment()

	comments.forEach(comment => {
		dom_fragment.appendChild(build_comment_item(comment))
		
			const section = document.createElement('section')
			section.setAttribute('class', 'replies-container')
			section.setAttribute('id', `comment-${comment.id}-replies-container`)
			
			comment.replies.forEach(reply => {
				section.appendChild(build_comment_item(reply))
			})
			
			dom_fragment.appendChild(section)
	});

	comments_container.appendChild(dom_fragment)
}

/**
 * render a comment
 */
async function render_comment(comment, comment_parent) {
	const dom_fragment = document.createDocumentFragment()

	dom_fragment.appendChild(build_comment_item(comment))
	
	comment_parent.appendChild(dom_fragment)
}

/**
 * render comment form
 */
async function render_comment_form() {
	const dom_fragment = document.createDocumentFragment()
	dom_fragment.appendChild(build_comment_form('Send'))
	app.appendChild(dom_fragment)
}

/**
 * build comment form
 */
function build_comment_form(button_text_content, replied_comment) {
	const form = document.createElement('form')
	const textarea_container = document.createElement('div')
	const textarea = document.createElement('textarea')
	const img_container = document.createElement('div')
	const img = document.createElement('img')
	const button_container = document.createElement('div')
	const button = document.createElement('button')

	form.setAttribute('class', 'comment-form')
	textarea_container.setAttribute('class', 'textarea-container')
	textarea.setAttribute('name', 'content')
	textarea.setAttribute('placeholder', 'Add a comment...')
	img_container.setAttribute('class', 'img-container')
	img.setAttribute('src', state.current_user.user_image)
	img.setAttribute('alt', '')
	button_container.setAttribute('class', 'button-container')
	button.setAttribute('type', 'submit')
	button.textContent = button_text_content

	if(button_text_content == 'Reply') {
		textarea.setAttribute('placeholder', `replying to @${replied_comment.user.user_name}`)
	}

	button.addEventListener('click',async (e) => {
		e.preventDefault()

		if(e.target.textContent == 'Send') {
		
			const response = await send_comment(new FormData(form))

			if(response.messages) {
				return textarea.style.borderColor = '#ED6468'
			}

			textarea.style.borderColor = ''
			textarea.value = ''
		}

		if(e.target.textContent == 'Reply') {
			const response = await send_reply(new FormData(form), replied_comment.id)

			if(response.messages) {
				return textarea.style.borderColor = '#ED6468'
			}

			form.remove()
		}
	})

	textarea.addEventListener("input", (e) => {
		if(e.target.style.borderColor) {
			e.target.style.borderColor = ''
		}
	})

	textarea_container.appendChild(textarea)
	img_container.appendChild(img)
	button_container.appendChild(button)

	form.appendChild(textarea_container)
	form.appendChild(img_container)
	form.appendChild(button_container)

	return form
}

/**
 * send reply
 */
async function send_reply(form_data, replied_comment) {
	try {
		const response = await fetch("http://localhost:8080/comments?replying-to-comment=" + replied_comment, {
			method: 'POST',
			credentials: "include",
			body: form_data
		})
		const response_json = await response.json()
		return response_json

	} catch(error) {
		console.error(error)
	}
}

/**
 * send comment
 */
async function send_comment(form_data) {
	try {
		const response = await fetch("http://localhost:8080/comments", {
			method: 'POST',
			credentials: "include",
			body: form_data
		})
		const response_json = await response.json()
		return response_json

	} catch(error) {
		console.error(error)
	}
}

/**
 * build comment item
 */
function build_comment_item(comment) {
	const article = document.createElement('article')
	const header_container = document.createElement('div')
	const header = document.createElement('p')
	const img_container = document.createElement('span')
	const img = document.createElement('img')
	const user_name = document.createElement('strong')
	const user_tag = document.createElement('span')
	const comment_date = document.createElement('span')
	const content_container = document.createElement('div')
	const content = document.createElement('p')
	const text_content = document.createTextNode(` ${comment.content}`)
	const replying_to = document.createElement('strong')
	const score_button_container = document.createElement('div')
	const score_button = document.createElement('p')
	const plus_button = plus_button_component.cloneNode(true)
	const minus_button = minus_button_component.cloneNode(true)
	const score = document.createElement('span')
	const action_button_container = document.createElement('div')
	const reply_button = reply_button_component.cloneNode(true)
	const delete_button = delete_button_component.cloneNode(true)
	const edit_form = build_edit_form(comment)
	const edit_button = edit_button_component.cloneNode(true)

	article.setAttribute('class', 'comment-item')
	article.setAttribute('id', 'comment-' + comment.id)
	header_container.setAttribute('class', 'header-container')
	header.setAttribute('class', 'header')
	img_container.setAttribute('class', 'img-container')
	img.setAttribute('src', comment.user.user_image)
	img.setAttribute('alt', '')
	user_name.setAttribute('class', 'user-name')
	user_tag.setAttribute('class', 'user-tag')
	comment_date.setAttribute('class', 'comment-date')
	content_container.setAttribute('class', 'content-container')
	content.setAttribute('class', 'content')
	replying_to.setAttribute('class', 'replying-to')
	score_button_container.setAttribute('class', 'score-button-container')
	score_button.setAttribute('class', 'score-button')
	score.setAttribute('class', 'score')
	action_button_container.setAttribute('class', 'action-button-container')
	
	img_container.appendChild(img)
	header.appendChild(img_container)
	user_name.textContent = comment.user.user_name
	user_tag.textContent = 'you'
	header.appendChild(user_name)
	comment_date.textContent = date_ago(comment.created_at)
	header.appendChild(comment_date)
	header_container.appendChild(header)
	
	replying_to.textContent = (comment.replying_to)? `@${comment.replying_to}`: ``
	content.appendChild(replying_to)
	content.appendChild(text_content)
	content_container.appendChild(content)
	score.textContent = comment.score
	score_button.appendChild(plus_button)
	score_button.appendChild(score)
	score_button.appendChild(minus_button)
	score_button_container.appendChild(score_button)

	reply_button.addEventListener('click', () => {
		if(
			!article.nextElementSibling
			|| article.nextElementSibling.className == 'replies-container'
			|| article.nextElementSibling.className == 'comment-item'
			) {
			return article.after(build_comment_form('Reply', comment))
		}

		return article.nextElementSibling.remove()
	})

	plus_button.addEventListener('click', () => {
		return update_score(comment.id, '+1')
	})

	minus_button.addEventListener('click', () => {
		return update_score(comment.id, '-1')
	})

	delete_button.addEventListener('click', () => {
		return app.appendChild(build_delete_popup(comment))
	})

	edit_button.addEventListener('click', () => {
		if(content.style.display == '') {
			content.style.display = 'none'
			return content_container.appendChild(edit_form)
		}

		content_container.removeChild(edit_form)
		return content.style.display = ''
	})

	if(state.current_user.user_name == comment.user.user_name) {
		user_name.after(user_tag)
		action_button_container.appendChild(delete_button)
		action_button_container.appendChild(edit_button)
	} else {
		action_button_container.appendChild(reply_button)
	}

	article.appendChild(header_container)
	article.appendChild(content_container)
	article.appendChild(score_button_container)
	article.appendChild(action_button_container)

	return article
}

/**
 * add score
 */
async function update_score(comment_id, operation) {
	try {
		const response = await fetch("http://localhost:8080/comments/" + comment_id + "?score=" + operation, {
			method: 'PATCH',
			credentials: 'include'
		})

		const response_json = await response.json()
	
		if(response_json.messages) {
			return console.log(response_json)
		}

		return console.log(response_json)
	} catch(error) {
		console.error(error)
	}
}

/**
 * format date
 */
function date_ago(date) {
	const year = 31536000
	const month = 2592000
	const week = 604800
	const day = 86400
	const hour = 3600
	const minute = 60
	const seconde = 1

	let elapsed_time = Math.trunc((Date.now() - Date.parse(date)) * 0.001)

	if((time_ago = (Math.trunc(elapsed_time / year))) > 0) {
		return (time_ago == 1)? time_ago + ' year ago': time_ago + ' years ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / month))) > 0) {
		return (time_ago == 1)? time_ago + ' month ago': time_ago + ' months ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / week))) > 0) {
		return (time_ago == 1)? time_ago + ' week ago': time_ago + ' weeks ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / day))) > 0) {
		return (time_ago == 1)? time_ago + ' day ago': time_ago + ' days ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / hour))) > 0) {
		return (time_ago == 1)? time_ago + ' hour ago': time_ago + ' hours ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / minute))) > 0) {
		return (time_ago == 1)? time_ago + ' minute ago': time_ago + ' minutes ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / seconde))) > 0) {
		return (time_ago == 1)? time_ago + ' seconde ago': time_ago + ' secondes ago'
	}

	if((time_ago = (Math.trunc(elapsed_time / seconde))) == 0) {
		return 'now'
	}

	return undefined
}

/**
 * build edit form
 */
function build_edit_form(edited_comment) {
	const form = document.createElement('form')
	const textarea = document.createElement('textarea')
	const button = document.createElement('button')

	form.setAttribute('class', 'edit-form')
	textarea.setAttribute('name', 'content')
	textarea.setAttribute('placeholder', 'editing...')
	button.setAttribute('type', 'submit')
	button.textContent = 'Update'

	textarea.value = edited_comment.content

	button.addEventListener('click',async (e) => {
		e.preventDefault()
		const response = await edit_comment(new FormData(form), edited_comment.id)

		if(response.messages) {
			return textarea.style.borderColor = '#ED6468'
		}

		console.log(response)
		return form.remove()
	})

	textarea.addEventListener("input", (e) => {
		if(e.target.style.borderColor) {
			e.target.style.borderColor = ''
		}
	})

	form.appendChild(textarea)
	form.appendChild(button)

	return form
}

/**
 * build delete popup
 */
function build_delete_popup(deleted_comment) {
	const delete_popup_container = document.createElement('div')
	const delete_popup = document.createElement('div')
	const header = document.createElement('p')
	const strong = document.createElement('strong')
	const content = document.createElement('p')
	const footer = document.createElement('div')
	const cancel_button = document.createElement('button')
	const delete_button = document.createElement('button')

	delete_popup_container.setAttribute('class', 'delete-popup-container')
	delete_popup.setAttribute('class', 'delete-popup')
	header.setAttribute('class', 'header')
	strong.textContent = 'Delete comment'
	content.setAttribute('class', 'content')
	content.textContent = 'Are you sure you want to delete this comment\? This will remove the comment and can\'t be undone.'
	footer.setAttribute('class', 'footer')
	cancel_button.setAttribute('class', 'cancel-button')
	cancel_button.textContent = 'No, cancel'
	delete_button.setAttribute('class', 'delete-button')
	delete_button.textContent = 'Yes, delete'

	header.appendChild(strong)
	delete_popup.appendChild(header)
	delete_popup.appendChild(content)
	footer.appendChild(cancel_button)
	footer.appendChild(delete_button)
	delete_popup.appendChild(footer)

	delete_popup_container.appendChild(delete_popup)

	cancel_button.addEventListener('click',async () => {
		return delete_popup_container.remove()
	})

	delete_button.addEventListener('click',async () => {
		try {
			const response = await fetch("http://localhost:8080/comments/" + deleted_comment.id, {
				method: 'DELETE',
				credentials: 'include'
			})
		} catch(error) {
			console.error(error)
		}

		return delete_popup_container.remove()
	})

	return delete_popup_container
}

/**
 * send comment
 */
async function edit_comment(form_data, comment_id) {
	try {
		const response = await fetch("http://localhost:8080/comments/" + comment_id, {
			method: 'PATCH',
			credentials: "include",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"content": form_data.get('content')
			})
		})
		const response_json = await response.json()
		return response_json

	} catch(error) {
		console.error(error)
	}
}