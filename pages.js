/* Inner pages: news, article, gallery, admissions, contact, enquiry form, map. LOCAL DEMO MODE. */
Store.ready.then(function(){
const S=window.Store,esc=S.esc,page=document.body.dataset.page,$=id=>document.getElementById(id),cfg=S.read().settings;
const paras=t=>String(t||'').split(/\n+/).filter(Boolean).map(x=>`<p>${esc(x)}</p>`).join('');
const put=(id,h)=>{const e=$(id);if(e)e.innerHTML=h};
/* ---------- enquiry form ---------- */
function enquiryForm(defaultTopic){return `<form class="form" id="enq-form" novalidate>
<div class="field"><label for="enq-name">Full name</label><input id="enq-name" name="name" autocomplete="name" maxlength="80" required aria-describedby="enq-name-err"><p class="err" id="enq-name-err" hidden></p></div>
<div class="field"><label for="enq-contact">Email address or phone number</label><input id="enq-contact" name="contact" autocomplete="email" maxlength="120" required aria-describedby="enq-contact-err"><p class="err" id="enq-contact-err" hidden></p></div>
<div class="field"><label for="enq-topic">What is your enquiry about?</label><select id="enq-topic" name="topic">${['Admissions','General','Other'].map(t=>`<option${t===defaultTopic?' selected':''}>${t}</option>`).join('')}</select></div>
<div class="field"><label for="enq-msg">Message</label><textarea id="enq-msg" name="message" maxlength="1000" required aria-describedby="enq-msg-err enq-msg-hint"></textarea><p class="hint" id="enq-msg-hint">Up to 1000 characters. Please do not include sensitive personal details.</p><p class="err" id="enq-msg-err" hidden></p></div>
<div class="hp" aria-hidden="true"><label>Leave this field empty<input name="website" tabindex="-1" autocomplete="off"></label></div>
<button class="btn btn-navy" type="submit">Send enquiry</button>
<div id="enq-status" role="status" aria-live="polite"></div>
<p class="hint">${S.mode==='live'?'Your message is recorded for the school office. No confirmation email or text message is sent.':'Demonstration mode: your message is saved in this browser only. No email or text message is sent.'}</p></form>`}
function bindForm(){const f=$('enq-form');if(!f)return;const t0=Date.now();
 const bad=(id,m)=>{const i=$(id),e=$(id+'-err');if(m){i.setAttribute('aria-invalid','true');e.textContent=m;e.hidden=false}else{i.removeAttribute('aria-invalid');e.hidden=true}return !m};
 f.addEventListener('submit',async e=>{e.preventDefault();const v=n=>f.elements[n].value.trim(),st=$('enq-status');st.innerHTML='';
  const c=v('contact'),mail=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c),tel=/^\+?[0-9 ()-]{7,20}$/.test(c);
  const a=bad('enq-name',v('name').length<2?'Enter your full name.':''),b=bad('enq-contact',!c?'Enter an email address or phone number.':(mail||tel)?'':'Enter a valid email address or phone number.'),d=bad('enq-msg',v('message').length<10?'Write a message of at least 10 characters.':'');
  if(!(a&&b&&d)){const first=f.querySelector('[aria-invalid=true]');if(first)first.focus();return}
  if(f.elements.website.value){st.innerHTML='<p class="ok-msg">Thank you. Your enquiry has been saved.</p>';f.reset();return}
  if(Date.now()-t0<3000){st.innerHTML='<p class="err">Please wait a moment and send again.</p>';return}
  let log=[];try{log=JSON.parse(localStorage.getItem('ssdemo:enqlog')||'[]').filter(x=>Date.now()-x<36e5)}catch(x){}
  if(log.length>=5){st.innerHTML='<p class="err">Too many enquiries from this browser. Please try again later.</p>';return}
  const btn=f.querySelector('button[type=submit]');btn.disabled=true;
  try{await S.addEnquiry({name:v('name'),contact:c,topic:v('topic'),message:v('message')});log.push(Date.now());try{localStorage.setItem('ssdemo:enqlog',JSON.stringify(log))}catch(x){}
   st.innerHTML=S.mode==='live'?'<p class="ok-msg">Thank you. Your enquiry has been recorded and will be seen by the school office. No confirmation email or text message is sent.</p>':'<p class="ok-msg">Thank you. Your enquiry was saved in this demonstration (in this browser only). No email or text message was sent.</p>';f.reset()}
  catch(er){st.innerHTML='<p class="err">'+esc(er.message||'We could not send your enquiry. Please try again later.')+'</p>'}
  finally{btn.disabled=false}})}
/* ---------- news ---------- */
function news(){const all=S.publishedNews(),cats=[...new Set(all.map(n=>n.category))];let cur='All';
 const draw=()=>{put('news-grid',(cur==='All'?all:all.filter(n=>n.category===cur)).map(Site.newsCard).join('')||'<p class="empty">No news has been published yet.</p>');
  put('news-filters',['All',...cats].map(c=>`<button type="button" aria-pressed="${c===cur}" data-c="${esc(c)}">${esc(c)}</button>`).join(''))};
 draw();$('news-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.c;draw();const n=$('news-filters').querySelector('[aria-pressed=true]');if(n)n.focus()});
 const ev=S.upcomingEvents();put('events-all',ev.length?ev.map(Site.eventItem).join(''):'<li class="empty">No upcoming events have been published yet.</li>')}
function article(){const slug=new URLSearchParams(location.search).get('slug'),n=S.publishedNews().find(x=>x.slug===slug);
 if(!n){document.title='Article not found | '+cfg.schoolName;put('article','<h1>Article not found</h1><p class="lead">This article does not exist, or it has not been published.</p><a class="btn btn-navy" href="news.html">Back to news</a>');return}
 document.title=n.title+' | '+cfg.schoolName;put('article',`<p class="crumbs"><a href="news.html">&larr; All news</a></p><p class="meta">${n.sample?'<span class="tag sample">Sample</span>':''}<span class="tag">${esc(n.category)}</span> ${esc(S.fmtDate(n.publishedAt))}</p><h1>${esc(n.title)}</h1>${n.cover?`<figure class="media r169" style="margin:0 0 1.25rem"><img src="${esc(n.cover)}" alt=""></figure>`:''}<div class="prose">${paras(n.body)}</div>`)}
/* ---------- gallery ---------- */
function gallery(){const G=S.publishedGallery(),cats=[...new Set(G.map(g=>g.category))];let cur='All',list=G,idx=0;const dlg=$('lightbox');
 const draw=()=>{list=cur==='All'?G:G.filter(g=>g.category===cur);put('gal-filters',['All',...cats].map(c=>`<button type="button" aria-pressed="${c===cur}" data-c="${esc(c)}">${esc(c)}</button>`).join(''));
  put('gal-grid',list.length?list.map((g,i)=>`<figure style="margin:0"><button type="button" data-i="${i}" aria-label="View larger: ${esc(g.caption)}">${g.src?`<figure class="media r43"><img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy" decoding="async"></figure>`:Site.slot(g.file,g.alt,'','r43',{short:1})}</button><figcaption class="cap">${esc(g.caption)}</figcaption></figure>`).join(''):'<p class="empty">No gallery images have been published yet.</p>')};
 const show=i=>{idx=(i+list.length)%list.length;const g=list[idx];put('lb-body',`${g.src?`<figure class="media r43"><img src="${esc(g.src)}" alt="${esc(g.alt)}"></figure>`:Site.slot(g.file,g.alt,'','r43',{short:1})}<p id="lb-cap" style="margin:.75rem 0 0"><b>${esc(g.category)}:</b> ${esc(g.caption)}</p>`)};
 draw();$('gal-filters').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;cur=b.dataset.c;draw();$('gal-filters').querySelector('[aria-pressed=true]').focus()});
 $('gal-grid').addEventListener('click',e=>{const b=e.target.closest('button[data-i]');if(!b)return;show(+b.dataset.i);dlg.showModal()});
 $('lb-prev').addEventListener('click',()=>show(idx-1));$('lb-next').addEventListener('click',()=>show(idx+1));$('lb-close').addEventListener('click',()=>dlg.close());
 dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});dlg.addEventListener('keydown',e=>{if(e.key==='ArrowLeft')show(idx-1);if(e.key==='ArrowRight')show(idx+1)})}
/* ---------- admissions ---------- */
function admissions(){const a=S.read().admissions;
 put('adm-req',`<ul class="prog-list">${a.requirements.map(r=>`<li>${esc(r)}</li>`).join('')}</ul>`);
 put('adm-steps',`<ol class="steps">${a.steps.map(s=>`<li><div><h3>${esc(s[0])}</h3><p>${esc(s[1])}</p></div></li>`).join('')}</ol>`);
 put('adm-dates',`<table class="dl-table"><tbody>${a.dates.map(d=>`<tr><th scope="row">${esc(d[0])}</th><td>${esc(d[1])}</td></tr>`).join('')}</tbody></table>`);
 put('adm-faq',a.faqs.map(f=>`<details class="faq"><summary>${esc(f[0])}</summary><p>${esc(f[1])}</p></details>`).join(''));
 put('adm-docs',a.documents.map(d=>d.approved&&d.file?`<li><a href="${esc(d.file)}" download="${esc(d.title.replace(/[^a-z0-9]+/gi,'-'))}.pdf" rel="noopener">${esc(d.title)}</a></li>`:`<li>${esc(d.title)}: <span class="tag">Not yet available</span> The school will provide an approved copy.</li>`).join('')) }
/* ---------- contact ---------- */
function contact(){put('contact-details',`<dl class="contact-grid"><div><dt>Address</dt><dd>${esc(cfg.address)}</dd></div><div><dt>Telephone</dt><dd>${esc(cfg.phone)}</dd></div><div><dt>Email</dt><dd>${esc(cfg.email)}</dd></div><div><dt>Office hours</dt><dd>${esc(cfg.hours)}</dd></div></dl>`);
 const m=cfg.mapQuery&&S.parseMapInput(cfg.mapQuery);
 put('map-area',m&&m.ok&&!m.empty?`<div class="map-wrap"><iframe title="Map showing the school location" src="${esc(S.mapEmbedUrl(m.query))}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" sandbox="allow-scripts allow-same-origin allow-popups"></iframe></div><p style="margin-top:.75rem"><a class="btn btn-navy" href="${esc(S.mapOpenUrl(m.query))}" target="_blank" rel="noopener">Open in Google Maps</a></p>`:'<p class="empty">School map will appear here once the location is confirmed.</p>');
 put('directions',`<h3>Directions</h3>${paras(cfg.directions)}`)}
({news:()=>news(),'news-article':()=>article(),gallery:()=>gallery(),admissions:()=>{admissions();put('enq-slot',enquiryForm('Admissions'));bindForm()},contact:()=>{contact();put('enq-slot',enquiryForm('General'));bindForm()}})[page]&&({news:()=>news(),'news-article':()=>article(),gallery:()=>gallery(),admissions:()=>{admissions();put('enq-slot',enquiryForm('Admissions'));bindForm()},contact:()=>{contact();put('enq-slot',enquiryForm('General'));bindForm()}})[page]();
});
