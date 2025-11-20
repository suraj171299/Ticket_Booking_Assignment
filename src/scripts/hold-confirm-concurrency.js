
import { argv } from 'node:process';
import { performance } from 'node:perf_hooks';

function parseArgs() {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      args[k] = v === undefined ? true : v;
    } else if (!args._cmd) {
      args._cmd = a;
    }
  }
  return args;
}
const args = parseArgs();
if (!args._cmd) {
  console.error('Missing command. Use "prepare", "confirm" or "mixed".');
  process.exit(2);
}
const cmd = args._cmd;
const BASE = args.base || process.env.BASE_URL || 'http://localhost:3000';
const concurrency = Number(args.concurrency || 20);
const timeoutMs = Number(args.timeout || 20000);

async function fetchWithTimeout(url, opts = {}, t = timeoutMs) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), t);
  try {
    const res = await fetch(url, { ...opts, signal: controller.signal });
    const text = await res.text();
    let body;
    try { body = JSON.parse(text); } catch (e) { body = text; }
    return { ok: res.ok, status: res.status, body, headers: Object.fromEntries(res.headers) };
  } catch (err) {
    return { ok: false, status: 0, error: err.message };
  } finally {
    clearTimeout(id);
  }
}

/* ---------------- PREPARE: create holds ---------------- */
async function runPrepare() {
  const eventId = args.event;
  const token = args.token;
  const count = Number(args.count || 10);
  const seats = Number(args.seats || 1);

  if (!eventId || !token) {
    throw new Error('Missing --event and/or --token for prepare mode');
  }
  console.log(`Prepare mode: creating ${count} holds for event=${eventId} seats=${seats}`);

  const holdIds = [];
  for (let i = 0; i < count; i++) {
    const url = `${BASE}/api/v1/hold/${eventId}/events`;
    const opts = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ seats })
    };
    const res = await fetchWithTimeout(url, opts);
    if (res.ok && (res.status === 201 || res.status === 200)) {
      const id = (res.body && res.body.data && (res.body.data.hold_id || res.body.data.holdId));
      holdIds.push(id);
      console.log(`#${i} OK holdId=${id}`);
    } else {
      console.log(`#${i} FAIL status=${res.status} body=`, res.body || res.error);
    }
  }

  console.log('\nPrepare finished. Hold IDs (comma separated):');
  console.log(holdIds.join(','));
}

/* ---------------- CONFIRM: concurrent confirms ---------------- */
async function runConfirm() {
  const token = args.token || process.env.TOKEN;
  const holdIdsArg = args.holdIds;
  if (!token || !holdIdsArg) throw new Error('Missing --token and/or --holdIds for confirm mode');
  const holdIds = holdIdsArg.split(',').map(s => s.trim()).filter(Boolean);
  if (holdIds.length === 0) throw new Error('No holdIds provided');

  console.log(`Confirm mode: ${holdIds.length} unique holdIds, concurrency=${concurrency}`);

  // build actions (concurrency) cycling through holdIds
  const actions = [];
  for (let i = 0; i < concurrency; i++) {
    const holdId = holdIds[i % holdIds.length];
    actions.push(async () => {
      const url = `${BASE}/api/v1/hold/${holdId}/confirm`;
      const opts = { method: 'POST', headers: { Authorization: `Bearer ${token}` } };
      const start = performance.now();
      const r = await fetchWithTimeout(url, opts);
      const dur = (performance.now() - start).toFixed(1);
      return { idx: i, holdId, dur, ...r };
    });
  }

  const startAll = performance.now();
  const results = await Promise.all(actions.map(a => a()));
  const totalTime = (performance.now() - startAll).toFixed(1);

  const ok = results.filter(r => r.ok && (r.status === 201 || r.status === 200));
  const bad = results.filter(r => !r.ok || (r.status !== 201 && r.status !== 200));
  console.log(`\nFinished ${results.length} confirms in ${totalTime}ms — Success: ${ok.length}, Failed: ${bad.length}\n`);

  ok.slice(0, 10).forEach(r => console.log(`#${r.idx} hold=${r.holdId} dur=${r.dur}ms status=${r.status} body=`, r.body));
  bad.slice(0, 20).forEach(r => console.log(`#${r.idx} hold=${r.holdId} dur=${r.dur}ms status=${r.status} err=`, r.body || r.error));

  console.log('\nSQL checks to run after confirm test:');
  console.log(`SELECT COUNT(*) AS active_bookings, COALESCE(SUM(seats),0) AS seats_booked FROM bookings WHERE event_id = (SELECT event_id FROM holds WHERE hold_id = '${holdIds[0]}') AND status='active';`);
  console.log(`SELECT status, COUNT(*) FROM holds WHERE hold_id IN (${holdIds.map(h => `'${h}'`).join(',')}) GROUP BY status;`);
}

/* ---------------- MIXED: create holds + confirm simultaneously ---------------- */
async function runMixed() {
  const eventId = args.event;
  const tokenA = args.tokenA || args.token;
  const tokenB = args.tokenB || tokenA;
  const creatorTokens = [tokenA, tokenB].filter(Boolean);
  const confirmToken = args.token;
  const holdIdsArg = args.holdIds || '';
  const staticHoldIds = holdIdsArg.split(',').map(s => s.trim()).filter(Boolean);
  const seats = Number(args.seats || 1);

  if (!eventId || creatorTokens.length === 0 || !confirmToken) {
    throw new Error('Missing --event and/or --tokenA/--token and/or --token for confirm');
  }

  console.log(`MIXED test: event=${eventId}, creators=${creatorTokens.length}, confirmToken provided, concurrency=${concurrency}`);

  const actions = [];
  for (let i = 0; i < concurrency; i++) {
    if (i % 2 === 0) {
      const token = creatorTokens[i % creatorTokens.length];
      actions.push(async () => {
        const url = `${BASE}/api/v1/hold/${eventId}/events`;
        const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ seats }) };
        const start = performance.now();
        const r = await fetchWithTimeout(url, opts);
        const dur = (performance.now() - start).toFixed(1);
        return { type: 'create', idx: i, dur, ...r };
      });
    } else {

      if (staticHoldIds.length === 0) {

        const token = creatorTokens[i % creatorTokens.length];
        actions.push(async () => {
          const url = `${BASE}/api/v1/hold/${eventId}/events`;
          const opts = { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ seats }) };
          const start = performance.now();
          const r = await fetchWithTimeout(url, opts);
          const dur = (performance.now() - start).toFixed(1);
          return { type: 'create-fallback', idx: i, dur, ...r };
        });
      } else {
        const holdId = staticHoldIds[i % staticHoldIds.length];
        actions.push(async () => {
          const url = `${BASE}/api/v1//hold/${holdId}/confirm`;
          const opts = { method: 'POST', headers: { Authorization: `Bearer ${confirmToken}` } };
          const start = performance.now();
          const r = await fetchWithTimeout(url, opts);
          const dur = (performance.now() - start).toFixed(1);
          return { type: 'confirm', idx: i, holdId, dur, ...r };
        });
      }
    }
  }

  const startAll = performance.now();
  const results = await Promise.all(actions.map(a => a()));
  const totalTime = (performance.now() - startAll).toFixed(1);

  const created = results.filter(r => r.type && r.type.startsWith('create') && r.ok && (r.status === 201 || r.status === 200));
  const confirmed = results.filter(r => r.type === 'confirm' && r.ok && (r.status === 201 || r.status === 200));
  const failed = results.filter(r => !r.ok || (r.status !== 200 && r.status !== 201));

  console.log(`\nMIXED finished ${results.length} actions in ${totalTime}ms — created: ${created.length}, confirmed: ${confirmed.length}, failed: ${failed.length}\n`);
  created.slice(0, 10).forEach((r, i) => console.log(`#C${i} idx=${r.idx} dur=${r.dur} status=${r.status} body=`, r.body));
  confirmed.slice(0, 10).forEach((r, i) => console.log(`#F${i} idx=${r.idx} hold=${r.holdId} dur=${r.dur} status=${r.status} body=`, r.body));
  failed.slice(0, 20).forEach((r, i) => console.log(`#X${i} idx=${r.idx} dur=${r.dur} status=${r.status} err=`, r.body || r.error));

  console.log('\nSQL checks to run after mixed test:');
  console.log('SELECT total_seats FROM events WHERE id = ' + eventId + ';');
  console.log('SELECT COUNT(*) AS active_holds, COALESCE(SUM(seats),0) AS seats_held FROM holds WHERE event_id = ' + eventId + ' AND status = \'ACTIVE\';');
  console.log('SELECT COUNT(*) AS active_bookings, COALESCE(SUM(seats),0) AS seats_booked FROM bookings WHERE event_id = ' + eventId + ' AND status = \'active\';');
}

/* ------------------ executor ------------------ */
(async () => {
  try {
    if (cmd === 'prepare') {
      await runPrepare();
    } else if (cmd === 'confirm') {
      await runConfirm();
    } else if (cmd === 'mixed') {
      await runMixed();
    } else {
      console.error('Unknown command:', cmd);
      process.exit(2);
    }
  } catch (err) {
    console.error('Error:', err.message || err);
    process.exit(1);
  }
})();
