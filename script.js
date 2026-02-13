const TOKEN = "vercel_blob_rw_qmlT0PqkgyDwrZt6_DZZLLJapQ5C1363jgajvAg2kHZZKDE"; // ← PASTE YOUR TOKEN HERE
const STORE_URL = "https://your-store-name.public.blob.vercel-storage.com";       // ← from dashboard
const FILE = "questions.json";

const FULL_URL = `${STORE_URL}/${FILE}?token=${TOKEN}`;

async function getQuestions() {
  try {
    const r = await fetch(FULL_URL);
    if (!r.ok && r.status === 404) return { questions: [] };
    if (!r.ok) throw new Error("Read failed");
    return await r.json();
  } catch (e) {
    console.error(e);
    return { questions: [] };
  }
}

async function saveQuestions(data) {
  const r = await fetch(FULL_URL, {
    method: "PUT",
    body: JSON.stringify(data, null, 2),
    headers: { "Content-Type": "application/json" }
  });
  if (!r.ok) throw new Error("Save failed: " + r.status);
}

// questions.html
async function loadList(search = "") {
  const data = await getQuestions();
  const qs = data.questions
    .filter(q => q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.answer.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const ul = document.getElementById("questions-list");
  if (!ul) return;

  ul.innerHTML = "";
  qs.slice(0, 5).forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `<a href="question.html?id=${q.id}">${q.title}</a>
                    <small> — ${new Date(q.date).toLocaleDateString()}</small>`;
    ul.appendChild(li);
  });
  if (qs.length === 0) ul.innerHTML = "<p>No questions found.</p>";
}

// question.html
async function loadOne() {
  const id = new URLSearchParams(location.search).get("id");
  if (!id) return;

  const data = await getQuestions();
  const q = data.questions.find(x => x.id === id);
  if (!q) {
    document.getElementById("title").textContent = "Not found";
    return;
  }

  document.getElementById("title").textContent = q.title;
  document.getElementById("answer").innerHTML = q.answer.replace(/\n/g, "<br>");
  document.getElementById("date").textContent = new Date(q.date).toLocaleString();
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("questions-list")) {
    const s = document.getElementById("search");
    if (s) s.oninput = () => loadList(s.value);
    loadList();
  }
  if (document.getElementById("title") && document.getElementById("answer")) {
    loadOne();
  }
});