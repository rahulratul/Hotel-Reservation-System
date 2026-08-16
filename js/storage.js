// js/storage.js

const Storage = {
  getAll(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  },

  getById(key, id) {
    const items = this.getAll(key);
    return items.find(item => item.id === id) || null;
  },

  save(key, item) {
    const items = this.getAll(key);
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(key, JSON.stringify(items));
  },

  remove(key, id) {
    const items = this.getAll(key).filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(items));
  },

  clear(key) {
    localStorage.removeItem(key);
  }
};
