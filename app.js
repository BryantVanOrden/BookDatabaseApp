// app.js

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Set EJS as templating engine
app.set('view engine', 'ejs');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Right1234', // Replace with your MySQL password
  database: 'GoodReads'     // Replace with your database name
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database.');
});

// Routes

// Home route
app.get('/', (req, res) => {
  res.render('index');
});

// View data route
app.get('/view', (req, res) => {
  const tables = ['book', 'person', 'genre', 'publisher', 'language'];
  res.render('view_data', { tables });
});

// Fetch data for a specific table
app.get('/view/:table', (req, res) => {
  const table = req.params.table;
  const query = `SELECT * FROM ??`;
  db.query(query, [table], (err, results) => {
    if (err) throw err;
    res.render('view_table', { table, data: results });
  });
});

app.get('/testcases', (req, res) => {
  const query = 'SELECT * FROM test_cases';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.render('view_test_cases', { testCases: results });
  });
});
// Route to show user registration form (Create)
app.get('/user/register', (req, res) => {
  res.render('create_user');
});

// Route to handle user registration submission
app.post('/user/create', (req, res) => {
  const { username, email, password } = req.body;
  const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
  db.query(query, [username, email, password], (err) => {
    if (err) throw err;
    res.redirect('/user/profile/' + username);
  });
});

// Route to display a user profile (Read)
app.get('/user/profile/:username', (req, res) => {
  const username = req.params.username;
  const query = 'SELECT * FROM user WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.render('read_user_profile', { user: results[0] });
    } else {
      res.send('User not found');
    }
  });
});

app.get('/user/register', (req, res) => {
  res.render('create_user');
});

app.get('/user/profile', (req, res) => {
  // Pass a mock user or empty
  res.render('read_user_profile', { user: { username: 'JohnDoe', email: 'john@example.com' } });
});

app.get('/user/edit', (req, res) => {
  res.render('update_user_profile', { user: { email: 'john@example.com' } });
});

app.get('/user/delete', (req, res) => {
  res.render('delete_user');
});

// BOOK ROUTES
app.get('/book/create', (req, res) => {
  res.render('create_book');
});

app.get('/book/details', (req, res) => {
  res.render('read_book_details', { book: { title: '1984', isbn: '9780451524935' } });
});

app.get('/book/edit', (req, res) => {
  res.render('update_book', { book: { title: '1984' } });
});

app.get('/book/delete', (req, res) => {
  res.render('delete_book');
});

// REVIEW ROUTES
app.get('/review/create', (req, res) => {
  res.render('create_review');
});

app.get('/review/display', (req, res) => {
  res.render('read_review', { review: { rating: 5, review_text: 'A classic!' } });
});

app.get('/review/edit', (req, res) => {
  res.render('update_review', { review: { rating: 4, review_text: 'Very thought-provoking' } });
});

app.get('/review/delete', (req, res) => {
  res.render('delete_review');
});

// PUBLISHER ROUTES
app.get('/publisher/create', (req, res) => {
  res.render('create_publisher');
});

app.get('/publisher/listing', (req, res) => {
  res.render('read_publisher', { publisher: { publisher_name: 'Penguin Random House' } });
});

app.get('/publisher/edit', (req, res) => {
  res.render('update_publisher', { publisher: { publisher_name: 'Penguin Random House' } });
});

app.get('/publisher/delete', (req, res) => {
  res.render('delete_publisher');
});

// Route to show update profile form (Update)
app.get('/user/edit/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM user WHERE user_id = ?', [userId], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.render('update_user_profile', { user: results[0] });
    } else {
      res.send('User not found');
    }
  });
});

// Handle update profile submission
app.post('/user/update/:id', (req, res) => {
  const userId = req.params.id;
  const { email, user_profile_pic_link } = req.body;
  const query = 'UPDATE user SET email=?, user_profile_pic_link=? WHERE user_id=?';
  db.query(query, [email, user_profile_pic_link, userId], (err) => {
    if (err) throw err;
    res.redirect('/user/profile/' + userId);
  });
});

// Route to show delete confirmation form (Delete)
app.get('/user/delete/:id', (req, res) => {
  const userId = req.params.id;
  db.query('SELECT * FROM user WHERE user_id = ?', [userId], (err, results) => {
    if (err) throw err;
    if (results.length > 0) {
      res.render('delete_user', { user: results[0] });
    } else {
      res.send('User not found');
    }
  });
});

// Handle user deletion
app.post('/user/delete/:id', (req, res) => {
  const userId = req.params.id;
  db.query('DELETE FROM user WHERE user_id = ?', [userId], (err) => {
    if (err) throw err;
    res.redirect('/');
  });
});

// Add data route
app.get('/add', (req, res) => {
  const tables = ['book', 'person', 'genre', 'publisher', 'language'];
  res.render('add_data', { tables });
});

// Form to add data to a specific table
app.get('/add/:table', (req, res) => {
  const table = req.params.table;
  // Fetch table columns
  const query = `SHOW COLUMNS FROM ??`;
  db.query(query, [table], (err, results) => {
    if (err) throw err;
    res.render('add_form', { table, columns: results });
  });
});

// Handle form submission to add data
app.post('/add/:table', (req, res) => {
  const table = req.params.table;
  const data = req.body;
  const query = `INSERT INTO ?? SET ?`;
  db.query(query, [table, data], (err, result) => {
    if (err) throw err;
    res.redirect('/view/' + table);
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
