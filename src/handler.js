const { nanoid } = require('nanoid');
// Import
const books = require('./books');
// Kriteria 1 : API dapat menyimpan buku
const addBookHandler = (request, h) => {
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  // Client tidak melampirkan properti name pada request body
  if (name === '' || !name) {
    const err = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    err.code(400);
    return err;
  }
  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const err = h.response({
      status: 'fail',
      message:
                'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    err.code(400);
    return err;
  }
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };
  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  // Bila buku berhasil dimasukkan
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  // Server gagal memasukkan buku karena alasan umum (generic error).
  const err = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  err.code(500);
  return err;
};
// Kriteria 2 : API dapat menampilkan seluruh buku
const getAllBooksHandler = (request, h) => {
  const {
    name: queryName,
    reading: queryReading,
    finished: queryFinished,
  } = request.query;
  // Query Name
  if (queryName) {
    const allBooks = books
      .filter((book) => book.name.toLowerCase().includes(queryName.toLowerCase()))
      .map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      }));
      // Jika ada query name
    const response = h.response({
      status: 'success',
      data: {
        books: allBooks,
      },
    });
    response.code(200);
    return response;
  }
  // Query Reading
  if (queryReading) {
    let allBooks;

    if (queryReading === '0') {
      allBooks = books
        .filter((book) => book.reading === false)
        .map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        }));
    } else {
      allBooks = books
        .filter((book) => book.reading === true)
        .map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        }));
    }
    // Jika ada query reading
    const response = h.response({
      status: 'success',
      data: {
        books: allBooks,
      },
    });
    response.code(200);
    return response;
  }
  // Query Finished
  if (queryFinished) {
    let allBooks;

    if (queryFinished === '1') {
      allBooks = books
        .filter((book) => book.finished === true)
        .map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        }));
    } else {
      allBooks = books
        .filter((book) => book.finished === false)
        .map((book) => ({
          id: book.id,
          name: book.name,
          publisher: book.publisher,
        }));
    }
    // Jika ada query Finished
    const response = h.response({
      status: 'success',
      data: {
        books: allBooks,
      },
    });
    response.code(200);
    return response;
  }

  const allBooks = books.map((book) => ({
    id: book.id,
    name: book.name,
    publisher: book.publisher,
  }));

  const response = {
    status: 'success',
    data: {
      books: allBooks,
    },
  };

  return response;
};
// Kriteria 3 : API dapat menampilkan detail buku
const getBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const book = books.filter((n) => n.id === bookId)[0];
  // Bila buku dengan id yang dilampirkan ditemukan
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }
  // Bila buku dengan id yang dilampirkan oleh client tidak ditemukan
  const err = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  err.code(404);
  return err;
};
// Kriteria 4 : API dapat mengubah data buku
const editBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;
  // Client tidak melampirkan properti name pada request body
  if (name === '' || !name) {
    const err = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    err.code(400);
    return err;
  }
  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount
  if (readPage > pageCount) {
    const err = h.response({
      status: 'fail',
      message:
                'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    err.code(400);
    return err;
  }

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === bookId);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };
    // Buku berhasil diperbarui
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });

    response.code(200);
    return response;
  }
  // Id yang dilampirkan oleh client tidak ditemukan oleh server
  const err = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  err.code(404);
  return err;
};
// Kriteria 5 : API dapat menghapus buku
const deleteBookByIdHandler = (request, h) => {
  const { bookId } = request.params;

  const index = books.findIndex((book) => book.id === bookId);
  // Bila id dimiliki oleh salah satu buku
  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }
  // Bila id yang dilampirkan tidak dimiliki oleh buku manapun
  const err = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  err.code(404);
  return err;
};
// Export
module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
