# Survey Builder - Test Engineer Assessment

A web application designed to evaluate test engineering skills and quality assurance approaches.

## Assessment Focus

This application contains intentional opportunities to demonstrate:
- Bug identification and documentation
- Test case development
- API testing knowledge
- Regression testing approaches

## Key Features to Test

- **Section-based survey organization**
- **Multi-page survey layout**
- **Anonymous response collection**
- **Response analytics**
- **Review submission functionality**

## Assessment Tasks

Choose **two** of the following tasks to complete:

1. Find and document bugs with detailed reproduction steps
2. Create a manual regression test pack
3. Write automated test cases for critical user flows

## Installation

```bash
# Clone the repository
git clone [this-repository-url]

# Change to project directory
cd survey-builder

# Install dependencies
npm install

# Start the application
npm run dev
```

The application should now be running at http://localhost:5173

## Application Functionality

The application provides functionality for:
- Creating surveys with various question types
- Organizing questions into sections and pages
- Viewing and managing surveys
- Collecting and analyzing responses

## Mock API Endpoints

- **GET /surveys** - Retrieves all surveys
- **GET /survey/:id** - Retrieves a specific survey
- **POST /survey** - Creates a new survey
- **DELETE /survey/:id** - Deletes a survey
- **POST /survey/:id/response** - Submits a response
- **GET /survey/:id/responses** - Retrieves responses