import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 16
  },
  day: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  date: {
    fontSize: 24,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  itemContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderStyle: "solid",
    borderColor: "#dce3e3",
    borderWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  itemTitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left"
  },
  itemDescription: {
    width: "100%",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
    marginVertical: 4
  },
  itemDetailBtn: {
    fontSize: 12,
    textDecorationLine: "underline",
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
    textAlign: "left"
  },
  itemTimeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 7
  },
  itemTime: {
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingBottom: 32,
    paddingHorizontal: 32,
    paddingTop: 44,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalTitle: {
    fontSize: 24,
    letterSpacing: 0.4,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#000",
    textAlign: "left",
    marginTop: 20,
  },
  modalInput: {
    fontSize: 20,
    letterSpacing: 0.3,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#cacaca",
    textAlign: "left",
    width: '100%',
    marginTop: 13,
    marginBottom: 20,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#31CECE',
  },
  valueUnitText: {
    fontSize: 20,
    letterSpacing: 0.3,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#8d8d8d",
    textAlign: "left"
  },
  modalTextArea: {
    fontSize: 20,
    letterSpacing: 0.3,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#cacaca",
    textAlign: "left",
    flex: 1,
    width: '100%',
    height: 138,
    marginTop: 13,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#31CECE',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 49,
    gap: 8
  },
  cancelButton: {
    flex: 1,
    borderRadius: 32,
    width: "100%",
    height: 48,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12
  },
  addButton: {
    flex: 1,
    borderRadius: 32,
    backgroundColor: "#31cece",
    width: "100%",
    height: 48,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 12
  },
  buttonTextCancel: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#222128",
    textAlign: "left"
  },
  buttonTextAdd: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#fff",
    textAlign: "left"
  }
});