const API_URL =
  "https://matrimonio-michele-lucia-api.sasy2506.workers.dev/api/rsvp";

const invitationIntro = document.getElementById("invitationIntro");
const introEnvelope = document.getElementById("introEnvelope");
const sealButton = document.getElementById("sealButton");
const siteContent = document.getElementById("siteContent");

const modalOverlay = document.getElementById("modal-overlay");
const openModalBtn = document.getElementById("openModalBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");
const formContent = document.getElementById("form-content");
const successMsg = document.getElementById("success-msg");

const coordToggle = document.getElementById("coord-toggle");
const coordBox = document.getElementById("coord-box");

const rsvpForm = document.getElementById("rsvpForm");
const formMessage = document.getElementById("formMessage");

const attendanceInput = document.getElementById("attendance");
const adultGuestsInput = document.getElementById("adultGuests");
const adultGuestsGroup = document.getElementById("adultGuestsGroup");

const childrenMenuInput = document.getElementById("childrenMenu");
const childrenCountInput = document.getElementById("childrenCount");
const childrenCountGroup = document.getElementById("childrenCountGroup");

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateCountdown() {
  const target = new Date("2026-06-15T11:00:00");
  const now = new Date();
  const diff = target - now;

  let days = "0";
  let hours = "0";
  let mins = "0";
  let secs = "0";

  if (diff > 0) {
    days = String(Math.floor(diff / 86400000));
    hours = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, "0");
    mins = String(Math.floor((diff % 3600000) / 60000)).padStart(2, "0");
    secs = String(Math.floor((diff % 60000) / 1000)).padStart(2, "0");
  }

  setText("cd-giorni", days);
  setText("cd-ore", hours);
  setText("cd-minuti", mins);
  setText("cd-secondi", secs);

  setText("preview-cd-giorni", days);
  setText("preview-cd-ore", hours);
  setText("preview-cd-minuti", mins);
  setText("preview-cd-secondi", secs);
}

function toggleCoord() {
  if (!coordBox || !coordToggle) return;
  coordBox.classList.toggle("visible");
  coordToggle.classList.toggle("open");
}

function openModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  if (!modalOverlay) return;
  modalOverlay.classList.remove("open");
  document.body.style.overflow = "";
}

function showFormMessage(message, type = "") {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.classList.remove("is-error", "is-success");

  if (type) {
    formMessage.classList.add(type);
  }
}

function resetSuccessState() {
  if (!formContent || !successMsg) return;
  formContent.style.display = "";
  successMsg.classList.remove("show");
}

function updateChildrenVisibility() {
  if (!childrenMenuInput || !childrenCountGroup || !childrenCountInput) return;

  if (childrenMenuInput.value === "Si") {
    childrenCountGroup.classList.remove("hidden-field");
    childrenCountInput.required = true;
  } else {
    childrenCountGroup.classList.add("hidden-field");
    childrenCountInput.required = false;
    childrenCountInput.value = "";
  }
}

function updateAttendanceVisibility() {
  if (!attendanceInput || !adultGuestsGroup || !adultGuestsInput) return;

  if (attendanceInput.value === "No") {
    adultGuestsGroup.classList.add("hidden-field");
    adultGuestsInput.required = false;
    adultGuestsInput.value = "";
  } else {
    adultGuestsGroup.classList.remove("hidden-field");
    adultGuestsInput.required = true;
  }
}

async function submitForm(event) {
  event.preventDefault();

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (!rsvpForm) return;

  const fullName = document.getElementById("fullName")?.value.trim() || "";
  const attendance = attendanceInput?.value || "";
  const adultGuests =
    attendance === "Si" ? Number(adultGuestsInput?.value || 0) : 0;
  const childrenMenu = childrenMenuInput?.value || "";
  const childrenCount =
    childrenMenu === "Si" ? Number(childrenCountInput?.value || 0) : 0;
  const foodNotes = document.getElementById("foodNotes")?.value.trim() || "";

  if (!fullName) {
    showFormMessage("Inserisci il nome e cognome famiglia.", "is-error");
    return;
  }

  if (!attendance) {
    showFormMessage("Seleziona se parteciperai.", "is-error");
    return;
  }

  if (attendance === "Si" && !adultGuests) {
    showFormMessage("Seleziona quanti adulti sarete.", "is-error");
    return;
  }

  if (!childrenMenu) {
    showFormMessage("Seleziona se ci saranno bambini.", "is-error");
    return;
  }

  if (childrenMenu === "Si" && !childrenCount) {
    showFormMessage("Seleziona il numero di bambini.", "is-error");
    return;
  }

  const payload = {
    fullName,
    attendance,
    adultGuests,
    childrenMenu,
    childrenCount,
    foodNotes,
  };

  const submitButton = document.getElementById("submitFormBtn");

  try {
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Invio...";
    }

    showFormMessage("");

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || "Invio non riuscito.");
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    if (formContent && successMsg) {
      formContent.style.display = "none";
      successMsg.classList.add("show");
    }

    rsvpForm.reset();
    updateAttendanceVisibility();
    updateChildrenVisibility();

    setTimeout(() => {
      closeModal();
      resetSuccessState();
      showFormMessage("");
    }, 3000);
  } catch (error) {
    showFormMessage(
      error.message || "Si è verificato un errore. Riprova.",
      "is-error",
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = "Conferma la presenza";
    }
  }
}

if (invitationIntro && introEnvelope && sealButton && siteContent) {
  sealButton.addEventListener("click", () => {
    if (
      introEnvelope.classList.contains("is-opening") ||
      introEnvelope.classList.contains("is-zooming")
    ) {
      return;
    }

    window.scrollTo(0, 0);

    introEnvelope.classList.add("is-opening");

    setTimeout(() => {
      window.scrollTo(0, 0);
      siteContent.classList.remove("hidden-before-open");
      siteContent.classList.add("visible");
      updateCountdown();
    }, 900);

    setTimeout(() => {
      introEnvelope.classList.add("is-zooming");
    }, 1220);

    setTimeout(() => {
      invitationIntro.classList.add("hide");
      window.scrollTo(0, 0);
    }, 1900);
  });
}

if (coordToggle) {
  coordToggle.addEventListener("click", toggleCoord);
}

if (openModalBtn) {
  openModalBtn.addEventListener("click", () => {
    resetSuccessState();
    openModal();
  });
}

if (modalCloseBtn) {
  modalCloseBtn.addEventListener("click", closeModal);
}

if (attendanceInput) {
  attendanceInput.addEventListener("change", updateAttendanceVisibility);
}

if (childrenMenuInput) {
  childrenMenuInput.addEventListener("change", updateChildrenVisibility);
}

if (rsvpForm) {
  rsvpForm.addEventListener("submit", submitForm);
}

if (modalOverlay) {
  modalOverlay.addEventListener("click", (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay?.classList.contains("open")) {
    closeModal();
  }
});

updateAttendanceVisibility();
updateChildrenVisibility();
updateCountdown();
setInterval(updateCountdown, 1000);

const sections = ["hero", "dettagli", "programma", "regalo", "conferma"];
const navLinks = document.querySelectorAll("#main-nav a");

if ("IntersectionObserver" in window && navLinks.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((a) => a.classList.remove("active"));
          const link = document.querySelector(
            `#main-nav a[href="#${entry.target.id}"]`,
          );
          if (link) link.classList.add("active");
        }
      });
    },
    { threshold: 0.4 },
  );

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
}
