import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { View, Text } from "react-native";
import AuthStack from "./AuthStack";
import AppStack from "./AppStack";
import { useUserStore } from "@/store/userStore";
import { useKidStore } from "@/store/kidStore";

export default function RootNavigator() {
  const user = useUserStore((state) => state.user);
  const kids = useKidStore((s) => s.kids);

  useEffect(() => {
    console.log("USER changed:", user);
  }, [user]);

  useEffect(() => {
    console.log("KIDS changed:", kids);
  }, [kids]);

  return (
    <NavigationContainer>
      {/* Debug overlay - remove this after fixing */}
      {user && (
        <View style={{
          position: 'absolute',
          top: 50,
          right: 10,
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: 8,
          borderRadius: 4,
          zIndex: 1000,
        }}>
          <Text style={{ color: 'white', fontSize: 12 }}>
            Role: {user.role}
          </Text>
          <Text style={{ color: 'white', fontSize: 10 }}>
            UID: {user.uid.slice(0, 8)}...
          </Text>
        </View>
      )}
      
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
