/* Navigation */
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

function showView(evt, viewName) {
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

function autogrow(element) {
	document.getElementsByClassName("newpost-view")[0].style.height = "100px";
	element.style.height = "37.5px";
	element.style.height = (element.scrollHeight) + "px";
	if (element.style.height >= "100px") {
		document.getElementsByClassName("newpost-view")[0].style.height = (element.scrollHeight + 60) + "px";
	}
}