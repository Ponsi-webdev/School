/* Shared page chrome (header, footer), image slots and homepage rendering. */
Store.ready.then(function(){
const S=window.Store,esc=S.esc,cfg=S.read().settings;
const NAV=[['index.html','Home','home'],['about.html','About','about'],['academics.html','Academics','academics'],['admissions.html','Admissions','admissions'],['school-life.html','School Life','school-life'],['news.html','News & Events','news'],['gallery.html','Gallery','gallery'],['contact.html','Contact','contact']];
const page=document.body.dataset.page||'',navKey=page==='news-article'?'news':page;
function slot(file,alt,hint,ratio,o){o=o||{};return `<figure class="media ${ratio||'r43'}"><img src="assets/img/${esc(file)}" alt="${esc(alt)}" ${o.eager?'fetchpriority="high"':'loading="lazy"'} decoding="async" onerror="this.parentNode.classList.add('is-empty')"><figcaption class="slot-note"><b>Photo slot:</b> ${esc(file)}${o.short?'':' &middot; suggested search: '+esc(hint||'')}</figcaption></figure>`}
const initials=n=>n.split(/\s+/).filter(Boolean).map(w=>w[0]).join('').slice(0,3).toUpperCase();
function header(){return `<a class="skip" href="#main">Skip to main content</a>
<div class="demo-bar" role="note">Demonstration website &mdash; sample content</div>
<div class="info-bar"><div class="wrap"><span>Tel: ${esc(cfg.phone)}</span><span>Email: ${esc(cfg.email)}</span><span>${esc(cfg.hours)}</span></div></div>
<header class="site-header"><div class="wrap"><a class="brand" href="index.html"><span class="logo" aria-hidden="true">${esc(initials(cfg.schoolName))}</span><span class="brand-name">${esc(cfg.schoolName)}<small>Logo placeholder</small></span></a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="site-nav"><span aria-hidden="true">&#9776;</span><span class="menu-label">Menu</span></button>
<nav class="nav" id="site-nav" aria-label="Main"><ul>${NAV.map(n=>`<li><a href="${n[0]}"${n[2]===navKey?' aria-current="page"':''}>${esc(n[1])}</a></li>`).join('')}<li class="nav-cta"><a href="admissions.html#enquiry">Admissions Enquiries</a></li></ul></nav></div></header>`}
function footer(){const soc=Object.entries(cfg.social||{}).filter(([k,v])=>v);return `<footer class="site-footer"><div class="wrap"><div class="footer-grid"><div><h2>${esc(cfg.schoolName)}</h2><p>${esc(cfg.footerNote)}</p></div>
<div><h2>Quick links</h2><ul>${NAV.map(n=>`<li><a href="${n[0]}">${esc(n[1])}</a></li>`).join('')}</ul></div>
<div><h2>Contact</h2><ul><li>${esc(cfg.address)}</li><li>${esc(cfg.phone)}</li><li>${esc(cfg.email)}</li><li>${esc(cfg.hours)}</li></ul>${soc.length?`<ul style="margin-top:.75rem">${soc.map(([k,v])=>`<li><a href="${esc(v)}" rel="noopener">${esc(k[0].toUpperCase()+k.slice(1))}</a></li>`).join('')}</ul>`:''}</div></div>
<p class="fine">&copy; ${new Intl.DateTimeFormat('en-GB',{year:'numeric',timeZone:S.TZ}).format(new Date())} ${esc(cfg.schoolName)} (demonstration). Sample content only.</p></div></footer>`}
function mount(){const h=document.getElementById('site-header'),f=document.getElementById('site-footer');if(h)h.innerHTML=header();if(f)f.innerHTML=footer();
 const b=document.querySelector('.menu-btn'),n=document.getElementById('site-nav');if(!b||!n)return;
 const set=o=>{n.classList.toggle('is-open',o);b.setAttribute('aria-expanded',o);b.querySelector('.menu-label').textContent=o?'Close':'Menu'};
 b.addEventListener('click',()=>set(!n.classList.contains('is-open')));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&n.classList.contains('is-open')){set(false);b.focus()}})}
const newsCard=n=>`<article class="card">${n.cover?`<figure class="media r169"><img src="${esc(n.cover)}" alt="" loading="lazy" decoding="async"></figure>`:slot('news-'+n.slug+'.jpg','Cover image for: '+n.title,'',"r169",{short:1})}<div class="card-body"><p class="meta">${n.sample?'<span class="tag sample">Sample</span>':''}<span class="tag">${esc(n.category)}</span> ${esc(S.fmtDate(n.publishedAt))}</p><h3><a href="news-article.html?slug=${encodeURIComponent(n.slug)}">${esc(n.title)}</a></h3><p>${esc(n.summary)}</p></div></article>`;
const eventItem=e=>`<li class="event"><div class="date-badge" aria-hidden="true"><b>${esc(S.fmtDate(e.startsAt,{month:undefined,year:undefined}))}</b><span>${esc(S.fmtDate(e.startsAt,{day:undefined,year:undefined,month:'short'}))}</span></div><div><h3>${e.sample!==false?'<span class="tag sample">Sample</span> ':''}${esc(e.title)}</h3><p>${esc(S.fmtDate(e.startsAt))}, ${esc(S.fmtTime(e.startsAt))} &middot; ${esc(e.location)}</p></div></li>`;
function home(){const d=S.read(),p=d.pages;const ht=document.getElementById('hero-title'),hp=document.getElementById('hero-text');if(ht&&p.hero)ht.textContent=p.hero.title;if(hp&&p.hero)hp.textContent=p.hero.text;
 const set=(id,h)=>{const el=document.getElementById(id);if(el)el.innerHTML=h};
 set('intro-text',`<h2>${esc(p.homeIntro.title)}</h2>`+p.homeIntro.body.split(/\n+/).map(t=>`<p>${esc(t)}</p>`).join(''));
 set('welcome-text',`<blockquote style="margin:0">${p.welcome.body.split(/\n+/).map(t=>`<p>${esc(t)}</p>`).join('')}</blockquote><footer>${esc(p.welcome.name)}, ${esc(p.welcome.role)}</footer>`);
 const nws=S.publishedNews().slice(0,3);set('news-list',nws.length?nws.map(newsCard).join(''):'<p class="empty">No news has been published yet.</p>');
 const ev=S.upcomingEvents().slice(0,4);set('events-list',ev.length?ev.map(eventItem).join(''):'<li class="empty">No upcoming events have been published yet.</li>');
 set('contact-summary',`<dl class="contact-grid"><div><dt>Address</dt><dd>${esc(cfg.address)}</dd></div><div><dt>Telephone</dt><dd>${esc(cfg.phone)}</dd></div><div><dt>Email</dt><dd>${esc(cfg.email)}</dd></div><div><dt>Office hours</dt><dd>${esc(cfg.hours)}</dd></div></dl>`)}
window.Site={slot,newsCard,eventItem};
if(cfg.brand){const r=document.documentElement.style;if(/^#[0-9a-f]{6}$/i.test(cfg.brand.navy||''))r.setProperty('--navy',cfg.brand.navy);if(/^#[0-9a-f]{6}$/i.test(cfg.brand.gold||''))r.setProperty('--gold',cfg.brand.gold)}
mount();if(S.mode==='fallback'){const b=document.createElement('div');b.className='demo-bar';b.setAttribute('role','alert');b.style.background='#FDE2E2';b.textContent='Live content could not be loaded, so sample content is shown. Please refresh in a moment.';document.body.insertBefore(b,document.body.firstChild)}
if(page==='home')home();
});
