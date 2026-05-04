import "./ChatMessageBox.css";

function ChatMessageBox({ userName, sender, message }) {
  const isMyChat = userName === sender;

  return (
    <div className={isMyChat ? "my-chat" : "other-chat"}>
      {/* <div className="sender">{userName}</div> */}
      <div className="sender">{sender}</div>
      <div className="content">{message}</div>
    </div>
  );
}

export default ChatMessageBox;
