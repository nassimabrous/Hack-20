"use strict"; // Stricter JavaScript rules!

DataModel.setMode(false); // We are in a content script.

function main()
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
}

main();

// Helper methods
function displayComment(editable, pageX, pageY)
{
    const commentWindow = SubWindowHelper.create
    (
        {
            title: "Comment",
            withPage: true,
            unsnappable: true,
            minHeight: 100,
            minWidth: 300,
            className: "commentWindow",
            noResize: !editable,
            fixed: !editable,
            x: pageX || window.innerWidth / 2,
            y: pageY || window.innerHeight / 2,
            initialPosIsAbsolute: !editable
        }
    );

    // Delete the comment...
    commentWindow.setOnCloseListener(function()
    {
        // TODO
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
    }
}