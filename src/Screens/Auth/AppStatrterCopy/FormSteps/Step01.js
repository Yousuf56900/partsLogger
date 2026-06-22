import {Image, StyleSheet, Text, View} from 'react-native';
import React from 'react';

import {styles} from '../styles';
import CustomText from '../../../../Components/wrappers/Text/CustomText';
import fonts from '../../../../Assets/fonts';
import { colors } from '../../../../theme/colors';
import { vh } from '../../../../theme/units';
import { font } from '../../../../theme/styles';
import { appImages } from '../../../../Assets/Images';
import { MainButton } from '../../../../Components/Buttons/MainButton';
const Step01 = ({titleData, banner, onButtonNext}) => {
  return (
    <View>
      {titleData && (
        <View style={{marginHorizontal: '5%',marginTop:12}}>
          <CustomText
            text={`Welcome to`}
            size={vh * 4.5}
            font={fonts.clash.bold}
            color={colors.text.dimBlack}
            // style={{fontWeight:'bold'}}
          />
          <CustomText
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
          />
        </View>
      )}
      {banner && (
        <>
          <Image
            source={appImages.appstarter}
            resizeMode="stretch"
            style={[styles.banner, {height: 400}]}
          />
          <MainButton
            title={'Next'}
            style={styles.buttonStyle}
            onPress={onButtonNext}
          />
        </>
      )}
    </View>
  );
};

export default Step01;
