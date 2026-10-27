(function () {
  "use strict";

  var WHATSAPP_NUMBER = "918102707440";

  // ---------- Year ----------
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Highlight today in the hours chart ----------
  var todayRow = document.querySelector('.hours tr[data-day="' + new Date().getDay() + '"]');
  if (todayRow) todayRow.classList.add("is-today");

  // ---------- Mobile menu ----------
  var navToggle = document.getElementById("navToggle");
  var mobileNav = document.getElementById("mobileNav");

  function setMenu(open) {
    var hi = document.documentElement.lang === "hi";
    mobileNav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? (hi ? "मेनू बंद करें" : "Close menu") : (hi ? "मेनू खोलें" : "Open menu"));
  }

  // The toggle disappears on wide screens, so never leave the menu stranded open there.
  var desktopMq = window.matchMedia("(min-width: 961px)");
  function onDesktopChange(e) { if (e.matches) setMenu(false); }
  if (desktopMq.addEventListener) desktopMq.addEventListener("change", onDesktopChange);
  else desktopMq.addListener(onDesktopChange);
  // Some browsers (and device emulators) skip the media-query event, so check on resize too.
  window.addEventListener("resize", function () {
    if (desktopMq.matches && navToggle.getAttribute("aria-expanded") === "true") setMenu(false);
  });

  navToggle.addEventListener("click", function () {
    setMenu(navToggle.getAttribute("aria-expanded") !== "true");
  });
  mobileNav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setMenu(false);
  });

  // ---------- Lightbox ----------
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = document.getElementById("lightboxImg");
  var lightboxClose = document.getElementById("lightboxClose");
  var lastFocus = null;

  function openLightbox(href, alt) {
    lastFocus = document.activeElement;
    lightboxImg.src = href;
    lightboxImg.alt = alt || "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    lightboxImg.removeAttribute("src");
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll("[data-lightbox]").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var img = link.querySelector("img");
      openLightbox(link.href, img ? img.alt : "");
    });
  });
  lightboxClose.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) {
      if (e.key === "Escape" && navToggle.getAttribute("aria-expanded") === "true") setMenu(false);
      return;
    }
    if (e.key === "Escape") closeLightbox();
    // The close button is the only focusable control, so keep focus on it.
    if (e.key === "Tab") { e.preventDefault(); lightboxClose.focus(); }
  });
  // A broken full-size link falls back to the thumbnail.
  lightboxImg.addEventListener("error", function () {
    var thumb = document.querySelector('[data-lightbox][href="' + lightboxImg.getAttribute("src") + '"] img');
    if (thumb && lightboxImg.src !== thumb.currentSrc) lightboxImg.src = thumb.currentSrc || thumb.src;
  });

  // ---------- Booking form → WhatsApp ----------
  var form = document.getElementById("booking");
  var phoneInput = form.elements.phone;
  var nameInput = form.elements.name;
  var phoneErr = document.getElementById("phoneErr");
  var success = document.getElementById("formSuccess");

  function validPhone() {
    var digits = phoneInput.value.replace(/\D/g, "").replace(/^(91|0)(?=\d{10}$)/, "");
    var ok = /^[6-9]\d{9}$/.test(digits);
    phoneInput.setAttribute("aria-invalid", String(!ok));
    phoneErr.hidden = ok;
    return ok ? digits : null;
  }

  phoneInput.addEventListener("blur", function () { if (phoneInput.value) validPhone(); });

  try {
    if (sessionStorage.getItem("tpg-sent")) {
      sessionStorage.removeItem("tpg-sent");
      success.hidden = false;
    }
  } catch (err) { /* storage unavailable */ }

  function isTouchDevice() {
    return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    nameInput.setAttribute("aria-invalid", String(!name));
    var phone = validPhone();
    if (!name) { nameInput.focus(); return; }
    if (!phone) { phoneInput.focus(); return; }

    var lines = [
      "Hi Titan Pro Gym, I'd like to book: " + form.elements.goal.value,
      "Name: " + name,
      "Phone: " + phone
    ];
    var email = form.elements.email.value.trim();
    var message = form.elements.message.value.trim();
    if (email) lines.push("Email: " + email);
    if (message) lines.push("Message: " + message);

    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    // Shown first so it's already there when the visitor comes back from WhatsApp.
    success.hidden = false;

    // Phones hand wa.me straight to the WhatsApp app, so stay in this tab: a new tab
    // would be left empty on iPhone and is often blocked in Instagram/Facebook browsers.
    if (isTouchDevice()) {
      // Coming back often reloads the page, so remember to show the confirmation again.
      try { sessionStorage.setItem("tpg-sent", "1"); } catch (err) { /* storage unavailable */ }
      window.location.href = url;
      return;
    }
    // Desktop: keep the site open and show WhatsApp's "Continue to chat" page in a new tab.
    // Passing "noopener" makes window.open return null even on success, so detach the opener by hand.
    var win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
  });

  // ---------- English / Hindi ----------
  var HI = {
    "skip": "मुख्य सामग्री पर जाएँ",
    "nav.about": "हमारे बारे में",
    "nav.training": "ट्रेनिंग",
    "nav.gallery": "गैलरी",
    "nav.reviews": "रिव्यू",
    "nav.visit": "पता",
    "cta.whatsapp": "WhatsApp",
    "cta.call": "अभी कॉल करें",
    "cta.callNumber": "कॉल करें +91 98355 60520",
    "cta.whatsappNumber": "WhatsApp +91 81027 07440",
    "hero.e1": "मैनपुरा",
    "hero.e2": "पटना",
    "hero.e3": "हाल ही में खुला",
    "hero.lead": "हाल ही में खुला जिम — बेहतरीन रख-रखाव वाले उपकरण और विशेषज्ञ ट्रेनर, उन लोगों के लिए जो सच में मज़बूत बनना चाहते हैं। Google पर <strong>4.8</strong> रेटिंग।",
    "hero.cta": "फ्री ट्रायल बुक करें",
    "stat.rating": "126 Google रिव्यू",
    "stat.free": "फ्री",
    "stat.trial": "पहला सेशन, कोई बंधन नहीं",
    "stat.hours": "सुबह जल्दी, हफ्ते में छह दिन",
    "strip.1": "आधुनिक उपकरण",
    "strip.2": "विशेषज्ञ ट्रेनर",
    "strip.3": "जिम में ही सप्लीमेंट",
    "strip.4": "सुबह 5 से रात 10 बजे तक",
    "about.eyebrow": "जिम के बारे में",
    "about.title": "दमदार ट्रेनिंग, अब मैनपुरा में।",
    "about.p1": "Titan Pro Gym गोसाईं टोला रोड, मैनपुरा में हाल ही में खुला स्ट्रेंथ और फिटनेस जिम है। यहाँ अच्छी हालत में रखी मशीनें और फ्री वेट्स हैं, और ट्रेनिंग विशेषज्ञ कोच करवाते हैं जो आपके लक्ष्य के हिसाब से प्लान बनाते हैं — सबके लिए एक जैसा रूटीन नहीं।",
    "about.p2": "सदस्य हमें बार-बार यही बताते हैं: सही फॉर्म पर अच्छा मार्गदर्शन, बड़ा और साफ़-सुथरा फ्लोर जहाँ कभी भीड़ नहीं लगती, और ऐसा स्टाफ जो आपको नाम से जानता है। हम ऐसी ही जगह चलाना चाहते थे।",
    "about.t1": "आपके हिसाब से वर्कआउट प्लान और सही फॉर्म के लिए साथ रहकर कोचिंग",
    "about.t2": "बड़ा, साफ़-सुथरा फ्लोर, आधुनिक मशीनें और फ्री वेट्स",
    "about.t3": "जिम में ही असली सप्लीमेंट उपलब्ध",
    "about.t4": "दोस्ताना टीम और जोश भरा माहौल",
    "about.cta": "अपना पहला सेशन तय करें",
    "about.caption": "तीसरी मंज़िल पर हमारा मुख्य ट्रेनिंग फ्लोर।",
    "svc.eyebrow": "आपको क्या मिलेगा",
    "svc.title": "आपके हिसाब से बनी ट्रेनिंग",
    "svc.intro": "नीचे दी गई हर चीज़ आज Titan Pro Gym में मौजूद है — उपकरण, कोचिंग और सपोर्ट जो हमारे सदस्य पहले से इस्तेमाल करते हैं।",
    "svc.1.t": "स्ट्रेंथ और वेट ट्रेनिंग",
    "svc.1.p": "मसल और ताकत बढ़ाने के लिए फ्री वेट्स, डम्बल और मशीनें, और फॉर्म जाँचने के लिए फ्लोर पर कोच।",
    "svc.2.t": "पर्सनल कोचिंग",
    "svc.2.p": "विशेषज्ञ ट्रेनर आपके लक्ष्य के हिसाब से प्लान बनाते हैं और आपको मोटिवेट रखते हैं — सदस्य इसकी सबसे ज़्यादा तारीफ़ करते हैं।",
    "svc.3.t": "जिम में ही सप्लीमेंट",
    "svc.3.p": "जिम में असली सप्लीमेंट मिलते हैं — सदस्यों के अनुसार दाम अक्सर ऑनलाइन से भी कम होते हैं।",
    "svc.4.t": "सुबह जल्दी एंट्री",
    "svc.4.p": "हफ्ते में छह दिन जिम सुबह 5 बजे खुल जाता है, ताकि आप काम से पहले ट्रेनिंग कर सकें और आपका रूटीन बना रहे।",
    "fac.title": "सुविधाएँ",
    "fac.1": "तीसरी मंज़िल तक लिफ्ट",
    "fac.2": "एयर-कंडीशन्ड फ्लोर",
    "fac.3": "पार्किंग उपलब्ध",
    "fac.4": "चेंजिंग रूम और लॉकर",
    "gal.eyebrow": "Titan Pro के अंदर",
    "gal.title": "फ्लोर, वेट्स और माहौल",
    "gal.intro": "जिम की असली तस्वीरें। बड़ा देखने के लिए किसी भी फोटो पर टैप करें।",
    "rev.eyebrow": "असली सदस्यों से",
    "rev.title": "126 Google रिव्यू में 4.8 स्टार",
    "rev.intro": "Titan Pro Gym के बारे में लोग असल में यह कह रहे हैं। (रिव्यू मूल भाषा में)",
    "rev.all": "Google पर सभी 126 रिव्यू पढ़ें",
    "rev.write": "रिव्यू लिखें",
    "faq.eyebrow": "आने से पहले",
    "faq.title": "अक्सर पूछे जाने वाले सवाल",
    "faq.q1": "क्या फ्री ट्रायल सच में फ्री है?",
    "faq.a1": "हाँ। फॉर्म या WhatsApp से बुक करें, फिर आकर जिम आज़माएँ, उसके बाद मेंबरशिप का फैसला करें।",
    "faq.q2": "जिम तीसरी मंज़िल पर है — क्या लिफ्ट है?",
    "faq.a2": "हाँ, तीसरी मंज़िल तक लिफ्ट है।",
    "faq.q3": "क्या पार्किंग है?",
    "faq.a3": "हाँ, पार्किंग उपलब्ध है।",
    "faq.q4": "क्या जिम एयर-कंडीशन्ड है? चेंजिंग रूम हैं?",
    "faq.a4": "ट्रेनिंग फ्लोर एयर-कंडीशन्ड है, और लॉकर के साथ साफ़-सुथरे चेंजिंग रूम हैं।",
    "faq.q5": "मेंबरशिप कितने की है?",
    "faq.a5": "मौजूदा रेट के लिए कॉल या WhatsApp करें — सदस्य इन्हें किफ़ायती बताते हैं।",
    "visit.eyebrow": "आएँ और बुक करें",
    "visit.title": "हमारे साथ ट्रेनिंग करें",
    "visit.intro": "फ्री ट्रायल सेशन के लिए आइए, या फॉर्म भेजिए — हम आपको कॉल करके पहला वर्कआउट तय करेंगे। जिम गोसाईं टोला रोड, मैनपुरा में तीसरी मंज़िल पर है।",
    "visit.address": "पता",
    "visit.floor": "(तीसरी मंज़िल)",
    "visit.directions": "रास्ता देखें →",
    "visit.phone": "फ़ोन",
    "visit.hours": "खुलने का समय",
    "day.mon": "सोमवार",
    "day.tue": "मंगलवार",
    "day.wed": "बुधवार",
    "day.thu": "गुरुवार",
    "day.fri": "शुक्रवार",
    "day.sat": "शनिवार",
    "day.sun": "रविवार",
    "day.closed": "बंद",
    "plans.title": "मेंबरशिप प्लान",
    "plans.body": "मौजूदा मेंबरशिप रेट के लिए कॉल या WhatsApp करें — आपका पहला सेशन फ्री ट्रायल है।",
    "plans.wa": "WhatsApp पर पूछें",
    "form.title": "फ्री ट्रायल बुक करें",
    "form.name": "आपका नाम",
    "form.namePh": "जैसे अमन कुमार",
    "form.phone": "मोबाइल नंबर",
    "form.phonePh": "10 अंकों का मोबाइल नंबर",
    "form.phoneErr": "कृपया 10 अंकों का मोबाइल नंबर डालें।",
    "form.email": "ईमेल",
    "form.optional": "(वैकल्पिक)",
    "form.goal": "आप क्या चाहते हैं?",
    "goal.1": "फ्री ट्रायल सेशन",
    "goal.2": "स्ट्रेंथ / वेट ट्रेनिंग",
    "goal.3": "पर्सनल कोचिंग",
    "goal.4": "मेंबरशिप की जानकारी",
    "goal.5": "सप्लीमेंट",
    "form.message": "संदेश",
    "form.messagePh": "अपना लक्ष्य या कॉल करने का सही समय बताएँ",
    "form.submit": "मेरा फ्री ट्रायल बुक करें",
    "form.note": "आपकी रिक्वेस्ट WhatsApp पर <strong>+91 81027 07440</strong> को जाएगी। हम कॉल करके कन्फ़र्म करेंगे। कोई स्पैम नहीं।",
    "form.success": "WhatsApp में आपकी रिक्वेस्ट खुल गई होगी। वहाँ Send दबाएँ, हम जल्द संपर्क करेंगे।",
    "foot.tag": "Wake the Beast. मैनपुरा, पटना में हाल ही में खुला स्ट्रेंथ जिम।",
    "foot.addr": "गोसाईं टोला रोड, मैनपुरा,<br>पटना, बिहार 800013 (तीसरी मंज़िल)",
    "foot.contact": "संपर्क",
    "foot.hours": "सोम–शनि सुबह 5 बजे से<br>रविवार बंद",
    "foot.rights": "सर्वाधिकार सुरक्षित।",
    "foot.rated": "Google पर 4.8★ रेटिंग",
    "qb.call": "कॉल",
    "stat.open": "सुबह 5",
    "hours.range": "सुबह 5 – रात 10",
    "scale.0": "रात 12",
    "scale.6": "सुबह 6",
    "scale.12": "दोपहर 12",
    "scale.18": "शाम 6",
    "scale.24": "रात 12",
    "rev.m3": "3 महीने पहले · Google",
    "rev.m2": "2 महीने पहले · Google",
    "visit.addr": "Titan Pro Gym, गोसाईं टोला रोड, गोसाईं टोला, सदाकत आश्रम, मैनपुरा, पटना, बिहार 800013",
    "a.home": "Titan Pro Gym होम",
    "a.primary": "मुख्य मेनू",
    "a.mobile": "मोबाइल मेनू",
    "a.glance": "एक नज़र में",
    "a.outof5": "स्टार, 5 में से",
    "a.stars5": "5 में से 5 स्टार",
    "a.stars4": "5 में से 4 स्टार",
    "a.map": "Titan Pro Gym, मैनपुरा, पटना का नक्शा",
    "a.quick": "तुरंत संपर्क",
    "a.viewer": "फोटो व्यूअर",
    "a.close": "फोटो बंद करें",
    "alt.floor1": "Titan Pro Gym का ट्रेनिंग फ्लोर, मशीनें और रबर फ्लोरिंग",
    "alt.training": "Titan Pro Gym फ्लोर पर डम्बल से ट्रेनिंग करते सदस्य",
    "alt.weights": "डम्बल रैक और शीशे वाली दीवार",
    "alt.dumbbells": "रबर-कोटेड डम्बल का रैक",
    "alt.supps": "जिम में सप्लीमेंट की शेल्फ",
    "alt.floor2": "ट्रेनिंग फ्लोर और मशीनों का चौड़ा नज़ारा",
    "alt.sign": "Titan Gym का साइनबोर्ड — Wake the Beast, तीसरी मंज़िल पर जिम"
  };

  var langToggle = document.getElementById("langToggle");
  var textEls = document.querySelectorAll("[data-i18n]");
  var phEls = document.querySelectorAll("[data-i18n-ph]");
  // English is whatever each element holds on load, so the HTML stays the source of truth.
  var attrEls = document.querySelectorAll("[data-i18n-attr]");
  var enText = new Map();
  var enPh = new Map();
  var enAttr = new Map();
  var enTitle = document.title;
  var HI_TITLE = "Titan Pro Gym — मैनपुरा, पटना का स्ट्रेंथ ट्रेनिंग जिम";
  textEls.forEach(function (el) { enText.set(el, el.innerHTML); });
  phEls.forEach(function (el) { enPh.set(el, el.placeholder); });
  // data-i18n-attr="attr:key" translates one attribute (alt, aria-label, title).
  attrEls.forEach(function (el) {
    var parts = el.dataset.i18nAttr.split(":");
    enAttr.set(el, { name: parts[0], key: parts[1], value: el.getAttribute(parts[0]) });
  });

  function setLang(lang) {
    textEls.forEach(function (el) {
      var hi = HI[el.dataset.i18n];
      el.innerHTML = lang === "hi" && hi != null ? hi : enText.get(el);
    });
    phEls.forEach(function (el) {
      var hi = HI[el.dataset.i18nPh];
      el.placeholder = lang === "hi" && hi != null ? hi : enPh.get(el);
    });
    attrEls.forEach(function (el) {
      var a = enAttr.get(el);
      var hi = HI[a.key];
      el.setAttribute(a.name, lang === "hi" && hi != null ? hi : a.value);
    });
    document.title = lang === "hi" ? HI_TITLE : enTitle;
    document.documentElement.lang = lang;
    setMenu(navToggle.getAttribute("aria-expanded") === "true");
    if (lang === "hi") {
      langToggle.textContent = "English";
      langToggle.setAttribute("lang", "en");
      langToggle.setAttribute("aria-label", "View in English");
    } else {
      langToggle.textContent = "हिंदी";
      langToggle.setAttribute("lang", "hi");
      langToggle.setAttribute("aria-label", "हिंदी में देखें");
    }
    try { localStorage.setItem("tpg-lang", lang); } catch (err) { /* storage unavailable */ }
  }

  langToggle.addEventListener("click", function () {
    setLang(document.documentElement.lang === "hi" ? "en" : "hi");
  });

  var saved = null;
  try { saved = localStorage.getItem("tpg-lang"); } catch (err) { /* storage unavailable */ }
  if (saved === "hi") setLang("hi");
})();
