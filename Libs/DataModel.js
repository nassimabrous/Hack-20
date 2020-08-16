"use strict";

/**
 *  A file intended to act as an intermediary between 
 * code that displays comments, etc. and the locally-stored
 * or server-stored data.
 * 
 *  This object is a singleton -- it need be instantiated only
 * once (because there is only one Firebase resource for it to
 * access). As such, it is represented by a dictionary.
 * 
 * @depends upon JSHelper and CloudHelper when run in a popup/
 * page directly managed by the extension.
 */

 var DataModel = {};

 // Encapsulate private variables.
 (function()
 {
    // Forward-declare private methods.
    let requestData;

    // The server limits the size of different
    //fields! These constants reflect this.
    DataModel.Constants = 
    {
        MAX_DISPLAYNAME_LENGTH: 20,
        MAX_POST_SUBJECT_LENGTH: 120,
        MAX_POST_CONTENT_LENGTH: 81920,
        MAX_ANCHOR_INFO_LENGTH: 100,
        MAX_GROUP_TITLE_LENGTH: 20
    };

    // Methods we can call from the client.
    const Methods =
    {
        GET_USER_DATA_FROM_UID: 0,
        GET_NOTE_COLLECTIONS: 1
    };

    // All methods in this map should be async.
    var MethodValueToMethodMap =
    {

    };

    // Whether we are in the extension-side script.
    var extensionSide = self.CloudHelper ? true : false;

    /**
     * 
     * @param {Boolean} isServerSide gives whether
     *     the extension is acting like a "server" --
     *     whether it is communicating directly with Firebase,
     *     or communicating through the chrome.runtime interface.
     */
    DataModel.setMode = (isServerSide) =>
    {
        extensionSide = isServerSide;
    };

    /**
     * Get publicly-available user data.
     * 
     * @param {string} uid is the unique identifier of the desired
     *  user.
     * @returns (Via a promise) an empty dictionary if no such 
     *  user exists, otherwise, a dictionary with the following
     *  fields:
     * {
     *  displayName: "some_display_name",
     *  uid: "the user's unique identifier",
     *  profileURL: "either empty or a valid photo URL",
     *  photoURL: "Like profileURL, but guaranteed to never
     *          be empty (except when the user doesn't exist!)"
     * }
     */
    DataModel.getUserDataFromUid = async (uid) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.GET_USER_DATA_FROM_UID, uid);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let doc = database.collection("userData").doc(uid);
        let docData = await doc.get();
        let result = {};

        if (docData.exists)
        {
            result = docData.data();
            result.photoURL = AuthHelper.getProfilePhotoSrc(uid);
        }

        return result;
    };
    MethodValueToMethodMap[Methods.GET_USER_DATA_FROM_UID] = DataModel.getUserDataFromUid;

    /**
     * Return a filtered version of the given URL
     * such that URLs for the same page are more likely
     * to be associated with the same collection.
     * 
     * @param {string} url to be filtered.
     */
    var filterURL = (url) =>
    {
        let result = url;

        // Remove trailing #...s from the url under consideration.
        if (url.indexOf("#") !== -1 && url.indexOf("/") < url.indexOf("#"))
        {
            result = url.substring(0, url.indexOf("#"));
        }

        result = result.toLowerCase();

        return result;
    };

    DataModel.getPageCollections = async (pageURL) =>
    {
        pageURL = filterURL(pageURL);

        if (!extensionSide)
        {
            return await requestData(Methods.GET_NOTE_COLLECTIONS, pageURL);
        }

        
    };
    MethodValueToMethodMap[Methods.GET_NOTE_COLLECTIONS] = DataModel.getPageCollections;

    /**
     * Start listening for requests from the content scripts, if on
     * the "server". Otherwise, TODO.
     */
    DataModel.startServer = async () =>
    {
        // See https://www.originate.com/chrome-extension-firebase-real-time-database/.
        chrome.runtime.onMessage.addListener(async (message, sender, response) =>
        {
            if (MethodValueToMethodMap[message.method])
            {
                const result = await MethodValueToMethodMap[message.method].apply(DataModel, message.args);
                
                response(result);
            }
        });
    };

    requestData = (method, ...args) =>
    {
        return new Promise((resolve, reject) =>
        {
            chrome.runtime.sendMessage(
                { method: method, args: args }, 
            (response) =>
            {
                resolve(response);
            });
        });
    };
 })(); // Wrap in a function to avoid private-variable leakage.