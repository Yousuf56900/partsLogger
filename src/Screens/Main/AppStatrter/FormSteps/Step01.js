import { Image, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import CustomText from '../../../../Components/wrappers/Text/CustomText';
import fonts from '../../../../Assets/fonts';
import { vh, vw } from '../../../../theme/units';
import { colors } from '../../../../theme/colors';
import { appImages } from '../../../../Assets/Images';
import { MainButton } from '../../../../Components/Buttons/MainButton';
import { styles } from '../styles';

const Step01 = ({ titleData, banner, onButtonNext }) => {

  const carPartsImages = [
    appImages.vehicle3,          // SUV
    appImages.appstarter2,       // Engine
    appImages.autopartrecord,    // Shelves with parts
    appImages.appStarter1,       // Starter
    appImages.maintenancerecord, // Mechanic
    appImages.appStarter,        // Filters
  ];

  return (
    <View style={{ justifyContent: "center", marginTop: '4%' }}>
      
      {titleData && (
        <View style={{ marginHorizontal: "5%" }}>
          <CustomText
            text={`Everything About Your Car! Description, Pics, Parts, Maintenance, Warranty & Notes`}
            size={vh * 2.2}
            color={colors.text.dimBlack}
            style={{ fontWeight: 'bold' }}
          />

          {/* <CustomText
            text={`Take Pics of your receipts`}
            size={vh * 2.7}
            style={{ marginBottom: 10, fontWeight: '600' }}
          /> */}
        </View>
      )}

      {banner && (
        <>
          
          {/* 6 Images Grid */}
          <View style={localStyles.imageContainer}>
            {carPartsImages.map((img, index) => (
              <Image
                key={index}
                source={img}
                resizeMode="contain"
                style={localStyles.partImage}
              />
            ))}
          </View>

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

const localStyles = StyleSheet.create({
  imageContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: "5%",
    marginTop: 20,
  },
  partImage: {
    width: "30%",
    height: 80,
    marginBottom: 15,
  },
});