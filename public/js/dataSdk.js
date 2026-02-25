// ================== dataSdk (LocalStorage Backend) ==================
let dataHandlerRef = null;

window.dataSdk = {
  // ---------- INIT ----------
  async init(handler) {
    dataHandlerRef = handler;

    const data = JSON.parse(
      localStorage.getItem('allData') || '[]'
    );

    // ยิงข้อมูลเข้า app ครั้งแรก
    handler.onDataChanged(data);
  },

  // ---------- CREATE ----------
  async create(item) {
    const data = JSON.parse(
      localStorage.getItem('allData') || '[]'
    );

    const newItem = {
      ...item,
      __backendId: crypto.randomUUID(),
      created_at: item.created_at || new Date().toISOString()
    };

    data.push(newItem);
    localStorage.setItem('allData', JSON.stringify(data));

    // 🔥 แจ้งทุก view ให้ re-render
    dataHandlerRef?.onDataChanged(data);

    return {
      isOk: true,
      data: newItem
    };
  },

  // ---------- UPDATE ----------
  async update(item) {
    const data = JSON.parse(
      localStorage.getItem('allData') || '[]'
    );

    const idx = data.findIndex(
      d => d.__backendId === item.__backendId
    );

    if (idx === -1) {
      return {
        isOk: false,
        error: 'not found'
      };
    }

    // ⭐ merge กันข้อมูลหาย
    data[idx] = {
      ...data[idx],
      ...item
    };

    localStorage.setItem('allData', JSON.stringify(data));

    // 🔥 sync ทั้งระบบ
    dataHandlerRef?.onDataChanged(data);

    return { isOk: true };
  },

  // ---------- DELETE ----------
  async delete(item) {
    let data = JSON.parse(
      localStorage.getItem('allData') || '[]'
    );

    data = data.filter(
      d => d.__backendId !== item.__backendId
    );

    localStorage.setItem('allData', JSON.stringify(data));

    // 🔥 sync ทั้งระบบ
    dataHandlerRef?.onDataChanged(data);

    return { isOk: true };
  }
};
