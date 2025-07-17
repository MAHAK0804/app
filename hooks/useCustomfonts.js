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

  return manropeLoaded && kameronLoaded;
}
