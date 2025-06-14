import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type ConfirmationModalProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
};

export default function ConfirmationModal({
  visible,
  onClose,
  onConfirm,
  message,
}: ConfirmationModalProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.dividerHorizontal} />
          <View style={styles.buttonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.dividerVertical} />
            <TouchableOpacity onPress={onConfirm} style={styles.confirmButton}>
              <Text style={styles.confirmText}>Confirm</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  message: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
    padding: 10,
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    padding: 15,
    textAlign: "center",
    width: "48%",
    alignItems: "center",
  },
  cancelText: {
    color: "#FF0000",
    fontSize: 16,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: "#E0E0E0",
    marginHorizontal: 5,
  },
  confirmButton: {
    padding: 15,
    width: "48%",
    alignItems: "center",
  },
  confirmText: {
    color: "#007AFF",
    fontSize: 16,
  },
});
