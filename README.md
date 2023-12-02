# Cloud-Computing

* Send Feedback To Email (POST): /FeedbackEmail
* Send Feedback To Database (POST): /AddFeedback
* Fetch Data From Database (GET): /data
* Upload Image (POST): /upload
* Fetch image from cloud storage bucket: /download/{filename}

# AddEmail API

Welcome to the AddEmail API documentation! This API allows you to add an email along with associated text to your system, making email management and processing easier.

## Getting Started

Before you start using the AddEmail API, ensure you have the necessary environment to make HTTP requests.

### Prerequisites

- HTTP client (like `curl`, Postman, or any programming language with HTTP request capabilities)

## Using the API

### Making a Request

To add an email to the system, make a POST request to the `/AddEmail` endpoint with the following format:


### Example

Here's an example of how to call the `/AddEmail` endpoint using `curl`:

```bash
curl -X POST /AddEmail \
-H 'Content-Type: application/json' \
-d '{
  "email": "example@email.com",
  "text": "Sample text associated with the email"
}'



