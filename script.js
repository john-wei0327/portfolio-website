(function () {
  /**
   * FormSubmit: inbox is tied to this form id (from their confirmation email).
   * CONTACT_EMAIL is only for the fallback hint if submit fails.
   */
  var CONTACT_EMAIL = "johnwei0327@gmail.com";
  var FORMSUBMIT_FORM_ID = "497e311e0e0cca45119ca264025fef4d";
  var FORMSUBMIT_AJAX = "https://formsubmit.co/ajax/" + FORMSUBMIT_FORM_ID;

  var form = document.getElementById("contact-form");
  var err = document.getElementById("form-error");
  var ok = document.getElementById("form-success");

  if (!form || !err || !ok) return;

  function setError(msg) {
    ok.hidden = true;
    err.hidden = !msg;
    err.textContent = msg || "";
  }

  function validate() {
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var message = document.getElementById("message");
    if (!name || !email || !message) return false;

    if (!name.value.trim()) {
      setError("Please enter your name.");
      name.focus();
      return false;
    }
    if (!email.value.trim() || !email.validity.valid) {
      setError("Please enter a valid email address.");
      email.focus();
      return false;
    }
    if (!message.value.trim()) {
      setError("Please add a short message.");
      message.focus();
      return false;
    }
    setError("");
    return true;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!validate()) return;

    var name = document.getElementById("name").value.trim();
    var email = document.getElementById("email").value.trim();
    var message = document.getElementById("message").value.trim();
    var submitBtn = form.querySelector('button[type="submit"]');
    var label = submitBtn ? submitBtn.textContent : "";

    setError("");
    ok.hidden = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    fetch(FORMSUBMIT_AJAX, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: name,
        email: email,
        message: message,
        _subject: "Portfolio contact from " + name,
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) {
            throw new Error(
              (data && data.message) || "Could not send your message."
            );
          }
          return data;
        });
      })
      .then(function () {
        ok.hidden = false;
        form.reset();
      })
      .catch(function () {
        setError(
          "Could not send right now. Please try again or email " +
            CONTACT_EMAIL +
            " directly."
        );
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = label || "Send message";
        }
      });
  });
})();
