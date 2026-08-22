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

  if (form && err && ok) {
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
  }

  function initProjectFilters() {
    var filterContainer = document.getElementById("project-filters");
    if (!filterContainer) return;

    var projectRoot = filterContainer.closest(".section-inner, .projects-inner, main");
    if (!projectRoot) return;

    var projectItems = projectRoot.querySelectorAll(".project-list .project-item");
    if (!projectItems.length) return;

    var categories = [];

    projectItems.forEach(function (item) {
      var kinds = item.querySelectorAll(".project-card-title-row .project-card-kind");
      var itemCategories = [];

      kinds.forEach(function (kind) {
        var label = kind.textContent.trim();
        if (label && itemCategories.indexOf(label) === -1) {
          itemCategories.push(label);
        }
        if (label && categories.indexOf(label) === -1) {
          categories.push(label);
        }
      });

      item.dataset.categories = itemCategories.join("|");
    });

    categories.sort();
    filterContainer.textContent = "";

    function countForFilter(filter) {
      if (filter === "all") return projectItems.length;
      var count = 0;
      projectItems.forEach(function (item) {
        var cats = (item.dataset.categories || "").split("|");
        if (cats.indexOf(filter) !== -1) count++;
      });
      return count;
    }

    function applyFilter(filter) {
      projectItems.forEach(function (item) {
        var itemCategories = (item.dataset.categories || "").split("|");
        var visible =
          filter === "all" || itemCategories.indexOf(filter) !== -1;
        item.hidden = !visible;
      });

      filterContainer.querySelectorAll(".project-filter-btn").forEach(function (btn) {
        var isActive = btn.getAttribute("data-filter") === filter;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    }

    function createFilterButton(label, value) {
      var btn = document.createElement("button");
      var labelEl = document.createElement("span");
      var countEl = document.createElement("span");

      btn.type = "button";
      btn.className = "project-filter-btn";
      btn.setAttribute("data-filter", value);
      btn.setAttribute("aria-pressed", value === "all" ? "true" : "false");

      labelEl.className = "project-filter-label";
      labelEl.textContent = label;
      countEl.className = "project-filter-count";
      countEl.textContent = String(countForFilter(value));

      btn.appendChild(labelEl);
      btn.appendChild(countEl);

      if (value === "all") {
        btn.classList.add("is-active");
      }

      btn.addEventListener("click", function () {
        applyFilter(value);
      });
      return btn;
    }

    filterContainer.appendChild(createFilterButton("All work", "all"));
    categories.forEach(function (category) {
      filterContainer.appendChild(createFilterButton(category, category));
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectFilters);
  } else {
    initProjectFilters();
  }

})();
