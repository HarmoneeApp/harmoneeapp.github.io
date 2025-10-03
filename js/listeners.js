const postsDB = firebase.database().ref("posts");

// var recentPosts = document.getElementById("recent-posts");
var timelinePosts = document.getElementById("timeline-posts");
var profilePosts = document.getElementById("profile-posts");
var userPosts = document.getElementById("user-posts");
var listeningFirebaseRefs = [];

// Listen for Posts
function listenForPosts() {
	var currentUserID = firebase.auth().currentUser.uid;
	var usersRef = firebase.database().ref("users");

	var fetchFeedPosts = function(postsRef, sectionElement) {
		postsRef.on("child_added", function(data) {
			usersRef.child(currentUserID).once("value").then((currentUserSnap) => {
				if (currentUserSnap.val().following && currentUserSnap.val().following[data.val().userID]) {
					var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					var postElement = createPostElement(data.key);
					containerElement.insertBefore(postElement, containerElement.firstChild);

					var url = getProfilePictureURL(data.val().userID);

					postElement.getElementsByClassName("post-avatar")[0].setAttribute('src', url);

					usersRef.child(data.val().userID).once("value").then((snapshot) => {
						var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
						var username = (snapshot.val() && snapshot.val().username) || "Username";

						postElement.getElementsByClassName("post-displayname")[0].textContent = displayName;
						postElement.getElementsByClassName("post-username")[0].textContent = "@" + username;
					});

					postElement.getElementsByClassName("post-avatar")[0].style.cursor = "pointer";

					postElement.getElementsByClassName("post-avatar")[0].addEventListener('click', () => {
						if (data.val().userID == currentUserID) {
							showView("profile");
						} else {
							viewProfile(data.val().userID);
						}
					});

					postElement.getElementsByClassName("post-content")[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
					postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);

					if (currentUserID != data.val().userID) {
						postElement.getElementsByClassName("post-delete")[0].hidden = true;
					}

					postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
					postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

					if (data.val().likes && data.val().likes[currentUserID]) {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
					} else {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
					}

					postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
						var postRef = firebase.database().ref("posts").child(data.key);
						toggleLike(currentUserID, postRef);
					});

					postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => {
						viewPost(post);
					});

					postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
						deletePost(data.key);
					});

					postElement.setAttribute('data-userid', data.val().userID);
				}
			});
		});
		usersRef.on('child_changed', function(data) {
			const updatedUserID = data.key;
			const containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			const allPosts = containerElement.getElementsByClassName('post');

			for (let post of allPosts) {
				if (post.dataset.userid === updatedUserID) {
					firebase.database().ref("/users/" + updatedUserID).once("value").then((snapshot) => {
						const displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
						const username = (snapshot.val() && snapshot.val().username) || "Username";
						const avatarURL = getProfilePictureURL(updatedUserID);

						post.getElementsByClassName("post-displayname")[0].textContent = displayName;
						post.getElementsByClassName("post-username")[0].textContent = "@" + username;
						post.getElementsByClassName("post-avatar")[0].setAttribute('src', avatarURL);
					});
				}
			}
		});
		postsRef.on('child_changed', function(data) {
			usersRef.child(currentUserID).once("value").then((currentUserSnap) => {
				if (currentUserSnap.val().following && currentUserSnap.val().followers[data.val().userID]) {
					var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
					postElement.getElementsByClassName('post-content')[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
					postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);
					postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
					postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

					if (data.val().likes && data.val().likes[currentUserID]) {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
					} else {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
					}
				}
			});
		});
		postsRef.on('child_removed', function(data) {
			usersRef.child(currentUserID).once("value").then((currentUserSnap) => {
				if (currentUserSnap.val().following && currentUserSnap.val().followers[data.val().userID]) {
					var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					var post = containerElement.getElementsByClassName('post-' + data.key)[0];
					post.parentElement.removeChild(post);
				}
			});
		});
	}

	var fetchPosts = function(postsRef, sectionElement) {
		postsRef.on("child_added", function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var postElement = createPostElement(data.key);
			containerElement.insertBefore(postElement, containerElement.firstChild);

			var url = getProfilePictureURL(data.val().userID);

			postElement.getElementsByClassName("post-avatar")[0].setAttribute('src', url);

			firebase.database().ref("/users/" + data.val().userID).once("value").then((snapshot) => {
				var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
				var username = (snapshot.val() && snapshot.val().username) || "Username";

				postElement.getElementsByClassName("post-displayname")[0].textContent = displayName;
				postElement.getElementsByClassName("post-username")[0].textContent = "@" + username;
			});

			postElement.getElementsByClassName("post-avatar")[0].style.cursor = "pointer";

			postElement.getElementsByClassName("post-avatar")[0].addEventListener('click', () => {
				if (data.val().userID == currentUserID) {
					showView("profile");
				} else {
					viewProfile(data.val().userID);
				}
			});

			postElement.getElementsByClassName("post-content")[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
			postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);

			if (currentUserID != data.val().userID) {
				postElement.getElementsByClassName("post-delete")[0].hidden = true;
			}

			postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

			if (data.val().likes && data.val().likes[currentUserID]) {
				postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
			} else {
				postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
			}

			postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
				var postRef = firebase.database().ref("posts").child(data.key);
				toggleLike(currentUserID, postRef);
			});

			postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => {
				viewPost(data);
			});

			postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
				deletePost(data.key);
			});

			postElement.setAttribute('data-userid', data.val().userID);
		});
		usersRef.on('child_changed', function(data) {
			const updatedUserID = data.key;
			const containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			const allPosts = containerElement.getElementsByClassName('post');

			for (let post of allPosts) {
				if (post.dataset.userid === updatedUserID) {
					firebase.database().ref("/users/" + updatedUserID).once("value").then((snapshot) => {
						const displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
						const username = (snapshot.val() && snapshot.val().username) || "Username";
						const avatarURL = getProfilePictureURL(updatedUserID);

						post.getElementsByClassName("post-displayname")[0].textContent = displayName;
						post.getElementsByClassName("post-username")[0].textContent = "@" + username;
						post.getElementsByClassName("post-avatar")[0].setAttribute('src', avatarURL);
					});
				}
			}
		});
		postsRef.on('child_changed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
			postElement.getElementsByClassName('post-content')[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
			postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);
			postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
			postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

			if (data.val().likes && data.val().likes[currentUserID]) {
				postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
			} else {
				postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
			}
		});
		postsRef.on('child_removed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var post = containerElement.getElementsByClassName('post-' + data.key)[0];
			post.parentElement.removeChild(post);
		});
	};

	var fetchProfile = function(postsRef, sectionElement) {
		postsRef.on("child_added", function(data) {
			if (data.val().userID == currentUserID) {
				var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
				var postElement = createPostElement(data.key);
				containerElement.insertBefore(postElement, containerElement.firstChild);

				var url = getProfilePictureURL(data.val().userID);

				postElement.getElementsByClassName("post-avatar")[0].setAttribute('src', url);

				firebase.database().ref("/users/" + data.val().userID).once("value").then((snapshot) => {
					var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
					var username = (snapshot.val() && snapshot.val().username) || "Username";

					postElement.getElementsByClassName("post-displayname")[0].textContent = displayName;
					postElement.getElementsByClassName("post-username")[0].textContent = "@" + username;
				});

				postElement.getElementsByClassName("post-content")[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
				postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);

				if (currentUserID != data.val().userID) {
					postElement.getElementsByClassName("post-delete")[0].hidden = true;
				}

				postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
				postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

				if (data.val().likes && data.val().likes[currentUserID]) {
					postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
				} else {
					postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
				}

				postElement.getElementsByClassName("post-like")[0].addEventListener('click', () => {
					var postRef = firebase.database().ref("posts").child(data.key);
					toggleLike(currentUserID, postRef);
				});

				postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => {
					viewPost(data);
				});

				postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
					deletePost(data.key);
				});

				postElement.setAttribute('data-userid', data.val().userID);
			}
			usersRef.on('child_changed', function(data) {
				const updatedUserID = data.key;
				if (updatedUserID == currentUserID) {
					const containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					const allPosts = containerElement.getElementsByClassName('post');

					for (let post of allPosts) {
						if (post.dataset.userid === updatedUserID) {
							firebase.database().ref("/users/" + updatedUserID).once("value").then((snapshot) => {
								const displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
								const username = (snapshot.val() && snapshot.val().username) || "Username";
								const avatarURL = getProfilePictureURL(updatedUserID);

								post.getElementsByClassName("post-displayname")[0].textContent = displayName;
								post.getElementsByClassName("post-username")[0].textContent = "@" + username;
								post.getElementsByClassName("post-avatar")[0].setAttribute('src', avatarURL);
							});
						}
					}
				}
			});
			postsRef.on('child_changed', function(data) {
				if (data.val().userID == currentUserID) {
					var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
					postElement.getElementsByClassName('post-content')[0].innerHTML = data.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
					postElement.getElementsByClassName("post-date")[0].textContent = timeSincePost(data.val().postDate);
					postElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;
					postElement.getElementsByClassName("comment-count")[0].textContent = data.val().commentCount || 0;

					if (data.val().likes && data.val().likes[currentUserID]) {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
					} else {
						postElement.getElementsByClassName("post-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
					}
				}
			});
			postsRef.on('child_removed', function(data) {
				if (data.val().userID == currentUserID) {
					var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
					var post = containerElement.getElementsByClassName('post-' + data.key)[0];

					containerElement.removeChild(post);
				}
			});
		});
	};

	// Fetch timeline posts
	fetchFeedPosts(postsDB, timelinePosts);

	// Fetch 100 most recent posts
	// fetchPosts(postsDB.limitToLast(100), recentPosts);

	// Fetch Profile Posts
	fetchProfile(postsDB, profilePosts);

	// Keep track of listeners
	listeningFirebaseRefs.push(postsDB);
}

// Listen for Comments
function listenForComments(postID) {
	var currentUserID = firebase.auth().currentUser.uid;

	var commentsRef = firebase.database().ref('posts/' + postID + '/comments');
	var usersRef = firebase.database().ref("users");

	var containerElement = document.getElementsByClassName('comment-container')[0];

	containerElement.innerHTML = "";

	commentsRef.on("child_added", function(data) {
		if (!document.getElementById("comment-" + data.key)) {
			var commentElement = createCommentElement(data.key);
			containerElement.insertBefore(commentElement, containerElement.firstChild);

			var url = getProfilePictureURL(data.val().userID);

			commentElement.getElementsByClassName("comment-avatar")[0].setAttribute('src', url);

			firebase.database().ref("/users/" + data.val().userID).once("value").then((snapshot) => {
				var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
				var username = (snapshot.val() && snapshot.val().username) || "Username";

				commentElement.getElementsByClassName("comment-displayname")[0].textContent = displayName;
				commentElement.getElementsByClassName("comment-username")[0].textContent = "@" + username;
			});

			commentElement.getElementsByClassName("comment-avatar")[0].style.cursor = "pointer";

			commentElement.getElementsByClassName("comment-avatar")[0].addEventListener('click', () => {
				if (data.val().userID == currentUserID) {
					showView("profile");
				} else {
					viewProfile(data.val().userID);
				}
			});

			commentElement.getElementsByClassName("comment-content")[0].innerHTML = data.val().commentContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
			commentElement.getElementsByClassName("comment-date")[0].textContent = timeSincePost(data.val().commentDate);

			if (currentUserID != data.val().userID) {
				commentElement.getElementsByClassName("comment-delete")[0].hidden = true;
			}

			commentElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;

			if (data.val().likes && data.val().likes[currentUserID]) {
				commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
			} else {
				commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
			}

			commentElement.getElementsByClassName("comment-like")[0].addEventListener('click', () => {
				var commentRef = commentsRef.child(data.key);
				toggleLike(currentUserID, commentRef);
			});

			commentElement.getElementsByClassName("comment-delete")[0].addEventListener('click', () => {
				deleteComment(postID, data.key);
			});

			commentElement.setAttribute('data-userid', data.val().userID);
		}
	});
	usersRef.on('child_changed', function(data) {
		var commentElement = containerElement.getElementsByClassName('comment-' + data.key)[0];

		firebase.database().ref("/users/" + data.val().userID).once("value").then((snapshot) => {
			var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
			var username = (snapshot.val() && snapshot.val().username) || "Username";

			commentElement.getElementsByClassName("comment-displayname")[0].textContent = displayName;
			commentElement.getElementsByClassName("comment-username")[0].textContent = "@" + username;
		});
	});
	commentsRef.on('child_changed', function(data) {
		var commentElement = containerElement.getElementsByClassName('comment-' + data.key)[0];
		commentElement.getElementsByClassName('comment-content')[0].innerHTML = data.val().commentContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
		commentElement.getElementsByClassName("comment-date")[0].textContent = timeSincePost(data.val().commentDate);
		commentElement.getElementsByClassName("like-count")[0].textContent = data.val().likeCount || 0;

		if (data.val().likes && data.val().likes[currentUserID]) {
			commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon").setAttribute("name", "heart");
		} else {
			commentElement.getElementsByClassName("comment-like")[0].querySelector("ion-icon").setAttribute("name", "heart-outline");
		}
	});
	commentsRef.on('child_removed', function(data) {
		var comment = containerElement.getElementsByClassName('comment-' + data.key)[0];
		containerElement.removeChild(comment);
	});

	// Keep track of listeners
	listeningFirebaseRefs.push(commentsRef);
}

// Listen for Changes
function listenForChanges() {
	const currentUserID = firebase.auth().currentUser.uid;
	var usersRef = firebase.database().ref("users");
	
	usersRef.on('child_changed', function(data) {
		if (data.key == currentUserID) {
			loadProfileInfo(currentUserID);
		}
	});
	
	// Keep track of listeners
	listeningFirebaseRefs.push(usersRef);
}