const express = require('express');
const path = require('path');
const multer = require('multer');
const mysql = require('mysql');
const util = require('util');

// storage
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, 'images');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage })

// database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});
connection.connect();
const query = util.promisify(connection.query).bind(connection);;

// app
const app = express();
const port = process.env.PORT || 8001;

app.use('/images', express.static(__dirname + '/images'));

app.post(
    '/api/image',
    upload.fields([{ name: 'image', maxCount: 1 }]),
    async function (req, res, next) {
        const { title, description } = req.body;
        const image = req.files['image'][0];
        const sql = "INSERT INTO `image` (`title`, `image_path`, `description`) VALUES ('" + title + "', '" + image.path + "', '" + description + "')";
        await query(sql);
        return res.send({ message: 'Data uploaded successfully.' });
    }
);

app.listen(port);
console.log('Server started at http://localhost:' + port);