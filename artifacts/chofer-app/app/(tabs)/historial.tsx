import { useListShifts } from "@workspace/api-client-react";
import { Feather } from "@expo/vector-icons";
import React, { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

interface ShiftDetail {
  id: number;
  vehicleId: number;
  startedAt: string;
  endedAt: string | null;
  positionsCount: number;
  plateNumber: string;
  driverName: string;
}

function formatDuration(startedAt: string, endedAt: string | null): string {
  if (!endedAt) return "En curso";
  const diffMs = new Date(endedAt).getTime() - new Date(startedAt).getTime();
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return `${h}h ${m}m`;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function groupByDate(shifts: ShiftDetail[]): { date: string; items: ShiftDetail[] }[] {
  const map = new Map<string, ShiftDetail[]>();
  for (const shift of shifts) {
    const key = new Date(shift.startedAt).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(shift);
  }
  return Array.from(map.entries()).map(([, items]) => ({
    date: formatDate(items[0].startedAt),
    items,
  }));
}

export default function HistorialScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data: shifts, isLoading, refetch, isFetching } = useListShifts();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 60;

  const groups = groupByDate((shifts as ShiftDetail[] | undefined) ?? []);

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const s = StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingTop: topPad + 16,
      paddingHorizontal: 20,
      paddingBottom: 16,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    logoCircle: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: colors.secondary,
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
    listContent: {
      paddingHorizontal: 20,
      paddingBottom: bottomPad,
    },
    dateLabel: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: "uppercase",
      marginTop: 20,
      marginBottom: 10,
      fontFamily: "Inter_600SemiBold",
    },
    shiftCard: {
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      marginBottom: 8,
    },
    shiftCardActive: {
      borderWidth: 1.5,
      borderColor: colors.accent,
    },
    cardRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    plateChip: {
      backgroundColor: colors.secondary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    plateText: {
      fontSize: 14,
      fontWeight: "700",
      color: colors.foreground,
      letterSpacing: 1.2,
      fontFamily: "Inter_700Bold",
    },
    durationBadge: {
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    durationText: {
      fontSize: 13,
      fontWeight: "600",
      fontFamily: "Inter_600SemiBold",
    },
    statsRow: {
      flexDirection: "row",
      gap: 8,
    },
    statItem: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
    },
    statText: {
      fontSize: 12,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
    },
    separator: {
      width: 1,
      height: 14,
      backgroundColor: colors.border,
    },
    driverText: {
      fontSize: 13,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      marginBottom: 8,
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
    emptyContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 40,
      gap: 12,
    },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 4,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      textAlign: "center",
    },
    emptyText: {
      fontSize: 14,
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
    },
  });

  const renderShift = ({ item }: { item: ShiftDetail }) => {
    const isActive = !item.endedAt;
    const duration = formatDuration(item.startedAt, item.endedAt);
    return (
      <View style={[s.shiftCard, isActive && s.shiftCardActive]}>
        <View style={s.cardRow}>
          <View style={s.plateChip}>
            <Text style={s.plateText}>{item.plateNumber}</Text>
          </View>
          <View
            style={[
              s.durationBadge,
              {
                backgroundColor: isActive
                  ? colors.accent + "22"
                  : colors.secondary,
              },
            ]}
          >
            <Text
              style={[
                s.durationText,
                { color: isActive ? colors.accent : colors.mutedForeground },
              ]}
            >
              {duration}
            </Text>
          </View>
        </View>

        <Text style={s.driverText}>{item.driverName}</Text>

        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Feather name="play" size={12} color={colors.mutedForeground} />
            <Text style={s.statText}>{formatTime(item.startedAt)}</Text>
          </View>
          {item.endedAt && (
            <>
              <View style={s.separator} />
              <View style={s.statItem}>
                <Feather name="stop-circle" size={12} color={colors.mutedForeground} />
                <Text style={s.statText}>{formatTime(item.endedAt)}</Text>
              </View>
            </>
          )}
          <View style={s.separator} />
          <View style={s.statItem}>
            <Feather name="map-pin" size={12} color={colors.mutedForeground} />
            <Text style={s.statText}>{item.positionsCount} pts GPS</Text>
          </View>
        </View>
      </View>
    );
  };

  type ListItem =
    | { type: "date"; key: string; label: string }
    | { type: "shift"; key: string; shift: ShiftDetail };

  const flatData: ListItem[] = groups.flatMap((group) => [
    { type: "date" as const, key: `date-${group.date}`, label: group.date },
    ...group.items.map((s) => ({
      type: "shift" as const,
      key: `shift-${s.id}`,
      shift: s,
    })),
  ]);

  return (
    <View style={s.root}>
      <View style={s.header}>
        <View style={s.logoCircle}>
          <Feather name="clock" size={20} color={colors.primary} />
        </View>
        <View>
          <Text style={s.appName}>Historial</Text>
          <Text style={s.appSub}>Tus turnos anteriores</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={s.loadingText}>Cargando historial...</Text>
        </View>
      ) : flatData.length === 0 ? (
        <View style={s.emptyContainer}>
          <View style={s.emptyIcon}>
            <Feather name="clock" size={28} color={colors.mutedForeground} />
          </View>
          <Text style={s.emptyTitle}>Sin turnos registrados</Text>
          <Text style={s.emptyText}>
            Cuando inicies tu primer turno, aparecerá aquí con hora de inicio, fin y
            puntos GPS capturados.
          </Text>
        </View>
      ) : (
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.key}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isFetching && !isLoading}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => {
            if (item.type === "date") {
              return <Text style={s.dateLabel}>{item.label}</Text>;
            }
            return renderShift({ item: item.shift });
          }}
        />
      )}
    </View>
  );
}
