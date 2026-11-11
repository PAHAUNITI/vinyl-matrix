/**
 * VINYL UI INTERACTIONS & CONTROLLER
 * Handles modal dialogs, era timeline filtering, collector grading calculator,
 * speed comparison switcher, and smooth navigation.
 */

class UiInteractionsController {
  constructor(vinylData, turntableController) {
    this.data = vinylData;
    this.turntable = turntableController;
    this.activeEra = "all";
  }

  init() {
    this.renderMilestones(this.data.milestones);
    this.renderPioneers(this.data.pioneers);
    this.renderRecordsCrate(this.data.records);
    this.bindFilterButtons();
    this.bindGradingCalculator();
    this.bindModalEvents();
    this.setupSmoothScroll();
    this.setupInteractiveMouseGlow();
  }

  renderMilestones(milestones) {
    const container = document.getElementById("timeline-grid");
    if (!container) return;

    container.innerHTML = "";
    milestones.forEach((item, index) => {
      const card = document.createElement("article");
      card.className = "brutalist-card milestone-card";
      card.setAttribute("data-era", item.badge.toLowerCase());

      card.innerHTML = `
        <div class="card-header">
          <span class="badge">${item.badge}</span>
          <span class="card-year">${item.year}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-subtitle">${item.subtitle}</p>
        <p class="card-summary">${item.summary}</p>
        <button class="btn-text read-more-btn" data-milestone-id="${item.id}">
          ИЗУЧИТЬ ДОСЬЕ <span class="arrow">↗</span>
        </button>
      `;

      card.querySelector(".read-more-btn").addEventListener("click", () => {
        this.openMilestoneModal(item);
      });

      container.appendChild(card);
    });
  }

  renderPioneers(pioneers) {
    const container = document.getElementById("pioneers-grid");
    if (!container) return;

    container.innerHTML = "";
    pioneers.forEach((pioneer) => {
      const card = document.createElement("article");
      card.className = "brutalist-card pioneer-card";

      card.innerHTML = `
        <div class="card-header">
          <span class="pioneer-origin">${pioneer.origin}</span>
          <span class="card-year">${pioneer.dates}</span>
        </div>
        <h3 class="card-title">${pioneer.name}</h3>
        <div class="pioneer-role">${pioneer.role}</div>
        <p class="card-summary">${pioneer.contribution}</p>
        <blockquote class="pioneer-quote">${pioneer.quote}</blockquote>
      `;

      container.appendChild(card);
    });
  }

  renderRecordsCrate(records) {
    const container = document.getElementById("crate-selector-grid");
    if (!container) return;

    container.innerHTML = "";
    records.forEach((record, index) => {
      const item = document.createElement("div");
      item.className = `crate-record-item ${index === 0 ? "active" : ""}`;
      item.setAttribute("data-record-id", record.id);

      item.innerHTML = `
        <div class="record-sleeve-mini" style="border-left: 6px solid ${record.vinylHex}">
          <div class="vinyl-disc-mini" style="background-color: ${record.vinylHex}"></div>
          <div class="sleeve-meta">
            <span class="sleeve-title">${record.title}</span>
            <span class="sleeve-artist">${record.artist} (${record.year})</span>
          </div>
        </div>
        <button class="btn-mini-play" aria-label="Поставить на вертушку ${record.title}">
          LOAD ↗
        </button>
      `;

      item.addEventListener("click", () => {
        document.querySelectorAll(".crate-record-item").forEach((el) => el.classList.remove("active"));
        item.classList.add("active");
        this.turntable.loadRecord(record);
      });

      container.appendChild(item);
    });
  }

  bindFilterButtons() {
    const filterBtns = document.querySelectorAll(".era-filter-btn");
    filterBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        filterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        const filter = btn.getAttribute("data-filter");
        this.filterMilestones(filter);
      });
    });
  }

  filterMilestones(filter) {
    const cards = document.querySelectorAll(".milestone-card");
    cards.forEach((card) => {
      if (filter === "all" || card.getAttribute("data-era").includes(filter.toLowerCase())) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  bindGradingCalculator() {
    const select = document.getElementById("grading-select");
    const outputGrade = document.getElementById("grade-output-title");
    const outputDesc = document.getElementById("grade-output-desc");
    const outputFidelity = document.getElementById("grade-fidelity-bar");
    const outputValue = document.getElementById("grade-value-bar");

    if (!select || !outputGrade) return;

    const updateGradeDisplay = () => {
      const selectedIndex = parseInt(select.value, 10);
      const grade = this.data.technicalGuide.gradingSystem[selectedIndex];
      if (!grade) return;

      outputGrade.textContent = `${grade.grade} — ${grade.label}`;
      outputDesc.textContent = grade.desc;

      // Visual fidelity bars based on grade
      const fidelityPercents = [100, 95, 85, 68, 35];
      const valuePercents = [100, 85, 50, 25, 10];

      if (outputFidelity) outputFidelity.style.width = `${fidelityPercents[selectedIndex]}%`;
      if (outputValue) outputValue.style.width = `${valuePercents[selectedIndex]}%`;
    };

    select.addEventListener("change", updateGradeDisplay);
    updateGradeDisplay();
  }

  bindModalEvents() {
    const modal = document.getElementById("detail-modal");
    const closeBtn = document.getElementById("modal-close-btn");
    if (!modal || !closeBtn) return;

    closeBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("active")) {
        modal.classList.remove("active");
      }
    });
  }

  openMilestoneModal(milestone) {
    const modal = document.getElementById("detail-modal");
    const modalTitle = document.getElementById("modal-title");
    const modalSubtitle = document.getElementById("modal-subtitle");
    const modalBody = document.getElementById("modal-body");
    const modalBadge = document.getElementById("modal-badge");

    if (!modal) return;

    if (modalTitle) modalTitle.textContent = milestone.title;
    if (modalSubtitle) modalSubtitle.textContent = `${milestone.year} // ${milestone.subtitle}`;
    if (modalBadge) modalBadge.textContent = milestone.badge;
    if (modalBody) {
      modalBody.innerHTML = `
        <p class="modal-summary-lead">${milestone.summary}</p>
        <div class="modal-divider"></div>
        <div class="modal-deep-text">${milestone.details}</div>
      `;
    }

    modal.classList.add("active");
  }

  setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const targetId = anchor.getAttribute("href");
        if (targetId === "#") return;
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  setupInteractiveMouseGlow() {
    const orb = document.getElementById("mouse-ambient-glow");
    if (!orb) return;

    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    window.addEventListener("mousemove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    const follow = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      orb.style.transform = `translate(${currentX - 160}px, ${currentY - 160}px)`;
      requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }
}

if (typeof window !== "undefined") {
  window.UiInteractionsController = UiInteractionsController;
}
