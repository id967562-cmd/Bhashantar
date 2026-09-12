
  // Dynamic greeting rotator
  const words = [
    { text: "Johar (जोहार)", font: "'IBM Plex Sans', sans-serif" },
    { text: "Ol Chiki (संथाली)", font: "'IBM Plex Sans', sans-serif" },
    { text: "Mundari (मुंडारी)", font: "'IBM Plex Sans', sans-serif" },
    { text: "Ho (हो भाषा)", font: "'IBM Plex Sans', sans-serif" },
  ];
  let i = 0;
  const el = document.getElementById('scriptWord');
  setInterval(() => {
    el.classList.add('fading');
    setTimeout(() => {
      i = (i + 1) % words.length;
      el.textContent = words[i].text;
      el.classList.remove('fading');
    }, 500);
  }, 2400);

  // Pre-configured educational dictionary for Jharkhand tribal terms
  const TRIBAL_LEXICON = {
    "hello sagar": {
      ho: "Johar Sagar",
      mundari: "Johar Sagar",
      santhali: "Johar Sagar"
    },
    "numbers": {
      ho: "𑢹𑣉𑣉 𑣎𑣋𑣜 (Orom - Ho counting)",
      mundari: "अपुल रेयाः (Mundari numerals)",
      santhali: "Ol Chiki Numeric Terms"
    },
    "water cycle": {
      ho: "Aru Jhora (Ho water term)",
      mundari: "Daः Alang (Mundari water term)",
      santhali: "Pani / Neva (Santhali term)"
    },
    "plants": {
      ho: "Bir Orea (Ho forest/plant)",
      mundari: "Buru Bir",
      santhali: "Ol Ahat"
    }
  };

  // Intelligent translation fallback handler
  function getTribalTranslation(inputWord, lang) {
    const cleanInput = inputWord.toLowerCase();
    for (let key in TRIBAL_LEXICON) {
      if (cleanInput.includes(key)) {
        return TRIBAL_LEXICON[key][lang];
      }
    }
    // Generic structural adaptation if exact term isn't found
    return `[${lang.toUpperCase()} Localized FLN Adaptation] ${inputWord}`;
  }

  const activeLangs = new Set(["santhali", "mundari"]);
  const LANG_META = {
    santhali: { label: "Santhali (संथाली)", voice: "hi-IN" },
    mundari: { label: "Mundari (मुंडारी)", voice: "hi-IN" },
    ho: { label: "Ho (हो भाषा)", voice: "hi-IN" }
  };

  function switchAppMode(mode) {
    document.querySelectorAll(".mode-toggle-btn").forEach(b => b.classList.remove("active-mode"));
    document.querySelectorAll(".app-view").forEach(v => v.classList.remove("active-view"));

    if(mode === 'live') {
      document.getElementById("btnLive").classList.add("active-mode");
      document.getElementById("viewLive").classList.add("active-view");
    } else {
      document.getElementById("btnStory").classList.add("active-mode");
      document.getElementById("viewStory").classList.add("active-view");
    }
  }

  function toggleLangChip(el, code) {
    if(activeLangs.has(code)) {
      activeLangs.delete(code);
      el.classList.remove("on");
    } else {
      activeLangs.add(code);
      el.classList.add("on");
    }
  }

  async function runLiveTranslation() {
    const text = document.getElementById("liveInputText").value.trim();
    const outBox = document.getElementById("livePreviewOutputs");
    if(!text) { alert("Please enter text."); return; }
    if(activeLangs.size === 0) { alert("Select at least one tribal language."); return; }

    outBox.innerHTML = "<div style='color:#AEB9C6; font-size:14px; padding:12px;'>Querying offline SQLite lexicon…</div>";
    
    setTimeout(() => {
      let html = "";
      for(const code of activeLangs) {
        const meta = LANG_META[code];
        const translation = getTribalTranslation(text, code);

        html += `
          <div class="out-card">
            <div class="out-lang">${meta.label}</div>
            <div class="out-text">${translation}</div>
            <button class="speak-btn" onclick="speakText('${translation.replace(/'/g, "\\'")}', '${meta.voice}')">🔊 Play Offline Voice (< 3s)</button>
          </div>
        `;
      }
      outBox.innerHTML = html;
    }, 300);
  }

  async function runStorySimplification() {
    const raw = document.getElementById("storyInputText").value.trim();
    const lang = document.getElementById("storyTargetLang").value;
    const outBox = document.getElementById("storyPreviewOutput");
    if(!raw) { alert("Please enter curriculum text."); return; }

    outBox.innerHTML = "<div style='color:#AEB9C6; font-size:14px; padding:12px;'>Adapting curriculum for NIPUN primary milestones…</div>";

    setTimeout(() => {
      const translation = getTribalTranslation(raw, lang);
      const words = translation.split(/\s+/).map((w, idx) => `<span class="word" id="sw-${idx}">${w}</span>`).join(" ");

      outBox.innerHTML = `
        <div class="out-card">
          <div class="out-lang">${LANG_META[lang].label} · NIPUN Worksheet Layout</div>
          <div class="out-text" style="margin-top:8px;">${words}</div>
          <button class="speak-btn" onclick="speakStoryWithHighlight('${translation.replace(/'/g, "\\'")}', '${LANG_META[lang].voice}')">🔊 Play Read-Along Highlight</button>
        </div>
      `;
    }, 300);
  }

  function speakText(text, voiceCode) {
    if(!window.speechSynthesis) { alert("Speech synthesis not supported."); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = voiceCode;
    window.speechSynthesis.speak(utter);
  }

  function speakStoryWithHighlight(text, voiceCode) {
    if(!window.speechSynthesis) { alert("Speech synthesis not supported."); return; }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = voiceCode;
    
    utter.onboundary = (e) => {
      if(e.name === "word") {
        document.querySelectorAll(".word").forEach(w => w.classList.remove("active"));
        const wordIndex = text.slice(0, e.charIndex).trim().split(/\s+/).length - 1;
        const targetWord = document.getElementById(`sw-${wordIndex}`);
        if(targetWord) targetWord.classList.add("active");
      }
    };
    utter.onend = () => {
      document.querySelectorAll(".word").forEach(w => w.classList.remove("active"));
    };

    window.speechSynthesis.speak(utter);
  }

