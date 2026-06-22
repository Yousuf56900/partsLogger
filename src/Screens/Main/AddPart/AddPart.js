import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { SelectList } from "react-native-dropdown-select-list";
import CustomHeader from '../../../Components/CustomHeader';
import InputField from '../../../Components/InputField';
import CustomDatePicker from '../../../Components/CustomDatePicker';
import DocumentImagePicker from '../../../Components/ImagePicker/DocumentImagePicker/DocumentImagePicker';
import ModalComponent from '../../../Components/ModalComponent';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import ActivityLoader from '../../../Components/ActivityLoader';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/styles';
import { vh, vw } from '../../../theme/units';
import routes from '../../../Navigation/routes';
import { styles } from './styles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useSelector } from 'react-redux';
import { baseUrl, endpoints, imageServer } from '../../../Api/configs';

/**
 * Upload FormData via XMLHttpRequest (works reliably on Android; fetch + FormData often fails there).
 */
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

const partValidation = Yup.object().shape({
  name: Yup.string().required('Part name is required'),
  // Add other validations as needed
});

const AddPart = ({ navigation, route }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = useSelector(state => state?.auth?.token);
  const part = route.params?.part || null;
  const vehicleId = route.params?.vehicleIdPrefilled || part?.vehicleId?._id;
  const currencyOptions = [
    { label: 'USD', value: 'USD' },
    { label: 'AUD', value: 'AUD' },
    { label: 'CAD', value: 'CAD' },
    { label: 'EU', value: 'EU' },
    { label: 'GBD', value: 'GBD' },
  ];
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
    name: part?.name || '',
    forWhat: part?.forWhat || '',
    price: part?.price?.toString() || '',
    storeName: part?.storeName || '',
    storeAddress: part?.storeAddress || '',
    warranty: part?.warranty || '',
    purchaseDate: part?.purchaseDate || '',
    currency: part?.currency || 'USD',
    gallery: normalizeGallery(part?.gallery) || [],
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

  const handleSubmitForm = async (values) => {
    const payload = {
      vehicleId,
      name: values.name,
      forWhat: values.forWhat,
      price: values.price,
      storeName: values.storeName,
      storeAddress: values.storeAddress,
      warranty: values.warranty,
      purchaseDate: values.purchaseDate,
      gallery: values.gallery, 
        currency: values.currency,
    };

    try {
      setIsLoading(true);
      const formData = createFormData(payload);
      let response;
      console.log('formDataformData', formData)
      if (part) {
        // Update part
        response = await uploadPartWithXHR({
          urlPath: `${endpoints.part.update.url}/${part._id}`,
          method: 'PUT',
          formData,
          token,
        });
      } else {
        // Add part
        response = await uploadPartWithXHR({
          urlPath: endpoints.part.add.url,
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
  };

  return (
    <>
      <CustomHeader title={part ? 'Edit Part' : 'Add Part'} />
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={vh * 10}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1,paddingBottom:"12%" }}>
          <Formik
            initialValues={initialValues}
            validationSchema={partValidation}
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
                <View
                  style={[styles.detailContainer, { paddingHorizontal: spacing.large }]}>
                  <View style={{ alignItems: 'center', marginTop: vh * 4 }}>
                    <InputField
                      label="Vehicle"
                      placeholder="Enter Vehicle Name"
                      onChangeText={handleChange('forWhat')}
                      onBlur={handleBlur('forWhat')}
                      value={values.forWhat}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.forWhat && errors.forWhat}
                    />
                    <InputField
                      label="Part Name"
                      placeholder="Enter Part Name"
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      value={values.name}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.name && errors.name}
                    />
                    <CustomDatePicker
                      dateStyle={{ width: vw * 80, marginBottom: vh * 5, backgroundColor: '#fff' }}
                      labelStyle={{ marginLeft: 20 }}
                      date={values.purchaseDate ? new Date(values.purchaseDate) : null}
                      label="Purchase Date"
                      onDateChange={date => setFieldValue('purchaseDate', date.toISOString())}
                      errors={touched.purchaseDate && errors.purchaseDate}
                    />
                    <InputField
                      label="Warranty"
                      placeholder="Enter Warranty"
                      onChangeText={handleChange('warranty')}
                      onBlur={handleBlur('warranty')}
                      value={values.warranty}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.warranty && errors.warranty}
                    />
                    <InputField
                      label="Price"
                      placeholder="Enter Price"
                      keyboardType={'decimal-pad'}
                      onChangeText={handleChange('price')}
                      onBlur={handleBlur('price')}
                      value={values.price}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.price && errors.price}
                    />
                    <View style={{ width: vw * 81, marginBottom: vh * 5, }}>
                      <Text style={{ marginBottom: 2, fontWeight: '500' }}>
                        Currency
                      </Text>
                      <SelectList
                        data={currencyOptions}
                        setSelected={(val) => setFieldValue("currency", val)}
                        defaultOption={{ key: values.currency, value: values.currency }}
                        boxStyles={{
                          borderColor: "#ccc",
                          borderRadius: 8,
                          borderRadius:35
                        }}
                        dropdownStyles={{
                          borderColor: "#ccc",
                          borderRadius:15
                        }}
                      />

                    </View>
                    <InputField
                      label="Store Name"
                      placeholder="Enter Store Name"
                      onChangeText={handleChange('storeName')}
                      onBlur={handleBlur('storeName')}
                      value={values.storeName}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.storeName && errors.storeName}
                    />
                    <InputField
                      label="Store Address"
                      placeholder="Enter Store Address"
                      onChangeText={handleChange('storeAddress')}
                      onBlur={handleBlur('storeAddress')}
                      value={values.storeAddress}
                      style={{ width: vw * 85, marginBottom: vh * 5 }}
                      errors={touched.storeAddress && errors.storeAddress}
                    />
                    <DocumentImagePicker
                      label="Upload Receipt Image"
                      handleImage={img => setFieldValue('gallery', img)}
                      errors={touched.gallery && errors.gallery}
                      initialImages={values.gallery}
                    />
                    {isLoading ? (
                      <ActivityLoader
                        style={{ marginTop: spacing.medium }}
                        color={colors.theme.secondary}
                      />
                    ) : (
                      <View style={{ marginTop: spacing.medium }}>
                        <MainButtonWithGradient
                          title={part ? 'Update Part' : 'Add Part'}
                          onPress={handleSubmit}
                          style={{ width: vw * 80, alignSelf: 'center' }}
                        />
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
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
            title={part ? "Part Updated" : "Part Added"}
            message={part ? "You have successfully updated the part!" : "You have successfully added a new part!"}
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

export default AddPart;