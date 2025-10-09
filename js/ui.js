// Welcome Page Modals
function signInPressed() {
	var modal = document.getElementById("signin-modal");
	modal.style.display = "block";

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";
		}
	});

	let actualPassword = '';

	const passwordField = document.getElementById('signin-password');
	
	setPasswordField(passwordField, () => actualPassword, val => actualPassword = val);

	document.getElementById('signin-user').addEventListener('click', function() {
		var email = document.getElementById("signin-email").value;
		
		if (document.getElementById("signin-remember").checked) {
			signInAndPersist(email, actualPassword);
		} else {
			signIn(email, actualPassword);
		}
	});
}

function signUpPressed() {
	var modal = document.getElementById("signup-modal");
	modal.style.display = "block";

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";
		}
	});

	let actualPassword = '';
	let actualConfirm = '';

	const passwordField = document.getElementById('signup-password');
	const confirmField = document.getElementById('signup-confirm');
	
	setPasswordField(passwordField, () => actualPassword, val => actualPassword = val);
	setPasswordField(confirmField, () => actualConfirm, val => actualConfirm = val);

	document.getElementById('signup-user').addEventListener('click', function() {
		var displayName = document.getElementById("signup-displayname").value;
		var username = document.getElementById("signup-username").value;
		var email = document.getElementById("signup-email").value;
		
		createUser(displayName, username, email, actualPassword, actualConfirm);
	});
}

// Create Post
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

// Create Comment
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

// Create Conversation
function createConversationElement(convoID) {
	var html =
	'<div class="conversation-item conversation-' + convoID + '" id="conversation-' + convoID + '">' +
		'<img class="convo-avatar">' +
		'<div class="convo-info">' +
			'<div class="convo-displayname"></div>' +
			'<div class="convo-lastmessage"></div>' +
		'</div>' +
	'</div>';

	// Create the DOM element from the HTML
	var div = document.createElement("div");
	div.innerHTML = html;
	var conversationElement = div.firstChild;

	return conversationElement;
}

// Create Message
function createMessageElement(messageID, isOwnMessage) {
	var html =
	'<div class="message message-' + messageID + ' ' + (isOwnMessage ? 'outgoing' : 'incoming') + '" id="message-' + messageID + '">' +
		'<img class="message-avatar">' +
		'<div class="bubble message-text"></div>' +
	'</div>';

	// Create the DOM element from the HTML
	var div = document.createElement("div");
	div.innerHTML = html;
	var messageElement = div.firstChild;

	return messageElement;
}

// Profile Menu Stuff
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

// Edit Profile
function editProfile() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "block";
}

function closeModal() {
	var modal = document.getElementById("edit-profile");

	modal.style.display = "none";
}

// View Post Modal
function viewPost(post) {
	var lastPosition = window.scrollY;
	
	window.scrollTo({ top: 0, left: 0, behavior: "instant" });

	var modal = document.getElementById("view-post");
	modal.style.display = "block";

	document.body.classList.add("modal-open");

	var commentFunction = function() {
		return createComment(post.key);
	}

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";

			document.body.classList.remove("modal-open");

			document.getElementById("createComment").removeEventListener('click', commentFunction);

			window.scrollTo({ top: lastPosition, left: 0, behavior: "instant" });
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

	loadComments(post.key);
}

// View Profile Modal
let followEventAdded = false;

function viewProfile(userID) {
	var lastPosition = window.scrollY;
	
	window.scrollTo({ top: 0, left: 0, behavior: "instant" });

	var modal = document.getElementById("view-profile");
	modal.style.display = "block";

	document.body.classList.add("modal-open");

	var followButton = document.getElementsByClassName("profile-button")[1];
	
	if (!followEventAdded) {
		followButton.addEventListener("click", () => {
			toggleFollow(userID);
			loadProfileModal(userID);
		});

		followEventAdded = true;
	}

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";

			document.body.classList.remove("modal-open");

			window.scrollTo({ top: lastPosition, left: 0, behavior: "instant" });
		}
	});

	loadProfileModal(userID);
}

function loadProfileModal(userID) {
	var currentUserID = firebase.auth().currentUser.uid;
	
	var avatarView = document.getElementsByClassName("profile-image")[1];
	var profileDisplayName = document.getElementsByClassName("profile-displayname")[1];
	var profileUsername = document.getElementsByClassName("profile-username")[1];
	var followButton = document.getElementsByClassName("profile-button")[1];
	var followingLabel = document.getElementsByClassName("profile-following")[1];
	var followerLabel = document.getElementsByClassName("profile-followers")[1];
		
	var url = getProfilePictureURL(userID);

	avatarView.setAttribute('src', url);

	firebase.database().ref("/users/" + userID).once("value").then((snapshot) => {
		var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
		var username = (snapshot.val() && snapshot.val().username) || "Username";
		var verified = (snapshot.val() && snapshot.val().verified) || false;
		var followingCount = (snapshot.val() && snapshot.val().followingCount) || 0;
		var followerCount = (snapshot.val() && snapshot.val().followerCount) || 0;

		profileDisplayName.textContent = displayName;
		profileUsername.textContent = "@" + username;
		followingLabel.textContent = followingCount;
		followerLabel.textContent = followerCount;

		if (snapshot.val().followers && snapshot.val().followers[currentUserID]) {
			followButton.innerHTML = "Unfollow";
		} else {
			followButton.innerHTML = "Follow";
		}
	});

	loadUserPosts(userID);
}

// Profile Stuff
function loadProfileInfo(userID) {
	var profileImage = document.getElementsByClassName("profile-image")[0];
	var updateAvatarView = document.getElementsByClassName("update-avatar")[0];
	var profileDisplayName = document.getElementsByClassName("profile-displayname")[0];
	var profileUsername = document.getElementsByClassName("profile-username")[0];
	var followingLabel = document.getElementsByClassName("profile-following")[0];
	var followerLabel = document.getElementsByClassName("profile-followers")[0];
	var editProfileNameLabel = document.getElementById("edit-displayname");
	var editProfileUsernameLabel = document.getElementById("edit-username");
		
	var url = getProfilePictureURL(userID);

	profileImage.setAttribute('src', url);
	updateAvatarView.style.backgroundImage = "url(" + url + ")";

	firebase.database().ref("/users/" + userID).once("value").then((snapshot) => {
		var displayName = (snapshot.val() && snapshot.val().displayName) || "Display Name";
		var username = (snapshot.val() && snapshot.val().username) || "Username";
		var verified = (snapshot.val() && snapshot.val().verified) || false;
		var followingCount = (snapshot.val() && snapshot.val().followingCount) || 0;
		var followerCount = (snapshot.val() && snapshot.val().followerCount) || 0;

		profileDisplayName.textContent = displayName;
		profileUsername.textContent = "@" + username;
		followingLabel.textContent = followingCount;
		followerLabel.textContent = followerCount;

		editProfileNameLabel.value = displayName;
		editProfileUsernameLabel.value = username;
	});
}

// List Followed Users
function listFollowedUsers() {
	var lastPosition = window.scrollY;
	
	window.scrollTo({ top: 0, left: 0, behavior: "instant" });

	var modal = document.getElementById("followed-users");
	modal.style.display = "block";

	document.body.classList.add("modal-open");

	modal.addEventListener('click', function(e) {
		if (e.target == this) {
			modal.style.display = "none";

			document.body.classList.remove("modal-open");

			window.scrollTo({ top: lastPosition, left: 0, behavior: "instant" });
		}
	});

	var currentUserID = firebase.auth().currentUser.uid;
	var followingRef = usersDB.child(currentUserID + "/following");
	var containerElement = document.getElementsByClassName("users-container")[0];

	followingRef.once("value").then(function(snapshot) {
		var followedUsers = snapshot.val() || {};
		var userIDs = Object.keys(followedUsers);

		var promises = userIDs.map(function(userID) {
			return usersDB.child(userID).once("value");
		});

		Promise.all(promises).then(function(results) {
			containerElement.innerHTML = "";

			results.forEach(function(snap, index) {
				var userData = snap.val() || {};
				var userID = userIDs[index];

				var html =
				'<div class="followed-user followed-user-' + userID + '" id="followed-user-' + userID + '">' +
					'<img class="followed-avatar" src="' + getProfilePictureURL(userID) + '">' +
					'<div class="followed-info">' +
						'<span class="followed-displayname">' + (userData.displayName || "Display Name") + '</span>' +
						'<span class="followed-username">@' + (userData.username || "Username") + '</span>' +
					'</div>' +
					'<button class="start-chat-button" data-userid="' + userID + '">Start Chat</button>' +
				'</div>';

				var div = document.createElement("div");
				div.innerHTML = html;
				var userElement = div.firstChild;
				containerElement.appendChild(userElement);

				var button = userElement.getElementsByClassName("start-chat-button")[0];
				button.addEventListener("click", function() {
					startConversationWith(userID);
				});
			});
		});
	});
}

function loadConversation(convoID, otherUserID) {
	var currentUserID = firebase.auth().currentUser.uid;
	const chatHeader = document.querySelector(".chat-area .chat-header");

	usersDB.child(otherUserID).once("value").then(function(snapshot) {
		var userData = snapshot.val() || {};

		chatHeader.textContent = userData.displayName;
	});

	listenForMessages(convoID);

	const newMessageView = document.getElementsByClassName("newmessage-textarea")[0];
	const sendButton = document.getElementsByClassName("newmessage-button")[0];

	sendButton.addEventListener("click", function() {
		sendMessage(convoID, currentUserID, newMessageView.value);
	});
}