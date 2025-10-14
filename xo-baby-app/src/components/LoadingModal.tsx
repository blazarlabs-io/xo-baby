import React from "react";
import { View, Text, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface LoadingModalProps {
  visible: boolean;
  stage: "blockchain" | "encrypting" | "uploading" | "finalizing";
}

export default function LoadingModal({ visible, stage }: LoadingModalProps) {
  const getStageInfo = () => {
    switch (stage) {
      case "blockchain":
        return {
          title: "Creating Blockchain Identity",
          description:
            "Setting up wallet and creating child ID on Midnight network. This process involves complex cryptographic operations and blockchain transactions.",
          estimatedTime: "~3-5 minutes",
          additionalInfo: "Please keep the app open during this process."
        };
      case "encrypting":
        return {
          title: "Encrypting Data",
          description:
            "Securing your child's information with AES encryption...",
          estimatedTime: "~10 seconds",
          additionalInfo: ""
        };
      case "uploading":
        return {
          title: "Uploading to IPFS",
          description: "Storing encrypted data on decentralized storage...",
          estimatedTime: "~15-30 seconds",
          additionalInfo: ""
        };
      case "finalizing":
        return {
          title: "Finalizing",
          description: "Creating NFT and completing blockchain registration...",
          estimatedTime: "~1-2 minutes",
          additionalInfo: "Almost done! Please wait while we finalize everything."
        };
      default:
        return {
          title: "Processing",
          description: "Please wait...",
          estimatedTime: "",
          additionalInfo: ""
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.overlay}>
        <LinearGradient colors={["#E2F3F3", "#E2FFFF"]} style={styles.modal}>
          <View style={styles.content}>
            <ActivityIndicator size="large" color="#31CECE" />

            <Text style={styles.title}>{stageInfo.title}</Text>
            <Text style={styles.description}>{stageInfo.description}</Text>

            {stageInfo.estimatedTime && (
              <Text style={styles.timeEstimate}>
                Estimated time: {stageInfo.estimatedTime}
              </Text>
            )}

            {stageInfo.additionalInfo && (
              <Text style={styles.additionalInfo}>
                {stageInfo.additionalInfo}
              </Text>
            )}

            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: getProgressWidth(stage) },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{getProgressText(stage)}</Text>
            </View>

            {stage === "blockchain" && (
              <View style={styles.warningContainer}>
                <Text style={styles.warningText}>
                  ⚠️ Blockchain operations may take several minutes. Please be patient and keep the app open.
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </Modal>
  );
}

const getProgressWidth = (stage: string) => {
  switch (stage) {
    case "blockchain":
      return "25%";
    case "encrypting":
      return "50%";
    case "uploading":
      return "75%";
    case "finalizing":
      return "100%";
    default:
      return "0%";
  }
};

const getProgressText = (stage: string) => {
  switch (stage) {
    case "blockchain":
      return "Step 1 of 4";
    case "encrypting":
      return "Step 2 of 4";
    case "uploading":
      return "Step 3 of 4";
    case "finalizing":
      return "Step 4 of 4";
    default:
      return "Starting...";
  }
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    maxWidth: 350,
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222128",
    marginTop: 20,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 20,
  },
  timeEstimate: {
    fontSize: 12,
    color: "#31CECE",
    marginTop: 8,
    fontWeight: "500",
  },
  additionalInfo: {
    fontSize: 11,
    color: "#888",
    marginTop: 6,
    textAlign: "center",
    fontStyle: "italic",
  },
  progressContainer: {
    width: "100%",
    marginTop: 25,
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#31CECE",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 8,
  },
  warningContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "rgba(255, 193, 7, 0.1)",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 193, 7, 0.3)",
  },
  warningText: {
    fontSize: 11,
    color: "#d68910",
    textAlign: "center",
    lineHeight: 16,
  },
});
