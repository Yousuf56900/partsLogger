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



const AddVehicles = () => {
  const navigation = useNavigation();
  const { data, isLoading, isFetching } = useFetchVehicleTypesQuery('', {
    refetchOnMountOrArgChange: true,
  });
  const getVehicleImage = name => {
    const key = name?.toLowerCase();

    if (key?.includes('semi')) return appImages.semiTrack;
    if (key?.includes('truck')) return appImages.categoryTruckAlt;
    if (key?.includes('motor') || key?.includes('car'))
      return appImages.categoryCar;
    if (key?.includes('heavy'))
      return appImages.categoryTractor;
    if (key?.includes('farm')) return appImages.tractor;
    if (key?.includes('atv') || key?.includes('boat'))
      return appImages.categorySemi;

    return appImages.smallE;
  };


  const reorderVehicleData = (arr = []) => {
    const orderPriority = [
      "CAR / Motorcycle",
      "Semi Truck",
      "Truck",
      "Heavy Equipment",
      "Farm and Ranch",
      "ATV /UTV / Boat",
      "Small Equipment"
    ];

    return [...arr].sort((a, b) => {
      return (
        orderPriority.indexOf(a.name) -
        orderPriority.indexOf(b.name)
      );
    });
  };

  const reorderedData = React.useMemo(() => {
    const filterData = data?.filter((item) => item?.name !== "Other")
    return reorderVehicleData(filterData || []);
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
            console.log('vehicle?.name', vehicle?.name)
            const vehicleImage = getVehicleImage(vehicle?.name);
            const imageUrl = getImageUrl(vehicle?.image);
            return (
              <TouchableOpacity
                activeOpacity={0.7}
                key={vehicle._id}
                onPress={() => handlePress(vehicle)}
                style={styles.vehicleContainer}
              >
                {/* {vehicle?.name === "Semi Truck" &&} */}
                <View style={styles.bgImage}>

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
                 style={{ position: 'absolute', top: 10, left: 16 }}
                  />
                 <FastImage
                    source={vehicleImage}
                    style={{
                      height: '100%',
                      width: vehicle?.name ===  "Heavy Equipment" || vehicle?.name ===  "ATV /UTV / Boat" ? vh * 31 : vehicle?.name ===  "Farm and Ranch"  ? vh * 22 : vh * 27,
                      marginTop: 20,
                    }}
                    resizeMode={
                      vehicle?.name === "Semi Truck"
                        ? FastImage.resizeMode.contain
                        : FastImage.resizeMode.contain
                    }
                  />


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
