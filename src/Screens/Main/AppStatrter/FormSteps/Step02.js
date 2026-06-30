import {Image, StyleSheet, Text, TouchableOpacity, View, Linking} from 'react-native';
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

  const openWebsite = () => {
    Linking.openURL('https://www.partslogger.com');
  };

  return (
    <View>
      {titleData && (
        <View style={{marginHorizontal: '5%', marginTop: '5%'}}>
          <CustomText
            text={`Advertise Here`}
            size={vh * 4.2}
            font={fonts.clash.bold}
            color={colors.text.dimBlack}
          />
        </View>
      )}

      {banner && (
        <>
          <Image
            source={appImages.coupe1930}
            resizeMode="contain"
            style={[styles.banner, {height: 200, width: '80%', alignSelf: 'center'}]}
          />

          <Text
            style={{
              textAlign: 'right',
              paddingRight: 20,
              fontWeight: 'bold',
              color: '#000',
              fontSize: 16,
            }}>
            1930 Coupe
          </Text>

          <Image
            source={appImages.fordLogo}
            resizeMode="contain"
            style={{
              height: 90,
              width: 90,
              alignSelf: 'center',
              marginTop: 8,
            }}
          />

          <TouchableOpacity onPress={openWebsite}>
            <Text
              style={{
                textAlign: 'center',
                color: '#0000A3',
                textDecorationLine: 'underline',
                fontSize: 16,
                marginTop: 8,
              }}>
              www.partslogger.com
            </Text>
          </TouchableOpacity>

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

export default Step02;