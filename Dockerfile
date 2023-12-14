# Use an official lightweight Python 3.9 image.
FROM python:3.9-slim

# Set environment variables:
# - Prevents Python from writing pyc files to disc
# - Prevents Python from buffering stdout and stderr
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set the working directory in the container
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update \
    && apt-get -y install gcc libmariadb-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the Flask application code
COPY . .

# Command to run the application
CMD ["python", "./main.py"]

EXPOSE 8080

