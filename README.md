# Grade management system

An Express API written in TypeScript; that keeps track of student grades and GPA over the course of an academic year. Data is stored and handled in a PostgreSQL database.
This system is a component of a larger university management system.

## Prerequisites

To run this API, you will need the following:

- Node.js and npm installed
- PostgreSQL

To test the endpoints:
- [Postman](https://learning.postman.com/docs/introduction/overview/), [Insomnia](https://docs.insomnia.rest/), [curl](https://curl.se/docs/)


## Installation

1. Clone the repository:

```
git clone https://github.com/Meko007/grade-management.git
```

2. Install the dependencies:

```
npm install
```

3. Create a `.env` file in the root directory of the project and follow the [sample file](./.env.sample)

## Creating a PostgreSQL database using Prisma ORM

To install PostgreSQL head over to the [PostgreSQL webiste](https://www.postgresql.org/docs/current/index.html) and follow the steps to download, install and set it up for your operating system.

After installation, run the `npm run prisma-gen`, then the `npm run prisma-migrate` scripts.

## Running the API

Run the `npm run dev` script to start the development server.

The API will be available at `http://localhost:XXXX/api/v1`

## ERD (Entity Relationship Diagram)

Designed with pgAdmin (please zoom in for clarity)

![ERD](ERD.png)

## API Endpoints

### School endpoints

| Operation               | Route                                  | Auth    | Admin Privileges | Description                            |
|-------------------------|----------------------------------------|---------|------------------|----------------------------------------|
| POST                    | /schools                               | Required| Yes              | Create a new school                    |
| GET                     | /schools                               | Required| No              | Retrieve all schools                   |
| GET                     | /schools/:id                           | Required| No              | Retrieve school by ID                   |
| PUT                     | /schools/:id                           | Required| Yes              | Update school by ID                     |
| DELETE                  | /schools/:id                           | Required| Yes              | Delete school by ID                     |
| GET                     | /school-depts/:id                      | Required| No              | Retrieve departments for a school       |

### Department endpoints 

| Operation               | Route                  | Auth    | Admin Privileges | Description                       |
|-------------------------|------------------------|---------|------------------|-----------------------------------|
| POST                    | /depts                 | Required| Yes              | Create a new department           |
| GET                     | /depts                 | Required| No              | Retrieve all departments          |
| GET                     | /depts/:id             | Required| No             | Retrieve department by ID         |
| PUT                     | /depts/:id             | Required| Yes              | Update department by ID           |
| DELETE                  | /depts/:id             | Required| Yes              | Delete department by ID           |

### Session endpoints

| Operation               | Route                     | Auth    | Admin Privileges | Description                          |
|-------------------------|---------------------------|---------|------------------|--------------------------------------|
| POST                    | /sessions                 | Required| Yes              | Create a new session                 |
| GET                     | /sessions                 | Required| No              | Retrieve all sessions                |
| GET                     | /sessions/:id             | Required| No              | Retrieve session by ID               |
| DELETE                  | /sessions/:id             | Required| Yes              | Delete session by ID                 |


### Semester endpoints

| Operation               | Route                     | Auth    | Admin Privileges | Description                          |
|-------------------------|---------------------------|---------|------------------|--------------------------------------|
| POST                    | /semesters                | Required| Yes              | Create a new semester                |
| GET                     | /semesters                | Required| No              | Retrieve all semesters               |
| GET                     | /semesters/:id            | Required| No              | Retrieve semester by ID              |
| DELETE                  | /semesters/:id            | Required| Yes              | Delete semester by ID                |

### Course endpoints

| Operation | Route                  | Auth        | Admin Privileges | Description                |
|:----------|:-----------------------|:------------|:------------------|:---------------------------|
| POST      | /courses               | Required    | Yes              | Creates a new course       |
| GET       | /courses               | Required    | No              | Returns all courses        |
| GET       | /courses/:id           | Required    | No               | Returns course by its id    |
| PUT       | /courses/:id           | Required    | Yes              | Updates course by its id   |
| DELETE    | /courses/:id           | Required    | Yes              | Deletes course by its id   |

### Grade endpoints

| Operation               | Route                  | Auth    | Admin Privileges | Description                       |
|-------------------------|------------------------|---------|------------------|-----------------------------------|
| POST                    | /grades                | Required| Yes              | Create a new grade                |
| GET                     | /grades                | Required| No              | Retrieve all grades               |
| GET                     | /grades/:id            | Required| No              | Retrieve grade by ID              |
| PUT                     | /grades/:id            | Required| Yes              | Update grade by ID                |
| DELETE                  | /grades/:id            | Required| Yes              | Delete grade by ID                |

### Lecturer endpoints

| Operation               | Route                             | Auth    | Admin Privileges | Unique User | Description                       |
|-------------------------|-----------------------------------|---------|------------------|-------------|-----------------------------------|
| POST                    | /lecturers/register               | Optional| No               | Yes          | Register a new lecturer           |
| POST                    | /lecturers/login                  | Optional| No               | Yes          | Login as a lecturer                |
| POST                    | /lecturers/logout                 | Optional| No               | Yes          | Logout as a lecturer               |
| GET                     | /lecturers                        | Required| Yes              | No          | Retrieve all lecturers            |
| GET                     | /lecturers/:id                    | Required| Yes              | No          | Retrieve lecturer by ID            |
| PUT                     | /lecturers/:id                    | Required| Yes              | No          | Update lecturer by ID              |
| DELETE                  | /lecturers/:id                    | Required| Yes              | No          | Delete lecturer by ID              |
| POST                    | /lecturers/forgot-password        | Optional| No               | Yes          | Forgot password     |
| POST                    | /lecturers/reset-password/:resetToken| Optional| No               | Yes          | Reset password     |
| GET                     | /lecturer/courses                 | Required| No               | Yes         | Retrieve courses for a lecturer   |
| POST                    | /lecturer/scores/:sessionId/:semesterId| Required| No               | Yes         | Score a student in a session      |
| PUT                     | /lecturer/scores/:sessionId/:semesterId| Required| No               | Yes         | Update student score in a session |
| GET                     | /lecturer/scores/:sessionId/:semesterId| Required| No               | Yes         | View grades for a session         |


### Student endpoints

| Operation                          | Route                             | Auth           | Admin Privileges | Unique user | Description                        |
|:-----------------------------------|:----------------------------------|:---------------|:-----------------|:------------|:-----------------------------------|
| POST                               | /students/register                | Optional       | No               | Yes          | Registers a new student            |
| POST                               | /students/login                   | Optional       | No               | Yes          | Student login                      |
| POST                               | /students/logout                  | Optional       | No               | Yes          | Student logout                     |
| GET, PUT                           | /students                         | Required       | Yes              | No          | Get all students, Update students  |
| POST                               | /student/my-courses/:semesterId   | Required       | No               | Yes         | Student registers for courses      |
| GET                                | /student/my-courses/:level/:semesterId | Required       | No               | Yes         | Get courses for a student          |
| GET                                | /student/view-grades              | Required       | No               | Yes         | View grades for a student          |
| POST                               | /students/forgot-password         | Required       | No               | Yes         | Forgot password   |
| POST                               | /students/reset-password/:resetToken | Required     | No               | Yes         | Reset password     |
| GET, DELETE                        | /students/:id                     | Required       | Yes              | No          | Get student by ID, Delete student  |

### Admin endpoints

| Operation               | Route                              | Auth    | Unique User | Description                   |
|-------------------------|------------------------------------|---------|-------------|-------------------------------|
| POST                    | /admin/register                    | Optional|      Yes         | Register a new admin account  |
| POST                    | /admin/login                       | Optional|             Yes         | Admin login                   |
| POST                    | /admin/logout                      | Optional|     Yes         | Admin logout                  |
| POST                    | /admin/forgot-password             | Optional|           Yes         | Forgot password        |
| POST                    | /admin/reset-password/:resetToken  | Optional|  Yes         | Reset password    |



