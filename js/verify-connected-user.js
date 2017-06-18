var currentUser;
function verifyIfConnected(callback) {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			currentUser = user;
			
			callback(user);
		} else {
			console.log('nelogat');// No user is signed in.
			window.location = '../login.html';
		}
	})
}

function logoutUser() {
	firebase.auth().signOut().then(function() {
  // Sign-out successful.
}).catch(function(error) {
  // An error happened.
});
}

