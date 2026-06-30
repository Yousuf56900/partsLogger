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
            {displayedImages.map((item, index) => {
                const imageUrl = getImageUrl(item).uri;
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
                            source={{ uri: imageUrl }}
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
        refetch,
    } = useFetchMaintenanceAutopartsByUserQuery(id, { refetchOnFocus: true, refetchOnMountOrArgChange: true, refetchOnReconnect: true });
    LOG('vehicle::', vehicle);



    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );
    const maintenanceRecords = vehicle?.docs || [];
    const [deleteVehicle] = useDeleteMutation();

    const handleCloseImageViewer = () => {
        setImageViewerVisible(false);
        setSelectedImages([]);
        setSelectedImageIndex(0);
    };
    const handleImagePress = (gallery, index) => {
        const fullUrls = gallery.map(item => getImageUrl(item).uri);
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
                        <Icon name="refresh" size={24} color={colors.theme.primary} />
                        <CustomText text="Loading..." color={'#1F2937'} style={styles.loadingText} />
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
                                            <Feather name="edit" size={18} color={colors.theme.primary} />
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
                                    <Icon name="store" size={16} color={colors.theme.primary} />
                                    <CustomText text={item.storeName} style={styles.infoText} />
                                </View>

                                <View style={styles.infoRow}>
                                    <Icon name="location-on" size={16} color={colors.theme.primary} />
                                    <CustomText text={item.storeAddress} style={styles.infoText} />
                                </View>


                                {/* Warranty */}
                                <View style={styles.infoRow}>
                                    <Icon name="verified-user" size={16} color={colors.theme.primary} />
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
        backgroundColor: '#F5F7FA',
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
        paddingHorizontal: 16,
        gap: 15,
        paddingTop: 12,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8ECF0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        color: '#1A1D21',
    },
    vehicle: {
        fontSize: 13,
        marginTop: 3,
        color: '#6B7280',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#F0F2F5',
    },
    badge: {
        backgroundColor: colors.theme.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    infoText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#374151',
        flex: 1,
    },
    commentBox: {
        marginTop: 12,
        backgroundColor: '#F8FAFC',
        padding: 12,
        borderRadius: 10,
        borderLeftWidth: 3,
        borderLeftColor: colors.theme.primary,
    },
    commentText: {
        fontSize: 13,
        color: '#4B5563',
        lineHeight: 18,
    },
    iconBtn: {
        backgroundColor: '#F3F4F6',
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    deleteBtn: {
        backgroundColor: '#EF4444',
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
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
        color: '#9CA3AF',
    },
    // Image Grid Styles
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 6,
    },
    imageGridItem: {
        borderRadius: 10,
        overflow: 'hidden',
        backgroundColor: '#F0F2F5',
    },
    singleImage: {
        width: '100%',
        height: 200,
    },
    doubleImage: {
        width: '48.5%',
        height: 140,
    },
    threeImageFirst: {
        width: '100%',
        height: 160,
    },
    threeImageRest: {
        width: '48.5%',
        height: 120,
    },
    fourImage: {
        width: '48.5%',
        height: 120,
    },
    gridImage: {
        width: '100%',
        height: '100%',
    },
    remainingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
    },
    remainingText: {
        fontSize: 22,
        fontWeight: '700',
    },
    // Image Viewer Styles
    imageViewerOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.95)',
        justifyContent: 'center',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 1001,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 22,
        padding: 8,
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
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: spacing.medium,
        paddingVertical: spacing.small,
        borderRadius: 20,
    },
    counterText: {
        fontSize: 14,
        color: '#FFFFFF',
    },
});