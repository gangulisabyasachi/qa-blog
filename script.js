// Change these two values!
const BLOB_TOKEN = "vercel_blob_rw_qmlT0PqkgyDwrZt6_DZZLLJapQ5C1363jgajvAg2kHZZKDE"; // ← your BLOB_READ_WRITE_TOKEN
const DATA_PATH = "questions.json";   // name of the file in blob store

const BLOB_API = "https://blob.vercel-storage.com";

// Helper: get or create data
async function getData() {
  try {
    const url = `${BLOB_API}/${DATA_PATH}?token=${BLOB_TOKEN}`;
    const res = await fetch(url);
    if (!res.ok && res.status === 404) {
      // Not found → create empty
      await saveData({ questions: [] });
      return { questions: [] };
    }
    if (!res.ok) throw new Error("Cannot read data");
    return await res.json();
  } catch (err) {
    console.error(err);
    return { questions: [] };
  }
}

// Save data (overwrite)
async function saveData(data) {
  const res = await fetch(`${BLOB_API}/${DATA_PATH}?token=${BLOB_TOKEN}`, {
    method: "PUT",
    body: JSON.stringify(data, null, 2),
    headers: { "Content-Type": "application/json" }
  });
  if (!res.ok) throw new Error("Save failed: " + res.status);
}

// For questions.html – load latest 5 + search
async function loadQuestions(search = "") {
  const { questions } = await getData();
  const filtered = questions
    .filter(q => 
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a,b) => new Date(b.date) - new Date(a.date)); // newest first

  const list = document.getElementById("questions-list");
  list.innerHTML = "";

  filtered.slice(0, 5).forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="question.html?id=${q.id}">${q.title}</a>
                    <small>${new Date(q.date).toLocaleDateString()}</small>`;
    list.appendChild(li);
  });

  if (filtered.length === 0) {
    list.innerHTML = "<p>No questions found.</p>";
  }
}

// For question.html – show one
async function loadSingleQuestion() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const { questions } = await getData();
  const q = questions.find(x => x.id === id);
  if (!q) {
    document.getElementById("content").innerHTML = "<h2>Question not found</h2>";
    return;
  }

  document.getElementById("title").textContent = q.title;
  document.getElementById("answer").innerHTML = q.answer.replace(/\n/g, "<br>");
  document.getElementById("date").textContent = new Date(q.date).toLocaleString();
}

// For admin.html – load list + add / edit / delete
async function adminLoad() {
  const tokenInput = document.getElementById("token");
  const savedToken = localStorage.getItem("adminToken");
  if (savedToken) tokenInput.value = savedToken;

  document.getElementById("add-form").onsubmit = async e => {
    e.preventDefault();
    if (!checkToken()) return;

    const title = document.getElementById("title").value.trim();
    const answer = document.getElementById("answer").value.trim();
    const keywords = document.getElementById("keywords").value.trim();

    if (!title || !answer) return alert("Title and answer required");

    const data = await getData();
    const newQ = {
      id: Date.now().toString(),
      title,
      answer,
      keywords,
      date: new Date().toISOString()
    };
    data.questions.push(newQ);
    try {
      await saveData(data);
      alert("Question added!");
      location.reload();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Edit & Delete would require selecting one question – keeping minimal
  // You can extend later with a list + buttons
}

function checkToken() {
  const token = document.getElementById("token").value.trim();
  if (token !== BLOB_TOKEN) {
    alert("Wrong token!");
    return false;
  }
  localStorage.setItem("adminToken", token);
  return true;
}

// Init based on page
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("questions-list")) {
    const searchBox = document.getElementById("search");
    searchBox.oninput = () => loadQuestions(searchBox.value);
    loadQuestions();
  }
  if (document.getElementById("title") && document.getElementById("answer")) {
    loadSingleQuestion();
  }
  if (document.getElementById("add-form")) {
    adminLoad();
  }
});
