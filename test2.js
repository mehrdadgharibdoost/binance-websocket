const Book = require("./modules/Book");

var printError = function (error, explicit) {
    console.log(`[${explicit ? 'EXPLICIT' : 'INEXPLICIT'}] ${error.name}: ${error.message}`);
}

try {
    // New keyword to access constructor
    var bookConstructed = new Book('The Stand', 'Stephen King')
    console.log(bookConstructed)
} catch (e) {
    if (e instanceof TypeError) {
        printError(e, true);
    } else {
        printError(e, false);
    }
}