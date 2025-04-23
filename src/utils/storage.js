// Инициализация базы данных
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("eventsDB", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("events")) {
        db.createObjectStore("events", { keyPath: "id" });
      }
    };
  });
};

// Сжатие изображения
export const compressImage = async (base64String, maxWidth = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };
  });
};

// API для работы с хранилищем
export const storageAPI = {
  // Сохранение мероприятия
  async saveEvent(event) {
    try {
      const db = await initDB();

      // Сжимаем изображения, если они есть
      if (event.cardBanner) {
        event.cardBanner = await compressImage(event.cardBanner, 800);
      }
      if (event.pageBanner) {
        event.pageBanner = await compressImage(event.pageBanner, 1300);
      }

      // Сохраняем партнёров с логотипами
      if (event.partners) {
        for (let i = 0; i < event.partners.length; i++) {
          if (event.partners[i].logo) {
            event.partners[i].logo = await compressImage(
              event.partners[i].logo,
              400
            );
          }
        }
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction(["events"], "readwrite");
        const store = transaction.objectStore("events");
        const request = store.put(event);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error("Error saving event:", error);
      throw error;
    }
  },

  // Получение всех мероприятий
  async getEvents() {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["events"], "readonly");
      const store = transaction.objectStore("events");
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Получение мероприятия по ID
  async getEventById(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["events"], "readonly");
      const store = transaction.objectStore("events");
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  // Удаление мероприятия
  async deleteEvent(id) {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(["events"], "readwrite");
      const store = transaction.objectStore("events");
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  },
};
