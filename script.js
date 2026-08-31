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
    var typeFilterContainer = document.getElementById("project-type-filters");
    if (!filterContainer || !typeFilterContainer) return;

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
    var activeCategory = "all";
    var activeType = "all";

    projectItems.forEach(function (item) {
      var kinds = item.querySelectorAll(".project-card-kind");
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
      if (!item.dataset.projectType) {
        item.dataset.projectType = "professional";
      }
    });

    categories.sort();

    function matchesActiveType(item) {
      return activeType === "all" || item.dataset.projectType === activeType;
    }

    function countForCategory(filter) {
      var count = 0;
      projectItems.forEach(function (item) {
        if (!matchesActiveType(item)) return;
        if (filter === "all") {
          count++;
          return;
        }
        var cats = (item.dataset.categories || "").split("|");
        if (cats.indexOf(filter) !== -1) count++;
      });
      return count;
    }

    function countForType(filter) {
      if (filter === "all") return projectItems.length;
      var count = 0;
      projectItems.forEach(function (item) {
        if (item.dataset.projectType === filter) count++;
      });
      return count;
    }

    function updateCategoryCounts() {
      filterContainer.querySelectorAll(".project-filter-btn").forEach(function (btn) {
        var filter = btn.getAttribute("data-filter");
        var countEl = btn.querySelector(".project-filter-count");
        if (countEl) {
          countEl.textContent = String(countForCategory(filter));
        }
      });
    }

    function applyFilters() {
      projectItems.forEach(function (item) {
        var itemCategories = (item.dataset.categories || "").split("|");
        var categoryMatch =
          activeCategory === "all" || itemCategories.indexOf(activeCategory) !== -1;
        var typeMatch = matchesActiveType(item);
        item.hidden = !(categoryMatch && typeMatch);
      });

      filterContainer.querySelectorAll(".project-filter-btn").forEach(function (btn) {
        var isActive = btn.getAttribute("data-filter") === activeCategory;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      typeFilterContainer.querySelectorAll(".project-type-toggle-btn").forEach(function (btn) {
        var isActive = btn.getAttribute("data-type-filter") === activeType;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      updateCategoryCounts();
      updateProjectYearGroups(projectRoot);
    }

    function createCategoryFilterButton(label, value) {
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
      countEl.textContent = String(countForCategory(value));

      btn.appendChild(labelEl);
      btn.appendChild(countEl);

      if (value === "all") {
        btn.classList.add("is-active");
      }

      btn.addEventListener("click", function () {
        activeCategory = value;
        applyFilters();
      });
      return btn;
    }

    function createTypeToggleButton(label, value) {
      var btn = document.createElement("button");
      var labelEl = document.createElement("span");
      var countEl = document.createElement("span");

      btn.type = "button";
      btn.className = "project-type-toggle-btn";
      btn.setAttribute("data-type-filter", value);
      btn.setAttribute("aria-pressed", value === "all" ? "true" : "false");

      labelEl.className = "project-type-toggle-label";
      labelEl.textContent = label;
      countEl.className = "project-type-toggle-count";
      countEl.textContent = String(countForType(value));

      btn.appendChild(labelEl);
      btn.appendChild(countEl);

      if (value === "all") {
        btn.classList.add("is-active");
      }

      btn.addEventListener("click", function () {
        activeType = value;
        applyFilters();
      });
      return btn;
    }

    filterContainer.textContent = "";
    typeFilterContainer.textContent = "";

    typeFilterContainer.appendChild(createTypeToggleButton("All work", "all"));
    typeFilterContainer.appendChild(createTypeToggleButton("Professional", "professional"));
    typeFilterContainer.appendChild(createTypeToggleButton("Personal", "personal"));

    filterContainer.appendChild(createCategoryFilterButton("All work", "all"));
    categories.forEach(function (category) {
      filterContainer.appendChild(createCategoryFilterButton(category, category));
    });

    applyFilters();
  }

  function initProjectCardLayout() {
    document.querySelectorAll(".project-card-main").forEach(function (main) {
      if (main.dataset.layoutInit === "true") return;

      var titleRow = main.querySelector(".project-card-title-row");
      if (!titleRow) return;

      var title = titleRow.querySelector(".project-card-title");
      if (!title) return;

      var kinds = Array.prototype.slice.call(
        titleRow.querySelectorAll(".project-card-kind")
      );
      var date = main.querySelector(".project-date");

      var header = document.createElement("div");
      header.className = "project-card-header";

      var heading = document.createElement("div");
      heading.className = "project-card-heading";
      heading.appendChild(title);
      if (date) {
        heading.appendChild(date);
      }

      header.appendChild(heading);

      if (kinds.length) {
        var kindsGroup = document.createElement("div");
        kindsGroup.className = "project-card-kinds";
        kinds.forEach(function (kind) {
          kindsGroup.appendChild(kind);
        });
        header.appendChild(kindsGroup);
      }

      main.insertBefore(header, titleRow);
      titleRow.remove();
      main.dataset.layoutInit = "true";
    });
  }

  function initProjectCardActions() {
    document.querySelectorAll(".project-item").forEach(function (item) {
      var card = item.querySelector(".project-card");
      if (!card) return;

      var actions = card.querySelector(".project-card-actions");
      if (!actions || actions.dataset.moved === "true") return;

      actions.hidden = true;
      item.insertBefore(actions, item.firstChild);
      actions.dataset.moved = "true";
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
    var actionsEl = modal.querySelector(".project-modal-actions");
    var fieldEls = {
      context: modal.querySelector('[data-project-field="context-and-objective"]'),
      methodology: modal.querySelector('[data-project-field="methodology"]'),
      results: modal.querySelector('[data-project-field="results"]'),
      impact: modal.querySelector('[data-project-field="impact"]'),
    };

    var PROJECT_DETAILS = {
      "squad-sync": {
        "context-and-objective":
          "Friends struggled to coordinate event planning across group chats, calendars, and shared docs.",
        methodology:
          "A full-stack web app for scheduling, planning, and hosting events together, vibe coded with Cursor, Claude, and deployed on Vercel.",
        results:
          "Tracked adoption across friend groups, event completion rate, and time saved versus manual coordination.",
        impact:
          "Delivered a live demo-ready product that made group event planning faster and more structured.",
      },
      "picnic-teardown": {
        "context-and-objective":
          "Needed a structured way to practice product thinking by breaking down an existing consumer product.",
        methodology:
          "A Picnic product teardown covering user journeys, empathy mapping, and product mindset development.",
        results:
          "Evaluated clarity of insights, completeness of journey mapping, and quality of opportunity framing.",
        impact:
          "Built a repeatable teardown framework that strengthened product analysis skills.",
      },
      "canva-productathon": {
        "context-and-objective":
          "Instagram creators lacked a way to preview how a feed would look before posting.",
        methodology:
          "A draft mode concept for visualising an Instagram feed pre-post, developed through a Canva x Prodigi productathon.",
        results:
          "Used user journey mapping, empathy mapping, and competitor analysis to validate the concept.",
        impact:
          "Produced a productathon concept that showed how preview workflows could reduce posting friction.",
      },
      "customer-segmentation": {
        "context-and-objective":
          "The organization lacked a self-service tool to filter, isolate, and perform granular side-by-side comparative analysis between distinct customer cohorts stored in a wide data mart.",
        methodology:
          "Built an Alteryx ETL pipeline to extract, aggregate, and batch-load multi-dimensional customer data into Tableau daily. Designed an interactive dashboard enabling stakeholders to run side-by-side demographic comparisons across target customer segments.",
        results:
          "Tracked pipeline refresh reliability, dashboard adoption, and accuracy of segmentation outputs against source data.",
        impact:
          "Delivered a proof-of-concept demonstrating the feasibility of self-service audience profiling and comparative cohort analysis for business stakeholders.",
      },
      "gcp-migration": {
        "context-and-objective":
          "Migrate legacy AWS S3 data tables to Google Cloud Platform (BigQuery) without disrupting daily operational reporting or downstream SLA commitments.",
        methodology:
          "Architected automated migration pipelines leveraging Bamboo, Python, Dataform, and Airflow DAG templates. Built custom Python profiling tools via Claude AI to determine source data grain and separate historical backfills from daily incremental loads to run asynchronously.",
        results:
          "Monitored migration progress, pipeline reliability, job success rates, and downstream data freshness.",
        impact:
          "Reduced per-table migration turnaround from 2 weeks to 3–4 days, successfully migrating over 80% of all major enterprise runstreams.",
      },
      "aggregator-pipeline": {
        "context-and-objective":
          "Third-party aggregator data for verifying home loan customer information was arriving manually as Excel files, with no defined structure or automated process.",
        methodology:
          "Investigated the data's frequency and content, designed a target structure, and built a pipeline to receive, transform, and load it automatically.",
        results:
          "Replaced a manual, ad hoc process with a repeatable, automated pipeline.",
        impact:
          "Removed a manual bottleneck and made third-party data reliably available for downstream use in loan processing.",
      },
      "bdm-trigger": {
        "context-and-objective":
          "Business Development Managers (BDMs) required a centralized, automated system to trigger targeted broker outreach and measure statistical impact on loan application volume and value.",
        methodology:
          "Built an end-to-end trigger orchestration pipeline using Alteryx, Python, GCP, and ThoughtSpot. Integrated modular business logic to assign test/control groups, enforce priority filtering, and maintain a 60-day contact exclusion window. Built inline data quality controls, automated daily alert summaries, and a Bayesian/Frequentist statistical framework to analyze incremental lift.",
        results:
          "Tracked application completion rate, trigger completion rate, and pipeline refresh reliability.",
        impact:
          "Delivered a scalable infrastructure that remains in production two years later, expanding to support 15+ active triggers and ongoing executive performance tracking.",
      },
      "trigger-ab-testing": {
        "context-and-objective":
          "A trigger system flagging at-risk home loan applications lifted broker follow-up action from 30% to 80% — but did that operational win actually drive more completed loans, or could the volume increase have other explanations?",
        methodology:
          "Tested the causal impact using both frequentist and Bayesian A/B testing approaches in Python, comparing loan volume for intervention vs. non-intervention cohorts.",
        results:
          "Inconclusive — sample size was too small to detect statistical significance under either framework, despite the strong operational uplift.",
        impact:
          "Leadership continued the rollout based on the operational uplift, while treating the volume/revenue link as an unconfirmed hypothesis rather than overstating impact.",
      },
      "ai-fraud": {
        "context-and-objective":
          "Surging AI-driven home loan application fraud created a need for faster, higher-precision risk triaging to assist operations teams.",
        methodology:
          "Engineered a multi-dimensional fraud research workflow using Claude AI and Google Copilot. Combined public registry data (ABS, ATO, ABR) across 10 verification dimensions with internal pattern-recognition tools to construct composite entity likelihood scores and flag high-risk anomalies (e.g., shared collateral, sanctioned entity associations).",
        results:
          "Reviewed flagged case quality, analyst review time, and precision of surfaced fraud signals.",
        impact:
          "Streamlined initial fraud triage for operations teams, laying the architectural blueprint for an automated risk-scoring and escalation pipeline.",
      },
      "alteryx-downstream": {
        "context-and-objective":
          "Database updates for an automated home loan screening system risked breaking downstream reporting pipelines and core business metrics due to unmapped data dependencies.",
        methodology:
          "Developed a data lineage mapping tool using Alteryx, SQL and Claude AI to dissect complex Alteryx workflows and output self-service flowchart diagrams. Implemented an additive feature-flagging strategy in output schemas and historical partition filters, preserving baseline metric integrity while enabling fine-grained tracking.",
        results:
          "Tracked affected dashboards, downstream job coverage, and stakeholder validation of impact scope.",
        impact:
          "Reduced manual analysis overhead and completed dependency mapping two weeks ahead of schedule, allowing downstream reporting updates to go live early alongside production releases.",
      },
    };

    var defaultDetail = {
      "context-and-objective": "Describe the context and objective this project addressed.",
      methodology: "Describe the methodology used, including architecture, tooling, and delivery approach.",
      results: "Describe the results, metrics, tests, or evaluation findings.",
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

    function getActionLabel(link) {
      var aria = (link.getAttribute("aria-label") || "").trim();
      if (/write-up/i.test(aria)) return "View write-up";
      if (/\bsite\b/i.test(aria)) return "View live site";
      if (aria) return aria.replace(/^Open\s+/i, "");
      return "Open link";
    }

    function populateModalActions(item) {
      if (!actionsEl) return;

      actionsEl.innerHTML = "";
      actionsEl.hidden = true;

      var sourceActions = item.querySelector(".project-card-actions");
      if (!sourceActions) return;

      var links = sourceActions.querySelectorAll("a[href]");
      if (!links.length) return;

      links.forEach(function (link) {
        var row = document.createElement("a");
        row.className = "project-modal-action-row";
        row.href = link.href;
        row.target = "_blank";
        row.rel = "noopener noreferrer";
        row.setAttribute("aria-label", link.getAttribute("aria-label") || getActionLabel(link));

        var iconWrap = document.createElement("span");
        iconWrap.className = "project-modal-action-icon";
        var icon = link.querySelector("svg");
        if (icon) {
          iconWrap.appendChild(icon.cloneNode(true));
        }

        var label = document.createElement("span");
        label.className = "project-modal-action-label";
        label.textContent = getActionLabel(link);

        row.appendChild(iconWrap);
        row.appendChild(label);
        actionsEl.appendChild(row);
      });

      actionsEl.hidden = false;
    }

    function openModal(projectId, item) {
      var summary = getCardSummary(item);
      var details = PROJECT_DETAILS[projectId] || defaultDetail;

      titleEl.textContent = summary.title;
      subtitleEl.textContent = summary.subtitle;
      populateModalActions(item);
      fieldEls.context.textContent = details["context-and-objective"];
      fieldEls.methodology.textContent = details.methodology;
      fieldEls.results.textContent = details.results;
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

  function initFunMode() {
    var toggle = document.getElementById("fun-toggle");
    var layer = document.getElementById("fun-float-layer");
    if (!toggle || !layer) return;

    var SIZE = 56;
    var RADIUS = SIZE / 2;
    var POP_MS = 340;
    var GONE_MS = 5000;
    var FUN_ITEMS = [
      { id: "tennis-racket", label: "Tennis racket", emoji: "🎾" },
      { id: "badminton-racket", label: "Badminton racket", emoji: "🏸" },
      { id: "shuttlecock", label: "Badminton shuttlecock", emoji: "🪶" },
      { id: "pottery-mugs", label: "Pottery mugs", emoji: "🍵" },
      { id: "running-shoes", label: "Running shoes", emoji: "👟" },
      { id: "karaoke-microphone", label: "Karaoke microphone", emoji: "🎤" },
      { id: "board-games", label: "Card and board games", emoji: "🎲" },
      { id: "books", label: "Books", emoji: "📚" },
      { id: "dancing", label: "Dancing", emoji: "💃" },
    ];
    var ITEM_BY_ID = {};
    FUN_ITEMS.forEach(function (item) {
      ITEM_BY_ID[item.id] = item;
    });
    var SPAWN_MAP = {
      badminton: ["badminton-racket", "shuttlecock"],
      tennis: ["tennis-racket"],
      "board-games": ["board-games"],
      singing: ["karaoke-microphone"],
      dancing: ["dancing"],
      pottery: ["pottery-mugs"],
    };
    var MAX_BODIES = 40;
    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    var HOLD_MS = 5000;
    var FADE_MS = reduceMotion ? 800 : 3000;
    var wordButtons = Array.prototype.slice.call(
      document.querySelectorAll(".fun-word")
    );

    var bodies = [];
    var running = false;
    var rafId = 0;
    var timeouts = [];

    function clearTimeouts() {
      timeouts.forEach(function (id) {
        clearTimeout(id);
      });
      timeouts = [];
    }

    function getPlayBounds() {
      var header = document.querySelector(".header");
      var footer = document.querySelector(".site-footer");
      var top = header ? header.getBoundingClientRect().bottom : 0;
      var bottom = footer
        ? footer.getBoundingClientRect().top
        : window.innerHeight;
      return {
        left: 0,
        top: top,
        right: window.innerWidth,
        bottom: bottom,
      };
    }

    function randomVelocity() {
      var speed = 1.1 + Math.random() * 1.7;
      var angle = Math.random() * Math.PI * 2;
      return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      };
    }

    function randomPosition() {
      var bounds = getPlayBounds();
      var pad = RADIUS + 8;
      var width = Math.max(bounds.right - bounds.left, pad * 2 + 1);
      var height = Math.max(bounds.bottom - bounds.top, pad * 2 + 1);
      return {
        x: bounds.left + pad + Math.random() * (width - pad * 2),
        y: bounds.top + pad + Math.random() * (height - pad * 2),
      };
    }

    function renderBody(body) {
      body.el.style.transform =
        "translate(" + (body.x - RADIUS) + "px, " + (body.y - RADIUS) + "px)";
    }

    function bounceWalls(body) {
      var bounds = getPlayBounds();
      if (body.x - RADIUS < bounds.left) {
        body.x = bounds.left + RADIUS;
        body.vx = Math.abs(body.vx);
      } else if (body.x + RADIUS > bounds.right) {
        body.x = bounds.right - RADIUS;
        body.vx = -Math.abs(body.vx);
      }
      if (body.y - RADIUS < bounds.top) {
        body.y = bounds.top + RADIUS;
        body.vy = Math.abs(body.vy);
      } else if (body.y + RADIUS > bounds.bottom) {
        body.y = bounds.bottom - RADIUS;
        body.vy = -Math.abs(body.vy);
      }
    }

    function resolveCollisions() {
      var minDist = RADIUS * 2;
      var i;
      var j;
      for (i = 0; i < bodies.length; i += 1) {
        if (!bodies[i].active) continue;
        for (j = i + 1; j < bodies.length; j += 1) {
          if (!bodies[j].active) continue;
          var a = bodies[i];
          var b = bodies[j];
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          var dist = Math.hypot(dx, dy);
          if (dist >= minDist) continue;

          var nx;
          var ny;
          if (dist < 0.001) {
            var angle = Math.random() * Math.PI * 2;
            nx = Math.cos(angle);
            ny = Math.sin(angle);
            dist = 0.001;
          } else {
            nx = dx / dist;
            ny = dy / dist;
          }

          var overlap = minDist - dist;
          a.x -= nx * overlap * 0.5;
          a.y -= ny * overlap * 0.5;
          b.x += nx * overlap * 0.5;
          b.y += ny * overlap * 0.5;

          var rel = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (rel <= 0) continue;

          a.vx -= rel * nx;
          a.vy -= rel * ny;
          b.vx += rel * nx;
          b.vy += rel * ny;
        }
      }
    }

    function tick() {
      if (!running) return;
      bodies.forEach(function (body) {
        if (!body.active) return;
        body.x += body.vx;
        body.y += body.vy;
        bounceWalls(body);
      });
      resolveCollisions();
      resolveCollisions();
      bodies.forEach(function (body) {
        if (!body.active) return;
        bounceWalls(body);
        renderBody(body);
      });
      rafId = window.requestAnimationFrame(tick);
    }

    function cancelFade(body) {
      if (body.holdTimer) {
        window.clearTimeout(body.holdTimer);
        body.holdTimer = 0;
      }
      if (body.fadeTimer) {
        window.clearTimeout(body.fadeTimer);
        body.fadeTimer = 0;
      }
      if (!body.fading) return;
      body.fading = false;
      body.el.classList.remove("is-fading");
    }

    function removeBody(body) {
      if (!running) return;
      cancelFade(body);
      var index = bodies.indexOf(body);
      if (index !== -1) bodies.splice(index, 1);
      if (body.el && body.el.parentNode) {
        body.el.parentNode.removeChild(body.el);
      }
    }

    function startFadeOut(body) {
      if (!body.active || body.fading || body.el.hidden) return;
      body.fading = true;
      body.el.classList.remove("is-fading");
      void body.el.offsetWidth;
      body.el.classList.add("is-fading");
      body.fadeTimer = window.setTimeout(function () {
        removeBody(body);
      }, FADE_MS);
      timeouts.push(body.fadeTimer);
    }

    function scheduleFadeOut(body) {
      if (!body.active || body.fading || body.holdTimer || body.el.hidden) {
        return;
      }
      body.holdTimer = window.setTimeout(function () {
        body.holdTimer = 0;
        startFadeOut(body);
      }, HOLD_MS);
      timeouts.push(body.holdTimer);
    }

    function pruneDuplicates() {
      var byKind = {};
      bodies.forEach(function (body) {
        if (!body.active || body.el.hidden) return;
        if (!byKind[body.kind]) byKind[body.kind] = [];
        byKind[body.kind].push(body);
      });
      Object.keys(byKind).forEach(function (kind) {
        var group = byKind[kind];
        group.sort(function (a, b) {
          if (a.ephemeral !== b.ephemeral) return a.ephemeral ? 1 : -1;
          return a.born - b.born;
        });
        cancelFade(group[0]);
        group.slice(1).forEach(scheduleFadeOut);
      });
    }

    function respawn(body) {
      if (!running) return;
      var pos = randomPosition();
      var vel = randomVelocity();
      body.x = pos.x;
      body.y = pos.y;
      body.vx = vel.vx;
      body.vy = vel.vy;
      body.el.classList.remove("is-popping");
      body.el.style.opacity = "";
      body.el.style.transition = "";
      renderBody(body);
      body.el.hidden = false;
      body.active = true;
      pruneDuplicates();
    }

    function popBody(body) {
      if (!body.active || !running) return;
      cancelFade(body);
      body.el.style.transition = "none";
      body.active = false;
      body.el.classList.add("is-popping");
      var hideId = window.setTimeout(function () {
        if (!running) return;
        if (body.ephemeral) {
          removeBody(body);
          pruneDuplicates();
          return;
        }
        body.el.hidden = true;
        body.el.classList.remove("is-popping");
        body.el.style.opacity = "";
        body.el.style.transition = "";
        pruneDuplicates();
      }, POP_MS);
      timeouts.push(hideId);
      if (body.ephemeral) return;
      var spawnId = window.setTimeout(function () {
        respawn(body);
      }, POP_MS + GONE_MS);
      timeouts.push(spawnId);
    }

    function addBody(item, options) {
      options = options || {};
      var button = document.createElement("button");
      button.type = "button";
      button.className = "fun-float-item";
      button.setAttribute("aria-label", "Pop " + item.label);
      var glyph = document.createElement("span");
      glyph.className = "fun-float-glyph";
      glyph.setAttribute("aria-hidden", "true");
      glyph.textContent = item.emoji;
      button.appendChild(glyph);
      layer.appendChild(button);

      var pos = randomPosition();
      var vel = randomVelocity();
      var body = {
        el: button,
        kind: item.id,
        ephemeral: !!options.ephemeral,
        fading: false,
        holdTimer: 0,
        fadeTimer: 0,
        born: Date.now(),
        x: pos.x,
        y: pos.y,
        vx: vel.vx,
        vy: vel.vy,
        active: true,
      };
      renderBody(body);
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        popBody(body);
      });
      bodies.push(body);
      if (options.ephemeral) pruneDuplicates();
      return body;
    }

    function spawnFromWord(kind) {
      if (!running || bodies.length >= MAX_BODIES) return;
      var ids = SPAWN_MAP[kind];
      if (!ids || !ids.length) return;
      var id = ids[Math.floor(Math.random() * ids.length)];
      var item = ITEM_BY_ID[id];
      if (item) addBody(item, { ephemeral: true });
    }

    function setWordButtonsEnabled(enabled) {
      document.body.classList.toggle("fun-mode-on", enabled);
      wordButtons.forEach(function (btn) {
        btn.disabled = !enabled;
      });
    }

    function createBodies() {
      layer.innerHTML = "";
      bodies = [];
      FUN_ITEMS.forEach(function (item) {
        addBody(item);
      });
    }

    function startFun() {
      if (running) return;
      running = true;
      layer.hidden = false;
      setWordButtonsEnabled(true);
      createBodies();
      rafId = window.requestAnimationFrame(tick);
    }

    function stopFun() {
      running = false;
      window.cancelAnimationFrame(rafId);
      rafId = 0;
      clearTimeouts();
      bodies = [];
      layer.innerHTML = "";
      layer.hidden = true;
      setWordButtonsEnabled(false);
      toggle.classList.remove("is-on");
      toggle.setAttribute("aria-pressed", "false");
    }

    toggle.addEventListener("click", function () {
      var turningOn = toggle.getAttribute("aria-pressed") !== "true";
      toggle.setAttribute("aria-pressed", turningOn ? "true" : "false");
      toggle.classList.toggle("is-on", turningOn);
      if (turningOn) startFun();
      else stopFun();
    });

    wordButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        spawnFromWord(btn.getAttribute("data-fun-spawn"));
      });
    });

    window.addEventListener("pagehide", stopFun);
  }

  function initProjectsPage() {
    initProjectCardLayout();
    initProjectCardActions();
    initProjectToolTags();
    initProjectLists();
    initProjectFilters();
    initProjectDetailModal();
  }

  function initSite() {
    initProjectsPage();
    initFunMode();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite);
  } else {
    initSite();
  }

})();
