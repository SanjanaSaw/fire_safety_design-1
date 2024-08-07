const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');
// const xlsx = require('xlsx');
// const fs = require('fs');
const cors = require("cors");
const bodyParser=require("body-parser");
require('dotenv').config();


const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use(cors({ methods: ["POST", "GET"], credentials: true }));
// app.use(cors());

app.use(express.static(path.join(__dirname, '../public')));

// app.set('view engine','html');
// app.use(express.static('../public'));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get("/login", (req, res) => {
    // console.log("Received GET request at /login")
    res.sendFile(path.join(__dirname, '../public/login.html'));
    // res.sendFile("login");
});

app.get("/signup", (req, res) => {
    // console.log("Received GET request at /signup");
    res.sendFile(path.join(__dirname, '../public/signup.html'));
});

// app.get("/", (req, res) => {
//     res.sendFile("index");
// });

// app.get("/login", (req, res) => {
//     res.sendFile("login");
// });

// app.get("/signup", (req, res) => {
//     res.sendFile("signup");
// });


// Register User
app.post("/signup", async (req, res) => {
    try {
        const data = { name: req.body.username, email: req.body.email, password: req.body.password };
        const existingUser = await collection.findOne({ name: data.name });
        const existingEmail = await collection.findOne({ email: data.email });

        if (existingUser) {
            res.send(`<script>alert("User already exists, please use a different username"); window.location.href = "/signup";</script>`);
        } else if (existingEmail) {
            res.send(`<script>alert("Email already exists, please use a different email"); window.location.href = "/signup";</script>`);
        } else {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
            const userdata = await collection.insertMany(data);
            res.send(`<script>alert("User registered successfully."); window.location.href = "/login";</script>`);
        }
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// app.post("/signup", async (req, res) => {
//     // console.log("Received signup request");
//     const data = {
//         name: req.body.username,
//         email: req.body.email,
//         password: req.body.password
//     };
    
//     console.log("signup data:",data)
//     // Check if the username already exists in the database
//     const existingUser = await collection.findOne({ name: data.name });
//     const existingEmail = await collection.findOne({ email: data.email });

//     if (existingUser) {
//         res.send(`<script>
//                 alert("User already exists, please use a different username");
//                 window.location.href = "/signup";
//             </script>`);
//     } else if (existingEmail) {
//         res.send(`<script>
//             alert("Email already exists, please use a different email");
//             window.location.href = "/signup";
//         </script>`);
//     } else {
//         // Hash the password using bcrypt
//         const saltRounds = 10; // Number of salt rounds for bcrypt
//         const hashedPassword = await bcrypt.hash(data.password, saltRounds);

//         data.password = hashedPassword; // Replace the original password with the hashed one

//         const userdata = await collection.insertMany(data);
//         console.log(userdata);
        
//     return res.send(`
//             <script>
//                 alert("User registered successfully.");
//                 window.location.href = "/login";
//             </script>
//         `);
//     }
// });

// Login user 
app.post("/login", async (req, res) => {
    console.log("Received login request");
    try {
        const check = await collection.findOne({ name: req.body.username });
        if (!check) {
            res.send(`<script>
                alert("Username not found");
                window.location.href = "/login";
            </script>`);
        }
        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (!isPasswordMatch) {
            res.send(`<script>
                alert("Wrong Password");
                window.location.href = "/login";
            </script>`);
        } else {
            // Serve the index.html file upon successful login
            res.send(`<script>
                alert("login successfully");
                window.location.href = "/";
            </script>`);
            // res.sendFile(path.resolve(__dirname, '../public/index.html'));
            // res.sendFile(path.join(__dirname, "home"));
            // res.sendFile("home");
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).send("Internal Server Error");
    }
});

// //Query form
// app.post('/submit', (req, res) => {
//     const fullName = req.body.full_name;
//     const email = req.body.email;
//     const subject = req.body.subject;
//     const message = req.body.message;

//     // Path to the Excel file
//     const filePath = path.join(__dirname, '../data.xlsx');

//     // Check if the Excel file exists
//     let workbook;
//     if (fs.existsSync(filePath)) {
//         workbook = xlsx.readFile(filePath);
//     } else {
//         workbook = xlsx.utils.book_new();
//         workbook.SheetNames.push('Sheet1');
//         workbook.Sheets['Sheet1'] = xlsx.utils.aoa_to_sheet([['Full Name', 'Email', 'Subject', 'Message']]);
//     }

//     const worksheet = workbook.Sheets['Sheet1'];

//     // Get the current sheet data
//     const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

//     // Append the new form data
//     data.push([fullName, email, subject, message]);

//     // Convert the data back to a worksheet
//     const newWorksheet = xlsx.utils.aoa_to_sheet(data);
//     workbook.Sheets['Sheet1'] = newWorksheet;

//     // Save the workbook to the file
//     xlsx.writeFile(workbook, filePath);

//     res.send('Form data saved to Excel file successfully!');
// });


const PORT = process.env.PORT ||  5501;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`)
});

module.exports = app;