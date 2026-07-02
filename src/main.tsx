// Patch Storage to use sessionStorage for access_token transparently
const originalGetItem = Storage.prototype.getItem;
Storage.prototype.getItem = function (key: string): string | null {
  if (key === 'access_token' && this === window.localStorage) {
    return sessionStorage.getItem('access_token');
  }
  return originalGetItem.apply(this, [key]);
};

const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function (key: string, value: string): void {
  if (key === 'access_token' && this === window.localStorage) {
    sessionStorage.setItem('access_token', value);
    return;
  }
  originalSetItem.apply(this, [key, value]);
};

const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function (key: string): void {
  if (key === 'access_token' && this === window.localStorage) {
    sessionStorage.removeItem('access_token');
    return;
  }
  originalRemoveItem.apply(this, [key]);
};

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
