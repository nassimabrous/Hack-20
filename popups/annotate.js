"use strict";

(async function() {
    const API_URL = ""; // provide the api URL

    await JSHelper.Notifier.waitFor(JSHelper.GlobalEvents.PAGE_SETUP_COMPLETE);
    console.log("!! SETUP COMPLETE !!");

    DataModel.setMode(true);
    DataModel.startServer();

    init();

    let button = document.querySelector("#newCollection");

    button.addEventListener("click", async () => {
        let title = await SubWindowHelper.prompt
        (
            "Title",
            "You're making a new collection! Give it a title!",
            {
                "Title": "text"
            }
        );

        let tab = await getCurrentTab();
        console.log(tab.url + ": " + title.Title);
        await DataModel.createCollection(tab.url, title.Title);

        home();
    });

    function init() {
       // makeRequest() //***can't fetch json object from API for now***
        id("home").addEventListener("click", home);
        id("annotate").addEventListener("click", annotate);
        home(); // Show home initially.
    }

    /**
     * "fetch" books data from bestreads API
     */
    function makeRequest() {
        let url = API_URL + "?mode=books";
        fetch(url)
            .then(checkStatus)
            .then(JSON.parse)
            .then(pageListView)
            .catch(requestError);
    }

    /**
     * create a page list view based on the information of the response from the API
     * If no page collection in the response, it will show an empty page.
     * @param {object} response - JSON object
     */
    function pageListView(response) {
        let view = id("book-list");
        view.classList.remove("hidden");
        for (let i = 0; i < response.books.length; i++) {
            let div = gen("div");
            let img = gen("img");
            let p = gen("p");
            let folder = response.books[i].folder;
            let path = "books/" + folder + "/cover.jpg";
            let title = response.books[i].title;
            img.setAttribute("src", path);
            img.setAttribute("alt", title);
            p.innerText = title;
            div.appendChild(img);
            div.appendChild(p);
            div.classList.add("selectable");
            div.setAttribute("id", folder);
            div.addEventListener("click", getSingleBook);
            view.appendChild(div);
        }
    }

    async function home() {
        id("home").classList.add("active");
        id("annotate").classList.remove("active");

        id("main-view").classList.remove("hidden");
        id("quote-view").classList.add("hidden");
        id("annotation-view").classList.add("hidden");
        id("annotate-view").classList.add("hidden");

        // Show present collections...

        let tab = await getCurrentTab();

        const collectionsView = id("existingCollectionsView");
        collectionsView.innerHTML = "";

        let collections = await DataModel.getPageCollections(tab.url);

        // For each that we got from the server...
        for (const collection of collections) {
            const info = await DataModel.getCollectionInfo(collection);
            console.log(info);

            const newButton = HTMLHelper.addButton(info.title, collectionsView, () => {
                DataModel.setCurrentCollection(collection);

                modifyTabContent();
            });

            if (!info.haveAccess) {
                newButton.classList.add("unauthorized");
            }
        }
    }

    function annotate() {
        id("annotate").classList.add("active");
        id("home").classList.remove("active");

        id("annotate-view").classList.remove("hidden");
        id("main-view").classList.add("hidden");
        id("quote-view").classList.add("hidden");
        id("annotation-view").classList.add("hidden");
    }

    function modifyTabContent() {
        chrome.tabs.executeScript(null, {file: "/Libs/LibJS/FullLibJS.js"}, () => {
            chrome.tabs.executeScript(null, {file: "/Libs/DataModel.js"}, () => {
                chrome.tabs.insertCSS(null, {file: "/content_scripts/annotationStyles.css"});
                chrome.tabs.executeScript(null, {file: "/content_scripts/annotate.js"});

                window.close();
            });
        });
    }

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

// Returns a promise that will result in the url of the
//current tab.
    function getCurrentTab() {
        return new Promise((resolve) => {
            chrome.tabs.query({active: true}, async (tabs) => {
                resolve(tabs[0]);
            });
        });
    }
})();

//requestAnimationFrame(main); // Defer running main...

