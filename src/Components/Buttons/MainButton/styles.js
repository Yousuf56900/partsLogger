import {font, layout, spacing} from '../../../theme/styles';

import {StyleSheet} from 'react-native';
import {colors} from '../../../theme/colors';
import {vh} from '../../../theme/units';

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    height: vh * 6.5,
    // borderRadius: layout.borderRadius,
       width: '100%',
    flexDirection: 'row',
    gap: spacing?.small,
    borderWidth:3,
    borderColor:'#C4C4C4',
    borderRadius:30
  },
  textStyle: {
    fontSize: 13,
    color: colors.text.white
  },
  shadow: {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.35,
  shadowRadius: 6,
  elevation: 8, // Android
},

innerHighlight: {
  position: 'absolute',
  top: 2,
  left: 2,
  right: 2,
  height: '40%',
  borderRadius: 12,
  backgroundColor: 'rgba(255,255,255,0.15)',
},

content: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
},

});
export default styles;
