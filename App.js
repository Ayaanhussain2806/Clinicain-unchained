import ConsultationChat from "./components/chat/ConsultationChat";
import AppointmentScheduler from "./components/AppointmentScheduler";
import ActivityPanel from "./components/ActivityPanel";

function App() {
  return (
    <div>
      <ConsultationChat />
      <AppointmentScheduler />
      <ActivityPanel />
    </div>
  );
}

export default App;