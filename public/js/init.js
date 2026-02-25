// ================= Global State =================
window.currentUser = null;
window.allData = [];
window.selectedRole = null;
window.currentView = 'assignments';

// ================= Data Handler =================
const dataHandler = {
  onDataChanged(data) {
    allData = data;

    if (currentUser) {
      const updatedUser = allData.find(
        d => d.type === 'user' && d.email === currentUser.email
      );
      if (updatedUser) {
        currentUser = updatedUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
      }
    }
  }
};

let hasInitStarted = false;
let hasDataSdkInit = false;

async function initApp() {
  if (hasInitStarted) return;
  hasInitStarted = true;

  const rolePage = document.getElementById('landingPage');
  const mainApp = document.getElementById('mainApp');

  if (!rolePage || !mainApp) {
    console.error('❌ landingPage หรือ mainApp ไม่อยู่ใน DOM');
    return;
  }

  // ✅ 1. แสดง landing page ก่อนเสมอ
  showLandingPage();

  // ✅ 2. เช็ก dataSdk ก่อนใช้
  if (!window.dataSdk) {
    console.warn('dataSdk not loaded');
    return;
  }

  // ✅ 3. init dataSdk แค่ครั้งเดียว
  if (!hasDataSdkInit) {
    console.log('before dataSdk.init');
    await window.dataSdk.init(dataHandler);
    console.log('after dataSdk.init');
    hasDataSdkInit = true;
  }

  // ✅ 4. ตรวจ user
  const savedUser = localStorage.getItem('currentUser');
  if (!savedUser) return;

  const parsedUser = JSON.parse(savedUser);
  const realUser = allData.find(
    d => d.type === 'user' && d.email === parsedUser.email
  );

  if (!realUser) {
    localStorage.removeItem('currentUser');
    return;
  }

  // ✅ 5. เข้า main app
currentUser = realUser;

console.log('✅ Auto login:', currentUser.email);

requestAnimationFrame(() => {
  entermainApp();
});
}

document.addEventListener('DOMContentLoaded', initApp);
