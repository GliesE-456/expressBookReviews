const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
// Check if username already exists in users array
    let usersWithSameName = users.filter((user) => user.username === username);
    return usersWithSameName.length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Check if username and password match in users array
    let validUser = users.filter(
        (user) => user.username === username && user.password === password
    );
    return validUser.length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(404).json({ message: "Error logging in: Username and password required" });
    }
  
    if (authenticatedUser(username, password)) {
      let accessToken = jwt.sign(
        { data: password }, // Payload (can also include username, roles, etc.)
        "access",           // Secret key must match index.js
        { expiresIn: "1h" }
      );
  
      // Save JWT in session
      req.session.authorization = {
        accessToken,
        username,
      };
  
      return res.status(200).json({ message: "User successfully logged in", token: accessToken });
    } else {
      return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.body.review;
  
    if (books[isbn]) {
      let username = req.session.authorization.username;
      books[isbn].reviews[username] = review; // store review by username
      return res.status(200).json({ message: "Review successfully posted" });
    } else {
      return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
