let pendingUserData = null;
    // Auth Functions
function showAuthModal(role) {
  selectedRole = role;
  openModal('authModal');

  const roleText = role === 'student' ? 'นักเรียน' : 'อาจารย์';
  const roleIcon = role === 'student' ? '🎓' : '👨‍🏫';
      
      document.getElementById('authContent').innerHTML = `
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">${roleIcon}</div>
          <h2 class="text-xl font-bold text-gray-800">${roleText}</h2>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <button onclick="showLoginForm()" class="bg-white/80 backdrop-blur-sm p-4 rounded-xl hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-400">
            <div class="text-2xl mb-2">🔑</div>
            <p class="font-medium text-gray-800">เข้าสู่ระบบ</p>
            <p class="text-xs text-gray-600">สำหรับสมาชิก</p>
          </button>
          
          <button onclick="showSignupForm()" class="bg-white/80 backdrop-blur-sm p-4 rounded-xl hover:shadow-md transition-all border-2 border-purple-200 hover:border-purple-400">
            <div class="text-2xl mb-2">✨</div>
            <p class="font-medium text-gray-800">สมัครสมาชิก</p>
            <p class="text-xs text-gray-600">สมาชิกใหม่</p>
          </button>
        </div>
        
        <button onclick="showLandingPage()" class="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm">
          ← กลับ
        </button>
      `;
    }

        function showLoginForm() {
      document.getElementById('authContent').innerHTML = `
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">🔑</div>
          <h2 class="text-xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
        </div>
        
        <form onsubmit="handleLogin(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="loginEmail">อีเมล</label>
            <input type="email" id="loginEmail" required class="w-full px-4 py-3 rounded-xl bg-white/80 border-2 border-purple-200 focus:border-purple-400" placeholder="email@example.com">
          </div>
          
          <button type="submit" class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium">
            เข้าสู่ระบบ
          </button>
        </form>
        
        <button onclick="showAuthModal('${selectedRole}')" class="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm">
          ← กลับ
        </button>
      `;
    }

        function showSignupForm() {
      const isStudent = selectedRole === 'student';
      
      document.getElementById('authContent').innerHTML = `
        <div class="text-center mb-6">
          <div class="text-4xl mb-2">✨</div>
          <h2 class="text-xl font-bold text-gray-800">สมัครสมาชิก</h2>
        </div>
        
        <form onsubmit="handleSignup(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="signupEmail">อีเมล</label>
            <input type="email" id="signupEmail" required class="w-full px-4 py-3 rounded-xl bg-white/80 border-2 border-purple-200 focus:border-purple-400" placeholder="email@example.com">
          </div>
          
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="signupName">ชื่อ</label>
              <input type="text" id="signupName" required class="w-full px-4 py-3 rounded-xl bg-white/80 border-2 border-purple-200 focus:border-purple-400" placeholder="ชื่อ">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1" for="signupSurname">นามสกุล</label>
              <input type="text" id="signupSurname" required class="w-full px-4 py-3 rounded-xl bg-white/80 border-2 border-purple-200 focus:border-purple-400" placeholder="นามสกุล">
            </div>
          </div>
          
          ${isStudent ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1" for="signupNumber">เลขที่</label>
            <input type="text" id="signupNumber" required class="w-full px-4 py-3 rounded-xl bg-white/80 border-2 border-purple-200 focus:border-purple-400" placeholder="เลขที่">
          </div>
          ` : ''}
          
          <button type="submit" class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 rounded-xl font-medium">
            สมัครสมาชิก
          </button>
        </form>
        
        <button onclick="showAuthModal('${selectedRole}')" class="w-full mt-4 text-gray-600 hover:text-gray-800 text-sm">
          ← กลับ
        </button>
      `;
    }

function showOTPForm(email) {
  const normalizedEmail = email.trim().toLowerCase();

  // ⭐ ไม่ await
  fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: normalizedEmail })
  });

  document.getElementById('authContent').innerHTML = `
    <div class="text-center mb-6">
      <div class="text-4xl mb-2">📧</div>
      <h2 class="text-xl font-bold text-gray-800">ยืนยันอีเมล</h2>
      <p class="text-sm text-gray-600 mt-2">
        ระบบได้ส่งรหัส OTP ไปยังอีเมลของคุณแล้ว
      </p>
      <p class="text-sm text-purple-600 font-medium">${normalizedEmail}</p>
    </div>

    <form onsubmit="verifyOTP(event, '${normalizedEmail}')">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          กรอกรหัส OTP (6 หลัก)
        </label>
        <input
          type="text"
          id="otpInput"
          required
          maxlength="6"
          class="w-full px-4 py-3 rounded-xl text-center text-2xl"
          placeholder="000000"
        >
      </div>

      <button
        type="button"
        onclick="resendOTP('${normalizedEmail}')"
        class="w-full text-sm text-purple-600 hover:underline mt-2"
      >
        ส่งรหัส OTP อีกครั้ง
      </button>

      <button type="submit"
        class="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 rounded-xl mt-4">
        ยืนยัน
      </button>
    </form>
  `;
}

async function handleLogin(e) {
  e.preventDefault();

  if (!selectedRole) {
    showInlineError('loginEmail', 'กรุณาเลือกประเภทผู้ใช้ก่อน');
    return;
  }

  const email =
    document.getElementById('loginEmail').value
      .trim()
      .toLowerCase();

  const user = allData.find(
    d => d.type === 'user' && d.email === email && d.role === selectedRole
  );

  if (user) {
    currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));

    hideAuthModal();

    showSuccessModal(
      'เข้าสู่ระบบสำเร็จ',
      `ยินดีต้อนรับ ${user.name} ${user.surname}`
    );

entermainApp();

  } else {
    showInlineError('loginEmail', 'ไม่พบบัญชีนี้ กรุณาสมัครสมาชิก');
  }
}

        async function handleSignup(e) {
      e.preventDefault();
const email =
  document.getElementById('signupEmail').value
    .trim()
    .toLowerCase();
      const name = document.getElementById('signupName').value;
      const surname = document.getElementById('signupSurname').value;
      const studentNumber = document.getElementById('signupNumber')?.value || '';
      
      const existing = allData.find(d => d.type === 'user' && d.email === email);
      if (existing) {
        showInlineError('signupEmail', 'อีเมลนี้ถูกใช้งานแล้ว');
        return;
      }
      if (!selectedRole) {
  showInlineError('loginEmail', 'กรุณาเลือกประเภทผู้ใช้ก่อน');
  return;
}

pendingUserData = {
  type: 'user',
  email,
  name,
  surname,
  role: selectedRole,
  created_at: new Date().toISOString(),
  badges: '',
  theme: 'pastel',
  avatar: '',
  on_time_count: 0,
  last_seen: new Date().toISOString(),
  ...(selectedRole === 'student'
    ? { student_number: studentNumber }
    : {})
};      
      showOTPForm(email);
    }
let isVerifyingOTP = false;

async function verifyOTP(e, email) {
  e.preventDefault();
  if (isVerifyingOTP) return;
  isVerifyingOTP = true;

  try {
    const otp = document.getElementById('otpInput').value;

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp })
    });

    const data = await res.json();

    if (!res.ok) {
      showInlineError('otpInput', data.message || 'รหัส OTP ไม่ถูกต้อง');
      return;
    }

    // ⭐ guard สำคัญมาก
    if (!pendingUserData) {
      alert('ข้อมูลสมัครสมาชิกหาย กรุณาสมัครใหม่');
      return;
    }

    // ⭐ สร้าง user
    const result = await window.dataSdk.create(pendingUserData);
    if (!result.isOk) {
      showInlineError('otpInput', 'สมัครสมาชิกไม่สำเร็จ');
      return;
    }

    // ⭐ login ทันที
    currentUser = result.data;
    pendingUserData = null;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

hideAuthModal();

showSuccessModal(
  'สมัครสมาชิกสำเร็จ',
  `ยินดีต้อนรับ ${currentUser.name} ${currentUser.surname}`
);

entermainApp();

if (typeof triggerConfetti === 'function') {
  triggerConfetti();
}

  } catch (err) {
    console.error(err);
    alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
  } finally {
    isVerifyingOTP = false; // ⭐ กันค้าง 100%
  }
}

      function showInlineError(inputId, message) {
      const input = document.getElementById(inputId);
      const existingError = input.parentElement.querySelector('.error-msg');
      if (existingError) existingError.remove();
      
      const errorEl = document.createElement('p');
      errorEl.className = 'error-msg text-red-500 text-xs mt-1';
      errorEl.textContent = message;
      input.parentElement.appendChild(errorEl);
      input.classList.add('border-red-500');
      
      setTimeout(() => {
        errorEl.remove();
        input.classList.remove('border-red-500');
      }, 3000);
    }

// กันกดส่ง OTP รัว ๆ
let resendCooldown = false;

async function resendOTP(email) {
  if (resendCooldown) {
    alert('กรุณารอ 30 วินาทีก่อนส่งรหัสใหม่');
    return;
  }
  resendCooldown = true;
  setTimeout(() => {
    resendCooldown = false;
  }, 30000); // 30 วินาที

  const normalizedEmail = email.trim().toLowerCase();

  await fetch('/api/auth/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: normalizedEmail
    })
  });

  showSuccessModal(
    'ส่งรหัสใหม่แล้ว',
    'ระบบได้ส่งรหัส OTP ใหม่ไปยังอีเมลของคุณแล้ว'
  );
}

function hideAuthModal() {
  closeModal('authModal');
}

