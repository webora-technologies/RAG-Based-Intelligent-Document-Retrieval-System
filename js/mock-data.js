/**
 * mock-data.js — All sample data and mock API implementations for Phase 1.
 *
 * NOTE: SUBJECTS now lives in config.js so production builds don't pull in
 * demo credentials just to render a dropdown.
 */
import { CONFIG } from "./config.js";
import { DOC_EXTRAS, KB_EXTRA, DEFAULT_UNIVERSITY, DEFAULT_DEPARTMENT } from "./knowledge.js";

/* ════════════════════════════════════════
   DEMO USERS
════════════════════════════════════════ */

export const MOCK_USERS = [
  {
    username: "admin@demo.edu",
    password: "Admin@123",
    token: "mock.jwt.admin.header.payload.signature",
    user: { name: "Dr. Priya Sharma", role: "admin" },
  },
  {
    username: "student@demo.edu",
    password: "Student@123",
    token: "mock.jwt.student.header.payload.signature",
    user: { name: "Rahul Verma", role: "student" },
  },
];

/* ════════════════════════════════════════
   SAMPLE DOCUMENTS
════════════════════════════════════════ */

export const MOCK_DOCUMENTS_SEED = [
  {
    id: "doc-001",
    title: "Data Structures and Algorithms — Complete Notes",
    fileName: "ds_algorithms_complete.pdf",
    year: "SE", semester: 3, subject: "Data Structures",
    sizeMB: 4.2, pages: 180, uploadedAt: "2026-07-10T09:30:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-002",
    title: "Database Management Systems — Unit 1–5",
    fileName: "dbms_full_notes.pdf",
    year: "SE", semester: 4, subject: "Database Management Systems",
    sizeMB: 3.8, pages: 145, uploadedAt: "2026-07-12T11:00:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-003",
    title: "Operating Systems — Processes and Memory Management",
    fileName: "os_processes_memory.pdf",
    year: "TE", semester: 5, subject: "Operating Systems",
    sizeMB: 5.1, pages: 210, uploadedAt: "2026-07-15T08:45:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-004",
    title: "Computer Networks — TCP/IP Protocol Suite",
    fileName: "cn_tcpip_protocol.pdf",
    year: "TE", semester: 5, subject: "Computer Networks",
    sizeMB: 6.3, pages: 255, uploadedAt: "2026-07-18T14:20:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-005",
    title: "Software Engineering — SDLC and Agile Models",
    fileName: "se_sdlc_agile.pdf",
    year: "TE", semester: 6, subject: "Software Engineering",
    sizeMB: 2.9, pages: 120, uploadedAt: "2026-08-01T10:10:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-006",
    title: "Machine Learning — Supervised and Unsupervised Learning",
    fileName: "ml_supervised_unsupervised.pdf",
    year: "BE", semester: 7, subject: "Machine Learning",
    sizeMB: 8.7, pages: 320, uploadedAt: "2026-08-05T09:00:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-007",
    title: "Theory of Computation — Automata and Formal Languages",
    fileName: "toc_automata_formal.pdf",
    year: "TE", semester: 6, subject: "Theory of Computation",
    sizeMB: 3.4, pages: 140, uploadedAt: "2026-08-08T16:30:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-008",
    title: "Web Technology — HTML, CSS, JavaScript and REST APIs",
    fileName: "webtech_fullstack.pdf",
    year: "BE", semester: 8, subject: "Web Technology",
    sizeMB: 5.6, pages: 230, uploadedAt: "2026-08-10T12:00:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-009",
    title: "Computer Networks — Network Security Protocols",
    fileName: "cn_security_notes.pdf",
    year: "BE", semester: 8, subject: "Computer Networks",
    sizeMB: 4.0, pages: 160, uploadedAt: "2026-09-01T07:55:00Z",
    status: "Failed",
    errorMsg: "Indexing failed: PDF contains scanned images only. Please upload a text-searchable PDF.",
  },
  {
    id: "doc-010",
    title: "Data Structures — Linked Lists and Trees",
    fileName: "ds_linked_trees.pdf",
    year: "FE", semester: 2, subject: "Data Structures",
    sizeMB: 2.1, pages: 88, uploadedAt: "2026-09-05T13:45:00Z",
    status: "Indexed", errorMsg: null,
  },
  {
    id: "doc-011",
    title: "Operating Systems — Practice Question Bank",
    fileName: "os_question_bank.pdf",
    year: "TE", semester: 5, subject: "Operating Systems",
    sizeMB: 3.1, pages: 64, uploadedAt: "2026-09-08T10:20:00Z",
    status: "Processing", errorMsg: null,
  },
];

/* ════════════════════════════════════════
   SAMPLE Q&A KNOWLEDGE BASE
════════════════════════════════════════ */

export const MOCK_QA = [
  {
    id: "qa-001",
    keywords: ["array", "arrays", "linked list", "linked lists",
      "array vs linked list", "difference between array and linked list"],
    answer:
      "Arrays store elements in contiguous memory locations and allow O(1) random access by index, but insertion and deletion are O(n) because elements must be shifted [1]. Linked lists store nodes where each holds data and a pointer to the next node; insertion/deletion at a known position is O(1) but traversal is O(n) [1][2]. Use arrays for frequent random access; use linked lists for frequent insertion and deletion.",
    sources: [
      {
        documentId: "doc-001", documentTitle: "Data Structures and Algorithms — Complete Notes",
        page: 12, score: 0.97,
        passage: "An array stores elements at contiguous memory locations, enabling O(1) access by index. Inserting or deleting an element requires shifting subsequent elements, giving O(n) worst-case complexity. Dynamic arrays reallocate memory when capacity is exceeded."
      },
      {
        documentId: "doc-010", documentTitle: "Data Structures — Linked Lists and Trees",
        page: 5, score: 0.93,
        passage: "A linked list is a sequence of nodes, each holding a value and a pointer to the next node. Unlike arrays, nodes need not be contiguous. Insertion and deletion at a known position are O(1). However, searching from the head is O(n) since there is no index-based access."
      },
    ],
  },
  {
    id: "qa-002",
    keywords: ["normalization", "1nf", "2nf", "3nf", "bcnf",
      "database normalization", "normal form", "functional dependency",
      "anomaly", "redundancy in database"],
    answer:
      "Database normalization is the process of structuring a relational database to reduce redundancy and prevent data anomalies [1]. The key normal forms are: 1NF — all column values must be atomic; 2NF — no partial dependency on a composite primary key; 3NF — no transitive dependency on the primary key; BCNF — every functional dependency has a superkey as its determinant [1]. Higher normalization reduces anomalies but can increase the number of joins needed for queries.",
    sources: [
      {
        documentId: "doc-002", documentTitle: "Database Management Systems — Unit 1–5",
        page: 67, score: 0.96,
        passage: "Normalization is a systematic approach for decomposing relations to eliminate redundancy and undesirable anomalies. 1NF requires atomic attribute values. 2NF eliminates partial dependencies — every non-key attribute must depend on the whole primary key. 3NF removes transitive dependencies. BCNF is a stronger form of 3NF where every determinant is a candidate key."
      },
    ],
  },
  {
    id: "qa-003",
    keywords: ["cpu scheduling", "process scheduling", "scheduling algorithm",
      "round robin", "fcfs", "sjf", "priority scheduling",
      "preemptive", "shortest job", "cpu scheduler"],
    answer:
      "CPU scheduling algorithms determine which process runs on the CPU and for how long [1]. Common algorithms include: FCFS (First-Come First-Served) — non-preemptive, processes run in arrival order, simple but may cause long waiting times for short processes; SJF (Shortest Job First) — schedules the process with the smallest CPU burst, optimal for average waiting time; Round Robin — each process gets a fixed time quantum and cycles through the ready queue, fair for time-sharing; Priority Scheduling — the highest-priority process runs first, can be preemptive [1].",
    sources: [
      {
        documentId: "doc-003", documentTitle: "Operating Systems — Processes and Memory Management",
        page: 45, score: 0.95,
        passage: "CPU scheduling is the basis of multiprogrammed OSes. The scheduler selects from the ready queue. FCFS dispatches processes in arrival order — simple but suffers from the convoy effect. SJF minimises average waiting time but requires knowing burst times in advance. Round-Robin assigns a time quantum (typically 10–100 ms) and is widely used in interactive systems. Priority scheduling associates a priority with each process; the CPU is allocated to the highest-priority ready process."
      },
    ],
  },
  {
    id: "qa-004",
    keywords: ["deadlock", "deadlock prevention", "deadlock detection",
      "deadlock avoidance", "banker algorithm", "bankers algorithm",
      "circular wait", "hold and wait", "coffman conditions",
      "necessary conditions deadlock", "resource allocation deadlock"],
    answer:
      "A deadlock is a state where a set of processes are permanently blocked, each waiting for a resource held by another [1]. The four Coffman necessary conditions are: (1) Mutual Exclusion — at least one resource is non-shareable; (2) Hold and Wait — a process holds resources while waiting for more; (3) No Preemption — resources cannot be forcibly taken; (4) Circular Wait — a circular chain of waiting processes exists [1]. Prevention eliminates one condition; avoidance (Banker's Algorithm) ensures the system stays in a safe state; detection allows deadlocks and then recovers by aborting or preempting processes.",
    sources: [
      {
        documentId: "doc-003", documentTitle: "Operating Systems — Processes and Memory Management",
        page: 98, score: 0.98,
        passage: "Deadlock occurs when a set of processes is blocked in a circular dependency of resource requests. Coffman (1971) identified four necessary conditions: Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. All four must hold simultaneously for deadlock to occur. The Banker's Algorithm checks whether granting a resource request leaves the system in a safe state — one from which all processes can eventually complete."
      },
    ],
  },
  {
    id: "qa-005",
    keywords: ["tcp", "udp", "tcp vs udp", "difference tcp udp",
      "transmission control protocol", "user datagram protocol",
      "connection oriented", "connectionless", "reliable transport",
      "three way handshake", "syn ack"],
    answer:
      "TCP (Transmission Control Protocol) is connection-oriented and guarantees reliable, ordered, error-checked delivery using acknowledgements and retransmissions [1]. It establishes a connection via a three-way handshake (SYN → SYN-ACK → ACK) and provides flow and congestion control. UDP (User Datagram Protocol) is connectionless — it sends datagrams without guaranteeing delivery, ordering, or error recovery, but has significantly lower overhead [1]. TCP is used for web browsing, file transfer, and email; UDP is preferred for real-time applications like DNS lookups, video streaming, VoIP, and online gaming.",
    sources: [
      {
        documentId: "doc-004", documentTitle: "Computer Networks — TCP/IP Protocol Suite",
        page: 78, score: 0.97,
        passage: "TCP provides reliable, ordered byte-stream delivery. Before data transfer begins a connection is established via the three-way handshake. TCP uses sequence numbers, acknowledgements, and retransmission to ensure reliability. It also implements sliding-window flow control and congestion control algorithms such as slow start and AIMD. UDP omits these mechanisms entirely: it simply prepends a short header (source port, destination port, length, checksum) and sends the datagram, making it much faster but unreliable."
      },
    ],
  },
  {
    id: "qa-006",
    keywords: ["sdlc", "software development life cycle",
      "waterfall model", "agile model", "spiral model", "v model",
      "incremental model", "software process", "software lifecycle",
      "agile vs waterfall"],
    answer:
      "The Software Development Life Cycle (SDLC) is a structured process for planning, creating, testing, and maintaining software [1]. Key models include: Waterfall — sequential phases (Requirements → Design → Implementation → Testing → Maintenance), rigid, best for stable requirements; Agile — iterative short sprints, working software delivered frequently, embraces changing requirements; Spiral — iterative with explicit risk analysis at each loop, suited for large/high-risk projects; V-Model — each development phase is mirrored by a testing phase [1]. Agile (Scrum, Kanban) dominates modern industry; Waterfall is used in regulated domains like aviation and healthcare.",
    sources: [
      {
        documentId: "doc-005", documentTitle: "Software Engineering — SDLC and Agile Models",
        page: 18, score: 0.95,
        passage: "The Waterfall model requires each phase to be fully complete before the next begins. Its simplicity makes it easy to manage, but it is inflexible when requirements change. Agile methodologies, codified in the 2001 Agile Manifesto, prioritise working software, customer collaboration, and responding to change over rigid planning. In Scrum, development is divided into Sprints of 2-4 weeks, each delivering a potentially shippable increment. The Spiral model was proposed by Boehm (1988) and adds risk analysis as a first-class activity in each iteration."
      },
    ],
  },
  {
    id: "qa-007",
    keywords: ["overfitting", "underfitting", "generalization",
      "bias variance", "regularization", "regularisation",
      "overfit", "dropout", "cross validation", "training error",
      "model performance", "machine learning model"],
    answer:
      "Overfitting occurs when a model learns the training data too well — including its noise — and fails to generalise to unseen examples [1]. It is characterised by low training error but high test error (high variance). Techniques to prevent overfitting include: L2 Regularisation (Ridge) / L1 (Lasso) — penalise large model weights; Dropout — randomly deactivates neurons during training in neural networks; Cross-Validation — evaluates generalisation across multiple train/test splits; Early Stopping — halts training when validation loss stops improving; increasing training data size [1]. Underfitting (high bias) is the opposite problem — the model is too simple to capture the underlying pattern.",
    sources: [
      {
        documentId: "doc-006", documentTitle: "Machine Learning — Supervised and Unsupervised Learning",
        page: 112, score: 0.96,
        passage: "Overfitting refers to a model that fits the training data so closely that it captures noise rather than the true signal, degrading performance on new data. The bias-variance tradeoff formalises this: high-variance models overfit; high-bias models underfit. L2 regularisation adds a penalty term λ‖w‖² to the loss function, shrinking weights towards zero. L1 regularisation promotes sparsity. Dropout (Srivastava et al., 2014) randomly sets activations to zero with probability p during training, preventing neurons from co-adapting."
      },
    ],
  },
  {
    id: "qa-008",
    keywords: ["stack", "queue", "push", "pop", "lifo", "fifo",
      "stack vs queue", "stack and queue", "difference stack queue"],
    answer:
      "A stack is a Last-In First-Out (LIFO) data structure — the most recently inserted element is the first removed, accessed via push (insert) and pop (remove) operations [1]. A queue is First-In First-Out (FIFO) — the oldest element is removed first, using enqueue (insert at rear) and dequeue (remove from front) [1]. Stacks are used in function call management, expression evaluation (postfix), undo mechanisms, and DFS. Queues are used in process scheduling, breadth-first search, and print spooling.",
    sources: [
      {
        documentId: "doc-001", documentTitle: "Data Structures and Algorithms — Complete Notes",
        page: 55, score: 0.94,
        passage: "A stack is an abstract data type supporting two primary operations: push, which adds an element to the top, and pop, which removes the top element. The LIFO property means the last element pushed is the first popped. A queue supports enqueue (add to rear) and dequeue (remove from front), giving FIFO behaviour. Both can be implemented using arrays or linked lists."
      },
    ],
  },
  {
    id: "qa-009",
    keywords: ["turing machine", "automata", "finite automaton",
      "dfa", "nfa", "context free grammar", "pushdown automaton",
      "regular language", "chomsky hierarchy", "decidable",
      "computability"],
    answer:
      "A Turing Machine (TM) is a mathematical model of computation proposed by Alan Turing in 1936 [1]. It consists of an infinite tape, a read/write head, a finite set of states, and a transition function. The TM reads a symbol, optionally writes a new symbol, moves the head left or right, and changes state. Turing Machines define the class of Turing-recognisable (recursively enumerable) and Turing-decidable (recursive) languages — the most powerful level of the Chomsky hierarchy [1]. The Church–Turing thesis asserts that any effectively computable function can be computed by a TM.",
    sources: [
      {
        documentId: "doc-007", documentTitle: "Theory of Computation — Automata and Formal Languages",
        page: 89, score: 0.95,
        passage: "A Turing Machine M = (Q, Σ, Γ, δ, q₀, q_accept, q_reject) consists of a set of states Q, an input alphabet Σ, a tape alphabet Γ ⊇ Σ ∪ {B}, a transition function δ: Q×Γ → Q×Γ×{L,R}, a start state q₀, and two halting states. The TM halts in q_accept if the input is in the language, q_reject otherwise. The class of languages decided by TMs is the class of recursive languages; the class recognised (but not necessarily decided) is the class of recursively enumerable languages."
      },
    ],
  },
  {
    id: "qa-010",
    keywords: ["memory management", "paging", "segmentation",
      "virtual memory", "page fault", "page table",
      "how os manages memory", "how computer manages ram",
      "demand paging", "frame", "logical address"],
    answer:
      "Operating systems manage memory to isolate processes, maximise utilisation, and allow programs larger than physical RAM to run [1]. Key mechanisms are: Paging — physical memory is split into fixed-size frames; logical memory into pages of the same size; a page table maps page numbers to frame numbers. Virtual Memory — only active pages need to be in RAM; inactive pages reside on disk (swap space). Page Fault — occurs when a referenced page is not in RAM; the OS loads it from disk (demand paging) [1]. Segmentation divides memory into variable-size logical segments (code, stack, heap). Modern OSes typically combine paging with segmentation.",
    sources: [
      {
        documentId: "doc-003", documentTitle: "Operating Systems — Processes and Memory Management",
        page: 130, score: 0.93,
        passage: "Paging eliminates the requirement for contiguous physical memory allocation. The physical memory is partitioned into fixed-size blocks called frames; the logical address space is divided into pages of the same size. The OS maintains a page table per process that maps logical page numbers to physical frame numbers. If a process accesses a page whose present bit is 0, a page fault interrupt occurs and the OS page-fault handler loads the required page from secondary storage into a free frame."
      },
    ],
  },
];

/* ════════════════════════════════════════
   INTERNAL HELPERS
════════════════════════════════════════ */

/** Simulate network latency 800–1800 ms. */
function _delay() {
  return new Promise((r) => setTimeout(r, 800 + Math.random() * 1000));
}

/**
 * Persist documents in the browser (localStorage), so documents uploaded by the
 * admin stay available to students on the same browser and after sign-out.
 * Silently no-ops when storage is unavailable; the demo then keeps data in memory.
 */
let _memDocs = null;
function _saveDocs(docs) {
  _memDocs = docs;
  try {
    localStorage.setItem(CONFIG.SESSION_KEYS.DOCUMENTS, JSON.stringify(docs));
  } catch (_) { /* storage unavailable: in-memory only */ }
}

/** Make sure every document has the fields the newer screens need. */
function _normalizeDoc(d) {
  const x = DOC_EXTRAS[d.id] || {};
  if (!d.university) d.university = x.university || DEFAULT_UNIVERSITY;
  if (!d.department) d.department = x.department || DEFAULT_DEPARTMENT;
  if (!Array.isArray(d.chapters)) {
    d.chapters = (x.chapters || []).map(([no, name, from, to]) => ({ no, name, from, to }));
  }
  return d;
}

/** Read documents (seeded on first call). */
function _getDocs() {
  let docs = null;
  try {
    const raw = localStorage.getItem(CONFIG.SESSION_KEYS.DOCUMENTS);
    if (raw) docs = JSON.parse(raw);
  } catch (_) { }
  if (!docs) docs = _memDocs;
  if (!docs) {
    docs = JSON.parse(JSON.stringify(MOCK_DOCUMENTS_SEED));
  }
  docs.forEach(_normalizeDoc);
  if (!_memDocs) _saveDocs(docs);
  return docs;
}

/** Chapter that contains a given page of a document, or null. */
export function chapterFor(doc, page) {
  const c = (doc.chapters || []).find((ch) => page >= ch.from && page <= ch.to);
  return c ? { no: c.no, name: c.name } : null;
}

/**
 * Word-boundary keyword match — prevents short keywords like "os" from
 * matching inside longer words like "cost" or "closed".
 * Multi-word phrases ("linked list") still match as phrases.
 */
function _kwMatches(text, kw) {
  const escaped = kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?:^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u").test(text);
}

/* ════════════════════════════════════════
   MOCK API FUNCTIONS
════════════════════════════════════════ */

export async function mockLogin(username, password) {
  await _delay();
  const account = MOCK_USERS.find(
    (u) => u.username === username && u.password === password
  );
  if (!account) throw new Error("Invalid email or password. Please check your credentials.");
  return { token: account.token, user: account.user };
}

export async function mockListDocuments(filters = {}) {
  await _delay();
  let docs = _getDocs();
  if (filters.year) docs = docs.filter((d) => d.year === filters.year);
  if (filters.semester) docs = docs.filter((d) => d.semester === Number(filters.semester));
  if (filters.subject) docs = docs.filter((d) => d.subject === filters.subject);
  if (filters.status) docs = docs.filter((d) => d.status === filters.status);
  if (filters.university) docs = docs.filter((d) => d.university === filters.university);
  if (filters.department) docs = docs.filter((d) => d.department === filters.department);
  if (filters.document_id) docs = docs.filter((d) => d.id === filters.document_id);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    docs = docs.filter((d) => d.title.toLowerCase().includes(q));
  }
  return docs;
}

export async function mockUploadDocument(file, metadata, onProgress) {
  /* Simulate chunked upload progress */
  for (let pct = 0; pct <= 100; pct += 10) {
    await new Promise((r) => setTimeout(r, 130));
    onProgress(pct);
  }

  const newDoc = {
    id: "doc-" + Date.now(),
    title: metadata.title,
    fileName: file.name,
    year: metadata.year,
    semester: Number(metadata.semester),
    subject: metadata.subject,
    university: metadata.university || DEFAULT_UNIVERSITY,
    department: metadata.department || DEFAULT_DEPARTMENT,
    sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(2)),
    pages: Math.floor(Math.random() * 150) + 30,
    uploadedAt: new Date().toISOString(),
    status: "Pending",
    errorMsg: null,
  };
  /* Optional chapter names: spread them evenly over the pages of the document */
  const names = (metadata.chapterNames || []).filter(Boolean);
  if (names.length) {
    const step = Math.max(1, Math.ceil(newDoc.pages / names.length));
    newDoc.chapters = names.map((name, i) => ({
      no: i + 1, name,
      from: i * step + 1,
      to: i === names.length - 1 ? newDoc.pages : (i + 1) * step,
    }));
  } else {
    newDoc.chapters = [];
  }

  const docs = _getDocs();
  docs.unshift(newDoc);
  _saveDocs(docs);

  /* → Processing after 2.5 s */
  setTimeout(() => {
    const d = _getDocs();
    const r = d.find((x) => x.id === newDoc.id);
    if (r) { r.status = "Processing"; _saveDocs(d); }
    document.dispatchEvent(new CustomEvent("rag:statusChange", { detail: { id: newDoc.id, status: "Processing" } }));
  }, 2500);

  /* → Indexed after 7 s */
  setTimeout(() => {
    const d = _getDocs();
    const r = d.find((x) => x.id === newDoc.id);
    if (r) { r.status = "Indexed"; _saveDocs(d); }
    document.dispatchEvent(new CustomEvent("rag:statusChange", { detail: { id: newDoc.id, status: "Indexed" } }));
  }, 7000);

  return newDoc;
}

export async function mockUpdateDocument(id, metadata) {
  await _delay();
  const docs = _getDocs();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx === -1) throw new Error("Document not found.");
  Object.assign(docs[idx], metadata);
  _saveDocs(docs);
  return docs[idx];
}

export async function mockDeleteDocument(id) {
  await _delay();
  let docs = _getDocs();
  const before = docs.length;
  docs = docs.filter((d) => d.id !== id);
  if (docs.length === before) throw new Error("Document not found.");
  _saveDocs(docs);
}

/* ════════════════════════════════════════
   SEARCH (sample data only)
════════════════════════════════════════ */

const KB = [...MOCK_QA, ...KB_EXTRA];
const SEED_IDS = new Set(MOCK_DOCUMENTS_SEED.map((d) => d.id));

const STOP = new Set(("the a an and or of to in on for with by is are was were be been what which who whom whose when where why how " +
  "does do did can could should would will shall may might must this that these those it its as at from into about between " +
  "explain describe define compare difference differences tell me please give example examples vs versus use used using " +
  "your you our their there here than then also any some more most such very like just").split(" "));

function _stem(w) {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 6 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("es")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function _tokens(text) {
  return text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w)).map(_stem);
}

let _kbIndex = null;
function _index() {
  if (_kbIndex) return _kbIndex;
  _kbIndex = KB.map((qa) => ({
    qa,
    kwTokens: new Set(qa.keywords.flatMap((k) => _tokens(k))),
    textTokens: new Set(_tokens(qa.answer + " " + qa.sources.map((s) => s.passage).join(" "))),
  }));
  return _kbIndex;
}

function _score(entry, lq, qTokens) {
  const phrase = entry.qa.keywords.filter((kw) => _kwMatches(lq, kw)).length;
  let kwTok = 0, txt = 0;
  qTokens.forEach((t) => {
    if (entry.kwTokens.has(t)) kwTok++;
    else if (entry.textTokens.has(t)) txt++;
  });
  return { phrase, kwTok, score: phrase * 3 + kwTok * 1.5 + txt * 0.5 };
}

/** First sentence of an answer (keeps its [n] marker). */
function _firstSentence(text) {
  const abbr = /(?:e\.g|i\.e|vs|etc)$/i;
  const re = /\.(?=\s|$)/g;
  let m;
  while ((m = re.exec(text))) {
    const before = text.slice(0, m.index);
    if (abbr.test(before)) continue;
    const end = m.index + 1;
    let s = text.slice(0, end);
    if (text[end] === "[") continue;
    return s.length > 280 ? s.slice(0, s.lastIndexOf(" ", 280)) + "…" : s;
  }
  return text;
}

function _variants(medium, sources) {
  const short = _firstSentence(medium);
  const detail = sources.map((s, i) => `${s.passage} [${i + 1}]`).join(" ");
  return {
    short,
    medium,
    detailed: `${medium}\n\nIn more detail, the source material explains: ${detail}`,
  };
}

function _docSummary(d) {
  return {
    id: d.id, title: d.title, subject: d.subject, year: d.year, semester: d.semester,
    university: d.university, department: d.department, pages: d.pages,
    chapters: (d.chapters || []).length,
  };
}

export async function mockSearch(params) {
  await _delay();
  const { query, year, semester, subject, university, department, document_id, chapter } = params;

  /* Simulated backend error */
  if (query.toLowerCase().includes("error-test")) {
    throw new Error(
      "Simulated backend error: the retrieval service is temporarily unavailable. Please try again later."
    );
  }

  const lq = query.toLowerCase();
  const qTokens = [...new Set(_tokens(query))];
  const indexed = _getDocs().filter((d) => d.status === "Indexed");
  const byId = Object.fromEntries(indexed.map((d) => [d.id, d]));
  const filtersActive = Boolean(year || semester || subject || university || department || document_id || chapter);

  const docPasses = (d) =>
    (!year || d.year === year) &&
    (!semester || d.semester === Number(semester)) &&
    (!subject || d.subject === subject) &&
    (!university || d.university === university) &&
    (!department || d.department === department) &&
    (!document_id || d.id === document_id);

  const srcPasses = (s) => {
    const d = byId[s.documentId];
    if (!d || !docPasses(d)) return false;
    if (chapter) {
      const c = chapterFor(d, s.page);
      if (!c || c.no !== Number(chapter)) return false;
    }
    return true;
  };

  /* Rank every sample entry against the question (phrases + word overlap) */
  const ranked = _index()
    .map((e) => ({ e, s: _score(e, lq, qTokens) }))
    .filter((x) => x.s.score >= 3 && (x.s.phrase > 0 || x.s.kwTok >= 2))
    .sort((a, b) => b.s.score - a.s.score);

  for (const { e } of ranked.slice(0, 4)) {
    const kept = e.qa.sources
      .map((s, i) => ({ s, orig: i + 1 }))
      .filter(({ s }) => srcPasses(s));
    if (!kept.length) continue;

    /* Renumber the [n] markers so they match the sources that remain */
    const remap = new Map(kept.map(({ orig }, i) => [orig, i + 1]));
    const medium = e.qa.answer
      .replace(/\[(\d+)\]/g, (_, n) => (remap.has(Number(n)) ? `[${remap.get(Number(n))}]` : ""))
      .replace(/\s+([.,;])/g, "$1");

    const sources = kept.map(({ s }) => {
      const d = byId[s.documentId];
      const c = chapterFor(d, s.page);
      return {
        document_id: s.documentId, document_title: s.documentTitle,
        subject: d.subject, year: d.year, semester: d.semester,
        university: d.university, department: d.department,
        chapter_no: c ? c.no : null, chapter_name: c ? c.name : null,
        page: s.page, passage: s.passage, score: s.score,
      };
    });
    const answers = _variants(medium, sources);
    return { status: "ok", answer: answers.medium, answers, sources };
  }

  /* No answer in the sample material: look for newly uploaded documents by title and subject */
  if (!ranked.length) {
    const matches = indexed
      .filter((d) => !SEED_IDS.has(d.id) && docPasses(d))
      .filter((d) => {
        const t = new Set(_tokens(d.title + " " + d.subject));
        return qTokens.some((x) => t.has(x));
      });
    if (matches.length) return { status: "documents_only", documents: matches.map(_docSummary) };
  }

  return { status: "no_evidence", filtered: ranked.length > 0 && filtersActive };
}
