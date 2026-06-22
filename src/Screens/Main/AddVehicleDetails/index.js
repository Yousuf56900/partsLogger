import { Formik } from 'formik';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { executeApiRequest } from '../../../Api/methods/method';
import { useAddMutation } from '../../../Api/vehiclesApiSlice';
import fonts from '../../../Assets/fonts';
import ActivityLoader from '../../../Components/ActivityLoader';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import CustomDatePicker from '../../../Components/CustomDatePicker';
import CustomHeader from '../../../Components/CustomHeader';
import DropDown from '../../../Components/DropDown';
import DocumentImagePicker from '../../../Components/ImagePicker/DocumentImagePicker/DocumentImagePicker';
import InputField from '../../../Components/InputField';
import ModalComponent from '../../../Components/ModalComponent';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '../../../theme/colors';
import { font, spacing } from '../../../theme/styles';
import { vh, vw } from '../../../theme/units';
import { year } from '../../../Utils/dropdownItems';
import { LOG } from '../../../Utils/helperFunction';
import { styles } from './styles';
import vehicleValidation from './vehicleValidation';
import { useFetchVehicleTypesQuery } from '../../../Api/vehicleTypesApiSlice';
import routes from '../../../Navigation/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AddVehicleDetails = ({ route, navigation }) => {
  const vehicleDetails = route?.params;
  const [add, { isLoading }] = useAddMutation();
  const item = vehicleDetails?.vehicleDetails;
  const [isModalVisible, setModalVisible] = useState(false);
  const [AddPayment, setAddPayment] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch vehicle types
  const { data: vehicleTypes, isLoading: isLoadingTypes } = useFetchVehicleTypesQuery();

  useEffect(() => {
    const getPaymentStatus = async () => {
      try {
        const value = await AsyncStorage.getItem('AddPayment');
        setAddPayment(value === 'true');
      } catch (error) {
        console.error('Error reading payment status:', error);
      } finally {
        setIsInitialized(true);
      }
    };
    getPaymentStatus();
  }, []);

  // Show loader while checking payment status or loading types
  if (!isInitialized || isLoadingTypes) {
    return <ActivityLoader />;
  }

  // Check if item exists
  if (!item) {
    console.log('No vehicle details found in route params');
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No vehicle details found</Text>
        <MainButtonWithGradient
          title="Go Back"
          onPress={() => navigation.goBack()}
          style={{ width: vw * 50, alignSelf: 'center', marginTop: vh * 2 }}
        />
      </View>
    );
  }

  const handleSubmitForm = async values => {
    try {
      let payload = {
        ...values,
        hasTurboCharger: values?.hasTurboCharger ? true : false,
        vehicleType: item?._id,
      };

      if (!AddPayment) {
        navigation.navigate(routes.main.subscriptionplan, {
          payload: payload,
          from: 'AddVehicleDetails',
        });
        return;
      }

      const response = await executeApiRequest({
        apiCallFunction: add,
        body: payload,
        formData: true,
        toast: true,
        timeout: 30000,
      });

      if (response) {
        setModalVisible(true);
        setTimeout(() => {
          setModalVisible(false);
          navigation?.pop(2);
        }, 1000);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  console.log('item?.name', item?.name);
const isSpecialVehicle =
  item?.name === "CAR / Motorcycle" ||
  item?.name === "Semi Truck" ||
  item?.name === "Truck";
  return (
    <>
      <CustomHeader title={item?.name || ''} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 ,paddingBottom:"20%"}}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh * 10}>
          <ScrollView   showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1,paddingBottom:"15%" }}>
              <Formik
          initialValues={{
            vehicleType: item?.name?.toUpperCase() || '',
            make: '',
            model: '',
            year: '',
            VIN: '',
            plateNumber: '',
            tires: '',
            tirePressure: '',
            type: '',
            engineSize: '',
            changeOilEvery: '',
            mileageDate: '',
            mileage: '',
            nextOilChange: '',
            nextHours: '', 
            hours: '',
            description: '',
            gallery: [],
            cylinders: '',
            driveTrain: '',
            turboCharger: "",
            transmissionType: "",
            engineOilType: "",
            trailerLoadInfo: '',
            truckTireInfo: '',
            otherTruckInfo: '',
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
          }) => (
            <View style={styles.container}>
              <View style={[styles.detailContainer]}>
                <View style={{ alignItems: 'center', marginTop: vh * 4 }}>
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
                  {item?.name !== "CAR / Motorcycle" && <InputField
                    label="Hydraulic Oil"
                    placeholder="Hydraulic Oil"
                    onChangeText={handleChange('trailerLoadInfo')}
                    onBlur={handleBlur('trailerLoadInfo')}
                    value={values.trailerLoadInfo}
                    style={{ width: vw * 85, marginBottom: vh * 5 }}
                  />}
                  {item?.name === 'Semi Truck' && <InputField
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
                    textAlignVertical="top"
                    style={{
                      width: vw * 85,
                      marginBottom: vh * 5,
                      minHeight: vh * 15,
                    }}
                  />
                  {/* Image picker */}
                  <DocumentImagePicker
                    label={'Add Photo/Attachment'}
                    handleImage={images => {
                      LOG('images', images);
                      setFieldValue('gallery', images);
                    }}
                    errors={touched.gallery && errors.gallery}
                  />

                  {/* Submit button */}
                  {isLoading ? (
                    <ActivityLoader
                      style={{ marginTop: spacing.medium }}
                      color={colors.theme.secondary}
                    />
                  ) : (
                    <View style={{ marginTop: spacing.medium }}>
                      <MainButtonWithGradient
                        title={'Save Vehicle Now'}
                        onPress={handleSubmit}
                        style={{ width: vw * 80, alignSelf: 'center' }}
                      />
                    </View>
                  )}
                </View>
              </View>

              <View style={styles.hr} />

              <ModalComponent
                isVisible={isModalVisible}
                onClose={() => setModalVisible(false)}
                onPressCross={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    navigation?.pop(2);
                  }, 1000);
                }}
                title={`${item?.name} Added`}
                message={`You have successfully added your ${item?.name?.toLowerCase()}!`}
                buttonText="Got it"
                onButtonPress={() => {
                  setModalVisible(false);
                  setTimeout(() => {
                    navigation?.pop(2);
                  }, 1000);
                }}
              />
            </View>
          )}
        </Formik>
          </ScrollView>
      </KeyboardAwareScrollView>
    </>
  );
};

export default AddVehicleDetails;