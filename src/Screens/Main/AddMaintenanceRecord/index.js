import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import * as Yup from 'yup';
import { executeApiRequest, executeApiRequestForQueryParams } from '../../../Api/methods/method';
import { useFetchVehicleByUserQuery } from '../../../Api/vehiclesApiSlice';
import CustomHeader from '../../../Components/CustomHeader';
import InputField from '../../../Components/InputField';
import ModalComponent from '../../../Components/ModalComponent';
import { MainButton } from '../../../Components/Buttons/MainButton';
import DropDown from '../../../Components/DropDown/dropdown2';
import routes from '../../../Navigation/routes';
import { colors } from '../../../theme/colors';
import { styles } from './styles';
import { LOG } from '../../../Utils/helperFunction';
import { vh, vw } from '../../../theme/units';
import { useAddMutation } from '../../../Api/mainteinanceAutopartsApiSlice';
import DocumentImagePicker from '../../../Components/ImagePicker/DocumentImagePicker/DocumentImagePicker';
import CustomDatePicker from '../../../Components/CustomDatePicker';
import ActivityLoader from '../../../Components/ActivityLoader';
import { baseUrl, endpoints, imageServer } from '../../../Api/configs';
import { SelectList } from 'react-native-dropdown-select-list';

const WarrantyOptions = [
  { key: '0', value: 'YES', id: 'YES' },
  { key: '1', value: 'NO', id: 'NO' },
];
const uploadPartWithXHR = ({ urlPath, method, formData, token }) => {
  return new Promise((resolve, reject) => {
    const fullUrl = urlPath.startsWith('http') ? urlPath : `${baseUrl.replace(/\/$/, '')}/${urlPath.replace(/^\//, '')}`;
    const xhr = new XMLHttpRequest();

    xhr.open(method, fullUrl);
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    xhr.setRequestHeader('Accept', 'application/json');

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = xhr.responseText ? JSON.parse(xhr.responseText) : {};
          resolve(data);
        } catch (e) {
          resolve({});
        }
      } else {
        let errData;
        try {
          errData = xhr.responseText ? JSON.parse(xhr.responseText) : {};
        } catch (_) {
          errData = { message: xhr.responseText };
        }
        reject({ status: xhr.status, ...errData });
      }
    };
    xhr.onerror = () => reject({ status: 'FETCH_ERROR', error: 'Network request failed' });
    xhr.ontimeout = () => reject({ status: 'TIMEOUT', error: 'Request timeout' });
    xhr.timeout = 60000;
    xhr.send(formData);
  });
};

const AddMaintenanceRecord = ({ route }) => {
  const { maintenance, vehicleIdPrefilled } = route.params || {};
  const navigation = useNavigation();
  const formikRef = useRef(null);
  const [add] = useAddMutation();
  const token = useSelector(state => state?.auth?.token);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
const currencyOptions = [
  { key: 'USD', value: 'USD' },
  { key: 'AUD', value: 'AUD' },
  { key: 'CAD', value: 'CAD' },
  { key: 'EU', value: 'EU' },
  { key: 'GBD', value: 'GBD' },
];
  const userDetails = useSelector(state => state?.auth?.user || {});
  const userId = userDetails?._id;

  const { data: vehicleData } = useFetchVehicleByUserQuery();

  const Vehicles = Array.isArray(vehicleData)
    ? vehicleData.map((v, index) => ({
      key: index,
      value: v?.vehicleDetails?.make ?? '',
      id: v?._id ?? '',
    }))
    : [];

  useEffect(() => {
    if (vehicleIdPrefilled && formikRef.current) {
      formikRef.current.setFieldValue('vehicleId', vehicleIdPrefilled);
    }
  }, [vehicleIdPrefilled]);
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
  const initialValues = {
    repairName: maintenance?.repairName,
    storeName: maintenance?.storeName,
    storeAddress: maintenance?.storeAddress,
    maintenanceDate: maintenance?.maintenanceDate,
    totalPrice: maintenance?.totalPrice,
    warranty: maintenance?.warranty,
    comments: maintenance?.comments,
    vehicle: maintenance?.vehicle,
    currency: maintenance?.currency || 'USD',
    gallery: normalizeGallery(maintenance?.gallery) || [],
  };
  const getMimeType = (uri, fallback = 'image/jpeg') => {
    if (!uri || typeof uri !== 'string') return fallback;
    const ext = uri.split('.').pop()?.toLowerCase();
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'webp') return 'image/webp';
    return fallback;
  };

  const createFormData = (data) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      if (key === 'gallery' && Array.isArray(data[key])) {
        data[key].forEach((image, index) => {
          if (image.uri.startsWith('file://')) {
            formData.append('gallery', {
              uri: image.uri,
              type: getMimeType(image.uri, image.type || 'image/jpeg'),
              name: image.fileName || `image_${index}.jpg`,
            });
          }
        });
        return;
      }

      if (key === 'existingImages' && Array.isArray(data[key])) {
        data[key].forEach(img => formData.append('existingImages[]', img));
        return;
      }

      if (data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    return formData;
  };
  const handleSubmitForm = async (values, { resetForm }) => {
    setIsSubmitting(true);
    try {

      const payload = {
        vehicleId: values.vehicleId,
        repairName: values.repairName,
        storeName: values.storeName,
        storeAddress: values.storeAddress,
        maintenanceDate: values.maintenanceDate,
        totalPrice: values.totalPrice,
        warranty: values.warranty,
        comments: values.comments,
        vehicle: values.vehicle,
        gallery: values.gallery,
         currency: values.currency,
        
      };
      const formData = createFormData(payload);
      let response;
      if (maintenance) {
        response = await uploadPartWithXHR({
          urlPath: `${endpoints.maintenanceAutoparts.update.url}/${maintenance._id}`,
          method: 'PUT',
          formData,
          token,
        });
      } else {
        response = await uploadPartWithXHR({
          urlPath: endpoints.maintenanceAutoparts.add.url,
          method: 'POST',
          formData,
          token,
        });
      }

      if (response?.data || response) {
        setModalVisible(true);
        setTimeout(() => navigation.navigate(routes?.tab?.vehicles), 1000);
      }
    } catch (error) {
      console.error('Form submission error:', error);

      // Extra debug for Android fetch issues
      if (error?.status === 'FETCH_ERROR') {
        alert('Network request failed. Make sure your images are valid local files (file://)');
      } else if (error?.status === 401) {
        navigation.navigate(routes.auth.login);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <CustomHeader routeName={routes.main.addmaintenancerecord} longtitle />
      <ScrollView contentContainerStyle={{ padding: 16 ,paddingBottom:"20%"}}>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          onSubmit={handleSubmitForm}
        >
          {({ handleSubmit, values, setFieldValue }) => (
            <View style={{ gap: 15 }}>

              <InputField
                label="Vehicle"
                placeholder="Enter Vehicle"
                value={values.vehicle}
                onChangeText={text => setFieldValue('vehicle', text)}
              />
              <InputField
                label="Repair Name"
                placeholder="Enter Repair Name"
                value={values.repairName}
                onChangeText={text => setFieldValue('repairName', text)}
              />
              <InputField
                label="Store Name"
                placeholder="Enter Store Name"
                value={values.storeName}
                onChangeText={text => setFieldValue('storeName', text)}
              />

              <InputField
                label="Store Address"
                placeholder="Enter Store Address"
                value={values.storeAddress}
                onChangeText={text => setFieldValue('storeAddress', text)}
              />
              <CustomDatePicker
                label="Maintenance Date"
                dateStyle={{ width: vw * 86, marginBottom: vh * 2 }}
                date={
                  values.maintenanceDate ? new Date(values.maintenanceDate) : null
                }
                onDateChange={date =>
                  setFieldValue('maintenanceDate', date.toISOString())
                }
              />
              <InputField
                label="Total Price"
                placeholder="Enter Total Price"
                keyboardType="decimal-pad"
                value={values.totalPrice}
                onChangeText={text => setFieldValue('totalPrice', text)}
              />
              <View style={{ width: vw * 85, marginBottom: vh * 2 ,alignSelf:"center"}}>

                <Text style={{ marginBottom: 2, fontWeight: '500',paddingLeft:10 }}>
                  Currency
                </Text>

                <SelectList
                  data={currencyOptions}
                  setSelected={(val) => setFieldValue("currency", val)}
                  defaultOption={{ key: values.currency, value: values.currency }}
                  boxStyles={{
                    borderColor: "#ccc",
                    borderRadius: 8,
                    borderRadius:30
                  }}
                  dropdownStyles={{
                    borderColor: "#ccc"
                  }}
                />

              </View>
              <InputField
                label="Warranty"
                placeholder="Select Warranty"
                value={values.warranty}
                onChangeText={text => setFieldValue('warranty', text)}
              />

              <InputField
                label="Comments"
                placeholder="Enter Comments"
                multiline={true}
                value={values.comments}
                onChangeText={text => setFieldValue('comments', text)}
                textAlignVertical="top"
                style={{
                  width: vw * 90,
                  marginBottom: vh * 5,
                  minHeight: vh * 15,
                }}
              />
              <View style={{ alignSelf: "center", width: "100%" }}>
                <DocumentImagePicker
                  label={'Add Photo/Attachment'}
                  handleImage={images => {
                    LOG('images', images);
                    setFieldValue('gallery', images);
                  }}
                // errors={touched.gallery && errors.gallery}
                />
              </View>


              {isLoading ? (
                <ActivityLoader
                  style={{ marginTop: spacing.medium }}
                  color={colors.theme.secondary}
                />
              ) : (
                <MainButton
                  title={maintenance ? "Edit Maintenance Record" : "Add Maintenance Record"}
                  onPress={handleSubmit}
                  disabled={isSubmitting

                  }
                  hideIcon
                />
              )}

            </View>
          )}
        </Formik>

        <ModalComponent
          isVisible={isModalVisible}
          onClose={() => setModalVisible(false)}
          onPressCross={() => {
            setModalVisible(false);
            setTimeout(() => navigation.goBack(), 500);
          }}
          title="Record Added"
          message="Do you want to add another maintenance record?"
          doublemodal
          buttonText1="No"
          buttonText="Yes"
          onButtonPress={() => {
            setModalVisible(false);
          }}
        />
      </ScrollView>
    </>
  );
};

export default AddMaintenanceRecord;