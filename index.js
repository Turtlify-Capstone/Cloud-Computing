require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const { spawn } = require('child_process');
const { Storage } = require("@google-cloud/storage");
const { format } = require("util");

const app = express();
app.use(express.json());

const processFile = require("./upload");
const storage = new Storage({ keyFilename: "./Requirement/testing-pic-key.json" });
const bucket = storage.bucket("fotopenyutest");

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
};

function startCloudSqlProxy() {
    const proxyPath = './Requirement/cloud-sql-proxy.exe'; // Adjust if necessary
    const credentials = process.env.CLOUD_SQL_CREDENTIALS_PATH;
    const instanceConnectionName = process.env.CLOUD_SQL_INSTANCE_NAME;
  
    const proxy = spawn(proxyPath, [
        `--credentials-file=${credentials}`,
        instanceConnectionName
      ]);
      
  
    proxy.stdout.on('data', (data) => {
      console.log(`Cloud SQL Proxy: ${data}`);
    });
  
    proxy.stderr.on('data', (data) => {
      console.error(`Cloud SQL Proxy Error: ${data}`);
    });
  
    proxy.on('close', (code) => {
      console.log(`Cloud SQL Proxy process exited with code ${code}`);
    });
}
  
startCloudSqlProxy();
 
app.get('/data', async (req, res) => {
  try {
    const pool = await mysql.createPool(dbConfig);
    const [rows] = await pool.query('SELECT * FROM penyutest'); 
    res.json(rows);
    await pool.end();
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('Error fetching data');
  }
});

app.post('/upload', async(req, res) => {
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

app.get('/download/:filename', async (req, res) => {
  try {
      const file = bucket.file(req.params.filename);
      const exists = (await file.exists())[0];

      if (!exists) {
          return res.status(404).send({ message: 'File not found.' });
      }

      const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

      // Option 1: Redirect to the public URL
      res.redirect(publicUrl);

      // Option 2: Stream the file directly to the client
      // file.createReadStream().pipe(res);
  } catch (err) {
      console.error(err);
      res.status(500).send({ message: `Unable to retrieve file. Error: ${err.message}` });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

