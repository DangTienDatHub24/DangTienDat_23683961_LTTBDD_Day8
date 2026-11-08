import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../services/authService"; // đã viết sẵn: login(email, password) → { user, token }
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import { validateEmail, validatePassword } from "../utils/validators"; // đã viết sẵn: trả về chuỗi lỗi hoặc null
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function LoginScreen({ navigation, route }: RootScreenProps<"Login">) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (loading) return;

    const fieldErrors = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(fieldErrors);
    setSubmitError(null);
    if (fieldErrors.email || fieldErrors.password) return;

    setLoading(true);
    try {
      const { user, token } = await login(email, password);
      signIn(user, token);

      if (route.params?.redirectTo === "Checkout") {
        navigation.replace("Checkout", { total: route.params.total ?? 0 });
      } else {
        navigation.navigate("Tabs", { screen: "Home" });
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>Đăng nhập BookStore</Text>

        <FormField
          label="Email"
          placeholder="demo@bookstore.vn"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          keyboardType="email-address"
          autoCorrect={false}
          editable={!loading}
        />
        <FormField
          label="Mật khẩu"
          placeholder="Tối thiểu 6 ký tự"
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          secureTextEntry
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={submit}
        />
        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        <PrimaryButton title="Đăng nhập" onPress={submit} loading={loading} />

        <Pressable disabled={loading} onPress={() => navigation.replace("Register", route.params)}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </Pressable>
        <View style={styles.hint}>
          <Text style={styles.hintText}>Tài khoản demo: demo@bookstore.vn / 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  logo: { fontSize: 56, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy, textAlign: "center", marginBottom: 6 },
  submitError: { color: colors.danger, textAlign: "center" },
  link: { color: colors.indigo, fontWeight: "700", textAlign: "center" },
  hint: { backgroundColor: "#E0F2FE", padding: 10, borderRadius: 10 },
  hintText: { color: colors.navy, textAlign: "center", fontSize: 12 },
});
