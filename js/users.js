// Create User - Set Data
function setUserData(userID, displayName, username) {
	var userData = {
		"displayName": displayName,
		"username": username,
		"followingCount": 0,
		"followerCount": 0,
		"verified": "false"
	};

	usersDB.child(userID).set(userData);
}

// Update User Data
function updateUserData(userID, displayName, oldUsername, newUsername) {
	var userData = {
		"displayName": displayName,
		"username": newUsername
	}

	usersDB.child(userID).update(userData);

	if (oldUsername != newUsername) {
		usernamesDB.child(oldUsername).remove();
		usernamesDB.child(newUsername).set(userID);
	}
}

// Follow/Unfollow
function toggleFollow(userID) {
	var currentUserID = firebase.auth().currentUser.uid;
	usersDB.child(currentUserID).transaction((data) => {
		if (data) {
			if (data.following && data.following[userID]) {
				data.followingCount--;
				data.following[userID] = null;
			} else {
				data.followingCount++;
				if (!data.following) {
					data.following = {};
				}
				data.following[userID] = true;
			}
		}
		return data;
	});
	
	usersDB.child(userID).transaction((data) => {
		if (data) {
			if (data.followers && data.followers[currentUserID]) {
				data.followerCount--;
				data.followers[currentUserID] = null;
			} else {
				data.followerCount++;
				if (!data.followers) {
					data.followers = {};
				}
				data.followers[currentUserID] = true;
			}
		}
		return data;
	});	
}