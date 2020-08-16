"use strict";

function main()
{
    let button = document.querySelector("#mainButton");

    button.addEventListener("click", () =>
    {
        chrome.tabs.executeScript({file: "/Libs/firebase/firebase.js"}, function()
        {
            chrome.tabs.executeScript({file: "/Libs/firebase/firebaseInit.js"}, function()
            {
                chrome.tabs.executeScript({file: "/Libs/LibJS/FullLibJS.js"});
                chrome.tabs.executeScript({file: "/content_scripts/authenticate.js"});
                chrome.tabs.executeScript({file: "/content_scripts/annotate.js"});

                window.close();
            });
        });
    });

    button.focus();
}

requestAnimationFrame(main); // Defer running main...