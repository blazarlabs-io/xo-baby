import { StyleSheet } from "react-native";
const CIRCLE_SIZE = 100;
const BASE_CIRCLE_SIZE = 80;
const MAX_CIRCLE_SIZE = BASE_CIRCLE_SIZE * 3;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    padding: 24,

  },
  componentHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    gap: 6.69
  },
  realTimeText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  buttonAdd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 160,
    borderWidth: 1,
    borderColor: '#31CECE',
    borderRadius: 32, 
    borderStyle: 'dashed',
    width: '100%',
    height: 48,
    paddingHorizontal: 32,
    paddingVertical: 12,
    justifyContent: 'center',
    gap: 8
  },
  addKidText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left"
  },
  contentTitle: {
    width: "100%",
    flex: 1,
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "center"
  },
  connectContainer: {
    width: "100%",
    paddingHorizontal: 24,
    gap: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#dce3e3",
    borderStyle: "solid",
    borderRadius: 16,
    alignItems: "center",
    backgroundColor: "#fff",
    marginVertical: 16,
  },
  statusBadge: {
    borderRadius: 16,
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
    backgroundColor: '#E2F3F3',
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    paddingVertical: 0,
    gap: 4
  },
  circle: {
    width: 8,
    overflow: "hidden",
    flex: 1,
    height: 8,
    borderRadius: 4
  },
  statusText: {
    fontSize: 8,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
  },
  contentContainer : {
    width: "100%",
    gap: 4,
    alignItems: "center",
    flex: 1
  },
  deviceTitle: {
    fontSize: 24,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  deviceID: {
    fontSize: 8,
    lineHeight: 12,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#8d8d8d",
    textAlign: "left"
  },
  btnContainer: {
    width: "100%",
    gap: 16,
    flexDirection: "row",
    flex: 1,
    justifyContent: 'center'
  },
  disconectBtn: {
    borderRadius: 32,
    height: 48,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,

  },
  disconectBtnText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#ff6d68",
    textAlign: "left"
  },
  editBtn: {
    borderRadius: 32,
    height: 48,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: "#31cece"
  },
  editBtnText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#fff",
    textAlign: "left"
  },
  backBtn: { 
    borderWidth: 1, 
    borderColor: '#CACACA', 
    width: 24,  
    height: 24, 
    borderRadius: 4, 
    cursor: 'pointer', 
    position: 'absolute', 
    left: 0,  
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  itemHeaderCont: {
    width: "100%",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 16,
    alignItems: "center",
    marginVertical: 16
  },
  itemHeaderTitle: {
    fontSize: 32,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  imageContainer: {
    width: '100%',
    marginTop: 26,
    justifyContent: 'center',
    alignItems: 'center'
  },
  itemBtnText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#fff",
    textAlign: "left"
  },
  itemBtnDisconnect: {
    width: "100%",
    borderRadius: 32,
    height: 48,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12,
    flex: 1,
    marginTop: 20,
    marginBottom: 50,
    backgroundColor: '#FF6D68'
  },
  bluetoothCont: {

    alignItems: "center",
    gap: 24,
 
  },
  blText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontFamily: "Poppins-Regular",
    color: "#000",
    textAlign: "left"
  },
  animationWrapper: {
    width: MAX_CIRCLE_SIZE,
    height: MAX_CIRCLE_SIZE,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleAnimated: {
    position: 'absolute',
    width: BASE_CIRCLE_SIZE,
    height: BASE_CIRCLE_SIZE,
    borderRadius: BASE_CIRCLE_SIZE / 2,
    backgroundColor: '#20C4C2',
  },
  circleStatic: {
    position: 'absolute',
    borderRadius: MAX_CIRCLE_SIZE / 2,
    borderColor: '#20C4C2',
    borderStyle: 'solid',
  },
  circleOuter: {
    width: MAX_CIRCLE_SIZE,
    height: MAX_CIRCLE_SIZE,
    borderWidth: BASE_CIRCLE_SIZE,
    borderColor: '#BDF3F2',
  },
  circleMiddle: {
    width: BASE_CIRCLE_SIZE * 2,
    height: BASE_CIRCLE_SIZE * 2,
    borderWidth: BASE_CIRCLE_SIZE / 1.5,
    borderColor: '#7DE0DE',
  },
  circleInner: {
    width: BASE_CIRCLE_SIZE,
    height: BASE_CIRCLE_SIZE,
    borderWidth: BASE_CIRCLE_SIZE / 3,
    borderColor: '#20C4C2',
  },
  centralIconWrapper: {
    position: 'absolute',
    width: BASE_CIRCLE_SIZE * 0.5,
    height: BASE_CIRCLE_SIZE * 0.5,
    borderRadius: (BASE_CIRCLE_SIZE * 0.5) / 2,
    backgroundColor: '#20C4C2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centralIcon: { width: 24, height: 24, tintColor: '#fff' },
  newblcontainer: {
    borderColor: "#dce3e3",
    borderStyle: "solid",
    borderRadius: 15,
    borderWidth: 1,
    width: "100%",
    backgroundColor: "#fff",
    marginTop: 80
  },
  newDeviceItem: {
    width: "100%",
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderBottomWidth: 1,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    gap: 0,
  },
  newDeviceItemText: {
    fontSize: 10,
    letterSpacing: 0.2,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "left"
  },
  newDeviceItemTextStatus: {
    fontSize: 10,
    letterSpacing: 0.2,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
  }
});
