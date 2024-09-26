# File Manager Platform - Backend



This project is a culmination of various back-end concepts and technologies learned over the course of the trimester, including **authentication**, **NodeJS**, **MongoDB**, **Redis**, **pagination**, and **background processing**. The platform allows users to upload and view files, with various functionalities built around user authentication, file management, and image processing.



## Features



The platform includes the following key features:



1. **User Authentication via Token**: 

   - Secure user authentication using JSON Web Tokens (JWT).

   

2. **List All Files**: 

   - Endpoint to fetch a paginated list of all files uploaded by the user.

   

3. **Upload a New File**: 

   - Users can upload files with various metadata, including support for different file types.

   

4. **Change Permission of a File**: 

   - Update the visibility and access permissions of a file (e.g., public or private).



5. **View a File**: 

   - Retrieve and view specific files uploaded by the user.



6. **Generate Thumbnails for Images**: 

   - Automatically generate and store thumbnails for image files.



---



## Technologies Used



- **Node.js**: Server-side JavaScript runtime for building scalable backend services.

- **Express.js**: Web framework for building RESTful APIs.

- **MongoDB**: NoSQL database for storing user data and file metadata.

- **Redis**: In-memory data store used for caching and background processing.

- **JWT (JSON Web Tokens)**: Used for secure user authentication.

- **Multer**: Middleware for handling multipart/form-data, used for uploading files.

- **Sharp**: Library for generating image thumbnails and processing images.

- **Background Job Processing**: Redis queues for handling tasks like thumbnail generation asynchronously.
