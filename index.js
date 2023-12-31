require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { spawn } = require('child_process');
const { Storage } = require("@google-cloud/storage");
const { format } = require("util");
const nodemailer = require('nodemailer');
const multer = require('multer');
const upload = multer();
const FormData = require('form-data');
const axios = require('axios');

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'baihaqirafli30@gmail.com',
    pass: 'fifb cpmg jewb fuli'
  }
});

const app = express();
app.use(express.json());

const processFile = require("./upload");
const storage = new Storage({ keyFilename: "./Requirement/turtlify-key.json" });
const bucket = storage.bucket("turtlifystorage");

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
};

// function startCloudSqlProxy() {
//     const proxyPath = './Requirement/cloud-sql-proxy.exe'; // Adjust if necessary
//     const credentials = process.env.CLOUD_SQL_CREDENTIALS_PATH;
//     const instanceConnectionName = process.env.CLOUD_SQL_INSTANCE_NAME;
  
//     const proxy = spawn(proxyPath, [
//         `--credentials-file=${credentials}`,
//         instanceConnectionName
//       ]);
      
  
//     proxy.stdout.on('data', (data) => {
//       console.log(`Cloud SQL Proxy: ${data}`);
//     });
  
//     proxy.stderr.on('data', (data) => {
//       console.error(`Cloud SQL Proxy Error: ${data}`);
//     });
  
//     proxy.on('close', (code) => {
//       console.log(`Cloud SQL Proxy process exited with code ${code}`);
//     });
// }
  
// startCloudSqlProxy();
 
app.get('/data', async (req, res) => {
  try {
    const pool = await mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT * FROM DeskripsiPenyu'); 
    res.json(rows);
    await pool.end();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/FeedbackData', async (req, res) => {
  try {
    const pool = await mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT * FROM FormFeedbackUser'); 
    res.json(rows);
    await pool.end();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.post('/UploadBucket', async(req, res) => {
  try {
    await processFile(req, res);

    if (!req.file) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream({
      resumable: false,
    });

    blobStream.on("error", (err) => {
      res.status(500).send({ message: err.message });
    });

    blobStream.on("finish", async (data) => {
      const publicUrl = format(
        `https://storage.googleapis.com/${bucket.name}/${blob.name}`
      );

      try {
        await bucket.file(req.file.originalname).makePublic();
      } catch {
        return res.status(500).send({
          message:
            `Uploaded the file successfully: ${req.file.originalname}, but public access is denied!`,
          url: publicUrl,
        });
      }

      res.status(200).send({
        message: "Uploaded the file successfully: " + req.file.originalname,
        url: publicUrl,
      });
    });

    blobStream.end(req.file.buffer);
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
});

app.post('/AddFeedback', async (req, res) => {
  try {
    
    const { Email, Pesan } = req.body;

    
    if (!Email || !Pesan) {
      return res.status(400).send({ message: "Missing data fields" });
    }

   
    const pool = await mysql.createPool(dbConfig);
    const query = 'INSERT INTO FormFeedbackUser (Email, Pesan) VALUES (?, ?)';
    const [result] = await pool.execute(query, [Email, Pesan]);

    
    res.status(200).send({ message: "Data added successfully", id: result.insertId });

  
    await pool.end();
  } catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send('Error inserting data');
  }
});

app.post('/FeedbackEmail', async (req, res) => {
  try {
    const { userEmail, userMessage } = req.body;

    let mailOptions = {
      from: userEmail, 
      to: 'ch2ps145@gmail.com', 
      subject: 'New Message from User',
      text: `Message from ${userEmail}: ${userMessage}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: 'Error sending email' });
      }
      res.status(200).send({ message: 'Feedback berhasil dikirim' });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing request');
  }
});

app.post('/Report', async (req, res) => {
  try {
    const { userEmail, userMessage } = req.body;

    let mailOptions = {
      from: userEmail, 
      to: 'ch2ps145@gmail.com', 
      subject: 'New Message from User',
      text: `Message from ${userEmail}: ${userMessage}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
        return res.status(500).send({ message: 'Error sending email' });
      }
      res.status(200).send({ message: 'Report berhasil dikirim' });
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error processing request');
  }
});

app.get('/download/latest', async (req, res) => {
  try {
      const [files] = await bucket.getFiles();

      const sortedFiles = files.sort((a, b) => b.metadata.timeCreated.localeCompare(a.metadata.timeCreated));

      const latestFile = sortedFiles[0];
      if (!latestFile) {
          return res.status(404).send({ message: 'No files found in the bucket.' });
      }

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${latestFile.name}`;

      res.redirect(publicUrl);
  } catch (err) {
      console.error('Error retrieving the latest file:', err);
      res.status(500).send({ message: `Unable to retrieve the latest file. Error: ${err.message}` });
  }
});

app.get('/search', async (req, res) => {
  try {
      const nameToSearch = req.query.nama_lokal;
      
      if (!nameToSearch) {
          return res.status(400).send({ message: "Please provide a name to search." });
      }

      const pool = await mysql.createPool(dbConfig);
      const query = 'SELECT * FROM DeskripsiPenyu WHERE nama_lokal LIKE ?';
      const [rows] = await pool.query(query, [`%${nameToSearch}%`]); 
      
      if (rows.length === 0) {
          return res.status(404).send({ message: "No matching records found." });
      }

      res.json(rows);
      await pool.end();
  } catch (error) {
      console.error('Error searching data:', error);
      res.status(500).send('Error searching data');
  }
});

app.get('/latlon-data', async (req, res) => {
  try {
    const pool = await mysql.createPool(dbConfig);
    // Replace 'YourTable' with your table name and column names as appropriate
    const [rows] = await pool.query('SELECT Latitude,Longitude FROM DeskripsiPenyu'); 
    res.json(rows);
    await pool.end();
  } catch (error) {
    console.error('Error fetching lat/lon data:', error);
    res.status(500).send('Error fetching lat/lon data');
  }
});

app.post('/UploadModel', upload.any(), async (req, res) => {
    try {
        // Check if any file is uploaded
        if (!req.files || req.files.length === 0) {
            return res.status(400).send({ message: "No file uploaded!" });
        }

        // Use the first file in the array
        const file = req.files[0];

        // Prepare the request for the model API using form-data
        const formData = new FormData();
        formData.append('file', file.buffer, file.originalname, {
            filename: file.originalname,
            contentType: file.mimetype
        });

        // Send the image to the model's API
        const response = await axios.post('https://turtlify-test-model-r7ear3dsma-et.a.run.app', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        });

        // Return the response from the model's API
        res.status(200).send(response.data);

    } catch (err) {
        console.error('Error:', err.message);
        res.status(500).send({ message: `Could not process the file. Error: ${err.message}` });
    }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

