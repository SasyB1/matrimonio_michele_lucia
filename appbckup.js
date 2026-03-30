const rsvpForm = document.getElementById("rsvpForm");
const formMessage = document.getElementById("formMessage");

const attendanceInput = document.getElementById("attendance");
const fullNameInput = document.getElementById("fullName");
const phoneInput = document.getElementById("phone");
const guestsInput = document.getElementById("guests");

const commonFields = document.getElementById("commonFields");
const yesFields = document.getElementById("yesFields");
const intolerancesWrapper = document.getElementById("intolerancesWrapper");
const hasIntolerances = document.getElementById("hasIntolerances");
const attendanceButtons = document.querySelectorAll(".rsvp-opt");

const invitationIntro = document.getElementById("invitationIntro");
const introEnvelope = document.getElementById("introEnvelope");
const sealButton = document.getElementById("sealButton");
const siteContent = document.getElementById("siteContent");

const giftToggle = document.getElementById("giftToggle");
const ibanPopup = document.getElementById("ibanPopup");
const copyIbanBtn = document.getElementById("copyIbanBtn");
const ibanValue = document.getElementById("ibanValue");
const ibanCopyFeedback = document.getElementById("ibanCopyFeedback");

const API_URL =
  "https://matrimonio-michele-lucia-api.sasy2506.workers.dev/api/rsvp";

/* =========================
   TELEFONO
   ========================= */
if (phoneInput) {
  phoneInput.addEventListener("input", () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 10);
  });

  phoneInput.addEventListener("keypress", (event) => {
    if (!/[0-9]/.test(event.key)) {
      event.preventDefault();
    }
  });

  phoneInput.addEventListener("paste", (event) => {
    event.preventDefault();

    const pastedText = (event.clipboardData || window.clipboardData).getData(
      "text",
    );

    phoneInput.value = pastedText.replace(/\D/g, "").slice(0, 10);
  });
}

/* =========================
   FORM RSVP
   ========================= */
function resetIntolerances() {
  if (hasIntolerances) {
    hasIntolerances.checked = false;
  }

  if (intolerancesWrapper) {
    intolerancesWrapper.classList.add("d-none");
  }

  document
    .querySelectorAll('input[name="intolerances"]')
    .forEach((checkbox) => {
      checkbox.checked = false;
    });
}

function setAttendance(value) {
  if (!attendanceInput) return;

  attendanceInput.value = value;

  attendanceButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });

  if (commonFields) {
    commonFields.classList.remove("d-none");
  }

  if (fullNameInput) {
    fullNameInput.required = true;
  }

  if (phoneInput) {
    phoneInput.required = true;
  }

  const yesInputs =
    yesFields?.querySelectorAll("input, select, textarea") || [];

  if (value === "Si") {
    if (yesFields) {
      yesFields.classList.remove("d-none");
    }

    yesInputs.forEach((el) => {
      el.disabled = false;
    });

    if (guestsInput) {
      guestsInput.required = true;

      if (!guestsInput.value || Number(guestsInput.value) < 1) {
        guestsInput.value = "1";
      }
    }
  } else {
    if (yesFields) {
      yesFields.classList.add("d-none");
    }

    yesInputs.forEach((el) => {
      el.disabled = true;
      el.required = false;
    });

    resetIntolerances();
  }
}

attendanceButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setAttendance(btn.dataset.value);
  });
});

if (hasIntolerances && intolerancesWrapper) {
  hasIntolerances.addEventListener("change", function () {
    if (this.checked) {
      intolerancesWrapper.classList.remove("d-none");
    } else {
      intolerancesWrapper.classList.add("d-none");

      document
        .querySelectorAll('input[name="intolerances"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
    }
  });
}

if (rsvpForm && formMessage) {
  rsvpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "Invio in corso...";

    const formData = new FormData(rsvpForm);
    const turnstileToken =
      formData.get("cf-turnstile-response")?.toString().trim() || "";

    const attendance = attendanceInput?.value?.trim() || "";
    const fullName = formData.get("fullName")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";

    if (!attendance) {
      formMessage.textContent = "Seleziona se parteciperai.";
      return;
    }

    if (!fullName) {
      formMessage.textContent = "Inserisci nome e cognome.";
      return;
    }

    if (!phone) {
      formMessage.textContent = "Inserisci il numero di telefono.";
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      formMessage.textContent =
        "Il numero di telefono deve contenere esattamente 10 cifre.";
      return;
    }

    const payload = {
      fullName,
      phone,
      attendance,
      guests: attendance === "Si" ? Number(formData.get("guests") || 1) : 0,
      intolerances:
        attendance === "Si" && hasIntolerances?.checked
          ? formData.getAll("intolerances")
          : [],
      turnstileToken,
    };

    if (!payload.turnstileToken) {
      formMessage.textContent = "Completa la verifica anti-bot.";
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok || !data.ok) {
        throw new Error(data.error || "Errore durante il salvataggio");
      }

      formMessage.textContent = "Conferma inviata correttamente.";
      rsvpForm.reset();

      if (attendanceInput) {
        attendanceInput.value = "";
      }

      if (commonFields) {
        commonFields.classList.add("d-none");
      }

      if (yesFields) {
        yesFields.classList.add("d-none");
      }

      if (intolerancesWrapper) {
        intolerancesWrapper.classList.add("d-none");
      }

      if (yesFields) {
        yesFields.querySelectorAll("input, select, textarea").forEach((el) => {
          el.disabled = false;
          el.required = false;
        });
      }

      resetIntolerances();
      attendanceButtons.forEach((btn) => btn.classList.remove("active"));

      if (window.turnstile) {
        window.turnstile.reset();
      }
    } catch (error) {
      formMessage.textContent =
        error.message || "Errore inatteso durante l'invio.";

      if (window.turnstile) {
        window.turnstile.reset();
      }
    }
  });
}

/* =========================
   APERTURA INVITO
   ========================= */
if (sealButton && introEnvelope && invitationIntro && siteContent) {
  sealButton.addEventListener("click", () => {
    siteContent.classList.remove("hidden-before-open");
    siteContent.classList.add("visible");

    requestAnimationFrame(() => {
      introEnvelope.classList.add("opened");
    });

    setTimeout(() => {
      invitationIntro.classList.add("hide");
    }, 520);
  });
}

/* =========================
   POPUP IBAN
   ========================= */
if (giftToggle && ibanPopup) {
  giftToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    ibanPopup.classList.toggle("d-none");
  });

  ibanPopup.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  document.addEventListener("click", () => {
    ibanPopup.classList.add("d-none");
  });
}

if (copyIbanBtn && ibanValue && ibanCopyFeedback) {
  copyIbanBtn.addEventListener("click", async (event) => {
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(ibanValue.textContent.trim());
      ibanCopyFeedback.classList.add("visible");

      setTimeout(() => {
        ibanCopyFeedback.classList.remove("visible");
      }, 1400);
    } catch (error) {
      ibanCopyFeedback.textContent = "Errore copia";
      ibanCopyFeedback.classList.add("visible");

      setTimeout(() => {
        ibanCopyFeedback.textContent = "Copiato!";
        ibanCopyFeedback.classList.remove("visible");
      }, 1400);
    }
  });
}
