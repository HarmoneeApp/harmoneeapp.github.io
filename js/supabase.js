import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabaseUrl = 'https://ivneclagzgocuvufxubf.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bmVjbGFnemdvY3V2dWZ4dWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDY0MTksImV4cCI6MjA3MzE4MjQxOX0.gqMhkDpVq0bSLx5y7jUrBXWbA1Zb662s2spolbeByao";
const supabase = createClient(supabaseUrl, supabaseKey);

// Upload + Change Profile Picture
async function uploadAvatar(event) {
	const user = firebase.auth().currentUser;
	const file = event.target.files[0];

	if (!file) {
	  console.error('No file selected');
	  return;
	}
	
	const { data, error } = await supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");

	if (error) {
		const { data1, error1 } = await supabase.storage.from('avatars').upload(user.uid + '.png', file, {
			cacheControl: '3600',
			upsert: true,
			contentType: file.type
		});

		Swal.fire({
			title: "Your profile picture was successfully updated.",
			icon: "success",
			iconColor: "#10b981",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				updateProfilePicture();
			}, 200);
		}).catch(function(error) {
			Swal.fire({
				title: "Something went wrong. Please try again.",
				icon: "error",
				iconColor: "#ef4444",
				background: "#3c4469",
				color: "#e4e4e4",
				confirmButtonColor: "#6c759b",
				confirmButtonText: "Okay"
			});
		});
	} else {
		const { data1, error1 } = await supabase.storage.from('avatars').update(user.uid + '.png', file, {
			cacheControl: '3600',
			upsert: true,
			contentType: file.type
		});

		Swal.fire({
			title: "Your profile picture was successfully updated.",
			icon: "success",
			iconColor: "#10b981",
			background: "#3c4469",
			color: "#e4e4e4",
			confirmButtonColor: "#6c759b",
			confirmButtonText: "Okay"
		}).then((value) => {
			setTimeout(function() {
				updateProfilePicture();
			}, 200);
		}).catch(function(error) {
			Swal.fire({
				title: "Something went wrong. Please try again.",
				icon: "error",
				iconColor: "#ef4444",
				background: "#3c4469",
				color: "#e4e4e4",
				confirmButtonColor: "#6c759b",
				confirmButtonText: "Okay"
			});
		});
	}
}
if (document.getElementById('edit-avatar')) {
	document.getElementById('edit-avatar').addEventListener('change', uploadAvatar);
}

/* Update Profile Picture */
function updateProfilePicture() {
	var avatarView = document.getElementById("avatar-icon");
	var profileImage = document.getElementsByClassName("profile-image")[0];

	avatarView.src = supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");
	profileImage.src = supabase.storage.from("avatars").getPublicUrl(user.uid + ".png");
}