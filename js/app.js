/* Supabase Stuff */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://ivneclagzgocuvufxubf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bmVjbGFnemdvY3V2dWZ4dWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDY0MTksImV4cCI6MjA3MzE4MjQxOX0.gqMhkDpVq0bSLx5y7jUrBXWbA1Zb662s2spolbeByao";
const supabase = createClient(supabaseUrl, supabaseKey);

/* Go Back */
function goBack() {
	window.location.replace("welcome.html");
}
if (document.getElementById('goBack')) {
	document.getElementById('goBack').addEventListener('click', goBack);
}

/* Trim */
function trim(string) {
	return string.replace(/^\s+|\s+$/, "");
}

/* Development Mode - Check Beta Status */
export function checkBetaStatus() {
	var betaStatus = true;

	if (betaStatus) {
		Swal.fire({
			title: "",
			text: "Harmonee is currently in beta stages, and only existing users have access.\n\nCheck back soon!",
			icon: "error",
			confirmButtonText: "Okay"
		}).then((value) => {
			window.location.replace("welcome.html");
		});
	}
}

/* Firebase Auth - Check Display Name */
function checkDisplayName(displayName) {
	var errorMessage = null;

	if (displayName == "") {
		errorMessage = "Please fill in all fields.";
	}

	return errorMessage;
}

/* Firebase Auth - Check Username */
function checkUsername(username) {
	var allowedChars = /^[a-zA-Z0-9_]+$/;
	var errorMessage = null;

	var databaseRef = firebase.database().ref("usernames");
	
	databaseRef.once("value").then(function(snapshot) {
		if (snapshot.child(username).exists()) {
			errorMessage = "Username is not available.";
		} else {
			if (username == "") {
				errorMessage = "Please fill in all fields.";
			} else if (username.length < 5 || username.length > 15) {
				errorMessage = "Username must be between 5 and 15 characters in length.";
			} else if (!allowedChars.test(username)) {
				errorMessage = "Username contains invalid characters. Only letters, numbers, and underscores are allowed.";
			} else if (username.startsWith('_')) {
				errorMessage = "Username cannot start with an underscore.";
			}
		}
	});

	return errorMessage;
}

/* Firebase Auth - Check Email */
function checkEmail(email) {
	var trimmedEmail = trim(email);
	var emailFilter = /^[^@]+@[^@.]+\.[^@]*\w\w$/;
	var illegalChars = /[\(\)\<\>\,\;\:\\\"\[\]]/;
	var errorMessage = null;

	if (email == "") {
		errorMessage = "Please fill in all fields.";
	} else if (!emailFilter.test(trimmedEmail)) {
		errorMessage = "The email you provided is not valid.";
	} else if (email.match(illegalChars)) {
		errorMessage = "The email you provided contains illegal characters.";
	}

	return errorMessage;
}

/* Firebase Auth - Check Password */
function checkPassword(password, confirm) {
	var illegalChars = /[\W_]/;
	var errorMessage = null;

	if (password == "" || confirm == "") {
		errorMessage = "Please fill in all fields.";
	} else {
		if (password != confirm) {
			errorMessage = "The passwords you provided do not match.";
		} else {
			var finalPassword = password;

			if (finalPassword.length < 7) {
				errorMessage = "The password you provided is too short.";
			} else if (finalPassword.length > 15) {
				errorMessage = "The password you provided is too long.";
			} else if (illegalChars.test(finalPassword)) {
				errorMessage = "The password you provided contains illegal characters.";
			}
		}
	}

	return errorMessage;
}

function setUserData(userID, displayName, username) {
	var userData = {
		"displayName": displayName,
		"username": username,
		"verified": "false"
	};

	firebase.database().ref("users/" + userID).set(userData);
}

/* Firebase Auth - Create User */
function createUser() {
	// Input Fields
	var displayName = document.getElementById("displayName").value;
	var username = document.getElementById("username").value;
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var confirm = document.getElementById("confirm").value;

	// Validations
	var isDisplayNameValid = false;
	var isUsernameValid = false;
	var isEmailValid = false;
	var isPasswordValid = false;

	// Perform Validations
	if (checkDisplayName(displayName) != null) {
		Swal.fire({
			title: checkDisplayName(displayName),
			icon: "error",
			confirmButtonText: "Okay"
		});

		isDisplayNameValid = false;
	} else {
		isDisplayNameValid = true;
	}
	if (checkUsername(username) != null) {
		Swal.fire({
			title: checkUsername(username),
			icon: "error",
			confirmButtonText: "Okay"
		});

		isUsernameValid = false;
	} else {
		isUsernameValid = true;
	}
	if (checkEmail(email) != null) {
		Swal.fire({
			title: checkEmail(email),
			icon: "error",
			confirmButtonText: "Okay"
		});

		isEmailValid = false;
	} else {
		isEmailValid = true;
	}
	if (checkPassword(password, confirm) != null) {
		Swal.fire({
			title: checkPassword(password, confirm),
			icon: "error",
			confirmButtonText: "Okay"
		});

		isPasswordValid = false;
	} else {
		isPasswordValid = true;
	}

	if (isDisplayNameValid && isUsernameValid && isEmailValid && isPasswordValid) {
		firebase.auth().createUserWithEmailAndPassword(email, password).then((success) => {
			var user = firebase.auth().currentUser;
			var uid;
			if (user != null) {
				uid = user.uid;
			}

			Swal.fire({
				title: "Account Created",
				text: "Your account was created successfully.",
				icon: "success",
				confirmButtonText: "Okay"
			}).then((value) => {
				setUserData(uid, displayName, username);

				firebase.database().ref("usernames/" + username).set(uid);

				setTimeout(function() {
					window.location.replace("index.html");
				}, 500);
			});
		}).catch((error) => {
			var errorCode = error.code;
			var errorMessage = error.message;

			Swal.fire({
				title: errorMessage,
				icon: "error",
				confirmButtonText: "Okay"
			});
		});
	}
}
if (document.getElementById('createUser')) {
	document.getElementById('createUser').addEventListener('click', createUser);
}

/* Firebase Auth - Sign In User */
function signIn() {
	if (document.getElementById("remember").checked) {
		signInAndPersist();
	} else {
		signInUser();
	}
}
if (document.getElementById('signIn')) {
	document.getElementById('signIn').addEventListener('click', signIn);
}

function signInAndPersist() {
	firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
		return signInUser();
	}).catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;

		Swal.fire({
			title: errorMessage,
			icon: "error",
			confirmButtonText: "Okay"
		});
	});
}

function signInUser() {
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;

	firebase.auth().signInWithEmailAndPassword(email, password).then((success) => {
		Swal.fire({
			title: "You were successfully signed in.",
			icon: "success",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				window.location.replace("index.html");
			}, 500);
		});
	}).catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;

		Swal.fire({
			title: errorMessage,
			icon: "error",
			confirmButtonText: "Okay"
		});
	});
}

/* Firebase Auth - Sign Out */
function signOutUser() {
	firebase.auth().signOut().then((success) => {
		// Signed Out
		Swal.fire({
			title: "You were successfully signed out.",
			icon: "success",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				window.location.replace("welcome.html");
			}, 1000);
		});
	}).catch((error) => {
		var errorCode = error.code;
		var errorMessage = error.message;
		
		Swal.fire({
			title: errorMessage,
			icon: "error",
			confirmButtonText: "Okay"
		});
	});
}
if (document.getElementById('signOutUser')) {
	document.getElementById('signOutUser').addEventListener('click', signOutUser);
}

/* Update User Data */
function updateUserData(userID, displayName, username) {
	var userData = {
		"displayName": displayName,
		"username": username
	};

	firebase.database().ref("users/" + userID).set(userData);
}

/* Upload + Change Profile Picture */
async function uploadAvatar(event) {
	var user = firebase.auth().currentUser;
	const file = event.target.files[0];

	if (!file) {
	  console.error('No file selected');
	  return;
	}
	
	const { data, error } = await supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");

	if (error) {
		const { data1, error1 } = await supabase.storage.from('avatars').upload(user.uid + '.png', file, {
			cacheControl: '3600',
			upsert: true,
			contentType: file.type
		});

		Swal.fire({
			title: "Your profile picture was successfully updated.",
			icon: "success",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				updateProfilePicture();
			}, 200);
		}).catch(function(error) {
			Swal.fire({
				title: "Something went wrong. Please try again.",
				icon: "error",
				confirmButtonText: "Okay"
			});
		});
	} else {
		const { data1, error1 } = await supabase.storage.from('avatars').update(user.uid + '.png', file, {
			cacheControl: '3600',
			upsert: true,
			contentType: file.type
		});

		Swal.fire({
			title: "Your profile picture was successfully updated.",
			icon: "success",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				updateProfilePicture();
			}, 200);
		}).catch(function(error) {
			Swal.fire({
				title: "Something went wrong. Please try again.",
				icon: "error",
				confirmButtonText: "Okay"
			});
		});
	}
}
if (document.getElementById('edit-avatar')) {
	document.getElementById('edit-avatar').addEventListener('change', uploadAvatar);
}

/* Update Profile Picture */
function updateProfilePicture() {
	var avatarView = document.getElementById("avatar-icon");
	var profileImage = document.getElementsByClassName("profile-image")[0];

	avatarView.src = supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");
	profileImage.src = supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");
}

/* Check if Profile Picture Exists */
export function getProfilePictureURL(userID) {
    var http = new XMLHttpRequest();
	var imageURL = "https://ivneclagzgocuvufxubf.supabase.co/storage/v1/object/public/avatars/" + userID + ".png";

    http.open('HEAD', imageURL, false);
    http.send();

	if (http.status == 404) {
		return "https://harmoneeapp.github.io/img/avatar.png";
	} else {
		return "https://ivneclagzgocuvufxubf.supabase.co/storage/v1/object/public/avatars/" + userID + ".png";
	}
}

/* Shortcuts to DOM Elements */
var recentPosts = document.getElementById("recent-posts");
var profilePosts = document.getElementById("profile-posts");
var userPosts = document.getElementById("user-posts");
var listeningFirebaseRefs = [];

/* Create New Post */
function createNewPost(userID, postContent, postDate) {
	// Post Entry
	var postData = {
		userID: userID,
		postContent: postContent,
		postDate: postDate,
		likeCount: 0,
		commentCount: 0
	};

	// Create new key
	var newPostKey = firebase.database().ref().child("posts").push().key;

	// Write post data
	var updates = {};
	updates["/posts/" + newPostKey] = postData;

	return firebase.database().ref().update(updates);
}

function createNewComment(postID, userID, commentContent, commentDate) {
	// Comment Count
	firebase.database().ref('posts/' + postID).transaction((post) => {
		post.commentCount++;
		return post;
	});

	// Comment Entry
	var commentData = {
		userID: userID,
		commentContent: commentContent,
		commentDate: commentDate,
		likeCount: 0
	};

	// Create new key
	var newCommentKey = firebase.database().ref().child("posts").child(postID).child("comments").push().key;

	// Write comment data
	var updates = {};
	updates["/posts/" + postID + "/comments/" + newCommentKey] = commentData;

	return firebase.database().ref().update(updates);
}

/* Create Post Element */
function createPostElement(postID) {
	var html = 
	'<div class="post post-' + postID + '" id="post-' + postID + '">' +
		'<div class="post-header">' +
			'<img class="post-avatar">' +
			'<div class="post-info">' +
				'<span class="post-displayname"></span>' +
				'<span class="post-username"></span>' +
			'</div>' +
		'</div>' +
		'<p class="post-content"></p>' +
		'<div class="post-footer">' +
		'<div class="post-actions">' +
			'<div class="post-like"><ion-icon name="heart-outline"></ion-icon><span class="like-count"></span></div>' +
			'<div class="post-comment"><ion-icon name="chatbubble-outline"></ion-icon><span class="comment-count"></span></div>' +
			'<div class="post-delete"><ion-icon name="trash-outline"></ion-icon></div>' +
		'</div>' +
			'<span class="post-date"></span>' +
		'</div>' +
	'</div>';

	// Create the DOM element from the HTML
	var div = document.createElement("div");
	div.innerHTML = html;
	var postElement = div.firstChild;

	return postElement;
}

/* Create Comment Element */
function createCommentElement(commentID) {
	var html = 
	'<div class="comment comment-' + commentID + '" id="comment-' + commentID + '">' +
		'<div class="comment-header">' +
			'<img class="comment-avatar">' +
			'<div class="comment-info">' +
				'<span class="comment-displayname"></span>' +
				'<span class="comment-username"></span>' +
			'</div>' +
		'</div>' +
		'<p class="comment-content"></p>' +
		'<div class="comment-footer">' +
		'<div class="comment-actions">' +
			'<div class="comment-like"><ion-icon name="heart-outline"></ion-icon><span class="like-count"></span></div>' +
			'<div class="comment-delete"><ion-icon name="trash-outline"></ion-icon></div>' +
		'</div>' +
			'<span class="comment-date"></span>' +
		'</div>' +
	'</div>';

	// Create the DOM element from the HTML
	var div = document.createElement("div");
	div.innerHTML = html;
	var commentElement = div.firstChild;

	return commentElement;
}

/* Like Functionality */
function toggleLike(userID, postKey) {
	firebase.database().ref('posts/' + postKey).transaction((post) => {
		if (post) {
			if (post.likes && post.likes[userID]) {
				post.likeCount--;
				post.likes[userID] = null;
			} else {
				post.likeCount++;
				if (!post.likes) {
					post.likes = {};
				}
				post.likes[userID] = true;
			}
		}
		return post;
	});
}

/* Show Posts by User */
function getProfilePosts(userID) {
	firebase.database().ref("posts").once("value").then(snapshot => {
		const posts = [];

		snapshot.forEach(childSnapshot => {
			const postData = childSnapshot.val();
			postData.key = childSnapshot.key;
			if (postData.userID === userID) {
				posts.unshift(postData);
			}
		});

		console.log(posts);
		
		return posts;
	}).catch(error => {
		console.error("Error fetching posts:", error);
		return [];
	});
}

/* Time Since Post */
function timeSincePost(postDate) {
	var dateString = new Date().toISOString();
	var currentDate = new Date(dateString);
	var datePosted = new Date(postDate);

	var seconds = Math.round((currentDate.getTime() - datePosted.getTime()) / 1000);
	var timeSince;

	if (seconds < 60) {
		timeSince = "Just Now";
	} else if (seconds < 3600) {
		timeSince = Math.round(seconds / 60) + "m ago";
	} else if (seconds < 86400) {
		timeSince = Math.round(seconds / 3600) + "h ago";
	} else {
		timeSince = Math.round(seconds / 86400) + "d ago";
	}

	return timeSince;
}

/* Start Listening for New Posts */
export function startDatabaseQueries() {
	var currentUserID = firebase.auth().currentUser.uid;
	var postsRef = firebase.database().ref('posts');

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
				toggleLike(currentUserID, data.key);
			});

			postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => {
				viewPost(data);
			});

			postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
				deletePost(data.key);
			});
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
					toggleLike(currentUserID, data.key);
				});

				postElement.getElementsByClassName("post-comment")[0].addEventListener('click', () => {
					viewPost(data);
				});

				postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
					deletePost(data.key);
				});
				
			}
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

	// Fetch all posts
	fetchPosts(postsRef.limitToLast(100), recentPosts);

	// Fetch Profile Posts
	fetchProfile(postsRef, profilePosts);

	// Keep track of listeners
	listeningFirebaseRefs.push(postsRef);
}

/* Post Button Pressed */
function createPost() {
	var postContent = document.getElementById("newpost-content").value;

	if (postContent == "" || !postContent.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Post cannot be empty!",
			icon: "error",
			confirmButtonText: "Okay"
		});
	} else {
		// Get Timestamp
		var date = new Date();
		var dateString = date.toISOString();

		// Clear Text Field
		document.getElementById("newpost-content").value = "";
		document.getElementById("current_count").textContent = "0";

		// Create Post
		var currentUserID = firebase.auth().currentUser.uid;
		
		return createNewPost(currentUserID, postContent, dateString);
	}
}
if (document.getElementById('createPost')) {
	document.getElementById('createPost').addEventListener('click', createPost);
}

/* Create Comment */
function createComment(postID) {
	var commentContent = document.getElementById("newcomment-content").value;
	
	if (commentContent == "" || !commentContent.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Comment cannot be empty!",
			icon: "error",
			confirmButtonText: "Okay"
		});
	} else {
		// Get Timestamp
		var date = new Date();
		var dateString = date.toISOString();

		// Clear Text Field
		document.getElementById("newcomment-content").value = "";

		// Create Comment
		var currentUserID = firebase.auth().currentUser.uid;
		
		return createNewComment(postID, currentUserID, commentContent, dateString);
	}
}


/* Delete Post */
function deletePost(postID) {
	Swal.fire({
		title: "Are You Sure?",
		text: "Are you sure you want to delete this post?\nThis action cannot be undone!",
		icon: "warning",
		showCancelButton: true,
		cancelButtonColor: "#e0e0e0",
		confirmButtonColor: "#ff512f",
		confirmButtonText: "Yes, delete it!"
	}).then((result) => {
		if (result.isConfirmed) {
			firebase.database().ref().child("posts").child(postID).remove();
		}
	});
}

/* Delete Comment */
function deleteComment(postID, commentID) {
	Swal.fire({
		title: "Are You Sure?",
		text: "Are you sure you want to delete this comment?\nThis action cannot be undone!",
		icon: "warning",
		showCancelButton: true,
		cancelButtonColor: "#e0e0e0",
		confirmButtonColor: "#ff512f",
		confirmButtonText: "Yes, delete it!"
	}).then((result) => {
		if (result.isConfirmed) {
			firebase.database().ref('posts/' + postID).transaction((post) => {
				post.commentCount--;
				return post;
			});

			firebase.database().ref().child("posts/" + postID + "/comments").child(commentID).remove();
		}
	});
	
}

/* Toggle Dropdown Visibility */
function showProfileMenu() {
	var profileMenu = document.getElementById("profileMenu");
	var feedView = document.getElementById("feed");
	var searchView = document.getElementById("search");
	var messagesView = document.getElementById("messages");
	var profileView = document.getElementById("profile");
	
	profileMenu.classList.toggle("show");
	feedView.classList.toggle("moved-down");
	searchView.classList.toggle("moved-down");
	messagesView.classList.toggle("moved-down");
	profileView.classList.toggle("moved-down");
}
if (document.getElementById('showProfileMenu')) {
	document.getElementById('showProfileMenu').addEventListener('click', showProfileMenu);
}

/* Dismiss Menu and View Profile */
function showProfile() {
	var profileMenu = document.getElementById("profileMenu");
	var feedView = document.getElementById("feed");
	var searchView = document.getElementById("search");
	var messagesView = document.getElementById("messages");
	var profileView = document.getElementById("profile");
	
	profileMenu.classList.toggle("show");
	feedView.classList.toggle("moved-down");
	searchView.classList.toggle("moved-down");
	messagesView.classList.toggle("moved-down");
	profileView.classList.toggle("moved-down");

	showView('profile');
}
if (document.getElementById('showProfile')) {
	document.getElementById('showProfile').addEventListener('click', showProfile);
}

/* Edit Profile */
function editProfile() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "block";
}
if (document.getElementById('editProfile')) {
	document.getElementById('editProfile').addEventListener('click', editProfile);
}

/* Close Modal */
function closeModal() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "none";
}
if (document.getElementById('closeModal')) {
	document.getElementById('closeModal').addEventListener('click', closeModal);
}

/* View Post */
function viewPost(post) {
	var modal = document.getElementById("view-post");
	modal.style.display = "block";

	var commentFunction = function() {
		return createComment(post.key);
	}

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";

			document.getElementById("createComment").removeEventListener('click', commentFunction);
		}
	});

	var avatarView = document.getElementsByClassName("postmodal-avatar")[0];
	var displayNameLabel = document.getElementsByClassName("postmodal-displayname")[0];
	var usernameLabel = document.getElementsByClassName("postmodal-username")[0];
	var contentLabel = document.getElementsByClassName("postmodal-content")[0];
	var dateLabel = document.getElementsByClassName("postmodal-date")[0];

	var url = getProfilePictureURL(post.val().userID);

	avatarView.setAttribute('src', url);

	firebase.database().ref("/users/" + post.val().userID).once("value").then((snapshot) => {
		var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
		var username = (snapshot.val() && snapshot.val().username) || "Username";

		displayNameLabel.textContent = displayName;
		usernameLabel.textContent = "@" + username;
	});

	contentLabel.innerHTML = post.val().postContent.replace(/(?:\r\n|\r|\n)/g, '<br>');
	dateLabel.textContent = timeSincePost(post.val().postDate);

	var postView = document.getElementsByClassName("postmodal-post")[0];
	var commentView = document.getElementsByClassName("comment-container")[0];
	var postHeight = postView.offsetHeight + 20;

	commentView.style.top = `${postHeight}px`;

	document.getElementById("createComment").addEventListener('click', commentFunction);

	listenForComments(post.key);
}

/* Listen for Comments */
function listenForComments(postID) {
	var currentUserID = firebase.auth().currentUser.uid;

	var commentsRef = firebase.database().ref('posts/' + postID + '/comments');
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
				toggleLike(currentUserID, data.key);
			});


			commentElement.getElementsByClassName("comment-delete")[0].addEventListener('click', () => {
				deleteComment(postID, data.key);
			});
		}
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

/* View Profile */
function viewProfile(userID) {
	var modal = document.getElementById("view-profile");
	modal.style.display = "block";

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";
		}
	});

	var avatarView = document.getElementsByClassName("profilemodal-image")[0];
	var profileDisplayName = document.getElementsByClassName("profilemodal-displayname")[0];
	var profileUsername = document.getElementsByClassName("profilemodal-username")[0];
		
	var url = getProfilePictureURL(userID);

	avatarView.setAttribute('src', url);

	firebase.database().ref("/users/" + userID).once("value").then((snapshot) => {
		var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
		var username = (snapshot.val() && snapshot.val().username) || "Username";
		var verified = (snapshot.val() && snapshot.val().verified) || false;

		profileDisplayName.textContent = displayName;
		profileUsername.textContent = "@" + username;
	});

	document.getElementsByClassName('modal-close')[1].addEventListener('click', () => {
		modal.style.display = "none";
	});
}

/* Update Profile */
function updateProfileInfo() {
	var currentUserID = firebase.auth().currentUser.uid;
	var displayName = document.getElementById("edit-displayname").value;
	var username = document.getElementById("edit-username").value;

	if (displayName == "" || !displayName.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Display Name cannot be blank!",
			icon: "error",
			confirmButtonText: "Okay"
		});
	} else if (username == "" || !username.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Username cannot be blank!",
			icon: "error",
			confirmButtonText: "Okay"
		});
	} else {
		var allowedChars = /^[a-zA-Z0-9_]+$/;

		var errorMessage = null;

		if (username == "") {
			errorMessage = "Please fill in all fields.";
		} else if (username.length < 5 || username.length > 15) {
			errorMessage = "Username must be between 5 and 15 characters in length.";
		} else if (!allowedChars.test(username)) {
			errorMessage = "Username contains invalid characters. Only letters, numbers, and underscores are allowed.";
		} else if (username.startsWith('_')) {
			errorMessage = "Username cannot start with an underscore.";
		}

		if (errorMessage) {
			Swal.fire({
				title: errorMessage,
				icon: "error",
				confirmButtonText: "Okay"
			});
		} else {
			var databaseRef = firebase.database().ref("usernames");

			databaseRef.once("value").then(function(snapshot) {
				if (snapshot.child(username).exists()) {
					if (snapshot.child(username).val() != currentUserID) {
						Swal.fire({
							title: "Username is not available.",
							icon: "error",
							confirmButtonText: "Okay"
						});
					} else {
						updateUserData(currentUserID, displayName, username);

						var modal = document.getElementById("edit-profile");
						modal.style.display = "none";
					}
				} else {
					updateUserData(currentUserID, displayName, username);

					var modal = document.getElementById("edit-profile");
					modal.style.display = "none";
				}
			});
		}
	}
}
if (document.getElementById('updateProfileInfo')) {
	document.getElementById('updateProfileInfo').addEventListener('click', updateProfileInfo);
}