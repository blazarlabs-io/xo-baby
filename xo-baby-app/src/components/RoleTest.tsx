import React, { useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import { testGetUserRole } from '../api/userApi';

export default function RoleTest() {
  const testRoles = async () => {
    console.log('🧪 Testing role fetching...');

    try {
      // Test parent role
      const parentResult = await testGetUserRole('WgO7wbsm9FXJdo52XOC2oZbZsWi2');
      console.log('👶 Parent role test result:', parentResult);

      // Test doctor role
      const doctorResult = await testGetUserRole('U3AK5s2vBdTqm64TCs5oikGDLNs2');
      console.log('👨‍⚕️ Doctor role test result:', doctorResult);

    } catch (error) {
      console.error('❌ Role test failed:', error);
    }
  };

  useEffect(() => {
    testRoles();
  }, []);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 10 }}>
        Role Test Component
      </Text>
      <Pressable
        onPress={testRoles}
        style={{
          backgroundColor: '#31CECE',
          padding: 10,
          borderRadius: 5,
          alignItems: 'center'
        }}
      >
        <Text style={{ color: 'white' }}>Test Roles Again</Text>
      </Pressable>
    </View>
  );
}




