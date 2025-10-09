function startConversationWith(userID) {
	var currentUserID = firebase.auth().currentUser.uid;
	
	var participantsHash = [currentUserID, userID].sort().join("_");
	
	convosDB.orderByChild("participantsHash").equalTo(participantsHash).once("value").then(function(snapshot) {
		if (snapshot.exists()) {
			var existingConvoKey = Object.keys(snapshot.val())[0];
			console.log("Existing conversation:", existingConvoKey);
			return existingConvoKey;
		} else {
			var convoData = {
				participants: [currentUserID, userID],
				participantsHash: participantsHash,
				createdAt: Date.now()
			};

			var newConvoKey = convosDB.push().key;

			var updates = {};
			updates[newConvoKey] = convoData;

			return convosDB.update(updates).then(function() {
				console.log("New conversation created:", newConvoKey);
				return newConvoKey;
			});
		}
	});
}

function sendMessage(convoID, senderID, messageText) {
	var messageData = {
		senderID: senderID,
		text: messageText,
		timestamp: Date.now()
	};

	var newMessageKey = messagesDB.child(convoID).push().key;

	var updates = {};
	updates["/messages/" + convoID + "/" + newMessageKey] = messageData;

	updates["/conversations/" + convoID + "/latestMessage"] = messageText;
	updates["/conversations/" + convoID + "/updatedAt"] = Date.now();

	return db.update(updates);
}