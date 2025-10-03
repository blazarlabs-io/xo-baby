import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

const PINATA_API_KEY = process.env.PINATA_API_KEY || '';
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || '';
const PINATA_BASE_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY = process.env.PINATA_GATEWAY || '';

if (!PINATA_GATEWAY) {
  console.warn('⚠️ PINATA_GATEWAY not set! You MUST add your dedicated gateway to .env file');
  console.warn('⚠️ Get it from: https://app.pinata.cloud/gateway');
}


export interface PinataUploadResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

export interface UploadAvatarResult {
  ipfsHash: string;
  gatewayUrl: string;
  pinSize: number;
}

export const uploadAvatar = async (imageUri: string): Promise<UploadAvatarResult> => {
  try {
    console.log('📤 Starting avatar upload to Pinata...');
    console.log('Image URI:', imageUri);

    // Read the file as base64
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error('File does not exist');
    }

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Determine file extension and MIME type
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = getMimeType(fileExtension);
    
    // Convert base64 to blob
    const blob = base64ToBlob(base64, mimeType);
    
    // Create form data
    const formData = new FormData();
    const filename = `avatar_${Date.now()}.${fileExtension}`;
    
    // Append file to form data
    // @ts-ignore - React Native FormData handles this differently
    formData.append('file', {
      uri: imageUri,
      type: mimeType,
      name: filename,
    });

    // Optional: Add metadata
    const metadata = JSON.stringify({
      name: filename,
      keyvalues: {
        type: 'avatar',
        uploadedAt: new Date().toISOString(),
      }
    });
    formData.append('pinataMetadata', metadata);

    // Upload to Pinata
    console.log('🔄 Uploading to Pinata API...');
    const response = await axios.post<PinataUploadResponse>(
      `${PINATA_BASE_URL}/pinning/pinFileToIPFS`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
      }
    );

    const ipfsHash = response.data.IpfsHash;
    const gatewayUrl = getGatewayUrl(ipfsHash);

    console.log('✅ Avatar uploaded successfully!');
    console.log('IPFS Hash:', ipfsHash);
    console.log('Gateway URL:', gatewayUrl);

    return {
      ipfsHash,
      gatewayUrl,
      pinSize: response.data.PinSize,
    };
  } catch (error: any) {
    console.error('❌ Failed to upload avatar to Pinata:', error);
    
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    
    throw new Error(`Failed to upload avatar to Pinata: ${error.message}`);
  }
};

export const getGatewayUrl = (ipfsHash: string): string => {
  if (!PINATA_GATEWAY) {
    console.error('❌ PINATA_GATEWAY not configured!');
    console.error('❌ Add your dedicated gateway to .env file');
    console.error('❌ Get it from: https://app.pinata.cloud/gateway');
    throw new Error('PINATA_GATEWAY not configured. Please add it to your .env file. See SETUP_GATEWAY_NOW.md');
  }
  
  console.log('🔍--------------------- PINATA_GATEWAY:', PINATA_GATEWAY);
  console.log('🔍--------------------- IPFS Hash:', ipfsHash);
  // Remove ipfs:// prefix if present
  const hash = ipfsHash.replace('ipfs://', '');
  const url = `${PINATA_GATEWAY}/ipfs/${hash}`;
  console.log('✅--------------------- Gateway URL:', url);
  return url;
};

export const getAvatarUrl = (ipfsHash: string): string => {
  if (!ipfsHash) return '';
  
  // If it's already a full URL, return as is
  if (ipfsHash.startsWith('http://') || ipfsHash.startsWith('https://')) {
    return ipfsHash;
  }
  
  // If it's an ipfs:// URL or just a hash, convert to gateway URL
  return getGatewayUrl(ipfsHash);
};

export const testPinataConnection = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing Pinata connection...');
    
    const response = await axios.get(
      `${PINATA_API_KEY}/data/testAuthentication`,
      {
        headers: {
          'pinata_api_key': PINATA_API_KEY,
          'pinata_secret_api_key': PINATA_SECRET_API_KEY,
        },
      }
    );

    const isConnected = response.status === 200;
    console.log(isConnected ? '✅ Pinata connection successful' : '❌ Pinata connection failed');
    return isConnected;
  } catch (error: any) {
    console.error('❌ Pinata connection test failed:', error.message);
    return false;
  }
};

const getMimeType = (extension: string): string => {
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'heic': 'image/heic',
    'heif': 'image/heif',
  };
  
  return mimeTypes[extension] || 'image/jpeg';
};

const base64ToBlob = (base64: string, mimeType: string): Blob | null => {
  if (Platform.OS === 'web') {
    try {
      const byteCharacters = atob(base64);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: mimeType });
    } catch (error) {
      console.error('Failed to convert base64 to blob:', error);
      return null;
    }
  }
  
  return null; // Not needed for React Native
};
