import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  Modal,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useKidStore } from "../../store/kidStore";
import { useUserStore } from "../../store/userStore";
import { deleteKid } from "../../api/kidApi";
import AvatarImage from "../../components/Kid/AvatarImage";
import Feather from '@expo/vector-icons/Feather';

export default function KidDetailsScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation();
  const { kidId } = route.params;
  const kid = useKidStore((state) => state.kids.find((k) => k.id === kidId));
  const removeKid = useKidStore((state) => state.removeKid);
  const user = useUserStore((state) => state.user);
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return "Unknown age";

    const birth = new Date(birthDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);

    if (weeks < 4) {
      return `${diffDays} days`;
    } else if (weeks < 52) {
      const months = Math.floor(weeks / 4);
      return `${months} ${months === 1 ? "month" : "months"}`;
    } else {
      const years = Math.floor(weeks / 52);
      const remainingWeeks = weeks % 52;
      return remainingWeeks > 0
        ? `${years}y ${remainingWeeks}w`
        : `${years} years`;
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?.token) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteKid(kidId, user.token);
      
      // Remove from local store
      removeKid(kidId);
      
      // Close modal and navigate back
      setShowDeleteModal(false);
      Alert.alert("Success", "Child account deleted successfully", [
        {
          text: "OK",
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      console.error("Error deleting kid:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to delete child account"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  if (!kid) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 16, fontSize: 16, color: "#666" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            {/* <Text style={styles.backButtonText}>  */}
            <Feather name="chevron-left" size={24} color="#222128" />
            {/* </Text> */}
          </Pressable>
          <Text style={styles.headerTitle}>Child Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarBorder}>
              <AvatarImage
                avatarUrl={kid.avatarUrl}
                gender={kid.gender}
                style={styles.avatarImage}
              />
            </View>
          </View>
          <Text style={styles.kidName}>
            {kid.firstName} {kid.lastName}
          </Text>
          <Text style={styles.kidAge}>{calculateAge(kid.birthDate)}</Text>
        </View>

        {/* Device Info Card */}
        <View style={styles.deviceCard}>
          <View style={styles.deviceHeader}>
            <Text style={styles.deviceLabel}>Device</Text>
            <View style={styles.statusContainer}>
              <View style={styles.offlineDot} />
              <Text style={styles.offlineText}>offline</Text>
            </View>
          </View>
          <View style={styles.deviceInfo}>
            <Image
              source={require("../../../assets/home-parent/tabs/device-active.png")}
              style={styles.deviceIcon}
            />
            {/* <Text style={styles.deviceIcon}></Text> */}
            <Text style={styles.deviceName}>xo-AxS83Eg1</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <Pressable style={styles.disableButton}>
            <Text style={styles.disableButtonText}>Disable Access</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => setShowDeleteModal(true)}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </Pressable>
        </View>

        {/* Additional Info Section */}
        {/* <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Blood Type:</Text>
            <Text style={styles.infoValue}>{kid.bloodType || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Gender:</Text>
            <Text style={styles.infoValue}>{kid.gender || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Birth Date:</Text>
            <Text style={styles.infoValue}>{kid.birthDate || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ethnicity:</Text>
            <Text style={styles.infoValue}>{kid.ethnicity || 'N/A'}</Text>
          </View>
          {kid.location && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{kid.location}</Text>
            </View>
          )}
        </View> */}
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Delete Account</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete {kid.firstName}'s account? This
              action cannot be undone.
            </Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                <Text style={styles.modalCancelButtonText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleDeleteAccount}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalDeleteButtonText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F9F9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 4,
    // opacity: 0,
    borderWidth: 1,
    borderColor: "#CACACA",
    // backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: "#222128",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    width: 102,
    height: 102,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#31CECE",
    borderRadius: 51,
    padding: 5,
    marginBottom: 16,
  },
  avatarBorder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 46,
    padding: 2,
    width: 92,
    height: 92,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  kidName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222128",
    marginBottom: 4,
  },
  kidAge: {
    fontSize: 16,
    color: "#666",
  },
  deviceCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  deviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  deviceLabel: {
    fontSize: 14,
    color: "#666",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  offlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
  },
  offlineText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceIcon: {
    fontSize: 18,
    width: 18,
    height: 18,
    resizeMode: "contain",
  },
  deviceName: {
    fontSize: 16,
    color: "#222128",
    fontWeight: "500",
  },
  buttonsContainer: {
    paddingHorizontal: 20,
    gap: 16,
    marginBottom: 30,
  },
  disableButton: {
    backgroundColor: "#FF6B6B",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  disableButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteButton: {
    backgroundColor: "transparent",
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222128",
  },
  infoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#222128",
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    width: "85%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#222128",
    marginBottom: 12,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelButton: {
    backgroundColor: "#F0F0F0",
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222128",
  },
  modalDeleteButton: {
    backgroundColor: "#FF6B6B",
  },
  modalDeleteButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
