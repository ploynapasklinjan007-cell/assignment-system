function isAssignmentOverdue(deadlineStr) {
  if (!deadlineStr) return false;

  const deadline = new Date(deadlineStr);
  deadline.setHours(23, 59, 59, 999); // หมดจริงตอนสิ้นวัน

  return deadline < new Date();
}

function fixFileName(name) {
  try {
    return decodeURIComponent(escape(name));
  } catch (e) {
    return name; // ถ้าแปลงไม่ได้ ก็ใช้ชื่อเดิม
  }
}

let deleteAssignmentId = null;

function renderAssignments() {
  console.log('🧩 assignments count =',
  allData.filter(d => d.type === 'assignment').length
);

  console.log('🧪 currentUser:', currentUser);
  console.log('🧪 allData:', allData);
  console.log(
    '🧪 assignments after filter:',
    Array.isArray(allData)
      ? allData.filter(d => d.type === 'assignment')
      : 'allData not ready'
  );
  const content = document.getElementById('mainContent');
  content.innerHTML = '';
  if (!Array.isArray(allData)) {
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="text-sub">⏳ กำลังโหลดข้อมูลงาน...</p>
      </div>
    `;
    return;
  }
  // ❌ ยังไม่ login
  if (!currentUser) {
    content.innerHTML = `
      <div class="text-center py-12">
        <p class="text-main">กรุณาเข้าสู่ระบบเพื่อดูงาน</p>
      </div>
    `;
    return;
  }

  const isTeacher = currentUser.role === 'teacher';

const assignments = allData
  .filter(d =>
    d.type === 'assignment' &&
    (currentUser.role === 'teacher'
      ? d.teacher_email === currentUser.email
      : true)
  )
  .sort((a, b) =>
    new Date(a.deadline || 0) - new Date(b.deadline || 0)
  );

  // ❌ ไม่มีงานเลย
  if (assignments.length === 0) {
    content.innerHTML = `
    <h2 class="text-2xl font-bold mb-6">📚 งานทั้งหมด</h2>
    
      <div class="text-center py-12 card-bg rounded-2xl">
        <div class="text-6xl mb-4">📝</div>
        <p class="text-main font-medium">ยังไม่มีงาน</p>
        ${
          isTeacher
            ? `<p class="text-sub mt-2">กด “สร้างงานใหม่” เพื่อเริ่มต้น</p>`
            : `<p class="text-sub mt-2">รออาจารย์มอบหมายงาน</p>`
        }
      </div>
    `;
    return;
  }

  const cardsHTML = assignments.map(assignment => {
    const allSubmissions = allData.filter(d =>
      d.type === 'submission' &&
      d.assignment_id === assignment.__backendId
    );

const mySubmission = allData.find(d =>
  d.type === 'submission' &&
  d.assignment_id === assignment.__backendId &&
  d.student_email === currentUser?.email
);

let isOverdue = false;

if (currentUser.role === 'student') {
  const hasSubmitted = !!mySubmission;

  isOverdue =
    isAssignmentOverdue(assignment.deadline) &&
    !hasSubmitted;
}

const attachments = Array.isArray(assignment.attachments)
  ? assignment.attachments
  : [];

const attachmentsHTML =
  attachments.length > 0
    ? `
      <div class="mt-3 pt-3 border-t">
        <p class="text-sm font-medium">📎 ไฟล์จากอาจารย์</p>
        <ul class="text-sm space-y-1">
${attachments.map(f => `
  <li>
    <a href="${f.path}" target="_blank"
       class="text-blue-600 underline">
      ${fixFileName(f.name)}
    </a>
  </li>
`).join('')}
        </ul>
      </div>
    `
    : '';

    return `
      <div class="assignment-card card-bg p-6 shadow-md
            hover:shadow-lg hover:-translate-y-0.5 transition">
<h3 class="font-bold text-lg text-main flex items-center gap-2">
  ${assignment.title}
  ${isOverdue
    ? `<span class="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">ค้าง</span>`
    : ''
  }
</h3>

<p class="text-sm text-sub">${assignment.subject}</p>

<p class="text-xs mt-1 ${isOverdue ? 'text-red-500' : 'text-sub'}">
  📅 ${assignment.deadline
    ? new Date(assignment.deadline).toLocaleDateString('th-TH')
    : '-'}
</p>

        ${attachmentsHTML}

        ${
          isTeacher
            ? `
              <div class="mt-4 flex justify-between items-center text-sm">
                <span>📥 ส่งแล้ว ${allSubmissions.length} คน</span>
                      <div class="flex gap-3">
        <button
          onclick="reuseAssignment('${assignment.__backendId}')"
          class="text-purple-600 hover:underline text-xs">
          📄 คัดลอก & แก้ไข
        </button>
                <button
                  onclick="showDeleteModal('${assignment.__backendId}')"
                  class="text-red-500 hover:underline text-xs">
                  ลบงาน
                </button>
              </div>
            </div>
            `
            :   mySubmission
    ? `  <button
      onclick="showSubmitModal('${assignment.__backendId}')"
      class="w-full mt-4 bg-blue-500 text-white py-2 rounded-lg">
      📎 ดูงาน / ส่งอีกครั้ง
    </button>
  `
    : isOverdue
      ? `<div class="mt-4 text-red-500 text-sm">⏰ หมดเขตส่ง</div>`
      : `
    <button
      onclick="showSubmitModal('${assignment.__backendId}')"
      class="w-full mt-4 accent-bg text-white py-2 rounded-lg">
      ส่งงาน
    </button>
              `
        }
      </div>
    `;
  }).join('');
// ===== MINI DASHBOARD CARDS =====
const totalAssignments = assignments.length;

const submittedCount = currentUser.role === 'teacher'
  ? allData.filter(d =>
      d.type === 'submission' &&
      assignments.some(a => a.__backendId === d.assignment_id)
    ).length
  : allData.filter(d =>
      d.type === 'submission' &&
      d.student_email === currentUser.email
    ).length;

const overdueCount = assignments.filter(a =>
  isAssignmentOverdue(a.deadline)
).length;

const statusText =
  overdueCount > 0
    ? 'มีงานค้าง 😵‍💫'
    : submittedCount === totalAssignments
      ? 'ครบทุกงาน 🎉'
      : 'กำลังเรียน 🌱';

let miniCardsHTML = '';

if (currentUser.role === 'student') {
  miniCardsHTML = `
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">

      <div class="card-bg rounded-2xl p-4 shadow-sm">
        <div class="text-3xl">📚</div>
        <p class="text-xs text-sub">งานทั้งหมด</p>
        <p class="text-2xl font-bold">${totalAssignments}</p>
      </div>

      <div class="card-bg rounded-2xl p-4 shadow-sm">
        <div class="text-3xl">✅</div>
        <p class="text-xs text-sub">ส่งแล้ว</p>
        <p class="text-2xl font-bold text-green-600">${submittedCount}</p>
      </div>

      <div class="card-bg rounded-2xl p-4 shadow-sm">
        <div class="text-3xl">⏰</div>
        <p class="text-xs text-sub">หมดเขต</p>
        <p class="text-2xl font-bold text-red-500">${overdueCount}</p>
      </div>

      <div class="card-bg rounded-2xl p-4 shadow-sm">
        <div class="text-3xl">🌸</div>
        <p class="text-xs text-sub">สถานะ</p>
        <p class="text-sm font-medium text-purple-600">${statusText}</p>
      </div>

    </div>
  `;
}

// ⭐ ตรงนี้ต้องอยู่นอก if
content.innerHTML = `
  ${miniCardsHTML}
  <h2 class="text-2xl font-bold mb-6">📚 งานทั้งหมด</h2>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
    ${cardsHTML}
  </div>
`;
const ids = assignments.map(a => a.__backendId);
console.log('IDs:', ids);
console.log('Unique IDs:', new Set(ids));

}
window.renderAssignments = renderAssignments;

let currentAssignmentId = null;

        // Submit Modal Functions
function showSubmitModal(assignmentId) {
  currentAssignmentId = assignmentId;

  const existingSubmission = allData.find(d =>
    d.type === 'submission' &&
    d.assignment_id === assignmentId &&
    d.student_email === currentUser.email
  );

  openModal('submitModal');

  submitFiles = [];
  document.getElementById('submitNotes').value = '';

  document.getElementById('submitFileList').innerHTML = '';

  if (existingSubmission) {
    renderExistingSubmissionFiles(existingSubmission);
  } else {
    renderSubmitFileList();
  }
}

function renderExistingSubmissionFiles(submission) {
  const ul = document.getElementById('submitFileList');

  
  if (!Array.isArray(submission.files) || submission.files.length === 0) {
    ul.innerHTML = `<li class="text-sm text-sub">ยังไม่มีไฟล์</li>`;
    return;
  }
  ul.innerHTML = submission.files.map(f => `
    <li class="flex justify-between items-center">
      <a href="${f.path}" target="_blank" class="text-blue-600 underline">
        📄 ${fixFileName(f.name)}
      </a>
      <span class="text-xs text-sub">ไฟล์เดิม</span>
      </div>

      <!-- ⭐ จุดที่ 2 ใส่ตรงนี้ -->
      <span class="text-xs text-gray-500">
        แนบไฟล์ใหม่เพื่อแทนที่ไฟล์เดิม
      </span>
    </li>
  `).join('');
}

function hideSubmitModal() {
  closeModal('submitModal');
  currentAssignmentId = null;
}
function showDeleteModal(id) {
  if (currentUser.role !== 'teacher') return;

  deleteAssignmentId = id;
  openModal('deleteModal');
  document.getElementById('confirmDeleteBtn').onclick = deleteAssignment;
}

function hideDeleteModal() {
  deleteAssignmentId = null;
  closeModal('deleteModal');
}
let isSubmitting = false;

async function handleSubmitAssignment(e) {
  e.preventDefault();
  if (isSubmitting) return;
  isSubmitting = true;

  try {
    if (!currentUser || currentUser.role !== 'student') {
      alert('เฉพาะนักเรียนเท่านั้น');
      return;
    }

    if (!currentAssignmentId) {
      alert('ไม่พบงาน');
      return;
    }

    if (submitFiles.length === 0) {
      alert('กรุณาแนบไฟล์อย่างน้อย 1 ไฟล์');
      return;
    }

    const assignment = allData.find(d => d.__backendId === currentAssignmentId);
    if (!assignment) {
      alert('ไม่พบข้อมูลงาน');
      return;
    }

    if (isAssignmentOverdue(assignment.deadline)) {
      alert('หมดเขตส่งงานแล้ว');
      hideSubmitModal();
      return;
    }

    // ⭐ หา submission เดิม
    const existingSubmission = allData.find(d =>
      d.type === 'submission' &&
      d.assignment_id === currentAssignmentId &&
      d.student_email === currentUser.email
    );

    // ⭐ upload files ก่อน
    const formData = new FormData();
    submitFiles.forEach(f => formData.append('files', f));

    const res = await fetch('/api/upload/submission-files', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      alert('อัปโหลดไฟล์ไม่สำเร็จ');
      return;
    }

    const data = await res.json(); // data.files

    if (!existingSubmission) {
      await window.dataSdk.create({
        type: 'submission',
        assignment_id: currentAssignmentId,
        student_email: currentUser.email,
        submitted_at: new Date().toISOString(),
        files: data.files,
        notes: document.getElementById('submitNotes').value || '',
        score: ''
      });
    } else {
      existingSubmission.files = data.files;
      existingSubmission.submitted_at = new Date().toISOString();
      existingSubmission.notes =
        document.getElementById('submitNotes').value || '';

      await window.dataSdk.update(existingSubmission);
    }

    submitFiles = [];
    hideSubmitModal();
    showSuccessModal('ส่งงานสำเร็จ', 'อัปเดตไฟล์เรียบร้อยแล้ว 📎');
    switchView('assignments');

  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาด');
  } finally {
    isSubmitting = false;
  }
}

        // Reuse Assignment
let reuseDraftAssignment = null;

async function reuseAssignment(assignmentId) {
  // ❌ ต้องเป็นอาจารย์เท่านั้น
  if (!currentUser || currentUser.role !== 'teacher') return;

  const assignment = allData.find(d => d.__backendId === assignmentId);
  if (!assignment) return;

  // ⭐ เก็บ draft ไว้ (ยังไม่สร้างจริง)
  reuseDraftAssignment = {
    subject: assignment.subject || '',
    title: (assignment.title || '') + ' (คัดลอก)',
    description: assignment.description || '',
    max_score: assignment.max_score || '',
    attachments: assignment.attachments || [],

    // ⭐ เพิ่มใหม่: กำหนดส่ง +7 วัน (สำหรับ input type="date")
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10)
  };

  // 👉 ไปหน้า “สร้างงานใหม่”
  switchView('create');
}

        // Create Assignment
    function renderCreateAssignment() {
      const content = document.getElementById('mainContent');
      content.innerHTML = `
        <div class="mb-6">
          <h2 class="text-2xl font-bold text-main mb-2">➕ สร้างงานใหม่</h2>
          <p class="text-sub">กรอกข้อมูลเพื่อสร้างงานให้นักเรียน</p>
        </div>
        
        <div class="card-bg rounded-2xl p-8 max-w-2xl shadow-lg">
          <form id="createForm" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-main mb-2" for="subject">ชื่อวิชา</label>
              <input type="text" id="subject" required class="w-full px-4 py-3 rounded-xl" placeholder="เช่น คณิตศาสตร์">
            </div>
            
            <div>
              <label class="block text-sm font-medium text-main mb-2" for="title">ชื่องาน</label>
              <input type="text" id="title" required class="w-full px-4 py-3 rounded-xl" placeholder="เช่น แบบฝึกหัดที่ 1">
            </div>
            <!-- แนบไฟล์ประกอบการสอน -->
<div>
  <label class="block text-sm font-medium text-main mb-2">
    📎 ไฟล์ประกอบการสอน (แนบได้หลายไฟล์)
  </label>

  <input
    type="file"
    id="assignmentFiles"
    multiple
    accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.png"
    class="w-full px-4 py-3 rounded-xl"
  >

  <p class="text-xs text-sub mt-1">
    รองรับ: PDF, Word, PowerPoint, รูปภาพ
  </p>
</div>

            <div>
              <label class="block text-sm font-medium text-main mb-2" for="description">รายละเอียด</label>
              <textarea id="description" rows="4" class="w-full px-4 py-3 rounded-xl" placeholder="อธิบายงานที่มอบหมาย..."></textarea>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="maxScore">คะแนนเต็ม</label>
                <input type="number" id="maxScore" required min="1" class="w-full px-4 py-3 rounded-xl" placeholder="100">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-main mb-2" for="deadline">กำหนดส่ง</label>
                <input type="date" id="deadline" required class="w-full px-4 py-3 rounded-xl">
              </div>
            </div>
            
            <button type="submit" class="btn-primary w-full text-white py-3 rounded-xl font-medium">
              สร้างงาน
            </button>
          </form>
        </div>
      `;
       // 2️⃣ ⭐ เติมข้อมูล ถ้ามาจาก reuse
           document
  .getElementById('createForm')
  .addEventListener('submit', handleCreateAssignment);
  
  if (reuseDraftAssignment) {
      showSuccessModal(
    'โหมดคัดลอกงาน',
    'คุณกำลังแก้ไขงานจากแม่แบบเดิม'
  );
    document.getElementById('subject').value =
      reuseDraftAssignment.subject || '';

    document.getElementById('title').value =
      reuseDraftAssignment.title || '';

    document.getElementById('description').value =
      reuseDraftAssignment.description || '';

    document.getElementById('maxScore').value =
      reuseDraftAssignment.max_score || '';
        
      // ⭐ อันนี้คือของใหม่ (สำคัญ)
  if (reuseDraftAssignment.deadline) {
    document.getElementById('deadline').value =
      reuseDraftAssignment.deadline;
      
  }

    // ล้าง draft หลังใช้
    reuseDraftAssignment = null;
  }
    }

async function handleCreateAssignment(e) {
  e.preventDefault();
  if (allData.length >= 999) {
    alert('ระบบเต็ม ไม่สามารถสร้างงานใหม่ได้');
    return;
  }

  // 1️⃣ อัปโหลดไฟล์ก่อน
  const fileInput = document.getElementById('assignmentFiles');
  let attachments = [];

  if (fileInput.files.length > 0) {
    const formData = new FormData();

    Array.from(fileInput.files).forEach(file => {
      formData.append('files', file);
    });

    const res = await fetch('/api/upload/assignment-files', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    attachments = data.files; // [{ name, path }]
  }

  const deadlineValue = document.getElementById('deadline').value;
if (!deadlineValue) {
  alert('กรุณาเลือกกำหนดส่ง');
  return;
}

  // 2️⃣ ค่อยสร้าง assignment
  const assignment = {
    type: 'assignment',
    teacher_email: currentUser.email,
    subject: document.getElementById('subject').value,
    title: document.getElementById('title').value,
    description: document.getElementById('description').value || '',
    max_score: document.getElementById('maxScore').value,
    deadline: new Date(document.getElementById('deadline').value).toISOString(),
    created_at: new Date().toISOString(),
    attachments // ⭐ สำคัญ
  };

  const result = await window.dataSdk.create(assignment);

  if (result.isOk) {
    assignment.__backendId = result.data.__backendId; // สำคัญมาก

    showSuccessModal('สร้างงานสำเร็จ', 'แนบไฟล์ให้นักเรียนเรียบร้อยแล้ว 📎');
    switchView('assignments');
  }
}

window.handleCreateAssignment = handleCreateAssignment;

function fileIcon(name) {
  if (name.endsWith('.pdf')) return '📕';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return '📘';
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return '📊';
  return '📎';
}
function handleAddSubmitFiles(input) {
  Array.from(input.files).forEach(file => {
    submitFiles.push(file);
  });

  input.value = ''; // สำคัญ: เลือกไฟล์ซ้ำได้
  renderSubmitFileList();
}
let submitFiles = [];
function renderSubmitFileList() {
  const list = document.getElementById('submitFileList');

  if (submitFiles.length === 0) {
    list.innerHTML = `
      <li class="text-sm text-gray-400">
        ยังไม่ได้เลือกไฟล์
      </li>
    `;
    return;
  }

  list.innerHTML = submitFiles.map((file, index) => `
    <li class="flex justify-between items-center bg-gray-100 px-3 py-2 rounded-lg">
      <span class="truncate max-w-[240px]" title="${file.name}">
        📄 ${fixFileName(file.name)}
      </span>
      <button
        type="button"
        onclick="removeSubmitFile(${index})"
        class="text-red-500 text-xs"
      >
        ลบ
      </button>
    </li>
  `).join('');
}

function removeSubmitFile(index) {
  submitFiles.splice(index, 1);
  renderSubmitFileList();
}
let isDeleting = false;

async function deleteAssignment() {
  // 🔒 กันกดรัว
  if (isDeleting) return;
  isDeleting = true;

  try {
    // 🔒 เช็กสิทธิ์ก่อน
    if (!currentUser || currentUser.role !== 'teacher') {
      alert('ไม่มีสิทธิ์ลบงาน');
      return;
    }

    const assignment = allData.find(
      d => d.__backendId === deleteAssignmentId
    );

    if (!assignment) {
      alert('ไม่พบงานที่ต้องการลบ');
      return;
    }

    // 🔒 เช็กว่าเป็นงานของอาจารย์คนนี้จริง
    if (assignment.teacher_email !== currentUser.email) {
      alert('คุณไม่มีสิทธิ์ลบงานของอาจารย์ท่านอื่น');
      return;
    }
    
const relatedSubs = allData.filter(d =>
  d.type === 'submission' &&
  d.assignment_id === deleteAssignmentId
);

for (const sub of relatedSubs) {
  await window.dataSdk.delete(sub);
}

    const result = await window.dataSdk.delete(assignment);

    if (result.isOk) {
      // 🧹 ลบ assignment + submission ที่เกี่ยวข้อง
      allData = allData.filter(d =>
        d.__backendId !== deleteAssignmentId &&
        d.assignment_id !== deleteAssignmentId
      );

      hideDeleteModal();
      renderAssignments();

      showSuccessModal('ลบสำเร็จ', 'งานถูกลบแล้ว');
    } else {
      alert('ลบงานไม่สำเร็จ');
    }

  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาดขณะลบงาน');
  } finally {
    deleteAssignmentId = null;
    isDeleting = false;
  }
}

