(() => {
  /* ================= state ================= */
  const KEY = "madeira2027-v2";
  const state = Object.assign({ picks: [], stays: {}, days: {}, filter: "all", split: 4 }, JSON.parse(localStorage.getItem(KEY) || "{}"));
  delete state.stays.s3; // the old third stay was removed — the 3pm flight doesn't need an airport hotel
  // Nov 16: Madison chose Saccharum for 4 nights (4th night free), then Reid's (FHR) for the rest
  if ((state.v || 0) < 3) { state.split = 4; state.stays = { s1: "saccharum", s2: "reids" }; state.days = {}; state.v = 3; localStorage.setItem(KEY, JSON.stringify(state)); }
  // Nov 16: flight home moved from Sat Jan 16 to Fri Jan 15 (one night fewer). The old last full day (index 7) goes away
  // and the old departure day (index 8) becomes index 7.
  if (state.v < 4) {
    const days = {};
    Object.entries(state.days || {}).forEach(([key, val]) => {
      const i = +key.split(":")[0];
      if (i === 7) return;
      days[i === 8 ? key.replace(/^8:/, "7:") : key] = val;
    });
    state.days = days; state.v = 4; localStorage.setItem(KEY, JSON.stringify(state));
  }
  const save = () => localStorage.setItem(KEY, JSON.stringify(state));
  const $ = (s, el = document) => el.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const AMEX = { FHR: "Amex FHR", THC: "Amex Hotel Collection" };
  const LUSH = ["Bare · views", "Some green", "Green", "Very lush"];
  const RAIN = ["Lowest", "Low", "Medium", "Higher"];
  const WEATHER = { drizzle: "Fine in drizzle", clear: "Best on a clear day", any: "Any weather" };
  // rough hours on foot / on site, used to decide what fits in one day
  const HRS = { pr6: 3.5, alecrim: 2.5, pr9: 4.5, rei: 3, furado: 4, balcoes: 1, fanal: 1.5, cedros: 3, pr1: 6, pr8: 3, seixal: 3, monte: 4, caves: 2, santana: 1, botanic: 2, curral: 3, arieiro: 1, cabo: 2.5, moniz: 2, funchal: 4, dolphins: 2.5, tea: 2, machico: 1.5 };

  const expById = (id) => EXPERIENCES.find((e) => e.id === id);
  const hotelById = (id) => HOTELS.find((h) => h.id === id);
  const stayById = (id) => STAYS.find((s) => s.id === id);
  const stayHotel = (sid) => hotelById(state.stays[sid]);
  const picks = () => state.picks.map(expById).filter(Boolean);

  /* ================= days (built from the resort-nights switch) ================= */
  const DATES = ["Fri · Jan 8", "Sat · Jan 9", "Sun · Jan 10", "Mon · Jan 11", "Tue · Jan 12", "Wed · Jan 13", "Thu · Jan 14", "Fri · Jan 15"];
  const SHORT = ["Jan 8", "Jan 9", "Jan 10", "Jan 11", "Jan 12", "Jan 13", "Jan 14", "Jan 15"];
  let DAYS = [];
  function buildDays() {
    const k = state.split; // resort nights (2 or 3)
    const move = 1 + k;
    const last = DATES.length - 1; // departure day
    const s1Titles = ["Out exploring", "Another adventure", "One more day out"];
    const s2Titles = ["Adventure day", "Into the forest", "Wildcard day", "One more trail"];
    DAYS = DATES.map((date, i) => {
      if (i === 0) return { date, title: "Wheels up", type: "fixed", fixed: FLIGHT_OUT };
      if (i === 1) return { date, title: "Land & melt into the resort", type: "arrive", stay: "s1",
        blurb: "You land at 14:10, collect the car, and should be checked in by about 16:00. Sunset is around 18:15." };
      if (i === 2) return { date, title: "A true resort day", type: "stay", stay: "s1", lazy: true,
        blurb: "Stay put. If a pick is close by, add it as an easy second stop." };
      if (i < move) return { date, title: s1Titles[i - 3] || "Out exploring", type: "stay", stay: "s1",
        blurb: "An excursion day from the resort, with a pool waiting when you get back." };
      if (i === move) return { date, title: "On to the next hotel", type: "move", from: "s1", to: "s2",
        blurb: "Check out and drive to your second hotel, with stops on the way. The extra time shows how far each stop takes you out of your way." };
      if (i < last) return { date, title: i === last - 1 ? "Last full day" : s2Titles[i - move - 1] || "Adventure day", type: "stay", stay: "s2",
        blurb: "Choose a pick, and add a second one if it starts nearby. Rainy? Choose a forest levada and save the big views for a clear day." };
      return { date, title: "Fly home", type: "depart", stay: "s2", fixedEnd: FLIGHT_HOME,
        blurb: "FNC 15:00 → Porto → EWR 21:35. Return the car by about 12:45, so leave the hotel with time to spare." };
    });
    const nights1 = k, nights2 = last - 1 - k;
    Object.assign(stayById("s1"), { dates: `Sat Jan 9 → ${DATES[move].replace(" ·", "")}`, nights: nights1 });
    Object.assign(stayById("s2"), { dates: `${DATES[move].replace(" ·", "")} → Fri Jan 15`, nights: nights2 });
  }

  /* ================= drive-time estimate =================
     Straight-line km × 1.2 + 8 min, plus mountain-road and north/south crossing penalties.
     Roughly calibrated to typical Google Maps times — shown with "≈". */
  function drive(a, b) {
    if (!a || !b) return null;
    const km = Math.hypot((a.lat - b.lat) * 111, (a.lon - b.lon) * 93.4);
    if (km < 0.4) return 0;
    let m = 1.2 * km + 8 + (a.pen || 0) + (b.pen || 0);
    if ((a.side === "N" && b.side === "S") || (a.side === "S" && b.side === "N")) m += 8;
    return Math.max(5, Math.round(m / 5) * 5);
  }
  const fmt = (m) => {
    if (m === null || m === undefined) return "—";
    if (m === 0) return "on site";
    if (m < 60) return `≈ ${m} min`;
    return `≈ ${Math.floor(m / 60)} h${m % 60 ? " " + (m % 60) + " min" : ""}`;
  };
  const route = (pts) => pts.reduce((sum, p, i) => (i ? sum + drive(pts[i - 1], p) : 0), 0);

  /* ================= least-driving planner =================
     Tries every way of putting your picks onto the days (one pick, or two that start close together)
     and keeps the plan that fits the most picks with the least total driving. */
  function planTrip(h1, h2, list = picks()) {
    if (!h1 || !h2) return null;
    const P = list.slice(0, 14);
    const n = P.length;
    const dayKinds = DAYS.map((d) => (d.lazy ? "resort" : d.type === "move" ? "move" : d.type === "stay" ? (d.stay === "s1" ? "base1" : "base") : null))
      .map((kind, i) => ({ kind, i })).filter((x) => x.kind);
    const hrs = (p) => HRS[p.id] || 3;
    // candidate groups: [mask, ordered picks]
    const groups = [];
    for (let a = 0; a < n; a++) {
      groups.push({ mask: 1 << a, list: [P[a]] });
      for (let b = a + 1; b < n; b++) {
        if (drive(P[a], P[b]) <= 30 && hrs(P[a]) + hrs(P[b]) <= 6.5 && Math.max(hrs(P[a]), hrs(P[b])) < 5) groups.push({ mask: (1 << a) | (1 << b), list: [P[a], P[b]] });
      }
    }
    const cost = (kind, list) => {
      if (kind === "resort") return route([h1, ...list, h1]);
      if (kind === "base") return route([h2, ...list, h2]);
      if (kind === "base1") return route([h1, ...list, h1]);
      const fwd = route([h1, ...list, h2]);
      return list.length === 2 ? Math.min(fwd, route([h1, list[1], list[0], h2])) : fwd;
    };
    const order = (kind, list) => {
      if (list.length < 2) return list;
      const A = kind === "base" ? h2 : h1, B = kind === "resort" || kind === "base1" ? h1 : h2;
      return route([A, list[0], list[1], B]) <= route([A, list[1], list[0], B]) ? list : [list[1], list[0]];
    };
    const allowed = (kind, g) => {
      const h = g.list.reduce((s, p) => s + hrs(p), 0);
      if (kind === "resort") return g.list.length === 1 && drive(h1, g.list[0]) <= 20 && h <= 4;      // keep resort days lazy
      if (kind === "move") return h <= 4.5;
      return h <= 6.5;
    };
    const memo = new Map();
    function best(d, mask) {
      if (d === dayKinds.length) return { cov: 0, drv: 0, pick: [] };
      const key = d * 65536 + mask;
      if (memo.has(key)) return memo.get(key);
      const kind = dayKinds[d].kind;
      const restCost = kind === "move" ? drive(h1, h2) : 0; // staying put costs nothing
      let r = best(d + 1, mask);
      let bestR = { cov: r.cov, drv: r.drv + restCost, pick: [null, ...r.pick] };
      for (const g of groups) {
        if (g.mask & mask || !allowed(kind, g)) continue;
        const sub = best(d + 1, mask | g.mask);
        const cand = { cov: sub.cov + g.list.length, drv: sub.drv + cost(kind, g.list), pick: [g, ...sub.pick] };
        if (cand.cov > bestR.cov || (cand.cov === bestR.cov && cand.drv < bestR.drv)) bestR = cand;
      }
      memo.set(key, bestR);
      return bestR;
    }
    const res = best(0, 0);
    let assign = dayKinds.map((dk, k) => ({ ...dk, list: res.pick[k] ? order(dk.kind, res.pick[k].list) : [] }));
    // within each hotel's excursion days: clear-weather picks first (so you can swap if it's cloudy), rest days last
    ["base1", "base"].forEach((kind) => {
      const days = assign.filter((a) => a.kind === kind);
      const score = (a) => (a.list.length ? (a.list.some((p) => p.weather === "clear") ? 0 : 1) : 2);
      const lists = [...days].sort((x, y) => score(x) - score(y)).map((x) => x.list);
      days.forEach((slot, k) => { slot.list = lists[k]; });
    });
    const covered = new Set(assign.flatMap((a) => a.list.map((p) => p.id)));
    const total = drive(AIRPORT, h1) + res.drv + drive(h2, AIRPORT);
    return { assign, total, uncovered: list.filter((p) => !covered.has(p.id)) };
  }

  /* ================= shared bits ================= */
  const credit = (name) => {
    const c = (window.CREDITS || {})[name];
    if (!c) return "";
    const t = c.by && c.by !== "Official hotel website" ? `Photo: ${c.by} · ${c.lic} · Wikimedia Commons` : "Photo: official hotel website";
    return `<a class="credit" href="${esc(c.src)}" target="_blank" rel="noopener" title="${esc(t)}" onclick="event.stopPropagation()">i</a>`;
  };
  const photo = (name, cls = "") =>
    `<div class="photo ${cls}"><img src="img/${name}.jpg" alt="" loading="lazy" data-full="img/${name}.jpg" />${credit(name)}</div>`;
  let gid = 0;
  const gallery = (imgs) => {
    if (!imgs.length) return `<div class="photo empty"><span>Choose that hotel to see it here</span></div>`;
    const id = "g" + gid++;
    const thumbs = imgs.length > 1
      ? `<div class="thumbs">${imgs.map((n, i) => `<img src="img/${n}.jpg" data-swap="${n}" data-g="${id}" class="${i ? "" : "on"}" alt="" loading="lazy" />`).join("")}</div>`
      : "";
    return `<div class="gallery" id="${id}">${photo(imgs[0], "main")}${thumbs}</div>`;
  };
  const resolveImgs = (imgs = []) =>
    imgs.flatMap((i) => {
      if (!i.startsWith("@")) return [i];
      const h = stayHotel(i.slice(1));
      return h ? [h.imgs[0]] : [];
    });
  const mapLink = (href, label = "Map") => (href ? `<a href="${href}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${label} →</a>` : "<span></span>");

  /* ================= flights ================= */
  const flightCard = (f, label) => `
    <div class="flight">
      <div class="f-label">${label} · ${f.date}</div>
      <div class="f-row"><b>${f.dep}</b> ${f.from} <span class="f-line"></span> <b>${f.arr}</b> ${f.to}</div>
      <div class="f-meta">${f.airline} · ${f.dur} · ${f.stop}</div>
    </div>`;
  $("#flights").innerHTML = flightCard(FLIGHTS.out, "Outbound") + flightCard(FLIGHTS.back, "Return");

  /* ================= I. experiences ================= */
  const FILTERS = [["all", "All"], ["hike", "Hikes"], ["outing", "Excursions"], ["lush", "Very lush"], ["drizzle", "Fine in drizzle"], ["mine", "My picks"]];

  function renderExperiences() {
    const f = state.filter;
    const list = EXPERIENCES.filter((e) =>
      f === "all" ? true
      : f === "hike" || f === "outing" ? e.kind === f
      : f === "lush" ? e.lush >= 3
      : f === "drizzle" ? e.weather === "drizzle"
      : state.picks.includes(e.id));
    const n = state.picks.length;
    $("#exp-filters").innerHTML = FILTERS.map(([k, l]) => `<button class="chip ${f === k ? "on" : ""}" data-filter="${k}">${l}${k === "mine" ? ` (${n})` : ""}</button>`).join("");
    $("#exp-count").innerHTML = n
      ? `<b>${n}</b> picked. You have about five days to fill, and two picks that start close together can share a day.${n >= 3 ? ` <a href="#hotels">Now choose hotels →</a>` : ""}`
      : "Nothing picked yet. Tap anything that looks good.";
    $("#exp-grid").innerHTML = list.length ? list.map((e) => {
      const on = state.picks.includes(e.id);
      return `
      <article class="card exp ${on ? "added" : ""}" id="exp-${e.id}" data-toggle="${e.id}">
        ${gallery(e.img)}
        <div class="body">
          <div class="badges"><span class="badge">${e.kind === "hike" ? "Hike" : "Excursion"} · ${esc(e.effort)}</span></div>
          <h4>${esc(e.name)}</h4>
          <div class="area">${esc(e.area)}</div>
          <div class="traits"><span class="lush l${e.lush}">${LUSH[e.lush]}</span><span>${WEATHER[e.weather]}</span></div>
          <p>${esc(e.desc)}</p>
          <div class="links">${mapLink(e.link)}<button class="${on ? "ghost" : "pick-btn"}">${on ? "Added ✓" : "Add to my trip"}</button></div>
        </div>
      </article>`;
    }).join("") : `<p class="empty-note">Nothing here yet.</p>`;
  }

  /* ================= II. hotels ================= */
  const avg = (arr) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  const fitCache = new Map();
  function hotelFit(h, role) {
    const key = role + h.id + "|" + state.picks.join(",") + "|" + JSON.stringify(state.stays) + state.split;
    if (fitCache.has(key)) return fitCache.get(key);
    const ps = picks();
    const drives = ps.map((p) => ({ p, m: drive(h, p) })).sort((a, b) => a.m - b.m);
    const a = avg(drives.map((d) => d.m));
    const air = drive(h, AIRPORT);
    let trip = null, score;
    if (role === "resort") {
      const other = stayHotel("s2");
      trip = other && ps.length ? planTrip(h, other) : null;
      score = h.rain * 25 + (h.resort ? 0 : 35) + (trip ? trip.total / 12 + trip.uncovered.length * 20 : a * 0.4) - (h.amex ? 4 : 0);
    } else {
      const s1 = stayHotel("s1");
      trip = s1 && ps.length ? planTrip(s1, h) : null;
      score = (trip ? trip.total / 4 + trip.uncovered.length * 40 : a) - (h.amex === "FHR" ? 40 : 0) - h.lush * 2;
    }
    const r = { drives, a, air, trip, score };
    fitCache.set(key, r);
    return r;
  }

  function renderStays() {
    const hasPicks = state.picks.length > 0;
    $("#split").innerHTML = `
      <span>Resort nights</span>
      ${[2, 3, 4].map((k) => `<button class="chip ${state.split === k ? "on" : ""}" data-split="${k}">${k} + ${DATES.length - 2 - k} nights</button>`).join("")}`;
    $("#stays").innerHTML = STAYS.map((st) => {
      const chosen = state.stays[st.id];
      const ranked = HOTELS.map((h) => ({ h, fit: hotelFit(h, st.role) })).sort((x, y) => x.fit.score - y.fit.score);
      const list = chosen ? ranked.filter((r) => r.h.id === chosen) : ranked;
      const otherNeeded = st.id === "s2" ? !state.stays.s1 : false;
      return `
      <div class="stay" id="stay-${st.id}">
        <div class="stay-head">
          <div><div class="stay-n">Stay ${st.n}</div><h3>${st.label}</h3><div class="dates">${st.dates} · ${st.nights} nights</div></div>
          ${chosen ? `<button class="ghost" data-clear="stay:${st.id}">Change</button>` : `<span class="count">${HOTELS.length} hotels · best fit first</span>`}
        </div>
        ${chosen ? "" : `<p class="why">${st.why}${!hasPicks && st.role !== "resort" ? ` <i>Add experiences in section I to rank these.</i>` : otherNeeded && hasPicks ? ` <i>Choose the resort first to see total trip driving for each hotel.</i>` : ""}</p>`}
        <div class="grid ${chosen ? "picked" : ""}">
          ${list.map(({ h, fit }, rank) => hotelCard(h, fit, st, rank, !!chosen)).join("")}
        </div>
      </div>`;
    }).join("");
  }

  function hotelCard(h, fit, st, rank, chosen) {
    const elsewhere = STAYS.filter((s) => s.id !== st.id && state.stays[s.id] === h.id).map((s) => "Stay " + s.n);
    const best = !chosen && rank < 2 && (state.picks.length || st.role === "resort");
    const closest = fit.drives.slice(0, chosen ? 10 : 4);
    return `
      <article class="card hotel ${chosen ? "chosen" : ""}" id="hc-${st.id}-${h.id}" data-pick="stay:${st.id}" data-val="${h.id}">
        ${gallery(h.imgs)}
        <div class="body">
          <div class="badges">
            ${best ? `<span class="badge best">Best fit</span>` : ""}
            ${h.amex ? `<span class="badge amex">${AMEX[h.amex]}</span>` : ""}
            <span class="badge">${esc(h.cls)}</span>
            ${elsewhere.length ? `<span class="badge warn">Also your ${elsewhere.join(", ")}</span>` : ""}
          </div>
          <h4>${esc(h.name)}</h4>
          <div class="area">${esc(h.area)}</div>
          <p>${esc(h.desc)}</p>
          ${fit.trip ? `<div class="trip-total">Total trip driving ${fmt(fit.trip.total)}${fit.trip.uncovered.length ? ` · <span class="warn-text">${fit.trip.uncovered.length} pick${fit.trip.uncovered.length > 1 ? "s" : ""} won't fit</span>` : ""}</div>` : ""}
          <dl class="facts">
            <dt>Style</dt><dd>${esc(h.style || "")}</dd>
            <dt>Jan rain</dt><dd class="rain r${h.rain}">${RAIN[h.rain]}</dd>
            <dt>Setting</dt><dd>${LUSH[h.lush]}</dd>
            <dt>Airport</dt><dd>${fmt(fit.air)}</dd>
            ${state.picks.length ? `<dt>Your picks</dt><dd>avg ${fmt(fit.a)}</dd>` : ""}
          </dl>
          ${closest.length ? `<ul class="drives">${closest.map((d) => `<li><span>${esc(d.p.name)}</span><span>${fmt(d.m)}</span></li>`).join("")}</ul>` : ""}
          <div class="links">${mapLink(h.link, "Visit the hotel")}${chosen ? "" : `<button class="pick-btn">Choose</button>`}</div>
        </div>
      </article>`;
  }

  /* ---------- map: only your picks + chosen / suggested hotels ---------- */
  let map, layer, tiles;
  const SYM = {
    pick: (n = "") => `<span class="m-dot">${n}</span>`,
    house: (chosen, label = "") =>
      `<span class="m-house ${chosen ? "chosen" : "suggested"}"><svg viewBox="0 0 24 24"><path d="M12 3.2 2.5 11h2.6v9.3h5.2v-5.6h3.4v5.6h5.2V11h2.6z"/></svg>${label ? `<b>${label}</b>` : ""}</span>`,
    plane: () => `<span class="m-plane"><svg viewBox="0 0 24 24"><path d="M21 15.5v-2l-7.5-4.6V3.8a1.5 1.5 0 0 0-3 0v5.1L3 13.5v2l7.5-2.2v4.4l-2 1.5v1.5l3.5-1 3.5 1v-1.5l-2-1.5v-4.4z"/></svg></span>`,
  };
  const icon = (html, size) => L.divIcon({ html, className: "m-icon", iconSize: size, iconAnchor: [size[0] / 2, size[1] / 2] });

  // Esri satellite imagery (no API key) + place labels — shows where the island is green
  function setTiles() {
    if (!map || tiles) return;
    tiles = L.layerGroup([
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", { maxZoom: 17,
        attribution: "Imagery © Esri, Maxar, Earthstar Geographics" }),
      L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}", { maxZoom: 17, opacity: 0.85 }),
    ]).addTo(map);
  }

  // hotels to show: chosen ones, plus the top 2 suggestions for every stay not yet chosen
  function mapHotels() {
    const out = new Map();
    STAYS.forEach((st) => {
      const chosen = state.stays[st.id];
      if (chosen) {
        const cur = out.get(chosen);
        out.set(chosen, { h: hotelById(chosen), chosen: [...(cur?.chosen || []), st], suggested: cur?.suggested || [] });
      } else if (state.picks.length || st.role === "resort") {
        HOTELS.map((h) => ({ h, sc: hotelFit(h, st.role).score })).sort((a, b) => a.sc - b.sc).slice(0, 2).forEach(({ h }) => {
          const cur = out.get(h.id) || { h, chosen: [], suggested: [] };
          cur.suggested.push(st); out.set(h.id, cur);
        });
      }
    });
    return [...out.values()];
  }

  function renderMap() {
    if (!window.L) { $("#map").innerHTML = `<p class="empty-note">The map needs an internet connection.</p>`; return; }
    if (!map) {
      map = L.map("map", { scrollWheelZoom: false, zoomSnap: 0.25 }).fitBounds([[32.63, -17.27], [32.87, -16.66]], { padding: [10, 10] });
      setTiles();
      layer = L.layerGroup().addTo(map);
    }
    layer.clearLayers();
    const groups = new Map();
    picks().forEach((e) => {
      const k = e.lat.toFixed(3) + "," + e.lon.toFixed(3);
      groups.set(k, [...(groups.get(k) || []), e]);
    });
    groups.forEach((list) => {
      const e = list[0];
      L.marker([e.lat, e.lon], { icon: icon(SYM.pick(list.length > 1 ? list.length : ""), [18, 18]), zIndexOffset: 200 })
        .bindTooltip(list.map((x) => x.name).join("<br>"), { direction: "top", offset: [0, -8] })
        .on("click", () => goToExp(e.id))
        .addTo(layer);
    });
    const seen = {};
    mapHotels().forEach(({ h, chosen, suggested }) => {
      const k = h.lat.toFixed(3) + "," + h.lon.toFixed(3);
      const n = (seen[k] = (seen[k] || 0) + 1) - 1;
      const isChosen = chosen.length > 0;
      const label = chosen.map((s) => s.n).join("·");
      const tip = isChosen ? `Stay ${label} · ${h.name}` : `Suggested for ${suggested.map((s) => "Stay " + s.n).join(" & ")} · ${h.name}`;
      const ic = L.divIcon({ html: SYM.house(isChosen, label), className: "m-icon", iconSize: [30, 30], iconAnchor: [15 - n * 26, 15] });
      L.marker([h.lat, h.lon], { icon: ic, zIndexOffset: isChosen ? 400 : 300 })
        .bindTooltip(tip + "<br><i>Click for details</i>", { direction: "top", offset: [n * 26, -12] })
        .on("click", () => goToHotel((chosen[0] || suggested[0]).id, h.id))
        .addTo(layer);
    });
    L.marker([AIRPORT.lat, AIRPORT.lon], { icon: icon(SYM.plane(), [24, 24]) }).bindTooltip("Airport (FNC)", { direction: "top", offset: [0, -10] }).addTo(layer);
    $("#map-empty").hidden = state.picks.length > 0;
  }

  $("#map-key").innerHTML = `
    <span>${SYM.pick()} Your picks <small>(a number means several picks start at the same place)</small></span>
    <span>${SYM.house(true, "I")} Hotel you chose (stay number)</span>
    <span>${SYM.house(false)} Suggested hotel for a stay you haven't filled</span>
    <span>${SYM.plane()} Airport</span>`;

  function flash(el) {
    if (!el) return;
    scrollTo({ top: el.getBoundingClientRect().top + scrollY - 90, behavior: "smooth" });
    el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash");
  }
  function goToHotel(stayId, hotelId) { flash(document.getElementById(`hc-${stayId}-${hotelId}`)); }
  function goToExp(id) {
    if (!document.getElementById("exp-" + id)) { state.filter = "all"; save(); renderExperiences(); }
    flash(document.getElementById("exp-" + id));
  }

  /* ================= III. days ================= */
  const planned = (expId, exceptIdx) =>
    DAYS.map((d, i) => (i !== exceptIdx && (state.days[`${i}:day`] === expId || state.days[`${i}:also`] === expId) ? SHORT[i] : null)).filter(Boolean);

  // where you are when choosing the day's second stop
  const dayBase = (d) => stayHotel(d.type === "move" ? d.from : d.stay);

  function dayOptions(d) {
    const ps = picks();
    if (d.type === "arrive") {
      const h = stayHotel("s1");
      return ARRIVE_OPTS.map((o) => {
        if (!h) return o;
        if (!o.lat) return { ...o, note: `${fmt(drive(AIRPORT, h))} from the airport` };
        const det = Math.max(0, drive(AIRPORT, o) + drive(o, h) - drive(AIRPORT, h));
        return { ...o, note: det <= 10 ? "Right on your way from the airport" : `+${det} min detour from the airport` };
      });
    }
    if (d.type === "depart") {
      const h = stayHotel("s2");
      return DEPART_OPTS.map((o) => {
        if (!h || !o.lat) return { ...o, note: h ? `Then ${fmt(drive(h, AIRPORT))} to the airport` : "" };
        const det = Math.max(0, drive(h, o) + drive(o, AIRPORT) - drive(h, AIRPORT));
        return { ...o, note: det <= 10 ? "Right on your way to the airport" : `+${det} min detour on the way to the airport` };
      });
    }
    if (d.type === "stay") {
      const h = stayHotel(d.stay);
      const rest = { id: "rest", name: h ? `Pool, spa & long lunch at ${h.name}` : "Rest day at the hotel", tag: "Do nothing", img: ["@" + d.stay], desc: "No driving. Use your hotel credit on the spa if your rate includes one." };
      const opts = ps.map((e) => {
        const m = h ? drive(h, e) : null;
        return { ...e, tag: e.effort, note: h ? `${fmt(m)} each way from ${h.name}` : "", sortKey: m ?? 999 };
      }).sort((a, b) => a.sortKey - b.sortKey);
      return [rest, ...opts];
    }
    if (d.type === "move") {
      const A = stayHotel(d.from), B = stayHotel(d.to);
      const direct = A && B ? drive(A, B) : null;
      const straight = { id: "straight", name: B ? `Drive straight to ${B.name}` : "Drive straight to the boutique", tag: direct !== null ? `${fmt(direct)} direct` : "Settle in early", img: ["@" + d.to], desc: "Arrive early, unpack, and enjoy the new place." };
      const opts = ps.map((e) => {
        if (!(A && B)) return { ...e, tag: e.effort, note: "", sortKey: 999 };
        const det = Math.max(0, drive(A, e) + drive(e, B) - direct);
        return { ...e, tag: e.effort, note: det <= 10 ? "Right on your way" : `+${det} min detour on the way`, sortKey: det };
      }).sort((a, b) => a.sortKey - b.sortKey);
      return [straight, ...opts];
    }
    return [];
  }

  // optional second stop: your other picks, closest to the first choice
  function alsoOptions(d, i) {
    const first = state.days[`${i}:day`];
    if (!first || !["stay", "move"].includes(d.type) || !state.picks.length) return [];
    const from = expById(first) || dayBase(d);
    if (!from) return [];
    return picks().filter((e) => e.id !== first).map((e) => {
      const m = drive(from, e);
      return { ...e, tag: e.effort, note: `${fmt(m)} from ${expById(first) ? expById(first).name : from.name}`, sortKey: m };
    }).sort((a, b) => a.sortKey - b.sortKey);
  }

  function dayDriving(d, i) {
    const a = expById(state.days[`${i}:day`]), b = expById(state.days[`${i}:also`]);
    const stops = [a, b].filter(Boolean);
    if (d.type === "arrive") {
      const h = stayHotel("s1"); if (!h) return null;
      const o = ARRIVE_OPTS.find((x) => x.id === state.days[`${i}:day`]);
      return o && o.lat ? route([AIRPORT, o, h]) : drive(AIRPORT, h);
    }
    if (d.type === "depart") {
      const h = stayHotel("s2"); if (!h) return null;
      const o = DEPART_OPTS.find((x) => x.id === state.days[`${i}:day`]);
      return o && o.lat ? route([h, o, AIRPORT]) : drive(h, AIRPORT);
    }
    if (d.type === "move") { const A = stayHotel(d.from), B = stayHotel(d.to); return A && B ? route([A, ...stops, B]) : null; }
    if (d.type === "stay") { const h = stayHotel(d.stay); return h ? route([h, ...stops, h]) : null; }
    return null;
  }

  function dinnerOptions(d) {
    const sid = d.type === "move" ? d.to : d.stay;
    const h = stayHotel(sid);
    const home = { id: "home", name: "Dinner at your hotel", tag: "No driving", link: "", note: "" };
    if (!h) return [home, ...RESTAURANTS.slice(0, 6)];
    const near = RESTAURANTS.map((r) => ({ ...r, m: drive(h, r) })).sort((a, b) => a.m - b.m).slice(0, 7);
    return [home, ...near.map((r) => ({ ...r, note: fmt(r.m) }))];
  }

  function optionCard(o, key, i, picked) {
    const dup = o.kind ? planned(o.id, i) : [];
    return `
      <article class="card ${picked ? "chosen" : ""} ${dup.length && !picked ? "dim" : ""}" data-pick="${key}" data-val="${o.id}">
        ${gallery(resolveImgs(o.img))}
        <div class="body">
          <div class="badges">
            <span class="badge">${esc(o.tag || "")}</span>
            ${dup.length ? `<span class="badge warn">Planned for ${dup.join(", ")}</span>` : ""}
          </div>
          <h4>${esc(o.name)}</h4>
          ${o.note ? `<div class="drive-note">${esc(o.note)}</div>` : ""}
          ${o.kind ? `<div class="traits"><span class="lush l${o.lush}">${LUSH[o.lush]}</span><span>${WEATHER[o.weather]}</span></div>` : ""}
          <p>${esc(o.desc)}</p>
          <div class="links">${mapLink(o.link)}${picked ? "" : `<button class="pick-btn">Choose</button>`}</div>
        </div>
      </article>`;
  }
  const foodCard = (o, key, picked) => `
      <article class="card food ${picked ? "chosen" : ""}" data-pick="${key}" data-val="${o.id}">
        <div class="body">
          <h4>${esc(o.name)}</h4>
          <div class="area">${esc(o.tag)}${o.note ? ` · ${esc(o.note)}` : ""}</div>
          <div class="links">${mapLink(o.link, "Google Maps")}${picked ? "" : `<button class="pick-btn">Choose</button>`}</div>
        </div>
      </article>`;
  const fixedCard = (f) => `
    <article class="card chosen fixed">
      ${gallery(f.img)}
      <div class="body"><div class="badges"><span class="badge">${esc(f.tag)}</span></div><h4>${esc(f.name)}</h4><p>${esc(f.desc)}</p></div>
    </article>`;

  function stayLine(d) {
    if (d.type === "fixed") return `<span class="stay-chip"><span>Overnight</span>In the air</span>`;
    const sid = d.type === "move" ? d.to : d.stay;
    const h = stayHotel(sid);
    const label = d.type === "depart" ? "Checking out of" : d.type === "move" ? "Tonight" : "Staying at";
    return `<a class="stay-chip" href="#hotels"><span>${label}</span>${h ? esc(h.name) : `<i>Choose Stay ${stayById(sid).n}</i>`}</a>`;
  }

  const slotHtml = (label, key, opts, chosen, i, opt = {}) => {
    const shown = chosen ? opts.filter((o) => o.id === chosen) : opts;
    const right = chosen ? `<button class="ghost" data-clear="${key}">${opt.removable ? "Remove" : "Change"}</button>` : `<span class="count">${opt.count || opts.length + " options"}</span>`;
    return `
      <div class="slot">
        <div class="slot-head"><h4>${label}</h4>${right}</div>
        ${opt.hint || ""}
        <div class="grid ${opt.food ? "food-grid" : ""} ${chosen ? "picked" : ""}">${shown.map((o) => (opt.food ? foodCard(o, key, !!chosen) : optionCard(o, key, i, !!chosen))).join("")}</div>
      </div>`;
  };

  function renderDays() {
    const totals = DAYS.map((d, i) => dayDriving(d, i));
    const known = totals.filter((t) => t !== null);
    $("#days-total").innerHTML = known.length
      ? `Driving across the trip so far: <b>${fmt(known.reduce((a, b) => a + b, 0))}</b>${known.length < DAYS.length - 1 ? " (days without a plan count as staying put)" : ""}`
      : "";
    $("#daylist").innerHTML = DAYS.map((d, i) => {
      let body = "";
      if (d.fixed) body += `<div class="grid picked">${fixedCard(d.fixed)}</div>`;
      if (d.type !== "fixed") {
        const label = d.type === "move" ? "On the way" : d.type === "arrive" ? "This evening" : d.type === "depart" ? "Last morning" : "The day";
        const hint = !state.picks.length && (d.type === "stay" || d.type === "move")
          ? `<p class="empty-note">Add experiences in <a href="#experiences">section I</a> and they'll show up here, sorted by drive time.</p>` : "";
        body += slotHtml(label, `day:${i}:day`, dayOptions(d), state.days[`${i}:day`], i, { hint });
        const also = alsoOptions(d, i);
        if (also.length) body += slotHtml("Second stop (optional)", `day:${i}:also`, also, state.days[`${i}:also`], i, { removable: true, count: "closest first" });
        if (d.type !== "depart") body += slotHtml("Dinner nearby", `day:${i}:dinner`, dinnerOptions(d), state.days[`${i}:dinner`], i, { food: true, count: "closest first" });
      }
      if (d.fixedEnd) body += `<div class="slot"><div class="slot-head"><h4>Then</h4></div><div class="grid picked">${fixedCard(d.fixedEnd)}</div></div>`;
      const t = totals[i];
      return `
        <div class="day" id="day-${i}">
          <div class="day-head"><div class="day-date">${d.date}</div><h3>${d.title}</h3>${stayLine(d)}</div>
          ${d.blurb ? `<p class="blurb">${d.blurb}</p>` : ""}
          ${t !== null && d.type !== "fixed" ? `<p class="day-drive">${t ? "Driving today " + fmt(t) : "No driving today"}</p>` : ""}
          ${body}
        </div>`;
    }).join("");
  }

  function autoPlan() {
    const h1 = stayHotel("s1"), h2 = stayHotel("s2");
    if (!state.picks.length) { alert("Add some experiences in section I first."); return; }
    if (!h1 || !h2) { alert("Choose both hotels first, so the plan knows where you're sleeping."); return; }
    const hasPlans = DAYS.some((d, i) => ["stay", "move"].includes(d.type) && state.days[`${i}:day`]);
    if (hasPlans && !confirm("Replace your current day plans (not dinners) with the least-driving plan?")) return;
    const plan = planTrip(h1, h2);
    plan.assign.forEach(({ kind, i, list }) => {
      delete state.days[`${i}:also`];
      if (kind === "resort") {
        state.days[`${i}:day`] = "rest";
        if (list[0]) state.days[`${i}:also`] = list[0].id;
      } else if (kind === "move") {
        state.days[`${i}:day`] = list[0] ? list[0].id : "straight";
        if (list[1]) state.days[`${i}:also`] = list[1].id;
      } else { // base1 / base
        state.days[`${i}:day`] = list[0] ? list[0].id : "rest";
        if (list[1]) state.days[`${i}:also`] = list[1].id;
      }
    });
    save(); renderAll();
    const msg = plan.uncovered.length
      ? `Planned, with ${fmt(plan.total)} of driving in total. These didn't fit: ${plan.uncovered.map((p) => p.name).join(", ")}.`
      : `Planned all ${state.picks.length} picks with ${fmt(plan.total)} of driving in total, including both airport drives.`;
    $("#plan-msg").textContent = msg;
    flash(document.getElementById("days-tools"));
  }

  /* ================= IV. storyboard ================= */
  function renderStory() {
    let total = STAYS.length, done = STAYS.filter((s) => state.stays[s.id]).length;
    $("#storyboard").innerHTML = DAYS.map((d, i) => {
      const tiles = [];
      if (d.fixed) tiles.push({ img: d.fixed.img[0], cap: d.fixed.name });
      const sid = d.type === "move" ? d.to : d.stay;
      const h = stayHotel(sid);
      const meals = [];
      if (d.type !== "fixed") {
        total++;
        const v = state.days[`${i}:day`];
        const o = v && dayOptions(d).find((x) => x.id === v);
        if (o) {
          done++;
          resolveImgs(o.img).slice(0, 2).forEach((im, k) => tiles.push({ img: im, cap: k ? "" : o.name }));
          const a = expById(state.days[`${i}:also`]);
          if (a) resolveImgs(a.img).slice(0, 2).forEach((im, k) => tiles.push({ img: im, cap: k ? "" : a.name }));
        } else tiles.push({ todo: d.type === "move" ? "On the way" : "The day" });
        if (d.type !== "depart") {
          total++;
          const fv = state.days[`${i}:dinner`];
          const r = fv && dinnerOptions(d).find((x) => x.id === fv);
          if (r) { done++; meals.push(r); }
        }
      }
      if (h && (d.type === "arrive" || d.type === "move")) tiles.push({ img: h.imgs[0], cap: "Check in: " + h.name, hotel: true });
      if (d.fixedEnd) tiles.push({ img: d.fixedEnd.img[0], cap: d.fixedEnd.name });
      const t = dayDriving(d, i);
      return `
        <div class="story-day">
          <div class="story-date"><b>${d.date}</b><span>${d.title}</span>
            ${h ? `<em><i>Stay</i>${esc(h.name)}</em>` : ""}
            ${meals.map((m) => `<em><i>Dinner</i>${m.link ? `<a href="${m.link}" target="_blank" rel="noopener">${esc(m.name)}</a>` : esc(m.name)}</em>`).join("")}
            ${t !== null && d.type !== "fixed" ? `<em><i>Driving</i>${t ? fmt(t) : "none"}</em>` : ""}
          </div>
          <div class="story-strip">
            ${tiles.map((t) => t.todo
              ? `<div class="tile todo"><span>${esc(t.todo)}<br><small>not chosen yet</small></span></div>`
              : `<figure class="tile ${t.hotel ? "hotel-tile" : ""}"><img src="img/${t.img}.jpg" data-full="img/${t.img}.jpg" alt="" loading="lazy"/><figcaption>${esc(t.cap)}</figcaption></figure>`).join("")}
          </div>
        </div>`;
    }).join("");
    $("#progress-bar").style.width = Math.round((done / total) * 100) + "%";
    $("#progress-text").textContent = `${state.picks.length} experiences · ${done} of ${total} plans chosen`;
  }

  /* ================= floating contents + notes ================= */
  function tocItems() {
    const items = [];
    const n = state.picks.length;
    items.push({ id: "experiences", label: "I. Experiences", done: n > 0, note: n ? `${n} picked` : "none picked", top: true });
    items.push({ id: "hotels", label: "II. Hotels", done: STAYS.every((s) => state.stays[s.id]), top: true });
    STAYS.forEach((st) => {
      const h = stayHotel(st.id);
      items.push({ id: "stay-" + st.id, label: `Stay ${st.n} · ${st.label}`, done: !!h, note: h ? h.name : "not chosen" });
    });
    const dayItems = DAYS.map((d, i) => {
      if (d.type === "fixed") return { id: "day-" + i, label: d.date, done: true, note: d.title };
      const day = !!state.days[`${i}:day`];
      const dinner = d.type === "depart" || !!state.days[`${i}:dinner`];
      const missing = [!day && (d.type === "move" ? "stop" : "plan"), !dinner && "dinner"].filter(Boolean);
      return { id: "day-" + i, label: d.date, done: !missing.length, note: missing.length ? "needs " + missing.join(" & ") : d.title };
    });
    items.push({ id: "days", label: "III. Days", done: dayItems.every((x) => x.done), top: true }, ...dayItems);
    const allDone = items.every((x) => x.done);
    items.push({ id: "story", label: "IV. Journey", done: allDone, note: allDone ? "complete" : "fills in as you choose", top: true });
    return items;
  }
  function renderToc() {
    const items = tocItems();
    const todo = items.filter((x) => !x.done && !x.top).length + (state.picks.length ? 0 : 1);
    $("#toc").innerHTML = items.map((x) => `
      <a href="#${x.id}" data-toc="${x.id}" class="${x.top ? "toc-top" : "toc-sub"} ${x.done ? "done" : "todo"}">
        <span class="mark" aria-label="${x.done ? "complete" : "incomplete"}"></span>
        <span class="t"><span class="l">${esc(x.label)}</span>${x.note ? `<small>${esc(x.note)}</small>` : ""}</span>
      </a>`).join("");
    $("#toc-progress").textContent = todo ? `${todo} to do` : "all set";
    markActive();
  }
  function markActive() {
    const links = [...document.querySelectorAll("#toc a")];
    let current = null;
    links.forEach((a) => {
      const el = document.getElementById(a.dataset.toc);
      if (el && el.getBoundingClientRect().top < 140) current = a;
    });
    links.forEach((a) => a.classList.toggle("active", a === current));
    const box = $("#toc");
    if (current && box.scrollHeight > box.clientHeight) {
      const top = current.offsetTop - box.offsetTop, bottom = top + current.offsetHeight;
      if (top < box.scrollTop + 10) box.scrollTop = top - 40;
      else if (bottom > box.scrollTop + box.clientHeight - 10) box.scrollTop = bottom - box.clientHeight + 40;
    }
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { markActive(); ticking = false; }); } }, { passive: true });
  $("#toc").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-toc]");
    if (!a) return;
    e.preventDefault();
    const el = document.getElementById(a.dataset.toc);
    if (el) scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: "smooth" });
    document.body.classList.remove("rail-open-toc", "rail-open-notes");
  });

  const NOTES_KEY = "madeira2027-notes";
  const notesEl = $("#notes");
  notesEl.value = localStorage.getItem(NOTES_KEY) || "";
  let notesTimer;
  notesEl.addEventListener("input", () => {
    $("#notes-status").textContent = "saving…";
    clearTimeout(notesTimer);
    notesTimer = setTimeout(() => { localStorage.setItem(NOTES_KEY, notesEl.value); $("#notes-status").textContent = "saved"; }, 400);
  });
  $("#fab-toc").addEventListener("click", () => { document.body.classList.toggle("rail-open-toc"); document.body.classList.remove("rail-open-notes"); });
  $("#fab-notes").addEventListener("click", () => { document.body.classList.toggle("rail-open-notes"); document.body.classList.remove("rail-open-toc"); if (document.body.classList.contains("rail-open-notes")) notesEl.focus(); });

  const renderAll = () => { gid = 0; buildDays(); renderExperiences(); renderStays(); renderMap(); renderDays(); renderStory(); renderToc(); };

  /* ================= events ================= */
  document.addEventListener("click", (e) => {
    const sw = e.target.closest("[data-swap]");
    if (sw) {
      e.stopPropagation();
      const g = document.getElementById(sw.dataset.g);
      g.querySelector(".photo.main").outerHTML = photo(sw.dataset.swap, "main");
      g.querySelectorAll(".thumbs img").forEach((t) => t.classList.toggle("on", t === sw));
      return;
    }
    const filt = e.target.closest("[data-filter]");
    if (filt) { state.filter = filt.dataset.filter; save(); renderExperiences(); return; }

    const sp = e.target.closest("[data-split]");
    if (sp) {
      const k = +sp.dataset.split;
      if (k === state.split) return;
      // the move day shifts, so clear plans between arrival and departure
      Object.keys(state.days).forEach((key) => { const i = +key.split(":")[0]; if (i >= 2 && i < DATES.length - 1) delete state.days[key]; });
      state.split = k; save();
      const y = scrollY; renderAll(); scrollTo({ top: y });
      return;
    }
    if (e.target.closest("#auto-plan")) { autoPlan(); return; }

    const tog = e.target.closest("[data-toggle]");
    if (tog) {
      const id = tog.dataset.toggle;
      const adding = !state.picks.includes(id);
      state.picks = adding ? [...state.picks, id] : state.picks.filter((x) => x !== id);
      if (!adding) Object.keys(state.days).forEach((k) => { if (state.days[k] === id) delete state.days[k]; });
      save();
      const y = scrollY; renderAll(); scrollTo({ top: y });
      return;
    }

    // single-choice slots (hotels, day plans, dinners): picking hides the rest, "Change" shows them again
    const clr = e.target.closest("[data-clear]");
    const card = e.target.closest("[data-pick]");
    if (clr || (card && !card.classList.contains("chosen"))) {
      const el = clr || card;
      const boxes = () => [...document.querySelectorAll(".stay, .slot")];
      const idx = boxes().indexOf(el.closest(".stay, .slot"));
      const [scope, ...rest] = (clr ? clr.dataset.clear : card.dataset.pick).split(":");
      const bucket = scope === "stay" ? state.stays : state.days;
      const k = rest.join(":");
      if (clr) delete bucket[k]; else bucket[k] = card.dataset.val;
      // changing a day's main plan resets its second stop
      if (scope === "day" && k.endsWith(":day")) delete state.days[k.replace(":day", ":also")];
      save(); renderAll();
      const again = boxes()[idx];
      if (again) scrollBy({ top: again.getBoundingClientRect().top - 90 });
      return;
    }

    const full = e.target.closest(".chosen .photo.main img, .tile img, .fixed img");
    if (full) { const lb = $("#lightbox"); lb.querySelector("img").src = full.dataset.full || full.src; lb.hidden = false; }
  });
  $("#lightbox").addEventListener("click", () => ($("#lightbox").hidden = true));
  document.addEventListener("keydown", (e) => e.key === "Escape" && ($("#lightbox").hidden = true));
  $("#reset").addEventListener("click", () => {
    if (!confirm("Clear all your picks?")) return;
    state.picks = []; state.stays = {}; state.days = {}; save(); renderAll();
  });

  /* ---------- day / night ---------- */
  const themeBtn = $("#theme-toggle");
  const syncThemeLabel = () => { themeBtn.querySelector(".label").textContent = document.documentElement.dataset.theme === "night" ? "Day" : "Night"; };
  themeBtn.addEventListener("click", () => {
    const night = document.documentElement.dataset.theme !== "night";
    if (night) document.documentElement.dataset.theme = "night"; else delete document.documentElement.dataset.theme;
    localStorage.setItem("madeira2027-theme", night ? "night" : "day");
    syncThemeLabel();
  });
  syncThemeLabel();

  renderAll();
})();
