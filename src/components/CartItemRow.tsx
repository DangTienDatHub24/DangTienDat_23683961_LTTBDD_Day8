import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useDebounce } from "../hooks/useDebounce";
import { CartItem } from "../types";
import { colors, formatPrice, radius } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  const [qty, setQty] = useState(item.quantity);
  const debouncedQty = useDebounce(qty, 300);
  const lastStoreQuantity = useRef(item.quantity);

  useEffect(() => {
    // Store đổi từ nơi khác thì ưu tiên đồng bộ, tránh ghi lại số lượng cũ đang chờ debounce.
    if (item.quantity !== lastStoreQuantity.current) {
      lastStoreQuantity.current = item.quantity;
      setQty(item.quantity);
      return;
    }
    if (debouncedQty === qty && debouncedQty !== item.quantity) {
      onChangeQty(item.bookId, debouncedQty);
    }
  }, [debouncedQty, qty, item.quantity, item.bookId, onChangeQty]);

  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <View style={styles.quantityRow}>
          <Pressable
            style={[styles.quantityButton, !canDec && styles.disabled]}
            disabled={!canDec}
            onPress={() => setQty((current) => Math.max(1, current - 1))}
            accessibilityRole="button"
            accessibilityLabel="Giảm"
          >
            <Text style={styles.quantityButtonText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            style={[styles.quantityButton, !canInc && styles.disabled]}
            disabled={!canInc}
            onPress={() => setQty((current) => Math.min(item.stock, current + 1))}
            accessibilityRole="button"
            accessibilityLabel="Tăng"
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </Pressable>
        </View>
        <Text style={styles.stock}>Còn {item.stock}</Text>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  quantityRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  quantityButton: { width: 32, height: 32, borderWidth: 1, borderColor: colors.line, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  quantityButtonText: { fontSize: 20, fontWeight: "700", color: colors.navy },
  disabled: { opacity: 0.35 },
  qty: { minWidth: 24, textAlign: "center", fontWeight: "800", color: colors.navy, fontSize: 16 },
  stock: { color: colors.muted, fontSize: 12 },
  trash: { fontSize: 22 },
});
