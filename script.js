
// LOAD SAVED RECORDS
let records = JSON.parse(
    localStorage.getItem("homeRecords") || "[]"
);

let editId = null;

// SAVE TO LOCAL STORAGE
function saveRecords() {
    localStorage.setItem(
        "homeRecords",
        JSON.stringify(records)
    );
}

// GENERATE UNIQUE ID
function generateID() {
    return "HOME-" + Date.now() + "-" +
        Math.random().toString(36).slice(2, 7);
}

// OPEN ADD MODAL
function openModal() {
    editId = null;

    document.getElementById("recordForm").reset();

    document.getElementById("modalTitle").textContent =
        "Add New Record";

    document.getElementById("recordModal").style.display =
        "flex";
}

// CLOSE ADD MODAL
function closeModal() {
    document.getElementById("recordModal").style.display =
        "none";
}

// CLOSE VIEW MODAL
function closeView() {
    document.getElementById("viewModal").style.display =
        "none";
}

// ESCAPE HTML
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

// ADD OR UPDATE RECORD
document.getElementById("recordForm")
.addEventListener("submit", function(e) {

    e.preventDefault();

    const name = document.getElementById("name")
        .value.trim();

    const category = document.getElementById("category")
        .value;

    const date = document.getElementById("date")
        .value;

    const status = document.getElementById("status")
        .value;

    const description = document.getElementById("description")
        .value.trim();

    if (name.length < 2) {
        alert("Name must contain at least 2 characters.");
        return;
    }

    if (!category || !date || !status) {
        alert("Please complete all required fields.");
        return;
    }

    const data = {
        name,
        category,
        date,
        status,
        description
    };

    if (editId) {

        const index = records.findIndex(
            r => r.id === editId
        );

        if (index !== -1) {
            records[index] = {
                ...records[index],
                ...data
            };
        }

        alert("Record updated successfully!");

    } else {

        records.push({
            id: generateID(),
            reference: generateID(),
            ...data,
            createdAt: new Date().toISOString()
        });

        alert("Record added successfully!");
    }

    saveRecords();
    renderRecords();
    closeModal();
});

// DISPLAY RECORDS
function renderRecords() {

    const list = document.getElementById("recordList");

    const search = document.getElementById("search")
        .value.toLowerCase().trim();

    const filter = document.getElementById("filter").value;

    list.innerHTML = "";

    const filteredRecords = records.filter(r => {

        const matchesSearch =
            r.name.toLowerCase().includes(search) ||
            r.reference.toLowerCase().includes(search);

        const matchesStatus =
            filter === "" || r.status === filter;

        return matchesSearch && matchesStatus;
    });

    if (filteredRecords.length === 0) {

        list.innerHTML = `
            <tr>
                <td colspan="6" class="empty">
                    No records found.
                </td>
            </tr>
        `;
    }

    filteredRecords.forEach(r => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(r.reference)}</td>

            <td>${escapeHTML(r.name)}</td>

            <td>${escapeHTML(r.category)}</td>

            <td>${escapeHTML(r.date)}</td>

            <td>
                <span class="status ${r.status}">
                    ${escapeHTML(r.status)}
                </span>
            </td>

            <td>
                <div class="actions">

                    <button class="view"
                        onclick="viewRecord('${r.id}')">
                        View
                    </button>

                    <button class="edit"
                        onclick="editRecord('${r.id}')">
                        Edit
                    </button>

                    <button class="cancel"
                        onclick="cancelRecord('${r.id}')">
                        Cancel
                    </button>

                    <button class="delete"
                        onclick="deleteRecord('${r.id}')">
                        Delete
                    </button>

                </div>
            </td>
        `;

        list.appendChild(row);
    });

    updateDashboard();
}

// UPDATE DASHBOARD COUNTERS
function updateDashboard() {

    document.getElementById("total").textContent =
        records.length;

    document.getElementById("active").textContent =
        records.filter(r => r.status === "Active").length;

    document.getElementById("pending").textContent =
        records.filter(r => r.status === "Pending").length;

    document.getElementById("cancelled").textContent =
        records.filter(r => r.status === "Cancelled").length;
}

// VIEW RECORD
function viewRecord(id) {

    const r = records.find(r => r.id === id);

    if (!r) return;

    document.getElementById("details").innerHTML = `

        <div class="detail">
            <strong>Reference:</strong>
            ${escapeHTML(r.reference)}
        </div>

        <div class="detail">
            <strong>Full Name:</strong>
            ${escapeHTML(r.name)}
        </div>

        <div class="detail">
            <strong>Category:</strong>
            ${escapeHTML(r.category)}
        </div>

        <div class="detail">
            <strong>Date:</strong>
            ${escapeHTML(r.date)}
        </div>

        <div class="detail">
            <strong>Status:</strong>
            ${escapeHTML(r.status)}
        </div>

        <div class="detail">
            <strong>Description:</strong>
            ${escapeHTML(r.description || "No description")}
        </div>

        <div class="detail">
            <strong>Date Created:</strong>
            ${escapeHTML(r.createdAt || "Not available")}
        </div>
    `;

    document.getElementById("viewModal").style.display =
        "flex";
}

// EDIT RECORD
function editRecord(id) {

    const r = records.find(r => r.id === id);

    if (!r) return;

    editId = id;

    document.getElementById("name").value = r.name;
    document.getElementById("category").value = r.category;
    document.getElementById("date").value = r.date;
    document.getElementById("status").value = r.status;
    document.getElementById("description").value =
        r.description;

    document.getElementById("modalTitle").textContent =
        "Update Record";

    document.getElementById("recordModal").style.display =
        "flex";
}

// CANCEL RECORD
function cancelRecord(id) {

    const r = records.find(r => r.id === id);

    if (!r) return;

    if (r.status === "Cancelled") {
        alert("This record is already cancelled.");
        return;
    }

    const confirmCancel = confirm(
        "Are you sure you want to cancel this record?"
    );

    if (confirmCancel) {

        r.status = "Cancelled";

        saveRecords();
        renderRecords();

        alert("Record cancelled successfully!");
    }
}

// DELETE RECORD
function deleteRecord(id) {

    const confirmDelete = confirm(
        "WARNING!\n\nAre you sure you want to permanently delete this record?"
    );

    if (!confirmDelete) return;

    records = records.filter(r => r.id !== id);

    saveRecords();
    renderRecords();

    alert("Record deleted successfully!");
}

// INITIALIZE DASHBOARD
renderRecords();
