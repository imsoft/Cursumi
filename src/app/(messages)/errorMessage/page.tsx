import { MessageComponent } from "@/components";

const notificationMessageInfo = {
  topic: "Hubo un error al enviar un mensaje",
  message: "Perdón por las molestias",
  comment: "Te recomendamos volver a mandar el mensaje",
};

const errorMessage = () => {
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

export default errorMessage;
