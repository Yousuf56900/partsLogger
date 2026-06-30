import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import React, { useCallback, useState } from 'react';
import { BackHandler, Keyboard, Platform, View } from 'react-native';
import fonts from '../../../Assets/fonts';
import ActivityLoader from '../../../Components/ActivityLoader';
import AuthTextButton from '../../../Components/AuthTextButton';
import Background from '../../../Components/Background';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import TextButton from '../../../Components/Buttons/TextButton';
import Container from '../../../Components/Container';
import InputField from '../../../Components/InputField';
import MyIcons from '../../../Components/MyIcons';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import { useResetToScreen } from '../../../Functions/resetToScreen';
import routes from '../../../Navigation/routes';
import { colors } from '../../../theme/colors';
import { font, layout, spacing } from '../../../theme/styles';
import { vh } from '../../../theme/units';
import { loginValidationSchema } from '../../../Validations/authValidations';
import styles from './styles'; // Import styles from styles.js
import { LOG, makeApiCall } from '../../../Utils/helperFunction';
import { useLoginMutation } from '../../../Api/authApiSlice';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuth } from '../../../Redux/slices/authSlice';
import { useDispatch } from 'react-redux';

const LoginScreen = () => {
  const navigation = useNavigation();
  const { resetToScreen } = useResetToScreen();
  const dispatch = useDispatch()
  const [validateAfterSubmit, setValidateAfterSubmit] = useState(false);
  // const [isLoading, setIsLoading] = useState(false);
  const [login, { isLoading, error }] = useLoginMutation();

  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        BackHandler.exitApp();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction,
      );
      // Cleanup backHandler when the screen is unfocused
      return () => backHandler.remove();
    }, []),
  );
  const navigateToSignUp = () => navigation.navigate(routes.auth.signup);
  // LoginScreen.js
  const handleLogin = async data => {
    Keyboard.dismiss();
    try {
      const res = await login(data).unwrap(); 
      if (res?.success || res?.data) {
      navigation.navigate(routes.auth.AppStarterCopy, { userData: res?.data,fromLogin: true, });
      }
    } catch (err) {
      console.log('Login Error:', err);
    }
  };

  const navigateToForgotPassword = () =>
    navigation.navigate(routes.auth.forgot);
  return (
    <Background>
      <Container
        keyboardAware={true}
        keyboardHandled={'handled'}
        contentContainerStyle={styles.mainContentContainer}>
        <View style={{ marginTop: vh * 10 }}>
          <MyIcons name={'logo'} size={150} />
        </View>
        <CustomText
          text={'Hello Again!'}
          font={fonts.clash.semibold}
          size={font.h6}
        />
        <View style={{ margin: spacing.xsmall }} />
        <View style={{ alignItems: 'center' }}>
          <CustomText
            text={'Enter your credentials to sign in to this platform'}
            size={font.small}
            font={fonts.benzin?.regular}
          />
        </View>
        <View style={{ marginTop: vh * 1 }}>
          <Formik
            initialValues={{
              email: '',
              password: '',
              role: 'USER',
              deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
            }}
            validationSchema={loginValidationSchema}
            validateOnChange={validateAfterSubmit}
            validateOnBlur={validateAfterSubmit}
            onSubmit={values => handleLogin(values)}>
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              errors,
              isValid,
              values,
              setFieldValue,
            }) => {
              return (
                <View style={styles.contentContainer}>
                  <View style={{ marginBottom: spacing?.large }}>
                    <InputField
                      label="Email Address"
                      placeholder="Remember login name"
                      required
                      autoCapitalize={'none'}
                      onChangeText={handleChange('email')}
                      errors={errors?.email}
                      value={values?.email}
                      keyboardType={'email-address'}
                    />
                  </View>
                  <InputField
                    label="Password"
                    placeholder="Remember password"
                    onChangeText={handleChange('password')}
                    required
                    password
                    errors={errors?.password}
                    value={values?.password}
                    returnKeyType={'done'}
                  />
                  <View style={[layout.flexRow, styles.rememberRow]}>
                    <TextButton
                      style={styles.forgotText}
                      title={'Forgot Password?'}
                      textColor={colors?.text.blue}
                      onPress={navigateToForgotPassword}
                      underLine={true}
                    />
                  </View>

                  {isLoading ? (
                    <ActivityLoader
                      style={styles.submitButton}
                      color={colors.theme.secondary}
                    />
                  ) : (
                    <MainButtonWithGradient
                      style={styles.submitButton}
                      title={'Sign In'}
                      disabled={!isValid}
                      onPress={() => {
                        setValidateAfterSubmit(true);
                        handleSubmit();
                      }}
                    />
                  )}
                  <View style={{ alignItems: 'center' }}>
                    <AuthTextButton
                      text={'Don’t have an account?'}
                      buttonText="REGISTER NOW"
                      textColor={colors.text.blue}
                      onPress={navigateToSignUp}
                    />
                  </View>
                </View>
              );
            }}
          </Formik>
        </View>
      </Container>
    </Background>

  );
};
export default LoginScreen;
