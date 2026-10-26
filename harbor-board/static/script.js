// Front-end: talks to the Python API with fetch()
const form = document.getElementById("form");
const list = document.getElementById("list");
const empty = document.getElementById("empty");
const errorBox = document.getElementById("error");
const count = document.getElementById("count");
const textarea = form.elements.text;

function render(messages) {
  list.replaceChildren();
  empty.hidden = messages.length > 0;
  for (const m of messages) {
    const li = document.createElement("li");
    const p = document.createElement("p");
    p.textContent = m.text; // textContent prevents HTML injection

    const meta = document.createElement("div");
    meta.className = "meta";
    const who = document.createElement("span");
    const strong = document.createElement("strong");
    strong.textContent = m.name;
    who.append(strong, " on ", new Date(m.at).toLocaleString());

    const del = document.createElement("button");
    del.className = "del";
    del.type = "button";
    del.textContent = "Delete";
    del.addEventListener("click", () => remove(m.id));

    meta.append(who, del);
    li.append(p, meta);
    list.append(li);
  }
}

async function load() {
  try {
    const res = await fetch("/api/messages");
    render(await res.json());
  } catch {
    errorBox.textContent = "Could not load notes. Check that the server is running.";
  }
}

async function remove(id) {
  await fetch(`/api/messages/${id}`, { method: "DELETE" });
  load();
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorBox.textContent = "";
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  try {
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.elements.name.value, text: textarea.value }),
    });
    if (!res.ok) {
      errorBox.textContent = (await res.json()).error || "Something went wrong.";
      return;
    }
    textarea.value = "";
    count.textContent = "280 left";
    load();
  } catch {
    errorBox.textContent = "Could not reach the server.";
  } finally {
    button.disabled = false;
  }
});

textarea.addEventListener("input", () => {
  count.textContent = `${280 - textarea.value.length} left`;
});

load();
