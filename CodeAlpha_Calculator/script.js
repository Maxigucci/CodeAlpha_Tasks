/* ─────────────────────────────────────────────────────
   State
   
   expression : the full string shown in the big display
                e.g. "123 + 456" or "3 + 2 × 7"
   current    : the number currently being typed (raw, no commas)
   previous   : left-hand operand of pending operation
   operator   : pending operator symbol (+, −, ×, ÷)
   justEvaled : true immediately after = is pressed
   freshOp    : true right after an operator is set —
                next digit starts a new operand
───────────────────────────────────────────────────── */
const state = {
  expression:  '0',
  current:     '0',
  previous:    '',
  operator:    null,
  justEvaled:  false,
  freshOp:     false,
};

const MAX_EXPR_CHARS = 22;   // hard cap for the big display
const MAX_OPERAND    = 10;   // max digits per number

/* ─────────────────────────────────────────────────────
   DOM refs
───────────────────────────────────────────────────── */
const exprEl   = document.getElementById('expression'); // big
const resultEl = document.getElementById('result');     // small
const opBtns   = document.querySelectorAll('.btn-operator');

/* ─────────────────────────────────────────────────────
   Number formatting
───────────────────────────────────────────────────── */
function fmt(str) {
  if (str === 'Error') return 'Error';
  const [int, dec] = str.split('.');
  const n = Number(int);
  if (isNaN(n)) return str;
  const formatted = n.toLocaleString('en-US');
  return dec !== undefined ? `${formatted}.${dec}` : formatted;
}

/* ─────────────────────────────────────────────────────
   Live result (evaluated-so-far) for the small display
───────────────────────────────────────────────────── */
function computePreview() {
  if (state.operator === null || state.previous === '') return '';
  if (state.freshOp) return '';           // second operand not started yet

  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);
  if (isNaN(a) || isNaN(b)) return '';

  let r;
  switch (state.operator) {
    case '+': r = a + b; break;
    case '−': r = a - b; break;
    case '×': r = a * b; break;
    case '÷': r = b === 0 ? null : a / b; break;
    default:  return '';
  }

  if (r === null) return 'Error';
  return fmt(String(parseFloat(r.toPrecision(12))));
}

/* ─────────────────────────────────────────────────────
   Update display
───────────────────────────────────────────────────── */
function updateDisplay() {
  exprEl.textContent   = state.expression;
  const preview        = computePreview();
  resultEl.textContent = preview || '\u00a0'; // &nbsp; when empty

  // AC / C label
  const clearBtn = document.querySelector('[data-action="clear"]');
  clearBtn.textContent = (state.expression === '0') ? 'AC' : 'C';
}

function bumpExpr() {
  exprEl.classList.remove('bump');
  void exprEl.offsetWidth;
  exprEl.classList.add('bump');
}

function highlightOp(op) {
  opBtns.forEach(b => b.classList.toggle('active', b.dataset.value === op));
}

function clearOpHighlight() {
  opBtns.forEach(b => b.classList.remove('active'));
}


// Rebuild expression string from state
// Called after every state mutation that changes the expression
function rebuildExpression() {
  if (state.operator) {
    const raw = `${state.previous} ${state.operator} ${state.freshOp ? '' : state.current}`.trimEnd();
    // Truncate if too long — drop from the left, keeping the tail visible
    state.expression = raw.length > MAX_EXPR_CHARS
      ? '…' + raw.slice(raw.length - MAX_EXPR_CHARS + 1)
      : raw;
  } else {
    state.expression = state.current.length > MAX_EXPR_CHARS
      ? '…' + state.current.slice(state.current.length - MAX_EXPR_CHARS + 1)
      : state.current;
  }
}

/* ─────────────────────────────────────────────────────
   Core actions
───────────────────────────────────────────────────── */
function inputDigit(digit) {
  if (state.current === 'Error') {
    state.current   = digit;
    state.operator  = null;
    state.previous  = '';
    state.justEvaled = false;
    state.freshOp   = false;
    rebuildExpression();
    updateDisplay();
    return;
  }

  if (state.justEvaled) {
    // After =, typing a new digit starts fresh
    state.current    = digit;
    state.operator   = null;
    state.previous   = '';
    state.justEvaled = false;
    state.freshOp    = false;
    rebuildExpression();
    updateDisplay();
    return;
  }

  if (state.freshOp) {
    // First digit of second operand
    state.current = digit;
    state.freshOp = false;
  } else {
    if (state.current === '0') {
      state.current = digit;
    } else {
      const digits = state.current.replace(/[.\-]/g, '').length;
      if (digits >= MAX_OPERAND) return;
      state.current += digit;
    }
  }

  rebuildExpression();
  updateDisplay();
}

function inputDecimal() {
  if (state.current === 'Error') return;

  if (state.justEvaled) {
    state.current    = '0.';
    state.operator   = null;
    state.previous   = '';
    state.justEvaled = false;
    state.freshOp    = false;
    rebuildExpression();
    updateDisplay();
    return;
  }

  if (state.freshOp) {
    state.current = '0.';
    state.freshOp = false;
    rebuildExpression();
    updateDisplay();
    return;
  }

  if (!state.current.includes('.')) {
    state.current += '.';
    rebuildExpression();
    updateDisplay();
  }
}

function setOperator(op) {
  if (state.current === 'Error') return;

  // If a complete pair exists and second operand is entered, evaluate first
  if (state.operator && !state.freshOp) {
    const a = parseFloat(state.previous);
    const b = parseFloat(state.current);
    let r;
    switch (state.operator) {
      case '+': r = a + b; break;
      case '−': r = a - b; break;
      case '×': r = a * b; break;
      case '÷':
        if (b === 0) {
          state.current    = 'Error';
          state.operator   = null;
          state.previous   = '';
          state.justEvaled = true;
          state.freshOp    = false;
          state.expression = 'Error';
          clearOpHighlight();
          updateDisplay();
          return;
        }
        r = a / b;
        break;
    }
    state.current = String(parseFloat(r.toPrecision(12)));
  }

  // If just pressed =, continue from result
  state.justEvaled = false;
  state.operator   = op;
  state.previous   = state.current;
  state.freshOp    = true;

  highlightOp(op);
  rebuildExpression();
  updateDisplay();
}

function evaluate() {
  if (state.operator === null || state.previous === '' || state.freshOp) return;

  const a = parseFloat(state.previous);
  const b = parseFloat(state.current);

  let result;
  switch (state.operator) {
    case '+': result = a + b; break;
    case '−': result = a - b; break;
    case '×': result = a * b; break;
    case '÷':
      if (b === 0) {
        state.expression = 'Error';
        state.current    = 'Error';
        state.operator   = null;
        state.previous   = '';
        state.justEvaled = true;
        state.freshOp    = false;
        clearOpHighlight();
        updateDisplay();
        return;
      }
      result = a / b;
      break;
    default: return;
  }

  result = parseFloat(result.toPrecision(12));

  // Show result in big display, clear small display
  state.expression = fmt(String(result));
  state.current    = String(result);
  state.previous   = '';
  state.operator   = null;
  state.justEvaled = true;
  state.freshOp    = false;

  clearOpHighlight();
  bumpExpr();
  updateDisplay();
  // Clear the small preview after = 
  resultEl.textContent = '\u00a0';
}

function clearAll() {
  state.expression = '0';
  state.current    = '0';
  state.previous   = '';
  state.operator   = null;
  state.justEvaled = false;
  state.freshOp    = false;
  clearOpHighlight();
  updateDisplay();
}

function toggleSign() {
  if (state.current === 'Error' || state.current === '0') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
  rebuildExpression();
  updateDisplay();
}

function applyPercent() {
  if (state.current === 'Error') return;
  const n = parseFloat(state.current);
  state.current = String(parseFloat((n / 100).toPrecision(12)));
  rebuildExpression();
  updateDisplay();
}

function backspace() {
  if (state.current === 'Error' || state.justEvaled) {
    clearAll();
    return;
  }
  if (state.freshOp) {
    // Cancel the pending operator
    state.operator  = null;
    state.previous  = '';
    state.freshOp   = false;
    clearOpHighlight();
    rebuildExpression();
    updateDisplay();
    return;
  }
  if (state.current.length === 1 ||
     (state.current.length === 2 && state.current.startsWith('-'))) {
    state.current = '0';
  } else {
    state.current = state.current.slice(0, -1);
  }
  rebuildExpression();
  updateDisplay();
}

/* ─────────────────────────────────────────────────────
   Button click handler
───────────────────────────────────────────────────── */
document.querySelector('.keypad').addEventListener('click', e => {
  const btn = e.target.closest('.btn');
  if (!btn) return;
  const { action, value } = btn.dataset;

  switch (action) {
    case 'digit':     inputDigit(value); break;
    case 'decimal':   inputDecimal();    break;
    case 'operator':  setOperator(value); break;
    case 'equals':    evaluate();        break;
    case 'clear':     clearAll();        break;
    case 'sign':      toggleSign();      break;
    case 'percent':   applyPercent();    break;
    case 'backspace': backspace();       break;
  }
});

/* ─────────────────────────────────────────────────────
   Keyboard handler
───────────────────────────────────────────────────── */
const keyMap = {
  '0': () => inputDigit('0'),  '1': () => inputDigit('1'),
  '2': () => inputDigit('2'),  '3': () => inputDigit('3'),
  '4': () => inputDigit('4'),  '5': () => inputDigit('5'),
  '6': () => inputDigit('6'),  '7': () => inputDigit('7'),
  '8': () => inputDigit('8'),  '9': () => inputDigit('9'),
  '.': () => inputDecimal(),   ',': () => inputDecimal(),
  '+': () => setOperator('+'), '-': () => setOperator('−'),
  '*': () => setOperator('×'), 'x': () => setOperator('×'),
  '/': () => setOperator('÷'),
  'Enter': () => evaluate(),   '=': () => evaluate(),
  'Backspace': () => backspace(),
  'Delete':    () => clearAll(),
  'Escape':    () => clearAll(),
  '%':         () => applyPercent(),
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const handler = keyMap[e.key];
  if (!handler) return;
  e.preventDefault();
  handler();
  flashButton(e.key);
});

function flashButton(key) {
  const opMap = { '+':'+', '-':'−', '*':'×', 'x':'×', '/':'÷' };
  let selector;

  if ('0123456789'.includes(key)) {
    selector = `[data-action="digit"][data-value="${key}"]`;
  } else if (opMap[key]) {
    selector = `[data-action="operator"][data-value="${opMap[key]}"]`;
  } else if (key === '.' || key === ',') {
    selector = '[data-action="decimal"]';
  } else if (key === 'Enter' || key === '=') {
    selector = '[data-action="equals"]';
  } else if (key === 'Backspace') {
    selector = '[data-action="backspace"]';
  } else if (key === 'Escape' || key === 'Delete') {
    selector = '[data-action="clear"]';
  }

  if (!selector) return;
  const btn = document.querySelector(selector);
  if (!btn) return;
  btn.classList.add('key-flash');
  setTimeout(() => btn.classList.remove('key-flash'), 120);
}

/* ─────────────────────────────────────────────────────
   Theme switching
───────────────────────────────────────────────────── */
const pills = document.querySelectorAll('.pill');

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  pills.forEach(p => p.classList.toggle('active', p.dataset.themeTarget === theme));
  localStorage.setItem('calc-theme', theme);
}

pills.forEach(p => p.addEventListener('click', () => setTheme(p.dataset.themeTarget)));

const savedTheme = localStorage.getItem('calc-theme');
if (savedTheme) setTheme(savedTheme);

/* ─────────────────────────────────────────────────────
   Key flash style
───────────────────────────────────────────────────── */
const s = document.createElement('style');
s.textContent = `.key-flash { filter: brightness(1.4) !important; transform: scale(0.95) !important; }`;
document.head.appendChild(s);

/* ─────────────────────────────────────────────────────
   Init
───────────────────────────────────────────────────── */
updateDisplay();
