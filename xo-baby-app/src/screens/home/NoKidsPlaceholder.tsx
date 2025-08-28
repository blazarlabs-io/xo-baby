import { View, Image, Text, Pressable, StyleSheet } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

export default function NoKidsPlaceholder({ onAdd }: { onAdd: () => void }) {
  return (
    <LinearGradient colors={['#E2F3F3', '#E2FFFF']} style={styles.centered}>
      <View style={styles.firsLineContainer}>
        <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
        <Text>My kids</Text>
       </View>

      <Image source={require('../../../assets/home-parent/kid1.png')} style={styles.image} />
      <Text style={styles.title}>Keep your first child safe with Womby</Text>
      <Text style={styles.subTitle}>Please add your first kid</Text>

      <Pressable onPress={onAdd} style={styles.button}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image source={require('../../../assets/home-parent/baby.png')} style={{ width: 24, height: 24 }} />
          <Text style={styles.addKidText}>Add first Kid</Text>
        </View>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    width: '100%',
    paddingHorizontal: 12,
  },
  firsLineContainer:{
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 4,
  },
  image: {
    width: 251,
    height: 251,
    resizeMode: 'contain',
    marginTop: 24,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
    color: '#222128',
    fontFamily: 'Poppins',
    fontSize: 24,
    fontStyle: 'normal',
    fontWeight: 500,
    lineHeight: 32
  },
  subTitle: {
    fontSize: 12,
    color: '#8D8D8D',
    fontFamily: 'Poppins',
    lineHeight: 20,
    fontWeight: 400,
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 16
  },
  button: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 28,
    borderWidth: 1,
    borderColor: '#31CECE',
    borderRadius: 32, 
    borderStyle: 'dashed',
    width: '100%',
    height: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8
  },
  addKidText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left"
  },
});
