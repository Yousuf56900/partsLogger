import React from 'react';
import { ScrollView, View } from 'react-native';
import CustomHeader from '../../../Components/CustomHeader';
import CustomText from '../../../Components/wrappers/Text/CustomText';
import { colors } from '../../../theme/colors';
import { font } from '../../../theme/styles';
import fonts from '../../../Assets/fonts';
import routes from '../../../Navigation/routes';
import styles from './styles';

const Home = ({ navigation }) => {
  return (
    <>
      <CustomHeader
        routeName={"About Us"}
        onIconPress={() => navigation.navigate(routes.main.notification)}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ padding: 20 ,flexGrow:1,paddingBottom:"40%"}}
        showsVerticalScrollIndicator={false}
      >
        {/* Our Story */}
        <View style={{ marginBottom: 20 }}>
          <CustomText
            text="Our Story"
            size={font.h4}
            color={colors.text.dimBlack}
          />

          <CustomText
            text={`Have you ever had to pay for a part twice because you lost your receipt or warranty documents? Or because you do not remember where or when you bought a car battery or a part?

Losing important warranty details these days can cost you hundreds of dollars on repairs and parts.

With Parts Logger, you can track, organize and log every single purchase, store receipts, and warranty from the convenience of your smartphone. Just show the warranty saved on your phone to the salesman and get your replacement part.

No More Lost Warranties! And no more hassle.

What started off as a digital tool for tracking car parts has now grown into a versatile app that works for virtually everything you buy — from cars, semi-trucks, heavy machinery, farm tractors, to washing machines, refrigerators, TVs, and laptops.`}
            // size={font.medium}
            color={colors.text.dimBlack}
            style={{ marginTop: 10, lineHeight: 22 }}
          />
        </View>

        {/* Our Mission */}
        <View>
          <CustomText
            text="Our Mission"
            size={font.h4}
            font={fonts.benzin.semibold}
            color={colors.text.dimBlack}
          />

          <CustomText
            text={`To eliminate the hassle of receipt and warranty management.

Parts Logger is committed to:

• Saving you time, money, and effort  
• Extending the lifespan of possessions through regular maintenance  
• Providing a seamless experience for warranty claims, resale, and repair tracking`}
            size={font.medium}
            color={colors.text.dimBlack}
            style={{ marginTop: 10, lineHeight: 22 }}
          />
        </View>
      </ScrollView>
    </>
  );
};

export default Home;