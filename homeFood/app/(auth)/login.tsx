import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/src/store";
import { clearError, loginThunk } from "@/src/store/authSlice";
import { AuthShell, PillButton } from "@/src/components/ui";
import tw from "@/src/lib/tailwind";

const Login = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isLoading, error, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const allFilled = email.trim() !== "" && password !== "";
  const displayError = formError ?? error;

  const handleLogin = () => {
    if (isLoading) return;

    if (!allFilled) {
      setFormError("Please enter both your email and password.");
      return;
    }
    if (!isValidEmail(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setFormError(null);
    dispatch(loginThunk({ email: email.trim(), password }));
  };

  return (
    <AuthShell
      title="Login"
      subtitle="Welcome back to HomeFood"
      footer={
        <View style={tw`flex-row items-center justify-center gap-1.5`}>
          <Text style={tw`text-sm text-textMuted`}>Don&apos;t have an account?</Text>
          <TouchableOpacity
            onPress={() => router.push("/(auth)/Signup")}
            accessibilityRole="button"
          >
            <Text style={tw`text-sm font-semibold text-text underline`}>Register</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {displayError ? (
        <View style={tw`mb-3 rounded-xl bg-red-bg px-3 py-2`}>
          <Text style={tw`text-center text-sm font-medium text-red-text`}>
            {displayError}
          </Text>
        </View>
      ) : null}

<TextInput  />
      <View style={tw`gap-3`}>
        <View>
          <Text style={tw`mb-1.5 text-sm font-medium text-text`}>Email</Text>
          <View style={tw`flex-row items-center rounded-xl border border-borderStrong bg-card px-3.5 py-2.5`}>
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setFormError(null);
              }}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              textContentType="emailAddress"
              placeholderTextColor={tw.color("text-faint")}
              style={tw`flex-1 text-sm text-text font-body`}
            />
          </View>
        </View>

        <View>
          <Text style={tw`mb-1.5 text-sm font-medium text-text`}>Password</Text>
          <View style={tw`flex-row items-center rounded-xl border border-borderStrong bg-card px-3.5`}>
            <TextInput
              placeholder="Your password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                setFormError(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              textContentType="password"
              placeholderTextColor={tw.color("text-faint")}
              style={tw`flex-1 py-2.5 text-sm text-text font-body`}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((value) => !value)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? "Hide password" : "Show password"}
            >
              <Text style={tw`ml-2 text-sm font-semibold text-primary`}>
                {showPassword ? "Hide" : "Show"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PillButton
        title="Login"
        onPress={handleLogin}
        loading={isLoading}
        disabled={!allFilled}
        fullWidth
        style={tw`mt-5`}
      />
    </AuthShell>
  );
};

export default Login;
