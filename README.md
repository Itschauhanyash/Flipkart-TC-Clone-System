# TC App - Hospital/Transport Management System Workflows

A fast, responsive Single Page Application (SPA) built to orchestrate transport flow, tracking, scanning, and vehicle dispatch logic cleanly managed from a client-side architecture.

## 🚀 Key Features

* **Authentication Gateway**: Secure entryway simulating terminal agent logins (`ca.1234` / `1234`).
* **Live Load Building Dashboard**:
    * Features robust, dynamic progress meters capable of tracking scans smoothly against strict vehicle load capacities (Ex: 250 items).
    * Integrated validation logic immediately rejects duplicate shipment barcode entries with clean UI warnings.
* **Component-Level Shipment Tracking**:
    * Displays elegantly partitioned accordion blocks for both 'Picked' (Completed) and 'Expected' (Pending) shipments.
    * Intelligently divides metrics accurately like distributing Semi-Large vs. Bag capacities live as goods are logged.
* **Sealing & Dock Out Processing**:
    * Full integration sealing matrix requiring strict validation for both **Seal ID** strings and **Seal Type** inputs before any truck is allowed to depart the hub.
    * Concludes with an automated 'Dock Out' function that securely flushes localized app memory (scanned caches, capacities) without hard browser reloads, resetting smoothly for continual usage.

## 🛠️ Technologies Used

* HTML5 (Clean, semantic structural flow)
* CSS3 Native variables (Custom UI rendering)
* Vanilla JavaScript (Zero-dependency core logic routing)

## 📌 Usage

Because this app utilizes completely native web logic without a build pipeline, simply open the `index.html` file seamlessly in any modern browser to begin.
