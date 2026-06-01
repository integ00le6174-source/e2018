let PAPERS = [];

const state = {
  query: "",
  category: "all",
  sort: "newest",
  selectedId: null,
};

const els = {
  list: document.getElementById("paperList"),
  search: document.getElementById("searchInput"),
  category: document.getElementById("categoryFilter"),
  sort: document.getElementById("sortSelect"),
  frame: document.getElementById("pdfFrame"),
  viewerMeta: document.getElementById("viewerMeta"),
  openPdfLink: document.getElementById("openPdfLink"),
  paperCount: document.getElementById("paperCount"),
  addForm: document.getElementById("addPaperForm"),
  addStatus: document.getElementById("addStatus"),
  logoutButton: document.getElementById("logoutButton"),
};

function normalize(text) {
  return String(text || "").toLowerCase();
}

function formatDate(dateString) {
  if (!dateString) return "date unknown";
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getIdNumber(id) {
  const match = String(id || "").match(/(\d+)$/);
  return match ? Number(match[1]) : 0;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(",")[1] || "");
    reader.onerror = () => reject(new Error("PDFを読み込めませんでした。"));
    reader.readAsDataURL(file);
  });
}

async function loadPapers() {
  const response = await fetch("/api/papers");
  if (response.status === 401) {
    location.href = "/login.html";
    return;
  }
  if (!response.ok) {
    throw new Error("一覧データを読み込めませんでした。");
  }
  PAPERS = await response.json();
}

function populateCategories() {
  const currentValue = els.category.value || "all";
  const categories = [...new Set(PAPERS.map((paper) => paper.category).filter(Boolean))].sort();
  els.category.innerHTML = `<option value="all">すべて</option>`;

  for (const category of categories) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.category.appendChild(option);
  }

  els.category.value = categories.includes(currentValue) ? currentValue : "all";
  state.category = els.category.value;
}

function getFilteredPapers() {
  const query = normalize(state.query);
  return PAPERS
    .filter((paper) => {
      const matchesCategory = state.category === "all" || paper.category === state.category;
      const searchable = normalize([
        paper.id,
        paper.title,
        paper.authors,
        paper.category,
        paper.abstract,
        paper.version,
        ...(paper.keywords || []),
      ].join(" "));
      const matchesQuery = !query || searchable.includes(query);
      return matchesCategory && matchesQuery;
    })
    .sort((a, b) => {
      if (state.sort === "id-asc") return getIdNumber(a.id) - getIdNumber(b.id);
      if (state.sort === "id-desc") return getIdNumber(b.id) - getIdNumber(a.id);
      if (state.sort === "oldest") return new Date(a.date) - new Date(b.date);
      if (state.sort === "title") return a.title.localeCompare(b.title, "ja");
      return new Date(b.date) - new Date(a.date);
    });
}

function renderPapers() {
  const papers = getFilteredPapers();
  els.paperCount.textContent = PAPERS.length;

  if (papers.length === 0) {
    els.list.innerHTML = `<div class="empty-state">該当するレポートがありません。</div>`;
    return;
  }

  els.list.innerHTML = papers.map((paper) => `
    <article class="paper-card ${paper.id === state.selectedId ? "active" : ""}" data-id="${escapeHtml(paper.id)}">
      <div class="paper-topline">
        <span class="paper-id">${escapeHtml(paper.id)} ${paper.version ? `/${escapeHtml(paper.version)}` : ""}</span>
        <span class="paper-date">${escapeHtml(formatDate(paper.date))}</span>
      </div>
      <h3 class="paper-title">${escapeHtml(paper.title)}</h3>
      <p class="paper-authors">${escapeHtml(paper.authors || "Author unknown")} ・ ${escapeHtml(paper.category || "Uncategorized")}</p>
      <p class="paper-abstract">${escapeHtml(paper.abstract || "要旨は未記入です。")}</p>
      <div class="tags">
        ${(paper.keywords || []).map((keyword) => `<span class="tag">${escapeHtml(keyword)}</span>`).join("")}
      </div>
      <div class="paper-actions">
        <button type="button" data-action="view" data-id="${escapeHtml(paper.id)}">このPDFを表示</button>
        <a href="${escapeHtml(paper.file)}" target="_blank" rel="noopener">別タブで開く</a>
        <button class="danger-action" type="button" data-action="delete" data-id="${escapeHtml(paper.id)}">削除</button>
      </div>
    </article>
  `).join("");
}

function selectPaper(id, updateHash = true) {
  const paper = PAPERS.find((item) => item.id === id) || PAPERS[0];
  if (!paper) return;

  state.selectedId = paper.id;
  els.frame.src = paper.file;
  els.openPdfLink.href = paper.file;
  els.viewerMeta.innerHTML = `
    <strong>${escapeHtml(paper.title)}</strong>
    <span>${escapeHtml(paper.id)}${paper.version ? ` / ${escapeHtml(paper.version)}` : ""} ・ ${escapeHtml(formatDate(paper.date))}</span><br>
    <span>${escapeHtml(paper.category || "Uncategorized")}</span>
  `;

  if (updateHash) {
    history.replaceState(null, "", `#${encodeURIComponent(paper.id)}`);
  }
  renderPapers();
}

async function handleAddPaper(event) {
  event.preventDefault();
  const formData = new FormData(els.addForm);
  const file = formData.get("pdfFile");

  if (!file || (!file.name.toLowerCase().endsWith(".pdf") && file.type !== "application/pdf")) {
    els.addStatus.textContent = "PDFファイルを選択してください。";
    return;
  }

  els.addStatus.textContent = "追加しています...";
  els.addForm.querySelector("button[type='submit']").disabled = true;

  try {
    const fileBase64 = await fileToBase64(file);
    const payload = {
      title: formData.get("title"),
      authors: formData.get("authors"),
      date: formData.get("date"),
      category: formData.get("category"),
      version: formData.get("version"),
      keywords: formData.get("keywords"),
      abstract: formData.get("abstract"),
      fileName: file.name,
      fileBase64,
    };

    const response = await fetch("/api/papers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "PDFを追加できませんでした。");
    }

    await loadPapers();
    populateCategories();
    renderPapers();
    selectPaper(result.id);
    els.addForm.reset();
    els.addForm.elements.authors.value = "e 2018";
    els.addForm.elements.version.value = "v1";
    els.addStatus.textContent = "追加しました。";
    document.getElementById("archive").scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    els.addStatus.textContent = error.message;
  } finally {
    els.addForm.querySelector("button[type='submit']").disabled = false;
  }
}

async function handleLogout() {
  await fetch("/api/logout", { method: "POST" });
  location.href = "/login.html";
}

async function handleDeletePaper(id) {
  const paper = PAPERS.find((item) => item.id === id);
  if (!paper) return;

  const confirmId = prompt(`削除するには、このIDを入力してください。\n${paper.id}`);
  if (confirmId === null) return;

  const deletePassword = prompt("削除用パスワードを入力してください。");
  if (deletePassword === null) return;

  try {
    const response = await fetch(`/api/papers/${encodeURIComponent(paper.id)}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmId, deletePassword }),
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "削除できませんでした。");
    }

    await loadPapers();
    populateCategories();
    if (state.selectedId === paper.id) {
      state.selectedId = null;
      els.frame.removeAttribute("src");
      els.openPdfLink.removeAttribute("href");
      els.viewerMeta.innerHTML = `<p>左の一覧からPDFを選んでください。</p>`;
    }
    renderPapers();
  } catch (error) {
    alert(error.message);
  }
}

function bindEvents() {
  els.search.addEventListener("input", (event) => {
    state.query = event.target.value;
    renderPapers();
  });

  els.category.addEventListener("change", (event) => {
    state.category = event.target.value;
    renderPapers();
  });

  els.sort.addEventListener("change", (event) => {
    state.sort = event.target.value;
    renderPapers();
  });

  els.list.addEventListener("click", (event) => {
    const deleteButton = event.target.closest("[data-action='delete']");
    if (deleteButton) {
      handleDeletePaper(deleteButton.dataset.id);
      return;
    }

    const button = event.target.closest("[data-action='view']");
    const card = event.target.closest(".paper-card");
    const id = button?.dataset.id || card?.dataset.id;
    if (id && !event.target.closest("a")) {
      selectPaper(id);
      document.getElementById("viewer").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  els.addForm.addEventListener("submit", handleAddPaper);
  els.logoutButton.addEventListener("click", handleLogout);
}

async function init() {
  try {
    await loadPapers();
    populateCategories();
    bindEvents();
    renderPapers();

    const hashId = decodeURIComponent(location.hash.replace("#", ""));
    const firstId = PAPERS[0]?.id;
    if (hashId && PAPERS.some((paper) => paper.id === hashId)) {
      selectPaper(hashId, false);
    } else if (firstId) {
      selectPaper(firstId, false);
    }
  } catch (error) {
    els.list.innerHTML = `<div class="empty-state">${escapeHtml(error.message)}<br>node server.js で起動してから開いてください。</div>`;
  }
}

init();
