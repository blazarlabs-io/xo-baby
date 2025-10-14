import React from 'react';
import { Image, ImageStyle } from 'react-native';
import { getAvatarUrl } from '../../services/pinataServices';

interface AvatarImageProps {
  avatarUrl?: string;
  gender?: string;
  style?: ImageStyle;
}

const AvatarImage: React.FC<AvatarImageProps> = ({ avatarUrl, gender, style }) => {
  // Determine which avatar to show
  const getAvatarSource = () => {
    console.log('🖼️ AvatarImage Component:', {
      avatarUrl,
      gender,
      avatarUrlType: typeof avatarUrl,
      avatarUrlLength: avatarUrl?.length,
      isEmpty: !avatarUrl || avatarUrl === '',
    });

    // If no avatar URL or empty string, use default based on gender
    if (!avatarUrl || avatarUrl === '') {
      console.log('🖼️ Using default avatar (no URL provided)');
      return gender === 'female' 
        ? require('../../../assets/kids/avatar-girl.png')
        : require('../../../assets/kids/avatar-boy.png');
    }

    // If it's a predefined avatar type
    if (avatarUrl === 'default-boy') {
      console.log('🖼️ Using predefined boy avatar');
      return require('../../../assets/kids/avatar-boy.png');
    }
    if (avatarUrl === 'default-girl') {
      console.log('🖼️ Using predefined girl avatar');
      return require('../../../assets/kids/avatar-girl.png');
    }

    // If it's an IPFS hash or URL, use the getAvatarUrl helper
    // This handles both IPFS hashes and full URLs
    const resolvedUrl = getAvatarUrl(avatarUrl);
    if (resolvedUrl) {
      console.log('🖼️ Using resolved URL:', resolvedUrl);
      return { uri: resolvedUrl };
    }

    // Fallback to default avatar
    console.log('🖼️ Falling back to default avatar (no match)');
    return gender === 'female'
      ? require('../../../assets/kids/avatar-girl.png')
      : require('../../../assets/kids/avatar-boy.png');
  };

  const avatarSource = getAvatarSource();

  console.log('🖼️ AvatarSource:', avatarSource);
  return (
    <Image
      source={avatarSource}
      style={style}
      resizeMode="cover"
      onError={(error) => {
        console.error('🖼️ Image failed to load:', avatarUrl, error.nativeEvent.error);
      }}
      onLoad={() => {
        console.log('✅ Image loaded successfully:', avatarUrl);
      }}
    />
  );
};

export default AvatarImage; 