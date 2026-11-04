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

```text
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
