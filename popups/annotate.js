"use strict";

function main()
{
    let button = document.querySelector("#mainButton");

    button.addEventListener("click", () =>
    {
        chrome.tabs.executeScript(null, {file: "/content_scripts/annotate.js"});
        window.close();
    });

    function init() {
        //makerequest() ? fetch json object from API?
        id()
    }

    button.focus();
}

requestAnimationFrame(main); // Defer running main...

/* ------------------------------ Helper Functions  ------------------------------ */

/**
 * Returns the element that has the ID attribute with the specified value.
 * @param {string} idName - element ID
 * @returns {object} DOM object associated with id.
 */
function id(idName) {
    return document.getElementById(idName);
}

/**
 * Returns the first element that matches the given CSS selector.
 * @param {string} query - CSS query selector.
 * @returns {object} The first DOM object matching the query.
 */
function qs(query) {
    return document.querySelector(query);
}

/**
 * Returns the array of elements that match the given CSS selector.
 * @param {string} query - CSS query selector
 * @returns {object[]} array of DOM objects matching the query.
 */
function qsa(query) {
    return document.querySelectorAll(query);
}