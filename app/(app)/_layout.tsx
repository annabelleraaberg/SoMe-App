// Based on lecture code: https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/app/(app)/_layout.tsx

import { PostProvider } from "@/providers/PostContext";
import { useSession } from "@/providers/authctx";
import { Redirect, Stack } from "expo-router";
import { View, Text } from "react-native";

export default function AppLayout() {
  const { user, isLoading, isGuest } = useSession();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Retreiving user...</Text>
      </View>
    );
  }

  // Added isGuest to handle guest state
  if (!user && !isGuest) {
    return <Redirect href="/authentication" />;
  }

  return (
    <PostProvider>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            title: "Back",
            animation: "slide_from_left",
          }}
        />
        {/*<Stack.Screen name="postDetails/[id]" />*/}
      </Stack>
    </PostProvider>
  );
}
