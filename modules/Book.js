class Book {
    // Special constructor method
    constructor(title, author) {
        // Set properties
        this.title = title;
        this.author = author;
        // Output creation message
        console.log(`'Created Book via class: ${title} by ${author}'`)
    }
}

module.exports = Book;