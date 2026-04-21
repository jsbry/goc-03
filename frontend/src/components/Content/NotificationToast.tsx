import Toast from "react-bootstrap/Toast";

function NotificationToast(props: {
  toastShow: boolean;
  handleToastClose: () => void;
  title: string;
  body: string;
}) {
  const { toastShow, handleToastClose, title, body } = props;
  return (
    <Toast
      show={toastShow}
      onClose={handleToastClose}
      className="run-toast"
      delay={5000}
      autohide
    >
      <Toast.Header closeButton={true} onClick={handleToastClose}>
        <strong className="me-auto">{title}</strong>
      </Toast.Header>
      <Toast.Body>{body}</Toast.Body>
    </Toast>
  );
}

export default NotificationToast;
