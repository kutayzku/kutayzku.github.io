/* =========================================================
   lab.js — "Bilgisayar Nasıl Düşünür?" interaktif modülleri
   1) Bit laboratuvarı   2) Mantık kapıları   3) Yarım toplayıcı
   4) Mini işlemci       5) Soyutlama katmanları
   ========================================================= */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var t  = function (k) { return window.APP ? window.APP.t(k) : k; };

  /* {0} {1} yer tutucularını doldurur */
  function fmt(str) {
    var args = Array.prototype.slice.call(arguments, 1);
    return String(str).replace(/\{(\d+)\}/g, function (m, i) {
      return args[i] !== undefined ? args[i] : m;
    });
  }

  /* ===================================================
     1) BİT LABORATUVARI
     =================================================== */
  var bits = [0, 0, 0, 0, 0, 0, 0, 0];   // index 0 = 128, index 7 = 1

  function buildBits() {
    var row = $('#bitsRow');
    if (!row) return;
    row.innerHTML = '';
    for (var i = 0; i < 8; i++) {
      (function (i) {
        var b = document.createElement('button');
        b.className = 'bit';
        b.type = 'button';
        b.setAttribute('aria-pressed', 'false');
        b.innerHTML = '<span class="v">0</span><span class="p">' + (1 << (7 - i)) + '</span>';
        b.addEventListener('click', function () {
          bits[i] = bits[i] ? 0 : 1;
          renderBits();
        });
        row.appendChild(b);
      })(i);
    }
    renderBits();
  }

  function bitsValue() {
    var v = 0;
    for (var i = 0; i < 8; i++) v = (v << 1) | bits[i];
    return v;
  }

  function renderBits() {
    var row = $('#bitsRow');
    if (!row) return;
    var cells = $$('.bit', row);
    for (var i = 0; i < cells.length; i++) {
      cells[i].classList.toggle('on', !!bits[i]);
      cells[i].setAttribute('aria-pressed', bits[i] ? 'true' : 'false');
      $('.v', cells[i]).textContent = bits[i];
    }
    var v = bitsValue();
    $('#outDec').textContent = v;
    $('#outHex').textContent = '0x' + v.toString(16).toUpperCase().padStart(2, '0');
    $('#outBin').textContent = bits.join('');
    $('#outChr').textContent = (v >= 33 && v <= 126) ? String.fromCharCode(v) : '—';
  }

  function setBitsFrom(n) {
    for (var i = 0; i < 8; i++) bits[i] = (n >> (7 - i)) & 1;
    renderBits();
  }

  function renderText() {
    var inp = $('#txtIn'), out = $('#txtOut');
    if (!inp || !out) return;
    var s = inp.value || '';
    out.innerHTML = '';
    if (!s) { out.textContent = '—'; return; }
    for (var i = 0; i < s.length; i++) {
      var code = s.charCodeAt(i);
      var bin = code.toString(2);
      if (code < 256) bin = bin.padStart(8, '0');
      var el = document.createElement('span');
      el.className = 'ch';
      var ic = document.createElement('i');
      ic.textContent = s[i] === ' ' ? '␣' : s[i];
      el.appendChild(ic);
      el.appendChild(document.createTextNode(bin));
      out.appendChild(el);
    }
  }

  function initBits() {
    buildBits();
    var r = $('#bitRand'), c = $('#bitClr'), k = $('#bitK'), inp = $('#txtIn');
    if (r) r.addEventListener('click', function () { setBitsFrom(Math.floor(Math.random() * 256)); });
    if (c) c.addEventListener('click', function () { setBitsFrom(0); });
    if (k) k.addEventListener('click', function () { setBitsFrom(75); });   // 'K' = 75
    if (inp) inp.addEventListener('input', renderText);
    renderText();
  }

  /* ===================================================
     2) MANTIK KAPILARI
     =================================================== */
  var AND_BODY = 'M96 30 H150 A50 50 0 0 1 150 130 H96 Z';
  var OR_BODY  = 'M92 30 Q140 30 200 80 Q140 130 92 130 Q118 80 92 30 Z';
  var NOT_BODY = 'M96 30 L96 130 L196 80 Z';
  var XOR_ARC  = 'M74 30 Q100 80 74 130';

  var GATES = [
    { k: 'AND',  n: 2, body: AND_BODY, bubble: 0,   out: 201, lx: 146, f: function (a, b) { return a && b ? 1 : 0; } },
    { k: 'OR',   n: 2, body: OR_BODY,  bubble: 0,   out: 201, lx: 134, f: function (a, b) { return a || b ? 1 : 0; } },
    { k: 'XOR',  n: 2, body: OR_BODY,  bubble: 0,   out: 201, lx: 134, arc: XOR_ARC, f: function (a, b) { return a ^ b; } },
    { k: 'NOT',  n: 1, body: NOT_BODY, bubble: 205, out: 215, lx: 126, f: function (a) { return a ? 0 : 1; } },
    { k: 'NAND', n: 2, body: AND_BODY, bubble: 209, out: 219, lx: 146, f: function (a, b) { return a && b ? 0 : 1; } },
    { k: 'NOR',  n: 2, body: OR_BODY,  bubble: 209, out: 219, lx: 134, f: function (a, b) { return a || b ? 0 : 1; } }
  ];

  var gateIdx = 0, gA = 0, gB = 0;

  function buildGatePicker() {
    var p = $('#gatePicker');
    if (!p) return;
    p.innerHTML = '';
    GATES.forEach(function (g, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'gate-tab' + (i === gateIdx ? ' on' : '');
      b.textContent = g.k;
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', i === gateIdx ? 'true' : 'false');
      b.addEventListener('click', function () { gateIdx = i; drawGate(); });
      p.appendChild(b);
    });
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  function drawGate() {
    var g = GATES[gateIdx];
    var shape = $('#gateShape');
    if (!shape) return;

    $$('.gate-tab').forEach(function (b, i) {
      b.classList.toggle('on', i === gateIdx);
      b.setAttribute('aria-selected', i === gateIdx ? 'true' : 'false');
    });

    shape.innerHTML = '';
    if (g.arc) shape.appendChild(svgEl('path', { d: g.arc, class: 'body', fill: 'none' }));
    shape.appendChild(svgEl('path', { d: g.body, class: 'body' }));
    if (g.bubble) shape.appendChild(svgEl('circle', { cx: g.bubble, cy: 80, r: 9, class: 'bub' }));
    var lbl = svgEl('text', { x: g.lx, y: 81, class: 'lbl' });
    lbl.textContent = g.k;
    shape.appendChild(lbl);

    $('#wOut').setAttribute('d', 'M' + g.out + ' 80 H306');

    var one = g.n === 1;
    $('#inB').style.display = one ? 'none' : '';
    $('#wB').style.display  = one ? 'none' : '';
    $('#nB').style.display  = one ? 'none' : '';
    $('#wA').setAttribute('d', one ? 'M10 80 H96' : 'M10 48 H96');
    $('#nA').setAttribute('cy', one ? 80 : 48);

    buildTruth();
    var ex = $('#gateExplain');
    if (ex) ex.innerHTML = t('gate.' + g.k);
    updateGate();
  }

  function buildTruth() {
    var g = GATES[gateIdx];
    var tb = $('#truthTable tbody');
    if (!tb) return;
    tb.innerHTML = '';

    var head = document.createElement('tr');
    var cols = g.n === 1 ? ['A', t('tt.out')] : ['A', 'B', t('tt.out')];
    cols.forEach(function (c) {
      var th = document.createElement('th');
      th.textContent = c;
      head.appendChild(th);
    });
    tb.appendChild(head);

    var rows = g.n === 1 ? [[0], [1]] : [[0, 0], [0, 1], [1, 0], [1, 1]];
    rows.forEach(function (r) {
      var tr = document.createElement('tr');
      tr.dataset.key = r.join('');
      r.concat([g.f.apply(null, r)]).forEach(function (v) {
        var td = document.createElement('td');
        td.textContent = v;
        tr.appendChild(td);
      });
      tb.appendChild(tr);
    });
  }

  function updateGate() {
    var g = GATES[gateIdx];
    var out = g.n === 1 ? g.f(gA) : g.f(gA, gB);

    $('#inA').setAttribute('aria-pressed', gA ? 'true' : 'false');
    $('#inA').querySelector('b').textContent = gA;
    $('#inB').setAttribute('aria-pressed', gB ? 'true' : 'false');
    $('#inB').querySelector('b').textContent = gB;

    $('#wA').classList.toggle('hot', !!gA);
    $('#nA').classList.toggle('hot', !!gA);
    $('#wB').classList.toggle('hot', !!gB);
    $('#nB').classList.toggle('hot', !!gB);
    $('#wOut').classList.toggle('hot', !!out);

    var active = g.n === 1 ? !!gA : (!!gA || !!gB);
    $$('#gateShape .body').forEach(function (e) { e.classList.toggle('hot', active); });
    $$('#gateShape .bub').forEach(function (e) { e.classList.toggle('hot', !!out); });

    $('#gateLed').classList.toggle('on', !!out);
    $('#gateVal').textContent = out;

    var key = g.n === 1 ? String(gA) : ('' + gA + gB);
    $$('#truthTable tbody tr').forEach(function (tr) {
      tr.classList.toggle('hit', tr.dataset.key === key);
    });
  }

  function initGates() {
    buildGatePicker();
    var a = $('#inA'), b = $('#inB');
    if (a) a.addEventListener('click', function () { gA = gA ? 0 : 1; updateGate(); });
    if (b) b.addEventListener('click', function () { gB = gB ? 0 : 1; updateGate(); });
    drawGate();
  }

  /* ===================================================
     3) YARIM TOPLAYICI
     =================================================== */
  var aA = 0, aB = 0;

  function updateAdder() {
    var sum = aA ^ aB;
    var carry = aA && aB ? 1 : 0;

    $('#adA').setAttribute('aria-pressed', aA ? 'true' : 'false');
    $('#adA').querySelector('b').textContent = aA;
    $('#adB').setAttribute('aria-pressed', aB ? 'true' : 'false');
    $('#adB').querySelector('b').textContent = aB;

    $('#agXor').classList.toggle('on', !!sum);
    $('#agAnd').classList.toggle('on', !!carry);

    $('#sSum').classList.toggle('on', !!sum);
    $('#sSum').querySelector('b').textContent = sum;
    $('#sCarry').classList.toggle('on', !!carry);
    $('#sCarry').querySelector('b').textContent = carry;

    $('#sumEq').textContent = aA + ' + ' + aB + ' = ' + (carry ? '' + carry + sum : '' + sum);
  }

  function initAdder() {
    var a = $('#adA'), b = $('#adB');
    if (!a || !b) return;
    a.addEventListener('click', function () { aA = aA ? 0 : 1; updateAdder(); });
    b.addEventListener('click', function () { aB = aB ? 0 : 1; updateAdder(); });
    updateAdder();
  }

  /* ===================================================
     4) MİNİ İŞLEMCİ
     =================================================== */
  var PROG = [
    { op: 'LOAD', arg: 5, c: 'cpu.c0' },
    { op: 'ADD',  arg: 3, c: 'cpu.c1' },
    { op: 'MUL',  arg: 2, c: 'cpu.c2' },
    { op: 'SUB',  arg: 1, c: 'cpu.c3' },
    { op: 'OUT',  arg: null, c: 'cpu.c4' },
    { op: 'HALT', arg: null, c: 'cpu.c5' }
  ];

  var cpu = { pc: 0, acc: 0, ir: '—', stage: 0, halted: false, cycles: 0, timer: null };

  function insText(i) {
    var p = PROG[i];
    return p ? (p.op + (p.arg !== null ? ' ' + p.arg : '')) : '—';
  }

  function buildProg() {
    var list = $('#progList');
    if (!list) return;
    list.innerHTML = '';
    PROG.forEach(function (p, i) {
      var li = document.createElement('li');
      li.innerHTML = '<span>' + String(i).padStart(2, '0') + '</span><span>' +
        insText(i) + ' <em>; ' + t(p.c) + '</em></span>';
      list.appendChild(li);
    });
  }

  function cpuLog(msg) {
    var ul = $('#cpuLog');
    if (!ul) return;
    var li = document.createElement('li');
    li.textContent = msg;
    ul.appendChild(li);
    while (ul.children.length > 40) ul.removeChild(ul.firstChild);
    ul.scrollTop = ul.scrollHeight;
  }

  function flash(sel) {
    var e = $(sel);
    if (!e) return;
    e.classList.add('flash');
    setTimeout(function () { e.classList.remove('flash'); }, 550);
  }

  function paintCpu() {
    $('#rPC').textContent  = cpu.pc;
    $('#rIR').textContent  = cpu.ir;
    $('#rACC').textContent = cpu.acc;
    $$('#stages .stage').forEach(function (s) {
      s.classList.toggle('on', !cpu.halted && +s.dataset.s === cpu.stage);
    });
    $$('#progList li').forEach(function (li, i) {
      li.classList.toggle('on', !cpu.halted && i === cpu.pc);
      li.classList.toggle('done', i < cpu.pc);
    });
  }

  function cpuStep() {
    if (cpu.halted) { cpuLog(t('cpu.done')); return; }
    var ins = PROG[cpu.pc];
    if (!ins) { cpu.halted = true; paintCpu(); return; }

    if (cpu.stage === 0) {
      /* GETİR */
      cpu.ir = insText(cpu.pc);
      cpuLog(fmt(t('cpu.fetch'), String(cpu.pc).padStart(2, '0')));
      flash('#rIR');
      cpu.stage = 1;

    } else if (cpu.stage === 1) {
      /* ÇÖZ */
      cpuLog(fmt(t('cpu.decode'), cpu.ir, ins.op));
      $('#aluOp').textContent = ins.op;
      cpu.stage = 2;

    } else {
      /* ÇALIŞTIR */
      var prev = cpu.acc;
      var alu = $('#alu');
      var arith = false;

      if (ins.op === 'LOAD') {
        cpu.acc = ins.arg;
        cpuLog(fmt(t('cpu.load'), ins.arg, cpu.acc));
      } else if (ins.op === 'ADD') {
        cpu.acc = prev + ins.arg; arith = true;
        cpuLog(fmt(t('cpu.add'), prev, ins.arg, cpu.acc));
      } else if (ins.op === 'MUL') {
        cpu.acc = prev * ins.arg; arith = true;
        cpuLog(fmt(t('cpu.mul'), prev, ins.arg, cpu.acc));
      } else if (ins.op === 'SUB') {
        cpu.acc = prev - ins.arg; arith = true;
        cpuLog(fmt(t('cpu.sub'), prev, ins.arg, cpu.acc));
      } else if (ins.op === 'OUT') {
        $('#cpuOut').textContent = cpu.acc;
        cpuLog(fmt(t('cpu.out'), cpu.acc));
      } else if (ins.op === 'HALT') {
        cpu.halted = true;
        cpuLog(fmt(t('cpu.halt'), cpu.cycles + 1));
        stopRun();
      }

      if (alu) {
        alu.classList.toggle('on', arith);
        if (arith) setTimeout(function () { alu.classList.remove('on'); }, 600);
      }
      flash('#rACC');

      cpu.cycles++;
      if (!cpu.halted) { cpu.pc++; cpu.stage = 0; }
    }
    paintCpu();
  }

  function stopRun() {
    if (cpu.timer) { clearInterval(cpu.timer); cpu.timer = null; }
    var b = $('#cpuRun');
    if (b) b.textContent = t('lab4.run');
  }

  function toggleRun() {
    if (cpu.timer) { stopRun(); return; }
    if (cpu.halted) return;
    var b = $('#cpuRun');
    if (b) b.textContent = t('lab4.stop');
    cpu.timer = setInterval(function () {
      cpuStep();
      if (cpu.halted) stopRun();
    }, 750);
  }

  function cpuReset() {
    stopRun();
    cpu.pc = 0; cpu.acc = 0; cpu.ir = '—'; cpu.stage = 0; cpu.halted = false; cpu.cycles = 0;
    var ul = $('#cpuLog'); if (ul) ul.innerHTML = '';
    var o = $('#cpuOut'); if (o) o.textContent = '—';
    var a = $('#aluOp');  if (a) a.textContent = '—';
    var alu = $('#alu');  if (alu) alu.classList.remove('on');
    cpuLog(t('cpu.ready'));
    paintCpu();
  }

  function initCpu() {
    if (!$('#progList')) return;
    buildProg();
    $('#cpuStep').addEventListener('click', function () { stopRun(); cpuStep(); });
    $('#cpuRun').addEventListener('click', toggleRun);
    $('#cpuReset').addEventListener('click', cpuReset);
    cpuReset();
  }

  /* ===================================================
     5) SOYUTLAMA KATMANLARI
     =================================================== */
  var layerIdx = 0;

  function buildLayers() {
    var stack = $('#layerStack');
    if (!stack) return;
    var data = t('layers') || [];
    stack.innerHTML = '';
    data.forEach(function (L, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'layer' + (i === layerIdx ? ' on' : '');
      b.innerHTML = '<span class="lv">' + (data.length - i) + '</span>' +
                    '<span class="lt"></span><span class="lg"></span>';
      b.querySelector('.lt').textContent = L.t;
      b.addEventListener('click', function () { layerIdx = i; paintLayers(); });
      stack.appendChild(b);
    });
    paintLayers();
  }

  function paintLayers() {
    var data = t('layers') || [];
    var L = data[layerIdx];
    if (!L) return;
    $$('#layerStack .layer').forEach(function (e, i) { e.classList.toggle('on', i === layerIdx); });

    var d = $('#layerDetail');
    if (!d) return;
    d.innerHTML = '';
    var tag = document.createElement('div'); tag.className = 'ld-tag'; tag.textContent = L.tag;
    var h   = document.createElement('h4');  h.textContent = L.t;
    var p   = document.createElement('p');   p.textContent = L.d;
    var pre = document.createElement('pre'); pre.textContent = L.c;
    d.appendChild(tag); d.appendChild(h); d.appendChild(p); d.appendChild(pre);
    d.classList.remove('ld-anim');
    void d.offsetWidth;
    d.classList.add('ld-anim');
  }

  /* ===================================================
     Dışa açılan arayüz
     =================================================== */
  window.LAB = {
    init: function () {
      initBits();
      initGates();
      initAdder();
      initCpu();
      buildLayers();
    },
    /* dil değişince yeniden çevrilecek dinamik parçalar */
    refresh: function () {
      var ex = $('#gateExplain');
      if (ex) ex.innerHTML = t('gate.' + GATES[gateIdx].k);
      buildTruth();
      updateGate();
      buildProg();
      paintCpu();
      if (!cpu.timer) { var b = $('#cpuRun'); if (b) b.textContent = t('lab4.run'); }
      buildLayers();
    }
  };
})();
