import { View, Pressable } from "react-native";

interface Props {
  activeCount: number;
  maxCount: number;
  onDotPress?: (index: number) => void;
}

export default function CarouselDotButton({ activeCount, maxCount, onDotPress }: Props) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8 }}>
      {Array.from({ length: maxCount }).map((_, index) => (
        <Pressable
          key={index}
          onPress={() => onDotPress?.(index)}
          style={{
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: index === activeCount ? '#31CECE' : '#E0E0E0',
          }}
        />
      ))}
    </View>
  );
}
