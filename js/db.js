// New Post 
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

// New Comment
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

// Toggle Like on Post or Comment
function toggleLike(userID, dbRef) {
	dbRef.transaction((data) => {
		if (data) {
			if (data.likes && data.likes[userID]) {
				data.likeCount--;
				data.likes[userID] = null;
			} else {
				data.likeCount++;
				if (!data.likes) {
					data.likes = {};
				}
				data.likes[userID] = true;
			}
		}
		return data;
	});
}

// Show Posts by User
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

// Create Post
function createPost() {
	var postContent = document.getElementById("newpost-content").value;

	if (postContent == "" || !postContent.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Post cannot be empty!",
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
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

// Create Comment
function createComment(postID) {
	var commentContent = document.getElementById("newcomment-content").value;
	
	if (commentContent == "" || !commentContent.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Comment cannot be empty!",
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
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

// Delete Post
function deletePost(postID) {
	Swal.fire({
		title: "Are You Sure?",
		text: "Are you sure you want to delete this post?\nThis action cannot be undone!",
		icon: "warning",
		iconColor: "#fbbf24",
		background: "#3c4469",
		color: "#e4e4e4",
		reverseButtons: true,
		showCancelButton: true,
		cancelButtonColor: "#6c759b",
		confirmButtonColor: "#ef4444",
		confirmButtonText: "Yes, delete it!"
	}).then((result) => {
		if (result.isConfirmed) {
			firebase.database().ref().child("posts").child(postID).remove();
		}
	});
}

// Delete Comment
function deleteComment(postID, commentID) {
	Swal.fire({
		title: "Are You Sure?",
		text: "Are you sure you want to delete this comment?\nThis action cannot be undone!",
		icon: "warning",
		iconColor: "#fbbf24",
		background: "#3c4469",
		color: "#e4e4e4",
		reverseButtons: true,
		showCancelButton: true,
		cancelButtonColor: "#6c759b",
		confirmButtonColor: "#ef4444",
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

// Update Profile Info
function updateProfileInfo() {
	var currentUserID = firebase.auth().currentUser.uid;
	var displayName = document.getElementById("edit-displayname").value;
	var username = document.getElementById("edit-username").value;

	if (displayName == "" || !displayName.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Display Name cannot be blank!",
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		});
	} else if (username == "" || !username.replace(/\s/g, '').length) {
		Swal.fire({
			title: "Username cannot be blank!",
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
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
				iconColor: "#ef4444",
				background: "#3c4469",
				color: "#e4e4e4",
				confirmButtonColor: "#6c759b",
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
							iconColor: "#ef4444",
							background: "#3c4469",
							color: "#e4e4e4",
							confirmButtonColor: "#6c759b",
							confirmButtonText: "Okay"
						});
					} else {
						firebase.database().ref("/users/" + currentUserID).once("value").then((userSnapshot) => {
							var oldUsername = (userSnapshot.val() && userSnapshot.val().username) || "Username";
							
							updateUserData(currentUserID, displayName, oldUsername, username);

							var modal = document.getElementById("edit-profile");
							modal.style.display = "none";
						});
					}
				} else {
					firebase.database().ref("/users/" + currentUserID).once("value").then((userSnapshot) => {
						var oldUsername = (userSnapshot.val() && userSnapshot.val().username) || "Username";
						
						updateUserData(currentUserID, displayName, oldUsername, username);

						var modal = document.getElementById("edit-profile");
						modal.style.display = "none";
					});
				}
			});
		}
	}
}