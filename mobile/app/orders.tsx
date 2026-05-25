import { View, Text } from 'react-native';

export default function OrdersScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>My Orders</Text>
      <Text>Track active and past orders</Text>
    </View>
  );
}