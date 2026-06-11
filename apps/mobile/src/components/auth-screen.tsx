import { useState } from "react";
import { Brand } from "@/constants/theme";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { TurnstileWebView } from "@/components/turnstile-webview";
import { GoogleIcon } from "@/components/google-icon";
import { signIn, signUp } from "@/lib/auth";

const PURPLE = Brand.primary;
const BRAND = Brand.vivid;

type Mode = "login" | "register";

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>("login");

  // Campos compartidos / por modo
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
    setCaptchaToken(null);
    setCaptchaFailed(false);
  };

  const handleGoogle = async () => {
    setError(null);
    setInfo(null);
    setGoogleLoading(true);
    try {
      // El cliente expo abre el navegador y regresa por el scheme mobile://.
      // Con Google el correo ya viene verificado, así que entra directo.
      await signIn.social({ provider: "google", callbackURL: "/" });
    } catch {
      setError("No se pudo continuar con Google. Inténtalo de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const { error: authError } = await signIn.email({
        email: email.trim(),
        password,
      });
      if (authError) {
        // Email sin verificar es la causa más común tras registrarse.
        setError("Correo o contraseña incorrectos, o tu correo no está verificado.");
      }
    } catch {
      setError("No se pudo iniciar sesión. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setInfo(null);

    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones.");
      return;
    }
    // Si el captcha aún no entrega token (y no falló su carga), pedirlo.
    if (!captchaToken && !captchaFailed) {
      setError("Completa el desafío de seguridad antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      const { error: authError } = await signUp.email({
        email: email.trim(),
        password,
        name: fullName.trim(),
        fetchOptions: {
          body: { "cf-turnstile-response": captchaToken ?? "" },
        },
      } as Parameters<typeof signUp.email>[0]);

      if (authError) {
        setError("No fue posible crear la cuenta. Verifica tus datos e intenta de nuevo.");
        setCaptchaToken(null); // re-pedir captcha en el próximo intento
        return;
      }

      // Registro OK: el correo requiere verificación antes de iniciar sesión.
      setInfo(
        "¡Cuenta creada! Te enviamos un correo para verificar tu cuenta. Verifícalo y luego inicia sesión."
      );
      setMode("login");
      setPassword("");
      setCaptchaToken(null);
    } catch {
      setError("No se pudo crear la cuenta. Revisa tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  const isRegister = mode === "register";
  const submitDisabled =
    loading ||
    !email ||
    !password ||
    (isRegister && (!fullName || !acceptTerms));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require("@/assets/images/cursumi-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="title" style={styles.title}>
            Cursumi
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {isRegister ? "Crea tu cuenta" : "Inicia sesión para continuar"}
          </ThemedText>

          {/* Google OAuth — sirve para iniciar sesión y para registrarse */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogle}
            disabled={googleLoading}
          >
            {googleLoading ? (
              <ActivityIndicator color={PURPLE} />
            ) : (
              <View style={styles.googleInner}>
                <GoogleIcon size={20} />
                <ThemedText style={styles.googleText}>Continuar con Google</ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>o</ThemedText>
            <View style={styles.divider} />
          </View>

          {isRegister && (
            <TextInput
              style={styles.input}
              autoCapitalize="words"
              autoComplete="name"
              value={fullName}
              onChangeText={setFullName}
              placeholder="Nombre completo"
              placeholderTextColor="#9ca3af"
            />
          )}

          <TextInput
            style={styles.input}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="Correo electrónico"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            placeholderTextColor="#9ca3af"
          />

          {isRegister && (
            <>
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setAcceptTerms((v) => !v)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxOn]}>
                  {acceptTerms && <ThemedText style={styles.checkmark}>✓</ThemedText>}
                </View>
                <ThemedText style={styles.termsText}>
                  Acepto los términos y la política de privacidad
                </ThemedText>
              </TouchableOpacity>

              <TurnstileWebView
                onToken={(t) => {
                  setCaptchaToken(t);
                  setCaptchaFailed(false);
                }}
                onError={() => setCaptchaFailed(true)}
              />
            </>
          )}

          {error && <ThemedText style={styles.error}>{error}</ThemedText>}
          {info && <ThemedText style={styles.info}>{info}</ThemedText>}

          <TouchableOpacity
            style={[styles.button, submitDisabled && styles.buttonDisabled]}
            onPress={isRegister ? handleRegister : handleLogin}
            disabled={submitDisabled}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>
                {isRegister ? "Crear cuenta" : "Iniciar sesión"}
              </ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchRow}
            onPress={() => switchMode(isRegister ? "login" : "register")}
          >
            <ThemedText style={styles.switchText}>
              {isRegister
                ? "¿Ya tienes cuenta? Inicia sesión"
                : "¿No tienes cuenta? Crea una"}
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", paddingHorizontal: 28, paddingVertical: 32, gap: 12 },
  logo: { width: 84, height: 84, alignSelf: "center", marginBottom: 4 },
  title: { textAlign: "center", color: BRAND },
  subtitle: { textAlign: "center", marginBottom: 12, opacity: 0.7 },
  googleButton: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.35)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  googleInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  googleText: { color: "#111827", fontWeight: "600", fontSize: 15 },
  dividerRow: { flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 2 },
  divider: { flex: 1, height: 1, backgroundColor: "rgba(127,127,127,0.25)" },
  dividerText: { opacity: 0.5, fontSize: 13 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#fff",
  },
  termsRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 2 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "rgba(127,127,127,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxOn: { backgroundColor: PURPLE, borderColor: PURPLE },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "700", lineHeight: 18 },
  termsText: { flex: 1, fontSize: 13, opacity: 0.8 },
  error: { color: "#dc2626", textAlign: "center" },
  info: { color: "#16a34a", textAlign: "center" },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchRow: { alignItems: "center", marginTop: 8 },
  switchText: { color: PURPLE, fontSize: 14, fontWeight: "600" },
});
