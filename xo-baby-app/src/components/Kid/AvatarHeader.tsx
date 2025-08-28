import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import AvatarGirl from '../../../assets/kids/avatar-girl-large.svg';
import { useKidStore } from '../../store/kidStore';

interface AvatarHeaderProps {
  kidID: string
}

export default function AvatarHeader({ kidID }: AvatarHeaderProps) {

	const kid = useKidStore((state) =>
    state.kids.find((k) => k.id === kidID)
  );

  return (
    <View style={styles.container}>
      <View style={styles.avatarWrapper}>
        <View style={styles.avatarBorder}>
          <AvatarGirl width={92} height={92} />
        </View>
      </View>
			<View style={styles.avatarBackground}>
				<Image
							source={require('../../../assets/kids/avatar-background.jpg')}
							style={{ width: '100%', height: 89, resizeMode: 'cover' }}
						/>
			</View>
			<View style={styles.kidNameContainer}>
				<Text style={styles.kidNameText}>{kid?.firstName} {kid?.lastName}</Text>
			</View>
    </View>
  );
}

const styles = StyleSheet.create({

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#444',
    marginVertical: 4,
  },
	container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
		marginTop: 1,
		width: '100%',
  },
  avatarWrapper: {
    width: 102,
    height: 102,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#31CECE',
    borderRadius: 102,
    padding: 5,
    zIndex: 2,
    position: 'relative',
  },
  avatarBorder: {
    backgroundColor: '#FFFFFF',
    borderRadius: 92,
    padding: 2,
  },
  avatarBackground: {
		position: 'absolute',
		top: 65,
		left: 0,
		right: 0,
		zIndex: 1,
		alignItems: 'center',
	},

	avatarBackgroundImage: {
		width: '100%',
		height: 60,
		resizeMode: 'cover',
	},
	kidNameContainer: {
		marginBottom: 24,
		marginTop: 76,
	},
	kidNameText:{
		fontSize: 20,
		lineHeight: 20,
		fontWeight: "600",
		fontFamily: "Poppins-SemiBold",
		color: "#212129",
		textAlign: "center"
	}
});
