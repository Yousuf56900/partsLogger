
import { Formik } from 'formik';
import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { executeApiRequest } from '../../../Api/methods/method';
import CustomHeader from '../../../Components/CustomHeader';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import InputField from '../../../Components/InputField';
import DropDown from '../../../Components/DropDown';
import CustomDatePicker from '../../../Components/CustomDatePicker';
import DocumentImagePicker from '../../../Components/ImagePicker/DocumentImagePicker/DocumentImagePicker';
import ActivityLoader from '../../../Components/ActivityLoader';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import ModalComponent from '../../../Components/ModalComponent';
import { useDeleteVehicleImageMutation, useEditMutation } from '../../../Api/vehiclesApiSlice';
import { imageServer } from '../../../Api/configs';
import vehicleValidation from '../AddVehicleDetails/vehicleValidation';
import styles from './styles'
import { font, spacing } from '../../../theme/styles';
import { colors } from '../../../theme/colors';
import { vh, vw } from '../../../theme/units';
import fonts from '../../../Assets/fonts';
import { year } from '../../../Utils/dummyData';
import { cylinderOptions, drivetrainTypes, fuelTypes, transmissionTypes } from '../../../Utils/dropdownItems';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { extractFilenameFromUrl } from '../../../Utils/helperFunction';

const EditVehicleDetails = ({ route, navigation }) => {
  const vehicleDetails = route?.params?.vehicle;

  const [edit, { isLoading: isEditLoading, isError, error }] = useEditMutation();
  const [deleteVehicleImage] = useDeleteVehicleImageMutation();


  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);

  const Warranty = [
    { key: '0', value: 'YES', id: 0 },
    { key: '1', value: 'NO', id: 1 },
    // { key: '2', value: 'N/A', id: 2 },
  ];

  const handleSubmitForm = async values => {
    setIsLoading(true);
    let payload = {
      ...values,
      vehicleType: vehicleDetails?.vehicleType?._id,
      hasTurboCharger: values?.hasTurboCharger ? true : false,
      gallery: newImages,
      deletedImages: deletedImages,
    };
    try {
      const response = await executeApiRequest({
        apiCallFunction: edit,
        body: payload,
        params: { id: vehicleDetails?._id },
        formData: true,
        toast: true,
        timeout: 30000,
      });
      setModalVisible(true);
    } catch (error) {
      console.log('Vehicle Update Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const normalizeGallery = gallery => {
    if (!gallery || !Array.isArray(gallery)) {
      return [];
    }
    return gallery.map((item, index) => {
      if (typeof item === 'string') {
        let uri = item;
        if (!item.startsWith('http') && !item.startsWith('file://')) {
          const baseUrl = imageServer.endsWith('/')
            ? imageServer.slice(0, -1)
            : imageServer;

          const path = item.startsWith('/')
            ? item
            : `/${item}`;

          uri = `${baseUrl}${path}`;
        }
        return {
          uri,
          type: 'image/jpeg',
          name: `image${index}.jpg`,
        };
      }

      return item;
    });
  };


  const handleImageChange = async (images, removedImage, setFieldValue, vehicleDetails) => {
    const updatedImages = Array.isArray(images) ? images : [];
    setFieldValue('gallery', updatedImages);

    if (removedImage && vehicleDetails?._id) {
      try {
        let imageName = removedImage?.uri;
        if (imageName) {
          imageName = imageName.split('/').pop(); // Sirf filename
        }

        console.log('Deleting image:', {
          vehicleId: vehicleDetails._id,
          image: imageName
        });

        // API call
        const result = await deleteVehicleImage({
          vehicleId: vehicleDetails._id,
          image: imageName
        }).unwrap();

      } catch (error) {
        console.log('Delete error:', error);

        // Error ke baad bhi UI update karo
        if (removedImage?.uri && !removedImage.uri.startsWith('file://')) {
          setDeletedImages(prev => [...prev, removedImage.uri]);
        }
      }
    }

    const newImagesList = updatedImages.filter(img =>
      img.uri?.startsWith('file://')
    );

    setNewImages(newImagesList);
  };
const isSpecialVehicle =
  vehicleDetails?.vehicleType?.name === "CAR / Motorcycle" ||
  vehicleDetails?.vehicleType?.name === "Semi Truck" ||
  vehicleDetails?.vehicleType?.name === "Truck";
  return (
    <>
      <CustomHeader title={`EDIT`} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh * 10}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1,paddingBottom:"24%" }}>
          <Formik
            initialValues={{
              vehicleType: vehicleDetails?.vehicleType?.name || '',
              make: vehicleDetails?.vehicleDetails?.make || '',
              model: vehicleDetails?.vehicleDetails?.model || '',
              year: vehicleDetails?.vehicleDetails?.year?.toString() || '',
              VIN: vehicleDetails?.vehicleDetails?.VIN || '',
              purchaseDate: vehicleDetails?.vehicleDetails?.purchaseDate
                ? new Date(vehicleDetails.vehicleDetails.purchaseDate).toISOString()
                : new Date().toISOString(),
              description: vehicleDetails?.vehicleDetails?.description || '',
              warranty: vehicleDetails?.vehicleDetails?.warranty || 'NO',
              engineSize: vehicleDetails?.additionalDetails?.engineSize?.toString() || '',
              fuel: vehicleDetails?.additionalDetails?.fuel || '',
              driveTrain: vehicleDetails?.additionalDetails?.driveTrain || '',
              transmissionType: vehicleDetails?.additionalDetails?.transmissionType || '',
              transmissionSpeed: vehicleDetails?.additionalDetails?.transmissionSpeed?.toString() || '',
              carMilage: vehicleDetails?.additionalDetails?.carMilage?.toString() || '',
              notes: vehicleDetails?.additionalDetails?.notes || '',
              gallery: normalizeGallery(vehicleDetails?.gallery) || [],
              cylinders: vehicleDetails?.additionalDetails?.cylinders?.toString() || '',
              engineCoolantType: vehicleDetails?.additionalDetails?.engineCoolantType || '',
              transmissionFluidType: vehicleDetails?.additionalDetails?.transmissionFluidType || '',
              hasTurboCharger: vehicleDetails?.additionalDetails?.hasTurboCharger?.toString() || '',
              tires: vehicleDetails?.additionalDetails?.tires || '',
              tirePressure: vehicleDetails?.additionalDetails?.tirePressure?.toString() || '',
              turboCharger: vehicleDetails?.additionalDetails?.turboCharger,
              transmissionType: vehicleDetails?.additionalDetails?.transmissionType?.toString() || "",
              nextOilChange: vehicleDetails?.additionalDetails?.nextOilChangeDate || '',
               engineOilType: vehicleDetails?.additionalDetails?.engineOilType || '',
              changeOilEvery: vehicleDetails?.additionalDetails?.changeOilEvery || '',
              mileageDate: vehicleDetails?.additionalDetails?.lastOilChangeDate || "",
              mileage: vehicleDetails?.additionalDetails?.milesAtLastOilChange || "",
              trailerLoadInfo:
                vehicleDetails?.additionalDetails?.trailerLoadInfo || '',
              truckTireInfo:
                vehicleDetails?.additionalDetails?.truckTireInfo || '',
              otherTruckInfo:
                vehicleDetails?.additionalDetails?.otherTruckInfo || '',
              plateNumber: vehicleDetails?.vehicleDetails?.plateNumber || ""
            }}
            validationSchema={vehicleValidation}
            onSubmit={handleSubmitForm}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              setFieldValue,
            }) => {
              return (
                <View style={styles.container}>
                  <View
                    style={[
                      styles.detailContainer,
                      { paddingHorizontal: spacing.large },
                    ]}>
                    <CustomText
                      text={`${vehicleDetails?.vehicleType?.name} Details`}
                      color={colors.text.dimBlack}
                      font={fonts.clash.regular}
                      size={font.xxlarge}
                    />
                  </View>

                  {/* <View style={styles.hr} /> */}

                  <View
                    style={[
                      styles.detailContainer,
                      { paddingHorizontal: spacing.large },
                    ]}>
                    <View style={{ alignItems: 'center', }}>

                      <InputField
                        required
                        label="Make"
                        placeholder="Enter Make"
                        onChangeText={handleChange('make')}
                        onBlur={handleBlur('make')}
                        value={values.make}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                        errors={touched.make && errors.make}
                      />
                      <InputField
                        label="Model"
                        placeholder="Enter Model"
                        onChangeText={handleChange('model')}
                        onBlur={handleBlur('model')}
                        value={values.model}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Year"
                        placeholder="Year"
                        onChangeText={handleChange('year')}
                        onBlur={handleBlur('year')}
                        value={values.year}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                        keyboardType="decimal-pad"
                      />
                      <InputField
                        label="Engine"
                        placeholder="Enter Engine"
                        onChangeText={handleChange('engineSize')}
                        onBlur={handleBlur('engineSize')}
                        value={values.engineSize}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Cylinders"
                        placeholder="Enter Cylinder Type"
                        onChangeText={handleChange('cylinders')}
                        onBlur={handleBlur('cylinders')}
                        value={values.cylinders}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Transmission"
                        placeholder="Type & Description"
                        onChangeText={handleChange('transmissionType')}
                        onBlur={handleBlur('transmissionType')}
                        value={values.transmissionType}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                        placeholderTextColor={colors?.text?.grey}
                      />
                      <InputField
                        label="Drive Train"
                        placeholder="FWD / RWD / 4WD / AWD"
                        onChangeText={handleChange('driveTrain')}
                        onBlur={handleBlur('driveTrain')}
                        value={values.driveTrain}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Turbo/Super charger"
                        placeholder="Type & Description"
                        onChangeText={handleChange('turboCharger')}
                        onBlur={handleBlur('turboCharger')}
                        value={values.turboCharger}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                        placeholderTextColor={colors?.text?.grey}
                      />
                      <InputField
                        label="Plate Number"
                        placeholder="Enter Plate Number"
                        onChangeText={handleChange('plateNumber')}
                        onBlur={handleBlur('plateNumber')}
                        value={values.plateNumber}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Tires Size"
                        placeholder="Enter Tire Brand/Size"
                        onChangeText={handleChange('tires')}
                        onBlur={handleBlur('tires')}
                        value={values.tires}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Tire Pressure"
                        placeholder="Enter Tire Pressure"
                        onChangeText={handleChange('tirePressure')}
                        onBlur={handleBlur('tirePressure')}
                        value={values.tirePressure}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                        label="Oil"
                        placeholder="Oil"
                        onChangeText={handleChange('engineOilType')}
                        onBlur={handleBlur('engineOilType')}
                        value={values.engineOilType}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                        placeholderTextColor={colors?.text?.grey}
                      />
                      <InputField
                       label={isSpecialVehicle ? "Oil changed Every Miles" : "Oil Change Every Hours / Miles"}
                        placeholder="Miles"
                        onChangeText={handleChange('changeOilEvery')}
                        onBlur={handleBlur('changeOilEvery')}
                        value={values.changeOilEvery}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <CustomDatePicker
                        label="Oil Change Date"
                        dateStyle={{ width: vw * 80, marginBottom: vh * 5 }}
                        date={
                          values.mileageDate ? new Date(values.mileageDate) : null
                        }
                        onDateChange={date =>
                          setFieldValue('mileageDate', date.toISOString())
                        }
                      />
                      <InputField
                        label={isSpecialVehicle ? "Current Miles" : "Current Hours / Miles"}
                        placeholder="Enter Miles"
                        onChangeText={handleChange('mileage')}
                        onBlur={handleBlur('mileage')}
                        value={values.mileage}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <InputField
                      label={isSpecialVehicle ? "Next Oil Change Miles" : "Next Oil Change Hours / Miles"}
                        placeholder="Enter Miles"
                        onChangeText={handleChange('nextOilChange')}
                        onBlur={handleBlur('nextOilChange')}
                        value={values.nextOilChange}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      {vehicleDetails?.vehicleType?.name !== "CAR / Motorcycle" && <InputField
                        label="Hydraulic Oil"
                        placeholder="Hydraulic Oil"
                        onChangeText={handleChange('trailerLoadInfo')}
                        onBlur={handleBlur('trailerLoadInfo')}
                        value={values.trailerLoadInfo}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />}
                      {vehicleDetails?.vehicleType?.name === 'Semi Truck' && <InputField
                        label="Trailor information"
                        placeholder="Trailor information"
                        multiline={true}
                        onChangeText={handleChange('truckTireInfo')}
                        onBlur={handleBlur('truckTireInfo')}
                        value={values.truckTireInfo}
                        textAlignVertical="top"
                        style={{
                          width: vw * 85,
                          marginBottom: vh * 5,
                          minHeight: vh * 15,
                        }}
                      />}

                      <InputField
                        label="Comments"
                        placeholder="Enter Comments"
                        multiline={true}
                        onChangeText={handleChange('description')}
                        onBlur={handleBlur('description')}
                        value={values.description}
                        style={{ width: vw * 85, marginBottom: vh * 5 }}
                      />
                      <DocumentImagePicker
                        handleImage={(images, removedImage) =>
                          handleImageChange(images, removedImage, setFieldValue, vehicleDetails)
                        }
                        initialImages={values.gallery}
                        errors={touched.gallery && errors.gallery}
                        label="Vehicle Images"
                      />
                      {isLoading ? (
                        <ActivityLoader
                          style={{ marginTop: spacing.medium }}
                          color={colors.theme.secondary} />
                      ) : (
                        <View style={{ marginTop: spacing.medium, marginBottom: 20 }}>
                          <MainButtonWithGradient
                            title={'Update Vehicle'}
                            onPress={handleSubmit}
                            style={{ width: vw * 80, alignSelf: 'center' }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              );
            }}
          </Formik>

          <ModalComponent
            isVisible={isModalVisible}
            onClose={() => setModalVisible(false)}
            onPressCross={() => {
              setModalVisible(false);
              setTimeout(() => {
                navigation?.pop(2);
              }, 1000);
            }}
            title={`${vehicleDetails?.vehicleType?.name} Updated`}
            message={`You have successfully updated your ${vehicleDetails?.vehicleType?.name?.toLowerCase()}!`}
            buttonText="Got it"
            onButtonPress={() => {
              setModalVisible(false);
              setTimeout(() => {
                navigation?.pop(2);
              }, 1000);
            }}
          />
        </ScrollView>
      </KeyboardAwareScrollView>
    </>
  );
};

export default EditVehicleDetails;