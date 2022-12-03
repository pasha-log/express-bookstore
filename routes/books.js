const express = require('express');
const router = new express.Router();
const { validate } = require('jsonschema');
const bookSchemaNew = require('../schemas/bookSchemaNew.json');
const bookSchemaUpdate = require('../schemas/bookSchemaUpdate.json');
const Book = require('../models/book');

/** GET / => {books: [book, ...]}  */

router.get('/', async function(req, res, next) {
	try {
		const books = await Book.findAll(req.query);
		return res.json({ books });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  => {book: book} */

router.get('/:isbn', async function(req, res, next) {
	try {
		const book = await Book.findOne(req.params.isbn);
		return res.json({ book });
	} catch (err) {
		return next(err);
	}
});

/** POST /   bookData => {book: newBook}  */

router.post('/', async function(req, res, next) {
	try {
		// Validate req.body against our book schema:
		const result = validate(req.body, bookSchemaNew);

		// If it's not valid...
		if (!result.valid) {
			return next({
        status: 400,
        error: result.errors.map(e => e.stack)
      });
		}
		const book = await Book.create(req.body);
		return res.status(201).json({ book });
	} catch (e) {
		return next(e);
	}

	// What we had before validation:
	// try {
	//   const book = await Book.create(req.body);
	//   return res.status(201).json({ book });
	// } catch (err) {
	//   return next(err);
	// }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put('/:isbn', async function(req, res, next) {
	try {
		if ('isbn' in req.body) {
			return next({
				status: 400,
				message: 'Not allowed'
			});
		}
		// Validate req.body against our book schema:
		const result = validate(req.body, bookSchemaUpdate);

		// If it's not valid...
		if (!result.valid) {
			return next({
        status: 400,
        error: result.errors.map(e => e.stack)
      });
		}
		const book = await Book.update(req.params.isbn, req.body);
		return res.json({ book });
	} catch (e) {
		return next(e);
	}

	// What we had before validation:
	// try {
	//   const book = await Book.update(req.params.isbn, req.body);
	//   return res.json({ book });
	// } catch (err) {
	//   return next(err);
	// }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete('/:isbn', async function(req, res, next) {
	try {
		await Book.remove(req.params.isbn);
		return res.json({ message: 'Book deleted' });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
