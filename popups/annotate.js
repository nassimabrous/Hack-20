"use strict";

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

function main()
{
    let button = document.querySelector("#mainButton");

    button.addEventListener("click", () =>
    {
        chrome.tabs.executeScript(null, {file: "/Libs/firebase/firebaseInit.js"}, function()
        {
            chrome.tabs.executeScript(null, {file: "/Libs/LibJS/FullLibJS.js"});
            chrome.tabs.executeScript(null, {file: "/content_scripts/authenticate.js"});
            chrome.tabs.executeScript(null, {file: "/content_scripts/annotate.js"});

            window.close();
        });
    });

    button.focus();

    JSHelper.Notifier.notify(JSHelper.GlobalEvents.PAGE_SETUP_COMPLETE);
    AuthHelper.insertAuthCommands(document.body);
}

requestAnimationFrame(main); // Defer running main...