import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';
import CustomText from '../../../../Components/wrappers/Text/CustomText';
import fonts from '../../../../Assets/fonts';
import {vh, vw} from '../../../../theme/units';
import {colors} from '../../../../theme/colors';
import {appImages} from '../../../../Assets/Images';
import {MainButton} from '../../../../Components/Buttons/MainButton';
import {styles} from '../styles';
const Step01 = ({titleData, banner, onButtonNext}) => {
  return (
    <View style={{justifyContent:"center",marginTop:'13%'}}>
      {titleData && (
        <View style={{marginHorizontal:"5%"}}>
          <CustomText
            text={`Welcome Back`}
            size={vh * 4.3}
            font={fonts.clash.bold}
            color={colors.text.dimBlack}
            // style={{fontWeight:'bold'}}
          />
          {/* <CustomText
            text={`Parts Logger`}
            size={vh * 4.5}
            font={fonts.clash.bold}
            color={colors.text.red}
            style={{marginBottom:10}}
          />
          <CustomText
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
            source={appImages.appStarter}
            resizeMode="stretch"
            style={[styles.banner, {height: 300}]}
          />
          <MainButton
            title={'Continue'}
            style={styles.buttonStyle}
            onPress={onButtonNext}
          />
        </>
      )}
    </View>
  );
};

export default Step01;
