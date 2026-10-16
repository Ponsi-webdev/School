/* Live mode: connects the site to Supabase. If the config or the library is missing, or the database cannot be reached,
   the site stays in local demo mode (or shows a clear notice). */
(function(){
const C=window.SS_CONFIG,S=window.Store;
if(!S||!C||!window.supabase||!window.supabase.createClient)return;
const sb=window.supabase.createClient(C.SUPABASE_URL,C.SUPABASE_ANON_KEY);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,clone=o=>JSON.parse(JSON.stringify(o));
const local={read:S.read,write:S.write,addEnquiry:S.addEnquiry};
let cache=null,me=null,invites=[],idMap={};
const pub=(b,p)=>p?sb.storage.from(b).getPublicUrl(p).data.publicUrl:'';
const nice=e=>{const m=String((e&&e.message)||e||'');if(/Invalid login/i.test(m))return 'Email or password is incorrect.';if(/not confirmed/i.test(m))return 'Please confirm your email address first, then sign in.';if(/rate limit|too many/i.test(m))return 'Too many attempts. Please wait a few minutes and try again.';if(/already registered|already been registered/i.test(m))return 'That email already has an account. Try signing in instead.';if(/password/i.test(m)&&/(short|least|weak)/i.test(m))return 'Choose a longer password (at least 8 characters).';if(e&&(e.code==='42501'||e.denied||/row-level security|permission/i.test(m)))return 'You do not have permission to do that.';if(/not valid, has expired|already used|already have staff|Enter your full name|Please sign in|Too many enquiries|at least one administrator/.test(m))return m;return 'Something went wrong. Please try again.'};
const fail=(e)=>{const x=new Error(nice(e));x.cause=e;return x};
/* ---------- mapping database rows <-> app objects ---------- */
const mSet=r=>({schoolName:r.school_name,tagline:r.tagline||'',phone:r.phone||'',email:r.email||'',address:r.address||'',hours:r.hours||'',social:r.social||{},footerNote:r.footer_note||'',mapRaw:r.map_raw||'',mapQuery:r.map_query||'',mapType:r.map_type||'',directions:r.directions||'',brand:r.brand||undefined});
const mNews=r=>({id:r.id,slug:r.slug,title:r.title,summary:r.summary,body:r.body,category:r.category,status:r.status,publishedAt:r.published_at,cover:pub('site-media',r.cover_path),coverPath:r.cover_path||'',sample:!!r.is_sample});
const mEv=r=>({id:r.id,title:r.title,description:r.description,startsAt:r.starts_at,location:r.location,status:r.status,sample:!!r.is_sample});
const mGal=r=>({id:r.id,category:r.category,caption:r.caption,alt:r.alt_text,file:r.slot_file||'',src:pub('site-media',r.image_path),imagePath:r.image_path||'',status:r.status});
const mDoc=r=>({id:r.id,title:r.title,file:r.approved&&r.file_path?pub('documents',r.file_path):'',filePath:r.file_path||'',approved:!!r.approved,hasFile:!!r.file_path});
const mAdm=(it,dc)=>{const by=k=>it.filter(i=>i.kind===k).sort((a,b)=>a.sort_order-b.sort_order);return{requirements:by('requirement').map(i=>i.title),steps:by('step').map(i=>[i.title,i.body||'']),dates:by('date').map(i=>[i.title,i.body||'']),faqs:by('faq').map(i=>[i.title,i.body||'']),documents:dc.map(mDoc)}};
async function q(p){const r=await p;if(r.error)throw r.error;return r.data}
async function loadPublic(){const [st,pg,nw,ev,ai,dc,gl]=await Promise.all([q(sb.from('site_settings').select('*').eq('id',1).single()),q(sb.from('page_content').select('*')),q(sb.from('news').select('*').order('published_at',{ascending:false})),q(sb.from('events').select('*').order('starts_at')),q(sb.from('admissions_items').select('*')),q(sb.from('documents').select('*').order('title')),q(sb.from('gallery_items').select('*').order('created_at',{ascending:false}))]);
 const pk=Object.fromEntries(pg.map(r=>[r.key,r.data])),d0=local.read();
 cache={settings:mSet(st),pages:{hero:pk.hero||d0.pages.hero,homeIntro:pk.home_intro||d0.pages.homeIntro,welcome:pk.welcome||d0.pages.welcome},news:nw.map(mNews),events:ev.map(mEv),admissions:mAdm(ai,dc),gallery:gl.map(mGal),enquiries:[],staff:[],activity:[]}}
async function loadMe(){const {data}=await sb.auth.getSession();const s=data&&data.session;if(!s){me=null;return}
 const p=await q(sb.from('profiles').select('*').eq('id',s.user.id).maybeSingle());me=p?{id:p.id,name:p.full_name,email:p.email||s.user.email,role:p.role}:{id:s.user.id,email:s.user.email,role:null}}
async function loadStaffData(){invites=[];if(!me||!me.role)return;
 const act=await q(sb.from('activity_log').select('*').order('at',{ascending:false}).limit(60));cache.activity=act.map(a=>({at:a.at,user:a.user_name,text:a.text}));
 if(me.role==='admin'||me.role==='admissions'){const e=await q(sb.from('enquiries').select('*').order('created_at',{ascending:false}));cache.enquiries=e.map(x=>({id:x.id,name:x.name,contact:x.contact,topic:x.topic,message:x.message,status:x.status,createdAt:x.created_at}))}
 if(me.role==='admin'){const s=await q(sb.from('profiles').select('*').order('created_at'));cache.staff=s.map(x=>({id:x.id,name:x.full_name,email:x.email||'',role:x.role}));invites=await q(sb.from('staff_invites').select('*').is('used_by',null).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}))}}
async function refresh(){await loadPublic();await loadMe();await loadStaffData()}
/* ---------- writing ---------- */
const must=async(p)=>{const r=await p;if(r.error)throw r.error;if(Array.isArray(r.data)&&!r.data.length){const e=new Error('denied');e.denied=true;throw e}return r.data};
async function upload(bucket,dataUrl,folder,ext){const b=await (await fetch(dataUrl)).blob(),path=`${folder}/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;const {error}=await sb.storage.from(bucket).upload(path,b,{contentType:b.type,upsert:false});if(error)throw error;return path}
const J=x=>JSON.stringify(x);
async function syncList(table,oldA,newA,toRow){const om=new Map(oldA.map(x=>[x.id,x])),ids=new Set(newA.map(x=>x.id));
 for(const x of newA){if(!UUID.test(x.id)){const r=await toRow(x),d=await q(sb.from(table).insert(r).select().single());idMap[x.id]=d.id}else{const o=om.get(x.id);if(o&&J(o)!==J(x))await must(sb.from(table).update(await toRow(x)).eq('id',x.id).select('id'))}}
 for(const o of oldA)if(UUID.test(o.id)&&!ids.has(o.id))await must(sb.from(table).delete().eq('id',o.id).select('id'))}
async function commit(d){const o=cache;idMap={};try{
 if(J(o.settings)!==J(d.settings)){const s=d.settings;await must(sb.from('site_settings').update({school_name:s.schoolName,tagline:s.tagline,phone:s.phone,email:s.email,address:s.address,hours:s.hours,social:s.social,footer_note:s.footerNote,map_raw:s.mapRaw||null,map_query:s.mapQuery||null,map_type:s.mapType||null,directions:s.directions,brand:s.brand||null}).eq('id',1).select('id'))}
 for(const [k,key] of [['hero','hero'],['homeIntro','home_intro'],['welcome','welcome']])if(J(o.pages[k])!==J(d.pages[k]))await must(sb.from('page_content').upsert({key,data:d.pages[k]},{onConflict:'key'}).select('key'));
 await syncList('news',o.news,d.news,async n=>{let cp=n.coverPath||null;if(n.cover&&n.cover.startsWith('data:'))cp=await upload('site-media',n.cover,'news','jpg');else if(!n.cover)cp=null;return{slug:n.slug,title:n.title,summary:n.summary,body:n.body,category:n.category,status:n.status,published_at:n.publishedAt,is_sample:!!n.sample,cover_path:cp}});
 await syncList('events',o.events,d.events,async e=>({title:e.title,description:e.description,starts_at:e.startsAt,location:e.location,status:e.status,is_sample:!!e.sample}));
 await syncList('gallery_items',o.gallery,d.gallery,async g=>{let ip=g.imagePath||'';if(g.src&&g.src.startsWith('data:'))ip=await upload('site-media',g.src,'gallery','jpg');return{category:g.category,caption:g.caption,alt_text:g.alt,status:g.status,image_path:ip,slot_file:g.file||null}});
 const aj=a=>J({r:a.requirements,s:a.steps,d:a.dates,f:a.faqs});
 if(aj(o.admissions)!==aj(d.admissions)){const old=await q(sb.from('admissions_items').select('id')),a=d.admissions,rows=[...a.requirements.map((t,i)=>({kind:'requirement',title:t,body:null,sort_order:i+1})),...a.steps.map((p,i)=>({kind:'step',title:p[0],body:p[1],sort_order:i+1})),...a.dates.map((p,i)=>({kind:'date',title:p[0],body:p[1],sort_order:i+1})),...a.faqs.map((p,i)=>({kind:'faq',title:p[0],body:p[1],sort_order:i+1}))];
  await q(sb.from('admissions_items').insert(rows));if(old.length)await must(sb.from('admissions_items').delete().in('id',old.map(x=>x.id)).select('id'))}
 const dm=new Map(o.admissions.documents.map(x=>[x.id,x]));
 for(const doc of d.admissions.documents){const od=dm.get(doc.id);if(!od||J(od)===J(doc))continue;let fp=doc.filePath||null;
  if(doc.file&&doc.file.startsWith('data:'))fp=await upload('documents',doc.file,doc.approved?'approved':'drafts','pdf');
  else if(fp){const inApp=fp.startsWith('approved/');if(doc.approved&&!inApp){const np='approved/'+fp.split('/').pop();const {error}=await sb.storage.from('documents').move(fp,np);if(error)throw error;fp=np}else if(!doc.approved&&inApp){const np='drafts/'+fp.split('/').pop();const {error}=await sb.storage.from('documents').move(fp,np);if(error)throw error;fp=np}}
  await must(sb.from('documents').update({title:doc.title,approved:!!doc.approved&&!!fp,file_path:fp}).eq('id',doc.id).select('id'))}
 const em=new Map(o.enquiries.map(x=>[x.id,x]));for(const e of d.enquiries){const x=em.get(e.id);if(x&&x.status!==e.status)await must(sb.from('enquiries').update({status:e.status}).eq('id',e.id).select('id'))}
 const sm=new Map(o.staff.map(x=>[x.id,x]));for(const s of d.staff){const x=sm.get(s.id);if(x&&x.role!==s.role)await must(sb.from('profiles').update({role:s.role}).eq('id',s.id).select('id'))}
 const ds=new Set(d.staff.map(x=>x.id));for(const s of o.staff)if(!ds.has(s.id))await must(sb.from('profiles').delete().eq('id',s.id).select('id'));
 const seen=new Set(o.activity.map(a=>a.at+a.text));for(const a of d.activity.filter(a=>!seen.has(a.at+a.text)).reverse())await q(sb.from('activity_log').insert({user_name:(me&&me.name)||'Staff',text:String(a.text).slice(0,200)}));
 await refresh();return{ok:true}}
 catch(e){try{await refresh()}catch(x){}return{ok:false,error:nice(e)}}}
/* ---------- public API ---------- */
const filt={publishedNews:()=>S.read().news.filter(n=>n.status==='published'&&new Date(n.publishedAt)<=new Date()).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt)),upcomingEvents:()=>S.read().events.filter(e=>e.status==='published'&&new Date(e.startsAt)>=new Date(Date.now()-864e5)).sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt)),publishedGallery:()=>S.read().gallery.filter(g=>g.status==='published')};
S.live={sb,me:()=>me,invites:()=>invites,mapId:id=>idMap[id]||id,refresh,commit,
 async signIn(email,pw){const {error}=await sb.auth.signInWithPassword({email,password:pw});if(error)throw fail(error);await loadMe();await loadStaffData()},
 async signUp(email,pw){const {data,error}=await sb.auth.signUp({email,password:pw});if(error)throw fail(error);return{needsConfirm:!data.session}},
 async signOut(){await sb.auth.signOut();me=null;await loadPublic()},
 async reset(email){const {error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:location.href.split('#')[0]});if(error)throw fail(error)},
 async redeem(code,name){const {error}=await sb.rpc('redeem_code',{p_code:code,p_name:name});if(error)throw fail(error);await loadMe();await loadStaffData()},
 async setPassword(pw){const {error}=await sb.auth.updateUser({password:pw});if(error)throw fail(error)},
 async createInvite(role){const d=await q(sb.from('staff_invites').insert({role}).select().single());await loadStaffData();return d},
 async revokeInvite(code){await must(sb.from('staff_invites').delete().eq('code',code).select('code'));await loadStaffData()}};
S.ready=(async()=>{try{await loadPublic();await loadMe();await loadStaffData();S.mode='live';
  S.read=()=>clone(cache);S.write=d=>{cache=d;return true};Object.assign(S,filt);
  S.addEnquiry=async o=>{const {error}=await sb.from('enquiries').insert({name:o.name,contact:o.contact,topic:o.topic,message:o.message});if(error)throw fail(error)};
  sb.auth.onAuthStateChange(async ev=>{if(ev==='SIGNED_OUT'&&me){me=null;if(S.onSignedOut)S.onSignedOut()}if(ev==='PASSWORD_RECOVERY'&&S.onRecovery)S.onRecovery()})}
 catch(e){S.mode='fallback';S.loadError=e}})();
})();
