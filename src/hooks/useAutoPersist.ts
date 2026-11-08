import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

// HOOK CHUNG: mỗi khi `value` đổi (và đã nạp xong dữ liệu cũ) → tự ghi vào AsyncStorage.
// Dùng cho cart, wishlist… — không phải viết lại effect ở từng nơi.
export function useAutoPersist<T>(key: string, value: T, ready: boolean) {
  useEffect(() => {
    // Chờ đọc dữ liệu cũ xong để không ghi đè bằng mảng rỗng lúc khởi động.
    if (!ready) return;
    void saveJSON(key, value);
  }, [key, value, ready]);
}
