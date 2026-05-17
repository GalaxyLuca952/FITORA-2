
/* ══ STATE ══ */
let cfg = { sport: null, sportName: '', sportIcon: '', level: null, dur: null };
let checkin = { score: 65, energy: 3 };
let lastWorkoutData = null;

document.getElementById('navDate').textContent =
    new Date().toLocaleDateString('it-IT', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase();

/* ══ LOAD SAVED DATA ══ */
(function init() {
    // Check-in
    try {
        const ci = JSON.parse(sessionStorage.getItem('fitora_checkin'));
        if (ci) { checkin.score = ci.score || 65; checkin.energy = ci.energy || 3; checkin.pain = ci.pain || []; }
    } catch (e) { }

    const score = checkin.score;
    document.getElementById('ss-score').innerHTML = score;
    const energyEmoji = ['', '<i class="fa-solid fa-face-tired" style="color: #f44336;"></i>', '<i class="fa-solid fa-face-frown" style="color: #ff9800;"></i>', '<i class="fa-solid fa-face-meh" style="color: #ffeb3b;"></i>', '<i class="fa-solid fa-face-smile" style="color: #8bc34a;"></i>', '<i class="fa-solid fa-fire" style="color: #ff5722;"></i>'];
    document.getElementById('ss-energy').innerHTML = energyEmoji[checkin.energy] || '<i class="fa-solid fa-face-meh" style="color: #ffeb3b;"></i>';
    const intensity = score >= 80 ? 'Massima <i class="fa-solid fa-fire" style="color: #ff5722;"></i>' : score >= 60 ? 'Piena <i class="fa-solid fa-bolt" style="color: #facc15;"></i>' : score >= 40 ? 'Moderata <i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i>' : 'Leggera <i class="fa-solid fa-shield" style="color: #03a9f4;"></i>';
    document.getElementById('ss-intensity').innerHTML = intensity;

    // Saved sport from quiz
    try {
        const sp = JSON.parse(localStorage.getItem('fitora_sport'));
        if (sp) {
            cfg.sport = sp.id; cfg.sportName = sp.name; cfg.sportIcon = sp.icon || '<i class="fa-solid fa-person-running" style="color: #ff5722;"></i>';
            cfg.level = sp.level || 'mid';
            // Highlight buttons
            const sportMap = { run: 'Corsa', gym: 'Palestra', swim: 'Nuoto', cycling: 'Ciclismo', yoga: 'Yoga', football: 'Calcio', tennis: 'Tennis', boxing: 'Boxe', hiking: 'Trekking' };
            document.querySelectorAll('#sportGrid .cfg-btn').forEach(b => {
                if (b.querySelector('.cfg-name').textContent.includes(sportMap[sp.id] || '')) {
                    b.classList.add('sel');
                }
            });
            const lvlMap = { beginner: 0, basic: 0, mid: 1, advanced: 2 };
            const lvlBtns = document.querySelectorAll('[onclick*="setLevel"]');
            if (lvlBtns[lvlMap[sp.level]]) lvlBtns[lvlMap[sp.level]].classList.add('sel');
        }
    } catch (e) { }

    checkReady();
})();

/* ══ CONFIG ══ */
function setSport(id, name, el) {
    cfg.sport = id; cfg.sportName = name;
    const icons = { run: '<i class="fa-solid fa-person-running" style="color: #ff5722;"></i>', gym: '<i class="fa-solid fa-dumbbell" style="color: #9c27b0;"></i>', swim: '<i class="fa-solid fa-person-swimming" style="color: #03a9f4;"></i>', cycling: '<i class="fa-solid fa-person-biking" style="color: #4caf50;"></i>', yoga: '<i class="fa-solid fa-person-praying" style="color: #e91e63;"></i>', football: '<i class="fa-regular fa-futbol" style="color: #ffffff;"></i>', tennis: '<i class="fa-solid fa-table-tennis-paddle-ball" style="color: #cddc39;"></i>', boxing: '<i class="fa-solid fa-hand-fist" style="color: #f44336;"></i>', hiking: '<i class="fa-solid fa-person-hiking" style="color: #795548;"></i>' };
    cfg.sportIcon = icons[id] || '<i class="fa-solid fa-person-running" style="color: #ff5722;"></i>';
    document.querySelectorAll('#sportGrid .cfg-btn').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel'); checkReady();
}
function setLevel(val, el) {
    cfg.level = val;
    document.querySelectorAll('[onclick*="setLevel"]').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel'); checkReady();
}
function setDur(val, el) {
    cfg.dur = val;
    document.querySelectorAll('[onclick*="setDur"]').forEach(b => b.classList.remove('sel'));
    el.classList.add('sel'); checkReady();
}
function checkReady() {
    document.getElementById('genBtn').disabled = !(cfg.sport && cfg.level && cfg.dur);
}

/* ══ EXERCISE DATABASE ══ */
const DB = {
    run: {
        warmup: [
            { n: 'Camminata veloce', d: 'Aumenta gradualmente il ritmo', spec: '5 min' },
            { n: 'Skip sul posto', d: 'Ginocchia alte, braccia attive', spec: '30 sec × 3' },
            { n: 'Calcio ai glutei', d: 'Talloni verso i glutei, in progressione', spec: '30 sec × 3' },
            { n: 'Accelerazioni brevi', d: 'Da 0 a 80% su 50m', spec: '4 × 50m' },
        ],
        main: {
            beginner: [
                { n: 'Run-Walk intervals', d: '1 min corsa + 2 min camminata, ripeti', spec: '8–10 serie' },
                { n: 'Corsa continua leggera', d: 'Ritmo conversazione (puoi parlare)', spec: '10–15 min' },
            ],
            mid: [
                { n: 'Corsa a ritmo medio', d: 'Passo moderato, 65–75% FCmax', spec: '20–25 min' },
                { n: 'Fartlek 30/30', d: '30 sec veloce + 30 sec lento alternati', spec: '10 serie' },
                { n: 'Strides finali', d: '80% su 100m con recupero', spec: '4 × 100m' },
            ],
            advanced: [
                { n: 'Riscaldamento aggiuntivo', d: 'Corsa facile con strides', spec: '10 min' },
                { n: 'Interval 400m', d: 'Ritmo gara 5K, recupero 90 sec', spec: '6 × 400m' },
                { n: 'Threshold run', d: 'Passo soglia lattato, parlare è duro', spec: '15–20 min' },
                { n: 'Cool-down jog', d: 'Corsa facilissima per abbassare FC', spec: '5 min' },
            ],
        },
        cooldown: [
            { n: 'Camminata defaticante', d: '', spec: '5 min' },
            { n: 'Stretching quadricipiti', d: 'Tieni 30 sec per lato', spec: '2 × 30 sec' },
            { n: 'Stretching polpacci', d: 'Parete o gradino', spec: '2 × 30 sec' },
            { n: 'Stretching flessori dell\'anca', d: 'Affondo con rotazione', spec: '2 × 30 sec' },
        ],
        kcalBase: { beginner: 200, mid: 320, advanced: 450 },
    },

    gym: {
        warmup: [
            { n: 'Cardio leggero', d: 'Tapis roulant o cyclette a bassa intensità', spec: '5 min' },
            { n: 'Rotazioni spalle', d: 'Avanti e indietro, ampiezza crescente', spec: '20 rip' },
            { n: 'Squat a corpo libero', d: 'Profondo, talloni a terra', spec: '15 rip' },
            { n: 'Band pull-apart', d: 'Elastico all\'altezza del petto', spec: '15 rip' },
        ],
        main: {
            beginner: [
                { n: 'Squat con bilanciere (o goblet)', d: '3×8 · Pausa bassa · Schiena dritta', spec: '3 × 8 rip' },
                { n: 'Chest press su panca', d: 'Presa media, controllo discesa', spec: '3 × 10 rip' },
                { n: 'Lat machine presa larga', d: 'Tira verso il mento, non dietro la nuca', spec: '3 × 10 rip' },
                { n: 'Shoulder press con manubri', d: 'Seduto, gomiti a 90° in partenza', spec: '3 × 10 rip' },
                { n: 'Plank', d: 'Core attivo, respira', spec: '3 × 30 sec' },
            ],
            mid: [
                { n: 'Squat bilanciere', d: '4×6 · Scendi sotto parallela', spec: '4 × 6 rip' },
                { n: 'Stacco rumeno', d: 'Schiena neutra, tensione nei femorali', spec: '4 × 8 rip' },
                { n: 'Panca piana bilanciere', d: 'Tocca il petto, non rimbalzare', spec: '4 × 6 rip' },
                { n: 'Trazioni (o lat machine)', d: 'Presa supina per più bicipite', spec: '4 × 8 rip' },
                { n: 'Affondi con manubri', d: 'Passo lungo, ginocchio non supera il piede', spec: '3 × 10 per lato' },
                { n: 'Curl con manubri + Tricipiti cavi', d: 'Superserie: bicipiti + tricipiti', spec: '3 × 12 rip' },
            ],
            advanced: [
                { n: 'Stacco da terra', d: '5×3 · Schiena neutra · Cintura su carichi alti', spec: '5 × 3 rip' },
                { n: 'Squat bilanciere alta frequenza', d: 'Pausa in buca 2 sec', spec: '5 × 5 rip' },
                { n: 'Panca inclinata bilanciere', d: '30° inclinazione, arco lombare controllato', spec: '4 × 5 rip' },
                { n: 'Trazioni lastrate', d: 'Presa neutra, tempo di discesa 3 sec', spec: '4 × 6 rip' },
                { n: 'Bulgarian split squat', d: 'Piede posteriore su panca, manubri', spec: '4 × 8 per lato' },
                { n: 'Farmer walk', d: 'Manubri pesanti, core braced, 40m', spec: '4 × 40m' },
            ],
        },
        cooldown: [
            { n: 'Stretching petto + bicipiti', d: 'Porta le braccia dietro con cinghia o parete', spec: '2 × 30 sec' },
            { n: 'Stretching femorali', d: 'Piegato in avanti con ginocchia morbide', spec: '2 × 40 sec' },
            { n: 'Stretching dorsali', d: 'Posizione bambino o hang dalla sbarra', spec: '2 × 30 sec' },
            { n: 'Foam rolling', d: 'Rullo su quadricipiti, dorsali, IT-band', spec: '3 min totali' },
        ],
        kcalBase: { beginner: 180, mid: 280, advanced: 380 },
    },

    swim: {
        warmup: [
            { n: 'Nuoto libero facile', d: 'Stile libero a ritmo blando, respiro naturale', spec: '200m' },
            { n: 'Drill calci a rana', d: 'Solo gambe con tavoletta', spec: '4 × 25m' },
            { n: 'Drill braccia stile libero', d: 'Un braccio alla volta, pala', spec: '4 × 25m' },
        ],
        main: {
            beginner: [
                { n: 'Stile libero con pause', d: 'Recupero 30 sec ogni vasca', spec: '8 × 25m' },
                { n: 'Dorso continuo', d: 'Ritmo basso, rotazione spalle', spec: '4 × 25m' },
            ],
            mid: [
                { n: 'Serie mista 4×100m', d: '75 sec recupero tra le serie', spec: '4 × 100m' },
                { n: 'Fartlek acqua', d: '25m sprint + 50m facile alternati', spec: '8 × 75m' },
                { n: 'Rana tecnica', d: 'Enfasi su scivolata in fase di recupero', spec: '4 × 50m' },
            ],
            advanced: [
                { n: 'Piramide discendente', d: '400–300–200–100m con 60s recupero', spec: '1000m totali' },
                { n: 'Sprint 50m massimali', d: 'Recupero 2 min completo', spec: '8 × 50m' },
                { n: 'Mixed IM 200m', d: 'Farfalla–dorso–rana–stile libero 50m cad.', spec: '4 × 200m' },
            ],
        },
        cooldown: [
            { n: 'Nuoto defaticante', d: 'Stile libero lentissimo, respiro profondo', spec: '200m' },
            { n: 'Stretching spalle a bordo vasca', d: '', spec: '2 × 30 sec' },
            { n: 'Stretching torace in acqua', d: 'Braccia aperte, schiena alla parete vasca', spec: '30 sec' },
        ],
        kcalBase: { beginner: 220, mid: 350, advanced: 480 },
    },

    cycling: {
        warmup: [
            { n: 'Pedalata leggera', d: 'Cadenza alta, resistenza minima', spec: '5 min' },
            { n: 'Single-leg drill', d: 'Un pedale alla volta, 20 sec per gamba', spec: '3 × 40 sec' },
        ],
        main: {
            beginner: [
                { n: 'Endurance continua', d: 'Zona 2 - puoi parlare senza fatica', spec: '20–25 min' },
                { n: 'Accelerazioni brevi', d: '15 sec a ritmo elevato, recupero 45 sec', spec: '5 serie' },
            ],
            mid: [
                { n: 'Tempo intervals', d: '10 min a zona 3–4, recupero 5 min', spec: '3 × 10 min' },
                { n: 'Cadence drill', d: 'Cadenza 100+ rpm resistenza bassa', spec: '3 × 5 min' },
                { n: 'Sprint finale', d: 'Massima potenza su 30 sec', spec: '4 × 30 sec' },
            ],
            advanced: [
                { n: 'VO2max intervals', d: '4 min a zona 5, recupero 4 min', spec: '5 × 4 min' },
                { n: 'Sweetspot', d: '88–93% FTP, fondo', spec: '2 × 20 min' },
                { n: 'Micro-burst', d: '15 sec ON / 15 sec OFF a massima potenza', spec: '3 × 10 min' },
            ],
        },
        cooldown: [
            { n: 'Pedalata facilissima', d: 'Spin-down per abbassare FC', spec: '5 min' },
            { n: 'Stretching quadricipiti', d: 'In piedi, tallone al gluteo', spec: '2 × 30 sec per lato' },
            { n: 'Stretching flessori anca', d: 'Affondo basso', spec: '2 × 30 sec per lato' },
        ],
        kcalBase: { beginner: 200, mid: 340, advanced: 480 },
    },

    yoga: {
        warmup: [
            { n: 'Respirazione diaframmatica', d: 'Inspirazione 4s, espirazione 6s', spec: '2 min' },
            { n: 'Cat-Cow', d: 'Sincronizzato con respiro', spec: '10 cicli' },
            { n: 'Child pose', d: 'Braccia distese, fronte a terra', spec: '1 min' },
        ],
        main: {
            beginner: [
                { n: 'Saluto al sole A (Surya A)', d: '5 cicli lenti, enfasi sull\'allineamento', spec: '5 serie' },
                { n: 'Guerriero I e II', d: 'Tieni 5 respiri per lato', spec: '3 serie per lato' },
                { n: 'Postura del triangolo', d: 'Fianchi aperti, non ruotare il busto', spec: '3 per lato' },
                { n: 'Savasana', d: 'Rilassamento completo consapevole', spec: '5 min' },
            ],
            mid: [
                { n: 'Saluto al sole B (Surya B)', d: '8 cicli, transizioni fluide', spec: '8 serie' },
                { n: 'Sequenza flessori anca', d: 'Piccione + affondo basso + mezza spaccata', spec: '3 min per lato' },
                { n: 'Core flow', d: 'Plank → side plank → boat pose', spec: '3 serie' },
                { n: 'Backbend progressivi', d: 'Cobra → upward dog → wheel (se disponibile)', spec: '5 cicli' },
            ],
            advanced: [
                { n: 'Saluto al sole avanzato', d: 'Con jump-back e jump-through', spec: '10 cicli' },
                { n: 'Bilanciamento su un arto', d: 'Albero → guerriero III → mezza luna', spec: '3 per lato' },
                { n: 'Inversioni', d: 'Spalla o testa: 2 min di tenuta', spec: '3 × 2 min' },
                { n: 'Yin: pigeon passivo', d: '5 min per lato, cedimento profondo', spec: '10 min totali' },
            ],
        },
        cooldown: [
            { n: 'Supine twist', d: 'Ginocchia al petto, cadono di lato', spec: '2 min per lato' },
            { n: 'Happy baby', d: 'Piedi in aria, oscillazioni laterali', spec: '2 min' },
            { n: 'Savasana profonda', d: 'Nessun movimento, scannerizza il corpo', spec: '7 min' },
        ],
        kcalBase: { beginner: 100, mid: 160, advanced: 220 },
    },

    football: {
        warmup: [
            { n: 'Jogging leggero', d: 'Giro del campo a ritmo blando', spec: '3 giri' },
            { n: 'Dynamic stretching', d: 'Affondo laterale, leg swing, twist busto', spec: '5 min' },
            { n: 'Rondò possesso palla', d: '4v2 o 5v2 in area ridotta', spec: '5 min' },
            { n: 'Scatti brevi', d: '15m accelerazione massima, recupero camminando', spec: '6 × 15m' },
        ],
        main: {
            beginner: [
                { n: 'Tecnica di base palla ferma', d: 'Controllo, stop, passaggio corto', spec: '10 min' },
                { n: 'Dribbling a cinesini', d: 'Slalom lento enfatizzando tocco interno/esterno', spec: '3 serie' },
                { n: 'Partitella 4v4', d: 'Campo ridotto, tocchi limitati', spec: '3 × 8 min' },
            ],
            mid: [
                { n: 'Possesso palla 6v3', d: 'Mantieni palla, pressing 3 difensori', spec: '4 × 5 min' },
                { n: 'Sovraccarico fisico 120m', d: 'Sprint 30m + recupero jogging + ripeti', spec: '6 serie' },
                { n: 'Esercizio combinato tecnica+fisico', d: 'Sprint, controllo, tiro in porta', spec: '8 ripetizioni' },
                { n: 'Partitella 7v7 situazionale', d: 'Focus su pressing alto', spec: '2 × 15 min' },
            ],
            advanced: [
                { n: 'Circuit conditioning', d: 'Sprint 40m + 10 addominali + recupero 60s', spec: '8 serie' },
                { n: 'Tiki-taka 1-2 tocchi', d: 'Palla in movimento, nessuno stop', spec: '10 min' },
                { n: 'Partitella a intensità massima', d: 'Pressing continuo, ogni pallone è vitale', spec: '2 × 20 min' },
            ],
        },
        cooldown: [
            { n: 'Jogging defaticante', d: '', spec: '5 min' },
            { n: 'Stretching flessori anca', d: 'Affondo + rotazione busto', spec: '2 × 30 sec per lato' },
            { n: 'Stretching polpacci + femorali', d: '', spec: '2 min' },
        ],
        kcalBase: { beginner: 260, mid: 380, advanced: 520 },
    },

    tennis: {
        warmup: [
            { n: 'Jogging e skip laterali', d: 'Movimenti sul campo: avanti, indietro, lato', spec: '5 min' },
            { n: 'Rotazioni spalle e polsi', d: 'Preparazione articolare per i gesti di gioco', spec: '2 min' },
            { n: 'Mini-rally corto', d: 'A metà campo, solo controllo', spec: '5 min' },
        ],
        main: {
            beginner: [
                { n: 'Colpi di diritto e rovescio da fermo', d: 'Preparazione racchetta, punto di impatto', spec: '20 min' },
                { n: 'Servizio base', d: 'Solo movimento, senza potenza', spec: '30 servizi' },
                { n: 'Gioco libero con punto', d: 'Sets brevi per applicare i fondamentali', spec: '20 min' },
            ],
            mid: [
                { n: 'Pallonetti e smash', d: 'Tiro lob + risposta smash ripetuto', spec: '3 serie × 10' },
                { n: 'Cross e lungolinea', d: 'Alternati su indicazione del coach/partner', spec: '20 min' },
                { n: 'Tie-break competition', d: 'Massima concentrazione su ogni punto', spec: '4 tie-break' },
            ],
            advanced: [
                { n: 'Condizionamento specifico', d: 'Sprint ai 4 angoli del campo', spec: '10 serie' },
                { n: 'Scenario di gioco tattico', d: 'Situazioni: palla corta + passante + smash', spec: '20 min' },
                { n: 'Match play 6 giochi', d: 'Massima intensità competitiva', spec: '2 set' },
            ],
        },
        cooldown: [
            { n: 'Passeggiate attorno al campo', d: '', spec: '5 min' },
            { n: 'Stretching polso e avambraccio', d: 'Prevenzione tendinite', spec: '2 × 30 sec per lato' },
            { n: 'Stretching spalla posteriore', d: 'Braccio traverso al petto', spec: '2 × 30 sec per lato' },
        ],
        kcalBase: { beginner: 220, mid: 340, advanced: 460 },
    },

    boxing: {
        warmup: [
            { n: 'Corda (o shadow cardio)', d: 'Ritmo basso, respiro controllato', spec: '3 min' },
            { n: 'Mobilità spalle e polsi', d: 'Cerchi ampi con le braccia, rotazioni polsi', spec: '2 min' },
            { n: 'Shadow boxing lento', d: 'Movimenti base senza potenza, focus sulla guardia', spec: '2 × 2 min' },
        ],
        main: {
            beginner: [
                { n: 'Jab–cross su sacco (o aria)', d: 'Combinazioni 1-2, respira sugli impatti', spec: '4 × 2 min' },
                { n: 'Gancio + uppercut', d: 'Peso sulle gambe, rotazione fianchi', spec: '3 × 2 min' },
                { n: 'Difesa e slip', d: 'Schiva jab, risposta 1-2', spec: '3 × 2 min' },
                { n: 'Addominali boxing', d: 'Crunch, mountain climber, plank', spec: '3 × 30 sec' },
            ],
            mid: [
                { n: 'Combinazioni 1-2-3-4', d: 'Jab-cross-gancio sx-gancio dx su sacco', spec: '6 × 2 min' },
                { n: 'Interval boxing ad alta intensità', d: '30 sec massimo + 30 sec shadow lento', spec: '10 serie' },
                { n: 'Lavoro di piedi + combinazioni', d: 'Entra-colpisci-esci da ogni angolo', spec: '4 × 2 min' },
                { n: 'Core boxing', d: 'Russian twist, hanging knee raise, medicine ball', spec: '4 × 20 rip' },
            ],
            advanced: [
                { n: 'Sparring leggero / pad work', d: 'Massima velocità sul partner, attenzione difesa', spec: '6 × 3 min' },
                { n: 'Cardio esplosivo', d: 'Burpee + jab-cross, senza pausa', spec: '5 × 1 min' },
                { n: 'Combinazioni avanzate (1-2-3-4-slip-2)', d: 'Velocità e precisione su guanti', spec: '8 × 2 min' },
                { n: 'Condizionamento finale', d: 'Sprint 30m × 10 con 30 sec recupero', spec: '10 sprint' },
            ],
        },
        cooldown: [
            { n: 'Shadow boxing lentissimo', d: 'Ritmo di recupero, respiro profondo', spec: '3 min' },
            { n: 'Stretching spalle e petto', d: '', spec: '2 × 30 sec' },
            { n: 'Stretching collo (attenzione!)', d: 'Lento, nessun rimbalzo', spec: '2 min' },
        ],
        kcalBase: { beginner: 280, mid: 420, advanced: 580 },
    },

    hiking: {
        warmup: [
            { n: 'Camminata piana', d: 'Ritmo basso per i primi 10 min prima del trail', spec: '10 min' },
            { n: 'Stretching gambe dinamico', d: 'Affondo, leg swing, cerchi caviglie', spec: '3 min' },
        ],
        main: {
            beginner: [
                { n: 'Trekking su percorso pianeggiante', d: 'Ritmo conversazione, idratazione ogni 20 min', spec: '30–40 min' },
                { n: 'Soste panoramiche attive', d: '5 squat + 5 affondo a ogni sosta', spec: '3 soste' },
            ],
            mid: [
                { n: 'Trail con dislivello moderato', d: '200–400m D+, ritmo regolare in salita', spec: '50–60 min' },
                { n: 'Nordic walking con bastoncini', d: 'Coinvolge anche il treno superiore', spec: '30 min' },
            ],
            advanced: [
                { n: 'Trail running su sentiero', d: 'Corsa sui tratti pianeggianti e in discesa', spec: '60–90 min' },
                { n: 'Salita intensa', d: '600m D+, passi corti e frequenti', spec: '45 min salita' },
                { n: 'Allenamento verticale', d: 'Trova una salita di 200m e ripetila', spec: '6 × su e giù' },
            ],
        },
        cooldown: [
            { n: 'Camminata defaticante', d: 'Ultimi 10 min di percorso a ritmo blando', spec: '10 min' },
            { n: 'Stretching polpacci e tibiali', d: 'Essenziale per prevenire indolenzimento', spec: '2 × 40 sec' },
            { n: 'Stretching femorali seduto', d: '', spec: '2 × 30 sec per lato' },
        ],
        kcalBase: { beginner: 180, mid: 310, advanced: 450 },
    },
};

/* ══ GENERATE ══ */
function generate() {
    const score = checkin.score;
    const sport = cfg.sport;
    const level = cfg.level;
    const dur = cfg.dur;
    const data = DB[sport];
    if (!data) return;

    // Intensity modifier based on check-in score
    let intensityLabel, intensityClass, alertHtml = '';
    if (score < 40) {
        intensityLabel = 'RECUPERO ATTIVO'; intensityClass = 'pill-orange';
        alertHtml = `<div class="recovery-alert"><div class="ra-icon"><i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i></div><div class="ra-text"><strong>Score basso (${score}/100)</strong> - Il tuo corpo è affaticato. L'allenamento è adattato a un'intensità ridotta. Ascolta i segnali del corpo e non forzare. Recupero completo domani.</div></div>`;
    } else if (score < 60) {
        intensityLabel = 'MODERATA'; intensityClass = 'pill-yellow';
    } else if (score < 80) {
        intensityLabel = 'PIENA'; intensityClass = 'pill-cyan';
    } else {
        intensityLabel = 'MASSIMA <i class="fa-solid fa-fire" style="color: #ff5722;"></i>'; intensityClass = 'pill-green';
    }

    // Select exercises
    const wu = data.warmup;
    let main = [...data.main[level]];
    const cd = data.cooldown;

    // INJECT PRE-HAB based on pain reported
    let prehabInjected = [];
    if (checkin.pain && !checkin.pain.includes('none')) {
        checkin.pain.forEach(p => {
            if (PREHAB_DB[p]) prehabInjected.push(PREHAB_DB[p]);
        });
    }

    // Reduce if recovery
    if (score < 40) {
        main = main.slice(0, Math.ceil(main.length * 0.5));
    } else if (score < 60) {
        main = main.slice(0, Math.ceil(main.length * 0.7));
    }

    // Calculate times
    const wuMin = Math.round((wu.length + prehabInjected.length) * 1.5);
    const cdMin = Math.round(cd.length * 1.5);
    const mainMin = dur - wuMin - cdMin;
    const multip = score < 40 ? 0.5 : score < 60 ? 0.75 : score < 80 ? 1.0 : 1.15;
    const kcal = Math.round((data.kcalBase[level] || 300) * (dur / 45) * multip);

    const levelLabels = { beginner: 'Principiante', mid: 'Intermedio', advanced: 'Avanzato' };
    const levelColors = { beginner: 'pill-green', mid: 'pill-cyan', advanced: 'pill-yellow' };

    const phases = [
        { label: 'RISCALDAMENTO + PRE-HAB', cls: 'phase-warmup', dur: wuMin + ' min', exs: [...prehabInjected, ...wu] },
        { label: 'ALLENAMENTO PRINCIPALE', cls: 'phase-main', dur: mainMin + ' min', exs: main },
        { label: 'DEFATICAMENTO', cls: 'phase-cooldown', dur: cdMin + ' min', exs: cd },
    ];

    // Salva i dati strutturati per il piano mensile
    lastWorkoutData = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        day: new Date().getDate(),
        month: new Date().toLocaleDateString('it-IT', { month: 'short' }).toUpperCase(),
        sport: cfg.sportName,
        sportIcon: cfg.sportIcon,
        level: level,
        levelLabel: levelLabels[level],
        dur: dur,
        kcal: kcal,
        score: score,
        intensityLabel: intensityLabel,
        phases: phases.map(ph => ({
            type: ph.cls,
            label: ph.label,
            dur: ph.dur,
            exercises: ph.exs
        }))
    };
    localStorage.setItem('fitora_last_workout', JSON.stringify(lastWorkoutData));

    const phasesHtml = phases.map(ph => `
    <div class="phase-block">
        <div class="phase-header ${ph.cls}">
            ${ph.label}
            <span class="phase-dur">${ph.dur}</span>
        </div>
        <div class="exercise-list">
            ${ph.exs.map((ex, i) => `
      <div class="ex-row">
        <span class="ex-num">${String(i + 1).padStart(2, '0')}</span>
        <div class="ex-body">
          <div class="ex-name">${ex.n}</div>
          ${ex.d ? `<div class="ex-detail">${ex.d}</div>` : ''}
        </div>
        <span class="ex-badge ${ex.spec.includes('min') || ex.spec.includes('sec') ? 'badge-time' : ex.spec.includes('km') || ex.spec.includes('m') ? 'badge-time' : 'badge-sets'}">${ex.spec}</span>
      </div>
    `).join('')}
        </div>
    </div>
    `).join('');

    const html = `
    <div class="wo-header">
        <div class="wo-title-row">
            <span class="wo-sport-icon">${cfg.sportIcon}</span>
            <div>
                <div class="wo-title">${cfg.sportName}</div>
                <div class="wo-subtitle">${new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
            </div>
        </div>
        <div class="wo-meta">
            <span class="wo-pill ${intensityClass}">Intensità: ${intensityLabel}</span>
            <span class="wo-pill ${levelColors[level]}">${levelLabels[level]}</span>
            <span class="wo-pill pill-cyan">${dur} min</span>
            <span class="wo-pill pill-green">~${kcal} kcal</span>
        </div>
    </div>

    ${alertHtml}
    ${phasesHtml}

    <div class="wo-totals">
        <div class="wt-cell"><div class="wt-val gt">${dur}</div><div class="wt-label">min totali</div></div>
        <div class="wt-cell"><div class="wt-val" style="color:var(--green)">~${kcal}</div><div class="wt-label">kcal stimate</div></div>
        <div class="wt-cell"><div class="wt-val" style="color:var(--yellow)">${wu.length + main.length + cd.length}</div><div class="wt-label">esercizi</div></div>
        <div class="wt-cell"><div class="wt-val" style="color:var(--cyan)">${checkin.score}</div><div class="wt-label">check-in score</div></div>
    </div>

    <button id="savePlanBtn" onclick="saveWorkoutToPlan()" style="display:block;width:100%;text-align:center;background:rgba(58,90,64,.06);color:var(--cyan);font-family:'Public Sans',sans-serif;font-weight:900;font-size:1rem;letter-spacing:4px;text-transform:uppercase;border:1px solid var(--cyan);cursor:pointer;padding:17px;margin-top:16px;border-radius:10px;backdrop-filter:blur(6px);transition:all .25s ease;" onmouseover="this.style.background='rgba(58,90,64,.14)';this.style.boxShadow='0 0 22px rgba(58,90,64,.25)'" onmouseout="this.style.background='rgba(58,90,64,.06)';this.style.boxShadow='none'"><i class="fa-solid fa-floppy-disk" style="color: #03a9f4;"></i> Salva nel Piano Mensile</button>
    <a href="dashboard.html" class="btn-go-dash" style="margin-top:8px">▶ Vai alla Dashboard</a>
    <button class="btn-new" onclick="location.reload()">↺ Rigenera allenamento</button>
    `;

    const out = document.getElementById('workoutOut');
    out.innerHTML = html;
    out.classList.add('show');
    out.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Controlla se piano pieno
    try {
        const plan = JSON.parse(localStorage.getItem('fitora_monthly_plan') || '[]');
        if (plan.length >= 3) {
            const btn = document.getElementById('savePlanBtn');
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i> Piano pieno (max 3) - Vai nel Diario e cancella un piano';
            btn.style.color = 'var(--orange)'; btn.style.borderColor = 'var(--orange)';
            btn.disabled = true; btn.style.opacity = '.75';
        }
    } catch (e) { }
}

function saveWorkoutToPlan() {
    if (!lastWorkoutData) return;
    try {
        const plan = JSON.parse(localStorage.getItem('fitora_monthly_plan') || '[]');
        const btn = document.getElementById('savePlanBtn');
        if (plan.length >= 3) {
            btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="color: #ff9800;"></i> Piano pieno (max 3) - Vai nel Diario e cancella un piano';
            btn.style.color = 'var(--orange)'; btn.style.borderColor = 'var(--orange)';
            btn.disabled = true; btn.style.opacity = '.75';
            return;
        }
        plan.unshift(lastWorkoutData);
        localStorage.setItem('fitora_monthly_plan', JSON.stringify(plan));
        btn.innerHTML = '<i class="fa-solid fa-check" style="color: #4caf50;"></i> Salvato nel Piano!';
        btn.disabled = true; btn.style.color = 'var(--green)';
        btn.style.borderColor = 'var(--green)'; btn.style.opacity = '.7';
    } catch (e) { alert('Errore: ' + e.message); }
}
