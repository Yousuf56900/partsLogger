import {Image, StyleSheet,  View} from 'react-native';
import React from 'react';
import CustomText from '../../../../Components/wrappers/Text/CustomText';
import {font} from '../../../../theme/styles';
import fonts from '../../../../Assets/fonts';
import {vh, vw} from '../../../../theme/units';
import {colors} from '../../../../theme/colors';
import {appImages} from '../../../../Assets/Images';
import {MainButton} from '../../../../Components/Buttons/MainButton';
import {styles} from '../styles';
const Step02 = ({titleData, banner, onButtonNext}) => {
  return (
    <View>
      {titleData && (
        <View style={{marginHorizontal: '5%',marginTop:'15%'}}>
          <CustomText
            text={`View your Vehicle`}
            size={vh * 4.2}
            font={fonts.clash.bold}
            color={colors.text.dimBlack}
          />
          {/* <CustomText
            text={`keep record for all your parts`}
            size={font.medium}
            font={fonts.benzin.regular}
            color={colors.text.dimBlack}
          /> */}
        </View>
      )}
      {banner && (
        <>
          <Image
            source={appImages.appStarter1}
            resizeMode="cover"
            style={[styles.banner, {height: 300}]}
          />
          <MainButton
            title={'View your Vehicle'}
            style={styles.buttonStyle}
            onPress={onButtonNext}
          />
        </>
      )}
    </View>
  );
};

export default Step02;
