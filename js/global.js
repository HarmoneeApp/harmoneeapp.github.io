const db = firebase.database();

const convosDB = db.ref("conversations");
const messagesDB = db.ref("messages");
const postsDB = db.ref("posts");
const usernamesDB = db.ref("usernames");
const usersDB = db.ref("users");