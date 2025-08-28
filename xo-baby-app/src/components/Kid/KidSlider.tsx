import React, { useRef, useState, useEffect } from 'react';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Dimensions, View, Image, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Kid } from '../../store/kidStore';
import KidProfileCard from './KidProfileCard';
import ProgressPoint from '../ProgressPoint';
import CarouselDotButton from './CarouselDotButton';

const { width, height } = Dimensions.get('window');

interface Props {
  kids: Kid[];
  initialKidId?: string;
}

export default function KidSlider({ kids, initialKidId }: Props) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const insets = useSafeAreaInsets();
  const availableHeight = Math.max(0, height - insets.top - insets.bottom);

  useEffect(() => {
    if (!initialKidId || kids.length === 0) return;
    const idx = kids.findIndex(k => k.id === initialKidId);
    if (idx >= 0) {
      setActiveIndex(idx);
      requestAnimationFrame(() => {
        carouselRef.current?.scrollTo({ index: idx, animated: false });
      });
    }
  }, [initialKidId, kids.length]);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16 }}>
        <Image
          source={require('../../../assets/home-parent/baby.png')} 
          style={{ width: 24, height: 24 }}
        />
        <View><Text>My Kids</Text></View>
      </View>
      <View style={styles.dotsWrap}>
        
        <CarouselDotButton
          activeCount={activeIndex}
          maxCount={kids.length}
          onDotPress={(index) => {
            setActiveIndex(index);
            carouselRef.current?.scrollTo({ index });
          }}
        />
      </View>
      <Carousel
        ref={carouselRef}
        width={width}
        height={availableHeight}
        vertical={false}
        data={kids}
        loop={false}
        autoPlay={false}
        scrollAnimationDuration={400}
        pagingEnabled
        enableSnap
        onSnapToItem={setActiveIndex}
        panGestureHandlerProps={{
          activeOffsetX: [-12, 12],
          failOffsetY: [-10, 10],
        }}
        renderItem={({ item }) => (
        <View style={{ width, height: availableHeight }}>
          <KidProfileCard key={item.id} kidId={item.id} height={availableHeight} />
         </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  dotsWrap: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 10,
    marginTop: 16,
  }
})
