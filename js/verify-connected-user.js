var currentUser;
function verifyIfConnected(callback) {
	firebase.auth().onAuthStateChanged(function(user) {
		if (user) {
			currentUser = user;
			callback(user);
		} else {
			console.log('nelogat')// No user is signed in.
		}
	})
}

