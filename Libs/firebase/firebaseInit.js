
if (!window.firebase)
{
    let newScript;
}

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
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

var database = firebase.database(); 