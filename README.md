# Cloud-Computing API Documentation

* Send Feedback To Email (POST): [/FeedbackEmail](#feedbackemail-api)
* Send Feedback To Database (POST): [/AddFeedback](#addfeedback-api)
* Fetch Data From Database (GET): [/data](#data-api)
* Upload Image (POST): [/upload](#file-upload-api)
* Fetch image from cloud storage bucket: [/download/latest](#fetch-image-api)
* Fetch database by name: [/search?nama_lokal=VALUE](#search-api)

# Cloud Run API URL
https://turtlify-test-cloudrun-r7ear3dsma-et.a.run.app

# FeedbackEmail API

Welcome to the FeedbackEmail API documentation! This API allows you to send an email along with associated text to others, making communiaction through email easier.

### Getting Started

Before you start using the FeedbackEmail API, ensure you have the necessary environment to make HTTP requests.

### Prerequisites
- Nodemailer (Node.js module to handle sending messages through email with various method)
- Node.js

### Using the API

### Making a Request

To send feedback message to the developer email, make a POST request to the `/FeedbackEmail` endpoint with the following format:

```json
{
  "userEmail": "example@email.com",
  "userMessage": "Sample text associated with the email"
}
```
### Example

Json input expected for`/FeedbackEmail` endpoint:

```json
{
  "userEmail": "testingcapstone@gmail.com",
  "userMessage": "Hello, this is a test message."
}
```

# AddFeedback API

Welcome to the FeedbackEmail API documentation! This API allows you to add an email along with associated text to your database, making communiaction through email easier.

### Getting Started

Before you start using the FeedbackEmail API, ensure you have the necessary environment to make HTTP requests.

### Prerequisites
- Nodemailer (Node.js module to handle sending messages through email with various method)
- Access to cloud SQL

### Using the API

### Making a Request

To send feedback message to the developer email, make a POST request to the `/AddFeedback` endpoint with the following format:

```json
{
    "Email": "example@email.com",
  "Pesan": "Sample text associated with the email"
}
```
### Example

Json input expected for`/AddFeedback` endpoint:

```json
{
    "Email": "1234@gmail.com",
    "Pesan": "Testing post feedback user!"
}
```

# Data API

Welcome to the Data API documentation! This API allows you to fetch all data from certain table inside database.

### Getting Started

Before you start using the Data API, ensure you have the necessary environment to make HTTP requests.

### Prerequisites
- Node.js
- Access to cloud SQL
  
### Using the API

### Making a Request

To fetch data from the database, make a POST request to the `/data` endpoint

### Expected Output
```json
{
  "id": 1,
  "nama_lokal": "Tuntong laut, tuntung, tuntung semangka, beluku, tum-tum",
  "nama_latin": "Batagur borneoensis",
  "status_konversi":,
  "habitat":,
  "description":,
  "image":
}
```

# File Upload API

### Description

This API provides a simple and efficient way to upload files to a server. It's built with Node.js and uses the Multer middleware for handling `multipart/form-data`, suitable for uploading files up to 2MB in size. The files are temporarily stored in memory and then uploaded to a Google Cloud Storage bucket.

## Getting Started
Before you start using the File Upload API, make sure you have the necessary environment to handle HTTP file upload requests.

### Prerequisites

- Node.js
- Access to Google Cloud Storage
- Multer (Node.js middleware for handling multipart/form-data)
  
### Request Format
- The request should be made with multipart/form-data encoding.
- Include the file data in the field named "file".
- The file size must not exceed 2MB.
  
### Expected Output
```json
{
  "message": "Uploaded the file successfully: [file name]",
  "url": "https://storage.googleapis.com/[bucket-name]/[file name]"
}
```
### Example
![Upload Example](Readme-Img/Upload.png)

# Fetch Image API

### Description

This API provides a simple and efficient way to get files from cloud storage bucket.

## Getting Started
Before you start using the File Upload API, make sure you have the necessary environment to handle HTTP file upload requests.

### Prerequisites

- Node.js
- Access to Google Cloud Storage
  
### Request Format
https://turtlify-test-cloudrun-r7ear3dsma-et.a.run.app/download/latest

# Search API

### Description

This API provides a simple and way to fetch data from database table using certain parameter. 

### Getting Started
Before you start using the File Upload API, make sure you have the necessary environment to handle HTTP file upload requests.

### Prerequisites

- Node.js
- Access to Google Cloud Storage
  
### Request Format
- The request should be made with nama_lokal parameter with the value of the data inside nama_lokal that exists inside database.

### Expected Output
```json
{
  "id": 1,
  "nama_lokal": "Tuntong laut, tuntung, tuntung semangka, beluku, tum-tum",
  "nama_latin": "Batagur borneoensis",
  "status_konversi":,
  "habitat":,
  "description":,
  "image":,
  "Persebaran_Habitat":,
  "Latitude":,
  "Longitude":
}
```
### Example
![Upload Example](Readme-Img/Searchbyname.png)
