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

  var MONTHS = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12,
  };

  function parseDateValue(value) {
    if (!value) return 0;
    var parts = value.split("-");
    var year = parseInt(parts[0], 10) || 0;
    var month = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 12;
    return year * 100 + month;
  }

  function parseDisplayDate(text) {
    var match = text.match(/([A-Za-z]+)\s+(\d{4})/);
    if (!match) return 0;

    var month = MONTHS[match[1].toLowerCase()] || 0;
    var year = parseInt(match[2], 10) || 0;
    if (!month || !year) return 0;

    return year * 100 + month;
  }

  function getProjectSortKey(timeEl) {
    if (!timeEl) return 0;

    var explicitSort = timeEl.getAttribute("data-sort-date");
    if (explicitSort) return parseDateValue(explicitSort);

    var text = timeEl.textContent.trim();
    if (text.indexOf(" - ") !== -1) {
      var endPart = text.split(" - ").pop().trim();
      var endKey = parseDisplayDate(endPart);
      if (endKey) return endKey;
    }

    var displayKey = parseDisplayDate(text);
    if (displayKey) return displayKey;

    return parseDateValue(timeEl.getAttribute("datetime") || "0");
  }

  function getProjectYear(timeEl) {
    if (!timeEl) return 0;

    var groupYear = timeEl.getAttribute("data-group-year");
    if (groupYear) return parseInt(groupYear, 10) || 0;

    var text = timeEl.textContent.trim();
    if (text.indexOf(" - ") !== -1) {
      var startPart = text.split(" - ")[0].trim();
      var startKey = parseDisplayDate(startPart);
      if (startKey) return Math.floor(startKey / 100);
    }

    var datetime = timeEl.getAttribute("datetime");
    if (datetime) {
      var dtYear = parseInt(datetime.split("-")[0], 10);
      if (dtYear) return dtYear;
    }

    var key = getProjectSortKey(timeEl);
    return key ? Math.floor(key / 100) : 0;
  }

  function sortProjectItems(projectItems) {
    projectItems.sort(function (a, b) {
      var keyA = getProjectSortKey(a.querySelector(".project-date"));
      var keyB = getProjectSortKey(b.querySelector(".project-date"));
      return keyB - keyA;
    });
    return projectItems;
  }

  function groupProjectListByYear(projectList) {
    if (projectList.dataset.grouped === "true") {
      return Array.prototype.slice.call(
        projectList.closest(".project-timeline, .section-inner, main").querySelectorAll(
          ".project-item"
        )
      );
    }

    var projectItems = sortProjectItems(
      Array.prototype.slice.call(projectList.querySelectorAll(".project-item"))
    );

    var groups = {};
    var yearOrder = [];

    projectItems.forEach(function (item) {
      var year = getProjectYear(item.querySelector(".project-date"));
      if (!groups[year]) {
        groups[year] = [];
        yearOrder.push(year);
      }
      groups[year].push(item);
    });

    yearOrder.sort(function (a, b) {
      return b - a;
    });

    var timeline = document.createElement("div");
    timeline.className = "project-timeline";

    yearOrder.forEach(function (year) {
      var section = document.createElement("section");
      section.className = "project-year-group";
      section.setAttribute("data-year", String(year));

      var marker = document.createElement("div");
      marker.className = "project-year-marker";
      var label = document.createElement("span");
      label.className = "project-year-label";
      label.textContent = year === 0 ? "Undated" : String(year);
      marker.appendChild(label);

      var list = document.createElement("ul");
      list.className = "project-year-list";

      groups[year].forEach(function (item) {
        list.appendChild(item);
      });

      section.appendChild(marker);
      section.appendChild(list);
      timeline.appendChild(section);
    });

    projectList.replaceWith(timeline);
    timeline.dataset.grouped = "true";

    return projectItems;
  }

  function sortProjectList(projectList) {
    if (projectList.classList.contains("project-timeline")) {
      return sortProjectItems(
        Array.prototype.slice.call(projectList.querySelectorAll(".project-item"))
      );
    }

    if (projectList.dataset.grouped === "true") {
      return Array.prototype.slice.call(projectList.querySelectorAll(".project-item"));
    }

    return groupProjectListByYear(projectList);
  }

  function initProjectLists() {
    document.querySelectorAll(".section.projects .project-list").forEach(function (projectList) {
      groupProjectListByYear(projectList);
    });
  }

  function updateProjectYearGroups(root) {
    root.querySelectorAll(".project-year-group").forEach(function (group) {
      var visibleItems = group.querySelectorAll(".project-item:not([hidden])");
      group.hidden = visibleItems.length === 0;
    });
  }

  function initProjectFilters() {
    var filterContainer = document.getElementById("project-filters");
    if (!filterContainer) return;

    var projectRoot = filterContainer.closest(".section-inner, .projects-inner, main");
    if (!projectRoot) return;

    var projectList = projectRoot.querySelector(".project-list");
    var timeline = projectRoot.querySelector(".project-timeline");
    if (!projectList && !timeline) return;

    var projectItems = projectList
      ? groupProjectListByYear(projectList)
      : sortProjectItems(
          Array.prototype.slice.call(timeline.querySelectorAll(".project-item"))
        );
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

      updateProjectYearGroups(projectRoot);
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

  function initProjectToolTags() {
    document.querySelectorAll(".project-meta").forEach(function (meta) {
      if (meta.dataset.toolsConverted === "true") return;

      var text = meta.textContent.trim();
      if (!text) return;

      var tools = text
        .split("·")
        .map(function (tool) {
          return tool.trim();
        })
        .filter(Boolean);

      if (!tools.length) return;

      var list = document.createElement("ul");
      list.className = "project-tools";
      list.setAttribute("aria-label", "Tools used");

      tools.forEach(function (tool) {
        var item = document.createElement("li");
        item.textContent = tool;
        list.appendChild(item);
      });

      meta.replaceWith(list);
      list.dataset.toolsConverted = "true";
    });
  }

  function initProjectDetailModal() {
    var modal = document.getElementById("project-detail-modal");
    if (!modal) return;

    var titleEl = modal.querySelector("#project-modal-title");
    var subtitleEl = modal.querySelector(".project-modal-subtitle");
    var fieldEls = {
      problem: modal.querySelector('[data-project-field="problem"]'),
      built: modal.querySelector('[data-project-field="built"]'),
      measured: modal.querySelector('[data-project-field="measured"]'),
      impact: modal.querySelector('[data-project-field="impact"]'),
    };

    var PROJECT_DETAILS = {
      "squad-sync": {
        problem:
          "Friends struggled to coordinate event planning across group chats, calendars, and shared docs.",
        built:
          "A full-stack web app for scheduling, planning, and hosting events together, vibe coded with Cursor, Claude, and deployed on Vercel.",
        measured:
          "Tracked adoption across friend groups, event completion rate, and time saved versus manual coordination.",
        impact:
          "Delivered a live demo-ready product that made group event planning faster and more structured.",
      },
      "picnic-teardown": {
        problem:
          "Needed a structured way to practice product thinking by breaking down an existing consumer product.",
        built:
          "A Picnic product teardown covering user journeys, empathy mapping, and product mindset development.",
        measured:
          "Evaluated clarity of insights, completeness of journey mapping, and quality of opportunity framing.",
        impact:
          "Built a repeatable teardown framework that strengthened product analysis skills.",
      },
      "canva-productathon": {
        problem:
          "Instagram creators lacked a way to preview how a feed would look before posting.",
        built:
          "A draft mode concept for visualising an Instagram feed pre-post, developed through a Canva x Prodigi productathon.",
        measured:
          "Used user journey mapping, empathy mapping, and competitor analysis to validate the concept.",
        impact:
          "Produced a productathon concept that showed how preview workflows could reduce posting friction.",
      },
      "customer-segmentation": {
        problem:
          "Marketing teams lacked a reliable way to segment customers without manual spreadsheet work.",
        built:
          "An Alteryx data pipeline to extract, transform, and load customer attributes into a Tableau audience visualisation dashboard, with Excel used for validation and ad hoc analysis.",
        measured:
          "Tracked pipeline refresh reliability, dashboard adoption, and accuracy of segmentation outputs against source data.",
        impact:
          "Enabled self-service customer segmentation and reduced reliance on one-off reporting requests.",
      },
      "gcp-migration": {
        problem:
          "Legacy AWS S3-based pipelines needed to move to Google Cloud without disrupting downstream reporting.",
        built:
          "An end-to-end GCP migration using Dataform, Airflow, Control-M, Bamboo, and Claude AI for pipeline development and support.",
        measured:
          "Monitored migration progress, pipeline reliability, job success rates, and downstream data freshness.",
        impact:
          "Migrated core workloads to GCP with a more maintainable orchestration stack.",
      },
      "bdm-trigger": {
        problem:
          "Broker trigger performance was difficult to evaluate without a reliable analytics pipeline.",
        built:
          "A BDM trigger data pipeline using ThoughtSpot, Alteryx, Python, and statistical analysis.",
        measured:
          "Tracked application completion rate, trigger completion rate, and pipeline refresh reliability.",
        impact:
          "Created an evaluation-ready pipeline that surfaced actionable broker performance insights.",
      },
      "ai-fraud": {
        problem:
          "Fraudulent home loan application patterns were hard to detect quickly across operational workflows.",
        built:
          "An AI-assisted fraud detection workflow using Google Copilot and Claude AI to surface suspicious behavioural patterns.",
        measured:
          "Reviewed flagged case quality, analyst review time, and precision of surfaced fraud signals.",
        impact:
          "Helped core operations teams identify fraudulent application behaviour faster.",
      },
      "alteryx-downstream": {
        problem:
          "Downstream reporting dependencies were unclear when upstream Alteryx workflows changed.",
        built:
          "An Alteryx downstream impact analysis using SQL and Claude AI to map workflow dependencies.",
        measured:
          "Tracked affected dashboards, downstream job coverage, and stakeholder validation of impact scope.",
        impact:
          "Improved visibility into downstream impact before workflow changes were released.",
      },
    };

    var defaultDetail = {
      problem: "Describe the core problem or challenge this project addressed.",
      built: "Describe what was built end-to-end, including architecture, tooling, and delivery approach.",
      measured: "Describe the metrics, tests, or evaluation methods used to measure success.",
      impact: "Describe the final impact and result for users, stakeholders, or the business.",
    };

    var lastFocusedElement = null;

    function getCardSummary(item) {
      var title = item.querySelector(".project-card-title");
      var date = item.querySelector(".project-date");
      var desc = item.querySelector(".project-card-desc");
      return {
        title: title ? title.textContent.trim() : "Project",
        subtitle: [
          date ? date.textContent.trim() : "",
          desc ? desc.textContent.trim() : "",
        ]
          .filter(Boolean)
          .join(" · "),
      };
    }

    function openModal(projectId, item) {
      var summary = getCardSummary(item);
      var details = PROJECT_DETAILS[projectId] || defaultDetail;

      titleEl.textContent = summary.title;
      subtitleEl.textContent = summary.subtitle;
      fieldEls.problem.textContent = details.problem;
      fieldEls.built.textContent = details.built;
      fieldEls.measured.textContent = details.measured;
      fieldEls.impact.textContent = details.impact;

      lastFocusedElement = document.activeElement;
      modal.hidden = false;
      document.body.classList.add("project-modal-open");
      modal.querySelector(".project-modal-close").focus();
    }

    function closeModal() {
      modal.hidden = true;
      document.body.classList.remove("project-modal-open");
      if (lastFocusedElement && lastFocusedElement.focus) {
        lastFocusedElement.focus();
      }
    }

    document.querySelectorAll(".project-item[data-project-id]").forEach(function (item) {
      var card = item.querySelector(".project-card--clickable");
      if (!card) return;

      var projectId = item.getAttribute("data-project-id");

      function openFromCard(event) {
        if (event.target.closest("a")) return;
        openModal(projectId, item);
      }

      card.addEventListener("click", openFromCard);
      card.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openModal(projectId, item);
        }
      });
    });

    modal.querySelectorAll("[data-close-modal]").forEach(function (el) {
      el.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", function (event) {
      if (modal.hidden) return;
      if (event.key === "Escape") closeModal();
    });
  }

  function initProjectsPage() {
    initProjectToolTags();
    initProjectLists();
    initProjectFilters();
    initProjectDetailModal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initProjectsPage);
  } else {
    initProjectsPage();
  }

})();
