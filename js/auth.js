const usernamesDB = firebase.database().ref("usernames");

// Create User - Validate Data
function validateData(displayName, username, email, password, confirm) {
	const errors = [];
	
	// Display Name
	if (displayName == "" || displayName.trim() == "") {
		errors.push("Display Name cannot be blank.");
	} else if (displayName.length >= 50) {
		errors.push("Display Name must be less than 50 characters.");
	}

	// Username
	const uRegex = /^[a-zA-Z0-9_]+$/;

	if (username == "") {
		errors.push("Username cannot be blank.");
	} else if (!uRegex.test(username)) {
		errors.push("Username can only contain letters, numbers and underscores.");
	} else if (username.length < 5 || username.length > 15) {
		errors.push("Username must be between 5 and 15 characters.");
	} else {
		usernamesDB.once("value").then(function(snapshot) {
			if (snapshot.child(username).exists()) {
				errors.push("Username is not available.");
			}
		});
	}

	// Email
	const eRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (email == "") {
		errors.push("Email cannot be blank.");
	} else if (!eRegex.test(email)) {
		errors.push("Email must be a valid format.");
	}

	// Password
	if (password != confirm) {
		errors.push("Passwords do not match.");
	} else if (password.includes(" ")) {
		errors.push("Password cannot contain spaces.");
	} else if (password.length < 10) {
		errors.push("Password must be at least 10 characters long.");
	}

	return {
		isValid: errors.length === 0,
		errors
	}
}

// Create User
function createUser(displayName, username, email, password, confirm) {
	const result = validateData(displayName, username, email, password, confirm);

	if (!result.isValid) {
		const errorMessage = result.errors.join("\n");
		console.log(errorMessage);

		Swal.fire({
			html: errorMessage.replace(/\n/g, '<br>'),
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		});
	} else {
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
				iconColor: "#10b981",
				background: "#3c4469",
				color: "#e4e4e4",
				confirmButtonColor: "#6c759b",
				confirmButtonText: "Okay"
			}).then((value) => {
				setUserData(uid, displayName, username);

				firebase.database().ref("usernames/" + username).set(uid);

				setTimeout(function() {
					window.location.replace("index.html");
				}, 500);
			});
		}).catch((error) => {
			if (error.code == "auth/email-already-in-use") {
				Swal.fire({
					title: "Email is already in use",
					icon: "error",
					iconColor: "#ef4444",
					background: "#3c4469",
					color: "#e4e4e4",
					confirmButtonColor: "#6c759b",
					confirmButtonText: "Okay"
				});
			} else {
				Swal.fire({
					title: error.code + ": " + error.message,
					icon: "error",
					iconColor: "#ef4444",
					background: "#3c4469",
					color: "#e4e4e4",
					confirmButtonColor: "#6c759b",
					confirmButtonText: "Okay"
				});
			}
		});
	}
}

// Sign In
function signIn(email, password) {
	firebase.auth().signInWithEmailAndPassword(email, password).then((success) => {
		Swal.fire({
			title: "You were successfully signed in.",
			icon: "success",
			iconColor: "#10b981",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				window.location.replace("index.html");
			}, 500);
		});
	}).catch((error) => {
		Swal.fire({
			title: error.message,
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		});
	});
}

function signInAndPersist(email, password) {
	firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(() => {
		return signIn(email, password);
	}).catch((error) => {
		Swal.fire({
			title: error.message,
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		});
	});
}

// Sign Out
function signOutUser() {
	firebase.auth().signOut().then((success) => {
		Swal.fire({
			title: "You were successfully signed out.",
			icon: "success",
			iconColor: "#10b981",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				window.location.replace("welcome.html");
			}, 1000);
		});
	}).catch((error) => {
		Swal.fire({
			title: error.message,
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		});
	});
}