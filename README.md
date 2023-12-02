# Cloud-Computing API Documentation

* Send Feedback To Email (POST): /FeedbackEmail
* Send Feedback To Database (POST): /AddFeedback
* Fetch Data From Database (GET): /data
* Upload Image (POST): /upload
* Fetch image from cloud storage bucket: /download/{filename}

# AddEmail API

Welcome to the AddEmail API documentation! This API allows you to add an email along with associated text to your system, making communiaction through email easier.

## Getting Started

Before you start using the AddEmail API, ensure you have the necessary environment to make HTTP requests.

### Prerequisites
- Nodemailer (Node.js module to handle sending messages through email with various method)

## Using the API

### Making a Request

To send feedback message to the developer email, make a POST request to the `/AddEmail` endpoint with the following format:

### Contoh

Json input expected for`/AddEmail` endpoint:

```json
{
  "userEmail": "example@email.com",
  "userMessage": "Sample text associated with the email"
}




