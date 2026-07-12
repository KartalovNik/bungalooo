// Диалог за потвърждение (напр. при изтриване).
import Modal from './Modal'

export default function ConfirmDialog({
  open,
  title = 'Сигурни ли сте?',
  message,
  confirmLabel = 'Потвърди',
  cancelLabel = 'Отказ',
  danger = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onCancel}>{cancelLabel}</button>
          <button
            className={danger ? 'btn btn--danger' : 'btn btn--primary'}
            onClick={onConfirm}
            autoFocus
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="confirm-msg">{message}</p>
    </Modal>
  )
}
