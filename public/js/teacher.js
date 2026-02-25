function fixFileName(name) {
  try {
    return decodeURIComponent(escape(name));
  } catch (e) {
    return name;
  }
}

function getTeacherSubmissions() {
  if (!currentUser || currentUser.role !== 'teacher') return [];

  return allData.filter(sub => {
    if (sub.type !== 'submission') return false;

    const assignment = allData.find(
      a => a.type === 'assignment' && a.__backendId === sub.assignment_id
    );

    return assignment?.teacher_email === currentUser.email;
  });
}

function renderTeacherMySubmissions() {
  const content = document.getElementById('mainContent');

  if (currentUser?.role !== 'teacher') {
    content.innerHTML = `
      <p class="text-center text-red-500">
        ไม่มีสิทธิ์เข้าหน้านี้
      </p>
    `;
    return;
  }

const submissions = getTeacherSubmissions()
  .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">📥 รายการส่งงาน</h2>
          <p class="text-sub">ทั้งหมด ${submissions.length} รายการ</p>
        </div>
        
        ${submissions.length === 0 ? `
          <div class="text-center py-12 card-bg rounded-2xl">
            <div class="text-6xl mb-4">📭</div>
            <p class="text-main font-medium">ยังไม่มีการส่งงาน</p>
          </div>
        ` : `
          <div class="space-y-4">
            ${submissions.map(sub => {
              const student = allData.find(d => d.type === 'user' && d.email === sub.student_email);
              const assignment = allData.find(d => d.type === 'assignment' && d.__backendId === sub.assignment_id);
              return `
                <div class="card-bg rounded-xl p-6 shadow-md">
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-bold text-main">${assignment?.title || 'ไม่ระบุ'}</h3>
                      <p class="text-sub text-sm">นักเรียน: ${student?.name} ${student?.surname}</p>
                      <p class="text-sub text-xs">ส่งเมื่อ: ${
  sub.submitted_at
    ? new Date(sub.submitted_at).toLocaleDateString('th-TH')
    : '-'
}
</p>
${Array.isArray(sub.files) && sub.files.length > 0 ? `
  <ul class="mt-2 text-sm space-y-1">
    ${sub.files.map(f => `
      <li>
<a href="${f.path}" target="_blank" class="text-blue-600 underline">
  ${fixFileName(f.name)}
</a>
      </li>
    `).join('')}
  </ul>
` : ''}
                      ${sub.notes ? `<p class="text-sub text-sm mt-2">💬 ${sub.notes}</p>` : ''}
                      ${sub.mood ? `<p class="text-2xl mt-2">${sub.mood}</p>` : ''}
                    </div>
                    <div class="text-right">
${sub.score !== undefined && sub.score !== '' ? `
  <span class="text-2xl font-bold accent-text">
    ${sub.score}/${assignment?.max_score}
  </span>
` : `
  <button
    onclick="gradeSubmission('${sub.__backendId}')"
    class="accent-bg text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
    ให้คะแนน
  </button>
`}
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      `;
    }
let isGrading = false;

function gradeSubmission(submissionId) {
  if (!currentUser || currentUser.role !== 'teacher') {
    alert('ไม่มีสิทธิ์ให้คะแนน');
    return;
  }

  const submission = allData.find(d => d.__backendId === submissionId);
  if (!submission) return;

  // กันให้คะแนนซ้ำ
  if (submission.score !== undefined && submission.score !== '') {
    alert('รายการนี้ถูกให้คะแนนแล้ว');
    return;
  }

  const assignment = allData.find(
    d => d.type === 'assignment' && d.__backendId === submission.assignment_id
  );

  if (!assignment) return;

  // ⭐ เปิด modal แทน prompt
  openGradeModal(submission, assignment);
}
let gradingSubmission = null;
let gradingAssignment = null;

function openGradeModal(submission, assignment) {
  gradingSubmission = submission;
  gradingAssignment = assignment;

  const title = document.getElementById('gradeTitle');
  const input = document.getElementById('gradeInput');
  const modal = document.getElementById('gradeModal');

  if (!title || !input || !modal) return; // ⭐ กัน crash

  title.textContent = assignment.title;

  input.max = assignment.max_score;
  input.value = 0;

  input.oninput = e => updateStars(e.target.value);

  updateStars(0);

  modal.classList.remove('hidden');
}

function closeGradeModal() {
  document.getElementById('gradeModal').classList.add('hidden');

  gradingSubmission = null;
  gradingAssignment = null;
}

function updateStars(score) {
  score = Number(score);
  const stars = '★'.repeat(score) + '☆'.repeat(5 - score);
  document.getElementById('starPreview').textContent = stars;
}

async function saveGrade() {
  const score = Number(document.getElementById('gradeInput').value);

if (isNaN(score) || score < 0 || score > gradingAssignment.max_score) {
  alert('คะแนนไม่ถูกต้อง');
  return;
}

  gradingSubmission.score = score;

  await window.dataSdk.update(gradingSubmission);

  closeGradeModal();

  showSuccessModal('ให้คะแนนสำเร็จ', 'บันทึกคะแนนเรียบร้อยแล้ว');

  renderTeacherMySubmissions();
}
        // Students Management
    function renderStudents() {
      const content = document.getElementById('mainContent');
      // ⭐ กันสิทธิ์ตรงนี้
  if (!currentUser || currentUser.role !== 'teacher') {
    content.innerHTML = `
      <p class="text-center text-red-500">
        หน้านี้สำหรับอาจารย์เท่านั้น
      </p>
    `;
    return;
  }
      const students = allData.filter(d => d.type === 'user' && d.role === 'student')
.sort(
  (a, b) =>
    parseInt(a.student_number || 0) -
    parseInt(b.student_number || 0)
);
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">👥 จัดการนักเรียน</h2>
          <p class="text-sub">ทั้งหมด ${students.length} คน</p>
        </div>
        
        ${students.length === 0 ? `
          <div class="text-center py-12 card-bg rounded-2xl">
            <div class="text-6xl mb-4">👤</div>
            <p class="text-main font-medium">ยังไม่มีนักเรียน</p>
          </div>
        ` : `
          <div class="card-bg rounded-2xl overflow-hidden shadow-lg">
            <table class="w-full">
              <thead class="accent-bg text-white">
                <tr>
                  <th class="px-6 py-4 text-left">เลขที่</th>
                  <th class="px-6 py-4 text-left">ชื่อ-นามสกุล</th>
                  <th class="px-6 py-4 text-left">อีเมล</th>
                  <th class="px-6 py-4 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody>
                ${students.map((student, index) => `
                  <tr class="${index % 2 === 0 ? 'secondary-bg' : ''}">
                    <td class="px-6 py-4 text-main font-medium">${student.student_number}</td>
                    <td class="px-6 py-4 text-main">${student.name} ${student.surname}</td>
                    <td class="px-6 py-4 text-sub">${student.email}</td>
                    <td class="px-6 py-4 text-center">
                      <button onclick="deleteStudent('${student.__backendId}')" class="text-red-500 hover:text-red-700">
                        <svg class="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      `;
    }

async function deleteStudent(studentId) {
  const student = allData.find(d => d.__backendId === studentId);
  if (!student) return;

  // 🔴 ยืนยันก่อนลบ
  const ok = confirm(`ต้องการลบนักเรียน ${student.name} ${student.surname} ใช่หรือไม่?`);
  if (!ok) return;

  const result = await window.dataSdk.delete(student);
  if (result.isOk) {
    allData = allData.filter(d => d.__backendId !== studentId);
    showSuccessModal('ลบสำเร็จ', 'ลบนักเรียนออกจากระบบแล้ว');
    renderStudents(); // รีเฟรชตาราง
  }
}

        // Dashboard
    function renderDashboard() {
      const content = document.getElementById('mainContent');
      const students = allData.filter(d => d.type === 'user' && d.role === 'student');
const assignments = allData.filter(
  d =>
    d.type === 'assignment' &&
    d.teacher_email === currentUser.email
);
const submissions = getTeacherSubmissions()
  .sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">📊 Dashboard</h2>
          <p class="text-sub">ภาพรวมของระบบ</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card-bg rounded-xl p-6 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sub text-sm">นักเรียนทั้งหมด</p>
                <p class="text-3xl font-bold text-main mt-2">${students.length}</p>
              </div>
              <div class="text-4xl">👥</div>
            </div>
          </div>
          
          <div class="card-bg rounded-xl p-6 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sub text-sm">งานทั้งหมด</p>
                <p class="text-3xl font-bold text-main mt-2">${assignments.length}</p>
              </div>
              <div class="text-4xl">📚</div>
            </div>
          </div>
          
          <div class="card-bg rounded-xl p-6 shadow-md">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sub text-sm">การส่งงาน</p>
                <p class="text-3xl font-bold text-main mt-2">${submissions.length}</p>
              </div>
              <div class="text-4xl">📥</div>
            </div>
          </div>
        </div>
        
        <div class="card-bg rounded-xl p-6 shadow-md">
          <h3 class="font-bold text-main mb-4">📈 กราฟสถิติ</h3>
          <canvas id="statsChart" width="400" height="200"></canvas>
        </div>
      `;
    }

        // Heatmap
  function renderHeatmap() {
const content = document.getElementById('mainContent');
const submissions = getTeacherSubmissions();
      
      // สร้าง map ของจำนวนการส่งงานตามวันที่
const submissionsByDate = {};

submissions.forEach(sub => {
  if (!sub.submitted_at) return;
  const key = new Date(sub.submitted_at).toISOString().slice(0, 10);
  submissionsByDate[key] = (submissionsByDate[key] || 0) + 1;
});

const days = Array.from({ length: 365 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (364 - i));
    return d;
  });
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">🗓️ Heatmap</h2>
          <p class="text-sub">แสดงกิจกรรมการส่งงานตลอดปี</p>
        </div>
        
        <div class="card-bg rounded-2xl p-8 shadow-lg">
          <div class="flex gap-2 flex-wrap">
        ${days.map(date => {
          const key = date.toISOString().slice(0,10);
          const count = submissionsByDate[key] || 0;
          const level =
            count === 0 ? 0 :
            count <= 2 ? 1 :
            count <= 4 ? 2 :
            count <= 6 ? 3 : 4;

          return `<div
            class="heatmap-cell level-${level}"
            title="${date.toLocaleDateString('th-TH')} : ${count} งาน"
          ></div>`;
        }).join('')}
      </div>
          
          <div class="flex items-center gap-4 mt-6 justify-center">
            <span class="text-xs text-sub">น้อย</span>
            <div class="heatmap-cell level-0"></div>
            <div class="heatmap-cell level-1"></div>
            <div class="heatmap-cell level-2"></div>
            <div class="heatmap-cell level-3"></div>
            <div class="heatmap-cell level-4"></div>
            <span class="text-xs text-sub">มาก</span>
          </div>
          
          ${submissions.length === 0 ? `
            <div class="text-center mt-6 p-4 bg-yellow-50 rounded-lg">
              <p class="text-sm text-yellow-700">ยังไม่มีข้อมูลการส่งงาน - Heatmap จะแสดงเมื่อมีนักเรียนส่งงาน</p>
            </div>
          ` : ''}
        </div>
      `;
    }

        // Rubric
    function renderRubric() {
      const content = document.getElementById('mainContent');
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">📋 Rubric Template</h2>
          <p class="text-sub">แม่แบบเกณฑ์การให้คะแนน - ใช้เป็นแนวทางในการประเมินงานนักเรียน</p>
        </div>
        
        <div class="card-bg rounded-2xl p-8 shadow-lg">
          <div class="mb-6 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-700">💡 <strong>Rubric คืออะไร?</strong> เป็นตารางเกณฑ์การให้คะแนนที่บอกระดับคุณภาพงาน ช่วยให้การให้คะแนนเป็นธรรมและมีมาตรฐานเดียวกัน</p>
          </div>
          
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="accent-bg text-white">
                  <th class="px-4 py-3 text-left">หัวข้อประเมิน</th>
                  <th class="px-4 py-3 text-center">ดีเยี่ยม (5)</th>
                  <th class="px-4 py-3 text-center">ดี (4)</th>
                  <th class="px-4 py-3 text-center">ปานกลาง (3)</th>
                  <th class="px-4 py-3 text-center">พอใช้ (2)</th>
                  <th class="px-4 py-3 text-center">ปรับปรุง (1)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="px-4 py-3 font-medium text-main">เนื้อหา</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ครบถ้วน ถูกต้อง ลึกซึ้ง</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ครบถ้วน ถูกต้อง</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ครบ แต่ไม่ลึก</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ไม่ครบถ้วน</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ไม่ถูกต้อง</td>
                </tr>
                <tr class="secondary-bg">
                  <td class="px-4 py-3 font-medium text-main">การนำเสนอ</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">สวยงาม เป็นระเบียบมาก</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">สวยงาม เป็นระเบียบ</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ปานกลาง อ่านได้</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ธรรมดา อ่านยาก</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ไม่เป็นระเบียบ</td>
                </tr>
                <tr>
                  <td class="px-4 py-3 font-medium text-main">ความคิดสร้างสรรค์</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">แปลกใหม่ โดดเด่นมาก</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">มีความคิดสร้างสรรค์</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ปานกลาง</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ธรรมดา</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ไม่มีความคิดสร้างสรรค์</td>
                </tr>
                <tr class="secondary-bg">
                  <td class="px-4 py-3 font-medium text-main">ความตรงเวลา</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ส่งก่อนกำหนด</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ส่งตรงเวลา</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ส่งช้า 1-2 วัน</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ส่งช้า 3-5 วัน</td>
                  <td class="px-4 py-3 text-sm text-sub text-center">ส่งช้ามาก</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="mt-6 p-4 bg-green-50 rounded-lg">
            <p class="text-sm text-green-700">✅ <strong>วิธีใช้:</strong> ใช้ตารางนี้เป็นแนวทางในการประเมินงานนักเรียนแต่ละหัวข้อ แล้วรวมคะแนนทั้งหมด</p>
          </div>
        </div>
      `;
    }

        // Export PDF
    function renderExport() {
      const content = document.getElementById('mainContent');
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">📄 ส่งออกรายงาน PDF</h2>
          <p class="text-sub">สร้างรายงานสรุปผล</p>
        </div>
        
        <div class="card-bg rounded-2xl p-8 max-w-2xl shadow-lg">
          <div class="space-y-6">
            <div class="text-center py-8">
              <div class="text-6xl mb-4">📑</div>
              <p class="text-main font-medium mb-2">เลือกประเภทรายงาน</p>
              <p class="text-sub text-sm">สร้างรายงานเป็นไฟล์ PDF</p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <button onclick="exportPDF('students')" class="card-bg border-2 border-purple-200 hover:border-purple-400 p-6 rounded-xl text-center transition-all">
                <div class="text-3xl mb-2">👥</div>
                <p class="font-medium text-main">รายชื่อนักเรียน</p>
              </button>
              
              <button onclick="exportPDF('submissions')" class="card-bg border-2 border-purple-200 hover:border-purple-400 p-6 rounded-xl text-center transition-all">
                <div class="text-3xl mb-2">📊</div>
                <p class="font-medium text-main">สรุปการส่งงาน</p>
              </button>
            </div>
          </div>
        </div>
      `;
    }

        // Teacher Profile
    function renderTeacherProfile() {
      const content = document.getElementById('mainContent');
      
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">👤 โปรไฟล์อาจารย์</h2>
          <p class="text-sub">จัดการข้อมูลส่วนตัว</p>
        </div>
        
        <div class="card-bg rounded-2xl p-8 max-w-2xl shadow-lg">
          <div class="text-center mb-8">
            <h3 class="text-xl font-bold text-main">${currentUser.name} ${currentUser.surname}</h3>
            <p class="text-sub">อาจารย์</p>
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
    onclick="document.getElementById('avatarInput').click()"
    class="absolute bottom-0 right-0 bg-purple-500 text-white p-2 rounded-full shadow"
    title="เปลี่ยนรูป">
    ✏️
  </button>

    <input
    type="file"
    id="avatarInput"
    accept="image/*"
    class="hidden"
    onchange="uploadAvatar(this)"
  >
</div> 
          <form onsubmit="updateTeacherProfile(event)" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="teacherName">ชื่อ</label>
                <input type="text" id="teacherName" value="${currentUser.name}" class="w-full px-4 py-3 rounded-xl">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="teacherSurname">นามสกุล</label>
                <input type="text" id="teacherSurname" value="${currentUser.surname}" class="w-full px-4 py-3 rounded-xl">
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium text-main mb-2" for="teacherEmail">อีเมล</label>
              <input type="email" id="teacherEmail" value="${currentUser.email}" disabled class="w-full px-4 py-3 rounded-xl bg-gray-100">
            </div>
            
            <button type="submit" class="btn-primary w-full text-white py-3 rounded-xl font-medium">
              บันทึกข้อมูล
            </button>
          </form>
        </div>
      `;
    }
        
async function updateTeacherProfile(e) {
  e.preventDefault();

  if (!currentUser || currentUser.role !== 'teacher') return;

  currentUser.name = document.getElementById('teacherName').value;
  currentUser.surname = document.getElementById('teacherSurname').value;

  const result = await window.dataSdk.update(currentUser);
  if (result.isOk) {
    showSuccessModal('บันทึกสำเร็จ', 'อัปเดตข้อมูลเรียบร้อยแล้ว');
    updateUserDisplay();
  }
}

