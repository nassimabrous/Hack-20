"use strict"; // Stricter JavaScript rules!

// Ref: https://javascript.info/selection-range
document.documentElement.addEventListener("selectstart", () =>
{

});

document.documentElement.addEventListener("selectchange", () =>
{
    const { anchorNode, anchorOffset, focusedNode, focusOffset } = document.getSelection();

    // No selection?
    if (!anchorNode || !focusedNode)
    {
        return;
    }

    anchorNode.innerHTML = anchorNode.innerHTML.substring(0, anchorOffset) + "<b>" 
                    + anchorNode.innerHTML.substring(anchorOffset)  + "</b>";
});