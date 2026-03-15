const rsvpForm = document.getElementById("rsvpForm");
const formMessage = document.getElementById("formMessage");

const API_URL =
  "https://matrimonio-michele-lucia-api.sasy2506.workers.dev/api/rsvp";

if (rsvpForm && formMessage) {
  rsvpForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    formMessage.textContent = "Invio in corso...";

    const formData = new FormData(rsvpForm);

    const payload = {
      fullName: formData.get("fullName")?.toString().trim() || "",
      attendance: formData.get("attendance")?.toString().trim() || "",
      guests: Number(formData.get("guests") || 1),
      intolerances: formData.getAll("intolerances"),
      notes: formData.get("notes")?.toString().trim() || "",
    };

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
    } catch (error) {
      formMessage.textContent =
        error.message || "Errore inatteso durante l'invio.";
    }
  });
}
