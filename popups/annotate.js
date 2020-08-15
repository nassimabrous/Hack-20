"use strict";

function main()
{
    let button = document.querySelector("#mainButton");

    button.addEventListener("click", () =>
    {
        chrome.tabs.executeScript({file: "/content_scripts/annotate.js"});

        window.close();
    });

    button.focus();
}

requestAnimationFrame(main); // Defer running main...