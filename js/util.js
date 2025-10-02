// Go Back
function goBack() {
	window.location.replace("welcome.html");
}
if (document.getElementById('goBack')) {
	document.getElementById('goBack').addEventListener('click', goBack);
}

// Trim
function trim(string) {
	return string.replace(/^\s+|\s+$/, "");
}

// Navigation Stuff
function showTab(evt, tabName) {
	var i, tabContent, tabLinks;

	tabContent = document.getElementsByClassName("tab-content");
	for (i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
	}

	tabLinks = document.getElementsByClassName("tab-link");
	for (i = 0; i < tabLinks.length; i++) {
		tabLinks[i].className = tabLinks[i].className.replace(" active", "");
	}

	document.getElementById(tabName).style.display = "block";
	evt.currentTarget.className += " active";
}

document.getElementById("default").click();

function showView(viewName) {
	var i, tabContent, tabLinks;

	tabContent = document.getElementsByClassName("tab-content");
	for (i = 0; i < tabContent.length; i++) {
		tabContent[i].style.display = "none";
	}

	tabLinks = document.getElementsByClassName("tab-link");
	for (i = 0; i < tabLinks.length; i++) {
		tabLinks[i].className = tabLinks[i].className.replace(" active", "");
	}

	document.getElementById(viewName).style.display = "block";
}

// Change Size Based on Contents
function autogrow(element) {
	document.getElementsByClassName("newpost-view")[0].style.height = "100px";
	element.style.height = "37.5px";
	element.style.height = (element.scrollHeight) + "px";
	if (element.style.height >= "100px") {
		document.getElementsByClassName("newpost-view")[0].style.height = (element.scrollHeight + 60) + "px";
	}
}

// Development Mode - Check Beta Status
function checkBetaStatus() {
	var betaStatus = true;

	if (betaStatus) {
		Swal.fire({
			title: "",
			text: "Harmonee is currently in beta stages, and only existing users have access.\n\nCheck back soon!",
			icon: "error",
			iconColor: "#ef4444",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		}).then((value) => {
			window.location.replace("welcome.html");
		});
	}
}

// Password Fields
function setPasswordField(field, getPassword, setPassword) {
	let selectionStart = 0;
	let selectionEnd = 0;

	field.addEventListener('beforeinput', () => {
		selectionStart = field.selectionStart;
		selectionEnd = field.selectionEnd;
	});

	field.addEventListener('input', function(event) {
		const inputType = event.inputType;
		const enteredData = event.data;
		let actualPassword = getPassword();

		if (inputType === 'insertText' && enteredData) {
			actualPassword = actualPassword.slice(0, selectionStart) + enteredData + actualPassword.slice(selectionEnd);
		} else if (inputType === 'insertFromPaste') {
			const pasteData = enteredData || '';
			actualPassword = actualPassword.slice(0, selectionStart) + pasteData + actualPassword.slice(selectionEnd);
		} else if (inputType === 'deleteContentBackward' || inputType === 'deleteContentForward' || inputType === 'deleteByCut') {
			if (selectionStart !== selectionEnd) {
				actualPassword = actualPassword.slice(0, selectionStart) + actualPassword.slice(selectionEnd);
			} else if (inputType === 'deleteContentBackward') {
				actualPassword = actualPassword.slice(0, selectionStart - 1) + actualPassword.slice(selectionEnd);
			} else if (inputType === 'deleteContentForward') {
				actualPassword = actualPassword.slice(0, selectionStart) + actualPassword.slice(selectionEnd + 1);
			}
		}

		setPassword(actualPassword);
		field.value = '•'.repeat(actualPassword.length);
	});
}

// Get Profile Picture URL
function getProfilePictureURL(userID) {
    var http = new XMLHttpRequest();
	var imageURL = "https://ivneclagzgocuvufxubf.supabase.co/storage/v1/object/public/avatars/" + userID + ".png";

    http.open('HEAD', imageURL, false);
    http.send();

	if (http.status == 404) {
		return "https://harmoneeapp.github.io/img/avatar.png";
	} else {
		return "https://ivneclagzgocuvufxubf.supabase.co/storage/v1/object/public/avatars/" + userID + ".png";
	}
}

// Get Time Since Post
function timeSincePost(postDate) {
	var dateString = new Date().toISOString();
	var currentDate = new Date(dateString);
	var datePosted = new Date(postDate);

	var seconds = Math.round((currentDate.getTime() - datePosted.getTime()) / 1000);
	var timeSince;

	if (seconds < 60) {
		timeSince = "Just Now";
	} else if (seconds < 3600) {
		timeSince = Math.round(seconds / 60) + "m ago";
	} else if (seconds < 86400) {
		timeSince = Math.round(seconds / 3600) + "h ago";
	} else {
		timeSince = Math.round(seconds / 86400) + "d ago";
	}

	return timeSince;
}