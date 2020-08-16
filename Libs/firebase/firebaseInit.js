
// API Keys!
var firebaseConfig = 
{
    apiKey: "AIzaSyBfwKKUrHKnfkB70blICCZ3X13qxYLq6-I",
    authDomain: "coannote.firebaseapp.com",
    databaseURL: "https://coannote.firebaseio.com",
    projectId: "coannote",
    storageBucket: "coannote.appspot.com",
    messagingSenderId: "1049937372643",
    appId: "1:1049937372643:web:e8493165df8f768812acd6"
};

var activateAttemptCount = 0;

function activateFirebase()
{
    if (!window.firebase && activateAttemptCount < 1000)
    {
        activateAttemptCount ++;
        requestAnimationFrame(activateFirebase);

        return;
    }
    else if (!window.firebase)
    {
        throw "Unable to load firebase.";
    }

    // Initialize Firebase
    firebase.initializeApp(firebaseConfig);

    window.database = firebase.database();
}

activateFirebase();