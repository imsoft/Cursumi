import { MessageComponent } from "@/components";

const notificationMessageInfo = {
  topic: "Muchas gracias por tu mensaje",
  message: "¡Envío exitoso!",
  comment: "Te responderemos a la brevedad",
};

const confirmMessage = () => {
  return (
    <>
      <MessageComponent
        topic={notificationMessageInfo.topic}
        message={notificationMessageInfo.message}
        comment={notificationMessageInfo.comment}
      />
    </>
  );
};

export default confirmMessage;
