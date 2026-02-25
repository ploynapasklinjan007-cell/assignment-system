    // My Submissions (Student)
    function renderMySubmissions() {
      const content = document.getElementById('mainContent');
        // ⭐ เพิ่มตรงนี้
  if (!currentUser || currentUser.role !== 'student') {
    content.innerHTML = `
      <p class="text-center text-main">หน้านี้สำหรับนักเรียนเท่านั้น</p>
    `;
    return;
  }
  const mySubmissions = allData
  .filter(sub =>
    sub.type === 'submission' &&
    sub.student_email === currentUser.email &&

    // ⭐ สำคัญ: ต้องมี assignment อยู่จริง
    allData.some(a =>
      a.type === 'assignment' &&
      a.__backendId === sub.assignment_id
    )
  )

  .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">✅ งานที่ส่งแล้ว</h2>
          <p class="text-sub">ทั้งหมด ${mySubmissions.length} งาน</p>
        </div>
        
        ${mySubmissions.length === 0 ? `
          <div class="text-center py-12 card-bg rounded-2xl">
            <div class="text-6xl mb-4">📝</div>
            <p class="text-main font-medium">ยังไม่ได้ส่งงาน</p>
          </div>
        ` : `
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${mySubmissions.map(sub => {
              const assignment = allData.find(d => d.type === 'assignment' && d.__backendId === sub.assignment_id);
              return `
<div class="assignment-card card-bg p-6 shadow-md space-y-3">
                  <h3 class="font-bold text-main text-lg mb-2">
  ${assignment ? assignment.title : 'งานนี้ถูกลบแล้ว'}
</h3>
                  <p class="text-sub text-sm mb-3">${assignment?.subject}</p>
<div class="flex justify-between items-center text-xs text-sub">
  <span>ส่งเมื่อ: ${new Date(sub.submitted_at).toLocaleDateString('th-TH')}</span>
</div>

<div class="mt-2">
  ${sub.score !== undefined && sub.score !== '' ? `
    <span class="accent-text font-bold text-lg">
      ${sub.score}/${assignment?.max_score}
    </span>
  ` : `
    <span class="inline-block bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs">
      รอตรวจ
    </span>
  `}
</div>
  ${Array.isArray(sub.files) && sub.files.length > 0 ? `
      <div class="mt-3">
    <p class="text-xs text-sub mb-1">📎 ไฟล์ที่ส่ง</p>
    <ul class="mt-2 space-y-1 text-sm">
    ${sub.files.map(f => `
      <li>
        <a href="${f.path}" target="_blank" class="text-blue-600 underline">
          ${fixFileName(f.name)}
        </a>
      </li>
    `).join('')}
  </ul>
  </div>
` : ''}
${sub.mood ? `<div class="text-xl mt-2 opacity-80">${sub.mood}</div>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;
    }

// Calendar (Student)
function renderCalendar() {
  const content = document.getElementById('mainContent');

  if (!currentUser || currentUser.role !== 'student') {
    content.innerHTML = `
      <p class="text-center text-main">หน้านี้สำหรับนักเรียนเท่านั้น</p>
    `;
    return;
  }
  // ===== เตรียมข้อมูลปฏิทินจริง =====
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-11

  const firstDay = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay(); // 0 = อาทิตย์

  const assignments = allData
    .filter(d =>
    d.type === 'assignment' &&
    d.deadline &&
    new Date(d.deadline) >= new Date()
  )
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  content.innerHTML = `
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-main mb-2">📅 ปฏิทินงาน</h2>
      <p class="text-sub">
        ${now.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}
      </p>
    </div>

<div class="card-bg rounded-2xl p-4 shadow-lg">
      <!-- ชื่อวัน -->
      <div class="grid grid-cols-7 gap-2 mb-4">
        ${['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(day => `
          <div class="text-center font-bold text-main">${day}</div>
        `).join('')}
      </div>

      <!-- ช่องวันที่ -->
<div class="grid grid-cols-7 gap-2 auto-rows-[72px]">

        <!-- ช่องว่างก่อนวันที่ 1 -->
        ${Array.from({ length: startDay }).map(() => `
          <div class="rounded-md bg-white/40"></div>
        `).join('')}

        <!-- วันที่จริง -->
        ${Array.from({ length: lastDate }, (_, i) => {
          const day = i + 1;
  const isToday =
    day === now.getDate() &&
    month === now.getMonth() &&
    year === now.getFullYear();
const assignmentCount = assignments.filter(a => {
  const d = new Date(a.deadline);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month &&
    d.getDate() === day
  );
}).length;

const hasAssignment = assignmentCount > 0;

return `
  <div
    ${hasAssignment
      ? `onclick="openDayAssignments('${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}')"`
      : ''
    }
class="
  calendar-day
  w-full 
  h-full
  p-1
  rounded-md
  text-center
  text-xs
  flex flex-col items-center justify-start
  ${hasAssignment ? 'cursor-pointer' : 'cursor-default'}
  ${
    hasAssignment
      ? 'bg-red-100 text-red-700 hover:bg-red-200'
      : 'bg-white text-gray-400'
  }
  ${isToday ? 'ring-2 ring-purple-400' : ''}
"
  >
    <span>${day}</span>

${assignmentCount > 0 ? `
<span class="mt-0.5 px-1 py-0 rounded-full
             bg-red-200 text-red-700
             text-[8px] font-medium leading-none">

  ${assignmentCount} งาน
</span>
` : ''}

  </div>
`;
        }).join('')}
      </div>

      <!-- งานใกล้ถึงกำหนด -->
      <div class="mt-6 space-y-3">
        <h3 class="font-bold text-main">งานที่ใกล้ถึงกำหนด</h3>

        ${assignments.length === 0 ? `
          <p class="text-sm text-sub">ยังไม่มีงาน</p>
        ` : assignments.slice(0, 3).map(assignment => `
          <div class="flex items-center justify-between p-3 secondary-bg rounded-lg">
            <div>
              <p class="font-medium text-main">${assignment.title}</p>
              <p class="text-xs text-sub">${assignment.subject}</p>
            </div>
            <span class="text-xs text-sub">
              📅 ${new Date(assignment.deadline).toLocaleDateString('th-TH')}
            </span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function openDayAssignments(dateStr) {
  const list = allData.filter(d =>
    d.type === 'assignment' &&
    d.deadline &&
    d.deadline.slice(0, 10) === dateStr
  );

  if (list.length === 0) {
    alert('วันนี้ไม่มีงาน 📭');
    return;
  }

  alert(
    'งานวันนี้:\n\n' +
    list.map(a => `• ${a.title}`).join('\n')
  );
}

        // Profile (Student)
    function renderProfile() {
      const content = document.getElementById('mainContent');
if (!currentUser || currentUser.role !== 'student') {
    content.innerHTML = `
      <p class="text-center text-main">หน้านี้สำหรับนักเรียนเท่านั้น</p>
    `;
    return;
  }
  const mySubmissions = allData.filter(d => d.type === 'submission' && d.student_email === currentUser.email);
const scoredSubmissions = mySubmissions.filter(
  s => s.score !== undefined && s.score !== ''
);
      const avgScore = scoredSubmissions.length > 0
  ? (
      scoredSubmissions.reduce(
        (sum, s) => sum + (Number(s.score) || 0),
        0
      ) / scoredSubmissions.length
    ).toFixed(2)
  : 0;
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">👤 โปรไฟล์นักเรียน</h2>
          <p class="text-sub">ข้อมูลส่วนตัวและสถิติ</p>
        </div>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="card-bg rounded-2xl p-6 shadow-lg">
            <div class="text-center">

              <h3 class="text-xl font-bold text-main">${currentUser.name} ${currentUser.surname}</h3>
              <p class="text-sub">เลขที่ ${currentUser.student_number}</p>
            </div>
<div class="relative w-24 h-24 mx-auto mb-4">
  ${
    currentUser.avatar
      ? `<img src="${currentUser.avatar}"
             class="w-24 h-24 rounded-full object-cover">`
      : `<div class="w-24 h-24 rounded-full accent-bg flex items-center justify-center text-white text-4xl font-bold">
           ${currentUser.name.charAt(0).toUpperCase()}
         </div>`
  }

  <button
    onclick="document.getElementById('profileAvatarInput').click()"
    class="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow"
    title="เปลี่ยนรูป">
    ✏️
  </button>
    <!-- ⭐ เพิ่มอันนี้ -->
  <input
    type="file"
    id="profileAvatarInput"
    accept="image/*"
    hidden
    onchange="uploadAvatar(this)"
  >
</div>
            </div>
            
            <form onsubmit="updateProfile(event)" class="mt-6 space-y-4">
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="profileName">ชื่อ</label>
                <input type="text" id="profileName" value="${currentUser.name}" class="w-full px-4 py-3 rounded-xl">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="profileSurname">นามสกุล</label>
                <input type="text" id="profileSurname" value="${currentUser.surname}" class="w-full px-4 py-3 rounded-xl">
              </div>
              
              <button type="submit" class="btn-primary w-full text-white py-3 rounded-xl font-medium">
                บันทึก
              </button>
            </form>
          </div>
          
          <div class="lg:col-span-2 space-y-6">
            <div class="card-bg rounded-2xl p-6 shadow-lg">
              <h3 class="font-bold text-main mb-4">📊 สถิติของฉัน</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="text-center">
                  <p class="text-3xl font-bold text-main">${mySubmissions.length}</p>
                  <p class="text-sm text-sub">งานที่ส่ง</p>
                </div>
                <div class="text-center">
                  <p class="text-3xl font-bold text-green-600">${currentUser.on_time_count || 0}</p>
                  <p class="text-sm text-sub">ส่งตรงเวลา</p>
                </div>
              </div>
            </div>
            
            <div class="card-bg rounded-2xl p-6 shadow-lg">
              <h3 class="font-bold text-main mb-4">🏆 เหรียญรางวัล</h3>
              <div class="flex gap-4 text-4xl">
                <span class="${mySubmissions.length >= 10 ? '' : 'opacity-30'}" title="ส่งงาน 10 ครั้ง">🥉</span>
                <span class="${mySubmissions.length >= 20 ? '' : 'opacity-30'}" title="ส่งงาน 20 ครั้ง">🥈</span>
                <span class="${mySubmissions.length >= 30 ? '' : 'opacity-30'}" title="ส่งงาน 30 ครั้ง">🥇</span>
                <span class="${mySubmissions.length >= 50 ? '' : 'opacity-30'}" title="ส่งงาน 50 ครั้ง">🎖️</span>
              </div>
            </div>
          </div>
        </div>
      `;
    }

        async function updateProfile(e) {
      e.preventDefault();
      if (!currentUser) return; // ⭐ เพิ่มบรรทัดนี้
      currentUser.name = document.getElementById('profileName').value;
      currentUser.surname = document.getElementById('profileSurname').value;
      const result = await window.dataSdk.update(currentUser);
      if (result.isOk) {
        showSuccessModal('บันทึกสำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
        updateUserDisplay();
      }
    }