import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from 'react-native';
// import Carousel, { Pagination } from 'react-native-snap-carousel';
import {
  useDeleteMutation,
  useFetchVehicleByIdQuery,
} from '../../../Api/vehiclesApiSlice';
import fonts from '../../../Assets/fonts';
import CustomHeader from '../../../Components/CustomHeader';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import routes from '../../../Navigation/routes';
import {
  extractFileName,
  formatDate,
  getImageUrl,
  LOG,
} from '../../../Utils/helperFunction';
import { colors } from '../../../theme/colors';
import { font, spacing } from '../../../theme/styles';
import { vh, vw } from '../../../theme/units';
import ImageCropPicker from 'react-native-image-crop-picker';
import {
  Image as ImageCompressor,
  Video as VideoCompressor,
} from 'react-native-compressor';
import { MainButton } from '../../../Components/Buttons/MainButton';
import ActivityLoader from '../../../Components/ActivityLoader';
import Entypo from 'react-native-vector-icons/Entypo';
import moment from 'moment';
const { width, height } = Dimensions.get('window');
const carouselHeight = height * 0.35;

const VehicleDetails = ({ route, navigation }) => {
  const scrollRef = useRef(null);
  const { vehicleId } = route.params || {};
  const {
    data: vehicle,
    isLoading,
    error,
    refetch,
  } = useFetchVehicleByIdQuery(vehicleId, { refetchOnFocus: true, refetchOnMountOrArgChange: true, refetchOnReconnect: true });
  LOG('vehicle::', vehicle?.gallery);

  const [
    deleteVehicle,
    { isLoading: deleteLoading, isError: deleteIsError, error: deleteError },
  ] = useDeleteMutation();
  //New work
  const [activeSlide, setActiveSlide] = useState(0);
  const [profileImages, setProfileImages] = useState([]);
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );
  const renderItem = ({ item, index }) => {
    LOG('___item___::', item);
    let imgSrc = getImageUrl(item);
    console.log('imgSrc', imgSrc);

    return (
      <View style={styles.card}>
        <Image
          source={imgSrc}
          style={styles.image}
          resizeMode={Image.resizeMode.cover}
        />
      </View>
    );
  };
  const handleDelete = async () => {
    // try {
    //   await deleteVehicle(vehicleId).unwrap();
    //   LOG('Vehicle deleted successfully');
    //   // Optionally navigate back or refresh the vehicle list
    //   navigation.goBack();
    // } catch (err) {
    //   LOG('Delete error:', err);
    //   // Show error toast or alert
    // }

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this vehicle?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteVehicle(vehicleId).unwrap();
              LOG('Vehicle deleted successfully');
              // Optionally navigate back or refresh the vehicle list
              navigation.goBack();
            } catch (err) {
              LOG('Delete error:', err);
              // Show error toast or alert
              Alert.alert('Error', 'Failed to delete vehicle. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };
  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.theme?.secondary} />
      </View>
    );
  }

  const onImageChange = (imagePaths, mime, type) => {
    console.log('Selected Images:', imagePaths);
    console.log('Selected mime:', mime);
    console.log('Selected type:', type);

    // if (profileImages.length + imagePaths.length > MAX_IMAGES) {
    //   Alert.alert(
    //     'Limit Reached',
    //     `You can only upload up to ${MAX_IMAGES} images.`,
    //   );
    //   return;
    // }

    // const newImages = imagePaths.map(path => {
    //   let img = extractFileName(path);
    //   return {
    //     uri: path,
    //     type: mime,
    //     name: img,
    //   };
    // });
    // const updatedImages = [...profileImages, ...newImages];

    // setProfileImages(updatedImages);
    // console.log('updatedImages', updatedImages);
    // if (handleImage) handleImage(updatedImages);
    let img = extractFileName(imagePaths[0]);
    let updatedImages = {
      uri: imagePaths[0],
      type: mime,
      name: img,
    };

    console.log('updatedImages', updatedImages);

    if (updatedImages) {
      navigation.navigate(routes.main.createdraft, {
        image: updatedImages,
        vehicleId: vehicleId,
      });
    }
  };
  const handleCamera = () => {
    ImageCropPicker.openCamera({
      mediaType: 'photo',
    }).then(async image => {
      // actionSheetRef.current.hide();
      const result = await ImageCompressor.compress(image.path, {
        maxHeight: 400,
        maxWidth: 400,
        quality: 1,
      });
      onImageChange([result], image.mime, 'photo');
    });
  };

  const labelProps = {
    color: colors.text.placeholder,
    font: fonts.benzin.light,
    size: font.medium,
  };

  const valueProps = {
    color: colors.text.dimBlack,
    font: fonts.benzin.regular,
    size: font.medium,
  };
  const handleMoreInfo = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };
console.log('vehicle?.vehicleDetails',vehicle)
  return (
    <View style={styles.container}>
      <View>
        <View
          style={{
            position: 'absolute',
            right: 0,
            zIndex: 999,
            top: 10,
            left: 0,
          }}>
          <CustomHeader
            color={colors?.theme?.white}
            routeName={routes?.main?.vehicleDetails}
            disabled={true}
            OnEditPress={() =>
              navigation.navigate(routes.main.editvechile, { vehicle })
            }
          />
        </View>

        {/* <View style={styles.card}>
        <Image
          source={vehicle?.gallery[0]}
          style={styles.image}
          // resizeMode={Image.resizeMode.cover}
        />
      </View> */}
        {/* <Carousel
          data={
            vehicle?.gallery.length > 0
              ? vehicle?.gallery
              : ['https://dummyimage.com/600x400/cccccc/000000.jpg']
          }
          renderItem={renderItem}
          sliderWidth={width}
          itemWidth={width * 1}
          sliderHeight={carouselHeight}
          itemHeight={carouselHeight}
          autoPlay={false}
          onSnapToItem={index => setActiveSlide(index)}
        /> */}
      </View>
      <ScrollView
        ref={scrollRef}
        style={{
          borderTopRightRadius: 25,
          borderTopLeftRadius: 25,
          position: 'relative',
          // top: 20,
          paddingBottom: "30%",
          marginTop: '23%',
          flexGrow: 1
        }}>
        <View
          style={{
            borderTopRightRadius: 25,
            borderTopLeftRadius: 25,
            backgroundColor: 'white',
            paddingVertical: spacing.medium,
            paddingHorizontal: spacing.medium,
          }}>
          {(vehicle?.vehicleDetails?.make ||
            vehicle?.vehicleDetails?.model) && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <CustomText
                  text={`${vehicle?.vehicleDetails?.make || ''} ${vehicle?.vehicleDetails?.model || ''}`}
                  color={colors.text.dimBlack}
                  font={fonts.clash.regular}
                  size={font.xxxlarge}
                />

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity onPress={handleCamera}>
                    <Entypo name={'camera'} color={colors.theme.black} size={23} />
                  </TouchableOpacity>
                </View>
              </View>

            )}


          <View style={{
            flexDirection: "row", justifyContent: 'space-between',
            marginTop: 12,
            width: '100%',
          }}>
            <View style={{ width: '47%' }}>
              <MainButton
                title={'Add Parts'}
                hideIcon={true}
                onPress={() =>
                  navigation.navigate(routes.main.AddPart, {
                    vehicleIdPrefilled: vehicle?._id,
                  })
                }
                style={{ height: 44, marginVertical: 10 }}
              />
              <MainButton
                title={'Part Details'}
                onPress={() => navigation.navigate(routes.main.vehicleMaintenanceDetails, { id: vehicle?._id })}
                style={{ height: 44 }}
                hideIcon={true}
              />
            </View>
            <View style={{ width: '47%' }}>
              <MainButton
                title={'Add maintenance'}
                hideIcon={true}
                onPress={() =>
                  navigation.navigate(routes.main.AddPart, {
                    vehicleIdPrefilled: vehicle?._id,
                  })
                }
                style={{ height: 44, marginVertical: 10 }}
              />
              <MainButton
                title={'Maintenance Details'}
                onPress={() => navigation.navigate(routes.main.vehicleMaintenanceDetails, { id: vehicle?._id })}
                style={{ height: 44 }}
                hideIcon={true}
              />
            </View>
          </View>
          <TouchableOpacity style={{ backgroundColor: colors.theme.primary, borderRadius: 10,width:94,justifyContent:'center',alignItems:"center",height:40,marginTop:15 }} onPress={handleMoreInfo}>
            <Text style={{ color: colors.theme.white, fontSize: 14 }}>
              More Info
            </Text>
          </TouchableOpacity>
          <View style={styles.separator} />

          <View>
            <View style={styles.row}>
              <View style={styles.column}>
                <CustomText
                  text="Make"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.vehicleDetails?.make}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>
              <View style={styles.column}>
                <CustomText
                  text="Model"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.vehicleDetails?.model}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>


            </View>
            <View style={styles.row}>

              <View style={styles.column}>
                <CustomText
                  text="Year"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.vehicleDetails?.year}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>
              {vehicle?.vehicleType?.name === 'CAR / Motorcycle' && <View style={styles.column}>
                <CustomText
                  text="Plate Number"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.vehicleDetails?.plateNumber}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>}

            </View>
            <View style={styles.row}>
              <View style={styles.column}>
                <CustomText
                  text="Vin"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.vehicleDetails?.VIN}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>
              <View style={styles.column}>
                <CustomText
                  text="Turbo/super charger"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={vehicle?.additionalDetails?.turboCharger}
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>

            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <CustomText
                  text="Transmission"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={
                    vehicle?.additionalDetails?.transmissionType
                      ? vehicle?.additionalDetails?.transmissionType
                      : 'N/A'
                  }
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>

            </View>
            <View style={styles.row}>
              <View style={styles.column}>
                <CustomText
                  text="Engine Oil"
                  color={colors.text.placeholder}
                  font={fonts.benzin.light}
                  size={font.medium}
                />
                <CustomText
                  text={
                    vehicle?.additionalDetails?.engineOilType
                      ? vehicle?.additionalDetails?.engineOilType
                      : 'N/A'
                  }
                  color={colors.text.dimBlack}
                  font={fonts.benzin.regular}
                  size={font.medium}
                />
              </View>
              <View style={styles.column}>
                <CustomText text="Engine" {...labelProps} />
                <CustomText text={vehicle?.additionalDetails?.engineSize || 'N/A'} {...valueProps} />
              </View>


            </View>

          </View>



          {vehicle?.vehicleType?.name === 'CAR / Motorcycle' && (
            <>
              <View style={styles.row}>
                <View style={styles.column}>
                  <CustomText text="Cylinders" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.cylinders || 'N/A'} {...valueProps} />
                </View>
                <View style={styles.column}>
                  <CustomText text="Drivetrain" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.driveTrain || 'N/A'} {...valueProps} />
                </View>
              </View>

              <View style={styles.row}>


                <View style={styles.column}>
                  <CustomText text="Tires" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.tires || 'N/A'} {...valueProps} />
                </View>
                <View style={styles.column}>
                  <CustomText text="Tire Pressure" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.tirePressure || 'N/A'} {...valueProps} />
                </View>
              </View>
            </>
          )}

          {vehicle?.vehicleType?.name === 'Semi Truck / Truck' && (
            <>
              <View style={styles.row}>

                <View style={styles.column}>
                  <CustomText text="Next due oil change" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.nextOilChangeDate || 'N/A'} {...valueProps} />
                </View>
                <View style={styles.column}>
                  <CustomText text="Oil must be change every" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.changeOilEvery || 'N/A'} {...valueProps} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <CustomText text="Miles at last oil change" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.milesAtLastOilChange || 'N/A'} {...valueProps} />
                </View>

                <View style={styles.column}>
                  <CustomText text="Last oil change date" {...labelProps} />
                  <CustomText text={moment(vehicle?.additionalDetails?.lastOilChangeDate).format("MM-DD-YYYY") || 'N/A'} {...valueProps} />
                </View>
              </View>


            </>
          )}
          {['Heavy Equipment', 'Farm and Ranch', 'ATV /UTV / Boat'].includes(vehicle?.vehicleType?.name) && (
            <>
              <View style={styles.row}>
                <View style={styles.column}>
                  <CustomText text="Type" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.type || 'N/A'} {...valueProps} />
                </View>

                <View style={styles.column}>
                  <CustomText text="Engine" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.engineSize || 'N/A'} {...valueProps} />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.column}>
                  <CustomText text="Hours" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.hours || 'N/A'} {...valueProps} />
                </View>

                <View style={styles.column}>
                  <CustomText text="Next Oil Change (Hours)" {...labelProps} />
                  <CustomText text={vehicle?.additionalDetails?.nextHours || 'N/A'} {...valueProps} />
                </View>
              </View>
            </>
          )}
            <View style={styles.column}>
            <CustomText
              text="Trailer Load Info"
              color={colors.text.placeholder}
              font={fonts.benzin.light}
              size={font.medium}
            />
            <CustomText
              text={vehicle?.additionalDetails?.trailerLoadInfo}
              color={colors.text.dimBlack}
              font={fonts.benzin.regular}
              size={font.medium}
            />
          </View>
           <View style={styles.column}>
            <CustomText
              text="Truck Tire Info"
              color={colors.text.placeholder}
              font={fonts.benzin.light}
              size={font.medium}
            />
            <CustomText
              text={vehicle?.additionalDetails?.truckTireInfo}
              color={colors.text.dimBlack}
              font={fonts.benzin.regular}
              size={font.medium}
            />
          </View>
             <View style={styles.column}>
            <CustomText
              text="Other Truck Info"
              color={colors.text.placeholder}
              font={fonts.benzin.light}
              size={font.medium}
            />
            <CustomText
              text={vehicle?.additionalDetails?.otherTruckInfo}
              color={colors.text.dimBlack}
              font={fonts.benzin.regular}
              size={font.medium}
            />
          </View>
          <View style={styles.column}>
            <CustomText
              text="Comments"
              color={colors.text.placeholder}
              font={fonts.benzin.light}
              size={font.medium}
            />
            <CustomText
              text={vehicle?.vehicleDetails?.description}
              color={colors.text.dimBlack}
              font={fonts.benzin.regular}
              size={font.medium}
            />
          </View>

        </View>
        {deleteLoading ? (
          <ActivityLoader
            style={{ marginTop: spacing.large }}
            color={colors.theme.secondary}
          />
        ) : (
          <View style={{ marginBottom: 50, width: '90%', alignSelf: "center" }}>
            <MainButton
              title={'Delete Vehicle'}
              onPress={handleDelete}
              hideIcon={true}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default VehicleDetails;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    width: width,
    height: carouselHeight,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  paginationContainer: {
    paddingVertical: 8,
    position: 'absolute',
    bottom: 30,
    width: '100%',
  },
  dotStyle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 8,
    backgroundColor: colors.theme?.secondary,
  },
  inactiveDotStyle: {
    backgroundColor: colors.theme.white,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.medium,
    paddingVertical: spacing.small,
  },
  column: {
    flex: 2,
  },
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: colors.theme?.lightGray,
    marginVertical: spacing.small,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    height: vw * 10,
    borderRadius: vh * 10,
    width: vw * 10,
    backgroundColor: colors?.theme?.white,
    marginLeft: 15,
    borderWidth: 1,
    borderColor: '#E8E6EA',
  },
});
