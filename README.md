# SurveyBuilder - Test Engineer Technical Assessment

Welcome to the SurveyBuilder Test Engineer Assessment! This take-home exercise is designed to evaluate your testing skills, attention to detail, and ability to identify and document issues in a web application.

![SurveyBuilder Banner](https://via.placeholder.com/1200x400?text=SurveyBuilder+-+Test+Engineer+Assessment)

## 📝 Assessment Overview

This repository contains a survey creation and management application built with React, TypeScript, and Tailwind CSS. Your task is to evaluate the application from a quality assurance perspective and complete **two** of the following four tasks:

1. **Find and raise a bug** - Document any issues you find in the application
2. **Create a manual regression test pack** - Develop a comprehensive test plan for future regression testing
3. **Using Postman, create a reproducible test with validation** - Test the API endpoints and validate responses
4. **Write an executable test case** - Create automated tests for a critical application flow

## ⏱️ Timeboxing Your Work

Please timebox your effort on this assessment. We understand that QA tasks could expand indefinitely, so we recommend setting a reasonable time limit for yourself. Remember that you only need to complete **two** of the tasks, so choose the ones that best showcase your skills.

Quality is more important than quantity. Focus on delivering thorough work for your chosen tasks that demonstrates your approach to testing problems.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or later)
- npm (v6 or later)

### Installation

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

### Known Issues and Troubleshooting

When setting up the application, you might encounter these common issues:

- **Node.js Version Compatibility**: If you see EBADENGINE warnings during installation, consider using a Node.js version close to v20.8.x for best compatibility.
- **Port Conflict**: If port 5173 is already in use, Vite will automatically try to use the next available port. Check your terminal output for the correct URL.
- **Mock Data Persistence**: Since this application uses a mock API service, data is only persisted in memory during the current session. Refreshing the page will reset all created surveys to the initial mock data.

The focus of this assessment is on quality assurance tasks, so you do not need to fix any setup-related issues unless they prevent you from completing your chosen tasks.

## 🔍 Application Information

SurveyBuilder is a web application that allows users to:
- Create custom surveys with different question types (text, multiple choice, checkbox, rating)
- View a list of all created surveys
- View details of individual surveys
- Take surveys by filling in responses
- Delete surveys

### Key Features
- **Survey Creation**: Users can create surveys with multiple question types
- **Survey Management**: View, take, and delete surveys
- **Survey Response**: Fill in and submit responses to surveys

### Application Structure
- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Routing**: React Router
- **API**: Mock API service (no actual backend)

### Mock API Service

The application uses a mock API service that simulates backend functionality. This service is implemented in `src/services/api.ts` and includes the following endpoints:

- **GET /surveys** - Retrieves all surveys
- **GET /survey/:id** - Retrieves a specific survey by ID
- **POST /survey** - Creates a new survey
- **DELETE /survey/:id** - Deletes a survey
- **POST /survey/:id/response** - Submits a response to a survey
- **GET /survey/:id/responses** - Retrieves responses for a specific survey

For the Postman testing task, you can inspect the mock implementation to understand the expected request and response formats. The mock service uses simulated network delays to mimic real-world API behavior.

## 📋 Assessment Tasks

Please complete **two** of the following tasks:

### 1. Find and Raise a Bug

- Explore the application thoroughly
- Document any bugs, issues, or inconsistencies you find
- For each bug, include:
  - Description of the issue
  - Steps to reproduce
  - Expected behavior
  - Actual behavior
  - Screenshots (if applicable)
  - Severity rating and justification

### 2. Create a Manual Regression Test Pack

- Create a comprehensive regression test plan
- Include test cases for all core functionalities
- Prioritize test cases based on criticality
- Document test cases with:
  - Test ID
  - Test description
  - Prerequisites
  - Test steps
  - Expected results
  - Pass/Fail criteria

### 3. Create Reproducible Postman Tests

- Create a Postman collection that tests the application's functionality
- Document the API endpoints you would test
- Include tests for at least:
  - Getting all surveys
  - Getting a specific survey
  - Creating a new survey
  - Submitting a survey response
  - Deleting a survey
- Add validation scripts to verify correct responses
- Export your Postman collection and include it with your submission

**Note:** Since the application uses a mock API service, you'll need to set up your Postman tests to simulate how the frontend interacts with these endpoints. Examine the code in `src/services/api.ts` to understand the expected request and response formats.

### 4. Write Executable Test Cases

- Choose a testing framework of your preference (e.g., Cypress, Jest, Testing Library)
- Write automated tests for at least one critical user flow (e.g., creating and submitting a survey)
- Ensure tests are well-documented and maintainable
- Include instructions for running your tests

## 📤 Submission Guidelines

Please provide your completed assessment as:
1. A link to a forked repository with your changes
2. A document detailing which two tasks you chose and your approach (use the provided `SUBMISSION_TEMPLATE.md` file)
3. All relevant files for your completed tasks

Please complete the `SUBMISSION_TEMPLATE.md` file with details about your approach and findings. This standardized format will help ensure your submission includes all necessary information.

## 💡 Evaluation Criteria

Your submission will be evaluated based on:
- Attention to detail
- Thoroughness of testing
- Quality of documentation
- Problem-solving approach
- Critical thinking skills
- Technical communication

## 🛠️ Technologies Used

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router
- **Building**: Vite

## 📬 Questions or Issues?

If you encounter any issues with the application setup or have questions about the assessment, please reach out to [contact-email@example.com].

Good luck!