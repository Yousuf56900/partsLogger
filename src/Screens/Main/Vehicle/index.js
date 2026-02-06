import React, { useState, useCallback, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  View,
  RefreshControl,
  ActivityIndicator,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useFetchVehicleByUserQuery } from '../../../Api/vehiclesApiSlice';
import fonts from '../../../Assets/fonts';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import CustomCard from '../../../Components/CustomCard';
import CustomHeader from '../../../Components/CustomHeader';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import routes from '../../../Navigation/routes';
import { font } from '../../../theme/styles';
import styles from '../Home/styles';
import { colors } from '../../../theme/colors';
import { useFocusEffect } from '@react-navigation/native';
import { appImages } from '../../../Assets/Images';

const { height } = Dimensions.get('screen');

const Vehicle = ({ navigation }) => {
  const scrollRef = useRef(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { data, isLoading, error, refetch } =
    useFetchVehicleByUserQuery();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // ---- SCROLL HELPERS ----
  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollToEnd({ animated: true });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // ---- UI STATES ----
  const LoadingComponent = () => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.theme.secondary} />
      <CustomText text="Loading Vehicles..." />
    </View>
  );

  const EmptyComponent = () => (
    <View style={{ alignItems: 'center', paddingVertical: 30 }}>
      <MainButtonWithGradient
        title="Add Vehicle Now"
        onPress={() => navigation.navigate(routes.main.addVehicles)}
      />
      <Image
        source={appImages?.errors}
        style={styles.errorsStyles}
        resizeMode="cover"
      />
      <CustomText
        text="No Vehicles Added"
        color={colors.text.altGrey}
      />
    </View>
  );

  const VehiclesList = () => (
    <View style={{ paddingBottom: height * 0.15 }}>
      {/* <View
        style={{
          marginHorizontal: 16,
          marginBottom: 20,
          backgroundColor: '#F5F5F5',
          borderRadius: 14,
          padding: 14,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          width:'40%'
        }}
      >
     <TouchableOpacity
          onPress={scrollToBottom}
          style={{
            backgroundColor: colors.theme.secondary,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <CustomText text="Bottom ↓" color="#fff" />
        </TouchableOpacity>

   
      </View> */}

      <MainButtonWithGradient
        title="Add Vehicle"
        onPress={() => navigation.navigate(routes.main.addVehicles)}
        style={{ marginHorizontal: 16, marginBottom: 20 }}
      />

      <FlatList
        data={data}
        scrollEnabled={false}
        keyExtractor={item => item._id}
        contentContainerStyle={{
          paddingHorizontal: 16,
        }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <CustomCard
            item={item}
            couponCard
            onPress={() =>
              navigation.navigate(routes.main.vehicleDetails, {
                vehicleId: item._id,
              })
            }
          />
        )}
      />
    </View>
  );

  return (
    <>
      <CustomHeader routeName={routes.tab.vehicles} />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        scrollEventThrottle={16}
        onScroll={e =>
          setShowScrollTop(e.nativeEvent.contentOffset.y > 200)
        }
      >
        <View style={styles.container}>
          {isLoading ? (
            <LoadingComponent />
          ) : data?.length > 0 ? (
            <VehiclesList />
          ) : (
            <EmptyComponent />
          )}
        </View>
      </ScrollView>
      {showScrollTop && (
        <TouchableOpacity
          onPress={scrollToTop}
          activeOpacity={0.8}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 80,
            backgroundColor: colors.theme.secondary,
            width: 52,
            height: 52,
            borderRadius: 26,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 5,
          }}
        >
          <CustomText text="↑" color="#fff" size={font.large} />
        </TouchableOpacity>
      )}
    </>
  );
};

export default Vehicle;
