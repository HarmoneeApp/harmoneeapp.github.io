// Elements
var timelinePosts = document.getElementById("timeline-posts");
var profilePosts = document.getElementById("profile-posts");
var userPosts = document.getElementById("user-posts");

// Load Timeline
function loadTimelinePosts() {
	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = timelinePosts.getElementsByClassName('posts-container')[0];
	
	usersDB.child(currentUserID).once("value").then(userSnap => {
		const following = userSnap.val().following || {};

		postsDB.on("child_added", function(post) {
			const postData = post.val();
			const isFollowed = following[postData.userID];
			const isOwnPost = postData.userID == currentUserID;

			if (isFollowed || isOwnPost) {
				const postElement = createPostElement(post.key);
				containerElement.insertBefore(postElement, containerElement.firstChild);

				const avatar = postElement.getElementsByClassName("post-avatar")[0];
				avatar.setAttribute('src', getProfilePictureURL(postData.userID));
				avatar.style.cursor = "pointer";
				avatar.addEventListener('click', () => {
					postData.userID === currentUserID ? showView("profile") : viewProfile(postData.userID);
				});

				firebase.database().ref("/users/" + postData.userID).once("value").then(snapshot => {
					const user = snapshot.val() || {};
					postElement.getElementsByClassName("post-displayname")[0].textContent = user.displayName || "Display Name";
					postElement.getElementsByClassName("post-username")[0].textContent = "@" + (user.username || "Username");
				});

				postElement.getElementsByClassName("post-content")[0].innerHTML = postData.postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
				postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(postData.postDate);
				postElement.getElementsByClassName("post-delete")[0].hidden = !isOwnPost;
				postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
				postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;

				const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
				likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

				postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
					toggleLike(currentUserID, firebase.database().ref("posts").child(post.key));
				});

				postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => viewPost(post));
				postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => deletePost(post.key));
				postElement.setAttribute('data-userid', postData.userID);
			}
		});
	});
	postsDB.on("child_changed", function(post) {
		const postData = post.val();
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
			likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

			postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;
		}
	});
	postsDB.on("child_removed", function(post) {
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			postElement.remove();
		}
	});
}

// Load Profile Posts
function loadProfilePosts() {
	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = profilePosts.getElementsByClassName('posts-container')[0];

	postsDB.on("child_added", function(post) {
		const postData = post.val();
		const isOwnPost = postData.userID == currentUserID;

		if (isOwnPost) {
			const postElement = createPostElement(post.key);
			containerElement.insertBefore(postElement, containerElement.firstChild);

			const avatar = postElement.getElementsByClassName("post-avatar")[0];
			avatar.setAttribute('src', getProfilePictureURL(postData.userID));

			firebase.database().ref("/users/" + postData.userID).once("value").then(snapshot => {
				const user = snapshot.val() || {};
				postElement.getElementsByClassName("post-displayname")[0].textContent = user.displayName || "Display Name";
				postElement.getElementsByClassName("post-username")[0].textContent = "@" + (user.username || "Username");
			});

			postElement.getElementsByClassName("post-content")[0].innerHTML = postData.postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
			postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(postData.postDate);
			postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;

			const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
			likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

			postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
				toggleLike(currentUserID, firebase.database().ref("posts").child(post.key));
			});

			postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => viewPost(post));
			postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => deletePost(post.key));
			postElement.setAttribute('data-userid', postData.userID);
		}
	});
	postsDB.on("child_changed", function(post) {
		const postData = post.val();
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
			likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

			postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;
		}
	});
	postsDB.on("child_removed", function(post) {
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			postElement.remove();
		}
	});
}

// Load User Posts
function loadUserPosts(userID) {
	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = userPosts.getElementsByClassName('posts-container')[0];
	containerElement.innerHTML = "";

	postsDB.once("value", function(posts) {
		posts.forEach(post => {
			const postData = post.val();

			if (postData.userID == userID) {
				const postElement = createPostElement(post.key);
				containerElement.insertBefore(postElement, containerElement.firstChild);

				const avatar = postElement.getElementsByClassName("post-avatar")[0];
				avatar.setAttribute('src', getProfilePictureURL(postData.userID));

				firebase.database().ref("/users/" + postData.userID).once("value").then(snapshot => {
					const user = snapshot.val() || {};
					postElement.getElementsByClassName("post-displayname")[0].textContent = user.displayName || "Display Name";
					postElement.getElementsByClassName("post-username")[0].textContent = "@" + (user.username || "Username");
				});

				postElement.getElementsByClassName("post-content")[0].innerHTML = postData.postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
				postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(postData.postDate);
				postElement.getElementsByClassName("post-delete")[0].hidden = true;
				postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
				postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;

				const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
				likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

				postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
					toggleLike(currentUserID, firebase.database().ref("posts").child(post.key));
				});

				postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => viewPost(post));
				postElement.setAttribute('data-userid', postData.userID);
			}
		});
	});
	postsDB.on("child_changed", function(post) {
		const postData = post.val();
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			const likeIcon = postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon");
			likeIcon.setAttribute("name", postData.likes?.[currentUserID] ? "heart" : "heart-outline");

			postElement.getElementsByClassName("like-count")[0].textContent = postData.likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = postData.commentCount || 0;
		}
	});
	postsDB.on("child_removed", function(post) {
		const postElement = containerElement.getElementsByClassName("post-" + post.key)[0];
		if (postElement) {
			postElement.remove();
		}
	});
}

// Listen for Posts
function listenForPosts() {
	loadTimelinePosts();
	loadProfilePosts();
}

// Load Comments
function loadComments(postID) {
	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = document.getElementsByClassName('comment-container')[0];
	containerElement.innerHTML = "";

	const commentsRef = postsDB.child(postID + "/comments");

	commentsRef.on("child_added", function(comment) {
		const commentData = comment.val();
		const commentID = "comment-" + comment.key;

		if (!document.getElementById(commentID)) {
			const commentElement = createCommentElement(comment.key);
			commentElement.id = commentID;
			containerElement.insertBefore(commentElement, containerElement.firstChild);

			const avatar = commentElement.getElementsByClassName("comment-avatar")[0];
			avatar.setAttribute('src', getProfilePictureURL(commentData.userID));

			firebase.database().ref("/users/" + commentData.userID).once("value").then(snapshot => {
				const user = snapshot.val() || {};
				commentElement.getElementsByClassName("comment-displayname")[0].textContent = user.displayName;
				commentElement.getElementsByClassName("comment-username")[0].textContent = "@" + user.username;
			});

			commentElement.getElementsByClassName("comment-content")[0].innerHTML = commentData.commentContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
			commentElement.getElementsByClassName("comment-date")[0].textContent = timeSincePost(commentData.commentDate);
			commentElement.getElementsByClassName("comment-delete")[0].hidden = commentData.userID != currentUserID;
			commentElement.getElementsByClassName("like-count")[0].textContent = commentData.likeCount || 0;

			const likeIcon = commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon");
			likeIcon.setAttribute("name", commentData.likes?.[currentUserID] ? "heart" : "heart-outline");

			commentElement.getElementsByClassName("comment-like")[0].addEventListener('click', () => {
				toggleLike(currentUserID, commentsRef.child(comment.key));
			});

			commentElement.getElementsByClassName("comment-delete")[0].addEventListener('click', () => {
				deleteComment(postID, comment.key);
			});
			
			commentElement.setAttribute('data-userid', commentData.userID);
		}
	});
	commentsRef.on("child_changed", function(comment) {
		const commentData = comment.val();
		const commentElement = document.getElementById("comment-" + comment.key);
		if (commentElement) {
			const likeIcon = commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon");
			commentElement.getElementsByClassName("like-count")[0].textContent = commentData.likeCount || 0;
			likeIcon.setAttribute("name", commentData.likes?.[currentUserID] ? "heart" : "heart-outline");
		}
	});
	commentsRef.on("child_removed", function(comment) {
		const commentElement = document.getElementById("comment-" + comment.key);
		if (commentElement) {
			commentElement.remove();
		}
	});
}

// Listen for Changes
function listenForChanges() {
	var currentUserID = firebase.auth().currentUser.uid;
	var usersRef = firebase.database().ref("users");
	
	usersRef.on('child_changed', function(data) {
		if (data.key == currentUserID) {
			loadProfileInfo(currentUserID);
		}
	});
}

// Listen for Conversations
function listenForConversations() {
	console.log("Listening");

	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = document.querySelector(".conversation-list");

	convosDB.on("child_added", function(convo) {
		const convoData = convo.val();
		const isParticipant = convoData.participants.includes(currentUserID);

		if (isParticipant) {
			var otherUserID = convoData.participants.find(function(uid) {
				return uid !== currentUserID;
			});

			const convoElement = createConversationElement(convo.key);
			containerElement.appendChild(convoElement);

			const avatar = convoElement.getElementsByClassName("convo-avatar")[0];
			avatar.setAttribute('src', getProfilePictureURL(otherUserID));

			usersDB.child(otherUserID).once("value").then(function(snapshot) {
				var userData = snapshot.val() || {};

				convoElement.getElementsByClassName("convo-displayname")[0].textContent = userData.displayName;
			});

			convoElement.getElementsByClassName("convo-lastmessage")[0].textContent = convoData.latestMessage || "Nothing yet";

			convoElement.addEventListener("click", function() {
				loadConversation(convo.key, otherUserID);
			});
		}
	});

	convosDB.on("child_changed", function(convo) {
		const convoData = convo.val();
		var convoElement = containerElement.querySelector(".conversation-" + convo.key);

		convoElement.getElementsByClassName("convo-lastmessage")[0].textContent = convoData.latestMessage || "Nothing yet";
	});
}

// Listen for Messages
function listenForMessages(convoID) {
	var currentUserID = firebase.auth().currentUser.uid;
	const containerElement = document.querySelector(".chat-area .messages");
	const messagesRef = messagesDB.child(convoID);

	containerElement.innerHTML = "";

	messagesRef.on("child_added", function(message) {
		const messageData = message.val();
		const isOwnMessage = messageData.senderID === currentUserID;

		const messageElement = createMessageElement(message.key, isOwnMessage);
		containerElement.appendChild(messageElement);

		const avatar = messageElement.querySelector(".message-avatar");
		avatar.setAttribute('src', getProfilePictureURL(messageData.senderID));

		messageElement.querySelector(".bubble").innerHTML = messageData.text.replace(/(?:\r\n|\r|\n)/g, '<br>');
		messageElement.setAttribute('data-senderid', messageData.senderID);
	});

	messagesRef.on("child_removed", function(message) {
		const messageElement = containerElement.querySelector(".message[data-id='" + message.key + "']");
		if (messageElement) {
			messageElement.remove();
		}
	});
}