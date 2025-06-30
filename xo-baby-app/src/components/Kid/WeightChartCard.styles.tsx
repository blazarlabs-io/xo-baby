import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F6FEFE',
    borderRadius: 12,
    padding: 8,
    width: '100%',
    marginTop: 16,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8
  },
  header: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    height: 20
  },
  subHeader: {
    fontSize: 14,
    lineHeight: 24,
    fontFamily: "Poppins-Regular",
    color: "#222128",
    textAlign: "left"
  },
  icon1: {
    width: 16,
    height: 16,
    borderRadius: 16,
    backgroundColor: '#31CECE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6
  },
  chartContainer: {
    backgroundColor: '#CCF5F5',
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    marginTop: 8,
  },
  name: {
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 16,
    fontWeight: "600",
    fontFamily: "Poppins-SemiBold",
    color: "#222128",
    textAlign: "left"
  },
  dateRange: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
    color: "#8d8d8d",
    textAlign: "left",
    marginVertical: 15,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 8
  },
  progressText: {
    fontSize: 14,
    lineHeight: 14,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    color: "#222128",
    textAlign: "left",
    marginTop: 20,
  },
  progressNote: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "500",
    fontFamily: "Poppins-Medium",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
    marginTop: 8,
  },
  progressHighlight: {
    color: '#31cece'
  },
  button: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00B3B3'
  },
  buttonText: {
    color: '#00B3B3',
    fontWeight: '600'
  },
  buttonAdd: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 16,
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
  addNewRecordText: {
    fontSize: 16,
    letterSpacing: 0.2,
    fontWeight: "500",
    fontFamily: "Roboto-Medium",
    color: "#31cece",
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
