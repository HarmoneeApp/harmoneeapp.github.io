/* Go Back */
function goBack() {
	window.location.replace("welcome.html");
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

/* Update User Data */
function updateUserData(userID, imageURL, username) {
	var userData = {
		"avatarURL": imageURL,
		"username": username
	};

	firebase.database().ref("users/" + userID).set(userData);
}

/* Upload + Change Profile Picture */
var uploadAvatar = function(event) {
	var newImage = event.target.files[0];

	var user = firebase.auth().currentUser;
	var storageRef = firebase.storage().ref(user.uid).child("avatar.png");
	storageRef.put(newImage);

	var username;

	firebase.database().ref("users").once("value").then((snapshot) => {
		username = snapshot.child(user.uid).child("username").val();
	});

	storageRef.getDownloadURL().then((url) => {
		updateUserData(user.uid, url, username);
		user.updateProfile({
			photoURL: url
		}).then(function() {
			Swal.fire({
				title: "Your profile picture was successfully updated.",
				icon: "success",
				confirmButtonText: "Okay"
			}).then((value) => {
				setTimeout(function() {
					updateProfilePicture();
				}, 200);
			});
		}).catch(function(error) {
			Swal.fire({
				title: "Something went wrong. Please try again.",
				icon: "error",
				confirmButtonText: "Okay"
			});
		});
	}).catch((error) => {
		Swal.fire({
			title: "Something went wrong. Please try again.",
			icon: "error",
			confirmButtonText: "Okay"
		});
	});
}

/* Update Profile Picture */
function updateProfilePicture() {
	var user = firebase.auth().currentUser;
	var avatarView = document.getElementById("avatar-icon");
	var profileImage = document.getElementsByClassName("profile-image")[0];

	avatarView.src = user.photoURL;
	profileImage.src = user.photoURL;
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
function createPostElement(postID, userID, postContent, postDate) {
	var currentID = firebase.auth().currentUser.uid;

	var html =
	'<div class="post post-' + postID + ' mdl-cell mdl-cell--12-col mdl-cell--6-col-tablet mdl-cell--4-col-desktop mdl-grid mdl-grid--no-spacing">' +
		'<div class="mdl-card mdl-shadow--2dp">' +
			'<div class="header">' +
				'<div>' +
					'<div class="avatar"></div>' +
					'<div class="displayName mdl-color-text--black"></div>' +
					'<div class="username mdl-color-text--black"></div>' +
				'</div>' +
			'</div>' +
			'<div class="text"></div>' +
		'</div>' +
	'</div>';

	// Create the DOM element from the HTML
	var div = document.createElement("div");
	div.innerHTML = html;
	var postElement = div.firstChild;
	if (componentHandler) {
		componentHandler.upgradeElements(postElement.getElementsByClassName("mdl-textfield")[0]);
	}

	// Set Values
	postElement.getElementsByClassName("text")[0].innerHTML = postContent;

	return postElement;
}

/* Start Listening for New Posts */
function startDatabaseQueries() {
	var currentUserID = firebase.auth().currentUser.uid;
	var recentPostsRef = firebase.database().ref('posts').limitToLast(100);
	var userPostsRef = firebase.database().ref('user-posts/' + currentUserID);

	var fetchPosts = function(postsRef, sectionElement) {
		postsRef.on("child_added", function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			containerElement.insertBefore(
				createPostElement(data.key, data.val().userID, data.val().postContent, data.val().postDate),
				containerElement.firstChild
			);
		});
		postsRef.on('child_changed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var postElement = containerElement.getElementsByClassName('post-' + data.key)[0];
			postElement.getElementsByClassName('text')[0].innerText = data.val().postContent;
		});
		postsRef.on('child_removed', function(data) {
			var containerElement = sectionElement.getElementsByClassName('posts-container')[0];
			var post = containerElement.getElementsByClassName('post-' + data.key)[0];
			post.parentElement.removeChild(post);
		});
	};

	// Fetch all posts
	fetchPosts(recentPostsRef, recentPostsSection);
	fetchPosts(userPostsRef, userPostsSection);

	// Keep track of listeners
	listeningFirebaseRefs.push(recentPostsRef);
	listeningFirebaseRefs.push(userPostsRef);
}

function newPostForCurrentUser(postContent) {
	
}

/* Post Button Pressed */
function createPost() {
	var postContent = document.getElementById("postcontent").value;
	
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
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
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

		// Create Post
		var currentUserID = firebase.auth().currentUser.uid;
		return createNewPost(currentUserID, postContent, dateString);
	}
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

/* Edit Profile */
function editProfile() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "block";
}

/* Close Modal */
function closeModal() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "none";
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