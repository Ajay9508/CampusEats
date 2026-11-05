
# CampusEats - CS543 Assignment 8

## Project Description

CampusEats Menu Catalogue is a REST API developed
using Node.js and Express.js.

It allows users to view all menu items, fetch an
individual menu item, and add new menu items.

The frontend is developed using HTML, CSS and JavaScript.

## Team

| # | Name | Roll Number |
|---|------|--------------|
| 1 | Mohit Tiwari | 20252651034 |
| 2 | Himanshi Pawar | 20252651024 |
| 3 | Ajay Kumar | 20252651004 |
| 4 | Asha Sahu | 20252651013 |
| 5 | Vedant Sahu | 20252651063 |

## Selected CampusEats Service

We selected the Menu Catalogue Service.

## REST API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /items | Fetch all menu items |
| GET | /items/:id | Fetch one item by ID |
| POST | /items | Create a new menu item |

## Assignment Questions and Answers

### 1. Which CampusEats service did you pick,
and what are its routes?

We selected the Menu Catalogue Service.

The following REST API routes are implemented:

- GET /items - Retrieves all menu items.
- GET /items/:id - Retrieves a specific item using its ID.
- POST /items - Creates a new menu item.

### 2. Which status codes did you return,
and for which outcomes?

- 200 OK: When menu items are fetched successfully.
- 201 Created: When a new menu item is created successfully.
- 404 Not Found: When the requested menu item ID does not exist.
- 422 Unprocessable Entity: When required fields are missing
  or invalid during the POST request.

### 3. Where did you use req.params and
where did you use req.body?
Why does POST need express.json()?

req.params is used in GET /items/:id to retrieve
the ID from the URL.

Example:
const id = Number(req.params.id);

req.body is used in POST /items to retrieve
the JSON data sent by the frontend.

Example:
const { name, price, available } = req.body;

express.json() is middleware that parses incoming
JSON request bodies and makes the parsed data
available through req.body.

Without express.json(), Express does not
automatically parse JSON request bodies.

## Technologies Used

- Node.js
- Express.js
- HTML5
- CSS3
- JavaScript
- REST API
- Fetch API

## How to Run

1. Clone or download this repository.
2. Open the project folder in VS Code.
3. Install dependencies:

   npm install

4. Start the server:

   npm start

5. Open your browser:

   http://localhost:3000

## Data Storage

The project uses an in-memory JavaScript array
containing four initial menu records.

No external database is required.

## Demonstration

Google Drive Video Link: ADD YOUR LINK

Before Screenshot: ADD SCREENSHOT

After Screenshot: ADD SCREENSHOT
