import React, { useRef, useState } from 'react';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Dimensions, View, Image, Text } from 'react-native';
import { Kid } from '../../store/kidStore';
import KidProfileCard from './KidProfileCard';
import ProgressPoint from '../ProgressPoint';
import CarouselDotButton from './CarouselDotButton';

const { width, height } = Dimensions.get('window');

interface Props {
  kids: Kid[];
}

export default function KidSlider({ kids }: Props) {
  const carouselRef = useRef<ICarouselInstance>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16 }}>
        <Image
          source={require('../../../assets/home-parent/baby.png')} 
          style={{ width: 24, height: 24 }}
        />
        <View><Text>My Kids</Text></View>
      </View>
      <View style={{marginTop: 16}}>
        
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
        height={height}
        data={kids}
        loop={false}
        autoPlay={false}
        scrollAnimationDuration={600}
        onSnapToItem={setActiveIndex}
        renderItem={({ item }) => (
          <KidProfileCard key={item.id} kidId={item.id} />
        )}
      />
    </View>
  );
}
