import { ScrollView, StyleSheet, View, Image, TouchableOpacity, Dimensions, Modal, Alert } from 'react-native';
import React, { useCallback, useState } from 'react';
import CustomHeader from '../../../Components/CustomHeader';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import { spacing } from '../../../theme/styles';
import { colors } from '../../../theme/colors';

import Icon from 'react-native-vector-icons/MaterialIcons';
import { getImageUrl, LOG } from '../../../Utils/helperFunction';
import Feather from 'react-native-vector-icons/Feather'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import routes from '../../../Navigation/routes';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useDeleteMutation, useFetchMaintenanceAutopartsByUserQuery } from '../../../Api/mainteinanceAutopartsApiSlice';
const { width: screenWidth } = Dimensions.get('window');

// Move ImageViewer component outside to avoid hook order issues
const ImageViewer = ({ visible, images, initialIndex, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    if (!visible || !images || images.length === 0) return null;

    const handleSwipe = (event) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const newIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentIndex(newIndex);
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
        >
            <View style={styles.imageViewerOverlay}>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                    <Icon name="close" size={30} color={colors.text.white} />
                </TouchableOpacity>

                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.imageViewerContainer}
                    onMomentumScrollEnd={handleSwipe}
                    initialScrollIndex={initialIndex}
                >
                    {images.map((image, index) => (
                        <View key={index} style={styles.imageViewerItem}>
                            <Image
                                source={{ uri: image }}
                                style={styles.fullSizeImage}
                                resizeMode="contain"
                            />
                        </View>
                    ))}
                </ScrollView>

                <View style={styles.imageCounter}>
                    <CustomText
                        text={`${currentIndex + 1} / ${images.length}`}
                        color={colors.text.white}
                        style={styles.counterText}
                    />
                </View>
            </View>
        </Modal>
    );
};

const ImageGrid = ({ images, onImagePress }) => {

    if (!images || images.length === 0) return null;

    const displayedImages = images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
        <View style={styles.imageGrid}>
            {displayedImages.map((imageUrl, index) => {

                const fullUrl = imageUrl.startsWith('http')
                    ? imageUrl
                    : `https://api.partslogger.com/uploads/${imageUrl}`;
                return (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.imageGridItem,
                            displayedImages.length === 1 && styles.singleImage,
                            displayedImages.length === 2 && styles.doubleImage,
                            displayedImages.length === 3 && index === 0 && styles.threeImageFirst,
                            displayedImages.length === 3 && index > 0 && styles.threeImageRest,
                            displayedImages.length >= 4 && styles.fourImage,
                        ]}
                        onPress={() => onImagePress(index)}
                    >
                        <Image
                            source={{ uri: fullUrl }}
                            style={styles.gridImage}
                            resizeMode="cover"
                        />
                        {index === 3 && remainingCount > 0 && (
                            <View style={styles.remainingOverlay}>
                                <CustomText
                                    text={`+${remainingCount}`}
                                    color={colors.text.white}
                                    style={styles.remainingText}
                                />
                            </View>
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const MaintenanceDetail = (props) => {
    const navigation = useNavigation()
    const { id } = props?.route?.params;
    const [payload, setPayload] = useState({ page: 1, limit: 1000, vehicleId: id });
    const [imageViewerVisible, setImageViewerVisible] = useState(false);
    const [selectedImages, setSelectedImages] = useState([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const currencySymbols = {
        USD: "$",
        AUD: "A$",
        CAD: "C$",
        EU: "€",
        GBD: "£",
    };
    const {
        data: vehicle,
        isLoading,
        error,
        refetch,
    } = useFetchMaintenanceAutopartsByUserQuery(id, { refetchOnFocus: true, refetchOnMountOrArgChange: true, refetchOnReconnect: true });
    LOG('vehicle::', vehicle);



    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );
    const maintenanceRecords = vehicle?.docs || [];
    const [
        deleteVehicle,
        { isLoading: deleteLoading, isError: deleteIsError, error: deleteError },
    ] = useDeleteMutation();

    const handleCloseImageViewer = () => {
        setImageViewerVisible(false);
        setSelectedImages([]);
        setSelectedImageIndex(0);
    };
    const handleImagePress = (gallery, index) => {
        const fullUrls = gallery.map(filename => `https://api.partslogger.com/uploads/${filename}`);
        setSelectedImages(fullUrls);
        setSelectedImageIndex(index);
        setImageViewerVisible(true);
    };
    const handleDelete = async (id) => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this part?',
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
                            const res = await deleteVehicle(id).unwrap();
                            console.log('resresres', res)
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
    console.log('maintenanceRecordsmaintenanceRecords', maintenanceRecords)
    return (
        <>
            <CustomHeader title="Maintenance Details" />
            <ScrollView contentContainerStyle={styles.container}>
                {isLoading && (
                    <View style={styles.loadingContainer}>
                        <Icon name="refresh" size={24} color={colors.primary} />
                        <CustomText text="Loading..." color={colors.text.black} style={styles.loadingText} />
                    </View>
                )}

                {/* {isError && (
                    <View style={styles.errorContainer}>
                        <Icon name="error-outline" size={24} color={colors.text.red} />
                        <CustomText text="Error fetching data" color={colors.text.red} style={styles.errorText} />
                    </View>
                )} */}

                {maintenanceRecords?.length > 0 ? (
                    <View style={styles.dataContainer}>
                        {maintenanceRecords?.map((item) => (
                            <View key={item._id} style={styles.card}>

                                {/* Top Row */}
                                <View style={styles.topRow}>
                                    <View style={{ flex: 1 }}>
                                        <CustomText
                                            text={item.repairName}
                                            fontWeight="bold"
                                            style={styles.title}
                                        />
                                        <CustomText
                                            text={item.vehicle}
                                            color={colors.text.grey}
                                            style={styles.vehicle}
                                        />
                                    </View>

                                    <View style={styles.actionRow}>
                                        <TouchableOpacity onPress={() =>
                                            navigation.navigate(routes.main.addmaintenancerecord, {
                                                maintenance: item,
                                                vehicleIdPrefilled: id
                                            })
                                        } style={styles.iconBtn}>
                                            <Feather name="edit" size={18} color={colors.primary} />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => handleDelete(item?._id)} style={styles.deleteBtn}>
                                            <MaterialIcons name="delete" size={18} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                                <View style={styles.row}>
                                    <View style={styles.badge}>
                                        <CustomText
                                            text={`${currencySymbols[item.currency] || "$"}${item.totalPrice} (${item.currency})`}
                                            color="#000"
                                            fontWeight="bold"
                                        />
                                    </View>

                                    <CustomText
                                        text={new Date(item.maintenanceDate).toLocaleDateString()}
                                        color={colors.text.grey}
                                    />
                                </View>


                                {/* Store */}
                                <View style={styles.infoRow}>
                                    <Icon name="store" size={16} color={colors.primary} />
                                    <CustomText text={item.storeName} style={styles.infoText} />
                                </View>

                                <View style={styles.infoRow}>
                                    <Icon name="location-on" size={16} color={colors.primary} />
                                    <CustomText text={item.storeAddress} style={styles.infoText} />
                                </View>


                                {/* Warranty */}
                                <View style={styles.infoRow}>
                                    <Icon name="verified-user" size={16} color={colors.primary} />
                                    <CustomText text={`Warranty: ${item.warranty}`} style={styles.infoText} />
                                </View>


                                {/* Comments */}
                                {item.comments !== "" && (
                                    <View style={styles.commentBox}>
                                        <CustomText
                                            text={item.comments}
                                            style={styles.commentText}
                                        />
                                    </View>
                                )}

                                {item.gallery?.length > 0 && (
                                    <ImageGrid
                                        images={item.gallery}
                                        onImagePress={(index) =>
                                            handleImagePress(item.gallery, index)
                                        }
                                    />
                                )}

                            </View>
                        ))}
                    </View>
                ) : (
                    !isLoading && (
                        <View style={styles.noDataContainer}>
                            <Icon name="inventory-2" size={48} color={colors.text.grey} />
                            <CustomText
                                text="No maintenance records found"
                                color={colors.text.grey}
                                style={styles.noDataText}
                            />
                        </View>
                    )
                )}
            </ScrollView>

            {/* Image Viewer Modal */}
            <ImageViewer
                visible={imageViewerVisible}
                images={selectedImages}
                initialIndex={selectedImageIndex}
                onClose={handleCloseImageViewer}
            />
        </>
    );
};

export default MaintenanceDetail;

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        paddingBottom: 20,
    },
    loadingContainer: {
        alignItems: 'center',
        padding: spacing.large,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loadingText: {
        marginLeft: spacing.small,
    },
    errorContainer: {
        alignItems: 'center',
        padding: spacing.large,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    errorText: {
        marginLeft: spacing.small,
    },
    dataContainer: {
        paddingHorizontal: spacing.medium,
        gap: 15,
    },
    itemContainer: {
        backgroundColor: colors.background.light,
        padding: spacing.medium,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: colors.border.color_1
    },
    card: {
        backgroundColor: "#ffffff40",
        borderRadius: 14,
        padding: 16,
        marginBottom: 15,
        borderWidth: 1
    },

    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    title: {
        fontSize: 18,
    },

    vehicle: {
        fontSize: 14,
        marginTop: 3,
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10,
        alignItems: "center",
    },

    badge: {
        backgroundColor: colors.primary,
        paddingHorizontal: 1,
        paddingVertical: 5,
        borderRadius: 20,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },

    infoText: {
        marginLeft: 6,
    },

    commentBox: {
        marginTop: 10,
        backgroundColor: "#F4F6F8",
        padding: 10,
        borderRadius: 8,
    },

    commentText: {
        fontSize: 13,
    },

    iconBtn: {
        backgroundColor: "#F1F1F1",
        padding: 7,
        borderRadius: 8,
        marginRight: 5,
    },

    deleteBtn: {
        backgroundColor: "#E53935",
        padding: 7,
        borderRadius: 8,
    },

    actionRow: {
        flexDirection: "row"
    },
    noDataContainer: {
        alignItems: 'center',
        padding: spacing.large,
        flex: 1,
        justifyContent: 'center',
    },
    noDataText: {
        marginTop: spacing.medium,
        fontSize: 16,
    },
    // Image Viewer Styles
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1001,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 20,
        padding: 5,
    },
    imageViewerContainer: {
        alignItems: 'center',
    },
    imageViewerItem: {
        width: screenWidth,
        height: '80%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullSizeImage: {
        width: '100%',
        height: '100%',
    },
    imageCounter: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        borderRadius: 20,
    },
    counterText: {
        fontSize: 14,
    },
    actionRow: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },

    iconButton: {
        height: 34,
        width: 34,
        borderRadius: 8,
        backgroundColor: '#F2F4F7',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },

    deleteButton: {
        backgroundColor: '#E53935',
    },

});