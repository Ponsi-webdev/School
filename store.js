/* Local demo data store. Used by the public site and (later) the dashboard.
   LOCAL DEMO ONLY: data lives in this browser's localStorage. It is not a database and it is not secure. */
(function(){
const KEY='ssdemo:v1',TZ='Africa/Kampala';
const day=n=>{const d=new Date(Date.now()+n*864e5);d.setUTCHours(6,0,0,0);return d.toISOString()};
const defaults=()=>({
 settings:{schoolName:'Sample Secondary School',tagline:'Demonstration website',phone:'[School telephone - to be confirmed]',email:'[School email - to be confirmed]',address:'[School address - to be confirmed]',hours:'[Office hours - to be confirmed]',mapQuery:'',mapType:'',directions:'[Directions to the school - to be confirmed]',social:{facebook:'',x:'',youtube:'',instagram:''},footerNote:'This is a demonstration website with sample content. It is not an official school website.'},
 pages:{
  hero:{title:'Learning, character and community',text:'A welcoming O-level and A-level school where every student is known and supported. (Sample text for the demonstration.)'},
  homeIntro:{title:'A supportive school community',body:'Sample Secondary School is a fictional school used to demonstrate how a clear, welcoming school website can serve parents, students and staff. All text on this page is sample content to be replaced with approved school information.'},
  welcome:{name:'[Headteacher\'s name]',role:'Headteacher',body:'Welcome to our school. We want every learner to be known, supported and challenged to do their best. Our staff work closely with families so that students grow in knowledge, character and confidence. This is a sample message, to be replaced by the headteacher.'}
 },
 news:[
  {id:'n1',slug:'sample-term-opening-arrangements',title:'Sample: term opening arrangements',summary:'An example of a notice that the school office could publish before a new term begins.',body:'This is a sample announcement. In the live version, the school office writes and publishes real notices from the dashboard.',category:'Notices',status:'published',publishedAt:day(-3),sample:true},
  {id:'n2',slug:'sample-science-club-visit',title:'Sample: science club prepares for an exhibition',summary:'An example news story about a school club activity, ready to be replaced with real news and photographs.',body:'This is a sample news story used to show the layout of an article page.',category:'School life',status:'published',publishedAt:day(-8),sample:true},
  {id:'n3',slug:'sample-sports-day-preparations',title:'Sample: sports day preparations begin',summary:'An example update about house practice sessions and how families can support students.',body:'This is another sample article. Dates and details are placeholders only.',category:'Sports',status:'published',publishedAt:day(-15),sample:true},
  {id:'n4',slug:'sample-draft-announcement',title:'Sample draft: not yet published',summary:'This draft should never appear on the public website.',body:'Draft content.',category:'Notices',status:'draft',publishedAt:day(-1),sample:true}
 ],
 events:[
  {id:'e1',title:'Open day for prospective families',description:'Sample event. Tour the campus and meet staff.',startsAt:day(12),location:'School campus (location to be confirmed)',status:'published'},
  {id:'e2',title:'Inter-house sports day',description:'Sample event showing how sports fixtures can be listed.',startsAt:day(25),location:'School grounds (to be confirmed)',status:'published'},
  {id:'e3',title:'Science and ICT exhibition',description:'Sample event for student project displays.',startsAt:day(40),location:'School hall (to be confirmed)',status:'published'},
  {id:'e4',title:'Parents\' meeting',description:'Sample event for a parent and teacher meeting.',startsAt:day(55),location:'School hall (to be confirmed)',status:'published'}
 ],
 admissions:{
  requirements:['A completed admissions enquiry (the school confirms the exact form)','Proof of age, such as a birth certificate (to be confirmed)','The learner\'s most recent school report (to be confirmed)','Passport photographs (to be confirmed)','An entry assessment, if the school requires one (to be confirmed)'],
  steps:[['Make an enquiry','Contact the admissions office using the enquiry form or the official contacts.'],['Visit the school','Arrange a visit or attend an open day (sample).'],['Submit documents','Provide the documents the school lists as required.'],['Assessment or interview','If the school requires it, the learner takes an entry assessment.'],['Admission decision','The school tells families its decision and the next steps.']],
  dates:[['Enquiries open','[Date to be confirmed by the school]'],['Open day','[Date to be confirmed by the school]'],['Entry assessments','[Date to be confirmed by the school]'],['Term begins','[Date to be confirmed by the school]']],
  faqs:[['Which classes does the school offer?','This sample shows O-level (Senior 1 to 4) and A-level (Senior 5 and 6). The school confirms the classes it offers.'],['Does the school offer day and boarding places?','To be confirmed by the school.'],['How much are the fees?','Fees are not shown in this demonstration. The school provides approved fee information.'],['How do I arrange a visit?','Use the admissions enquiry form, or the official contacts once they are confirmed.']],
  documents:[{title:'School prospectus',file:'',approved:false},{title:'Admissions information form',file:'',approved:false}]},
 staff:[{id:'s1',name:'Sample Administrator',email:'admin@example.invalid',role:'admin'},{id:'s2',name:'Sample Editor',email:'editor@example.invalid',role:'editor'},{id:'s3',name:'Sample Admissions Officer',email:'admissions@example.invalid',role:'admissions'}],
 activity:[],
 gallery:[
  {id:'g1',category:'Academics',caption:'Sample: students in a science lesson',alt:'Students working together in a school science laboratory',file:'gallery-1.jpg',status:'published'},
  {id:'g2',category:'Academics',caption:'Sample: reading time in the library',alt:'Students reading and studying in a school library',file:'gallery-2.jpg',status:'published'},
  {id:'g3',category:'Academics',caption:'Sample: computer studies class',alt:'Students using computers in an ICT classroom',file:'gallery-3.jpg',status:'published'},
  {id:'g4',category:'Sports',caption:'Sample: inter-house athletics',alt:'Students taking part in an athletics event on a school field',file:'gallery-4.jpg',status:'published'},
  {id:'g5',category:'Sports',caption:'Sample: netball practice',alt:'Girls playing netball on a school court',file:'gallery-5.jpg',status:'published'},
  {id:'g6',category:'Clubs',caption:'Sample: debate club meeting',alt:'Students taking part in a debate club meeting',file:'gallery-6.jpg',status:'published'},
  {id:'g7',category:'Clubs',caption:'Sample: music rehearsal',alt:'Students rehearsing music together',file:'gallery-7.jpg',status:'published'},
  {id:'g8',category:'Campus',caption:'Sample: school grounds',alt:'The school grounds and classroom blocks',file:'gallery-8.jpg',status:'published'}],
 enquiries:[
  {id:'q1',name:'Sample Parent A',contact:'sample.parent.a@example.invalid',topic:'Admissions',message:'Sample enquiry: please share information about Senior 1 admission and how to visit.',status:'new',createdAt:day(-1)},
  {id:'q2',name:'Sample Guardian B',contact:'+000 000 000 000',topic:'General',message:'Sample enquiry: is the school open for visits on weekdays?',status:'in_progress',createdAt:day(-4)},
  {id:'q3',name:'Sample Parent C',contact:'sample.parent.c@example.invalid',topic:'Admissions',message:'Sample enquiry: which A-level combinations are planned?',status:'resolved',createdAt:day(-9)}]});
const read=()=>{try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.settings){const d=defaults();let ch=false;Object.keys(d).forEach(k=>{if(!(k in s)){s[k]=d[k];ch=true}});Object.keys(d.settings).forEach(k=>{if(!(k in s.settings)){s.settings[k]=d.settings[k];ch=true}});if(ch)write(s);return s}}catch(e){}const d=defaults();write(d);return d};
function write(d){try{localStorage.setItem(KEY,JSON.stringify(d));return true}catch(e){return false}}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=(iso,o)=>new Intl.DateTimeFormat('en-GB',Object.assign({day:'numeric',month:'long',year:'numeric',timeZone:TZ},o||{})).format(new Date(iso));
const fmtTime=iso=>new Intl.DateTimeFormat('en-GB',{hour:'numeric',minute:'2-digit',hour12:true,timeZone:TZ}).format(new Date(iso)).replace(' ','').toLowerCase();
const publishedNews=()=>read().news.filter(n=>n.status==='published'&&new Date(n.publishedAt)<=new Date()).sort((a,b)=>new Date(b.publishedAt)-new Date(a.publishedAt));
const upcomingEvents=()=>read().events.filter(e=>e.status==='published'&&new Date(e.startsAt)>=new Date(Date.now()-864e5)).sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));
const publishedGallery=()=>read().gallery.filter(g=>g.status==='published');
function addEnquiry(o){const d=read();d.enquiries.unshift(Object.assign({id:'q'+Date.now(),status:'new',createdAt:new Date().toISOString()},o));write(d)}
/* Map location: accept a Google Maps link, coordinates or an address. Never accept embed HTML. */
function parseMapInput(raw){const t=String(raw||'').trim();if(!t)return{ok:true,empty:true};
 if(/[<>]|iframe|<\/|javascript:/i.test(t))return{ok:false,error:'Paste a Google Maps link, coordinates or an address. Embed code is not accepted.'};
 const c=t.match(/^(-?\d{1,2}(?:\.\d+)?)\s*,\s*(-?\d{1,3}(?:\.\d+)?)$/);if(c){const la=+c[1],lo=+c[2];if(la<-90||la>90||lo<-180||lo>180)return{ok:false,error:'Those coordinates are out of range.'};return{ok:true,type:'coordinates',query:la+','+lo}}
 if(/^https?:\/\//i.test(t)){let u;try{u=new URL(t)}catch(e){return{ok:false,error:'That link is not valid.'}}
  if(u.protocol!=='https:')return{ok:false,error:'Use a secure (https) Google Maps link.'};
  if(/(^|\.)goo\.gl$/.test(u.hostname))return{ok:false,error:'Short links cannot be embedded. Open the link, then copy the address or coordinates from Google Maps and paste those here.'};
  if(!/^(www\.|maps\.)?google\.com$/.test(u.hostname)||!/^\/maps/.test(u.pathname))return{ok:false,error:'Only Google Maps links are accepted.'};
  let q=u.searchParams.get('q')||u.searchParams.get('query');if(!q){const m=u.pathname.match(/\/place\/([^/]+)/);if(m)q=decodeURIComponent(m[1].replace(/\+/g,' '))}
  if(!q){const m=(u.pathname+u.search).match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);if(m)q=m[1]+','+m[2]}
  if(!q)return{ok:false,error:'Could not find a place in that link. Paste the address or coordinates instead.'};return parseMapInput(q)}
 if(t.length<5||t.length>200||!/^[\p{L}\p{N}\s,.'#\/()&-]+$/u.test(t))return{ok:false,error:'Enter a street address or place name (5 to 200 characters, no symbols).'};return{ok:true,type:'address',query:t}}
const mapEmbedUrl=q=>'https://www.google.com/maps?q='+encodeURIComponent(q)+'&output=embed';
const mapOpenUrl=q=>'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(q);
window.Store={mode:'local',ready:Promise.resolve(),live:null,publishedGallery,addEnquiry,parseMapInput,mapEmbedUrl,mapOpenUrl,read,write,esc,fmtDate,fmtTime,publishedNews,upcomingEvents,reset(){write(defaults())},TZ};
})();
