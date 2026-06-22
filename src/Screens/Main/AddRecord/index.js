import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import {
  useFetchCategoriesQuery,
  useDeleteMutation,
  categoryApi,
} from '../../../Api/categoryApiSlice';
import { appImages } from '../../../Assets/Images';
import CustomCard from '../../../Components/CustomCard';
import CustomHeader from '../../../Components/CustomHeader';
import routes from '../../../Navigation/routes';
import { HEIGHT, vw } from '../../../theme/units';
import { addRecordData } from '../../../Utils/dummyData';
import { LOG } from '../../../Utils/helperFunction';
import ListShimmer from '../../../Components/Shimmers/ListShimmer';
import EmptyDataComponent from '../../../Components/EmptyDataComponent';
import { imageServer } from '../../../Api/configs';
import ModalComponent from '../../../Components/ModalComponent';
import { useDispatch } from 'react-redux';
import { executeApiRequest } from '../../../Api/methods/method';
import { colors } from '../../../theme/colors';
import { MainButtonWithGradient } from '../../../Components/Buttons/MainButton';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AddRecord = () => {
  const [customData, setCustomData] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState('');

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {
    data,
    isLoading: categoryLoading,
    refetch,
  } = useFetchCategoriesQuery({
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const [deleteCategory] = useDeleteMutation();

  // 🔹 Dashboard Cards
  const dashboardCards = [
    {
      id: '1',
      title: 'My Subscription',
      icon: 'card-outline',
      screen: '',
    },
    {
      id: '2',
      title: 'Upgrade Plan',
      icon: 'rocket-outline',
      screen: routes?.main?.subscriptionplan,
    },
    {
      id: '3',
      title: 'Contact',
      icon: 'call-outline',
      screen: '',
    },
    {
      id: '4',
      title: 'Help',
      icon: 'help-circle-outline',
      screen:'',
    },
  ];

  useEffect(() => {
    if (data) {
      const converted = data.map((item) => ({
        id: item?._id,
        name: item.title,
        image: item?.gallery
          ? { uri: `${imageServer}${item?.gallery}` }
          : appImages?.autopartrecord,
        nav: routes.main.addDynamicCustomRecords,
        fields: item?.fields,
        hasAttachments: item?.hasAttachments,
      }));

      setCustomData([...converted, ...addRecordData]);
    }
  }, [data]);

  const handleDelete = async (id) => {
    try {
      if (id) {
        let result = await executeApiRequest({
          apiCallFunction: deleteCategory,
          toast: true,
          timeout: 30000,
          params: { id },
        });

        if (result) {
          refetch();
        }

        dispatch(categoryApi.util.resetApiState());
      }
    } catch (err) {
      LOG('Delete error:', err);
    }
  };

  return (
    <>
      <CustomHeader routeName={routes.tab.addrecords} />

      {/* 🔹 Top Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10 }}>
        <MainButtonWithGradient
          title={'Add A Vehicle'}
          onPress={() => navigation.navigate(routes.main.addVehicles)}
          style={{ width: vw * 45, marginVertical: 10 }}
        />
        <MainButtonWithGradient
          title={'My Vehicles'}
          gradientColors={['#003E9C', '#00A2FF']}
          onPress={() => navigation.navigate(routes.tab.vehicles)}
          style={{ width: vw * 45, marginVertical: 10 }}
        />
      </View>

      {/* 🔥 Dashboard Cards */}
      <View style={{ paddingHorizontal: 15 }}>
        <FlatList
          data={dashboardCards}
          numColumns={2}
          scrollEnabled={false}
          keyExtractor={(item) => item.id}
          columnWrapperStyle={{
            justifyContent: 'space-between',
            marginBottom: 15,
          }}
          renderItem={({ item }) => (
            <View
              style={{
                width: '48%',
                backgroundColor: '#fff',
                borderRadius: 15,
                paddingVertical: 20,
                alignItems: 'center',
                elevation: 3,
              }}
            >
              <View
                style={{
                  backgroundColor: '#EAF2FF',
                  padding: 12,
                  borderRadius: 50,
                }}
              >
                <Ionicons name={item.icon} size={26} color="#007BFF" />
              </View>

              <Text
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontWeight: '600',
                  color: colors.theme.black,
                  textAlign: 'center',
                }}
              >
                {item.title}
              </Text>

              <MainButtonWithGradient
                title="Open"
                style={{ marginTop: 10, width: '80%' }}
                onPress={() => navigation.navigate(item.screen)}
              />
            </View>
          )}
        />
      </View>

   

      {/* 🔹 Delete Modal */}
      <ModalComponent
        doublemodal
        isVisible={isModalVisible}
        onClose={() => setModalVisible(false)}
        message="Are you sure you want to delete this category?"
        buttonText1="No"
        buttonText="Yes"
        onButtonPress={() => {
          setModalVisible(false);
          handleDelete(deleteCategoryId);
        }}
      />
    </>
  );
};

export default AddRecord;