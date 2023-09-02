//$ ARE MISSING!!!!!
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testBook;
beforeEach(async () => {
const result = await db.query(`INSERT INTO books (
    isbn,
    amazon_url,
    author,
    language,
    pages,
    publisher,
    title,
    year) 
 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
 RETURNING isbn,
           amazon_url,
           author,
           language,
           pages,
           publisher,
           title,
           year`,
[
    "0691161518",
    "http://a.co/eobPtX2",
    "Matthew Lane",
    "english",
    264,
    "Princeton University Press",
    "Power-Up: Unlocking the Hidden Mathematics in Video Games",
    2017
]);

testBook = result.rows[0]
})

afterEach(async () => {
await db.query(`DELETE FROM books`)
})

afterAll(async () => {
await db.end() //Stops connection to db
})

describe('GET /books', () => {
test('Get a list with one book', async () => {
    const res = await request(app).get('/books')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ books: [testBook] })
})
})

describe('GET /books/:isbn', () => {
test('Gets a single book', async () => {
    const res = await request(app).get(`/books/${testBook.isbn}`)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ book: testBook })
})
test('Responds with 404 for invalid id', async () => {
    const res = await request(app).get(`/books/0`)
    expect(res.statusCode).toBe(404);
})
})

describe('POST /books', () => {
test('Creates a single book', async () => {
    const res = await request(app).post('/books').send(
    {
      isbn: "123456789",
      amazon_url: "http://a.co/eobPtX2",
      author: "Arlo Chung",
      language: "english",
      pages: 300,
      publisher: "Princeton University Press",
      title: "Bow wow",
      year: 2017
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
        book: {       
            isbn: "123456789",
            amazon_url: "http://a.co/eobPtX2",
            author: "Arlo Chung",
            language: "english",
            pages: 300,
            publisher: "Princeton University Press",
            title: "Bow wow",
            year: 2017}
    })
})
test('Invalid JSON', async() => {
    const res = await request(app).post('/books').send({       
        isbn: "123456789",
        amazon_url: "http://a.co/eobPtX2",
        author: "Arlo Chung",
        language: "english",
        pages: 'abc',
        publisher: "Princeton University Press",
        year: 2017 
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('instance requires property \"title\"')
})
})

describe('PUT /books/:isbn', () => {
test('Updates a single book', async () => {
    const res = await request(app).put(`/books/${testBook.isbn}`).send({         
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: 300,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    });
    expect(res.statusCode).toBe(200);
    })
test('Invalid JSON', async () => {
    const res = await request(app).put(`/books/0`).send({         
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: "abc",
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017
    });
    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('["instance.pages is not of a type(s) integer"]')
})
})

describe('DELETE /books/:isbn', () => {
test('Deletes a single book', async () => {
    const res = await request(app).delete(`/books/${testBook.isbn}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Book deleted' })
})
})