const EXTRAS=["MPK","OSIS","PIK-R","Rohis","Rohin","Rokrat","Rokris","Paskib","Pramuka","PMR","Diksi","KIR","EC","Munssaga","Olimpiade","Snikers","Robotik","Sulam Tapis","PKS"];
let API_URL=localStorage.getItem("ABSEN_API_URL")||"",students=[],attendances=[],settings={},selectedExtra=EXTRAS[0],chart;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const toast=msg=>{$("toast").textContent=msg;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2800)};
function api(url,action,payload={}){if(!url)return Promise.reject(Error("URL API belum disetel"));return fetch(url,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify({action,...payload})}).then(r=>r.json())}
function apiGet(url,action,payload={}){const p=new URLSearchParams({action,...payload});return fetch(url+"?"+p).then(r=>r.json())}
function today(){return new Date().toISOString().slice(0,10)}
function qrUrl(qr){return "https://quickchart.io/qr?text="+encodeURIComponent(qr)+"&size=180&format=svg"}
function showView(v){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$("view-"+v).classList.add('active');document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===v));$("pageTitle").textContent={dashboard:'Dashboard',siswa:'Data Siswa',absen:'Absen Ekstrakurikuler',rekap:'Rekap Absen',grafik:'Grafik',pengaturan:'Pengaturan'}[v];if(v==='dashboard')renderDashboard();if(v==='siswa')renderStudents();if(v==='grafik')renderChart();if(v==='rekap')renderRekap();if(window.innerWidth<700)$('sidebar').classList.remove('open')}
document.querySelectorAll('.nav-btn').forEach(b=>b.onclick=()=>showView(b.dataset.view));$('menuBtn').onclick=()=>$('sidebar').classList.toggle('open');$('refreshBtn').onclick=loadAll;
function renderExtras(){$('extraGrid').innerHTML=EXTRAS.map(x=>`<button class="extra-btn ${x===selectedExtra?'active':''}" data-extra="${esc(x)}">${esc(x)}</button>`).join('');document.querySelectorAll('.extra-btn').forEach(b=>b.onclick=()=>{selectedExtra=b.dataset.extra;renderExtras()})}
function renderDashboard(){const t=today(),day=attendances.filter(a=>String(a.TANGGAL||'').slice(0,10)===t);$('statSiswa').textContent=students.length;$('statHari').textContent=day.length;$('statMinggu').textContent=periodCount(7);$('statBulan').textContent=periodCount(30);$('statSemester').textContent=periodCount(180);$('todayList').innerHTML=tableAttendance(day.slice().reverse().slice(0,100))}
function periodCount(days){const min=Date.now()-days*86400000;return attendances.filter(a=>new Date(a.TIMESTAMP||a.TANGGAL).getTime()>=min).length}
function tableAttendance(rows){if(!rows.length)return '<div class="empty">Belum ada data absensi.</div>';return `<table><thead><tr><th>Waktu</th><th>NIS/NISN</th><th>Nama</th><th>Kelas</th><th>Ekstrakurikuler</th><th>Status</th></tr></thead><tbody>${rows.map(a=>`<tr><td>${esc(a.TIMESTAMP||'')}</td><td>${esc(a.NISN)}</td><td>${esc(a.NAMA)}</td><td>${esc(a.KELAS)}</td><td>${esc(a.EKSTRA)}</td><td>${esc(a.STATUS||'Hadir')}</td></tr>`).join('')}</tbody></table>`}
function populateClasses(){const classes=[...new Set(students.map(s=>String(s.KELAS||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'id',{numeric:true}));$('classFilter').innerHTML='<option value="">Semua Kelas</option>'+classes.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('')}
function filteredStudents(){const q=($('studentSearch').value||'').toLowerCase(),c=$('classFilter').value,sort=$('sortStudents').value;let rows=students.filter(s=>(!q||[s.NISN,s.NAMA,s.KELAS].join(' ').toLowerCase().includes(q))&&(!c||String(s.KELAS)===c));rows.sort((a,b)=>String(a[sort==='nama'?'NAMA':sort==='nisn'?'NISN':'KELAS']||'').localeCompare(String(b[sort==='nama'?'NAMA':sort==='nisn'?'NISN':'KELAS']||''),'id',{numeric:true}));return rows}
function renderStudents(){const rows=filteredStudents();$('studentTable').innerHTML=rows.length?`<table><thead><tr><th>QR SVG</th><th>NIS/NISN</th><th>Nama Siswa</th><th>Kelas</th><th>Jenis Kelamin</th><th>Status</th><th>Aksi</th></tr></thead><tbody>${rows.map(s=>{const qr=s.QR_ID||s.NISN;return `<tr><td><img class="qr" src="${qrUrl(qr)}" alt="QR"></td><td>${esc(s.NISN)}</td><td>${esc(s.NAMA)}</td><td>${esc(s.KELAS)}</td><td>${esc(s.JK)}</td><td>${esc(s.STATUS||'Aktif')}</td><td><button class="btn" onclick="printQr('${esc(qr)}','${esc(s.NAMA)}','${esc(s.NISN)}','${esc(s.KELAS)}')">Cetak</button></td></tr>`}).join('')}</tbody></table>`:'<div class="empty">Data siswa belum tersedia.</div>'}
$('studentSearch').oninput=renderStudents;$('classFilter').onchange=renderStudents;$('sortStudents').onchange=renderStudents;
function printQr(qr,name,nisn,kelas){const w=window.open('','_blank');w.document.write(`<html><head><title>Kartu QR - ${esc(name)}</title><style>body{font-family:Arial;text-align:center}.card{width:300px;margin:30px auto;padding:25px;border:2px solid #b7e6f8;border-radius:18px}.card img{width:190px}.school{color:#087bb2;font-weight:bold}.name{font-size:20px;font-weight:bold;margin:8px}.meta{color:#567}</style></head><body><div class="card"><div class="school">SMAN 1 KOTA GAJAH</div><div class="name">${esc(name)}</div><div class="meta">${esc(nisn)} • Kelas ${esc(kelas)}</div><img src="${qrUrl(qr)}"><div class="meta">${esc(qr)}</div></div><script>setTimeout(()=>print(),900)<\/script></body></html>`);w.document.close()}
function printClassCards(){const rows=filteredStudents();if(!rows.length){toast('Tidak ada siswa pada filter kelas saat ini');return}const w=window.open('','_blank');w.document.write(`<html><head><title>Kartu QR Siswa</title><style>body{font-family:Arial;margin:20px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.card{text-align:center;border:1px solid #b9e5f7;border-radius:15px;padding:12px;break-inside:avoid}.card img{width:145px}.school{font-size:11px;color:#087bb2;font-weight:bold}.name{font-weight:bold;margin:5px}.meta{font-size:10px;color:#567}@media print{button{display:none}.grid{grid-template-columns:repeat(3,1fr)}}</style></head><body><h2>SMAN 1 Kota Gajah - Kartu QR</h2><div class="grid">${rows.map(s=>{const qr=s.QR_ID||s.NISN;return `<div class="card"><div class="school">SMAN 1 KOTA GAJAH</div><div class="name">${esc(s.NAMA)}</div><div class="meta">${esc(s.NISN)} • ${esc(s.KELAS)}</div><img src="${qrUrl(qr)}"><div class="meta">${esc(qr)}</div></div>`}).join('')}</div><script>setTimeout(()=>print(),1200)<\/script></body></html>`);w.document.close()}
$('printClassQrBtn').onclick=printClassCards;
$('uploadExcelBtn').onclick=()=>{$('excelFile').value='';$('excelFile').click()};
function normalizeExcelHeader(h){
  return String(h ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_\-\/]+/g,'')
    .replace(/[^\p{L}\p{N}]/gu,'');
}
function getExcelValue(row, aliases){
  const keys = Object.keys(row);
  const wanted = aliases.map(normalizeExcelHeader);
  for (const key of keys){
    if (wanted.includes(normalizeExcelHeader(key))) return row[key];
  }
  return '';
}
$('excelFile').onchange=async e=>{
  const file=e.target.files[0];
  if(!file)return;
  if(!window.XLSX){
    toast('Library Excel belum siap, refresh halaman.');
    return;
  }
  try{
    const data=await file.arrayBuffer();
    const wb=XLSX.read(data,{type:'array'});
    if(!wb.SheetNames.length) throw Error('File Excel tidak memiliki sheet.');
    const sheet=wb.Sheets[wb.SheetNames[0]];
    const rows=XLSX.utils.sheet_to_json(sheet,{defval:'',raw:false});

    const normalized=rows.map(r=>({
      NISN:String(getExcelValue(r,['NISN','NIS','NIS/NISN','Nomor Induk Siswa','Nomor Induk'])||'').trim(),
      NAMA:String(getExcelValue(r,['NAMA','Nama','Nama Siswa','Nama Lengkap'])||'').trim(),
      KELAS:String(getExcelValue(r,['KELAS','Kelas','Rombel','Rombongan Belajar'])||'').trim(),
      JK:String(getExcelValue(r,['JK','Jenis Kelamin','JenisKelamin','J/K','Gender'])||'').trim(),
      STATUS:String(getExcelValue(r,['STATUS','Status','Keaktifan'])||'Aktif').trim()
    })).filter(r=>r.NISN && r.NAMA);

    if(!normalized.length){
      throw Error(
        'Data Excel tidak terbaca. Pastikan baris pertama berisi kolom: NISN, NAMA, KELAS, JK, STATUS.'
      );
    }

    const r=await api(API_URL,'bulkStudents',{students:normalized});
    if(!r.ok) throw Error(r.message);

    toast(`Upload selesai: ${r.added||0} ditambahkan, ${r.skipped||0} dilewati`);
    await loadAll();
  }catch(err){
    toast(err.message || 'Upload Excel gagal.');
  }
};
$('addStudentBtn').onclick=()=>$('modal').classList.remove('hidden');$('closeModal').onclick=()=>$('modal').classList.add('hidden');
$('saveStudent').onclick=async()=>{try{const s={NISN:$('fNisn').value.trim(),NAMA:$('fNama').value.trim(),KELAS:$('fKelas').value.trim(),JK:$('fJk').value,STATUS:$('fStatus').value};if(!s.NISN||!s.NAMA)throw Error('NIS/NISN dan nama wajib diisi');const r=await api(API_URL,'addStudent',{student:s});if(!r.ok)throw Error(r.message);$('modal').classList.add('hidden');toast('Siswa berhasil disimpan');await loadAll()}catch(e){toast(e.message)}};
$('startScan').onclick=async()=>{if(!window.Html5Qrcode){toast('Library kamera belum siap. Coba refresh.');return}try{const scanner=new Html5Qrcode('reader');await scanner.start({facingMode:'environment'},{fps:10,qrbox:250},async text=>{await scanner.stop();await doAttendance(text)})}catch(e){toast('Kamera tidak dapat digunakan: '+e.message)}};
$('manualAttend').onclick=()=>doAttendance($('manualQr').value.trim());
async function doAttendance(code){if(!code){toast('Masukkan QR_ID atau NIS/NISN');return}try{const r=await api(API_URL,'attendance',{code,extra:selectedExtra});if(!r.ok)throw Error(r.message);$('scanResult').innerHTML=`<b>Berhasil:</b> ${esc(r.student.NAMA)} — ${esc(r.student.KELAS)} — ${esc(selectedExtra)}`;toast('Absensi berhasil tersimpan');$('manualQr').value='';await loadAll()}catch(e){$('scanResult').textContent=e.message;toast(e.message)}}
function renderRekap(){const p=$('rekapPeriod').value,d=$('rekapDate').value||today();$('rekapTable').innerHTML=tableAttendance(attendances.filter(a=>inPeriod(a,p,d)))}
function inPeriod(a,p,d){const dt=new Date(a.TIMESTAMP||a.TANGGAL),base=new Date(d+'T00:00:00');if(p==='harian')return dt.toISOString().slice(0,10)===d;if(p==='mingguan'){const x=new Date(base);const day=x.getDay()||7;x.setDate(x.getDate()-day+1);const y=new Date(x);y.setDate(y.getDate()+6);return dt>=x&&dt<new Date(y.getTime()+86400000)}if(p==='bulanan')return dt.getFullYear()===base.getFullYear()&&dt.getMonth()===base.getMonth();return dt.getFullYear()===base.getFullYear()&&((base.getMonth()<6&&dt.getMonth()<6)||(base.getMonth()>=6&&dt.getMonth()>=6))}
$('loadRekap').onclick=renderRekap;$('rekapDate').value=today();
function renderChart(){const p=$('chartPeriod').value,d=today(),rows=attendances.filter(a=>inPeriod(a,p,d)),map={};rows.forEach(a=>{const k=a.EKSTRA||'Lainnya';map[k]=(map[k]||0)+1});if(chart)chart.destroy();chart=new Chart($('attendanceChart'),{type:'bar',data:{labels:Object.keys(map),datasets:[{label:'Jumlah Absen',data:Object.values(map),backgroundColor:['#42b9e8','#5c9eea','#6fc7e8','#77a7e8','#8ad8ef','#5eb7d6','#86b6ed','#53c7df','#76c9e8','#6198d8','#65bde5','#9ac7ef','#5ab1dd','#6caee5','#80d1ed','#6aa0dc','#7cc2e8','#57a6d8','#8cccf0'],borderRadius:8}]},options:{responsive:true,plugins:{legend:{display:false}},scales:{y:{beginAtZero:true,precision:0}}}})}$('chartPeriod').onchange=renderChart;
function fillSettings(){$('setSchool').value=settings.NAMA_SEKOLAH||'SMAN 1 Kota Gajah';$('setPrincipal').value=settings.NAMA_KEPALA||'';$('setPrincipalNip').value=settings.NIP_KEPALA||'';$('setPembina').value=settings.PEMBINA||'';$('setPembinaName').value=settings.NAMA_PEMBINA||'';$('setPembinaNip').value=settings.NIP_PEMBINA||'';$('apiUrl').value=API_URL}
$('saveApi').onclick=()=>{API_URL=$('apiUrl').value.trim().replace(/\/$/,'');localStorage.setItem('ABSEN_API_URL',API_URL);toast('URL API tersimpan');loadAll()};
$('saveSettings').onclick=async()=>{try{const data={NAMA_SEKOLAH:$('setSchool').value,NAMA_KEPALA:$('setPrincipal').value,NIP_KEPALA:$('setPrincipalNip').value,PEMBINA:$('setPembina').value,NAMA_PEMBINA:$('setPembinaName').value,NIP_PEMBINA:$('setPembinaNip').value};const r=await api(API_URL,'saveSettings',{settings:data});if(!r.ok)throw Error(r.message);toast('Pengaturan disimpan')}catch(e){toast(e.message)}};
async function loadAll(){if(!API_URL){$('apiBadge').textContent='API belum disetel';$('apiBadge').className='badge warn';renderExtras();renderDashboard();return}try{const r=await apiGet(API_URL,'bootstrap');if(!r.ok)throw Error(r.message);students=r.students||[];attendances=r.attendances||[];settings=r.settings||{};$('apiBadge').textContent='API terhubung';$('apiBadge').className='badge ok';populateClasses();renderExtras();fillSettings();renderDashboard();renderStudents();renderChart();renderRekap()}catch(e){$('apiBadge').textContent='API error';$('apiBadge').className='badge warn';toast(e.message)}}
renderExtras();loadAll();
