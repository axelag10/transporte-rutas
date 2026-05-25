import { useListVehicles, useUpdatePosition } from "@workspace/api-client-react";
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

const GPS_INTERVAL_MS = 5000;

interface GeoCoords {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
}

export default function DriverScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: vehicles, isLoading: loadingVehicles } = useListVehicles();
  const { mutate: sendPosition } = useUpdatePosition();

  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<GeoCoords | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [shiftStart, setShiftStart] = useState<Date | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState("00:00:00");

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const selectedVehicle = vehicles?.find((v) => v.id === selectedVehicleId);

  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isTracking, pulseAnim]);

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
          (pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
            }),
          (err) => reject(err),
          { enableHighAccuracy: true, timeout: 4000 }
        );
      } else {
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
          .then((pos) =>
            resolve({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              speed: pos.coords.speed,
              heading: pos.coords.heading,
            })
          )
          .catch(reject);
      }
    });
  }, []);

  const startTracking = useCallback(async () => {
    if (!selectedVehicleId) return;

    if (Platform.OS !== "web") {
      const [status, requestPermission] = await (async () => {
        const perm = await Location.getForegroundPermissionsAsync();
        if (perm.granted) return [perm, null] as const;
        const req = await Location.requestForegroundPermissionsAsync();
        return [req, null] as const;
      })();
      if (!status.granted) {
        setPermissionError("Se necesita permiso de ubicación para continuar.");
        return;
      }
    }

    setPermissionError(null);
    const now = new Date();
    setShiftStart(now);
    setIsTracking(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const tick = async () => {
      try {
        const coords = await getPosition();
        setCurrentCoords(coords);
        sendPosition(
          {
            id: selectedVehicleId,
            data: {
              lat: coords.latitude,
              lng: coords.longitude,
              speed: coords.speed ?? undefined,
              heading: coords.heading ?? undefined,
            },
          },
          { onSuccess: () => setLastSync(new Date()) }
        );
      } catch {
        // silently skip failed reads
      }
    };

    tick();
    intervalRef.current = setInterval(tick, GPS_INTERVAL_MS);
    elapsedRef.current = setInterval(() => {
      setElapsed(formatElapsed(now));
    }, 1000);
  }, [selectedVehicleId, getPosition, sendPosition]);

  const stopTracking = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (elapsedRef.current) clearInterval(elapsedRef.current);
    intervalRef.current = null;
    elapsedRef.current = null;
    setIsTracking(false);
    setCurrentCoords(null);
    setLastSync(null);
    setShiftStart(null);
    setElapsed("00:00:00");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedRef.current) clearInterval(elapsedRef.current);
    };
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const s = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: topPad + 16,
      paddingBottom: bottomPad + 16,
      paddingHorizontal: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 28,
      gap: 12,
    },
    logoCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    appName: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
    },
    appSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.mutedForeground,
      letterSpacing: 1,
      textTransform: "uppercase",
      marginBottom: 12,
      fontFamily: "Inter_600SemiBold",
    },
    vehicleCard: {
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
    },
    vehicleCardSelected: {
      borderWidth: 1.5,
      borderColor: colors.primary,
    },
    plateBox: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
    },
    plateText: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.foreground,
      letterSpacing: 1.5,
      fontFamily: "Inter_700Bold",
    },
    vehicleDriver: {
      fontSize: 14,
      color: colors.foreground,
      fontFamily: "Inter_500Medium",
    },
    vehicleRoute: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    checkCircle: {
      marginLeft: "auto" as unknown as number,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    dashboardCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 24,
      marginBottom: 16,
      alignItems: "center",
    },
    pulseWrapper: {
      width: 80,
      height: 80,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    pulseRing: {
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.accent + "30",
    },
    statusDot: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    statusLabel: {
      fontSize: 13,
      fontWeight: "600",
      color: colors.accent,
      letterSpacing: 2,
      textTransform: "uppercase",
      marginBottom: 4,
      fontFamily: "Inter_600SemiBold",
    },
    vehicleNameBig: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.foreground,
      letterSpacing: 2,
      fontFamily: "Inter_700Bold",
    },
    elapsedTime: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.foreground,
      letterSpacing: 2,
      marginTop: 8,
      fontFamily: "Inter_700Bold",
    },
    elapsedSub: {
      fontSize: 12,
      color: colors.mutedForeground,
      marginTop: 2,
      fontFamily: "Inter_400Regular",
    },
    gpsRow: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 8,
      flexDirection: "row",
      gap: 12,
    },
    gpsStat: {
      flex: 1,
      alignItems: "center",
    },
    gpsLabel: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 4,
      fontFamily: "Inter_400Regular",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    gpsValue: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
    },
    syncRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 4,
    },
    syncDot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
    },
    syncText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    separator: {
      width: 1,
      height: "100%",
      backgroundColor: colors.border,
    },
    actionBtn: {
      borderRadius: 16,
      height: 58,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    actionBtnText: {
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter_700Bold",
    },
    changeBtn: {
      alignItems: "center",
      marginTop: 14,
      paddingVertical: 8,
    },
    changeBtnText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    errorBox: {
      backgroundColor: colors.destructive + "22",
      borderRadius: 10,
      padding: 12,
      marginBottom: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    errorText: {
      fontSize: 13,
      color: colors.destructive,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      textAlign: "center",
      marginTop: 40,
      fontFamily: "Inter_400Regular",
    },
  });

  if (isTracking && selectedVehicle) {
    return (
      <View style={s.root}>
        <View style={s.header}>
          <View style={s.logoCircle}>
            <Feather name="navigation" size={20} color={colors.primaryForeground} />
          </View>
          <View>
            <Text style={s.appName}>TransBus</Text>
            <Text style={s.appSub}>App del Chofer</Text>
          </View>
        </View>

        <View style={s.dashboardCard}>
          <View style={s.pulseWrapper}>
            <Animated.View style={[s.pulseRing, { transform: [{ scale: pulseAnim }] }]} />
            <View style={s.statusDot}>
              <Feather name="radio" size={24} color={colors.accentForeground} />
            </View>
          </View>
          <Text style={s.statusLabel}>En ruta</Text>
          <Text style={s.vehicleNameBig}>{selectedVehicle.plateNumber}</Text>
          <Text style={s.elapsedTime}>{elapsed}</Text>
          <Text style={s.elapsedSub}>Tiempo de turno</Text>
        </View>

        {currentCoords && (
          <View style={s.gpsRow}>
            <View style={s.gpsStat}>
              <Text style={s.gpsLabel}>Latitud</Text>
              <Text style={s.gpsValue}>{currentCoords.latitude.toFixed(5)}</Text>
            </View>
            <View style={s.separator} />
            <View style={s.gpsStat}>
              <Text style={s.gpsLabel}>Longitud</Text>
              <Text style={s.gpsValue}>{currentCoords.longitude.toFixed(5)}</Text>
            </View>
            <View style={s.separator} />
            <View style={s.gpsStat}>
              <Text style={s.gpsLabel}>Velocidad</Text>
              <Text style={s.gpsValue}>
                {currentCoords.speed != null
                  ? `${(currentCoords.speed * 3.6).toFixed(0)} km/h`
                  : "—"}
              </Text>
            </View>
          </View>
        )}

        <View style={s.syncRow}>
          <View
            style={[
              s.syncDot,
              { backgroundColor: lastSync ? colors.accent : colors.mutedForeground },
            ]}
          />
          <Text style={s.syncText}>
            {lastSync
              ? `Última sincronización: ${lastSync.toLocaleTimeString("es-MX")}`
              : "Esperando primera sincronización..."}
          </Text>
        </View>

        <View style={{ flex: 1 }} />

        <Pressable
          style={({ pressed }) => [
            s.actionBtn,
            {
              backgroundColor: colors.destructive,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
          onPress={stopTracking}
        >
          <Text style={[s.actionBtnText, { color: colors.destructiveForeground }]}>
            Finalizar turno
          </Text>
        </Pressable>

        <Pressable style={s.changeBtn} onPress={stopTracking}>
          <Text style={s.changeBtnText}>Cambiar unidad</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.logoCircle}>
          <Feather name="navigation" size={20} color={colors.primaryForeground} />
        </View>
        <View>
          <Text style={s.appName}>TransBus</Text>
          <Text style={s.appSub}>App del Chofer</Text>
        </View>
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
          ListEmptyComponent={
            <Text style={s.emptyText}>No hay unidades registradas.</Text>
          }
          renderItem={({ item }) => {
            const isSelected = item.id === selectedVehicleId;
            return (
              <Pressable
                style={({ pressed }) => [
                  s.vehicleCard,
                  {
                    backgroundColor: isSelected
                      ? colors.secondary
                      : colors.card,
                    opacity: pressed ? 0.8 : 1,
                  },
                  isSelected && s.vehicleCardSelected,
                ]}
                onPress={() => {
                  setSelectedVehicleId(item.id);
                  Haptics.selectionAsync();
                }}
              >
                <View style={s.plateBox}>
                  <Text style={s.plateText}>{item.plateNumber}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.vehicleDriver}>{item.driverName}</Text>
                  <Text style={s.vehicleRoute}>Ruta #{item.routeId}</Text>
                </View>
                {isSelected && (
                  <View style={s.checkCircle}>
                    <Feather name="check" size={14} color={colors.primaryForeground} />
                  </View>
                )}
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        style={({ pressed }) => [
          s.actionBtn,
          {
            backgroundColor:
              selectedVehicleId ? colors.accent : colors.secondary,
            opacity: pressed && selectedVehicleId ? 0.85 : 1,
          },
        ]}
        onPress={selectedVehicleId ? startTracking : undefined}
        disabled={!selectedVehicleId}
      >
        {loadingVehicles ? (
          <ActivityIndicator color={colors.accentForeground} />
        ) : (
          <Text
            style={[
              s.actionBtnText,
              {
                color: selectedVehicleId
                  ? colors.accentForeground
                  : colors.mutedForeground,
              },
            ]}
          >
            {selectedVehicleId ? "Iniciar turno" : "Selecciona una unidad"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}
