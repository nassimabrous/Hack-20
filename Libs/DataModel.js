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
        GET_NOTE_COLLECTIONS: 1,
        NEW_COLLECTION: 2,
        INVITE_TO_COLLECTION: 3,
        KICK_FROM_COLLECTION: 4,
        GET_COLLECTION_INFO: 5,
        REQUEST_JOIN_COLLECTION: 6,
        GET_COLLECTION_OWNER: 7,
        GET_COLLECTION_ANNOTATIONS: 8,
        CREATE_ANNOTATION: 9,
        DESTROY_ANNOTATION: 10,
        DESTROY_COLLECTION: 11,
        NOTE_CURRENT_COLLECTION: 12,
        GET_CURRENT_COLLECTION_ID: 13,
    };

    // All methods in this map should be async.
    var MethodValueToMethodMap =
    {
        // Filled after definitions of methods.
    };

    // Whether we are in the extension-side script.
    var extensionSide = self.CloudHelper ? true : false; // Attempt to auto-detect...
    let currentCollection = undefined;

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
     * @param {String} uid is the unique identifier of the desired
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

        if (!uid)
        {
            uid = await AuthHelper.getUid();
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
        result = btoa(result);

        return result;
    };

    /**
     * Get a list of all collection IDs defined for a given url.
     * @param {String} pageURL The URL to consider -- converted to lowercase
     *      and portions after & including a '#' are stripped.
     */
    DataModel.getPageCollections = async (pageURL) =>
    {
        pageURL = filterURL(pageURL);

        if (!extensionSide)
        {
            return await requestData(Methods.GET_NOTE_COLLECTIONS, pageURL);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let doc = database.collection("pages").doc(pageURL);

        let result = [];

        let groups = await doc.collection("groups").get();

        groups.forEach((doc) =>
        {
            result.push(doc.id);
        });

        return result;
    };
    MethodValueToMethodMap[Methods.GET_NOTE_COLLECTIONS] = DataModel.getPageCollections;

    DataModel.createCollection = async (pageURL, title) =>
    {
        pageURL = filterURL(pageURL);

        if (!extensionSide)
        {
            return await requestData(Methods.NEW_COLLECTION, pageURL, title);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let pagesDoc = database.collection("pages").doc(pageURL);
        let myUid = await AuthHelper.getUid();

        let groupRef = await database.collection("annotationGroups").add
        (
            {
                "owner": myUid,
                "title": title
            }
        );

        let pagesCollection = pagesDoc.collection("groups");



        return await pagesCollection.doc(groupRef.id).set({ true: "true" });
    };
    MethodValueToMethodMap[Methods.NEW_COLLECTION] = DataModel.createCollection;

    DataModel.inviteToCollection = async (otherUid) =>
    {

    };
    MethodValueToMethodMap[Methods.INVITE_TO_COLLECTION] = DataModel.inviteToCollection;

    DataModel.kickFromCollection = async (otherUid) =>
    {

    };
    MethodValueToMethodMap[Methods.KICK_FROM_COLLECTION] = DataModel.KICK_FROM_COLLECTION;

    DataModel.getCollectionInfo = async (collectionId) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.GET_COLLECTION_INFO, collectionId);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let doc = database.collection("annotationGroups").doc(collectionId);
        let resultDoc = await doc.get(); // TODO Make sure this isn't getting ALL of the annotations
        // in the document, too!

        let myUid = await AuthHelper.getUid();

        let result = [];

        if (resultDoc.exists)
        {
            result = resultDoc.data();
            result.title = result.title.Title || result.title; // Simplify.

            if (result.members && result.members[myUid]
                || result.owner == myUid)
            {
                result.haveAccess = true;
            }
        }

        return result;
    };
    MethodValueToMethodMap[Methods.GET_COLLECTION_INFO] = DataModel.getCollectioninfo;

    DataModel.requestJoinCollection = async (collectionId) =>
    {

    };
    MethodValueToMethodMap[Methods.REQUEST_JOIN_COLLECTION] = DataModel.requestJoinCollection;

    DataModel.getCollectionOwner = async (collectionId) =>
    {

    };
    MethodValueToMethodMap[Methods.GET_COLLECTION_OWNER] = DataModel.getCollectionOwner;

    DataModel.getCollectionAnnotations = async (collectionId) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.GET_COLLECTION_ANNOTATIONS, collectionId);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let doc = database.collection("annotationGroups").doc(collectionId);
        let annotations = await doc.collection("annotations").get();

        let result = [];

        let myUid = await AuthHelper.getUid();

        if (annotations.exists)
        {
            let data = annotations.data();

            data.forEach((doc) =>
            {
                console.log(doc.id);

                // Perhaps a check for whether doc.id and myUid match?
                result.push
                (
                    doc // To-do: determine exactly what doc gives us.
                );

                console.log(doc);
            });
        }
        else
        {
            console.log("Annotations doesn't exist yet!");
        }

        console.log("In data model: ")
        console.log(result);
        console.log("--------------");

        return result;
    };
    MethodValueToMethodMap[Methods.GET_COLLECTION_ANNOTATIONS] = DataModel.getCollectionAnnotations;

    DataModel.newAnnotation = async (collectionId, subject, content, 
        anchor, offsetX, offsetY, timestamp) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.CREATE_ANNOTATION, collectionId, subject, content, 
                anchor, offsetX, offsetY, timestamp);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let collectionDoc = database.collection("annotationGroups").doc(collectionId);
        let allAnnotations = collectionDoc.collection("annotations");
        let myUid = await AuthHelper.getUid();

        let myAnnotations = allAnnotations.doc(myUid);
        let nextAnnotationId = await myAnnotations.collection("data").doc("keyCount").get();
        let nextKeyId = 0;

        if (nextAnnotationId.exists)
        {
            nextKeyId = nextAnnotationId.data().data + 1;
        }

        await myAnnotations.collection("data").doc("keyCount").set({ data: nextKeyId });
        await myAnnotations.collection("annotations").doc(nextKeyId + "").set
        (
            {
                subject: subject,
                content: content,
                anchor: anchor,
                offsetX: offsetX,
                offsetY: offsetY,
                timestamp: (new Date()).getTime()
            }
        );

        await collectionDoc.collection("mostRecentAnnotationId").doc("value").set
        (
            {
                val: nextKeyId,
                by: myUid
            }
        );

        return nextKeyId;
    };
    MethodValueToMethodMap[Methods.CREATE_ANNOTATION] = DataModel.newAnnotation;

    DataModel.deleteAnnotation = async (collectionId, annotationId) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.DESTROY_ANNOTATION, collectionId, annotationId);
        }

        let database = await CloudHelper.awaitComponent(CloudHelper.Service.FIRESTORE);
        let collectionDoc = database.collection("annotationGroups").doc(collectionId);
        let allAnnotations = collectionDoc.collection("annotations");
        let myUid = await AuthHelper.getUid();

        let myAnnotations = allAnnotations.doc(myUid);
        await myAnnotations.collection("annotations").doc(annotationId + "").delete();
    };
    MethodValueToMethodMap[Methods.DESTROY_ANNOTATION] = DataModel.deleteAnnotation;

    DataModel.deleteCollection = async (collectionId) =>
    {
        // Danger! According to 
        // https://firebase.google.com/docs/firestore/manage-data/delete-data?authuser=0#collections,
        // we need to do a recursive delete.
    };
    MethodValueToMethodMap[Methods.DESTROY_COLLECTION] = DataModel.deleteCollection;

    DataModel.setCurrentCollection = async (collectionId) =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.NOTE_CURRENT_COLLECTION, collectionId);
        }

        currentCollection = collectionId;
    };
    MethodValueToMethodMap[Methods.NOTE_CURRENT_COLLECTION] = DataModel.setCurrentCollection;

    DataModel.getCurrentCollection = async () =>
    {
        if (!extensionSide)
        {
            return await requestData(Methods.GET_CURRENT_COLLECTION_ID);
        }

        return currentCollection;
    };
    MethodValueToMethodMap[Methods.GET_CURRENT_COLLECTION_ID] = DataModel.getCurrentCollection;

    /**
     * Start listening for requests from the content scripts, if on
     * the "server". Otherwise, TODO.
     */
    DataModel.startServer = async () =>
    {
        // See https://www.originate.com/chrome-extension-firebase-real-time-database/.
        chrome.runtime.onMessage.addListener(async (message, sender, response) =>
        {
            console.log(message);

            if (MethodValueToMethodMap[message.method])
            {
                //try
                //{
                    const result = await MethodValueToMethodMap[message.method].apply(this, message.args);
                
                    response(result);
                //}
               // catch(e)
                //{
                   // response({ error: e, inErrorState: true });
                //}
            }
            else
            {
                response({ error: message.method + " is unknown. Full message: " + message, inErrorState: true });
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
                console.log("RESPONSE:");
                console.log(response);

                if (response && response.inErrorState && response.error)
                {
                    reject(response.error);
                }

                resolve(response);
            });
        });
    };
 })(); // Wrap in a function to avoid private-variable leakage.