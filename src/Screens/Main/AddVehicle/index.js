//

import { useNavigation } from '@react-navigation/native';
import React from 'react';
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image// Added for loader
} from 'react-native';
import fonts from '../../../Assets/fonts';
import { appImages } from '../../../Assets/Images';
import CustomHeader from '../../../Components/CustomHeader';
import MyIcons from '../../../Components/MyIcons';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import routes from '../../../Navigation/routes';
import { colors } from '../../../theme/colors';
import { font, spacing } from '../../../theme/styles';
import { vh, vw } from '../../../theme/units';
import { useFetchVehicleTypesQuery } from '../../../Api/vehicleTypesApiSlice';
import { getImageUrl, LOG } from '../../../Utils/helperFunction';
import { imageServer } from '../../../Api/configs';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView } from '@react-native-community/blur';


const AddVehicles = () => {
  const navigation = useNavigation();
  const { data, isLoading, isFetching } = useFetchVehicleTypesQuery('', {
    refetchOnMountOrArgChange: true,
  });
  const getVehicleImage = name => {
    const key = name?.toLowerCase();

    if (key?.includes('semi')) return appImages.categorySemi;
    if (key?.includes('truck')) return appImages.categoryTruckAlt;
    if (key?.includes('motor') || key?.includes('car'))
      return appImages.categoryCar;
    if (key?.includes('heavy'))
      return appImages.categoryTractor;
    if (key?.includes('farm')) return appImages.tractor;
    if (key?.includes('atv') || key?.includes('boat'))
      return appImages.categoryUtv;

    return appImages.categoryCar;
  };


const swapLastTwo = (arr = []) => {
  if (arr.length < 2) return arr;

  const newArr = [...arr];
  const lastIndex = newArr.length - 1;

  [newArr[lastIndex], newArr[lastIndex - 1]] = [
    newArr[lastIndex - 1],
    newArr[lastIndex],
  ];

  return newArr;
};

const reorderedData = React.useMemo(() => {
  return swapLastTwo(data || []);
}, [data]);




  const handlePress = vehicle => {
    LOG('vehiclevehiclevehiclsse', vehicle);

    // navigation.navigate(routes.main.addVehicleDetails, {
    //   vehicleDetails: vehicle,
    // });
    navigation.navigate(routes.main.addVehicleDetails, {
      vehicleDetails: vehicle,
    });
  };

  // Show loader when data is loading or fetching
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.theme.secondary} />
      </View>
    );
  }


  return (
    <>
      <CustomHeader routeName={routes?.main?.addVehicles} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          {reorderedData?.map((vehicle, index) => {
            const vehicleImage = getVehicleImage(vehicle?.name);
            const imageUrl = getImageUrl(vehicle?.image);
            console.log('imageServer + vehicle?.image ', vehicle?.name)
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={vehicle._id}
                onPress={() => handlePress(vehicle)}
                style={styles.vehicleContainer}
              >
                <View style={styles.bgImage}>
                  <BlurView
                    style={StyleSheet.absoluteFill}
                    blurType="light"
                    blurAmount={12}
                    reducedTransparencyFallbackColor="#0A1E3F"
                  />

                  <LinearGradient
                    colors={[
                      'rgba(10, 30, 63, 0.85)',
                      'rgba(15, 52, 96, 0.45)',
                      'rgba(10, 30, 63, 0.85)',
                    ]}
                    style={StyleSheet.absoluteFill}
                  />
                  <CustomText
                    text={vehicle.name}
                    color={colors.theme.white}
                    font={fonts.clash.semibold}
                    size={font.xxxlarge}
                    style={{ position: 'absolute', top: 16, left: 16 }}
                  />
                  {vehicle.name !== "Other" && <FastImage
                    source={vehicleImage}
                    style={{
                      height: vehicle.name ===  "Truck" ? vh * 22:  vh * 26,
                      width: vehicle.name ===  "Truck" ? vh * 22:  vh * 26,
                      marginTop: 20
                    }}
                    resizeMode={FastImage.resizeMode.contain}
                    onError={(error) => {
                      console.log('Image load error:', error.nativeEvent.error);
                    }}
                  />}


                </View>
              </TouchableOpacity>

            );
          })}

        </View>
      </ScrollView>
    </>
  );
};

export default AddVehicles;

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: spacing.large,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.large,
    gap: spacing.large,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: vw * 2,
  },
  vehicleContainer: {
    height: vh * 26,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors?.theme?.border,
    overflow: 'hidden',

  },
  loaderContainer: {
    // Added loader container style
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: "center",
    alignItems: "center"
    // justifyContent: 'flex-end',
    // flexDirection: 'row',
  },
  bgImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

});
