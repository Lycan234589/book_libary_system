const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");

const url =
  "mongodb+srv://tannushree:admin_tannushree@cluster0.tq26bem.mongodb.net/bookslibaryDB";
mongoose
  .connect(url)
  .then(() => {
    console.log("connected to db");
    app.listen(3000, () => {
      console.log("server started on port 3000");
    });
  })
  .catch((err) => {
    console.log(err);
  });



  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.use(express.static("public"));
  
  app.use(session({
  secret : "hello world",
  resave : false,
  saveUninitialized : false
}))


const booksSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
  },
  author: {
    type: String,
    required: true,
    minLength: 3,
  },
  genre: {
    type: String,
    required: true,
    minLength: 3,
  },
});

const usersSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 8,
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
});

const Book = new mongoose.model("book", booksSchema);
const User = new mongoose.model("user", usersSchema);


const isLoggedIn =( req,res,next)=>{
if(req.session.userId){
  next();
}else{
  res.redirect("/login")
}
}






app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/add", isLoggedIn, (req, res) => {
  res.render("addBook.ejs");
});

app.post("/add", (req, res) => {
  var title = req.body.title;
  var author = req.body.author;
  var genre = req.body.genre;

  const book = new Book({
    title: title,
    author: author,
    genre: genre,
  });
  book
    .save()
    .then((book) => {
      console.log("book added succesfully=>", book);
      res.redirect("/books");
    })
    .catch((error) => {
      console.log(error);
    });
});

app.get("/books",isLoggedIn, (req, res) => {
  Book.find({})
    .then((foundBooks) => {
      console.log(foundBooks);
      if (foundBooks.length > 0) {
        res.render("books", {
          data: foundBooks.reverse(),
        });
      } else {
        res.render("books", {
          data: "no books found",
        });
      }
    })

    .catch((err) => {
      console.log(err);
    });
});

//gener route
app.get("/genre/:genre?", (req, res) => {
  const selected_genre = req.params.genre;
  //define the filter based on weather a genre is provided
  const filter = selected_genre ? { genre: selected_genre } : {};
  Book.find(filter)
    .then((foundBooks) => {
      console.log(foundBooks);
      if (foundBooks.length > 0) {
        res.render("books", {
          data: foundBooks,
        });
      } else {
        res.render("books", {
          data: "no books found",
        });
      }
    })

    .catch((err) => {
      console.log(err);
    });
});

app.get("/signup", (req, res) => {
  res.render("Signup.ejs");
});

app.get("/login", (req, res) => {
  res.render("Login.ejs");
});

app.post("/login", (req, res) => {
  var email = req.body.useremail;
  var pass = req.body.password;

  User.find({ email: email })
    .then((foundUser) => {
      if (foundUser.length == 0) {
        console.log("no user found");
        res.redirect("/login");
      } else {
        bcrypt.compare(pass, foundUser[0].password, function (err, result) {
          if (!err) {
            if (result == true) {
              req.session.userId = foundUser[0]._id
              res.redirect("/books")
            }else{
              
              res.redirect("/login")
            }
          } else {
            console.log(err);
            res.redirect("/login");
          }
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
});

app.post("/signup", (req, res) => {
  var name = req.body.name;
  var email = req.body.email;
  var pass = req.body.password;

  bcrypt.hash(pass, 10, (err, hash) => {
    if (err) {
      console.log(err);
    } else {
      const user = new User({
        name: name,
        email: email,
        password: hash,
      });

      user
        .save()
        .then((user) => {
          console.log("user added sucesfully", user);
          req.session.userId = user._id
          res.redirect("/books");
        })
        .catch((error) => {
          console.log(error);
        });
    }
  })
});
