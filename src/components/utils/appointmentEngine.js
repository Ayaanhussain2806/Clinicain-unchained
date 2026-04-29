export class AppointmentEngine {
  constructor(start = 9, end = 17, interval = 30) {
    this.start = start;
    this.end = end;
    this.interval = interval;
  }

  generateSlots() {
    const slots = [];
    for (let hour = this.start; hour < this.end; hour++) {
      for (let min = 0; min < 60; min += this.interval) {
        const time = `${this.format(hour)}:${this.format(min)}`;
        slots.push({
          id: `${hour}-${min}`,
          time,
          booked: false
        });
      }
    }
    return slots;
  }

  bookSlot(slots, id) {
    return slots.map(slot =>
      slot.id === id ? { ...slot, booked: true } : slot
    );
  }

  format(val) {
    return val.toString().padStart(2, "0");
  }
}