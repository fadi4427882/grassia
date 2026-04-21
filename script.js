/**
 * Gracia Kitchen | Professional Recipe Book Creator
 * Core Logic: Recipe Pages, Settings, Archive, PDF Export
 */

// ─────────────────────────────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────────────────────────────
const App = {
    recipeCount : 0,
    pageSize    : 'a4',
    accent      : '#C9A14A',
    font        : 'Amiri',
    pageBgStyle : 'parchment',
    gutterOn    : false,
    logoData    : null,
    wmData      : null,
    projectKey  : `gk_${Date.now()}`,
    showPageNums: true,
    companyName : 'Gracia Kitchen',
    brandingOn  : true,
};

const PAGE_BG = {
    parchment : '#fcf8f1',
    white     : '#ffffff',
    cream     : '#fffdf5',
    linen     : '#f5f0e8',
};

// ─────────────────────────────────────────────────────────────────
//  BOOT
// ─────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    updateStat();
    // Auto-grow all textareas
    document.addEventListener('input', e => {
        if (e.target.tagName === 'TEXTAREA') grow(e.target);
    });
    // Sync cover inputs → header inputs
    const coverTitle = document.getElementById('cover-title');
    const bookName   = document.getElementById('book-name');
    if (coverTitle && bookName) {
        coverTitle.addEventListener('input', () => bookName.value = coverTitle.value);
        bookName.addEventListener('input', () => coverTitle.value = bookName.value);
    }
    const coverAuth = document.getElementById('cover-author-name');
    const bookAuth  = document.getElementById('book-author');
    if (coverAuth && bookAuth) {
        coverAuth.addEventListener('input', () => bookAuth.value = coverAuth.value);
        bookAuth.addEventListener('input', () => coverAuth.value = bookAuth.value);
    }
});

// ─────────────────────────────────────────────────────────────────
//  PASSWORD
// ─────────────────────────────────────────────────────────────────
function unlockApp() {
    const val = document.getElementById('pw-input')?.value;
    const err = document.getElementById('pw-err');
    if (val === '2006GAN2026') {
        const ov = document.getElementById('pw-overlay');
        ov.style.opacity = '0';
        ov.style.pointerEvents = 'none';
        setTimeout(() => ov.style.display = 'none', 520);
    } else {
        err.classList.add('show');
        const inp = document.getElementById('pw-input');
        inp.style.borderColor = '#e05252';
        inp.value = '';
        setTimeout(() => { err.classList.remove('show'); inp.style.borderColor = ''; }, 2500);
    }
}
function togglePw() {
    const inp = document.getElementById('pw-input');
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─────────────────────────────────────────────────────────────────
//  SETTINGS DRAWER
// ─────────────────────────────────────────────────────────────────
function openSettings() {
    document.getElementById('settings-drawer').classList.add('open');
    document.getElementById('drawer-overlay').classList.add('show');
}
function closeSettings() {
    document.getElementById('settings-drawer').classList.remove('open');
    document.getElementById('drawer-overlay').classList.remove('show');
}

// ─────────────────────────────────────────────────────────────────
//  PAGE SIZE
// ─────────────────────────────────────────────────────────────────
function setSize(sz) {
    App.pageSize = sz;
    document.querySelectorAll('.book-page').forEach(p => {
        p.classList.toggle('page-a5', sz === 'a5');
    });
    document.getElementById('sz-a4').classList.toggle('active', sz === 'a4');
    document.getElementById('sz-a5').classList.toggle('active', sz === 'a5');
}

// ─────────────────────────────────────────────────────────────────
//  ACCENT COLOR
// ─────────────────────────────────────────────────────────────────
function setAccent(hex, name) {
    App.accent = hex;
    document.documentElement.style.setProperty('--accent', hex);
    document.documentElement.style.setProperty('--accent-light', lightenHex(hex, 25));
    document.documentElement.style.setProperty('--accent-glow', hexToRgba(hex, 0.25));
    // Update active dot
    document.querySelectorAll('.ac-dot').forEach(d => d.classList.remove('active-ac'));
    document.querySelector(`.ac-${name}`)?.classList.add('active-ac');
}

// ─────────────────────────────────────────────────────────────────
//  FONT
// ─────────────────────────────────────────────────────────────────
function setFont(name) {
    App.font = name;
    document.documentElement.style.setProperty('--page-font', `'${name}', serif`);
}

// ─────────────────────────────────────────────────────────────────
//  PAGE BACKGROUND STYLE
// ─────────────────────────────────────────────────────────────────
function setPageBgStyle(style) {
    App.pageBgStyle = style;
    const bg = PAGE_BG[style] || '#fff';
    document.documentElement.style.setProperty('--page-bg', bg);
    // Update active swatch
    document.querySelectorAll('.bg-swatch').forEach(s => s.classList.remove('active-bg'));
    document.querySelector(`.bg-${style}`)?.classList.add('active-bg');
}

// ─────────────────────────────────────────────────────────────────
//  GUTTER
// ─────────────────────────────────────────────────────────────────
function applyGutter() {
    App.gutterOn = document.getElementById('gutter-chk').checked;
    document.querySelectorAll('.book-page').forEach(p => p.classList.toggle('gutter-on', App.gutterOn));
}

// ─────────────────────────────────────────────────────────────────
//  LOGO
// ─────────────────────────────────────────────────────────────────
function setLogo(input) {
    if (!input.files?.[0]) return;
    const r = new FileReader();
    r.onload = e => {
        App.logoData = e.target.result;
        const coverLogo = document.getElementById('cover-logo');
        if (coverLogo) { coverLogo.src = e.target.result; coverLogo.style.display = 'block'; }
        // Apply to each recipe page header logo
        document.querySelectorAll('.rhs-logo').forEach(img => {
            img.src = e.target.result; img.style.display = 'block';
        });
        // Apply to each company brand footer logo
        updateCompanyBranding();
        toast('✅ تم تطبيق شعار الشركة على جميع الصفحات');
    };
    r.readAsDataURL(input.files[0]);
}

// Update company branding logo across all pages
function updateCompanyBranding() {
    const name = document.getElementById('company-name-inp')?.value?.trim() || App.companyName;
    App.companyName = name;
    document.querySelectorAll('.cbf-logo').forEach(img => {
        if (App.logoData) {
            img.src = App.logoData;
            img.style.display = 'block';
            img.previousElementSibling?.remove(); // remove placeholder if exists
        }
    });
    document.querySelectorAll('.cbf-name').forEach(el => {
        el.textContent = name;
    });
    document.querySelectorAll('.cbf-logo-placeholder').forEach(el => {
        if (App.logoData) el.style.display = 'none';
        else el.style.display = 'flex';
    });
}

// ─────────────────────────────────────────────────────────────────
//  WATERMARK
// ─────────────────────────────────────────────────────────────────
function setWatermark(input) {
    if (!input.files?.[0]) return;
    const r = new FileReader();
    r.onload = e => {
        App.wmData = e.target.result;
        document.querySelectorAll('.recipe-watermark').forEach(wm => {
            wm.innerHTML = `<img src="${e.target.result}" alt="">`;
        });
        toast('💧 تم ضبط العلامة المائية لجميع الصفحات');
    };
    r.readAsDataURL(input.files[0]);
}

// ─────────────────────────────────────────────────────────────────
//  COVER BACKGROUND
// ─────────────────────────────────────────────────────────────────
function setCoverBg(input) {
    if (!input.files?.[0]) return;
    const r = new FileReader();
    r.onload = e => {
        const cover = document.getElementById('cover-page');
        cover.style.backgroundImage    = `url("${e.target.result}")`;
        cover.style.backgroundSize     = 'cover';
        cover.style.backgroundPosition = 'center';
    };
    r.readAsDataURL(input.files[0]);
}
function setBackCoverBg(input) {
    if (!input.files?.[0]) return;
    const r = new FileReader();
    r.onload = e => {
        const bc = document.getElementById('back-cover');
        bc.style.backgroundImage    = `url("${e.target.result}")`;
        bc.style.backgroundSize     = 'cover';
        bc.style.backgroundPosition = 'center';
        document.getElementById('bc-hint').style.display = 'none';
    };
    r.readAsDataURL(input.files[0]);
}

// ─────────────────────────────────────────────────────────────────
//  ADD RECIPE PAGE
// ─────────────────────────────────────────────────────────────────
function addRecipe() {
    App.recipeCount++;
    const id = `rec-${Date.now()}`;
    const page = buildRecipePage(id, App.recipeCount);
    document.getElementById('pages-container').appendChild(page);
    updateStat();
    renumberPages();
    setTimeout(() => page.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    // Apply settings
    if (App.pageSize === 'a5') page.classList.add('page-a5');
    if (App.gutterOn) page.classList.add('gutter-on');
    if (App.wmData) page.querySelector('.recipe-watermark').innerHTML = `<img src="${App.wmData}" alt="">`;
}

// ─────────────────────────────────────────────────────────────────
//  BUILD RECIPE PAGE HTML
// ─────────────────────────────────────────────────────────────────
function buildRecipePage(id, num) {
    const sec = document.createElement('section');
    sec.className = 'book-page recipe-page';
    sec.id = id;

    const photoId = `photo-${id}`;
    const logoSrc = App.logoData || '';
    const logoDisp = App.logoData ? 'block' : 'none';

    sec.innerHTML = `
        <!-- Watermark -->
        <div class="recipe-watermark"></div>

        <!-- Hover Toolbar -->
        <div class="recipe-toolbar no-print">
            <button class="rtb-btn" onclick="changeRecipeBg(event,'${id}')">🖼 خلفية</button>
            <button class="rtb-btn" onclick="movePageUp('${id}')">⬆</button>
            <button class="rtb-btn" onclick="movePageDown('${id}')">⬇</button>
            <button class="rtb-btn" onclick="duplicatePage('${id}')">📋 نسخ</button>
            <button class="rtb-btn danger" onclick="deletePage('${id}')">🗑 حذف</button>
        </div>

        <!-- Header Strip with Title & Logo -->
        <div class="recipe-header-strip">
            <img class="rhs-logo" src="${logoSrc}" alt="Logo" style="display:${logoDisp}">
            <input type="text" class="rhs-title" placeholder="اسم الوصفة..." spellcheck="false">
        </div>

        <!-- Meta Badges -->
        <div class="recipe-meta-row">
            <div class="meta-badge">
                <div class="mb-icon">🕒</div>
                <div class="mb-label">وقت التحضير</div>
                <input type="text" class="mb-value" placeholder="45 د" spellcheck="false">
            </div>
            <div class="meta-badge">
                <div class="mb-icon">🍳</div>
                <div class="mb-label">وقت الطهي</div>
                <input type="text" class="mb-value" placeholder="30 د" spellcheck="false">
            </div>
            <div class="meta-badge">
                <div class="mb-icon">👥</div>
                <div class="mb-label">الأشخاص</div>
                <input type="text" class="mb-value" placeholder="6" spellcheck="false">
            </div>
            <div class="meta-badge">
                <div class="mb-icon">📊</div>
                <div class="mb-label">الصعوبة</div>
                <input type="text" class="mb-value" placeholder="وسطي" spellcheck="false">
            </div>
            <div class="meta-badge">
                <div class="mb-icon">🌡️</div>
                <div class="mb-label">درجة الحرارة</div>
                <input type="text" class="mb-value" placeholder="180°م" spellcheck="false">
            </div>
        </div>

        <!-- Body: Instructions + Ingredients -->
        <div class="recipe-body-grid">

            <!-- Instructions (Wide column) -->
            <div class="instructions-col">
                <div class="col-heading">📋 طريقة التحضير</div>
                <textarea class="instructions-textarea"
                    placeholder="١. اغسل المكونات جيداً وجهزها...&#10;٢. سخّن الزيت في مقلاة على نار متوسطة...&#10;٣. أضف البصل وقلبه حتى يذبل...&#10;٤. "
                    rows="14"
                    spellcheck="false"></textarea>
            </div>

            <!-- Ingredients + Dish Photo (Narrow column) -->
            <div class="ingredients-col">

                <!-- Dish Photo Upload -->
                <label class="dish-photo-area" for="${photoId}" id="dpa-${id}">
                    <input type="file" id="${photoId}" accept="image/*" onchange="loadDishPhoto(this,'${id}')">
                    <div class="dpa-placeholder">
                        <div class="dpa-icon">📷</div>
                        <p>اضغط لرفع<br>صورة الطبق</p>
                    </div>
                    <img id="dpa-img-${id}" src="" alt="صورة الطبخة" style="display:none">
                </label>

                <!-- Ingredients List -->
                <div class="ingredients-list-wrap">
                    <div class="col-heading">🥘 المكونات</div>
                    <textarea class="ingredients-textarea"
                        placeholder="✔ 1 دجاجة كاملة&#10;✔ 2 كوب أرز بسمتي&#10;✔ 3 بصل متوسط&#10;✔ 4 ملاعق زيت&#10;✔ بهارات مشكلة حسب الذوق&#10;✔ ملح وفلفل"
                        rows="8"
                        spellcheck="false"></textarea>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="recipe-footer">
            <input type="text" class="rf-signature" value="مع محبتي، غراسيا" spellcheck="false">
            <input type="text" class="rf-brand" value="Gracia Kitchen" spellcheck="false">
        </div>

        <!-- Company Brand Footer -->
        <div class="company-brand-footer">
            ${App.logoData
                ? `<img class="cbf-logo" src="${App.logoData}" alt="Logo">`
                : `<div class="cbf-logo-placeholder">🔥</div>`
            }
            <div class="cbf-text">
                <span class="cbf-published">Published by</span>
                <span class="cbf-name">${App.companyName}</span>
            </div>
            ${App.logoData
                ? `<img class="cbf-logo" src="${App.logoData}" alt="Logo">`
                : `<div class="cbf-logo-placeholder">🔥</div>`
            }
        </div>

        <!-- Page Number -->
        <div class="page-num" id="pnum-${id}"></div>
    `;

    // Auto-grow textareas after paint
    requestAnimationFrame(() => {
        sec.querySelectorAll('textarea').forEach(grow);
    });

    return sec;
}

// ─────────────────────────────────────────────────────────────────
//  DISH PHOTO LOAD
// ─────────────────────────────────────────────────────────────────
function loadDishPhoto(input, pageId) {
    if (!input.files?.[0]) return;
    const r = new FileReader();
    r.onload = e => {
        const img  = document.getElementById(`dpa-img-${pageId}`);
        const area = document.getElementById(`dpa-${pageId}`);
        if (img)  { img.src = e.target.result; img.style.display = 'block'; }
        if (area) area.classList.add('has-img');
    };
    r.readAsDataURL(input.files[0]);
}

// ─────────────────────────────────────────────────────────────────
//  RECIPE PAGE BACKGROUND
// ─────────────────────────────────────────────────────────────────
function changeRecipeBg(e, pageId) {
    e.stopPropagation();
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => {
        if (!inp.files?.[0]) return;
        const r = new FileReader();
        r.onload = ev => {
            const page = document.getElementById(pageId);
            page.style.backgroundImage    = `url("${ev.target.result}")`;
            page.style.backgroundSize     = 'cover';
            page.style.backgroundPosition = 'center';
        };
        r.readAsDataURL(inp.files[0]);
    };
    inp.click();
}

// ─────────────────────────────────────────────────────────────────
//  PAGE MANAGEMENT
// ─────────────────────────────────────────────────────────────────
function deletePage(id) {
    if (!confirm('🗑️ هل تريد حذف هذه الوصفة؟')) return;
    const el = document.getElementById(id);
    if (el) { el.remove(); App.recipeCount = Math.max(0, App.recipeCount - 1); }
    updateStat(); renumberPages();
}

function movePageUp(id) {
    const el = document.getElementById(id);
    const prev = el?.previousElementSibling;
    if (el && prev) el.parentNode.insertBefore(el, prev);
    renumberPages();
}

function movePageDown(id) {
    const el = document.getElementById(id);
    const next = el?.nextElementSibling;
    if (el && next) el.parentNode.insertBefore(next, el);
    renumberPages();
}

function duplicatePage(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const clone = el.cloneNode(true);
    const newId = `rec-dup-${Date.now()}`;
    clone.id = newId;
    // Fix photo id
    const newPhotoId = `photo-${newId}`;
    const oldPhotoLabel = clone.querySelector('label.dish-photo-area');
    const oldPhotoInput = clone.querySelector('input[type=file][id^="photo-"]');
    const oldImg = clone.querySelector('img[id^="dpa-img-"]');
    if (oldPhotoLabel) oldPhotoLabel.setAttribute('for', newPhotoId);
    if (oldPhotoLabel) oldPhotoLabel.id = `dpa-${newId}`;
    if (oldPhotoInput) oldPhotoInput.id = newPhotoId;
    if (oldImg)        oldImg.id = `dpa-img-${newId}`;
    // Fix toolbar buttons
    clone.querySelectorAll('[onclick]').forEach(btn => {
        btn.setAttribute('onclick', btn.getAttribute('onclick').replace(id, newId));
    });
    // Fix page number id
    const pnum = clone.querySelector('.page-num');
    if (pnum) pnum.id = `pnum-${newId}`;
    el.after(clone);
    App.recipeCount++;
    updateStat(); renumberPages();
    toast('📋 تم نسخ الوصفة');
}

// ─────────────────────────────────────────────────────────────────
//  STAT & PAGE NUMBERS
// ─────────────────────────────────────────────────────────────────
function updateStat() {
    const count = document.querySelectorAll('#pages-container .recipe-page').length;
    const el = document.getElementById('stat-pill');
    if (el) el.textContent = toAr(count) + ' وصفة';
}

function renumberPages() {
    document.querySelectorAll('#pages-container .recipe-page').forEach((pg, i) => {
        const pn = pg.querySelector('.page-num');
        if (pn) pn.textContent = toAr(i + 2); // 1 = cover
    });
}

function toAr(n) {
    return String(n).replace(/[0-9]/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ─────────────────────────────────────────────────────────────────
//  PDF EXPORT
// ─────────────────────────────────────────────────────────────────
function exportPDF() {
    const title = document.getElementById('cover-title')?.value?.trim() || 'Gracia_Kitchen';
    const size  = App.pageSize;
    const btn   = document.querySelector('.hdr-btn-primary');
    if (btn) { btn.textContent = '⏳ جاري التصدير...'; btn.disabled = true; }

    const opt = {
        margin      : 0,
        filename    : `${title}.pdf`,
        image       : { type: 'jpeg', quality: 0.97 },
        html2canvas : { scale: 2, useCORS: true, letterRendering: true, allowTaint: true },
        jsPDF       : { unit: 'mm', format: size, orientation: 'portrait' },
    };

    html2pdf()
        .set(opt)
        .from(document.getElementById('workspace'))
        .save()
        .finally(() => {
            if (btn) { btn.textContent = '🖨️ طباعة PDF'; btn.disabled = false; }
        });
}

// ─────────────────────────────────────────────────────────────────
//  ARCHIVE
// ─────────────────────────────────────────────────────────────────
function openArchive()  { loadArchiveUI(); document.getElementById('archive-modal').style.display = 'flex'; }
function closeArchive() { document.getElementById('archive-modal').style.display = 'none'; }

function saveProject() {
    const title = document.getElementById('cover-title')?.value?.trim() || 'بدون عنوان';
    const companyNameVal = document.getElementById('company-name-inp')?.value?.trim() || App.companyName;
    const data  = {
        title,
        author    : document.getElementById('cover-author-name')?.value || '',
        timestamp : new Date().toLocaleString('ar-SA'),
        count     : document.querySelectorAll('#pages-container .recipe-page').length,
        accent    : App.accent,
        font      : App.font,
        pageBgStyle: App.pageBgStyle,
        logoData  : App.logoData,
        wmData    : App.wmData,
        companyName: companyNameVal,
        coverBgImg: document.getElementById('cover-page')?.style.backgroundImage || '',
        coverSubtitle: document.getElementById('cover-subtitle')?.value || '',
        pagesHTML : document.getElementById('pages-container')?.innerHTML || '',
        backDesc  : document.querySelector('.bc-desc')?.value || '',
        backIsbn  : document.querySelector('.bc-isbn')?.value || '',
    };
    const store = getStore();
    store[App.projectKey] = data;
    setStore(store);
    toast('💾 تم الحفظ بنجاح!');
}

function loadArchiveUI() {
    const store = getStore();
    const keys  = Object.keys(store).reverse();
    const body  = document.getElementById('archive-body');
    if (!keys.length) { body.innerHTML = '<p class="archive-empty">لا توجد مشاريع محفوظة.</p>'; return; }
    body.innerHTML = keys.map(k => {
        const d = store[k];
        return `
        <div class="arch-item">
            <div class="arch-info">
                <div class="arch-title">${esc(d.title)}</div>
                <div class="arch-meta">${d.timestamp} — ${toAr(d.count || 0)} وصفة</div>
            </div>
            <button class="arch-open" onclick="loadProject('${k}')">فتح</button>
            <button class="arch-del" onclick="delProject('${k}')" title="حذف">🗑️</button>
        </div>`;
    }).join('');
}

function loadProject(key) {
    const store = getStore();
    const d = store[key];
    if (!d) return;

    App.projectKey = key;
    App.logoData   = d.logoData || null;
    App.wmData     = d.wmData || null;
    App.companyName = d.companyName || 'Gracia Kitchen';

    // Restore text
    const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v || ''; };
    sv('cover-title',       d.title);
    sv('book-name',         d.title);
    sv('cover-author-name', d.author);
    sv('book-author',       d.author);
    sv('cover-subtitle',    d.coverSubtitle);
    sv('company-name-inp',  d.companyName || 'Gracia Kitchen');

    // Restore cover bg
    const cover = document.getElementById('cover-page');
    if (cover && d.coverBgImg) cover.style.backgroundImage = d.coverBgImg;

    // Restore pages
    document.getElementById('pages-container').innerHTML = d.pagesHTML || '';

    // Restore back cover
    const bcDesc = document.querySelector('.bc-desc');
    const bcIsbn = document.querySelector('.bc-isbn');
    if (bcDesc) bcDesc.value = d.backDesc || '';
    if (bcIsbn) bcIsbn.value = d.backIsbn || '';

    // Re-apply settings
    if (d.accent) setAccent(d.accent, '');
    if (d.font)   setFont(d.font);
    if (d.pageBgStyle) setPageBgStyle(d.pageBgStyle);

    // Logo on page headers
    if (App.logoData) {
        const logo = document.getElementById('cover-logo');
        if (logo) { logo.src = App.logoData; logo.style.display = 'block'; }
        document.querySelectorAll('.rhs-logo').forEach(img => { img.src = App.logoData; img.style.display = 'block'; });
        // Update brand footer logos
        document.querySelectorAll('.cbf-logo').forEach(img => { img.src = App.logoData; img.style.display = 'block'; });
        document.querySelectorAll('.cbf-logo-placeholder').forEach(el => el.style.display = 'none');
    }

    // Update company name in brand footers
    document.querySelectorAll('.cbf-name').forEach(el => el.textContent = App.companyName);

    // Watermark
    if (App.wmData) {
        document.querySelectorAll('.recipe-watermark').forEach(wm => {
            wm.innerHTML = `<img src="${App.wmData}" alt="">`;
        });
    }

    // Grow textareas
    document.querySelectorAll('textarea').forEach(grow);

    App.recipeCount = document.querySelectorAll('#pages-container .recipe-page').length;
    updateStat(); renumberPages();
    closeArchive();
    toast('✅ تم تحميل المشروع!');
}

function delProject(key) {
    if (!confirm('حذف هذا المشروع من الأرشيف؟')) return;
    const store = getStore();
    delete store[key];
    setStore(store);
    loadArchiveUI();
}

function clearArchive() {
    if (!confirm('مسح جميع المشاريع المحفوظة؟')) return;
    localStorage.removeItem('gracia_kitchen_store');
    loadArchiveUI();
}

function getStore() { return JSON.parse(localStorage.getItem('gracia_kitchen_store') || '{}'); }
function setStore(s) { localStorage.setItem('gracia_kitchen_store', JSON.stringify(s)); }

// ─────────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────────
function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
}

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
function grow(ta) {
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
}

function esc(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function lightenHex(hex, amount) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = Math.min(255, ((n >> 16) & 0xff) + amount);
    const g = Math.min(255, ((n >> 8)  & 0xff) + amount);
    const b = Math.min(255,  (n        & 0xff) + amount);
    return `rgb(${r},${g},${b})`;
}

function hexToRgba(hex, alpha) {
    const n = parseInt(hex.replace('#',''), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8)  & 0xff;
    const b =  n        & 0xff;
    return `rgba(${r},${g},${b},${alpha})`;
}
