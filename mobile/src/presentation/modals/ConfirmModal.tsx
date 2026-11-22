import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import { AppButton } from '../components/AppButton';
import { AppCard } from '../components/AppCard';
import { AppText } from '../components/AppText';
import { COLORS, SPACING } from '../theme/tokens';

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  visible,
  title,
  description,
  confirmLabel,
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <AppCard style={styles.dialog}>
          <AppText variant="cardTitle" style={styles.title}>
            {title}
          </AppText>
          <AppText variant="body" color={COLORS.textSecondary} style={styles.description}>
            {description}
          </AppText>

          <View style={styles.actions}>
            <AppButton
              label={cancelLabel}
              variant="outlined"
              disabled={loading}
              onPress={onCancel}
              style={styles.btn}
            />
            <AppButton
              label={confirmLabel}
              variant="danger"
              loading={loading}
              onPress={onConfirm}
              style={styles.btn}
            />
          </View>
        </AppCard>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 30, 25, 0.45)',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  dialog: {
    padding: SPACING.lg,
  },
  title: {
    marginBottom: 8,
  },
  description: {
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  btn: {
    flex: 1,
  },
});