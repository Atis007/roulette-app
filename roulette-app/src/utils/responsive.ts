import { Dimensions } from "react-native";

const { width: W, height: H } = Dimensions.get("window");

const BASE_W = 375;
const BASE_H = 667;

export const scale = (n: number) => Math.round((W / BASE_W) * n);
export const verticalScale = (n: number) => Math.round((H / BASE_H) * n);
export const fontScale = (n: number) =>
  Math.round(Math.min(W / BASE_W, 1.3) * n);

export const SCREEN_WIDTH = W;
export const SCREEN_HEIGHT = H;
