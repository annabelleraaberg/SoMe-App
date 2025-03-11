import { Tabs } from "expo-router";
import React from "react";

import { TabBarIcon } from "@/components/navigation/TabBarIcon";

import { Text } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const TabLayout = () => {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
          headerTitle(props) {
            return (
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "black",
                }}
              >
                Art Gallery
              </Text>
            );
          },
        }}
      />
      <Tabs.Screen
        name="searchPage"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
          headerTitle(props) {
            return (
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "black" }}
              >
                Search
              </Text>
            );
          },
        }}
      />
      <Tabs.Screen
        name="locationPage"
        options={{
          title: "Exhibition locations",
          tabBarIcon: ({ color, focused }) => (
            // Icon from: https://icons.expo.fyi/Index/Entypo/location
            <Entypo name="location" size={24} color={color} />
          ),
          headerTitle(props) {
            return (
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "black" }}
              >
                Exhibition Locations
              </Text>
            );
          },
        }}
      />
      <Tabs.Screen
        name="profilePage"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            // Icon from: https://icons.expo.fyi/Index/AntDesign/user
            <AntDesign name="user" size={24} color={color} />
          ),
          headerTitle(props) {
            return (
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: "black" }}
              >
                Profile Page
              </Text>
            );
          },
        }}
      />
    </Tabs>
  );
};

export default TabLayout;
