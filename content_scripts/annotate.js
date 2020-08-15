"use strict"; // Stricter JavaScript rules!

let UserData = undefined; // We'll fill this with the user's data when they sign in...

/*
  Initialize the sign-in user interface! Even so, we will
  probably want to be able to update userdata and sign users
  in and out. I think this needs to be added separately.

  Ref: https://firebase.google.com/docs/auth/web/firebaseui
 */
function initializeSignInUI()
{
    const authUI = new firebaseui.auth.AuthUI(firebase.auth()); // Get the widget...

    authUI.start(".annoteUI",
    {
        signInOptions:
        [
            firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.GoogleAuthProvider.PROVIDER_ID
        ]
    });
}

/*
    Initialize a menu that lets users select from a list of page-related 
    tools (i.e. make a user group & share annotations with them?)
 */
function initializeTools()
{
    // TODO. I think we'll use .annoteUI here...
}

/*
    When a user signs in or out OR when the page loads.
    This is called when the user's signed-in status updates.

    Ref: https://firebase.google.com/docs/auth/web/start
 */
firebase.auth().onAuthStateChanged(function(user)
{
    if (user) // The user is signed in.
    {
        UserData = {};
        UserData.uid = user.uid;
        UserData.email = user.email;
        UserData.displayName = user.displayName;
    }
    else // The user is now signed out!
    {
        UserData = null;

        initializeSignInUI();
    }
});