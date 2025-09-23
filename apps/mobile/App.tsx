import { WebView } from "react-native-webview";
import { StyleSheet } from "react-native";
import {
  type EdgeInsets,
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useRef, useEffect, useCallback } from "react";

function Container() {
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const injectedJavaScript = `
    window.safeAreaInsets = ${JSON.stringify(insets)};
    window.dispatchEvent(new CustomEvent('SafeAreaInsets', { detail: window.safeAreaInsets }));
    true;
  `;

  const pushInsets = useCallback((i: EdgeInsets) => {
    const script = `
      window.safeAreaInsets = ${JSON.stringify(i)};
      window.dispatchEvent(new CustomEvent('SafeAreaInsets', { detail: window.safeAreaInsets }));
      true;
    `;

    webViewRef.current?.injectJavaScript(script);
  }, []);

  useEffect(() => {
    if (webViewRef.current) pushInsets(insets);
  }, [insets, pushInsets]);

  return (
    <WebView
      ref={webViewRef}
      style={styles.container}
      source={{ uri: "http://localhost:3000" }}
      injectedJavaScript={injectedJavaScript}
      javaScriptEnabled={true}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Container />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
