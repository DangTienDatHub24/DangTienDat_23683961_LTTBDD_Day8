import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BookGrid } from "../components/BookGrid"; // lưới 2 cột dùng lại
import { EmptyState } from "../components/EmptyState";
import { LoadingView } from "../components/LoadingView";
import { ErrorView } from "../components/ErrorView";
import { getBooks } from "../services/bookService";
import { getErrorMessage } from "../api/client";
import { useWishlist } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { Book } from "../types";
import { colors } from "../theme";

export function WishlistScreen({ navigation }: RootScreenProps<"Wishlist">) {
  const { ids } = useWishlist();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setBooks(await getBooks());
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const favorites = useMemo(() => books.filter((book) => ids.includes(book.id)), [books, ids]);

  return (
    <View style={styles.container}>
      {loading ? (
        <LoadingView label="Đang tải sách yêu thích…" />
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : (
        <BookGrid
          data={favorites}
          onPressBook={(book) => navigation.navigate("BookDetail", { bookId: book.id })}
          ListEmptyComponent={
            <EmptyState
              emoji="💔"
              title="Chưa có sách yêu thích"
              message="Thả tim những cuốn sách bạn muốn lưu lại nhé."
              actionLabel="Khám phá sách"
              onAction={() => navigation.navigate("Tabs", { screen: "Home" })}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.bg } });
