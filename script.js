
let editingNoteIndex = -1;
let profilePhotoData = "";
let secretUnlocked = false;

function welcomeUser() {
    document.getElementById("dashboard").style.display = "block";
    hideSections();
}

function hideSections() {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
}

function showSection(sectionId) {
    hideSections();

    const section = document.getElementById(sectionId);
    if (!section) return;

    section.style.display = "block";

    if (sectionId === "notesSection") displayNotes();
    if (sectionId === "tasksSection") displayTasks();

    if (sectionId === "plannerSection") {
        document.getElementById("studyPlan").value =
            localStorage.getItem("studyversePlan") || "";
    }

    if (sectionId === "goalsSection") {
        document.getElementById("goalInput").value =
            localStorage.getItem("studyverseGoal") || "";
    }

    if (sectionId === "weeklyPlannerSection") loadWeeklyPlan();
    if (sectionId === "profileSection") loadProfile();
    if (sectionId === "secretGoalsSection") prepareSecretGoals();
}

function openNotes() {
    showSection("notesSection");
}

function readArray(key) {
    try {
        const data = JSON.parse(localStorage.getItem(key) || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveNote() {
    const titleInput = document.getElementById("noteTitle");
    const contentInput = document.getElementById("noteContent");
    const message = document.getElementById("saveMessage");

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        message.textContent = "Please enter both title and notes.";
        return;
    }

    const notes = readArray("studyverseNotes");

    if (editingNoteIndex >= 0 && notes[editingNoteIndex]) {
        notes[editingNoteIndex] = { title, content };
        message.textContent = "Note updated successfully!";
    } else {
        notes.push({ title, content });
        message.textContent = "Note saved successfully!";
    }

    localStorage.setItem("studyverseNotes", JSON.stringify(notes));

    editingNoteIndex = -1;
    titleInput.value = "";
    contentInput.value = "";
    displayNotes();
}

function displayNotes() {
    const savedNotes = document.getElementById("savedNotes");
    if (!savedNotes) return;

    savedNotes.innerHTML = "";

    readArray("studyverseNotes").forEach((note, index) => {
        const wrapper = document.createElement("div");
        const title = document.createElement("h3");
        const content = document.createElement("p");
        const editButton = document.createElement("button");
        const deleteButton = document.createElement("button");

        title.textContent = note.title || "Untitled note";
        content.textContent = note.content || "";

        editButton.textContent = "Edit";
        editButton.onclick = () => editNote(index);

        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => {
            const notes = readArray("studyverseNotes");
            notes.splice(index, 1);
            localStorage.setItem("studyverseNotes", JSON.stringify(notes));
            editingNoteIndex = -1;
            displayNotes();
        };

        wrapper.append(title, content, editButton, deleteButton);
        savedNotes.appendChild(wrapper);
    });
}

function editNote(index) {
    const notes = readArray("studyverseNotes");
    if (!notes[index]) return;

    editingNoteIndex = index;
    document.getElementById("noteTitle").value = notes[index].title || "";
    document.getElementById("noteContent").value = notes[index].content || "";
    document.getElementById("saveMessage").textContent =
        "Edit your note and click Save Note.";
}

function savePlan() {
    const plan = document.getElementById("studyPlan").value.trim();
    const message = document.getElementById("planMessage");

    if (!plan) {
        message.textContent = "Please enter your study plan.";
        return;
    }

    localStorage.setItem("studyversePlan", plan);
    message.textContent = "Study plan saved!";
}

function saveWeeklyPlan() {
    const weeklyPlan = {};

    for (let day = 1; day <= 7; day++) {
        const input = document.getElementById("day" + day);
        if (input) weeklyPlan["day" + day] = input.value.trim();
    }

    localStorage.setItem("studyverseWeeklyPlan", JSON.stringify(weeklyPlan));
    document.getElementById("weeklyPlanMessage").textContent =
        "Weekly study plan saved successfully!";
}

function loadWeeklyPlan() {
    let weeklyPlan = {};

    try {
        weeklyPlan = JSON.parse(
            localStorage.getItem("studyverseWeeklyPlan") || "{}"
        );
    } catch {
        weeklyPlan = {};
    }

    for (let day = 1; day <= 7; day++) {
        const input = document.getElementById("day" + day);
        if (input) input.value = weeklyPlan["day" + day] || "";
    }
}

function getTasks() {
    return readArray("studyverseTasks").map(task =>
        typeof task === "string"
            ? { text: task, completed: false }
            : { text: task.text || "", completed: Boolean(task.completed) }
    );
}

function addTask() {
    const input = document.getElementById("taskInput");
    const task = input.value.trim();

    if (!task) return;

    const tasks = getTasks();
    tasks.push({ text: task, completed: false });

    localStorage.setItem("studyverseTasks", JSON.stringify(tasks));
    input.value = "";
    displayTasks();
}

function displayTasks() {
    const taskList = document.getElementById("taskList");
    if (!taskList) return;

    taskList.innerHTML = "";

    getTasks().forEach((task, index) => {
        const li = document.createElement("li");
        const checkbox = document.createElement("input");
        const text = document.createElement("span");
        const deleteButton = document.createElement("button");

        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        text.textContent = task.text;

        if (task.completed) text.style.textDecoration = "line-through";

        checkbox.onchange = () => {
            const tasks = getTasks();
            tasks[index].completed = checkbox.checked;
            localStorage.setItem("studyverseTasks", JSON.stringify(tasks));
            displayTasks();
        };

        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => {
            const tasks = getTasks();
            tasks.splice(index, 1);
            localStorage.setItem("studyverseTasks", JSON.stringify(tasks));
            displayTasks();
        };

        li.append(checkbox, text, deleteButton);
        taskList.appendChild(li);
    });
}

function saveGoal() {
    const goal = document.getElementById("goalInput").value.trim();
    const message = document.getElementById("goalMessage");

    if (!goal) {
        message.textContent = "Please enter your goal.";
        return;
    }

    localStorage.setItem("studyverseGoal", goal);
    message.textContent = "Goal saved!";
}

function previewProfilePhoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        event.target.value = "";
        return;
    }

    if (file.size > 2 * 1024 * 1024) {
        alert("Please choose an image smaller than 2 MB.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        profilePhotoData = reader.result;
        document.getElementById("profilePreview").src = profilePhotoData;
    };

    reader.readAsDataURL(file);
}

function saveProfile() {
    const profile = {
        name: document.getElementById("profileName").value.trim(),
        studentClass: document.getElementById("profileClass").value.trim(),
        photo: profilePhotoData
    };

    try {
        localStorage.setItem("studyverseProfile", JSON.stringify(profile));
        document.getElementById("profileMessage").textContent =
            "Profile saved successfully!";
    } catch {
        document.getElementById("profileMessage").textContent =
            "Storage full. Please use a smaller photo.";
    }
}

function loadProfile() {
    try {
        const profile = JSON.parse(
            localStorage.getItem("studyverseProfile") || "{}"
        );

        document.getElementById("profileName").value = profile.name || "";
        document.getElementById("profileClass").value =
            profile.studentClass || "";

        profilePhotoData = profile.photo || "";

        if (profilePhotoData) {
            document.getElementById("profilePreview").src = profilePhotoData;
        }
    } catch {
        console.log("Could not load profile.");
    }
}

function prepareSecretGoals() {
    const savedPin = localStorage.getItem("studyverseSecretPin");

    document.getElementById("secretSetup").style.display =
        savedPin ? "none" : "block";

    document.getElementById("secretLocked").style.display =
        savedPin ? "block" : "none";

    document.getElementById("secretContent").style.display = "none";
    secretUnlocked = false;
}

function unlockSecretGoals(createPin) {
    const message = document.getElementById("secretMessage");

    if (createPin) {
        const pin = document.getElementById("secretPin").value;

        if (!/^\d{4,8}$/.test(pin)) {
            message.textContent = "Create a PIN with 4–8 digits.";
            return;
        }

        if (localStorage.getItem("studyverseSecretPin")) {
            message.textContent = "A PIN already exists. Enter your existing PIN.";
            return;
        }

        localStorage.setItem("studyverseSecretPin", pin);
        document.getElementById("secretPin").value = "";
        document.getElementById("secretSetup").style.display = "none";
        document.getElementById("secretLocked").style.display = "block";
        message.textContent = "PIN created! Enter it to unlock.";
        return;
    }

    const enteredPin = document.getElementById("secretUnlockPin").value;
    const savedPin = localStorage.getItem("studyverseSecretPin");

    if (!savedPin || enteredPin !== savedPin) {
        message.textContent = "Incorrect PIN.";
        return;
    }

    secretUnlocked = true;
    document.getElementById("secretUnlockPin").value = "";
    document.getElementById("secretLocked").style.display = "none";
    document.getElementById("secretContent").style.display = "block";
    document.getElementById("secretGoalInput").value =
        localStorage.getItem("studyverseSecretGoals") || "";

    message.textContent = "Secret Goals unlocked!";
}

function saveSecretGoals() {
    if (!secretUnlocked) return;

    localStorage.setItem(
        "studyverseSecretGoals",
        document.getElementById("secretGoalInput").value
    );

    document.getElementById("secretMessage").textContent =
        "Secret Goals saved!";
}

function lockSecretGoals() {
    secretUnlocked = false;
    document.getElementById("secretContent").style.display = "none";
    document.getElementById("secretLocked").style.display = "block";
    document.getElementById("secretGoalInput").value = "";
    document.getElementById("secretUnlockPin").value = "";
    document.getElementById("secretMessage").textContent =
        "Secret Goals locked.";
}

document.addEventListener("DOMContentLoaded", function () {

    if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.log("Service Worker error:", error));
    });
}


    displayNotes();
    displayTasks();
    loadWeeklyPlan();
    loadProfile();

    const plan = document.getElementById("studyPlan");
    if (plan) plan.value = localStorage.getItem("studyversePlan") || "";

    const goal = document.getElementById("goalInput");
    if (goal) goal.value = localStorage.getItem("studyverseGoal") || "";

    hideSections();

    const dashboard = document.getElementById("dashboard");
    if (dashboard) dashboard.style.display = "none";
});
