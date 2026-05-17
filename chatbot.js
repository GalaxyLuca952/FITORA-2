/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  FITORA CHATBOT WIDGET  -  chatbot.js               ║
 * ╚══════════════════════════════════════════════════════╝
 */

(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════
     CONFIG
  ══════════════════════════════════════════════════════ */
  const CFG = Object.assign({
    siteName: 'FITORA',
    botName: 'Assistente FITORA',
    botAvatar: '<i class="fa-solid fa-bolt" style="color: #facc15;"></i>',
    apiKey: '',
    proxyUrl: '',
    model: 'claude-sonnet-4-6',
    maxTokens: 512,
    welcomeMessage: 'Ciao! Sono l\'assistente di **FITORA**.\nPosso aiutarti a scoprire le funzionalità dell\'app, navigare il sito e rispondere a qualsiasi domanda su FITORA. Come posso aiutarti?',
    cssFile: null,
  }, window.ChatbotConfig || {});

  /* ══════════════════════════════════════════════════════
     DETECT PAGE  (index.html vs check-in.html/dashboard)
  ══════════════════════════════════════════════════════ */
  const IS_DASHBOARD = !!document.getElementById('page-home');

  /* ══════════════════════════════════════════════════════
     NAVIGAZIONE REALE
  ══════════════════════════════════════════════════════ */
  const NAV = IS_DASHBOARD ? {
    home: { label: 'Home Dashboard', icon: '<i class="fa-solid fa-house" style="color: #795548;"></i>', action: () => switchTabSafe('home') },
    allenamento: { label: 'Allenamento Oggi', icon: '<i class="fa-solid fa-bolt" style="color: #facc15;"></i>', action: () => goHref('workout.html') },
    nutrizione: { label: 'Piano Alimentare', icon: '<i class="fa-solid fa-bowl-food" style="color: #4caf50;"></i>', action: () => goHref('nutrition.html') },
    sport: { label: 'Il Tuo Sport', icon: '<i class="fa-solid fa-trophy" style="color: #ffc107;"></i>', action: () => goHref('sport-quiz.html') },
    community: { label: 'Community', icon: '<i class="fa-solid fa-users" style="color: #03a9f4;"></i>', action: () => switchTabSafe('community') },
  } : {
    home: { label: 'Home', icon: '<i class="fa-solid fa-house" style="color: #795548;"></i>', action: () => goHref('index.html#hero') },
    metodo: { label: 'Il Metodo', icon: '<i class="fa-solid fa-clipboard-list" style="color: #ffeb3b;"></i>', action: () => goHref('index.html#beyond') },
    features: { label: 'Funzionalità', icon: '<i class="fa-solid fa-bolt" style="color: #facc15;"></i>', action: () => goHref('index.html#features') },
    tech: { label: 'Tecnologia AI', icon: '<i class="fa-solid fa-robot" style="color: #9c27b0;"></i>', action: () => goHref('index.html#vision') },
    community: { label: 'Community', icon: '<i class="fa-solid fa-users" style="color: #03a9f4;"></i>', action: () => goHref('index.html#community') },
    futuro: { label: 'Futuro / Wearable', icon: '<i class="fa-solid fa-rocket" style="color: #ff5722;"></i>', action: () => goHref('index.html#future') },
    dashboard: { label: 'Dashboard', icon: '<i class="fa-solid fa-chart-simple" style="color: #03a9f4;"></i>', action: () => goHref('check-in.html') },
    registrati: { label: 'Registrati', icon: '<i class="fa-solid fa-pen" style="color: #03a9f4;"></i>', action: () => goHref('register.html') },
    allenamento: { label: 'Allenamento', icon: '<i class="fa-solid fa-bolt" style="color: #facc15;"></i>', action: () => goHref('workout.html') },
    nutrizione: { label: 'Nutrizione', icon: '<i class="fa-solid fa-bowl-food" style="color: #4caf50;"></i>', action: () => goHref('nutrition.html') },
    sport: { label: 'Quiz Sport', icon: '<i class="fa-solid fa-trophy" style="color: #ffc107;"></i>', action: () => goHref('sport-quiz.html') },
  };

  function goHref(url) { window.location.href = url; }
  function switchTabSafe(tab) {
    if (typeof window.switchTab === 'function') window.switchTab(tab);
  }

  /* ══════════════════════════════════════════════════════
     CHIP SETS
  ══════════════════════════════════════════════════════ */
  const CHIPS_DEFAULT = [
    'Come funziona FITORA?',
    'Cos\'è la Computer Vision?',
    'Dove trovo le funzioni?',
    'Nutrizione intelligente',
    'Community e sfide',
    'Allenamento con l\'AI',
  ];
  const CHIPS_AFTER_NAV = [
    'Nutrizione intelligente',
    'Community e sfide',
    'Allenamento con l\'AI',
    'Cos\'è la Computer Vision?',
  ];
  const CHIPS_AFTER_FEATURES = [
    'Mostrami le sezioni del sito',
    'Cos\'è la Computer Vision?',
    'Come mi registro?',
    'Community e sfide',
  ];

  /* ══════════════════════════════════════════════════════
     INJECT CSS
  ══════════════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('cb-styles')) return;
    const script = document.currentScript || document.querySelector('script[src*="chatbot"]');
    const base = script ? script.src.replace(/chatbot\.js[^/]*$/, '') : '';
    const href = CFG.cssFile || (base + 'chatbot.css');
    const link = document.createElement('link');
    link.id = 'cb-styles'; link.rel = 'stylesheet'; link.href = href;
    document.head.appendChild(link);
  })();

  /* ══════════════════════════════════════════════════════
     STATO
  ══════════════════════════════════════════════════════ */
  let isOpen = false;
  let isBusy = false;
  let history = [];
  let bmiState = { step: 0, weight: 0, height: 0 };
  let chipSet = CHIPS_DEFAULT;

  /* ══════════════════════════════════════════════════════
     UTILS
  ══════════════════════════════════════════════════════ */
  function el(tag, props, html) {
    const e = document.createElement(tag);
    if (props) Object.assign(e, props);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function md(text) {
    return text
      .replace(/<i\b[^>]*>[\s\S]*?<\/i>/g, '')
      .replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]|️/gu, '')
      .replace(/\s{2,}/g, ' ').trim()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }
  function autoResize(ta) {
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 96) + 'px';
  }
  function escHTML(s) {
    return String(s)
      .replace(/<i\b[^>]*>[\s\S]*?<\/i>/g, '')
      .replace(/[\u{1F000}-\u{1FFFF}]|[\u{2600}-\u{27FF}]|️/gu, '')
      .trim()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /* ══════════════════════════════════════════════════════
     BUILD DOM
  ══════════════════════════════════════════════════════ */
  function buildDOM() {
    const toggleBtn = el('button', { className: 'cb-toggle', id: 'cb-toggle' }, `
      <span class="cb-icon-chat">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      </span>
      <span class="cb-icon-x">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </span>
    `);
    const badge = el('span', { className: 'cb-badge', id: 'cb-badge' }, '1');
    toggleBtn.appendChild(badge);

    const win = el('div', { className: 'cb-win', id: 'cb-win' }, `
      <div class="cb-header">
        <div class="cb-avatar">${CFG.botAvatar}</div>
        <div class="cb-header-info">
          <div class="cb-header-name">${CFG.botName}</div>
          <div class="cb-header-status"><span class="cb-dot"></span>Online ora</div>
        </div>
        <button class="cb-reset" id="cb-reset" title="Pulisci chat">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
        <button class="cb-close" id="cb-close" aria-label="Chiudi">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="cb-msgs" id="cb-msgs"></div>
      <div class="cb-bottom" aria-live="polite" aria-atomic="false">
        <div class="cb-chips" id="cb-chips"></div>
        <div class="cb-input-row">
          <textarea class="cb-input" id="cb-input"
            placeholder="Scrivi un messaggio…" rows="1" aria-label="Messaggio"></textarea>
          <button class="cb-send" id="cb-send" aria-label="Invia">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
          </button>
        </div>
      </div>
    `);

    document.body.appendChild(toggleBtn);
    document.body.appendChild(win);
  }

  /* ══════════════════════════════════════════════════════
     CHIPS
  ══════════════════════════════════════════════════════ */
  function renderChips(set) {
    const container = document.getElementById('cb-chips');
    if (!container) return;
    container.innerHTML = '';
    (set || chipSet).forEach(text => {
      const chip = el('button', { className: 'cb-chip' }, escHTML(text));
      chip.addEventListener('click', (e) => {
        e.stopPropagation();
        send(text);
      });
      container.appendChild(chip);
    });
  }
  function updateChips(set) {
    chipSet = set || CHIPS_DEFAULT;
    renderChips(chipSet);
  }

  /* ══════════════════════════════════════════════════════
     MESSAGGI
  ══════════════════════════════════════════════════════ */
  function addMsg(role, text, isError) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: `cb-msg cb-msg-${role}` });
    if (role === 'bot') {
      const cls = 'cb-bubble cb-bubble-bot' + (isError ? ' cb-err-bubble' : '');
      row.innerHTML = `<div class="cb-msg-av">${CFG.botAvatar}</div><div class="${cls}">${md(text)}</div>`;
    } else {
      row.innerHTML = `<div class="cb-bubble cb-bubble-user">${md(text)}</div>`;
    }
    msgs.appendChild(row);
    scrollBottom();
    saveChat();
  }
  function saveChat() {
    const serializableHistory = history.map(m => {
      if (m.type === 'rich') {
        return { role: m.role, content: m.content, type: m.type, nextChips: m.nextChips };
      }
      return { role: m.role, content: m.content };
    });
    localStorage.setItem('fitora_chat_history', JSON.stringify(serializableHistory));
  }
  function loadChat() {
    const saved = localStorage.getItem('fitora_chat_history');
    if (saved) {
      history = JSON.parse(saved);
      history.forEach(m => {
        if (m.type === 'rich') {
          addRichMsg(m.content, m.nextChips);
          setTimeout(bindNavClicks, 50);
        } else {
          addMsg(m.role, m.content);
        }
      });
      scrollBottom();
    }
  }
  function addRichMsg(html, nextChips) {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs) return;
    const row = el('div', { className: 'cb-msg cb-msg-bot' });
    row.innerHTML = `<div class="cb-msg-av">${CFG.botAvatar}</div><div class="cb-bubble cb-bubble-bot cb-rich">${html}</div>`;
    msgs.appendChild(row);
    scrollBottom();
    if (nextChips) updateChips(nextChips);
    saveChat();
  }
  function showTyping() {
    const msgs = document.getElementById('cb-msgs');
    if (!msgs || document.getElementById('cb-typing')) return;
    const row = el('div', { className: 'cb-msg cb-msg-bot', id: 'cb-typing' }, `
      <div class="cb-msg-av">${CFG.botAvatar}</div>
      <div class="cb-bubble cb-bubble-bot cb-typing-dots">
        <span></span><span></span><span></span>
      </div>
    `);
    msgs.appendChild(row);
    scrollBottom();
  }
  function removeTyping() { document.getElementById('cb-typing')?.remove(); }
  function scrollBottom() {
    const msgs = document.getElementById('cb-msgs');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }

  /* ══════════════════════════════════════════════════════
     NAV CARDS
  ══════════════════════════════════════════════════════ */
  function buildNavCards(keys) {
    const items = (keys || Object.keys(NAV)).map(k => {
      const n = NAV[k];
      if (!n) return '';
      return `<button class="cb-nav-item" data-nav="${k}">
        <span class="cb-nav-icon">${n.icon}</span>
        <span class="cb-nav-label">${escHTML(n.label)}</span>
        <span class="cb-nav-arrow">→</span>
      </button>`;
    }).join('');
    return `<div class="cb-nav-intro">Dove vuoi andare? Clicca per aprire:</div><div class="cb-nav-grid">${items}</div>`;
  }

  function bindNavClicks() {
    document.querySelectorAll('.cb-nav-item[data-nav]:not([data-bound])').forEach(btn => {
      btn.dataset.bound = '1';
      btn.addEventListener('click', () => {
        const n = NAV[btn.dataset.nav];
        if (n && n.action) { closeChat(); setTimeout(() => n.action(), 200); }
      });
    });
  }

  /* ══════════════════════════════════════════════════════
     HELPER
  ══════════════════════════════════════════════════════ */
  function rich(html, nextChips) { return { __rich: true, html, nextChips }; }

  /* ══════════════════════════════════════════════════════
     SEND
  ══════════════════════════════════════════════════════ */
  async function send(text) {
    text = text.trim();
    if (!text || isBusy) return;

    const chipsEl = document.getElementById('cb-chips');
    if (chipsEl) chipsEl.innerHTML = '';

    addMsg('user', text);
    history.push({ role: 'user', content: text });

    const input = document.getElementById('cb-input');
    if (input) { input.value = ''; autoResize(input); }

    setBusy(true);
    showTyping();

    try {
      const result = await generateResponse(text);
      removeTyping();
      if (result && result.__rich) {
        history.push({ role: 'assistant', content: result.html, type: 'rich', nextChips: result.nextChips });
        addRichMsg(result.html, result.nextChips);
        setTimeout(bindNavClicks, 50);
      } else {
        history.push({ role: 'assistant', content: result });
        addMsg('bot', result);
        updateChips(chipSet);
      }
    } catch (err) {
      removeTyping();
      addMsg('bot', 'Si è verificato un errore. Riprova tra poco.', true);
      console.error('[FITORA Chatbot]', err);
      updateChips(chipSet);
    } finally {
      setTimeout(() => setBusy(false), 50);
    }
  }

  function setBusy(busy) {
    isBusy = busy;
    const sb = document.getElementById('cb-send');
    const inp = document.getElementById('cb-input');
    if (sb) sb.disabled = busy;
    if (inp) inp.disabled = busy;
  }

  /* ══════════════════════════════════════════════════════
     LOGICA RISPOSTE, solo argomenti FITORA
  ══════════════════════════════════════════════════════ */
  async function generateResponse(userMessage) {
    await new Promise(r => setTimeout(r, Math.random() * 600 + 300));
    const msg = userMessage.toLowerCase();

    /* ── BMI Flow ── */
    if (bmiState.step === 1) {
      const w = parseFloat(msg);
      if (isNaN(w) || w < 30 || w > 250) return 'Per favore, inserisci un peso valido in kg (es: 75).';
      bmiState.weight = w;
      bmiState.step = 2;
      return 'Ottimo. Ora inserisci la tua **altezza in cm** (es: 180):';
    }
    if (bmiState.step === 2) {
      const h = parseFloat(msg) / 100;
      if (isNaN(h) || h < 1 || h > 2.5) return 'Per favore, inserisci un\'altezza valida in cm (es: 175).';
      const bmi = (bmiState.weight / (h * h)).toFixed(1);
      bmiState.step = 0;
      let desc = bmi < 18.5 ? 'Sottopeso' : bmi < 25 ? 'Normopeso' : bmi < 30 ? 'Sovrappeso' : 'Obesità';
      updateChips(CHIPS_DEFAULT);
      return `Il tuo BMI calcolato è **${bmi}** (${desc}).\n\nRicorda che questo è un valore indicativo. Per un'analisi completa usa la sezione **Nutrizione** di FITORA!`;
    }
    if (/calcola.*bmi|indice.*massa|voglio sapere il mio bmi/.test(msg)) {
      bmiState.step = 1;
      return 'Certamente! Qual è il tuo **peso attuale in kg**?';
    }

    /* ── Saluti ── */
    if (/\b(ciao|salve|hey|buongiorno|buonasera|buonanotte|hello)\b/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      const hasChattedBefore = localStorage.getItem('fitora_has_chatted');
      if (hasChattedBefore) {
        return 'Bentornato! Sono di nuovo qui per aiutarti con **FITORA**. Come posso esserti utile oggi?';
      } else {
        localStorage.setItem('fitora_has_chatted', 'true');
        return 'Ciao! Sono l\'assistente di **FITORA**.\n\nPosso aiutarti su: funzionalità dell\'app, Computer Vision AI, nutrizione, community e molto altro. Da dove vuoi iniziare?';
      }
    }

    /* ── Chi sei ── */
    if (/chi sei|cosa fai|presentati|come ti chiami/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Sono l\'assistente virtuale di **FITORA** <i class="fa-solid fa-robot" style="color: #9c27b0;"></i>\n\nPosso:\n- Rispondere a domande sulle **funzionalità** dell\'app\n- Portarti nelle **sezioni** del sito con un click\n- Spiegarti la **Computer Vision AI** e come funziona\n- Aiutarti con **nutrizione, allenamento e community**\n\nChiedimi pure qualsiasi cosa su FITORA!';
    }

    /* ── Contatti / Supporto ── */
    if (/contatti|supporto|aiuto|email|telefono|assistenza/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Puoi contattarci via email a **supporto@fitora.com** o visitare la nostra pagina **Contatti** sul sito. Siamo qui per aiutarti! <i class="fa-solid fa-envelope" style="color: #ff5722;"></i>';
    }

    /* ── Come funziona ── */
    if (/come funziona|funzionalit|cosa offre|cosa fa fitora|spiegami|dimmi di fitora/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'FITORA è un\'app fitness all-in-one basata su **AI** <i class="fa-solid fa-robot" style="color: #9c27b0;"></i>\n\n**01 Lo Sport Perfetto**, Analizza i tuoi dati e suggerisce lo sport ideale per te.\n\n**02 Allenamento AI**, Schede personalizzate che cambiano ogni giorno in base al tuo stato.\n\n**03 Computer Vision**, La fotocamera analizza la postura e conta le reps in tempo reale.\n\n**04 Adattabilità**, Il piano si adatta al tuo umore e stanchezza quotidiana.\n\n**05 Nutrizione Intelligente**, Piano alimentare su misura basato sui tuoi parametri reali.\n\n**06 Community**, Sfide, badge e compagni di allenamento.\n\nVuoi saperne di più su una funzione specifica?';
    }

    /* ── Navigazione ── */
    if (/dove trovo|dove si trova|dove posso|come arrivo|tutte le sezioni|mappa del sito|mostrami.*sezion|sezioni del sito|cosa c'è nel sito/.test(msg)) {
      return rich(buildNavCards(), CHIPS_AFTER_NAV);
    }

    if (/\b(dashboard|check.?in|pannello|home)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['home', 'allenamento', 'nutrizione', 'sport'] : ['dashboard', 'features', 'metodo']), CHIPS_AFTER_NAV);
    }
    if (/\b(workout|allenament|eserciz|scheda)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['allenamento', 'sport', IS_DASHBOARD ? 'run' : 'tech']), CHIPS_AFTER_NAV);
    }
    if (/\b(nutrizi|dieta|calorie|alimentaz|pasto|cibo)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['nutrizione', IS_DASHBOARD ? 'home' : 'dashboard']), CHIPS_AFTER_NAV);
    }
    if (/\b(community|amici|sfid|classifica|badge)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['community', IS_DASHBOARD ? 'storico' : 'futuro']), CHIPS_AFTER_NAV);
    }
    if (/\b(musica|spotify|playlist)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['musica', 'allenamento'] : ['dashboard']), CHIPS_AFTER_NAV);
    }
    if (/\b(gps|corri|corsa|percorso)\b/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(IS_DASHBOARD ? ['allenamento', 'community'] : ['dashboard', 'tech']), CHIPS_AFTER_NAV);
    }
    if (/registr|iscri|sign.?up/.test(msg) && /dove|trovo|apri|vai|portami/.test(msg)) {
      return rich(buildNavCards(['registrati', IS_DASHBOARD ? 'home' : 'dashboard']), CHIPS_AFTER_NAV);
    }

    /* ── Computer Vision ── */
    if (/computer vision|telecamera|fotocamera|postura|ripetizioni|\brep\b|movimento.*reale|reale.*movimento/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Computer Vision di FITORA** <i class="fa-solid fa-camera" style="color: #607d8b;"></i>\n\nUsa la fotocamera del tuo smartphone per:\n\n- **Analizzare i movimenti** in tempo reale\n- **Correggere la postura** con feedback visivo immediato\n- **Contare le ripetizioni** automaticamente\n- **Rilevare rischi di infortuni** prima che accadano\n\nNon servono sensori o device aggiuntivi, basta il tuo telefono! <i class="fa-solid fa-mobile" style="color: #607d8b;"></i>';
    }

    /* ── GPS / Corsa (non disponibile nel chatbot) ── */
    if (/\bgps\b|traccia.*corsa|percorso gps|correre|running|km.*corsa|distanza.*corsa|storico.*cors|le mie corse/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Il tracking GPS non è una funzione che gestisco dalla chat. Puoi trovare tutte le informazioni sull\'allenamento e le funzionalità di FITORA nelle sezioni dell\'app! <i class="fa-solid fa-dumbbell" style="color: #9c27b0;"></i>';
    }

    /* ── Adattabilità / Check-in ── */
    if (/adattab|check.?in|umore|stanchezza|giorn|quotidian|stato.*oggi|come mi sento/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Adattabilità Quotidiana** <i class="fa-solid fa-rotate" style="color: #03a9f4;"></i>\n\nOgni giorno FITORA ti chiede come stai tramite un breve **check-in**:\n\n- Come ti senti fisicamente?\n- Livello di stanchezza e stress\n- Qualità del sonno\n\nIn base alle risposte, l\'AI **modifica il piano di allenamento**:\n\n🟢 Forma top → allenamento intenso\n🟡 Moderato → workout ridotto\n🔴 Stanco → recupero attivo\n\nCosì non ti alleni mai in modo controproducente!';
    }

    /* ── Sport / Quiz ── */
    if (/sport perfetto|sport ideal|quale sport|che sport|mi consiglia.*sport|quiz.*sport|sport.*quiz/.test(msg)) {
      updateChips(['Dove trovo il Quiz Sport?', 'Come funziona FITORA?', 'Community e sfide', 'Allenamento con l\'AI']);
      return '**"Il Tuo Sport Perfetto"** <i class="fa-solid fa-trophy" style="color: #ffc107;"></i>\n\nFITORA incrocia:\n- I tuoi **dati clinici** (peso, altezza, pressione, glicemia)\n- Le tue **preferenze personali**\n- Le tue **capacità fisiche reali**\n\nIn 6 domande ti suggerisce i **3 sport più adatti a te**, spiegando i benefici specifici per la tua salute.\n\nVuoi aprire il quiz adesso?';
    }

    /* ── Allenamento con AI ── */
    if (/allenament.*ai|ai.*allenament|scheda.*ai|ai.*scheda|workout.*inteligent/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Allenamento con l\'AI** <i class="fa-solid fa-bolt" style="color: #facc15;"></i>\n\nFITORA genera schede personalizzate basate su:\n\n- Il tuo **profilo clinico** (peso, altezza, parametri medici)\n- Il **check-in giornaliero** (come stai oggi)\n- I tuoi **obiettivi** (forza, dimagrimento, resistenza...)\n- Lo **sport che pratichi**\n\nLa scheda si adatta automaticamente ogni giorno, mai lo stesso workout generico!';
    }

    /* ── Nutrizione ── */
    if (/nutrizi|calorie|caloric|macro|dieta|alimentaz|pasto|cibo|bmr|tdee|fabbisogno/.test(msg)) {
      updateChips(['Dove trovo il Piano Alimentare?', 'Come funziona FITORA?', 'Allenamento con l\'AI', 'Community e sfide']);
      return '**Nutrizione Intelligente** <i class="fa-solid fa-bowl-food" style="color: #4caf50;"></i>\n\nFITORA calcola:\n\n- **BMR** (metabolismo basale) + **TDEE** (fabbisogno totale)\n- Suddivisione ottimale in **macronutrienti** (proteine, carbo, grassi)\n- **Piano pasti giornaliero** su misura\n\nTutto basato sui tuoi parametri reali, non una dieta generica, ma una dieta *tua*.\n\nVuoi aprire il Piano Alimentare?';
    }

    /* ── Community / Sfide ── */
    if (/community|amici|sfid|classifica|social|gruppo|badge|gamification|compagno/.test(msg)) {
      updateChips(['Dove trovo la Community?', 'Allenamento con l\'AI', 'Come mi registro?', 'Come funziona FITORA?']);
      return '**Community FITORA** <i class="fa-solid fa-users" style="color: #03a9f4;"></i>\n\nNella Community puoi **sfidare i tuoi amici**:\n\n- **Invita un amico** e mettiti alla prova insieme\n- **Sfide dirette**, chi si allena di più questa settimana?\n- **Classifica amici**, confronta i tuoi progressi con chi conosci\n\nCondividi i tuoi risultati e spingi i tuoi amici a fare meglio! <i class="fa-solid fa-trophy" style="color: #ffc107;"></i>';
    }

    /* ── Musica / Spotify ── */
    if (/\b(musica|spotify|playlist|brano|canzone)\b/.test(msg)) {
      updateChips(['Cos\'è la Computer Vision?', 'Nutrizione intelligente', 'Community e sfide', 'Come funziona FITORA?']);
      return '**Musica su FITORA** <i class="fa-solid fa-music" style="color: #e91e63;"></i>\n\nNella sezione **Musica** puoi:\n\n- Ascoltare una **playlist predefinita** per l\'allenamento\n- Incollare qualsiasi link **Spotify** (brano, album o playlist)\n- Il link viene **salvato automaticamente** per le prossime sessioni';
    }

    /* ── Wearable ── */
    if (/wearable|smartwatch|apple watch|garmin|fitbit|orologio.*smart/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**Integrazione Wearable** <i class="fa-solid fa-stopwatch" style="color: #607d8b;"></i>\n\nFITORA sta sviluppando l\'integrazione con:\n\n- **Apple Watch**\n- **Garmin**\n- **Fitbit**\n\nI dati si sincronizzeranno automaticamente. Questa funzione arriva con **FITORA 2.0** <i class="fa-solid fa-rocket" style="color: #ff5722;"></i>!';
    }

    /* ── Futuro / FITORA 2.0 ── */
    if (/futuro|prossimamente|2\.0|telemedicina|partnership|in arrivo|novit/.test(msg)) {
      updateChips(['Come funziona FITORA?', 'Wearable e integrazioni', 'Community e sfide', 'Allenamento con l\'AI']);
      return '**Il Futuro di FITORA** <i class="fa-solid fa-rocket" style="color: #ff5722;"></i>\n\n**Integrazione Wearable**, Sync automatico con Apple Watch, Fitbit, Garmin.\n\n**Partnership Mediche**, Collaborazioni con palestre, centri medici e assicurazioni.\n\n**Telemedicina**, I medici potranno monitorare i progressi dei pazienti a distanza.\n\nFITORA è una piattaforma in continua evoluzione!';
    }

    /* ── App mobile ── */
    if (/app mobile|scarica|download|android|ios|iphone|google play|app store/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return '**App FITORA** <i class="fa-solid fa-mobile-screen" style="color: #4caf50;"></i>\n\nDisponibile su:\n- **App Store** (iOS / iPhone)\n- **Google Play** (Android)\n\nScaricala gratuitamente! Puoi anche usare FITORA direttamente dal **browser**, prova subito la Dashboard!';
    }

    /* ── Registrazione ── */
    if (/registr|iscri|creare.*account|sign.?up|nuovo.*account/.test(msg)) {
      updateChips(['Dove mi registro?', 'Come funziona FITORA?', 'Community e sfide', 'Allenamento con l\'AI']);
      return 'Per registrarti a **FITORA** e iniziare il tuo percorso fitness, vai alla pagina **Registrati** dal menu in alto. È semplice e veloce! <i class="fa-solid fa-clipboard-list" style="color: #ffeb3b;"></i>';
    }

    /* ── Login ── */
    if (/login|accedi|entrare|password|accesso|dimenticato.*password/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Per accedere a **FITORA** usa il pulsante **Dashboard** nel menu in alto.\n\nSe hai dimenticato la password, dalla pagina di login trovi il link *"Password dimenticata?"* per resettarla via email <i class="fa-solid fa-lock" style="color: #ff9800;"></i>';
    }

    /* ── Piano 10K ── */
    if (/miglior.*10k|migliorare.*10k|piano.*10k|preparazione.*10k/.test(msg)) {
      updateChips(['Allenamento con l\'AI', 'Community e sfide', 'Come funziona FITORA?']);
      return 'Per migliorare il tuo tempo sui **10K** con FITORA:\n\n**Settimane 1-2: Base Aerobica**\n— 3 corse lente (Z2) da 5-7km per costruire resistenza.\n\n**Settimane 3-4: Ritmo**\n— Ripetute (6x800m a ritmo gara) e corsa lunga da 12km.\n\n**Settimane 5-6: Intensità**\n— Tempo Run da 8km e fartlek esplosivi.\n\n**Settimane 7-8: Tapering**\n— Volume ridotto del 30% per arrivare freschi al test.';
    }

    /* ── Infortuni / sicurezza ── */
    if (/infortun|dolore|fisioterapia|recupero|sicurezza|male.*eserciz/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'La **sicurezza** è al centro di FITORA <i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i>\n\nL\'app monitora il carico di lavoro e ti avvisa quando rischi il sovrallenamento. La **Computer Vision** analizza la postura in tempo reale per prevenire movimenti scorretti.\n\nIn caso di dolori o infortuni, consulta sempre un medico o fisioterapista prima di riprendere.';
    }

    /* ── Notifiche ── */
    if (/notifich|reminder|avvisi|promemoria/.test(msg)) {
      updateChips(CHIPS_AFTER_FEATURES);
      return 'FITORA invia **notifiche intelligenti** <i class="fa-solid fa-bell" style="color: #ffeb3b;"></i>\n\n- Reminder per gli allenamenti programmati\n- Aggiornamenti sui progressi settimanali\n- Avvisi sulle sfide della community\n- Messaggi motivazionali personalizzati\n\nGestisci le preferenze da **Profilo → Impostazioni Notifiche**.';
    }

    /* ── Grazie ── */
    if (/\b(grazie|perfetto|ottimo|bravo|ok grazie|capito|benissimo)\b/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Prego! <i class="fa-solid fa-face-smile" style="color: #4caf50;"></i> Sono qui se hai altre domande su FITORA. Buon allenamento! <i class="fa-solid fa-dumbbell" style="color: #9c27b0;"></i>';
    }

    /* ── Off-topic ── */
    if (/politic|notizie|matematica|storia|meteo|covid|guerra|film|ricette di cucina|personal trainer|pt\b|\bcoach\b|allenatore|\bgps\b|storico.*cors/.test(msg)) {
      updateChips(CHIPS_DEFAULT);
      return 'Mi dispiace, posso rispondere solo a domande su **FITORA** e le sue funzionalità <i class="fa-solid fa-dumbbell" style="color: #9c27b0;"></i>\n\nHai domande sull\'app, la Computer Vision, la nutrizione o la community?';
    }

    /* ── Fallback ── */
    updateChips(CHIPS_DEFAULT);
    return 'Non ho capito bene <i class="fa-solid fa-question" style="color: #ffc107;"></i> Ecco cosa posso fare per te:\n\n- Spiegarti le **funzionalità** di FITORA\n- Portarti nelle **sezioni** del sito con un click\n- Rispondere su **allenamento, nutrizione, GPS, Computer Vision e community**\n\nProva a riformulare o scegli un argomento qui sotto!';
  }

  /* ══════════════════════════════════════════════════════
     OPEN / CLOSE
  ══════════════════════════════════════════════════════ */
  function openChat() {
    if (isOpen) return;
    isOpen = true;
    const win = document.getElementById('cb-win');
    const btn = document.getElementById('cb-toggle');
    win.style.zIndex = '99999';
    win.style.display = 'flex';
    void win.offsetHeight;
    win.classList.add('cb-open');
    btn.classList.add('cb-open');
    hideBadge();
    setTimeout(() => document.getElementById('cb-input')?.focus(), 320);
  }
  function closeChat() {
    if (!isOpen) return;
    isOpen = false;
    const win = document.getElementById('cb-win');
    const btn = document.getElementById('cb-toggle');
    win.classList.remove('cb-open');
    win.classList.add('cb-closing');
    btn.classList.remove('cb-open');
    setTimeout(() => { win.style.display = 'none'; win.classList.remove('cb-closing'); }, 250);
  }
  function hideBadge() {
    const b = document.getElementById('cb-badge');
    if (b) b.style.display = 'none';
  }
  function showBadge(n) {
    const b = document.getElementById('cb-badge');
    if (b) { b.textContent = n; b.style.display = 'flex'; }
  }

  /* ══════════════════════════════════════════════════════
     EXTRA STYLES
  ══════════════════════════════════════════════════════ */
  function injectExtraStyles() {
    if (document.getElementById('cb-extra-styles')) return;
    const style = document.createElement('style');
    style.id = 'cb-extra-styles';
    style.textContent = `
      .cb-rich { padding: 10px 12px !important; max-width: 96% !important; }

      /* Nav cards */
      .cb-nav-intro { font-size: 12px; color: rgba(26,46,31,0.5); margin-bottom: 9px; }
      .cb-nav-grid { display: flex; flex-direction: column; gap: 5px; }
      .cb-nav-item {
        display: flex; align-items: center; gap: 10px;
        background: rgba(26,46,31,0.03); border: 1px solid rgba(26,46,31,0.07);
        border-radius: 9px; padding: 9px 11px;
        cursor: pointer; width: 100%; text-align: left; color: #1a2e1f;
        font-family: inherit; transition: background 0.15s, border-color 0.15s;
      }
      .cb-nav-item:hover { background: rgba(58,90,64,0.07); border-color: rgba(58,90,64,0.22); }
      .cb-nav-icon  { font-size: 16px; width: 22px; text-align: center; flex-shrink: 0; }
      .cb-nav-label { flex: 1; font-size: 12.5px; font-weight: 600; }
      .cb-nav-arrow { color: #3a5a40; font-size: 13px; }
    `;
    document.head.appendChild(style);
  }

  /* ══════════════════════════════════════════════════════
     DRAGGABLE TOGGLE
  ══════════════════════════════════════════════════════ */
  function makeDraggable(el) {
    let isDragging = false;
    let moved = false;
    let startX, startY, initialRight, initialBottom;
    const dragThreshold = 5;
    const win = document.getElementById('cb-win');

    const saved = localStorage.getItem('fitora_cb_pos');
    if (saved) {
      const pos = JSON.parse(saved);
      el.style.right = pos.right;
      el.style.bottom = pos.bottom;
      if (win && window.innerWidth > 440) {
        win.style.right = pos.right;
        const bVal = parseInt(pos.bottom);
        if (!isNaN(bVal)) win.style.bottom = (bVal + 72) + 'px';
      }
    }

    const onStart = (e) => {
      isDragging = true;
      moved = false;
      const t = e.type === 'touchstart' ? e.touches[0] : e;
      startX = t.clientX;
      startY = t.clientY;
      const rect = el.getBoundingClientRect();
      initialRight = window.innerWidth - rect.right;
      initialBottom = window.innerHeight - rect.bottom;
      el.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const t = e.type === 'touchmove' ? e.touches[0] : e;
      const dx = startX - t.clientX;
      const dy = startY - t.clientY;

      if (!moved && (Math.abs(dx) > dragThreshold || Math.abs(dy) > dragThreshold)) moved = true;

      if (moved) {
        if (e.cancelable) e.preventDefault();
        let r = initialRight + dx;
        let b = initialBottom + dy;
        const p = 15;
        r = Math.max(p, Math.min(r, window.innerWidth - el.offsetWidth - p));
        b = Math.max(p, Math.min(b, window.innerHeight - el.offsetHeight - p));

        el.style.right = r + 'px';
        el.style.bottom = b + 'px';
        if (win && window.innerWidth > 440) {
          win.style.right = r + 'px';
          win.style.bottom = (b + 72) + 'px';
        }
      }
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      el.style.transition = '';
      if (moved) {
        localStorage.setItem('fitora_cb_pos', JSON.stringify({ right: el.style.right, bottom: el.style.bottom }));
      }
    };

    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, { passive: false });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    el.addEventListener('click', (e) => {
      if (moved) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);
  }

  /* ══════════════════════════════════════════════════════
     INIT
  ══════════════════════════════════════════════════════ */
  function init() {
    buildDOM();
    injectExtraStyles();
    makeDraggable(document.getElementById('cb-toggle'));
    renderChips(CHIPS_DEFAULT);

    setTimeout(() => {
      const hasChattedBefore = localStorage.getItem('fitora_has_chatted');
      let msg = CFG.welcomeMessage;
      if (hasChattedBefore) {
        msg = 'Bentornato! Sono di nuovo qui per aiutarti con **FITORA**. Come posso esserti utile oggi?';
      } else {
        localStorage.setItem('fitora_has_chatted', 'true');
      }
      addMsg('bot', msg);
      if (!isOpen) showBadge(1);
    }, 900);

    document.getElementById('cb-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      isOpen ? closeChat() : openChat();
    });
    document.getElementById('cb-reset').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Vuoi cancellare la cronologia della chat?')) {
        localStorage.removeItem('fitora_chat_history');
        location.reload();
      }
    });
    document.getElementById('cb-close').addEventListener('click', closeChat);
    document.getElementById('cb-send').addEventListener('click', (e) => {
      e.stopPropagation();
      const v = document.getElementById('cb-input')?.value;
      if (v?.trim()) send(v);
    });
    document.getElementById('cb-input').addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); const v = e.target.value; if (v.trim()) send(v); }
    });
    document.getElementById('cb-input').addEventListener('input', e => autoResize(e.target));
    document.addEventListener('click', e => {
      if (!isOpen) return;
      const win = document.getElementById('cb-win');
      const btn = document.getElementById('cb-toggle');
      if (document.contains(e.target) && win && !win.contains(e.target) && !btn.contains(e.target)) {
        closeChat();
      }
    });
    loadChat();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
