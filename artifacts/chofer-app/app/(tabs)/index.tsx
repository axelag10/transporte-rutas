import {
  useListVehicles,
  useUpdatePosition,
  useCreateShift,
  useEndShift,
  useVerifyPin,
} from "@workspace/api-client-react";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const GPS_INTERVAL_MS = 20000;

interface GeoCoords {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
}

// ─── PIN Screen ───────────────────────────────────────────────────────────────
interface PinScreenProps {
  vehicleId: number;
  plateNumber: string;
  driverName: string;
  onSuccess: () => void;
  onBack: () => void;
}

function PinScreen({ vehicleId, plateNumber, driverName, onSuccess, onBack }: PinScreenProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { mutateAsync: verifyPin } = useVerifyPin();
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleDigit = async (d: string) => {
    if (digits.length >= 4 || checking) return;
    setError(false);
    const next = [...digits, d];
    setDigits(next);

    if (next.length === 4) {
      setChecking(true);
      try {
        const result = await verifyPin({ id: vehicleId, data: { pin: next.join("") } });
        if (result.ok) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onSuccess();
        } else {
          throw new Error("PIN incorrecto");
        }
      } catch {
        setError(true);
        shake();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setTimeout(() => setDigits([]), 600);
      } finally {
        setChecking(false);
      }
    }
  };

  const handleDelete = () => {
    if (checking) return;
    setError(false);
    setDigits((prev) => prev.slice(0, -1));
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const KEYS = [["1","2","3"],["4","5","6"],["7","8","9"],["","0","⌫"]];

  const dotColor = error ? "#ef4444" : colors.primary;

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingTop: topPad + 16, paddingBottom: bottomPad, paddingHorizontal: 24 },
    backBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 32 },
    backText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    title: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold", textAlign: "center", marginBottom: 4 },
    subtitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: "Inter_400Regular", textAlign: "center", marginBottom: 40 },
    plateChip: { alignSelf: "center", backgroundColor: colors.secondary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, marginBottom: 36 },
    plateText: { fontSize: 20, fontWeight: "700", color: colors.foreground, letterSpacing: 2, fontFamily: "Inter_700Bold" },
    dotsRow: { flexDirection: "row", justifyContent: "center", gap: 18, marginBottom: 48 },
    dot: { width: 16, height: 16, borderRadius: 8 },
    errorText: { textAlign: "center", fontSize: 13, color: "#ef4444", marginBottom: 16, fontFamily: "Inter_400Regular" },
    keypad: { gap: 12 },
    keyRow: { flexDirection: "row", justifyContent: "center", gap: 16 },
    key: { width: 78, height: 78, borderRadius: 39, alignItems: "center", justifyContent: "center", backgroundColor: colors.card },
    keyText: { fontSize: 24, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
  });

  return (
    <View style={s.root}>
      <Pressable style={s.backBtn} onPress={onBack}>
        <Feather name="arrow-left" size={16} color={colors.mutedForeground} />
        <Text style={s.backText}>Cambiar unidad</Text>
      </Pressable>

      <Text style={s.title}>Ingresa tu PIN</Text>
      <Text style={s.subtitle}>{driverName}</Text>

      <View style={s.plateChip}>
        <Text style={s.plateText}>{plateNumber}</Text>
      </View>

      <Animated.View style={[s.dotsRow, { transform: [{ translateX: shakeAnim }] }]}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              s.dot,
              {
                backgroundColor: i < digits.length ? dotColor : "transparent",
                borderWidth: 2,
                borderColor: dotColor,
                opacity: error ? 1 : 1,
              },
            ]}
          />
        ))}
      </Animated.View>

      {error && <Text style={s.errorText}>PIN incorrecto. Intenta de nuevo.</Text>}

      {checking ? (
        <ActivityIndicator color={colors.primary} size="large" />
      ) : (
        <View style={s.keypad}>
          {KEYS.map((row, ri) => (
            <View key={ri} style={s.keyRow}>
              {row.map((k, ki) => {
                if (k === "") return <View key={ki} style={s.key} />;
                return (
                  <Pressable
                    key={ki}
                    style={({ pressed }) => [s.key, { opacity: pressed ? 0.65 : 1 }]}
                    onPress={() => (k === "⌫" ? handleDelete() : handleDigit(k))}
                  >
                    {k === "⌫" ? (
                      <Feather name="delete" size={22} color={colors.foreground} />
                    ) : (
                      <Text style={s.keyText}>{k}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Main Turno Screen ────────────────────────────────────────────────────────
export default function TurnoScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: vehicles, isLoading: loadingVehicles } = useListVehicles();
  const { mutate: sendPosition } = useUpdatePosition();
  const { mutateAsync: createShift } = useCreateShift();
  const { mutateAsync: endShift } = useEndShift();

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [pinVerified, setPinVerified] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentShiftId, setCurrentShiftId] = useState<number | null>(null);
  const [currentCoords, setCurrentCoords] = useState<GeoCoords | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [stopping, setStopping] = useState(false);

  const shiftStartRef = useRef<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  useEffect(() => {
    if (isTracking && !isPaused) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.35, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulseLoopRef.current = loop;
      loop.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isTracking, isPaused, pulseAnim]);

  const formatElapsed = (start: Date) => {
    const diff = Math.floor((Date.now() - start.getTime()) / 1000);
    const h = Math.floor(diff / 3600).toString().padStart(2, "0");
    const m = Math.floor((diff % 3600) / 60).toString().padStart(2, "0");
    const s = (diff % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const getPosition = useCallback((): Promise<GeoCoords> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === "web") {
        navigator.geolocation.getCurrentPosition(
          (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed, heading: pos.coords.heading }),
          reject,
          { enableHighAccuracy: true, timeout: 4000 }
        );
      } else {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then((pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude, speed: pos.coords.speed, heading: pos.coords.heading }))
          .catch(reject);
      }
    });
  }, []);

  const startGpsInterval = useCallback((vehicleId: number) => {
    const tick = async () => {
      try {
        const coords = await getPosition();
        setCurrentCoords(coords);
        sendPosition(
          { id: vehicleId, data: { lat: coords.latitude, lng: coords.longitude, speed: coords.speed ?? undefined, heading: coords.heading ?? undefined } },
          { onSuccess: () => setLastSync(new Date()) }
        );
      } catch { /* skip */ }
    };
    tick();
    intervalRef.current = setInterval(tick, GPS_INTERVAL_MS);
  }, [getPosition, sendPosition]);

  const startTracking = useCallback(async () => {
    if (!selectedVehicleId) return;

    if (Platform.OS !== "web") {
      const perm = await Location.getForegroundPermissionsAsync();
      if (!perm.granted) {
        const req = await Location.requestForegroundPermissionsAsync();
        if (!req.granted) { setPermissionError("Se necesita permiso de ubicación para continuar."); return; }
      }
    }
    setPermissionError(null);

    try {
      const shift = await createShift({ data: { vehicleId: selectedVehicleId } });
      setCurrentShiftId(shift.id);
    } catch { /* continue */ }

    shiftStartRef.current = new Date();
    setIsTracking(true);
    setIsPaused(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    startGpsInterval(selectedVehicleId);
    elapsedRef.current = setInterval(() => { if (shiftStartRef.current) setElapsed(formatElapsed(shiftStartRef.current)); }, 1000);
  }, [selectedVehicleId, startGpsInterval, createShift]);

  const pauseTracking = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    setIsPaused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const resumeTracking = useCallback(() => {
    if (!selectedVehicleId) return;
    setIsPaused(false);
    startGpsInterval(selectedVehicleId);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [selectedVehicleId, startGpsInterval]);

  const stopTracking = useCallback(async () => {
    setStopping(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    intervalRef.current = null;
    elapsedRef.current = null;
    if (currentShiftId) { try { await endShift({ id: currentShiftId }); } catch { /* ignore */ } }
    setIsTracking(false);
    setIsPaused(false);
    setCurrentCoords(null);
    setLastSync(null);
    setCurrentShiftId(null);
    shiftStartRef.current = null;
    setElapsed("00:00:00");
    setStopping(false);
    setPinVerified(false);
    setSelectedVehicleId(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [currentShiftId, endShift]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const statusColor = isPaused ? "#f59e0b" : colors.accent;
  const statusRingColor = isPaused ? "#f59e0b33" : colors.accent + "33";
  const statusLabel = isPaused ? "En descanso" : "En ruta";
  const statusIcon = isPaused ? "pause-circle" : "radio";

  const s = StyleSheet.create({
    root: { flex: 1, backgroundColor: colors.background, paddingTop: topPad + 16, paddingBottom: bottomPad, paddingHorizontal: 20 },
    header: { flexDirection: "row", alignItems: "center", marginBottom: 28, gap: 12 },
    logoCircle: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    appName: { fontSize: 22, fontWeight: "700", color: colors.foreground, fontFamily: "Inter_700Bold" },
    appSub: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    sectionLabel: { fontSize: 12, fontWeight: "600", color: colors.mutedForeground, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 12, fontFamily: "Inter_600SemiBold" },
    vehicleCard: { borderRadius: 14, padding: 16, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 14 },
    vehicleCardSelected: { borderWidth: 1.5, borderColor: colors.primary },
    plateBox: { backgroundColor: colors.secondary, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
    plateText: { fontSize: 16, fontWeight: "700", color: colors.foreground, letterSpacing: 1.5, fontFamily: "Inter_700Bold" },
    vehicleDriver: { fontSize: 14, color: colors.foreground, fontFamily: "Inter_500Medium" },
    vehicleRoute: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    checkCircle: { marginLeft: "auto" as unknown as number, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    dashboardCard: { backgroundColor: colors.card, borderRadius: 20, padding: 24, marginBottom: 16, alignItems: "center" },
    pulseWrapper: { width: 80, height: 80, alignItems: "center", justifyContent: "center", marginBottom: 16 },
    pulseRing: { position: "absolute", width: 80, height: 80, borderRadius: 40 },
    statusDot: { width: 52, height: 52, borderRadius: 26, alignItems: "center", justifyContent: "center" },
    statusLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, fontFamily: "Inter_600SemiBold" },
    vehicleNameBig: { fontSize: 28, fontWeight: "700", color: colors.foreground, letterSpacing: 2, fontFamily: "Inter_700Bold" },
    elapsedTime: { fontSize: 42, fontWeight: "700", color: colors.foreground, letterSpacing: 2, marginTop: 8, fontFamily: "Inter_700Bold" },
    elapsedSub: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: "Inter_400Regular" },
    gpsRow: { backgroundColor: colors.card, borderRadius: 14, padding: 16, marginBottom: 8, flexDirection: "row", gap: 12 },
    gpsStat: { flex: 1, alignItems: "center" },
    gpsLabel: { fontSize: 10, color: colors.mutedForeground, marginBottom: 4, fontFamily: "Inter_400Regular", textTransform: "uppercase", letterSpacing: 0.8 },
    gpsValue: { fontSize: 14, fontWeight: "600", color: colors.foreground, fontFamily: "Inter_600SemiBold" },
    syncRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 8 },
    syncDot: { width: 7, height: 7, borderRadius: 3.5 },
    syncText: { fontSize: 12, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    separator: { width: 1, backgroundColor: colors.border },
    actionBtn: { borderRadius: 16, height: 58, alignItems: "center", justifyContent: "center", marginTop: 8 },
    actionBtnText: { fontSize: 16, fontWeight: "700", fontFamily: "Inter_700Bold" },
    pauseBanner: { borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#f59e0b22" },
    pauseBannerText: { fontSize: 13, color: "#f59e0b", fontFamily: "Inter_500Medium", flex: 1 },
    errorBox: { backgroundColor: colors.destructive + "22", borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 8 },
    errorText: { fontSize: 13, color: colors.destructive, fontFamily: "Inter_400Regular", flex: 1 },
    loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    loadingText: { fontSize: 14, color: colors.mutedForeground, fontFamily: "Inter_400Regular" },
    emptyText: { fontSize: 14, color: colors.mutedForeground, textAlign: "center", marginTop: 40, fontFamily: "Inter_400Regular" },
  });

  // ── PIN screen ──────────────────────────────────────────────────────────────
  if (selectedVehicleId && !pinVerified && selectedVehicle) {
    return (
      <PinScreen
        vehicleId={selectedVehicleId}
        plateNumber={selectedVehicle.plateNumber}
        driverName={selectedVehicle.driverName}
        onSuccess={() => { setPinVerified(true); startTracking(); }}
        onBack={() => { setSelectedVehicleId(null); setPinVerified(false); }}
      />
    );
  }

  // ── Active tracking screen ──────────────────────────────────────────────────
  if (isTracking && selectedVehicle) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <View style={s.logoCircle}><Feather name="navigation" size={20} color={colors.primaryForeground} /></View>
          <View><Text style={s.appName}>TransBus</Text><Text style={s.appSub}>App del Chofer</Text></View>
        </View>

        <View style={s.dashboardCard}>
          <View style={s.pulseWrapper}>
            <Animated.View style={[s.pulseRing, { backgroundColor: statusRingColor, transform: [{ scale: pulseAnim }] }]} />
            <View style={[s.statusDot, { backgroundColor: statusColor }]}>
              <Feather name={statusIcon as "radio"} size={24} color="#0a1628" />
            </View>
          </View>
          <Text style={[s.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
          <Text style={s.vehicleNameBig}>{selectedVehicle.plateNumber}</Text>
          <Text style={s.elapsedTime}>{elapsed}</Text>
          <Text style={s.elapsedSub}>Tiempo de turno</Text>
        </View>

        {isPaused && (
          <View style={s.pauseBanner}>
            <Feather name="clock" size={16} color="#f59e0b" />
            <Text style={s.pauseBannerText}>GPS en pausa. El turno sigue activo — toca Reanudar cuando termines tu descanso.</Text>
          </View>
        )}

        {!isPaused && currentCoords && (
          <View style={s.gpsRow}>
            <View style={s.gpsStat}><Text style={s.gpsLabel}>Latitud</Text><Text style={s.gpsValue}>{currentCoords.latitude.toFixed(5)}</Text></View>
            <View style={s.separator} />
            <View style={s.gpsStat}><Text style={s.gpsLabel}>Longitud</Text><Text style={s.gpsValue}>{currentCoords.longitude.toFixed(5)}</Text></View>
            <View style={s.separator} />
            <View style={s.gpsStat}><Text style={s.gpsLabel}>Velocidad</Text><Text style={s.gpsValue}>{currentCoords.speed != null ? `${(currentCoords.speed * 3.6).toFixed(0)} km/h` : "—"}</Text></View>
          </View>
        )}

        {!isPaused && (
          <View style={s.syncRow}>
            <View style={[s.syncDot, { backgroundColor: lastSync ? colors.accent : colors.mutedForeground }]} />
            <Text style={s.syncText}>{lastSync ? `Ultima sync: ${lastSync.toLocaleTimeString("es-MX")}` : "Esperando primera sincronizacion..."}</Text>
          </View>
        )}

        <View style={{ flex: 1 }} />

        <Pressable
          style={({ pressed }) => [s.actionBtn, { backgroundColor: isPaused ? colors.accent : colors.muted, opacity: pressed ? 0.85 : 1, borderWidth: isPaused ? 0 : 1, borderColor: colors.border }]}
          onPress={isPaused ? resumeTracking : pauseTracking}
        >
          <Text style={[s.actionBtnText, { color: isPaused ? colors.accentForeground : colors.foreground }]}>
            {isPaused ? "Reanudar turno" : "Pausar (descanso)"}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [s.actionBtn, { backgroundColor: stopping ? colors.muted : colors.destructive, opacity: pressed ? 0.85 : 1 }]}
          onPress={stopTracking}
          disabled={stopping}
        >
          {stopping ? <ActivityIndicator color={colors.mutedForeground} /> : (
            <Text style={[s.actionBtnText, { color: colors.destructiveForeground }]}>Finalizar turno</Text>
          )}
        </Pressable>
      </View>
    );
  }

  // ── Vehicle selection screen ────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.logoCircle}><Feather name="navigation" size={20} color={colors.primaryForeground} /></View>
        <View><Text style={s.appName}>TransBus</Text><Text style={s.appSub}>App del Chofer</Text></View>
      </View>

      {permissionError && (
        <View style={s.errorBox}>
          <Feather name="alert-circle" size={16} color={colors.destructive} />
          <Text style={s.errorText}>{permissionError}</Text>
        </View>
      )}

      <Text style={s.sectionLabel}>Selecciona tu unidad</Text>

      {loadingVehicles ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={s.loadingText}>Cargando unidades...</Text>
        </View>
      ) : (
        <FlatList
          data={vehicles ?? []}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16 }}
          scrollEnabled={!!vehicles && vehicles.length > 0}
          ListEmptyComponent={<Text style={s.emptyText}>No hay unidades registradas.</Text>}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedVehicleId;
            return (
              <Pressable
                style={({ pressed }) => [s.vehicleCard, { backgroundColor: isSelected ? colors.secondary : colors.card, opacity: pressed ? 0.8 : 1 }, isSelected && s.vehicleCardSelected]}
                onPress={() => { setSelectedVehicleId(item.id); Haptics.selectionAsync(); }}
              >
                <View style={s.plateBox}><Text style={s.plateText}>{item.plateNumber}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.vehicleDriver}>{item.driverName}</Text>
                  <Text style={s.vehicleRoute}>Ruta #{item.routeId}</Text>
                </View>
                {isSelected && (
                  <View style={s.checkCircle}><Feather name="check" size={14} color={colors.primaryForeground} /></View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={({ pressed }) => [s.actionBtn, { backgroundColor: selectedVehicleId ? colors.accent : colors.secondary, opacity: pressed && !!selectedVehicleId ? 0.85 : 1 }]}
        onPress={selectedVehicleId ? () => setPinVerified(false) : undefined}
        disabled={!selectedVehicleId}
      >
        <Text style={[s.actionBtnText, { color: selectedVehicleId ? colors.accentForeground : colors.mutedForeground }]}>
          {selectedVehicleId ? "Continuar" : "Selecciona una unidad"}
        </Text>
      </Pressable>
    </View>
  );
}
