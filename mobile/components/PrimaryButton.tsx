import { TouchableOpacity, Text } from 'react-native';

export default function PrimaryButton({ title, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: '#007AFF', padding: 15, borderRadius: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>{title}</Text>
    </TouchableOpacity>
  );
}