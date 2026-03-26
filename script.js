(function () {
  /** Change to your email — used for mailto drafts */
  var CONTACT_EMAIL = "johnwei0327@gmail.com";

  var form = document.getElementById("contact-form");
  var err = document.getElementById("form-error");
  var ok = document.getElementById("form-success");

  if (!form || !err || !ok) return;

  var successMail = ok.querySelector("a[href^='mailto:']");
  if (successMail) {
    successMail.href = "mailto:" + CONTACT_EMAIL;
    successMail.textContent = CONTACT_EMAIL;
  }

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
    var body =
      "Name: " +
      name +
      "\n" +
      "Email: " +
      email +
      "\n\n" +
      document.getElementById("message").value.trim();

    var subject = encodeURIComponent("Portfolio contact from " + name);
    var mailto =
      "mailto:" +
      CONTACT_EMAIL +
      "?subject=" +
      subject +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = mailto;
    ok.hidden = false;
    form.reset();
  });
})();
