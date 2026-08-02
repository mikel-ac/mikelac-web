/* ===========================================================
   Mikel Agirrezabalaga · Portfolio — app.js (flujo Proyectos)
   Lee window.CONTENT (content.js) y construye la página.
   =========================================================== */
(function () {
  var C = window.CONTENT;
  if (!C) { document.body.innerHTML = "<p style='color:#fff;font-family:sans-serif;padding:40px'>No se encuentra content.js</p>"; return; }

  var esc = function (s) { return (s == null ? "" : String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); };
  var nl2br = function (s) { return esc(s).replace(/\n/g, "<br>"); };

  // versión de los archivos de vídeo/imagen propios. Subir este número cuando se
  // cambie un loop o un frame de carga obliga al navegador a descargarlos de nuevo
  // (evita que sirva una copia vieja guardada en caché).
  var ASSET_VER = "13";
  function ver(u){
    if (!u) return u;
    if (/^data:/.test(u) || /^https?:/.test(u)) return u; // no tocar dataURL ni externos
    return u + (u.indexOf("?") === -1 ? "?v=" : "&v=") + ASSET_VER;
  }

  // miniatura: la propia (thumb) manda; si no, la de la plataforma en alta calidad
  function thumbOf(p) {
    if (p.thumb) return p.thumb;
    if (p.platform === "youtube") return "https://i.ytimg.com/vi/" + p.videoId + "/maxresdefault.jpg";
    if (p.platform === "vimeo")   return "https://vumbnail.com/" + p.videoId + "_large.jpg";
    return "";
  }
  // url de incrustación para el reproductor
  function embedOf(p) {
    if (p.platform === "youtube") return "https://www.youtube.com/embed/" + p.videoId + "?rel=0&autoplay=1";
    if (p.platform === "vimeo")   return "https://player.vimeo.com/video/" + p.videoId + "?title=0&byline=0&portrait=0&autoplay=1";
    return "";
  }

  var playSvg = '<div class="play"><div class="pc"><div class="pt"></div></div></div>';

  function frameEl(p) {
    return '<div class="frame playable" data-n="' + p.n + '" style="background-image:url(\'' + thumbOf(p) + '\')">' + playSvg + '</div>';
  }
  function txtBlock(p) {
    return '<div class="txt"><div class="meta">' + esc(p.meta) + '</div>' +
           '<h2 class="title">' + esc(p.title) + '</h2>' +
           '<p class="desc">' + nl2br(p.desc) + '</p></div>';
  }

  function twoLineName(name){
    var parts = String(name||"").trim().split(" ");
    if (parts.length < 2) return esc(name);
    return esc(parts[0]) + "<br>" + esc(parts.slice(1).join(" "));
  }

  // --- HOME ---
  // ¿Pantalla estrecha (móvil)? Si es así usamos la versión vertical del loop.
  // Se decide una sola vez al cargar, para no recargar el vídeo al girar/redimensionar.
  var IS_MOBILE = window.matchMedia && window.matchMedia("(max-width:820px)").matches;
  function homeScreen() {
    var h = C.home || {};
    // loop y frame de carga: versión vertical en móvil, horizontal en escritorio.
    // Si algún día no existiera el archivo vertical, cae de nuevo en el horizontal.
    var loopSrc   = IS_MOBILE ? (h.loopMobile   || "assets/loop-mobile.mp4")   : (h.loop   || "");
    var posterSrc = IS_MOBILE ? (h.posterMobile || "assets/poster-mobile.jpg") : (h.poster || "");
    // primera línea: la partimos tras la primera coma para poder forzar el salto
    // ahí en móvil ("...Bilbao," / "trabajando en remoto."), manteniéndola entera en escritorio
    var t1 = h.taglineLine1 || "", ci = t1.indexOf(", "), tagL1;
    if (ci !== -1) tagL1 = '<span class="p1">' + esc(t1.slice(0, ci + 1)) + '</span> <span class="p2">' + esc(t1.slice(ci + 2)) + '</span>';
    else tagL1 = esc(t1);
    return '<section class="screen hero bg-black" data-bg="full">' +
      (posterSrc ? '<div class="poster" style="background-image:url(\'' + ver(posterSrc) + '\')"></div>' : '') +
      '<video autoplay muted loop playsinline ' + (posterSrc ? 'poster="' + ver(posterSrc) + '"' : '') + '><source src="' + ver(loopSrc) + '" type="video/mp4"></video>' +
      '<div class="scrim"></div>' +
      '<div class="home-copy">' +
        '<h1 class="home-name">' + twoLineName(h.name) + '</h1>' +
        '<p class="home-tag"><span class="l1">' + tagL1 + '</span><span class="l2">' + esc(h.taglineLine2) + '</span></p>' +
      '</div>' +
      '<div class="cue"><span>Proyectos</span><span class="ar">&#8595;</span></div>' +
    '</section>';
  }

  // --- INTRO (pantalla 01) ---
  function introScreen(p) {
    return '<section class="screen intro bg-' + (p.bg||"black") + '" data-bg="' + (p.bg||"black") + '" data-n="' + p.n + '">' +
      '<div class="wrap">' +
        '<div class="meta">' + esc(p.meta) + '</div>' +
        '<div class="top">' +
          '<div class="left"><h2 class="title">' + esc(p.title) + '</h2><p class="desc">' + nl2br(p.desc) + '</p></div>' +
          frameEl(p) +
        '</div>' +
        '<div class="aboutwrap"><div class="rule"></div><p class="about">' + esc(p.about) + '</p></div>' +
      '</div>' +
      cueEl() +
    '</section>';
  }

  // --- plantilla normal ---
  function templateScreen(p) {
    var t = String(p.template);
    var bg = (t === "7") ? "full" : (p.bg || "black");
    var inner;
    if (t === "1") inner = '<div class="wrap">' + frameEl(p) + txtBlock(p) + '</div>';
    else if (t === "2") inner = '<div class="wrap">' + txtBlock(p) + frameEl(p) + '</div>';
    else if (t === "3") inner = '<div class="wrap">' + frameEl(p) +
        '<div class="below"><div class="tl"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2></div><p class="desc">' + nl2br(p.desc) + '</p></div></div>';
    else if (t === "5") inner = '<div class="wrap"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2>' + frameEl(p) + '<p class="desc">' + nl2br(p.desc) + '</p></div>';
    else if (t === "6") inner = '<div class="wrap"><div class="tcell"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2></div>' + frameEl(p) + '<p class="desc">' + nl2br(p.desc) + '</p></div>';
    else if (t === "7") inner =
        '<div class="full playable" data-n="' + p.n + '" style="background-image:url(\'' + thumbOf(p) + '\')"></div>' +
        '<div class="scrim"></div>' + playSvgFull(p) +
        '<div class="cap"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2><p class="desc">' + nl2br(p.desc) + '</p></div>';
    else inner = '<div class="wrap">' + frameEl(p) + txtBlock(p) + '</div>';

    return '<section class="screen t-' + t + ' bg-' + bg + '" data-bg="' + bg + '" data-n="' + p.n + '">' + inner + cueEl() + '</section>';
  }
  function playSvgFull(p){ return '<div class="play"><div class="pc"><div class="pt"></div></div></div>'; }

  function cueEl(){ return '<div class="cue"><span class="lab"></span><span class="ar">&#8595;</span></div>'; }

  // --- PIE ---
  function footScreen() {
    return '<section class="screen foot" data-bg="red" id="contacto">' +
      contactBlock() +
    '</section>';
  }

  // resalta en negrita los términos indicados dentro de un texto
  function boldHighlights(text, terms){
    var out = esc(text);
    (terms || []).forEach(function(t){
      var et = esc(t);
      out = out.split(et).join("<strong>" + et + "</strong>");
    });
    return out.replace(/\n/g, "<br>");   // respeta los saltos de línea del texto
  }

  // --- VISTA CORPORATIVO ---
  function buildCorp(){
    var k = C.corporativo || {};
    var el = document.getElementById("view-corp");
    if (!el) return;
    var hot = "";
    if (k.link){
      // zona pulsable centrada: solo ahí se activa el overlay y el enlace al canal
      hot = '<a class="chot" href="' + esc(k.link) + '" target="_blank" rel="noopener" aria-label="' + esc(k.buttonLabel || "Ver canal") + '">' +
              '<div class="cveil">' +
                '<div class="pc"><div class="pt"></div></div>' +
                '<div class="mlabel">' + esc(k.buttonLabel || "Ver canal") + '</div>' +
              '</div></a>';
    }
    el.innerHTML =
      '<video class="cvid" autoplay muted loop playsinline poster="' + ver("assets/corp_poster.jpg") + '">' +
        '<source src="' + ver("assets/corp.mp4") + '" type="video/mp4"></video>' +
      '<div class="cscrim"></div>' +
      '<div class="ctext">' +
        '<h2 class="ptitle">' + esc(k.title || "Vídeos corporativos") + '</h2>' +
        '<p class="ptext">' + boldHighlights(k.text || "", k.highlight) + '</p>' +
      '</div>' +
      hot;
  }

  // --- VISTA VISUALES ---
  function buildVis(){
    var v = C.visuales || {};
    var el = document.getElementById("view-vis");
    if (el) el.innerHTML =
      (v.poster ? '<div class="poster" style="background-image:url(\'' + ver(v.poster) + '\')"></div>' : '') +
      (v.loop ? '<video muted loop playsinline ' + (v.poster ? 'poster="' + ver(v.poster) + '"' : '') + '><source src="' + ver(v.loop) + '" type="video/mp4"></video>' : '') +
      '<div class="scrim"></div>' +
      '<div class="vcopy">' +
        '<h2 class="vtitle">' + esc(v.title || "Visuales") + '</h2>' +
        '<p class="vtext">' + boldHighlights(v.text || "", v.highlight) + '</p>' +
      '</div>';
  }

  // ---------- construir ----------
  var currentView = "proyectos";
  var projects = (C.projects || []).filter(function(p){ return !p.hidden; }).slice().sort(function(a,b){ return (a.n||0)-(b.n||0); });
  var html = homeScreen();
  projects.forEach(function (p) { html += (p.intro || p.template === "intro") ? introScreen(p) : templateScreen(p); });
  html += footScreen();

  var scroller = document.getElementById("scroller");
  scroller.innerHTML = html;
  buildCorp();
  buildVis();
  buildContactOverlay();

  // ---------- bloque de contacto compartido (overlay + pie de Proyectos) ----------
  function contactBlock(){
    var c = C.contact || {}, hm = C.home || {};
    var MAIL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2.5" y="5" width="19" height="14" rx="1.5"/><path d="M3 6l9 7 9-7"/></svg>';
    var IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1.15" fill="currentColor" stroke="none"/></svg>';
    var rows = "";
    if (c.email) rows += '<a class="lkrow" href="mailto:' + esc(c.email) + '"><span class="mini">' + MAIL + '</span><span class="val">' + esc(c.email) + '</span></a>';
    if (c.instagramUrl || c.instagram) {
      // el icono ya identifica la red, así que mostramos el usuario sin la arroba
      var ig = (c.instagram || "Instagram").replace(/^@/, "");
      rows += '<a class="lkrow" href="' + esc(c.instagramUrl || "#") + '" target="_blank" rel="noopener"><span class="mini">' + IG + '</span><span class="val">' + esc(ig) + '</span></a>';
    }
    // la primera frase rompe siempre tras la coma ("...Bilbao," / "trabajando en remoto."),
    // igual que en la home, para que la lectura sea natural en cualquier pantalla
    var t1 = hm.taglineLine1 || "", ci = t1.indexOf(", "), l1;
    if (ci !== -1) l1 = '<span class="p1">' + esc(t1.slice(0, ci + 1)) + '</span> <span class="p2">' + esc(t1.slice(ci + 2)) + '</span>';
    else l1 = esc(t1);
    return '<div class="co-id">' +
        '<div class="co-name">' + twoLineName(hm.name) + '</div>' +
        '<div class="co-about"><p>' + l1 + '</p><p>' + esc(hm.taglineLine2) + '</p></div>' +
      '</div>' +
      '<div class="co-foot">' + rows + '</div>';
  }

  // ---------- overlay de contacto ----------
  function buildContactOverlay(){
    var box = document.getElementById("coLinks"); if (!box) return;
    box.innerHTML = contactBlock();
  }
  var contactOv = document.getElementById("contactOv");
  function openContact(){ if (contactOv) contactOv.classList.add("open"); }
  function closeContact(){ if (contactOv) contactOv.classList.remove("open"); }
  if (contactOv){
    contactOv.querySelector(".co-close").addEventListener("click", closeContact);
    contactOv.addEventListener("click", function(e){ if (e.target === contactOv) closeContact(); });
  }

  // Si algún YouTube no tiene miniatura en máxima resolución, caemos a una válida
  function fixYouTubeThumbs(){
    var els = document.querySelectorAll(".frame, .full, .poster");
    Array.prototype.forEach.call(els, function(elm){
      var bg = elm.style.backgroundImage || "";
      var m = bg.match(/i\.ytimg\.com\/vi\/([^\/]+)\/maxresdefault\.jpg/);
      if (!m) return;
      var id = m[1], probe = new Image();
      probe.onload = function(){ if (probe.naturalWidth <= 120) elm.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')"; };
      probe.onerror = function(){ elm.style.backgroundImage = "url('https://i.ytimg.com/vi/" + id + "/hqdefault.jpg')"; };
      probe.src = "https://i.ytimg.com/vi/" + id + "/maxresdefault.jpg";
    });
  }
  fixYouTubeThumbs();

  // nombre en cabecera y menú
  document.querySelectorAll("[data-brand]").forEach(function(e){ e.textContent = (C.home && C.home.name) || ""; });

  // etiquetas + clic del indicador inferior: lleva a la siguiente pantalla
  var screens = Array.prototype.slice.call(scroller.querySelectorAll(".screen"));
  screens.forEach(function (sc) {
    var cueWrap = sc.querySelector(".cue");
    if (!cueWrap) return;
    var idx = screens.indexOf(sc);
    var next = screens[idx + 1];
    if (!next) { cueWrap.classList.add("hidden"); return; }
    var lab = cueWrap.querySelector(".lab");
    if (lab) lab.textContent = next.classList.contains("foot") ? "Contacto" : "Siguiente proyecto";
    cueWrap.classList.add("clickable");
    cueWrap.addEventListener("click", function(){ next.scrollIntoView({ behavior: "smooth" }); });
  });

  // ---------- animación de entrada (solo añade .in) ----------
  var vh = function(){ return window.innerHeight; };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting && en.intersectionRatio > 0.55) en.target.classList.add("in");
    });
  }, { threshold: [0, 0.55, 1] });
  screens.forEach(function (s) { io.observe(s); });

  // ---------- cabecera: color según la pantalla que ocupa el CENTRO de la vista ----------
  function updateHeader(){
    if (currentView !== "proyectos") return;
    var cy = vh() * 0.5, active = null;
    for (var i = 0; i < screens.length; i++){
      var r = screens[i].getBoundingClientRect();
      if (r.top <= cy && r.bottom > cy){ active = screens[i]; break; }
    }
    if (active){
      var bg = active.getAttribute("data-bg") || "black";
      if (!document.body.classList.contains("hd-" + bg)){
        document.body.classList.remove("hd-black","hd-red","hd-full");
        document.body.classList.add("hd-" + bg);
      }
    }
    document.body.classList.toggle("scrolled", scroller.scrollTop > vh() * 0.6);
  }
  scroller.addEventListener("scroll", updateHeader, { passive:true });
  window.addEventListener("resize", updateHeader);
  updateHeader();

  // ---------- navegación entre vistas ----------
  function goTo(sel) {
    var el = scroller.querySelector(sel);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }
  var visVideo = document.querySelector("#view-vis video");
  function setHd(bg){
    document.body.classList.remove("hd-black","hd-red","hd-full");
    document.body.classList.add("hd-" + bg);
  }
  function showView(name){
    currentView = name;
    document.body.classList.remove("v-proyectos","v-corp","v-vis");
    document.body.classList.add("v-" + name);
    // color de cabecera por vista
    if (name === "corp"){ setHd("black"); document.body.classList.add("scrolled"); }
    else if (name === "vis"){ setHd("full"); document.body.classList.add("scrolled"); }
    else { updateHeader(); }
    // loop de visuales solo activo en su vista
    if (visVideo){ if (name === "vis"){ try{ visVideo.play(); }catch(e){} } else { try{ visVideo.pause(); }catch(e){} } }
    window.scrollTo(0,0);
  }
  function toProyectos(then){
    showView("proyectos");
    if (then) setTimeout(then, 30);
  }
  document.querySelectorAll("[data-top]").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); toProyectos(function(){ scroller.scrollTo({ top:0, behavior:"smooth" }); }); closeMenu(); }); });
  document.querySelectorAll("[data-nav='proyectos']").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); toProyectos(function(){ goTo(".screen:nth-of-type(2)"); }); closeMenu(); }); });
  document.querySelectorAll("[data-nav='corporativo'],[data-go='corporativo']").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); showView("corp"); closeMenu(); }); });
  document.querySelectorAll("[data-nav='visuales'],[data-go='visuales']").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); showView("vis"); closeMenu(); }); });
  document.querySelectorAll("[data-nav='contacto']").forEach(function(a){ a.addEventListener("click", function(e){ e.preventDefault(); closeMenu(); openContact(); }); });

  // ---------- menú móvil ----------
  var overlay = document.querySelector(".overlay");
  function openMenu(){ overlay.classList.add("open"); }
  function closeMenu(){ overlay.classList.remove("open"); }
  var burger = document.querySelector(".hd .burger");
  if (burger) burger.addEventListener("click", openMenu);
  var closeBtn = document.querySelector(".overlay .close");
  if (closeBtn) closeBtn.addEventListener("click", closeMenu);
  var env = document.querySelector(".hd .env");
  if (env) env.addEventListener("click", function(e){ e.preventDefault(); openContact(); });

  // ---------- reproductor ----------
  var modal = document.querySelector(".modal");
  var vidBox = modal.querySelector(".vid");
  var mt = modal.querySelector(".mt");
  var mdesc = modal.querySelector(".mdesc");
  var moreBtn = modal.querySelector(".more");
  function byN(n){ return projects.filter(function(p){ return String(p.n) === String(n); })[0]; }
  function openPlayer(n) {
    var p = byN(n); if (!p) return;
    mt.textContent = p.title;
    // descripción + control "Ver más" (solo si desborda 2 líneas)
    if (p.desc) {
      mdesc.innerHTML = nl2br(p.desc);
      mdesc.style.display = "";
      mdesc.classList.add("clamp");
      moreBtn.textContent = "Ver más";
      moreBtn.classList.remove("show");
    } else {
      mdesc.innerHTML = ""; mdesc.style.display = "none"; moreBtn.classList.remove("show");
    }
    vidBox.innerHTML = '<iframe src="' + embedOf(p) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
    modal.classList.add("open");
    // tras pintar, comprobar si la descripción se corta para mostrar "Ver más"
    if (p.desc) requestAnimationFrame(function(){
      if (mdesc.scrollHeight - mdesc.clientHeight > 2) moreBtn.classList.add("show");
    });
  }
  function closePlayer(){ modal.classList.remove("open"); vidBox.innerHTML = ""; }
  if (moreBtn) moreBtn.addEventListener("click", function(){
    var clamped = mdesc.classList.toggle("clamp");
    moreBtn.textContent = clamped ? "Ver más" : "Ver menos";
  });
  scroller.addEventListener("click", function (e) {
    var pz = e.target.closest(".playable");
    if (pz) { openPlayer(pz.getAttribute("data-n")); }
  });
  modal.querySelector(".x").addEventListener("click", closePlayer);
  modal.addEventListener("click", function(e){ if (e.target === modal) closePlayer(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") { closePlayer(); closeContact(); } });

  // marca primera pantalla como "in" desde el principio
  if (screens[0]) { screens[0].classList.add("in"); }
  document.body.classList.add("v-proyectos");
  updateHeader();
})();
