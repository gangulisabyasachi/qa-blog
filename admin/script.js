const TOKEN = "vercel_blob_rw_qmlT0PqkgyDwrZt6_DZZLLJapQ5C1363jgajvAg2kHZZKDE"; // SAME AS ABOVE
const STORE_URL = "https://your-store-name.public.blob.vercel-storage.com";
const FILE = "questions.json";
const FULL_URL = `${STORE_URL}/${FILE}?token=${TOKEN}`;

const PASSWORD = "mysecret123"; // ← CHANGE THIS TO YOUR OWN PASSWORD

function checkPass() {
  if (document.getElementById("pass").value === PASSWORD) {
    document.getElementById("admin-content").style.display = "block";
    document.querySelector("h2").style.display = "none";
    document.getElementById("pass").style.display = "none";
    document.querySelector("button").style.display = "none";
    loadAdminList();
  } else {
    alert("Wrong password");
  }
}

async function getData() {
  try {
    const r = await fetch(FULL_URL);
    if (!r.ok && r.status === 404) return { questions: [] };
    return await r.json();
  } catch {
    return { questions: [] };
  }
}

async function saveData(data) {
  await fetch(FULL_URL, {
    method: "PUT",
    body: JSON.stringify(data, null, 2),
    headers: { "Content-Type": "application/json" }
  });
}

async function loadAdminList() {
  const data = await getData();
  const ul = document.getElementById("list");
  ul.innerHTML = "";
  data.questions.forEach(q => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${q.title} 
      <small>(${new Date(q.date).toLocaleDateString()})</small><br>
      <a href="edit.html?id=${q.id}">Edit</a> |
      <button onclick="deleteQuestion('${q.id}')">Delete</button>
    `;
    ul.appendChild(li);
  });
}

async function deleteQuestion(id) {
  if (!confirm("Delete?")) return;
  const data = await getData();
  data.questions = data.questions.filter(q => q.id !== id);
  await saveData(data);
  loadAdminList();
}