"use strict";

function main()
{
    DataModel.startServer();

    let button = document.querySelector("#mainButton");

    button.addEventListener("click", () =>
    {
        modifyTabContent();
    });

    function init() {
        //makerequest() ? fetch json object from API?
        id("home").addEventListener("click", home);
        id("annotate").addEventListener("click", annotate);
        home(); // Show home initially.
    }

    function home() {
        id("home").classList.add("active");
        id("annotate").classList.remove("active");
        
        id("main-view").classList.remove("hidden");
        id("quote-view").classList.add("hidden");
        id("annotation-view").classList.add("hidden");
        id("annotate-view").classList.add("hidden");

        // Show present collections...
        chrome.tabs.query({ active: true }, async (tabs) =>
        {
            let tab = tabs[0];

            SubWindowHelper.alert("", tab.url);

            const collectionsView = id("existingCollectionsView");
            let collections = await DataModel.getPageCollections(tab.url);
    
            for (const collection of collections)
            {
                HTMLHelper.addButton(collection, collectionsView, () =>
                {
                    DataModel.setCurrentCollection(collection);
                    
                    modifyTabContent();
                });
            }
        });
    }

    function annotate() {
        id("annotate").classList.add("active");
        id("home").classList.remove("active");

        id("annotate-view").classList.remove("hidden");
        id("main-view").classList.add("hidden");
        id("quote-view").classList.add("hidden");
        id("annotation-view").classList.add("hidden");
    }

    function modifyTabContent()
    {
        chrome.tabs.executeScript(null, {file: "/Libs/LibJS/FullLibJS.js"}, () =>
        {
            chrome.tabs.executeScript(null, {file: "/Libs/DataModel.js"}, () =>
            {
                chrome.tabs.insertCSS(null, {file: "/content_scripts/anotationStyles.css"});
                chrome.tabs.executeScript(null, {file: "/content_scripts/annotate.js"});
                window.close(); // We can close the pop-up window...
            });
        });
    }

    init();

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