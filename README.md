# RAG-Based Intelligent Document Retrieval System: Phase 1 (Frontend)

Phase 1 is the complete web interface, running in the browser with **sample data**. Phase 2 adds the real backend
(FastAPI, ChromaDB, Ollama) and switches the same screens to real documents and real answers.

## What is included

| Area | Features |
|---|---|
| Login | Administrator and Student roles, role-based page access, sign-out with confirmation ("Are you sure you want to sign out?") |
| Admin dashboard | Library overview charts, document table with status, search and filters, PDF upload (PDF check, 20 MB limit) with year, semester, subject, university, department and optional chapter names, edit, delete |
| Student search | Natural-language question, filters for University, Department, Year, Semester, Subject, Textbook and Chapter, popular questions, recent searches |
| Answer length | Short, Medium or Detailed answer, always based only on the study material |
| Source references | Each answer lists textbook, chapter, page and the original passage. Select [1], [2] in the answer, or "View source", to open the passage |
| Textbook-only answers | If the answer is not in the material, the "Answer Verification" message is shown instead of an invented answer |
| History | Every answered question is saved so students can reopen it later (open, delete, clear all) |
| My Study Materials | Subject-wise dashboard (for example "Data Structures: 2 Textbooks"), textbooks with chapters, and one-click "Ask about this textbook / chapter / subject" |

## How to run

1. Unzip the folder.
2. Open a terminal in the folder and run: `python -m http.server 5500`
3. Open http://localhost:5500 in Chrome, Edge or Firefox.

(Opening `index.html` directly also works in some browsers, but the local server is the reliable way.)

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Administrator | admin@demo.edu | Admin@123 |
| Student | student@demo.edu | Student@123 |

## How the demo behaves (important)

- Answers come from a built-in set of **sample study material** (about 40 topics across 8 subjects, 10 sample textbooks).
  Questions outside it show the "Answer Verification" message.
- **Uploaded PDFs** are accepted, validated, listed, tracked (Pending, Processing, Indexed) and saved in the browser so they
  stay available to students on the same computer. A student can find them by title and subject ("Matching documents found").
  **Reading the text inside the PDF and answering from it is Phase 2.**
- Uploads are checked for: PDF type, empty file, size over 20 MB, and a real PDF header (renamed or damaged files are rejected with a clear message).
- To restore the original sample data, clear the site data for localhost in the browser.

## Customising

All settings are in `js/config.js`: subjects (`SUBJECTS`), universities (`UNIVERSITIES`), departments (`DEPARTMENTS`),
years and semesters, maximum file size, history size. Sample textbooks and chapters are in `js/mock-data.js` and `js/knowledge.js`.

## Phase 2: connecting the backend

Set `USE_MOCK = false` and `API_BASE_URL` in `js/config.js`. `js/api.js` then calls:

| Function | Request |
|---|---|
| login | POST /auth/login |
| listDocuments | GET /documents (filters: status, year, semester, subject, university, department, document_id) |
| uploadDocument | POST /documents (multipart; includes university, department, chapter names) |
| updateDocument / deleteDocument | PUT / DELETE /documents/{id} |
| search | POST /search with `query`, `year`, `semester`, `subject`, `university`, `department`, `document_id`, `chapter`, `length` ("short", "medium" or "detailed") |

The search response is `{ status: "ok" | "no_evidence", answer, answers?, sources: [{ document_id, document_title, chapter_no, chapter_name, page, passage, score, subject, year, semester, university, department }] }`.
In Phase 2 the backend returns the answer for the requested `length`.

## Project structure

```
index.html  admin.html  search.html  study.html  denied.html
css/styles.css
js/config.js  api.js  auth.js  ui.js  login.js  admin.js  search.js  study.js
js/mock-data.js   (sample users, documents, search)
js/knowledge.js   (sample chapters and extra sample answers)
```

## Self-test checklist

1. Admin uploads a valid PDF: accepted, status moves Pending, Processing, Indexed.
2. Admin uploads a .txt, an empty file, a renamed non-PDF or a file over 20 MB: rejected with a clear message.
3. Student asks a sample question: answer with chapter, page and passage; [1] opens the source.
4. Student switches Short / Medium / Detailed: the answer changes.
5. Student asks something not in the material: "Answer Verification" message.
6. Student filters by subject, textbook and chapter: results follow the filters.
7. Student reopens a past question from History.
8. Sign Out asks for confirmation; Cancel stays signed in.
9. Student opens admin.html: access denied.
10. My Study Materials shows textbook counts per subject and links into search.
