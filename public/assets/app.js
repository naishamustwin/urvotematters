/* URVoteMatters front end. No frameworks, no trackers. */
(function () {
  "use strict";

  var STATES = window.URVM_STATES || [];
  var R = window.URVM_RESOURCES || {};
  var ELECTION = { y: 2026, m: 10, d: 3 }; // November 3, 2026 (month is 0-based)
  var SIGNUP_ENDPOINT = "/api/subscribe";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Safe browser storage (per-device conveniences only) ---------- */
  var store = {
    get: function (k) { try { return window.localStorage.getItem("urvm:" + k); } catch (e) { return null; } },
    set: function (k, v) { try { window.localStorage.setItem("urvm:" + k, v); } catch (e) {} },
    del: function (k) { try { window.localStorage.removeItem("urvm:" + k); } catch (e) {} }
  };

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") node.textContent = attrs[k];
      else if (k === "class") node.className = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function hostOf(url) {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch (e) { return ""; }
  }

  function findState(code) {
    for (var i = 0; i < STATES.length; i++) if (STATES[i].code === code) return STATES[i];
    return null;
  }

  /* ---------- Countdown ---------- */
  function countdown() {
    var num = $("#countdown-num"), unit = $("#countdown-unit");
    if (!num) return;
    var now = new Date();
    var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var target = new Date(ELECTION.y, ELECTION.m, ELECTION.d);
    var days = Math.round((target - today) / 86400000);
    if (days > 1) { num.textContent = days; unit.textContent = "days to go"; }
    else if (days === 1) { num.textContent = "1"; unit.textContent = "day to go"; }
    else if (days === 0) { num.textContent = "Today"; unit.textContent = ""; }
    else { num.textContent = "Done"; unit.textContent = "Thank you for voting"; }
  }

  /* ---------- State selectors ---------- */
  function fillSelect(select) {
    if (!select) return;
    STATES.forEach(function (s) { select.appendChild(el("option", { value: s.code, text: s.name })); });
  }

  function linkRow(opts) {
    var a = el("a", {
      class: "rlink" + (opts.lead ? " rlink--lead" : ""),
      href: opts.href, target: "_blank", rel: "noopener"
    }, [
      el("span", { class: "rlink__title", text: opts.title }),
      el("span", { class: "tag tag--" + opts.kind, text: opts.kind === "official" ? "Official" : opts.kind === "assoc" ? "NASS" : "Nonprofit" }),
      el("span", { class: "rlink__desc", text: opts.desc }),
      el("span", { class: "rlink__host", text: hostOf(opts.href) }),
      el("span", { class: "sr-only", text: " (opens in a new tab)" })
    ]);
    return a;
  }

  function renderState(code) {
    var wrap = $("#state-links"), intro = $("#state-intro");
    var s = findState(code);
    wrap.textContent = "";
    var findOfficial = $("#find-official"), note = $("#protect-state-note");

    if (!s) {
      intro.hidden = false;
      findOfficial.setAttribute("href", "#your-state");
      findOfficial.removeAttribute("target");
      findOfficial.removeAttribute("rel");
      findOfficial.textContent = "Find your state official";
      note.textContent = "Choose your state above for a direct link to your official state election office.";
      return;
    }

    intro.hidden = true;
    wrap.appendChild(el("p", { class: "state-name", text: s.name }));
    wrap.appendChild(linkRow({
      lead: true, kind: "official", href: s.office,
      title: s.name + " election office",
      desc: "Your state's official election website. Deadlines, rules, and results come from here."
    }));
    wrap.appendChild(linkRow({
      kind: "assoc", href: R.nassRegStatus, title: "Check my registration",
      desc: "Choose " + s.name + " and you'll go to the state's official registration lookup."
    }));
    wrap.appendChild(linkRow({
      kind: "assoc", href: R.nassPolling, title: "Find where to vote",
      desc: "Choose " + s.name + " to find your polling place or early voting sites."
    }));
    wrap.appendChild(linkRow({
      kind: "assoc", href: R.nassId, title: "ID rules",
      desc: "What identification, if any, " + s.name + " asks voters to show."
    }));
    wrap.appendChild(linkRow({
      kind: "assoc", href: R.nassEarly, title: "Early and mail voting",
      desc: "Absentee, mail, and early voting options and deadlines in " + s.name + "."
    }));
    wrap.appendChild(linkRow({
      kind: "assoc", href: R.nassPollWorker, title: "Become a poll worker",
      desc: "How to sign up to work at the polls in " + s.name + "."
    }));
    wrap.appendChild(linkRow({
      kind: "official", href: R.eacStates, title: "EAC state guide",
      desc: "Choose " + s.name + " on the U.S. Election Assistance Commission's map for a summary with links to state and local offices."
    }));
    wrap.appendChild(linkRow({
      kind: "nonprofit", href: R.localOffices, title: "Local election office",
      desc: "Look up your county or city election office and its contact details."
    }));
    wrap.appendChild(linkRow({
      kind: "official", href: R.overseas, title: "Military or overseas",
      desc: "Voting from outside the U.S. or serving in the military? Start with the Federal Voting Assistance Program."
    }));

    findOfficial.setAttribute("href", s.office);
    findOfficial.setAttribute("target", "_blank");
    findOfficial.setAttribute("rel", "noopener");
    findOfficial.innerHTML = "";
    findOfficial.appendChild(document.createTextNode(s.name + " election office"));
    findOfficial.appendChild(el("span", { class: "sr-only", text: " (opens in a new tab)" }));

    note.textContent = "";
    note.appendChild(document.createTextNode("For " + s.name + ", go straight to the "));
    var a = el("a", { href: s.office, target: "_blank", rel: "noopener", text: "official state election office" });
    note.appendChild(a);
    note.appendChild(document.createTextNode("."));
  }

  function setupStates() {
    var pick = $("#state-select"), formState = $("#f-state");
    fillSelect(pick);
    fillSelect(formState);
    var saved = store.get("state");
    if (saved && findState(saved)) {
      pick.value = saved;
      formState.value = saved;
      renderState(saved);
    }
    pick.addEventListener("change", function () {
      var v = pick.value;
      if (v) store.set("state", v); else store.del("state");
      if (v && !formState.dataset.touched) formState.value = v;
      renderState(v);
    });
    formState.addEventListener("change", function () { formState.dataset.touched = "1"; });
  }

  /* ---------- Clipboard ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = el("textarea", { readonly: "", "aria-hidden": "true" });
      ta.value = text;
      ta.style.position = "fixed"; ta.style.opacity = "0"; ta.style.top = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy") ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  function setupCopy() {
    var btn = $("#copy-btn"), status = $("#copy-status"), sheet = $("#civic-message");
    if (!btn) return;
    var paras = $$("p", sheet);
    var subject = "Protect Our Election Process";
    var body = paras.slice(1).map(function (p) { return p.textContent.trim(); }).join("\n\n");
    var text = "Subject: " + subject + "\n\n" + body;
    var label = btn.textContent;
    btn.addEventListener("click", function () {
      copyText(text).then(function () {
        btn.textContent = "Copied";
        status.textContent = "Message copied. Paste it into your election official's contact form or an email.";
        setTimeout(function () { btn.textContent = label; }, 2400);
      }, function () {
        status.textContent = "Copy didn't work in this browser. Select the message above and copy it by hand.";
        var range = document.createRange();
        range.selectNodeContents(sheet);
        var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
        sheet.focus();
      });
    });
  }

  /* ---------- Navigation ---------- */
  function setupNav() {
    var toggle = $(".nav__toggle"), list = $("#nav-list");
    if (!toggle) return;
    function close() { toggle.setAttribute("aria-expanded", "false"); list.classList.remove("is-open"); }
    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      list.classList.toggle("is-open", !open);
    });
    $$("a", list).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && list.classList.contains("is-open")) { close(); toggle.focus(); }
    });
  }

  /* ---------- Checklist ---------- */
  function setupChecklist() {
    var boxes = $$("#checklist-set input[type=checkbox]");
    var progress = $("#check-progress"), ready = $("#ready"), readyTitle = $("#ready-title");
    var saved = [];
    try { saved = JSON.parse(store.get("checklist") || "[]"); } catch (e) { saved = []; }
    boxes.forEach(function (b) { b.checked = saved.indexOf(b.value) !== -1; });

    function update(fromUser) {
      var done = boxes.filter(function (b) { return b.checked; });
      progress.textContent = done.length + " of " + boxes.length + " done";
      store.set("checklist", JSON.stringify(done.map(function (b) { return b.value; })));
      var complete = done.length === boxes.length;
      var wasHidden = ready.hidden;
      ready.hidden = !complete;
      if (complete && wasHidden && fromUser) readyTitle.focus();
    }
    boxes.forEach(function (b) { b.addEventListener("change", function () { update(true); }); });
    update(false);

    $("#reset-btn").addEventListener("click", function () {
      boxes.forEach(function (b) { b.checked = false; });
      update(false);
      boxes[0].focus();
    });

    var shareStatus = $("#share-status");
    $("#share-btn").addEventListener("click", function () {
      var url = (document.querySelector('link[rel="canonical"]') || {}).href || location.href;
      var data = { title: "URVoteMatters", text: "I'm ready for November 3. Know your ballot. Protect your vote.", url: url };
      if (navigator.share) {
        navigator.share(data).catch(function () {});
      } else {
        copyText(url).then(function () { shareStatus.textContent = "Link copied. Send it to someone who should be ready too."; },
          function () { shareStatus.textContent = url; });
      }
    });
  }

  /* ---------- Mobile dock ---------- */
  function setupDock() {
    var dock = $("#dock"), hero = $(".hero"), foot = $(".foot"), ballot = $("#ballot");
    if (!dock || !("IntersectionObserver" in window)) return;
    var link = $("a", dock);
    var heroOut = false, footIn = false, ballotIn = false, typing = false;
    function sync() {
      var on = heroOut && !footIn && !ballotIn && !typing;
      dock.classList.toggle("is-on", on);
      dock.setAttribute("aria-hidden", on ? "false" : "true");
      link.setAttribute("tabindex", on ? "0" : "-1");
    }
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; sync(); }).observe(hero);
    new IntersectionObserver(function (e) { footIn = e[0].isIntersecting; sync(); }).observe(foot);
    new IntersectionObserver(function (e) { ballotIn = e[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(ballot);
    document.addEventListener("focusin", function (e) {
      typing = /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName); sync();
    });
    document.addEventListener("focusout", function () { typing = false; sync(); });
  }

  /* ---------- Signup ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setupSignup() {
    var form = $("#signup");
    if (!form) return;
    var startedAt = Date.now();
    var btn = $("#signup-btn"), status = $("#form-status");
    var fields = {
      firstName: { input: $("#f-name"), err: $("#f-name-err") },
      email: { input: $("#f-email"), err: $("#f-email-err") },
      state: { input: $("#f-state"), err: $("#f-state-err") },
      consent: { input: $("#f-consent"), err: $("#f-consent-err") }
    };

    function setErr(f, msg) {
      f.err.textContent = msg || "";
      if (msg) f.input.setAttribute("aria-invalid", "true"); else f.input.removeAttribute("aria-invalid");
    }

    function check(k) {
      var f = fields[k], v;
      if (k === "firstName") { v = f.input.value.trim(); setErr(f, v ? "" : "Enter your first name."); return !!v; }
      if (k === "email") {
        v = f.input.value.trim();
        if (!v) { setErr(f, "Enter your email address."); return false; }
        if (!EMAIL_RE.test(v)) { setErr(f, "Check your email address. It should look like name@example.com."); return false; }
        setErr(f, ""); return true;
      }
      if (k === "state") { v = f.input.value; setErr(f, v ? "" : "Choose your state."); return !!v; }
      if (k === "consent") {
        v = f.input.checked; setErr(f, v ? "" : "Tick the box to agree to receive URVoteMatters updates."); return v;
      }
      return true;
    }

    function validate() {
      var first = null;
      ["firstName", "email", "state", "consent"].forEach(function (k) {
        if (!check(k) && !first) first = fields[k].input;
      });
      return first;
    }

    // Once a field shows an error, re-check it while the person types,
    // so messages clear in place and nothing shifts under the next click.
    Object.keys(fields).forEach(function (k) {
      var f = fields[k];
      f.input.addEventListener(k === "consent" || k === "state" ? "change" : "input", function () {
        if (f.input.getAttribute("aria-invalid") === "true") check(k);
      });
    });

    function done(msg) {
      $("#signup-body").hidden = true;
      var box = $("#signup-done");
      if (msg) $("#signup-done-msg").textContent = msg;
      box.hidden = false;
      box.focus();
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      status.textContent = "";
      var bad = validate();
      if (bad) { bad.focus(); return; }

      var payload = {
        firstName: fields.firstName.input.value.trim(),
        email: fields.email.input.value.trim().toLowerCase(),
        state: fields.state.input.value,
        consent: true,
        company: $("#f-company").value,
        elapsedMs: Date.now() - startedAt
      };

      var label = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Sending";
      btn.setAttribute("aria-busy", "true");

      var ctrl = "AbortController" in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 15000);

      fetch(SIGNUP_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl ? ctrl.signal : undefined
      }).then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
      }).then(function (r) {
        if (r.ok && r.data && r.data.status === "duplicate") {
          done("You're already on the list. We'll keep you informed.");
        } else if (r.ok && r.data && r.data.ok) {
          done("We'll keep you informed.");
        } else if (r.status === 400 && r.data && r.data.field && fields[r.data.field]) {
          setErr(fields[r.data.field], r.data.message || "Check this field.");
          fields[r.data.field].input.focus();
        } else if (r.status === 429) {
          status.textContent = "Too many sign-ups from this connection. Wait a minute, then try again.";
        } else {
          status.textContent = "Your sign-up didn't go through. Check your connection and try again.";
        }
      }).catch(function () {
        status.textContent = "Your sign-up didn't go through. Check your connection and try again.";
      }).then(function () {
        clearTimeout(timer);
        btn.disabled = false;
        btn.textContent = label;
        btn.removeAttribute("aria-busy");
      });
    });
  }

  /* ---------- Go ---------- */
  function init() {
    countdown();
    setupStates();
    setupCopy();
    setupNav();
    setupChecklist();
    setupDock();
    setupSignup();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
