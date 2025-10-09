const db = firebase.database().ref();

const convosDB = db.child("conversations");
const messagesDB = db.child("messages");
const postsDB = db.child("posts");
const usernamesDB = db.child("usernames");
const usersDB = db.child("users");