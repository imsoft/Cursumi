import { useRef, useState } from "react";
import { PanResponder, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

import { ThemedText } from "@/components/themed-text";

const PURPLE = "#6d28d9";
const COLORS = ["#111827", "#dc2626", "#2563eb", "#16a34a", "#f59e0b", PURPLE];
const ERASER = "#ffffff";

type Stroke = { d: string; color: string; width: number };

export function WhiteboardView({ onBack }: { onBack: () => void }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [current, setCurrent] = useState<string>("");
  const [color, setColor] = useState(COLORS[0]);
  const [eraser, setEraser] = useState(false);

  // Refs para que el PanResponder lea valores actuales sin recrearse.
  const pathRef = useRef("");
  const colorRef = useRef(color);
  const eraserRef = useRef(eraser);
  colorRef.current = color;
  eraserRef.current = eraser;

  const responder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        pathRef.current = `M ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrent(pathRef.current);
      },
      onPanResponderMove: (e) => {
        const { locationX, locationY } = e.nativeEvent;
        pathRef.current += ` L ${locationX.toFixed(1)} ${locationY.toFixed(1)}`;
        setCurrent(pathRef.current);
      },
      onPanResponderRelease: () => {
        const d = pathRef.current;
        if (d.includes("L")) {
          setStrokes((s) => [
            ...s,
            { d, color: eraserRef.current ? ERASER : colorRef.current, width: eraserRef.current ? 24 : 4 },
          ]);
        }
        pathRef.current = "";
        setCurrent("");
      },
    })
  ).current;

  function undo() {
    setStrokes((s) => s.slice(0, -1));
  }
  function clear() {
    setStrokes([]);
    setCurrent("");
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.topbar}>
        <TouchableOpacity onPress={onBack} hitSlop={12}>
          <ThemedText style={styles.back}>‹ Atrás</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.title}>Pizarrón</ThemedText>
        <View style={{ width: 50 }} />
      </View>

      {/* Lienzo */}
      <View style={styles.canvas} {...responder.panHandlers}>
        <Svg style={StyleSheet.absoluteFill}>
          {strokes.map((s, i) => (
            <Path
              key={i}
              d={s.d}
              stroke={s.color}
              strokeWidth={s.width}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ))}
          {current ? (
            <Path
              d={current}
              stroke={eraser ? ERASER : color}
              strokeWidth={eraser ? 24 : 4}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          ) : null}
        </Svg>
      </View>

      {/* Herramientas */}
      <View style={styles.tools}>
        <View style={styles.colors}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[
                styles.swatch,
                { backgroundColor: c },
                !eraser && color === c && styles.swatchOn,
              ]}
              onPress={() => {
                setColor(c);
                setEraser(false);
              }}
            />
          ))}
        </View>
        <View style={styles.actions}>
          <ToolBtn label="Borrador" active={eraser} onPress={() => setEraser((e) => !e)} />
          <ToolBtn label="Deshacer" onPress={undo} />
          <ToolBtn label="Limpiar" onPress={clear} />
        </View>
      </View>
    </SafeAreaView>
  );
}

function ToolBtn({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity style={[styles.toolBtn, active && styles.toolBtnOn]} onPress={onPress}>
      <ThemedText style={[styles.toolText, active && styles.toolTextOn]}>{label}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  back: { color: PURPLE, fontSize: 16, fontWeight: "600", width: 50 },
  title: { fontWeight: "700", fontSize: 16 },
  canvas: {
    flex: 1,
    margin: 12,
    borderRadius: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.25)",
    overflow: "hidden",
  },
  tools: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  colors: { flexDirection: "row", gap: 10, justifyContent: "center" },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "transparent" },
  swatchOn: { borderColor: "#111827" },
  actions: { flexDirection: "row", gap: 8, justifyContent: "center" },
  toolBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(127,127,127,0.3)",
  },
  toolBtnOn: { backgroundColor: PURPLE, borderColor: PURPLE },
  toolText: { fontWeight: "600" },
  toolTextOn: { color: "#fff" },
});
