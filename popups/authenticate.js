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
    chrome.runtime.getBackgroundPage((backgroundWindow) =>
    {
        window.firebase = backgroundWindow.firebase;
        window.CloudHelper = backgroundWindow.CloudHelper;
        window.DataModel = backgroundWindow.DataModel;

        if (!backgroundWindow.loadedTools)
        {
            backgroundWindow.loadedTools = true;

            // Initialize Firebase. Note: We need to enable CORS for profile image
            // loading. See https://firebase.google.com/docs/storage/web/download-files
            CloudHelper.initDB(firebase, 
            {
                apiData: FIREBASE_CONFIG,
                resources: [ CloudHelper.Service.FIRESTORE, CloudHelper.Service.FIREBASE_STORAGE ]
            });
        }
    
        AuthHelper.insertAuthCommands(document.querySelector("#authRegion"));
        JSHelper.Notifier.notify(JSHelper.GlobalEvents.PAGE_SETUP_COMPLETE);
    });
}

requestAnimationFrame(initializeRemoteAccess); // Defer initialization until after complete page load.