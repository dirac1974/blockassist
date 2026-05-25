import { View, Text } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Profile & Wallet</Text>
      <Text>USDC Balance | $ASSIST Stake | Reputation</Text>
    </View>
  );
}