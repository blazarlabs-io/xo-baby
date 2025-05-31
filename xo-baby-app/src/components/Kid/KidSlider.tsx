import React from 'react';
import Carousel from 'react-native-reanimated-carousel';
import { Dimensions } from 'react-native';
import { Kid } from '../../store/userStore';
import KidCard from './KidCard';

const screenWidth = Dimensions.get('window').width;

interface Props {
  kids: Kid[];
}

export default function KidSlider({ kids }: Props) {
  return (
    <Carousel
      loop
      width={screenWidth}
      height={280}
      autoPlay={false}
      data={kids}
      scrollAnimationDuration={600}
      renderItem={({ item }) => <KidCard kid={item} />}
    />
  );
}
