"use strict"; // Stricter JavaScript rules!

DataModel.setMode(false); // We are in a content script.

function main()
{
    // See SubWindowHelper's source for a complete list of options.
    const controlWindow = SubWindowHelper.create(
    {
        title: "Tools" 
    });
}

main();

// ** Remove this when done debugging!!! **
// Ctrl-I opens a debug terminal in the extension's scope.
requestAnimationFrame(() => EditorHelper.openWindowedEditor());