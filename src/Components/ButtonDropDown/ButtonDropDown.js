import React, { useState } from 'react';
import { View, TouchableOpacity, Text, Modal, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import routes from '../../Navigation/routes';
import { colors } from '../../theme/colors';
import { font, spacing } from '../../theme/styles';
import fonts from '../../Assets/fonts';
import { MainButton } from '../Buttons/MainButton';

const { width, height } = Dimensions.get('window');

const DropdownActions = ({ navigation, vehicleId }) => {
    const [visible, setVisible] = useState(false);
    const [slideAnim] = useState(new Animated.Value(height));

    const options = [
        { label: 'Add Parts', action: () => navigation.navigate(routes.main.AddPart, { vehicleIdPrefilled: vehicleId }) },
        { label: 'Part Details', action: () => navigation.navigate(routes.main.vehicleMaintenanceDetails, { id: vehicleId }) },
        { label: 'Add Repair or Maintenance', action: () => navigation.navigate(routes.main.addmaintenancerecord, { vehicleIdPrefilled: vehicleId }) },
        { label: 'Maintenance  Repair Details', action: () => navigation.navigate(routes.main.MaintenanceDetail, { id: vehicleId }) },
    ];

    const handleSelect = (option) => {
        hideModal();
        option.action();
    };

    const showModal = () => {
        setVisible(true);
        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: false,
        }).start();
    };

    const hideModal = () => {
        Animated.timing(slideAnim, {
            toValue: height,
            duration: 300,
            easing: Easing.in(Easing.ease),
            useNativeDriver: false,
        }).start(() => setVisible(false));
    };

    return (
        <View style={{ marginTop: 12 }}>
            <MainButton
                title={'MAINTENANCE / PARTS / REPAIR'}
                style={styles.dropdownButton}
                onPress={showModal}
                hideIcon
            >
            </MainButton>

            <Modal
                visible={visible}
                transparent
                animationType="none"
                onRequestClose={hideModal}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={hideModal}
                >
                    <Animated.View style={[styles.modalContent, { bottom: slideAnim }]}>
                        {options.map((option, index) => (
                            <MainButton
                                key={index}
                                hideIcon={true}
                                style={styles.optionButton}
                                onPress={() => handleSelect(option)}
                                title={option.label}
                            >
                                {/* <Text style={styles.optionText}>{option.label}</Text> */}
                            </MainButton>
                        ))}
                    </Animated.View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownButton: {
        backgroundColor: colors.theme.primary,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
        marginBottom: spacing.small,
    },
    dropdownButtonText: {
        color: colors.theme.white,
        fontSize: font.medium,
        fontFamily: fonts.benzin.regular,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-end', // ensures content is at bottom
    },
    modalContent: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        paddingVertical: spacing.medium,
        paddingHorizontal: spacing.medium,
        position: 'absolute',
    },
    optionButton: {
        paddingVertical: spacing.small,
        height: 44
    },
    optionText: {
        fontSize: font.medium,
        fontFamily: fonts.benzin.regular,
        color: colors.text.dimBlack,
    },
});

export default DropdownActions;
