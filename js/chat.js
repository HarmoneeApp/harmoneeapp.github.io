function createConversation(userIDs) {
	// Conversation Entry
	var convoData = {
		participants: Object.fromEntries(userIDs.map(id => [id, true])),
		latestMessage: initialMessage,
		updatedAt: timestamp
	};

	// Create new key
	var newConvoKey = convosDB.push().key;

	// Write conversation data
	var updates = {};
	updates[newConvoKey] = convoData;

	return convosDB.update(updates);
}

function sendMessage(convoID, senderID, content, timestamp) {
	// Message Entry
	var messageData = {
		senderID: senderID,
		content: content,
		sentAt: timestamp
	};

	// Create new key
	var newMessageKey = messagesDB.child(convoID).push().key;

	// Write message data
	var updates = {};
	updates["/messages/" + convoID + "/" + newMessageKey] = messageData;

	// Update latest message
	updates["/conversations/" + convoID + "/latestMessage"] = content;
	updates["/conversations/" + convoID + "/updatedAt"] = timestamp;

	return db.update(updates);
}