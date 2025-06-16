
const defaultValues = {
  abidos: 1320,
  ratioTender: 45,
  ratioTimber: 86,
  tenderRate: 50,
  timberRate: 100,
  pulverPerAbidos: 10,
  pulverPerExchange: 80,
  debug: false
};

function getSavedInputs() {
  const saved = localStorage.getItem("inputs");
  return saved ? JSON.parse(saved) : defaultValues;
}

function format(num) {
  return Math.round(num).toLocaleString("de-DE");
}

function createInput(label, key, value, onChange) {
  const wrapper = document.createElement("div");
  wrapper.className = "space-y-1";
  const lbl = document.createElement("label");
  lbl.className = "block text-sm text-gray-300";
  lbl.textContent = label;
  const input = document.createElement("input");
  input.type = "text";
  input.inputMode = "numeric";
  input.pattern = "[0-9]*";
  input.value = value;
  input.className = "w-full p-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-yellow-500";
  input.addEventListener("focus", (e) => {
    setTimeout(() => e.target.select(), 0);
  });

  let debounceTimer = null;
  input.addEventListener("input", (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      onChange(key, e.target.value);
    }, 300);
  });

  wrapper.appendChild(lbl);
  wrapper.appendChild(input);
  return wrapper;
}

function createCheckbox(label, key, value, onChange) {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center space-x-2";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.checked = value;
  input.className = "accent-yellow-500";
  input.addEventListener("change", (e) => onChange(key, e.target.checked));
  const lbl = document.createElement("label");
  lbl.className = "text-sm text-gray-300";
  lbl.textContent = label;
  wrapper.appendChild(input);
  wrapper.appendChild(lbl);
  return wrapper;
}

function renderApp() {
  const values = getSavedInputs();
  const app = document.getElementById("app");
  app.innerHTML = "";

  const updateValue = (key, raw) => {
    const parsed = parseFloat(raw.replace(",", "."));
    const newValue = isNaN(parsed) ? 0 : parsed;
    values[key] = newValue;
    localStorage.setItem("inputs", JSON.stringify(values));
    renderApp();
  };

  const updateCheck = (key, checked) => {
    values[key] = checked;
    localStorage.setItem("inputs", JSON.stringify(values));
    renderApp();
  };

  app.appendChild(createInput("Zielmenge Abidos Timber", "abidos", values.abidos, updateValue));
  app.appendChild(createInput("Verhältnis Tender Timber", "ratioTender", values.ratioTender, updateValue));
  app.appendChild(createInput("Verhältnis Timber", "ratioTimber", values.ratioTimber, updateValue));
  app.appendChild(createCheckbox("Debug-Modus aktivieren", "debug", values.debug, updateCheck));

  const pulverTotal = values.abidos * values.pulverPerAbidos;

  const tenderRatio = values.ratioTender;
  const timberRatio = values.ratioTimber;
  const tenderRate = values.tenderRate;
  const timberRate = values.timberRate;
  const pulverPerExchange = values.pulverPerExchange;

  const f = pulverTotal / (
    (tenderRatio / tenderRate + timberRatio / timberRate) * pulverPerExchange
  );

  const tenderUnits = Math.round(f * tenderRatio);
  const timberUnits = Math.round(f * timberRatio);

  const pulverFromTender = tenderUnits / tenderRate * pulverPerExchange;
  const pulverFromTimber = timberUnits / timberRate * pulverPerExchange;
  const pulverSum = pulverFromTender + pulverFromTimber;

  const resultBox = document.createElement("div");
  resultBox.className = "bg-gray-800 p-4 rounded space-y-2 text-sm text-gray-100";

  const results = [
    `💠 Benötigtes <strong>Pulver</strong>: ${format(pulverTotal)}`,
    `📐 Verhältnis auf Materialebene: Tender:Timber = ${values.ratioTender}:${values.ratioTimber}`,
    `🪵 Tender Timber nötig: <strong>${format(tenderUnits)}</strong>`,
    `🪓 Timber nötig: <strong>${format(timberUnits)}</strong>`,
    `<strong>➡️ Zusammenfassung:</strong>`,
    `Du brauchst insgesamt <strong>${format(tenderUnits)}</strong> Tender Timber und <strong>${format(timberUnits)}</strong> Timber für <strong>${format(values.abidos)}</strong> Abidos Timber.`
  ];

  results.forEach(text => {
    const p = document.createElement("p");
    p.innerHTML = text;
    resultBox.appendChild(p);
  });

  if (values.debug) {
    const debugBox = document.createElement("div");
    debugBox.className = "bg-gray-700 p-3 rounded mt-4 text-xs text-gray-300 space-y-1";
    debugBox.innerHTML = `
      <strong>DEBUG-INFO:</strong><br/>
      Gesamtpulver: ${pulverTotal}<br/>
      Faktor f: ${f.toFixed(4)}<br/>
      Tender Timber gebraucht: ${tenderUnits}<br/>
      Timber gebraucht: ${timberUnits}<br/>
      Pulver aus Tender: ${pulverFromTender.toFixed(2)}<br/>
      Pulver aus Timber: ${pulverFromTimber.toFixed(2)}<br/>
      Summe erzeugtes Pulver: ${pulverSum.toFixed(2)}
    `;
    resultBox.appendChild(debugBox);
  }

  app.appendChild(resultBox);
}

window.addEventListener("DOMContentLoaded", renderApp);
