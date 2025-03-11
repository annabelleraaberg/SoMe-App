// Lecture code. https://github.com/studBrage/Kryssplattform-HK-H24/blob/main/components/Spacer.tsx

import { View } from "react-native";

type SpacerProps = {
  height?: number;
  width?: number;
};

const Spacer = ({ height = 20, width = undefined }: SpacerProps) => {
  return (
    <View
      style={{
        height: height ? height : 0,
        width: width ? width : 0,
      }}
    ></View>
  );
};

export default Spacer;
