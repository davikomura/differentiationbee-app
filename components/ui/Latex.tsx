// components/ui/Latex.tsx
import React, { useMemo, useState } from "react";
import { Platform, View } from "react-native";
import { WebView } from "react-native-webview";

type Props = {
  latex: string;
  textColor?: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
};

export function Latex({
  latex,
  textColor = "#FFFFFF",
  fontSize = 20,
  align = "center",
}: Props) {
  const [height, setHeight] = useState<number>(40);

  const html = useMemo(() => {
    const safe = latex
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\$/g, "\\$");
    return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<style>
  html, body { margin:0; padding:0; background: transparent; }
  .wrap {
    width: 100%;
    display:flex;
    justify-content:${align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"};
    align-items:center;
  }
  #math {
    color: ${textColor};
    font-size: ${fontSize}px;
    line-height: 1.2;
    padding: 0;
    margin: 0;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .katex { color: ${textColor}; }
</style>
</head>
<body>
  <div class="wrap">
    <div id="math"></div>
  </div>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script>
  const latex = \`${safe}\`;
  function render() {
    try {
      katex.render(latex, document.getElementById('math'), {
        throwOnError: false,
        displayMode: true,
        trust: true,
        strict: "ignore",
      });
    } catch (e) {}
    const h = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      document.documentElement.offsetHeight,
      document.body.offsetHeight
    );
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(String(h));
  }
  window.addEventListener("load", () => setTimeout(render, 0));
  window.addEventListener("resize", () => setTimeout(render, 0));
</script>
</body>
</html>`;
  }, [latex, textColor, fontSize, align]);

  return (
    <View style={{ height, width: "100%" }}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={{ backgroundColor: "transparent" }}
        containerStyle={{ backgroundColor: "transparent" }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        onMessage={(e) => {
          const next = Number(e.nativeEvent.data);
          if (Number.isFinite(next) && next > 0)
            setHeight(Math.min(Math.max(next, 24), 220));
        }}
        androidLayerType={Platform.OS === "android" ? "hardware" : undefined}
      />
    </View>
  );
}
