import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

const connection = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Stefan123!",
  database: "mydatabase",
});
/* 
connection.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
  );
`);

// Crea la tabella 'books' se non esiste
connection.query(`
  CREATE TABLE IF NOT EXISTS books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description VARCHAR(255) NOT NULL,
    isbn VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    readings INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`); */

// Middleware per controllare se l'utente esiste
async function checkUserExists(req, res, next) {
  const userId = req.params.userId;

  try {
    const [rows] = await connection.query("SELECT * FROM users WHERE id = ?", [
      userId,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

app.get("/", (req, res) => {
  res.json("hello this is the backend");
});

// Visualizza tutti gli utenti
app.get("/users", async (req, res) => {
  try {
    const query = `
      SELECT users.*, COUNT(books.id) AS totalBooks
      FROM users
      LEFT JOIN books ON users.id = books.user_id
      GROUP BY users.id
    `;

    const [rows] = await connection.query(query);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Aggiungi un utente
app.post("/users", async (req, res) => {
  const { name, lastname, email } = req.body;
  if (!name || !lastname || !email) {
    return res
      .status(400)
      .json({ message: "Name, lastname and email are required" });
  }

  try {
    await connection.query(
      "INSERT INTO users (name, lastname, email) VALUES (?, ?, ?)",
      [name, lastname, email]
    );
    res.status(201).json({ message: "User added successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancella un utente
app.delete("/users/:userId", checkUserExists, async (req, res) => {
  const userId = req.params.userId;

  try {
    // Prima cancello i libri associati all'utente
    await connection.query("DELETE FROM books WHERE user_id = ?", [userId]);

    // Poi cancello l'utente
    await connection.query("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Visualizza un singolo utente con la sua libreria
app.get("/users/:userId", checkUserExists, async (req, res) => {
  const userId = req.params.userId;

  try {
    const [userRows] = await connection.query(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    const [bookRows] = await connection.query(
      "SELECT * FROM books WHERE user_id = ?",
      [userId]
    );
    const user = userRows[0];
    const books = bookRows;
    const totalBooks = bookRows.length;
    res.json({ user, books, totalBooks });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Prende un singolo libro dalla libreria dell'utente
app.get("/users/:userId/books/:bookId", checkUserExists, async (req, res) => {
  const userId = req.params.userId;
  const bookId = req.params.bookId;

  try {
    // Controlla se il libro appartiente all'utente
    const [bookRows] = await connection.query(
      "SELECT * FROM books WHERE id = ? AND user_id = ?",
      [bookId, userId]
    );

    if (bookRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Book not found in user's library" });
    }

    const book = bookRows[0];
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Aggiungi un libro alla libreria dell'utente
app.post("/users/:userId/books", checkUserExists, async (req, res) => {
  const userId = req.params.userId;
  const { title, author, description, isbn, readings, image_url } = req.body;
  const addedDate = new Date();
  if (!title || !author || !description || !isbn || !image_url) {
    return res.status(400).json({
      message: "Title, author, description, image_url and ISBN are required",
    });
  }

  try {
    // Check if the book with the given ISBN already exists in the user's library
    const [existingBooks] = await connection.query(
      "SELECT * FROM books WHERE user_id = ? AND isbn = ?",
      [userId, isbn]
    );

    if (existingBooks.length > 0) {
      // Book with the same ISBN already exists in the user's library
      // You can decide here whether to reject the request or update the existing book's details
      return res
        .status(409)
        .json({ message: "Book already exists in user's library" });
    }

    // If the book with the given ISBN does not exist, insert the new book into the library
    await connection.query(
      "INSERT INTO books (title, author, description, isbn, user_id, readings,image_url, added_date) VALUES (?, ?, ?, ?, ?, ?, ?,?)",
      [title, author, description, isbn, userId, readings, image_url, addedDate]
    );

    res.status(201).json({
      message: "Book added to user library successfully",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Cancella un libro dalla libreria dell'utente
app.delete(
  "/users/:userId/books/:bookId",
  checkUserExists,
  async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    try {
      // Check if the book belongs to the user
      const [bookRows] = await connection.query(
        "SELECT * FROM books WHERE id = ? AND user_id = ?",
        [bookId, userId]
      );

      if (bookRows.length === 0) {
        return res
          .status(404)
          .json({ message: "Book not found in user's library" });
      }

      // If the book belongs to the user, delete it
      await connection.query("DELETE FROM books WHERE id = ?", [bookId]);

      res.json({ message: "Book deleted from user's library successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//Incrementa readings di 1
app.patch(
  "/users/:userId/books/:bookId/increment",
  checkUserExists,
  async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    try {
      // Check if the book belongs to the user
      const [bookRows] = await connection.query(
        "SELECT * FROM books WHERE id = ? AND user_id = ?",
        [bookId, userId]
      );

      if (bookRows.length === 0) {
        return res
          .status(404)
          .json({ message: "Book not found in user's library" });
      }

      // If the book belongs to the user, increment the readings by 1
      await connection.query(
        "UPDATE books SET readings = readings + 1 WHERE id = ?",
        [bookId]
      );

      res.json({ message: "Readings incremented successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//Sottrae  Readings di 1
app.patch(
  "/users/:userId/books/:bookId/decrement",
  checkUserExists,
  async (req, res) => {
    const userId = req.params.userId;
    const bookId = req.params.bookId;

    try {
      // Check if the book belongs to the user
      const [bookRows] = await connection.query(
        "SELECT * FROM books WHERE id = ? AND user_id = ?",
        [bookId, userId]
      );

      if (bookRows.length === 0) {
        return res
          .status(404)
          .json({ message: "Book not found in user's library" });
      }

      // Get the current readings value
      const currentReadings = bookRows[0].readings;

      // Check if readings is already 0
      if (currentReadings === 0) {
        return res.status(400).json({
          message: "Readings cannot be decreased further, it is already 0",
        });
      }

      // If the book belongs to the user and readings is greater than 0, decrement the readings by 1
      await connection.query(
        "UPDATE books SET readings = readings - 1 WHERE id = ?",
        [bookId]
      );

      res.json({ message: "Readings decremented successfully" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
