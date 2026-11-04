# RAG-Based Intelligent Document Retrieval System
### Phase 1 — Frontend (Mock Data)

---

## What Is This Project?

This is a web application for the **Computer Engineering Department** that lets:

- **Admins** upload PDF study materials (notes, textbooks, past papers) with academic tags (Year, Semester, Subject).
- **Students** ask natural-language questions like *"What is deadlock?"* and get a clear answer **with the exact document name and page number** that supports it.

It is **not a general chatbot**. Every answer must come from an uploaded document. If the documents don't cover a topic, the system says so honestly.

**Phase 1** (this repo) runs entirely in the browser with sample data — no server needed.  
**Phase 2** will connect to a Python FastAPI backend with ChromaDB (vector database) and an Ollama LLM.

---

## Folder Structure

```
Webora Project1/
│
├── index.html          ← Login page (start here)
├── admin.html          ← Admin dashboard (upload + manage documents)
├── search.html         ← Student search page
├── denied.html         ← Shown when a student tries to open admin.html
│
├── css/
│   └── styles.css      ← All styling (CSS variables, components, layout)
│
├── js/
│   ├── config.js       ← Central settings (API URL, mock toggle, file size limit)
│   ├── mock-data.js    ← Sample documents, Q&A pairs, and mock API functions
│   ├── api.js          ← Service layer (same functions work in mock AND real mode)
│   ├── auth.js         ← Session storage, role guards, logout
│   ├── ui.js           ← Shared UI helpers (toasts, modals, spinner, formatters)
│   ├── login.js        ← Login page logic
│   ├── admin.js        ← Admin dashboard logic
│   └── search.js       ← Student search logic
│
└── README.md           ← This file
```

---

## How to Run

### Option A — Simplest (recommended for beginners)

1. Open the folder `Webora Project1` in **File Explorer**.
2. Double-click **`index.html`**.

> ⚠️ Some browsers block ES module imports from `file://`. If the page stays blank, use Option B.

### Option B — Python local server (always works)

1. Open a terminal / command prompt inside the `Webora Project1` folder.
2. Run:
   ```bash
   python -m http.server 5500
   ```
3. Open your browser and go to: **http://localhost:5500**

> If `python` is not found, try `python3 -m http.server 5500`

---

## Demo Credentials

| Role          | Email               | Password    |
|---------------|---------------------|-------------|
| Administrator | admin@demo.edu      | Admin@123   |
| Student       | student@demo.edu    | Student@123 |

On the login page there is a **"Use"** button next to each credential — click it to fill the form automatically.
The interface is presented as a **final-year project prototype**. Red is reserved for actual errors and destructive actions; a failed sample document is included to demonstrate status handling.

---

## Page-by-Page User Guide

### Login Page (`index.html`)

1. Enter your email and password.
2. Click **Sign In** (or press Enter).
3. Admins are sent to the Admin Dashboard. Students go to the Search page.
4. Click the eye icon (👁) to show/hide your password.
5. If credentials are wrong, a red error message appears — no page reload.

---

### Admin Dashboard (`admin.html`)

#### Summary Cards
At the top you see four cards: **Total**, **Indexed**, **Processing**, and **Failed** document counts. These update automatically after uploads.

#### Document Table
Lists all uploaded study materials. Columns: Title, File Name, Year, Semester, Subject, Size, Uploaded Date, Status, Actions.

- **Status badges:**  
  - 🟡 **Pending** — just uploaded, waiting to start  
  - 🔵 **Processing** — the backend is reading and indexing the PDF  
  - 🟢 **Indexed** — fully searchable by students  
  - 🔴 **Failed** — something went wrong; click the ⚠ icon to see the error  

- **Filters:** Use the search box and dropdowns (Year, Semester, Subject, Status) to find specific documents. Filters combine — e.g., Year=TE + Subject=Operating Systems.

#### Uploading a Document
1. Click the **"+ Upload Document"** button (top right).
2. **Drag and drop** a PDF onto the dashed box, or click it to browse.
3. The system rejects:
   - Non-PDF files (e.g. `.docx`, `.jpg`) → clear error message.
   - Files larger than **20 MB** → clear error message.
4. Fill in the required fields: **Title**, **Academic Year**, **Semester**, **Subject**.
   - Year and Semester are linked: choosing **SE** only shows Semesters 3 and 4.
5. Click **Upload Document**. A progress bar appears.
6. After upload, the document appears in the table as **Pending**, then automatically moves to **Processing** (~2.5 s) and **Indexed** (~7 s). Watch the Status column update live.

#### Editing Metadata
Click **Edit** on any row → a modal opens with the current values pre-filled → change what you need → **Save Changes**.

#### Deleting a Document
Click **Delete** on any row → a confirmation modal appears with the warning:  
*"This removes the document and its searchable content."*  
Click **Delete Permanently** to confirm. The row disappears from the table and search results immediately.

---

### Student Search Page (`search.html`)

1. Type your question in the large search box, e.g.:  
   *"What is the difference between TCP and UDP?"*
2. Press **Enter** or click **Search**.
3. Use the **Year / Semester / Subject** filters to narrow results to a specific course material.
4. Click **✕ Clear filters** to reset filters.
5. Choose a suggested question to try the sample knowledge base, or press **Ctrl/Cmd + K** to focus the question field.

#### What You'll See

| Situation | What Appears |
|-----------|--------------|
| Match found | An **Answer card** with the full answer, followed by a **Sources** section |
| No match | "The uploaded documents do not provide enough information to answer this question." |
| Server error | An error message with a **Retry** button |
| Empty query | A toast warning to enter a question |

#### Reading the Answer
- The answer contains numbered markers like **[1]**, **[2]** — these link to the source documents below.
- Each source card shows: **Document title — Page N**, a relevance score, and a **Show passage** button.
- Click **Show passage** to see the exact text from the document that supports the answer.
- Matched words are highlighted in yellow.
- Use **Copy with citations** to copy the answer together with its document and page references.

#### Recent Searches
Your last 5 searches appear below the search bar as clickable chips. Click any chip to re-run that search instantly. Clear the question to restore the initial search view and suggested questions.

---

## How Mock Data Works

All sample data lives in `js/mock-data.js`. In Phase 1, no server is needed.

### Sample Documents
There are 10 sample documents pre-loaded:
- Data Structures (FE Sem 2, SE Sem 3)
- DBMS (SE Sem 4)
- Operating Systems, Computer Networks (TE Sem 5)
- Software Engineering, Theory of Computation (TE Sem 6)
- Machine Learning (BE Sem 7)
- Web Technology, Computer Networks Security (BE Sem 8)

One document (Computer Networks Security) has **Failed** status to demonstrate error handling.

### Sample Q&A Knowledge Base
The following questions are answered from the sample data:

| Topic | Example question |
|-------|-----------------|
| Arrays vs Linked Lists | "What is the difference between arrays and linked lists?" |
| Database Normalization | "Explain database normalization and normal forms" |
| CPU Scheduling | "What are CPU process scheduling algorithms?" |
| Deadlock | "What is deadlock and how can it be prevented?" |
| TCP vs UDP | "What is the difference between TCP and UDP?" |
| SDLC Models | "What are the different SDLC models?" |
| Overfitting | "What is overfitting in machine learning?" |
| Stack vs Queue | "What is the difference between a stack and a queue?" |
| Turing Machine | "What is a Turing Machine?" |
| Memory Management | "How does an operating system manage memory?" (different wording match) |

The mock search matches by **keywords** — so asking *"How does the OS handle RAM?"* still finds the memory management answer because it contains synonymous words (`memory`, `os`, `ram`).

If you type a question with **no matching keywords**, you get the no-evidence response.  
If you type a question containing **"error-test"**, a simulated backend error is triggered.

### Simulated Delays
Every mock API call waits **800–1800 ms** to realistically simulate a real server. This is why you see the loading spinner during search.

---

## How to Customise Mock Data

### Adding or Changing Subjects

Open `js/mock-data.js` and find the `SUBJECTS` array near the top:

```javascript
export const SUBJECTS = [
  "Data Structures",
  "Database Management Systems",
  "Operating Systems",
  // ... add your subject here
  "My New Subject",
];
```

The new subject automatically appears in all dropdowns.

### Changing the Year → Semester Map

Open `js/config.js` and edit `YEAR_SEMESTER_MAP`:

```javascript
YEAR_SEMESTER_MAP: {
  FE: [1, 2],   // First Year → Semester 1 and 2
  SE: [3, 4],
  TE: [5, 6],
  BE: [7, 8],
},
```

### Adding Sample Documents

In `js/mock-data.js`, push a new object into `MOCK_DOCUMENTS_SEED`:

```javascript
{
  id: "doc-011",              // must be unique
  title: "Algorithms — Sorting and Searching",
  fileName: "algo_sort_search.pdf",
  year: "SE",
  semester: 3,
  subject: "Algorithms",
  sizeMB: 3.5,
  pages: 120,
  uploadedAt: "2026-10-01T10:00:00Z",
  status: "Indexed",
  errorMsg: null,
},
```

### Adding Q&A Entries

Push a new object into `MOCK_QA`:

```javascript
{
  id: "qa-011",
  keywords: ["sorting", "bubble sort", "merge sort", "quick sort"],
  answer: "Bubble Sort is O(n²) and suitable only for small datasets [1]. Merge Sort is O(n log n) and stable [1].",
  sources: [
    {
      documentId: "doc-011",
      documentTitle: "Algorithms — Sorting and Searching",
      page: 22,
      score: 0.95,
      passage: "Bubble Sort repeatedly swaps adjacent elements if they are in the wrong order..."
    }
  ],
},
```

---

## Phase 2 — Connecting to FastAPI

When the backend is ready, open `js/config.js` and make **two changes**:

```javascript
USE_MOCK: false,                         // ← change from true to false
API_BASE_URL: "http://localhost:8000",   // ← your FastAPI server URL
```

That is the **only change needed**. The `api.js` file automatically uses real HTTP calls.

### Required API Endpoints

Your FastAPI backend must implement these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Body: `{username, password}` → Returns `{token, user:{name, role}}` |
| `GET`  | `/documents` | Query params: `year, semester, subject, status, search` → Returns array of documents |
| `POST` | `/documents` | Multipart form: `file, title, year, semester, subject` → Returns new document record |
| `PUT`  | `/documents/{id}` | Body: `{title?, year?, semester?, subject?}` → Returns updated document |
| `DELETE` | `/documents/{id}` | Returns `204 No Content` |
| `POST` | `/search` | Body: `{query, year?, semester?, subject?}` → Returns `{status, answer?, sources?}` |

All endpoints except `/auth/login` require an `Authorization: Bearer <token>` header.

### Expected Response Formats

**Document object:**
```json
{
  "id": "abc123",
  "title": "Operating Systems Notes",
  "fileName": "os_notes.pdf",
  "year": "TE",
  "semester": 5,
  "subject": "Operating Systems",
  "sizeMB": 4.2,
  "pages": 180,
  "uploadedAt": "2026-07-15T08:45:00Z",
  "status": "Indexed",
  "errorMsg": null
}
```

**Search response (match found):**
```json
{
  "status": "ok",
  "answer": "Deadlock occurs when... [1]",
  "sources": [
    {
      "document_id": "abc123",
      "document_title": "Operating Systems Notes",
      "page": 98,
      "passage": "Deadlock is a state where...",
      "score": 0.96
    }
  ]
}
```

**Search response (no match):**
```json
{ "status": "no_evidence" }
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Page is blank / scripts don't load | Use `python -m http.server 5500` instead of double-clicking index.html |
| "Module not found" error in console | Make sure all files are in the correct folder; do not rename JS files |
| Login says "Invalid credentials" | Use exactly `admin@demo.edu` / `Admin@123` or `student@demo.edu` / `Student@123` |
| Student opening admin.html shows "Access Denied" | This is correct behaviour — students are not allowed in the admin area |
| Upload progress stays at 0% | Make sure you selected a `.pdf` file under 20 MB |
| Search always shows "No Evidence" | The mock data only covers the topics listed in the Q&A table above |
| Session lost on page refresh | This is expected — the app uses `sessionStorage`. Log in again. |
| Status doesn't change to Indexed | Wait ~7 seconds after upload; the status updates automatically |

---

## Self-Test Checklist

Run through these checks manually to verify everything works correctly.

### Admin Tests

- [ ] **1. Valid PDF upload**  
  Log in as admin → Click "Upload Document" → Select any `.pdf` file under 20 MB → Fill in Title, Year, Semester, Subject → Click Upload.  
  ✅ Expected: Progress bar fills to 100%. Status shows **Pending** → **Processing** (after ~2.5 s) → **Indexed** (after ~7 s). Stats cards update.

- [ ] **2. Invalid file rejection**  
  Try uploading a `.docx` or `.jpg` file.  
  ✅ Expected: Error message "Only PDF files are accepted."  
  Try uploading a PDF over 20 MB (you can rename a large file to `.pdf`).  
  ✅ Expected: Error message showing the file's size and the 20 MB limit.

- [ ] **6. Student blocked from admin page**  
  Log out → Log in as student → Manually type `http://localhost:5500/admin.html` in the address bar.  
  ✅ Expected: Redirected to "Access Denied" page immediately.

- [ ] **7. Delete a document**  
  Log in as admin → Click Delete on any Indexed document → Confirm deletion.  
  ✅ Expected: Row removed from table. Log in as student → Search a question about that document's subject.  
  ✅ Expected: That document no longer appears as a source.

- [ ] **8. Failed document visible**  
  In the document table, find "Computer Networks — Network Security Protocols" (status: Failed).  
  ✅ Expected: Red "Failed" badge. Click the ⚠ icon to see the error message. The rest of the app works normally.

### Student Tests

- [ ] **3. Known question → correct answer**  
  Log in as student → Search: *"What is the difference between TCP and UDP?"*  
  ✅ Expected: Answer card appears. Source shows "Computer Networks — TCP/IP Protocol Suite — Page 78".

- [ ] **4. Different wording → still matches**  
  Search: *"How does the OS handle RAM and memory?"*  
  ✅ Expected: Finds the memory management answer from Operating Systems notes (keyword synonyms: `os`, `ram`, `memory`).

- [ ] **5. No-evidence response**  
  Search: *"What is quantum computing?"*  
  ✅ Expected: Shows exactly "The uploaded documents do not provide enough information to answer this question."  
  ✅ Expected: No invented sources are shown.

- [ ] **9. Subject filter respected**  
  Search *"data structures"* without filters → see sources from Data Structures documents.  
  Now set Subject filter to **"Operating Systems"** → Search again.  
  ✅ Expected: No Data Structures source appears in results.

- [ ] **10. Empty query and error states**  
  Click Search with an empty box.  
  ✅ Expected: Toast warning "Please enter a question before searching."  
  Search the text: *"error-test"*  
  ✅ Expected: Error message appears with a **Retry** button. Clicking Retry runs the search again.
