
import { View, Text } from 'react-native';
import { commonStyles } from '../../styles/commonStyles';

export default function ProfileTab() {
  return (
    <View style={[commonStyles.container, commonStyles.centerContent]}>
      <Text>Profile</Text>
    </View>
  );
}
