"use strict";

var importAttempts = 0; // Wait for LibJS to load...

function main()
{
    if (importAttempts > 100)
    {
        alert("Unable to import LibJS!");

        return;
    }

    if (!self.SubWindowHelper)
    {
        importAttempts ++;
        main();
    }

    SubWindowHelper.alert("Test!", "Description");
    JSHelper.Notifier.notify(JSHelper.GlobalEvents.PAGE_SETUP_COMPLETE);
}

main();