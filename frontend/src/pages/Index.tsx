import { ModeProvider } from "@/contexts/ModeContext";
import { ChatView } from "@/components/ChatView";

const Index = () => (
  <ModeProvider>
    <ChatView />
  </ModeProvider>
);

export default Index;
