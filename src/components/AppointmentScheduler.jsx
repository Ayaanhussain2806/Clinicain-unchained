import React, { useEffect, useState } from "react";
import { AppointmentEngine } from "../utils/appointmentEngine";

const engine = new AppointmentEngine();

const AppointmentScheduler = () => {
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    setSlots(engine.generateSlots());
  }, []);

  const handleBook = (id) => {
    setSlots(engine.bookSlot(slots, id));
  };

  return (
    <div>
      <h2>Appointment Scheduler</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "10px" }}>
        {slots.map((slot) => (
          <button
            key={slot.id}
            disabled={slot.booked}
            onClick={() => handleBook(slot.id)}
          >
            {slot.time} {slot.booked ? "✔" : ""}
          </button>
        ))}
      </div>
    </div>
  );
};

export default AppointmentScheduler;