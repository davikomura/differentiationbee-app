// components/navigation/AppTabBar.tsx
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle, Path } from "react-native-svg";

type TabIconProps = {
  color: string;
  size: number;
};

function ProfileTabIcon({ color, size }: TabIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="3.25" stroke={color} strokeWidth="1.8" />
      <Path
        d="M5.75 18.25c1.39-2.54 3.58-3.75 6.25-3.75s4.86 1.21 6.25 3.75"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function AppTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-[#070B14]">
      <View
        className="flex-row items-center border-t border-white/10 bg-[#08111F]/95 px-2"
        style={{ height: 64 }}
      >
        {state.routes.map((route, index) => {
          const descriptor = descriptors[route.key];
          const { options } = descriptor;
          const isFocused = state.index === index;

          const label =
            typeof options.tabBarLabel === "string"
              ? options.tabBarLabel
              : typeof options.title === "string"
                ? options.title
                : route.name;

          const active = "#19D3FF";
          const inactive = "#7B8AA6";
          const color = isFocused ? active : inactive;

          const isProfileTab =
            route.name.toLowerCase() === "profile" ||
            label.toLowerCase() === "perfil";

          const icon = isProfileTab ? (
            <ProfileTabIcon color={color} size={22} />
          ) : (
            options.tabBarIcon?.({
              focused: isFocused,
              color,
              size: 22,
            }) ?? null
          );

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: "tabLongPress",
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              onLongPress={onLongPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              style={({ pressed }) => ({
                opacity: pressed ? 0.75 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              })}
              className="flex-1 items-center justify-center"
            >
              <View
                className={[
                  "h-[34px] w-[44px] items-center justify-center rounded-[18px]",
                  isFocused
                    ? "border border-[#19D3FF]/25 bg-[#19D3FF]/10"
                    : "border border-transparent bg-transparent",
                ].join(" ")}
                style={{
                  shadowColor: isFocused ? "#19D3FF" : "#000",
                  shadowOpacity: isFocused ? 0.18 : 0,
                  shadowRadius: isFocused ? 10 : 0,
                  shadowOffset: { width: 0, height: 6 },
                  elevation: isFocused ? 8 : 0,
                  transform: [
                    {
                      translateY: isFocused && Platform.OS === "ios" ? -1 : 0,
                    },
                  ],
                }}
              >
                {icon}
              </View>

              <Text
                numberOfLines={1}
                className="mt-1 text-[11px] font-extrabold tracking-[0.2px]"
                style={{ color }}
              >
                {label}
              </Text>

              <View
                className="mt-1 h-[3px] w-[18px] rounded-full"
                style={{
                  backgroundColor: isFocused
                    ? "rgba(25,211,255,0.95)"
                    : "transparent",
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: insets.bottom }} className="bg-[#070B14]" />
    </View>
  );
}
