"use strict";

// API Keys!
const FIREBASE_CONFIG = 
{
    apiKey: "AIzaSyBfwKKUrHKnfkB70blICCZ3X13qxYLq6-I",
    authDomain: "coannote.firebaseapp.com",
    databaseURL: "https://coannote.firebaseio.com",
    projectId: "coannote",
    storageBucket: "coannote.appspot.com",
    messagingSenderId: "1049937372643",
    appId: "1:1049937372643:web:e8493165df8f768812acd6"
};

function initializeRemoteAccess()
{
    // Initialize Firebase. Note: We need to enable CORS for profile image
    // loading. See https://firebase.google.com/docs/storage/web/download-files
    CloudHelper.initDB(firebase, 
    {
        apiData: FIREBASE_CONFIG,
        resources: [ CloudHelper.Service.FIRESTORE, CloudHelper.Service.FIREBASE_STORAGE ]
    });

    JSHelper.Notifier.notify(JSHelper.GlobalEvents.PAGE_SETUP_COMPLETE);
    AuthHelper.insertAuthCommands(document.querySelector("#authRegion"));
}

requestAnimationFrame(initializeRemoteAccess); // Defer initialization until after complete page load.