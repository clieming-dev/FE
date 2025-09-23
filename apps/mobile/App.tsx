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

  const injectedJavaScriptBeforeContentLoaded = `
    const root = document.documentElement;
    root.style.setProperty('--safe-top', '${insets.top}px');
    root.style.setProperty('--safe-right', '${insets.right}px');
    root.style.setProperty('--safe-bottom', '${insets.bottom}px');
    root.style.setProperty('--safe-left', '${insets.left}px');

    window.dispatchEvent(new CustomEvent('SafeAreaInsets', { detail: ${JSON.stringify(insets)} }));
    true;
  `;

  const pushInsets = useCallback((insets: EdgeInsets) => {
    const script = `
      window.dispatchEvent(new CustomEvent('SafeAreaInsets', { detail: ${JSON.stringify(insets)} }));
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
      source={{ uri: "http://localhost:3000" }} // TODO: 호스트 env 변수로 수정
      injectedJavaScriptBeforeContentLoaded={injectedJavaScriptBeforeContentLoaded}
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
