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
function checkBetaStatus() {
	var betaStatus = false;

	if (betaStatus) {
		return true;
	} else {
		return false;
	}
}

/* Beta Portal - Access Key */
async function betaPortal() {
	if (checkBetaStatus() == true) {
		const { value: password } = await Swal.fire({
			title: "Beta Portal",
			icon: "warning",
			input: "password",
			inputPlaceholder: "Access Key",
			inputAttributes: {
				autocapitalize: 'off',
				autocorrect: 'off'
			},
			confirmButtonText: "Continue"
		});
		
		var encryptedValue = CryptoJS.AES.encrypt(password, "Access Key");
		var decryptedValue = CryptoJS.AES.decrypt(encryptedValue, "Access Key");
		if (decryptedValue.toString() == "48594265746154657374657230343232") {
			setTimeout(function() {
				window.location.replace("signup.html");
			}, 500);
		} else {
			Swal.fire({
				title: "Incorrect Password",
				icon: "error",
				confirmButtonText: "Dismiss"
			});
		}
	} else {
		window.location.replace("signup.html");
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
	var illegalChars = /\W/;
	var errorMessage = null;

	var databaseRef = firebase.database().ref("usernames");
	
	databaseRef.once("value").then(function(snapshot) {
		if (snapshot.child(username).exists()) {
			errorMessage = "The username you provided is not available.";
		} else {
			if (username == "") {
				errorMessage = "Please fill in all fields.";
			} else if (username.length < 5) {
				errorMessage = "The username you provided is too short.";
			} else if (username.length > 15) {
				errorMessage = "The username you provided is too long.";
			} else if (illegalChars.test(username)) {
				errorMessage = "The username you provided contains illegal characters.";
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
		"avatarURL": "https://harmoneeapp.com/beta/img/avatar.png",
		"displayName": displayName,
		"username": username,
		"verified": "false"
	};

	firebase.database().ref("users/" + userID).set(userData);
}

function getUserData(userID, callback) {
	firebase.database().ref("users/" + userID).once("value").then(function(snapshot) {
		if (snapshot.exists()) {
			callback(snapshot.val());
		} else {
			callback(null); // No data found for this user
		}
	})
	.catch(function(error) {
		console.error("Error fetching user data:", error);
		callback(null); // Handle error gracefully
	});
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
function updateUserData(userID, username) {
	var userData = {"username": username};

	firebase.database().ref("users/" + userID).set(userData);
}

/* Upload + Change Profile Picture */
async function uploadAvatar(event) {
	var newImage = event.target.files[0];

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
	} else {
		const { data1, error1 } = await supabase.storage.from('avatars').update(user.uid + '.png', file, {
			cacheControl: '3600',
			upsert: true,
			contentType: file.type
		});
		console.log("Image exists, need to replace");
	}

	var username;

	firebase.database().ref("users").once("value").then((snapshot) => {
		username = snapshot.child(user.uid).child("username").val();
	});

	updateUserData(user.uid, username);
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
		return "../img/avatar.png";
	} else {
		return "https://ivneclagzgocuvufxubf.supabase.co/storage/v1/object/public/avatars/" + userID + ".png";
	}
}

/* Shortcuts to DOM Elements */
var recentPosts = document.getElementById("recent-posts");
var userPosts = document.getElementById("user-posts");
var listeningFirebaseRefs = [];

/* Create New Post */
function createNewPost(userID, postContent, postDate) {
	// Post Entry
	var postData = {
		userID: userID,
		postContent: postContent,
		postDate: postDate
	};

	// Create new key
	var newPostKey = firebase.database().ref().child("posts").push().key;

	// Write post data
	var updates = {};
	updates["/posts/" + newPostKey] = postData;
	updates["/user-posts/" + userID + "/" + newPostKey] = postData;

	return firebase.database().ref().update(updates);
}

/* Create Post Elements */
function createPostElement(postID, userID) {
	var html = 
	'<div class="post post-' + postID + '">' +
		'<div class="post-header">' +
			'<img class="post-avatar" src="' + getProfilePictureURL(userID) + '">' +
			'<div class="post-info">' +
				'<span class="post-displayname"></span>' +
				'<span class="post-username"></span>' +
			'</div>' +
		'</div>' +
		'<p class="post-content"></p>' +
		'<div class="post-footer">' +
		'<div class="post-actions">' +
			'<div class="post-like"><ion-icon name="heart-outline"></ion-icon></div>' +
			'<div class="post-comment"><ion-icon name="chatbox-outline"></ion-icon></div>' +
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

/* Start Listening for New Posts */
export function startDatabaseQueries() {
	var currentUserID = firebase.auth().currentUser.uid;
	var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
	var userPostsRef = firebase.database().ref('user-posts/' + currentUserID);

	var fetchPosts = function(postsRef, sectionElement) {
		postsRef.on("child_added", function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var postElement = createPostElement(data.key, data.val().userID);
			containerElement.insertBefore(postElement, containerElement.firstChild);

			firebase.database().ref("/users/" + data.val().userID).once("value").then((snapshot) => {
				var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
				var username = (snapshot.val() && snapshot.val().username) || "Username";

				postElement.getElementsByClassName("post-displayname")[0].textContent = displayName;
				postElement.getElementsByClassName("post-username")[0].textContent = "@" + username;
			});

			postElement.getElementsByClassName("post-content")[0].textContent = data.val().postContent;
			postElement.getElementsByClassName("post-date")[0].textContent = data.val().postDate;

			if (currentUserID != data.val().userID) {
				postElement.getElementsByClassName("post-delete")[0].hidden = true;
			}

			postElement.getElementsByClassName("post-delete")[0].addEventListener('click', () => {
				deletePost(currentUserID, data.key)
			});
		});
		postsRef.on('child_changed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
			postElement.getElementsByClassName('post-content')[0].innerText = data.val().postContent;
		});
		postsRef.on('child_removed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var post = containerElement.getElementsByClassName('post-' + data.key)[0];
			post.parentElement.removeChild(post);
		});
	};

	// Fetch all posts
	fetchPosts(recentPostsRef, recentPosts);
	fetchPosts(userPostsRef, userPosts);

	// Keep track of listeners
	listeningFirebaseRefs.push(recentPostsRef);
	listeningFirebaseRefs.push(userPostsRef);
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
		// Get Date
		const months = [
			"Jan",
			"Feb",
			"March",
			"April",
			"May",
			"June",
			"July",
			"Aug",
			"Sept",
			"Oct",
			"Nov",
			"Dec"
		]
		
		// Get Date
		var currentDate = new Date();
		var dd = currentDate.getDate();

		if (dd < 10) {
			dd = "0" + dd;
		}

		var mm = months[currentDate.getMonth()];

		var yyyy = currentDate.getFullYear();

		var dateString = mm + " " + dd + ", " + yyyy;

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

/* Delete Post */
function deletePost(userID, postID) {
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
			firebase.database().ref().child("user-posts").child(userID).child(postID).remove();
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

	showView(event, 'profile')
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

/* Update Profile */
function updateProfileInfo() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "none";

	/*
	var displayNameField = document.getElementById("edit-displayname");
	var usernameField = document.getElementById("edit-username");
	var websiteField = document.getElementById("edit-website");

	if (displayNameField.value == "" || usernameField.value == "") {
		// Fill in all fields!
	} else {
		//
	}
	*/
}
if (document.getElementById('updateProfileInfo')) {
	document.getElementById('updateProfileInfo').addEventListener('click', updateProfileInfo);
}