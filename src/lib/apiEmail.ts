export const sendEmail = async (
  name: string,
  email: string,
  phoneNumber: string,
  message: string
) => {
  const newMessage = {
    newName: name,
    newEmail: email,
    newPhoneNumber: phoneNumber,
    newMessage: message,
  };

  fetch("/api/email", {
    method: "POST",
    body: JSON.stringify(newMessage),
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  }).then((res) => {
    if (!res.ok) throw new Error("Hubo un error al enviar tu mensaje...");
    return res.json();
  });
};
