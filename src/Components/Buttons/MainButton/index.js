import { TouchableOpacity, View } from 'react-native';
import React from 'react';

import styles from './styles';
import withLinearGradient from '../../../HOC/withLinearGradient';
import CustomText from '../../wrappers/Text/CustomText';
import withCircleButton from '../../../HOC/withCircleButton';
import MyIcons from '../../MyIcons';
import { vh } from '../../../theme/units';
import fonts from '../../../Assets/fonts';
import Feather from 'react-native-vector-icons/Feather';
import LinearGradient from 'react-native-linear-gradient';

const MainButton = ({
  style,
  title,
  onPress,
  textStyle,
  disabled,
  icon,
  hideIcon = false,
}) => {
  return (
    <TouchableOpacity
      disabled={disabled}

      onPress={onPress}>
      <LinearGradient colors={['#AF0000', '#FF2E00', '#FF1A00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }} style={[styles.container, style]}>
        {icon ? (
          <MyIcons name={'backIcon'} />
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", alignSelf: "center" }}>
            <CustomText
              text={title}
              style={[styles.textStyle, textStyle]}
              font={fonts.benzin.semibold}
            />
            {(() => {

              if (!hideIcon) {
                return <Feather name={'arrow-right'} color="#fff" size={16} />;
              } else if (hideIcon) {
                return <Feather name={'arrow-right'} color="#ffffff05" size={vh * 2} />;
              }
            })()}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const colors = ['#AF0000', '#FF2E00', '#FF1A00'];
const MainButtonWithGradient = withLinearGradient(MainButton, colors);
const MainButtonWithCircle = withCircleButton(MainButton);

export { MainButtonWithGradient, MainButton, MainButtonWithCircle };
