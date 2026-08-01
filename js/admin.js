/* ===========================================================
   Admin · Mikel Agirrezabalaga
   Edita una copia de window.CONTENT y descarga content.js.
   (Parte 1: Proyectos + cargar/descargar. El resto, en la siguiente parte.)
   =========================================================== */
(function () {
  var DATA = window.CONTENT ? JSON.parse(JSON.stringify(window.CONTENT)) : { projects: [] };
  if (!DATA.projects) DATA.projects = [];
  var sel = DATA.projects.length ? 0 : -1;

  var TEMPLATES = [
    ["1", "1 · Frame izquierda"],
    ["2", "2 · Frame derecha"],
    ["3", "3 · Centrado + texto"],
    ["5", "4 · Centrado total"],
    ["6", "5 · Asimétrico"],
    ["7", "6 · Pantalla completa"]
  ];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var toast = function (msg) {
    var t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove("show"); }, 2200);
  };
  var esc = function (s) { return (s == null ? "" : String(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); };
  var nl2br = function (s) { return esc(s).replace(/\n/g, "<br>"); };
  var previewMode = "desktop";
  var pvTimer;
  function schedulePreview(){ clearTimeout(pvTimer); pvTimer = setTimeout(refreshPreview, 350); }

  // markup de una pantalla de proyecto (refleja el de la web pública)
  function previewMarkup(p){
    var t = String(p.template);
    var isIntro = (p.intro === true || t === "intro");
    var thumb = p.thumb || autoThumb(p);
    var PLAY = '<div class="play"><div class="pc"><div class="pt"></div></div></div>';
    function frame(){ return '<div class="frame" style="background-image:url(\'' + thumb + '\')">' + PLAY + '</div>'; }
    function txt(){ return '<div class="txt"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2><p class="desc">' + nl2br(p.desc) + '</p></div>'; }
    if (isIntro){
      return '<section class="screen intro in bg-' + (p.bg||"black") + '"><div class="wrap"><div class="meta">' + esc(p.meta) + '</div>' +
        '<div class="top"><div class="left"><h2 class="title">' + esc(p.title) + '</h2><p class="desc">' + nl2br(p.desc) + '</p></div>' +
        '<div class="frame" style="background-image:url(\'' + thumb + '\')">' + PLAY + '</div></div>' +
        '<div class="aboutwrap"><div class="rule"></div><p class="about">' + esc(p.about||"") + '</p></div></div></section>';
    }
    var bg = (t === "7") ? "full" : (p.bg||"black");
    var inner;
    if (t === "1") inner = '<div class="wrap">' + frame() + txt() + '</div>';
    else if (t === "2") inner = '<div class="wrap">' + txt() + frame() + '</div>';
    else if (t === "3") inner = '<div class="wrap">' + frame() + '<div class="below"><div class="tl"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2></div><p class="desc">' + nl2br(p.desc) + '</p></div></div>';
    else if (t === "5") inner = '<div class="wrap"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2>' + frame() + '<p class="desc">' + nl2br(p.desc) + '</p></div>';
    else if (t === "6") inner = '<div class="wrap"><div class="tcell"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2></div>' + frame() + '<p class="desc">' + nl2br(p.desc) + '</p></div>';
    else if (t === "7") inner = '<div class="full" style="background-image:url(\'' + thumb + '\')"></div><div class="scrim"></div>' + PLAY + '<div class="cap"><div class="meta">' + esc(p.meta) + '</div><h2 class="title">' + esc(p.title) + '</h2><p class="desc">' + nl2br(p.desc) + '</p></div>';
    else inner = '<div class="wrap">' + frame() + txt() + '</div>';
    return '<section class="screen t-' + t + ' in bg-' + bg + '">' + inner + '</section>';
  }
  function buildPreviewDoc(p){
    var dir = location.href.replace(/[^\/]*$/, "");
    // En modo Móvil forzamos el icono de play (el navegador trata la previa como
    // "escritorio" y lo escondería, pero en el móvil real sí se ve).
    var mobilePlay = previewMode === "mobile"
      ? '<style>.play{ display:flex !important; }</style>' : '';
    return '<!doctype html><html><head><meta charset="utf-8"><base href="' + dir + '">' +
      '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
      '<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,300;1,6..72,400&display=swap" rel="stylesheet">' +
      '<link rel="stylesheet" href="css/styles.css">' +
      '<style>html,body{height:100%;margin:0;background:#000;overflow:hidden}</style>' + mobilePlay + '</head><body>' +
      previewMarkup(p) + '</body></html>';
  }
  function refreshPreview(){
    if (sel < 0 || !DATA.projects[sel]) return;
    var frame = document.getElementById("pvframe"), stage = document.getElementById("pvstage");
    if (!frame || !stage) return;
    var logicalW = previewMode === "mobile" ? 390 : 1280;
    var logicalH = previewMode === "mobile" ? 800 : 760;
    frame.style.width = logicalW + "px"; frame.style.height = logicalH + "px";
    frame.srcdoc = buildPreviewDoc(DATA.projects[sel]);
    var sw = stage.clientWidth || 600;
    var scale = sw / logicalW;
    frame.style.transform = "scale(" + scale + ")";
    frame.style.left = previewMode === "mobile" ? ((sw - logicalW * scale) / 2) + "px" : "0px";
    stage.style.height = (logicalH * scale) + "px";
  }

  function detectVideo(input) {
    input = (input || "").trim(); var m;
    if (m = input.match(/vimeo\.com\/(?:video\/)?(\d+)/)) return { platform: "vimeo", id: m[1] };
    if (m = input.match(/youtu\.be\/([\w-]+)/)) return { platform: "youtube", id: m[1] };
    if (m = input.match(/[?&]v=([\w-]+)/)) return { platform: "youtube", id: m[1] };
    if (m = input.match(/youtube\.com\/embed\/([\w-]+)/)) return { platform: "youtube", id: m[1] };
    if (/^\d+$/.test(input)) return { platform: "vimeo", id: input };
    if (/^[\w-]{6,}$/.test(input)) return { platform: "youtube", id: input };
    return { platform: "", id: "" };
  }
  function autoThumb(p) {
    if (p.platform === "youtube") return "https://i.ytimg.com/vi/" + p.videoId + "/maxresdefault.jpg";
    if (p.platform === "vimeo")   return "https://vumbnail.com/" + p.videoId + "_large.jpg";
    return "";
  }
  function videoUrl(p) {
    if (p.platform === "youtube") return "https://youtu.be/" + p.videoId;
    if (p.platform === "vimeo")   return "https://vimeo.com/" + p.videoId;
    return "";
  }

  var EYE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  var EYEOFF = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 3l18 18"/><path d="M10.6 6.2A10.8 10.8 0 0 1 12 5c7 0 10.5 7 10.5 7a17 17 0 0 1-3.2 3.9M6.2 7.2A16.9 16.9 0 0 0 1.5 12S5 19 12 19c1.2 0 2.3-.2 3.3-.5"/></svg>';

  // ---------- lista ----------
  function renderList() {
    var ol = $("#plist"); ol.innerHTML = "";
    DATA.projects.forEach(function (p, i) {
      var li = document.createElement("li");
      li.className = "pitem" + (i === sel ? " sel" : "") + (p.hidden ? " hidden" : "");
      li.setAttribute("draggable", "true");
      li.dataset.i = i;
      li.innerHTML =
        '<span class="grip" title="Arrastrar">⋮⋮</span>' +
        '<span class="num">' + (i + 1) + '</span>' +
        '<span class="nm">' + esc(p.title || "(sin título)") + '<small>' + esc(p.meta || "") + '</small></span>' +
        '<button class="visbtn" data-vis title="' + (p.hidden ? "Oculto — pulsa para mostrar" : "Visible — pulsa para ocultar") + '">' + (p.hidden ? EYEOFF : EYE) + '</button>' +
        '<span class="arrows"><button data-up title="Subir">▲</button><button data-down title="Bajar">▼</button></span>';
      li.addEventListener("click", function (e) {
        if (e.target.closest(".arrows") || e.target.closest("[data-vis]")) return;
        sel = i; render();
      });
      li.querySelector("[data-vis]").addEventListener("click", function (e) { e.stopPropagation(); p.hidden = !p.hidden; render(); });
      li.querySelector("[data-up]").addEventListener("click", function (e) { e.stopPropagation(); move(i, -1); });
      li.querySelector("[data-down]").addEventListener("click", function (e) { e.stopPropagation(); move(i, 1); });
      // drag & drop
      li.addEventListener("dragstart", function (e) { dragFrom = i; li.classList.add("drag"); e.dataTransfer.effectAllowed = "move"; });
      li.addEventListener("dragend", function () { li.classList.remove("drag"); });
      li.addEventListener("dragover", function (e) { e.preventDefault(); });
      li.addEventListener("drop", function (e) { e.preventDefault(); dropOn(i); });
      ol.appendChild(li);
    });
  }
  var dragFrom = -1;
  function dropOn(to) {
    if (dragFrom < 0 || dragFrom === to) return;
    var it = DATA.projects.splice(dragFrom, 1)[0];
    DATA.projects.splice(to, 0, it);
    sel = to; dragFrom = -1; renumber(); render();
  }
  function move(i, dir) {
    var j = i + dir;
    if (j < 0 || j >= DATA.projects.length) return;
    var tmp = DATA.projects[i]; DATA.projects[i] = DATA.projects[j]; DATA.projects[j] = tmp;
    sel = j; renumber(); render();
  }
  function renumber() { DATA.projects.forEach(function (p, i) { p.n = i + 1; }); }

  // ---------- formulario ----------
  function field(label, inputHtml, sub) {
    return '<div class="field"><label>' + label + '</label>' + inputHtml + (sub ? '<div class="sub">' + sub + '</div>' : '') + '</div>';
  }
  function renderForm() {
    var col = $("#formCol");
    if (sel < 0 || !DATA.projects[sel]) { col.innerHTML = '<p class="empty">Selecciona un proyecto de la lista para editarlo.</p>'; return; }
    var p = DATA.projects[sel];
    var isIntro = (p.intro === true || p.template === "intro");

    var tplOptions = TEMPLATES.map(function (t) {
      return '<option value="' + t[0] + '"' + (String(p.template) === t[0] ? " selected" : "") + '>' + t[1] + '</option>';
    }).join("");

    col.innerHTML =
      '<div class="preview">' +
        '<div class="pvbar"><span class="pvlabel">Previsualización</span>' +
          '<span class="seg"><button id="pvDesktop" class="on">Escritorio</button><button id="pvMobile">Móvil</button></span></div>' +
        '<div class="pvstage" id="pvstage"><iframe id="pvframe" title="Previsualización"></iframe></div>' +
        '<div class="pvnote">Muestra el frame fijo (no el vídeo). Es una previa aproximada del diseño.</div>' +
      '</div>' +

      '<div class="formhead"><h2>Proyecto ' + (sel + 1) + '</h2>' +
        '<button class="btn danger small" id="delProject">Borrar proyecto</button></div>' +

      '<div class="checkrow"><input type="checkbox" id="f_visible"' + (p.hidden ? "" : " checked") + '>' +
        '<label for="f_visible">Visible en la web</label></div>' +

      field("Título", '<input type="text" id="f_title" value="' + esc(p.title) + '">') +
      field("Metadato", '<input type="text" id="f_meta" value="' + esc(p.meta) + '">', "Ej.: Videoclip, Pieza personal, Teaser…") +
      field("Descripción", '<textarea id="f_desc">' + esc(p.desc) + '</textarea>') +

      field("Enlace del vídeo (Vimeo o YouTube)",
        '<input type="text" id="f_url" value="' + esc(videoUrl(p)) + '" placeholder="https://vimeo.com/… o https://youtu.be/…">',
        'Detecta la plataforma automáticamente.') +
      '<div class="detect" id="detect"></div>' +

      '<div class="checkrow"><input type="checkbox" id="f_intro"' + (isIntro ? " checked" : "") + '>' +
        '<label for="f_intro">Pantalla intro especial (con texto «About»)</label></div>' +

      (isIntro
        ? field("Texto «About» (solo en la intro)", '<textarea id="f_about">' + esc(p.about || "") + '</textarea>')
        : field("Plantilla", '<select id="f_template">' + tplOptions + '</select>')) +

      '<div class="row2">' +
        field("Fondo", '<select id="f_bg"><option value="black"' + (p.bg !== "red" ? " selected" : "") + '>Negro</option><option value="red"' + (p.bg === "red" ? " selected" : "") + '>Rojo</option></select>',
          'En «Pantalla completa» el fondo es el propio frame.') +
        field("&nbsp;", "") +
      '</div>' +

      field("Miniatura propia",
        '<div class="thumbrow">' +
          '<label class="btn small" for="f_thumbfile">Subir imagen…</label>' +
          '<input id="f_thumbfile" type="file" accept="image/*" hidden>' +
          '<button class="btn small ghost" id="f_thumbclear" type="button">Quitar</button>' +
        '</div>' +
        '<input type="text" id="f_thumb" value="' + (p.thumb && /^data:/.test(p.thumb) ? "(imagen subida)" : esc(p.thumb || "")) + '" placeholder="…o pega una URL (opcional)">',
        'Si pones una imagen propia, tiene prioridad sobre la de Vimeo/YouTube. Lo ideal es 16:9 (p. ej. 1920×1080).') +
      '<div class="thumbprev" id="thumbprev"></div><div class="thumbinfo" id="thumbinfo"></div>';

    // listeners
    bind("#f_title", "title");
    bind("#f_meta", "meta");
    bind("#f_desc", "desc");
    var tt = $("#f_thumb"); if (tt) tt.addEventListener("input", function(){ if (tt.value === "(imagen subida)") return; p.thumb = tt.value; updateThumbPrev(); updateThumbInfo(); schedulePreview(); });
    var tf = $("#f_thumbfile"); if (tf) tf.addEventListener("change", onThumbFile);
    var tc = $("#f_thumbclear"); if (tc) tc.addEventListener("click", function(){ p.thumb = ""; var ti=$("#f_thumb"); if(ti) ti.value=""; updateThumbPrev(); updateThumbInfo(); refreshPreview(); });
    var bg = $("#f_bg"); if (bg) bg.addEventListener("change", function () { p.bg = bg.value; refreshPreview(); });
    var tpl = $("#f_template"); if (tpl) tpl.addEventListener("change", function () { p.template = tpl.value; refreshPreview(); });
    var about = $("#f_about"); if (about) about.addEventListener("input", function () { p.about = about.value; schedulePreview(); });

    var vis = $("#f_visible"); if (vis) vis.addEventListener("change", function () { p.hidden = !vis.checked; renderList(); });

    // toggle escritorio / móvil de la previa
    var pd = $("#pvDesktop"), pm = $("#pvMobile");
    if (pd) pd.addEventListener("click", function(){ previewMode = "desktop"; pd.classList.add("on"); pm.classList.remove("on"); refreshPreview(); });
    if (pm) pm.addEventListener("click", function(){ previewMode = "mobile"; pm.classList.add("on"); pd.classList.remove("on"); refreshPreview(); });

    $("#f_url").addEventListener("input", function () {
      var d = detectVideo(this.value);
      p.platform = d.platform; p.videoId = d.id;
      updateDetect(); updateThumbPrev(); schedulePreview();
    });
    $("#f_intro").addEventListener("change", function () {
      if (this.checked) { p.intro = true; p.template = "intro"; if (p.about == null) p.about = ""; }
      else { p.intro = false; if (p.template === "intro") p.template = "1"; }
      render();
    });
    $("#delProject").addEventListener("click", function () {
      if (!confirm("¿Borrar este proyecto? No se puede deshacer (hasta que recargues sin descargar).")) return;
      DATA.projects.splice(sel, 1); sel = Math.min(sel, DATA.projects.length - 1); renumber(); render();
      toast("Proyecto borrado");
    });

    updateDetect(); updateThumbPrev(); updateThumbInfo();
    setTimeout(refreshPreview, 0);

    function bind(selector, key, after) {
      var el = $(selector); if (!el) return;
      el.addEventListener("input", function () { p[key] = el.value; if (after) after(); renderListSoft(); schedulePreview(); });
    }
    function updateDetect() {
      var d = $("#detect");
      if (p.platform) d.innerHTML = 'Detectado: <b>' + p.platform + '</b> · id <b>' + esc(p.videoId) + '</b>';
      else d.innerHTML = '<span style="color:#888">Pega un enlace de Vimeo o YouTube.</span>';
    }
    function updateThumbPrev() {
      var url = p.thumb || autoThumb(p);
      $("#thumbprev").style.backgroundImage = url ? "url('" + url + "')" : "none";
    }
    function updateThumbInfo() {
      var el = $("#thumbinfo"); if (!el) return;
      if (p.thumb && /^data:/.test(p.thumb)) {
        var kb = Math.round(p.thumb.length * 0.75 / 1024);
        el.innerHTML = 'Imagen propia incrustada · ~' + kb + ' KB' + (kb > 600 ? ' <span style="color:#ff9b3d">(algo pesada)</span>' : '');
      } else if (p.thumb) {
        el.textContent = 'Miniatura propia por URL.';
      } else {
        el.textContent = 'Usando la miniatura de ' + (p.platform || 'la plataforma') + '.';
      }
    }
    function onThumbFile(e) {
      var file = e.target.files && e.target.files[0]; if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          // reescalo a un máximo de 1920px de ancho para no inflar el content.js
          var maxW = 1920, scale = Math.min(1, maxW / img.naturalWidth);
          var w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
          var cv = document.createElement("canvas"); cv.width = w; cv.height = h;
          cv.getContext("2d").drawImage(img, 0, 0, w, h);
          p.thumb = cv.toDataURL("image/jpeg", 0.82);
          var ti = $("#f_thumb"); if (ti) ti.value = "(imagen subida)";
          updateThumbPrev(); updateThumbInfo(); refreshPreview();
          toast("Miniatura actualizada");
        };
        img.onerror = function () { alert("No se pudo leer la imagen."); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }
  function renderListSoft() {
    // actualiza solo el texto del item seleccionado sin recrear toda la lista
    var li = $('.pitem[data-i="' + sel + '"]'); if (!li) return;
    var p = DATA.projects[sel];
    li.querySelector(".nm").innerHTML = esc(p.title || "(sin título)") + '<small>' + esc(p.meta || "") + '</small>';
  }

  // ---------- OTROS: Visuales, Corporativo, Home, Contacto ----------
  function arr2str(a){ return (a||[]).join(", "); }
  function str2arr(s){ return (s||"").split(",").map(function(x){ return x.trim(); }).filter(Boolean); }

  function renderOtros(){
    var col = document.getElementById("otrosCol"); if (!col) return;
    var v = DATA.visuales || (DATA.visuales = {});
    var k = DATA.corporativo || (DATA.corporativo = {});
    var h = DATA.home || (DATA.home = {});
    var c = DATA.contact || (DATA.contact = {});

    col.innerHTML =
      '<div class="ocard"><h3>Visuales</h3>' +
        field("Título", '<input type="text" id="v_title" value="' + esc(v.title) + '">') +
        field("Texto", '<textarea id="v_text">' + esc(v.text) + '</textarea>') +
        field("Nombres a destacar (separados por comas)", '<input type="text" id="v_hl" value="' + esc(arr2str(v.highlight)) + '">', "Se mostrarán en negrita dentro del texto.") +
        '<div class="row2">' +
          field("Loop de fondo (ruta)", '<input type="text" id="v_loop" value="' + esc(v.loop) + '" placeholder="assets/visuales.mp4">') +
          field("Frame de carga (ruta)", '<input type="text" id="v_poster" value="' + esc(v.poster) + '" placeholder="assets/visuales_poster.jpg">') +
        '</div>' +
      '</div>' +

      '<div class="ocard"><h3>Corporativo</h3>' +
        field("Título", '<input type="text" id="k_title" value="' + esc(k.title) + '">') +
        field("Texto", '<textarea id="k_text">' + esc(k.text) + '</textarea>') +
        field("Nombres a destacar (separados por comas)", '<input type="text" id="k_hl" value="' + esc(arr2str(k.highlight)) + '">') +
        '<div class="row2">' +
          field("Texto del botón", '<input type="text" id="k_btn" value="' + esc(k.buttonLabel) + '">') +
          field("Enlace del botón", '<input type="text" id="k_link" value="' + esc(k.link) + '" placeholder="https://www.youtube.com/@…">') +
        '</div>' +
      '</div>' +

      '<div class="ocard"><h3>Home (portada)</h3>' +
        field("Nombre", '<input type="text" id="h_name" value="' + esc(h.name) + '">', "Se parte en dos líneas (nombre / apellido) automáticamente.") +
        field("Frase, línea 1", '<input type="text" id="h_t1" value="' + esc(h.taglineLine1) + '">') +
        field("Frase, línea 2", '<input type="text" id="h_t2" value="' + esc(h.taglineLine2) + '">') +
        '<div class="row2">' +
          field("Loop de portada (ruta)", '<input type="text" id="h_loop" value="' + esc(h.loop) + '" placeholder="assets/loop.mp4">') +
          field("Frame de carga (ruta)", '<input type="text" id="h_poster" value="' + esc(h.poster) + '" placeholder="assets/poster.jpg">') +
        '</div>' +
      '</div>' +

      '<div class="ocard"><h3>Contacto</h3>' +
        '<div class="row2">' +
          field("Email", '<input type="text" id="c_email" value="' + esc(c.email) + '">') +
          field("Instagram (texto)", '<input type="text" id="c_ig" value="' + esc(c.instagram) + '" placeholder="@mikel.ac">') +
        '</div>' +
        '<div class="row2">' +
          field("Instagram (URL)", '<input type="text" id="c_igurl" value="' + esc(c.instagramUrl) + '" placeholder="https://instagram.com/…">') +
          field("Vimeo (URL)", '<input type="text" id="c_vimeo" value="' + esc(c.vimeoUrl) + '" placeholder="https://vimeo.com/…">') +
        '</div>' +
      '</div>';

    function b(id, obj, key, arr){ var el = $(id); if (el) el.addEventListener("input", function(){ obj[key] = arr ? str2arr(el.value) : el.value; }); }
    b("#v_title",v,"title"); b("#v_text",v,"text"); b("#v_hl",v,"highlight",true); b("#v_loop",v,"loop"); b("#v_poster",v,"poster");
    b("#k_title",k,"title"); b("#k_text",k,"text"); b("#k_hl",k,"highlight",true); b("#k_btn",k,"buttonLabel"); b("#k_link",k,"link");
    b("#h_name",h,"name"); b("#h_t1",h,"taglineLine1"); b("#h_t2",h,"taglineLine2"); b("#h_loop",h,"loop"); b("#h_poster",h,"poster");
    b("#c_email",c,"email"); b("#c_ig",c,"instagram"); b("#c_igurl",c,"instagramUrl"); b("#c_vimeo",c,"vimeoUrl");
  }

  function render() { renderList(); renderForm(); renderOtros(); }
  window.addEventListener("resize", function(){ refreshPreview(); });

  // ---------- añadir ----------
  $("#addProject").addEventListener("click", function () {
    DATA.projects.push({ n: DATA.projects.length + 1, title: "Nuevo proyecto", meta: "", platform: "", videoId: "", template: "1", bg: "black", desc: "", thumb: "" });
    sel = DATA.projects.length - 1; renumber(); render();
    toast("Proyecto añadido");
  });

  // ---------- descargar / cargar ----------
  $("#download").addEventListener("click", function () {
    renumber();
    var text = "window.CONTENT = " + JSON.stringify(DATA, null, 2) + ";\n";
    var blob = new Blob([text], { type: "application/javascript" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "content.js";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    toast("content.js descargado · súbelo a tu hosting");
  });
  $("#loadfile").addEventListener("change", function (e) {
    var file = e.target.files[0]; if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var txt = String(r.result).replace(/^\s*window\.CONTENT\s*=\s*/, "").replace(/;\s*$/, "");
        var obj = JSON.parse(txt);
        DATA = obj; if (!DATA.projects) DATA.projects = [];
        sel = DATA.projects.length ? 0 : -1; render();
        toast("Contenido cargado");
      } catch (err) { alert("No se pudo leer el archivo. Asegúrate de que es un content.js válido."); }
    };
    r.readAsText(file);
  });

  // ---------- tabs ----------
  document.querySelectorAll(".tab").forEach(function (t) {
    t.addEventListener("click", function () {
      document.querySelectorAll(".tab").forEach(function (x) { x.classList.remove("on"); });
      t.classList.add("on");
      document.querySelectorAll(".panel").forEach(function (pn) { pn.hidden = pn.getAttribute("data-panel") !== t.dataset.tab; });
    });
  });

  render();
})();
