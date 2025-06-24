# AskForge

## Table of Contents

- [Introduction](#introduction)
- [Live Demo](#live-demo)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Installation Guide](#installation-guide)
- [Usage](#usage)
- [API](#api)
- [Environment Variables](#environment-variables)
- [Contribution Guide](#contribution-guide)

---

## Introduction

**AskForge** is a modern, full-stack developer Q&A platform built with Next.js and Appwrite. It enables users to register, log in, ask questions, answer, comment, vote, and build reputation in a collaborative environment. The project features a rich UI, real-time updates, and a robust authentication and authorization system.

---

## Live Demo

🚀 **Check out the live version:** [**https://ask-forge.vercel.app/**](https://ask-forge.vercel.app/)

---

## Key Features

- User registration, login, and authentication
- Ask, edit, and delete questions
- Answer and comment on questions
- Comment on answers 
- Upvote and downvote questions and answers
- Reputation system for users
- Rich text editor for questions and answers
- File/image attachments for questions
- User profiles with activity stats
- Top contributors leaderboard
- Pagination and search functionality
- Responsive and modern UI

---

## Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) (App Router, Server/Client Components)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)

**Backend & API**
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/router-handlers)
- [Appwrite](https://appwrite.io/) (Databases, Users, Storage, Functions)

**State Management**
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Immer](https://immerjs.github.io/immer/)

**Styling & UI**
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [magicui](https://magicui.design/)
- Custom UI Components
- [react-hot-toast](https://react-hot-toast.com/)

**Icons**
- [Tabler Icons](https://tabler.io/icons)
- [react-icons](https://react-icons.github.io/react-icons/)

**Rich Text & Utilities**
- Custom Rich Text Editor (RTE)
- [react-markdown](https://github.com/remarkjs/react-markdown)
- [dayjs](https://day.js.org/) (date formatting)
- [slugify](https://www.npmjs.com/package/slugify)

---

## Installation Guide

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Pragyat-Nikunj/AskForge.git
   cd askforge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**  
   See [Environment Variables](#environment-variables).

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser:**  
   Visit [http://localhost:3000](http://localhost:3000)

---

## Usage

- Register a new account or log in.
- Ask questions, answer others, and participate in discussions.
- Vote on questions and answers to help highlight the best content.
- View your profile to track your reputation and contributions.
- Use the search and tag features to find relevant questions.

---

## API

The backend is powered by [Appwrite](https://appwrite.io/).  
Key API endpoints are implemented as Next.js API routes (see `/src/app/api/`):

- `POST /api/answer` — Create a new answer
- `DELETE /api/answer` — Delete an answer
- Additional endpoints for questions, votes, and user management are implemented similarly.

All API routes expect and return JSON.

---

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=your_appwrite_endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your_appwrite_project_id
APPWRITE_API_KEY=your_appwrite_api_key
```

- `NEXT_PUBLIC_APPWRITE_ENDPOINT`: Your Appwrite endpoint URL (e.g., `http://localhost/v1`)
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID`: Your Appwrite project ID
- `APPWRITE_API_KEY`: Your Appwrite server API key (for server-side operations)

---

## Contribution Guide

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes relevant tests if applicable.

---

**License:** MIT  
**Author:** [Pragyat Nikunj](https://github.com/Pragyat-Nikunj)
