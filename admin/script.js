// admin/script.js

// CHANGE THIS TO YOUR DESIRED PASSWORD
const PASSWORD = "kolkata2026";  // ←←← Put your password here (change from default!)

const TOKEN = "vercel_blob_rw_qmlT0PqkgyDwrZt6_DZZLLJapQ5C1363jgajvAg2kHZZKDE"; // your real token
const STORE_URL = "https://qmlt0pqkgydwrzt6.public.blob.vercel-storage.com";       // your real store URL
const FULL_URL = `${STORE_URL}/questions.json?token=${TOKEN}`;

console.log("Admin script loaded"); // ← should appear in console

async function getData() {
  try {
    const r = await fetch(FULL_URL);
    if (!r.ok && r.status === 404) return { questions: [] };
    if (!r.ok) throw new Error(`Fetch failed: ${r.status}`);
    return await r.json();
  } catch (err) {
    console.error("getData error:", err);
    return { questions: [] };
  }
}

async function saveData(data) {
  try {
    const r = await fetch(FULL_URL, {
      method: "PUT",
      body: JSON.stringify(data, null, 2),
      headers: { "Content-Type": "application/json" }
    });
    if (!r.ok) throw new Error(`Save failed: ${r.status}`);
  } catch (err) {
    console.error("saveData error:", err);
    alert("Could not save changes. Check console for details.");
  }
}

function checkPass() {
  const input = document.getElementById("pass");
  const msg = document.getElementById("message");
  
  if (!input) {
    console.error("Password input not found!");
    msg.textContent = "Error: Password field missing.";
    return;
  }

  const entered = input.value.trim();
  
  console.log("Entered password:", entered); // debug – remove later if you want

  if (entered === PASSWORD) {
    console.log("Password correct – showing admin content");
    document.getElementById("admin-content").style.display = "block";
    input.style.display = "none";
    document.querySelector("button").style.display = "none";
    document.querySelector("h2").textContent = "Admin Dashboard";
    msg.textContent = "";
    loadAdminList();
  } else {
    console.log("Wrong password");
    msg.textContent = "Incorrect password. Try again.";
    input.value = "";
    input.focus();
  }
}

async function loadAdminList() {
  const data = await getData();
  const ul = document.getElementById("list");
  if (!ul) return;

  ul.innerHTML = "";

  if (data.questions.length === 0) {
    ul.innerHTML = "<li>No questions yet.</li>";
    return;
  }

  data.questions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .forEach(q => {
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${q.title}</strong><br>
        <small>${new Date(q.date).toLocaleString()}</small><br>
        <a href="edit.html?id=${q.id}">Edit</a> |
        <button onclick="deleteQuestion('${q.id}')">Delete</button>
      `;
      ul.appendChild(li);
    });
}

window.deleteQuestion = async function(id) {  // make global so onclick works
  if (!confirm("Really delete this question?")) return;

  const data = await getData();
  data.questions = data.questions.filter(q => q.id !== id);
  await saveData(data);
  loadAdminList();
};