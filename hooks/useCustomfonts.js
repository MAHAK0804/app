import {
  useFonts as useManrope,
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
  Manrope_500Medium,
} from "@expo-google-fonts/manrope";
import {
  useFonts as useKameron,
  Kameron_400Regular,
  Kameron_600SemiBold,
  Kameron_700Bold,
  Kameron_500Medium,
} from "@expo-google-fonts/kameron";
// import {
//   useFonts as usePacifico,
//   Pacifico_400Regular,
//   Pacifico_600SemiBold,
// } from "@expo-google-fonts/pacifico";
// import {
//   useFonts as useLobster,
//   Lobster_400Regular,
//   Lobster_600SemiBold,
// } from "@expo-google-fonts/lobster";
// import {
//   useFonts as usePlayfair,
//   PlayfairDisplay_400Regular,
//   PlayfairDisplay_600SemiBold,
// } from "@expo-google-fonts/playfair-display";
// import {
//   useFonts as usePoppins,
//   Poppins_400Regular,
//   Poppins_600SemiBold,
// } from "@expo-google-fonts/poppins";
// import {
//   useFonts as useRaleway,
//   Raleway_400Regular,
//   Raleway_600SemiBold,
// } from "@expo-google-fonts/raleway";
// import {
//   useFonts as useOpenSans,
//   OpenSans_400Regular,
//   OpenSans_600SemiBold,
// } from "@expo-google-fonts/open-sans";
// import {
//   useFonts as useMerriweather,
//   Merriweather_400Regular,
//   Merriweather_600SemiBold,
// } from "@expo-google-fonts/merriweather";

import {
  useFonts as useHind,
  Hind_400Regular,
  Hind_600SemiBold,
  Hind_700Bold,
} from "@expo-google-fonts/hind";

import {
  useFonts as useBaloo2,
  Baloo2_400Regular,
  Baloo2_600SemiBold,
  Baloo2_700Bold,
} from "@expo-google-fonts/baloo-2";

import {
  useFonts as useTiro,
  TiroDevanagariHindi_400Regular,
  // TiroDevanagariHindi_600SemiBold,
} from "@expo-google-fonts/tiro-devanagari-hindi";

import {
  useFonts as useRajdhani,
  Rajdhani_400Regular,
  Rajdhani_600SemiBold,
  Rajdhani_700Bold,
} from "@expo-google-fonts/rajdhani";

import {
  useFonts as useYantramanav,
  Yantramanav_400Regular,
  // Yantramanav_600SemiBold,
  Yantramanav_700Bold,
} from "@expo-google-fonts/yantramanav";

export default function useCustomFonts() {
  const [manropeLoaded] = useManrope({
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_500Medium,
    Manrope_700Bold,
  });
  const [kameronLoaded] = useKameron({
    Kameron_400Regular,
    Kameron_600SemiBold,
    Kameron_500Medium,
    Kameron_700Bold,
  });
  // const [pacificoLoaded] = usePacifico({
  //   Pacifico_400Regular,
  //   Pacifico_600SemiBold,
  // });
  // const [lobsterLoaded] = useLobster({
  //   Lobster_400Regular,
  //   Lobster_600SemiBold,
  // });
  // const [playfairLoaded] = usePlayfair({
  //   PlayfairDisplay_400Regular,
  //   PlayfairDisplay_600SemiBold,
  // });
  // const [poppinsLoaded] = usePoppins({
  //   Poppins_400Regular,
  //   Poppins_600SemiBold,
  // });
  // const [ralewayLoaded] = useRaleway({
  //   Raleway_400Regular,
  //   Raleway_600SemiBold,
  // });
  // const [openSansLoaded] = useOpenSans({
  //   OpenSans_400Regular,
  //   OpenSans_600SemiBold,
  // });
  // const [merriweatherLoaded] = useMerriweather({
  //   Merriweather_400Regular,
  //   Merriweather_600SemiBold,
  // });

  // ✅ Load Hindi fonts
  const [hindLoaded] = useHind({
    Hind_400Regular,
    Hind_600SemiBold,
    Hind_700Bold,
  });

  const [balooLoaded] = useBaloo2({
    Baloo2_400Regular,
    Baloo2_600SemiBold,
    Baloo2_700Bold,
  });
  const [tiroLoaded] = useTiro({
    TiroDevanagariHindi_400Regular,
    // TiroDevanagariHindi_600SemiBold,
  });
  const [rajdhaniLoaded] = useRajdhani({
    Rajdhani_400Regular,
    Rajdhani_600SemiBold,
    Rajdhani_700Bold,
  });
  const [yantraLoaded] = useYantramanav({
    Yantramanav_400Regular,
    // Yantramanav_600SemiBold,
    Yantramanav_700Bold,
  });

  return (
    manropeLoaded &&
    kameronLoaded &&
    // pacificoLoaded &&
    // lobsterLoaded &&
    // playfairLoaded &&
    // poppinsLoaded &&
    // ralewayLoaded &&
    // openSansLoaded &&
    // merriweatherLoaded &&
    hindLoaded &&
    balooLoaded &&
    // tiroLoaded &&
    rajdhaniLoaded &&
    yantraLoaded
  );
}
