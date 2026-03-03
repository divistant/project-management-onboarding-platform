## **1\) Ringkasan Produk**

**Nama (working title):** PM Onboarding Platform (AIDLC PM Assistant)  
 **Tujuan:** Mengubah dokumen proyek (BRD/PRD/FSD/dll) menjadi:

* **Wiki/Knowledge Base** terstruktur

* **Backlog/Task/Todo** terstruktur (epic/feature/story/task)

* **Compliance setup** yang terstandar (template \+ checklist \+ approval)

* Lalu **(setelah review)** bisa “di-push” ke **GitLab** (dan nanti PM tools lain)

**Masalah yang diselesaikan:**

* Inisiasi proyek di GitLab/PM tool itu repetitif: buat project, struktur issue, wiki, label, milestone.

* Standar compliance tidak jelas / tidak konsisten antar proyek.

* Dokumen tersebar (SharePoint, PDF scan) dan butuh proses ekstraksi \+ kurasi.

**Output utama demo FE:**

* Pengguna bisa upload/link dokumen → lihat hasil extract → mapping ke struktur proyek → review/approve → “Generate” (simulasi).

---

## **2\) Sasaran Demo FE**

**Sasaran yang harus terlihat jelas di demo:**

1. **Intake dokumen** (Upload \+ Connect SharePoint “dummy”)

2. **Pipeline status** (Extract → Enrich → Draft output)

3. **Review & edit** hasil AI (wiki outline, backlog, compliance map)

4. **Compliance Gate** (checklist \+ approval)

5. **Generate ke GitLab** (simulasi: preview payload \+ success screen)

6. **Audit trail** minimal (siapa approve apa, kapan)

**Out of scope demo FE (untuk menghindari melebar):**

* OCR real, parsing real, training model, integrasi GitLab real (cukup mock).

* Workflow approval kompleks multi-tenant, multi-legal entity.

* RBAC granular per field (cukup per fitur/menu).

---

## **3\) Persona & Hak Akses (RBAC untuk demo)**

1. **Project Owner / PM**

   * Buat “Onboarding Request”, upload/link dokumen

   * Review draft, edit, submit compliance gate, trigger generate

2. **Solution Architect / Tech Lead**

   * Review backlog structure, technical scope, acceptance criteria

   * Approve “Quality/Verify”

3. **Compliance Officer**

   * Review mapping compliance, checklist, risk classification

   * Approve “Compliance Gate”

4. **Admin**

   * Atur template, integrasi, repository rules, standar compliance

**Minimum roles untuk demo:** PM \+ Compliance \+ Admin (Tech Lead optional).

---

## **4\) User Journey (End-to-End)**

### **Journey A — Create onboarding dari dokumen**

1. PM klik **New Onboarding**

2. Pilih sumber dokumen:

   * Upload file (PDF/DOCX/XLSX)

   * Connect SharePoint (pilih folder/file) *mock*

3. Sistem menampilkan **Processing Pipeline**

4. Setelah selesai: tampil **Draft outputs**

   * Wiki outline \+ section mapping (BRD/PRD/FSD)

   * Backlog tree (Epic → Feature → Story → Task)

   * Compliance mapping \+ checklist

5. PM lakukan review/edit → **Submit for Gate**

6. Compliance Officer approve → Tech Lead approve (opsional)

7. PM klik **Generate** → pilih target (GitLab) → Success \+ summary

---

## **5\) Information Architecture (Menu & Fitur)**

### **Sidebar utama (demo-ready)**

1. **Dashboard**

   * KPI cards: Onboarding in progress, Awaiting approval, Generated projects

   * Recent activity (audit trail)

2. **Onboarding Requests**

   * List \+ filter status (Draft / Processing / Review / Gate / Ready / Generated / Failed)

   * Create new onboarding

3. **Workspace / Project Draft (detail onboarding)**

   * **Documents**

   * **Extracted Content (Markdown Viewer)**

   * **Wiki Draft**

   * **Backlog Draft**

   * **Compliance**

   * **Review & Approvals**

   * **Generate**

4. **Templates & Standards (Admin)**

   * Template backlog, wiki structure, label/milestone rules, compliance checklist template

5. **Integrations (Admin)**

   * GitLab (mock), “future tools” (Jira, Azure DevOps, Trello) sebagai placeholder

6. **Audit Log**

   * Event list: upload, edit, approve, generate

---

## **6\) Screen-by-Screen Requirements (Demo FE)**

### **6.1 Dashboard**

**Komponen:**

* Cards: Total Requests, In Review, Awaiting Gate, Generated

* Table: Recent Requests (Name, Owner, Status, Updated)

* Activity feed (last 20 events)

**Acceptance criteria:**

* Bisa klik request dari dashboard → masuk detail.

---

### **6.2 Onboarding Requests List**

**Komponen:**

* Search \+ filter: status, owner, date

* CTA: **New Onboarding**

* Row actions: View, Duplicate, Archive (demo)

**Acceptance criteria:**

* Filter bekerja (client-side mock ok).

* Status badge konsisten.

---

### **6.3 New Onboarding Wizard (multi-step)**

**Step 1 — Basic Info**

* Project Name, Client/Org, Category (Internal/Client), Target PM Tool (default GitLab)

* Confidentiality: Public/Internal/Restricted

**Step 2 — Document Source**

* Upload: drag-drop, multi file

* SharePoint: connect button → modal pilih folder/file (mock)

* Document types tagging: BRD/PRD/FSD/Other

**Step 3 — Start Processing**

* Tombol **Run Extract & Enrich**

* Menampilkan “pipeline” progress

**Acceptance criteria:**

* Tidak bisa lanjut tanpa minimal 1 dokumen.

* Bisa tag tipe dokumen.

---

### **6.4 Processing Pipeline View**

Menampilkan state sesuai flow:

* **Extract Service**

  * Convert PDF → Markdown

  * OCR (jika scan) (demo: indikator saja)

* **Enrichment Service**

  * Generate wiki outline

  * Generate backlog draft

* **Quality/Verify**

  * Validasi kelengkapan minimal (checklist otomatis)

* **Mapping/Compliance**

  * Mapping ke standar compliance template

**UX:**

* Timeline/stepper \+ status: queued/running/success/fail

* “View logs” drawer (mock text)

**Acceptance criteria:**

* State berubah (simulasi) dan bisa di-refresh.

---

### **6.5 Documents & Extracted Content**

**Documents tab:**

* File list \+ metadata (type, source, upload date, owner)

* Preview (PDF viewer / doc viewer) untuk demo: minimal modal preview

**Extracted Content tab:**

* Markdown viewer \+ table of contents

* Highlight “AI extracted key sections”: Scope, Goals, Assumptions, Requirements

**Acceptance criteria:**

* Bisa toggle antara “Raw extracted markdown” dan “Structured view”.

---

### **6.6 Wiki Draft (Review & Edit)**

**Komponen:**

* Outline tree (editable): Overview, Business Goals, Functional Scope, Non-functional, Assumptions, Risks, Architecture, Delivery Plan

* Editor: rich text/markdown editor (untuk demo cukup markdown editor)

* “Mapping sources”: setiap section menunjukkan dokumen sumber (BRD/PRD/FSD)

**Aksi:**

* Edit section, add section, reorder

* “Regenerate section” (demo: tombol saja \+ modal confirm)

**Acceptance criteria:**

* Perubahan tersimpan di state onboarding (mock store).

---

### **6.7 Backlog Draft (Review & Edit)**

**Komponen:**

* Tree view: Epic → Feature → User Story → Task

* Fields minimal per item:

  * Title, Description, Priority, Estimate, Labels, Acceptance Criteria, Dependencies

* Batch actions: assign label template, set milestone, export preview

**Aksi:**

* Convert “Feature → Epic”

* Merge/split item (demo: minimal UI)

* “Quality checks”:

  * Missing acceptance criteria

  * Title terlalu umum

  * Tidak ada owner/label

**Acceptance criteria:**

* Ada indikator “Completeness score” \+ list issues.

---

### **6.8 Compliance**

**Tujuan UI:** bikin standar compliance jadi *tangible* dan bisa di-audit.

**Komponen:**

* **Compliance Template selector** (misal: Internal Standard / BNI Standard)

* Risk classification: Low/Med/High

* Checklist sections:

  * Documentation completeness

  * Security baseline

  * Data handling & privacy

  * Approval requirements

* Evidence attachments: link doc / notes

**BNI Compliance Gate (sesuai gambar):**

* Status gate: Not submitted / Pending / Approved / Rejected

* Approver list \+ comments

* “Required before Generate” rule

**Acceptance criteria:**

* Generate button terkunci jika gate belum Approved.

* Rejection mewajibkan comment.

---

### **6.9 Review & Approvals**

**Komponen:**

* Reviewer assignments (PM assign Compliance Officer / Tech Lead)

* Comment thread per artifact (Wiki/Backlog/Compliance)

* Approval actions: Approve/Request changes

* Summary “diff” (demo: highlight changed sections)

**Acceptance criteria:**

* Audit log tercatat setiap approval.

---

### **6.10 Generate (Target PM Tool)**

**Komponen:**

* Target selector: GitLab (active), Jira/Azure DevOps (disabled placeholder)

* Mapping preview:

  * GitLab Project name/namespace

  * Wiki pages list

  * Issues/Epics count

  * Labels/Milestones

* “Dry run” preview payload (JSON viewer)

* Generate button \+ progress \+ success screen

**Acceptance criteria:**

* Setelah generate, status onboarding jadi **Generated**.

* Ada link target (mock) \+ export “bundle” (zip placeholder).

---

## **7\) Data Model (FE Mock)**

**OnboardingRequest**

* id, name, owner, org, status

* sources\[\] (upload/sharepoint)

* documents\[\] (id, name, type, source, url, extractedMarkdown)

* wikiDraft (outline \+ sections \+ lastEditedBy)

* backlogDraft (items tree)

* compliance (templateId, riskLevel, checklist\[\], gateStatus, approvals\[\])

* integrations (targetTool, mappingConfig)

* auditLog\[\]

**Status enum (demo):**

* DRAFT → PROCESSING → REVIEW → GATE\_PENDING → READY\_TO\_GENERATE → GENERATED / FAILED

---

## **8\) UX/UI Standard (untuk demo FE terlihat “enterprise”)**

* Layout 2-panel saat review: kiri navigasi (tree), kanan editor/detail

* Consistent status badges \+ stepper pipeline

* Empty states yang jelas (call-to-action)

* Autosave indicator pada editor

* Accessibility: keyboard navigable, contrast OK, form validation

* Responsif minimal desktop-first (tablet optional)

---

## **9\) Non-Functional Requirements (Demo FE)**

* **Performance:** list 200 request tetap smooth (virtualized table optional)

* **Security FE:** role-based route guard (mock)

* **Auditability:** semua aksi penting tercatat (create/upload/edit/approve/generate)

* **Observability:** event tracking untuk funnel (optional demo)

---

## **10\) Technical Specification (untuk Demo FE)**

### **FE Stack (rekomendasi industri)**

* **Next.js (React) \+ TypeScript**

* UI: **Tailwind \+ shadcn/ui** (atau MUI jika prefer enterprise stock)

* State: **React Query** (mock API) \+ Zustand/Redux Toolkit untuk local store

* Editor: **MDX/Markdown editor** (tip: TipTap/Monaco Markdown)

* Tree: react-arborist / rc-tree

* Auth mock: JWT dummy \+ role switcher (untuk demo)

### **API Contract (mock)**

* `POST /onboarding` create

* `POST /onboarding/:id/documents` upload metadata

* `POST /onboarding/:id/process` start pipeline

* `GET /onboarding/:id` detail

* `PATCH /onboarding/:id/wiki` update wiki

* `PATCH /onboarding/:id/backlog` update backlog

* `POST /onboarding/:id/submit-gate`

* `POST /onboarding/:id/approve` (role-based)

* `POST /onboarding/:id/generate` returns “jobId”

* `GET /jobs/:jobId` progress

Untuk demo, semua bisa di-handle oleh **Mock Service Worker (MSW)** atau Next.js API routes.

### **Integrations Layer (future-proof, cukup ditampilkan di UI)**

* Konsep “Connector”:

  * GitLabConnector, JiraConnector, AzureDevOpsConnector, etc

* Standard payload internal:

  * `ProjectCreateRequest`, `WikiCreateRequest[]`, `BacklogCreateRequest[]`

---

## **11\) Success Metrics (Demo)**

* Waktu dari upload → ready to generate \< 5 menit (simulasi)

* Pengguna paham 3 hal: **review**, **compliance gate**, **generate**

* 1 onboarding menghasilkan:

  * min 6 wiki sections

  * min 1 epic, 3 features, 10 tasks (dummy)

---

## **12\) Demo Scenario Script (untuk presentasi)**

1. Buat onboarding baru “Project X”

2. Upload BRD+PRD (2 file) / pilih dari SharePoint (mock)

3. Jalankan processing → lihat pipeline berhasil

4. Review wiki draft → edit 1 section

5. Review backlog → tambah acceptance criteria pada 2 item

6. Buka compliance → pilih “BNI Standard” → submit gate

7. Login role Compliance → approve (tambahkan komentar)

8. Generate → lihat payload preview → success

