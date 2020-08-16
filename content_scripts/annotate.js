"use strict"; // Stricter JavaScript rules!

const REFRESH_DELAY = 500;
DataModel.setMode(false); // We are in a content script.

async function main()
{
    // See SubWindowHelper's source for a complete list of options.
    const controlWindow = SubWindowHelper.create(
    {
        title: "Tools",
        unsnappable: true,
        noCloseButton: true
    });

    const annotationMenu = document.createElement("div");
    const toolsMenu = document.createElement("div");
    const preferencesMenu = document.createElement("div");

    HTMLHelper.addTabGroup
    (
        {
            "Annotation!": annotationMenu,
            "Tools": toolsMenu,
            "Preferences": preferencesMenu
        },
        controlWindow,
        "Annotation!"
    );

    HTMLHelper.addButtons
    (
        {
            "Create a Comment": () =>
            {
                displayComment(true);
            }
        },
        annotationMenu
    );

    // Display other users' comments:
    setTimeout(async () =>
    {
        var currentCollectionId = await DataModel.getCurrentCollection();
        var annotations = await DataModel.getCollectionAnnotations(currentCollectionId);
        console.log(currentCollectionId);

        for (const annotation of annotations)
        {
            displayComment(false, annotation.offsetX, annotation.offsetY, annotation.id, annotation.text);
        }
    }, REFRESH_DELAY);
}

main();

// Helper methods
function displayComment(editable, pageX, pageY, annotationId, annotationText)
{
    const commentWindow = SubWindowHelper.create
    (
        {
            title: "Comment",
            withPage: true,
            unsnappable: true,
            minHeight: 100,
            minWidth: 200,
            className: "commentWindow",
            noResize: !editable,
            fixed: !editable,
            x: pageX || window.innerWidth / 2,
            y: pageY || window.innerHeight / 2,
            initialPosIsAbsolute: !editable
        }
    );

    // Delete the comment... if it's editable.
    commentWindow.setOnCloseListener(function()
    {
        if (editable && annotationId)
        {
            (async () =>
            {
                var currentCollectionId = await DataModel.getCurrentCollection();
                await DataModel.deleteAnnotation(currentCollectionId, annotationId);
            })();
        }
    });

    commentWindow.enableFlex("column");

    if (editable)
    {
        const textarea = document.createElement("textarea");
        textarea.style.flexGrow = 1;

        commentWindow.appendChild(textarea);

        const saveButton = document.createElement("button");
        
        saveButton.textContent = "Save";
        saveButton.style.marginTop = "-3px";

        commentWindow.appendChild(saveButton);

        saveButton.addEventListener("click", async () =>
        {
            let position = commentWindow.getXY();

            var currentCollectionId = await DataModel.getCurrentCollection();
            await DataModel.newAnnotation(currentCollectionId, "Subject",
                textarea.value, "document.body", position.x, position.y, (new Date()).getTime());
        });
    }
    else
    {
        let content = document.createElement("div");
        content.textContent = annotationText;
        commentWindow.appendChild(content);
    }
}