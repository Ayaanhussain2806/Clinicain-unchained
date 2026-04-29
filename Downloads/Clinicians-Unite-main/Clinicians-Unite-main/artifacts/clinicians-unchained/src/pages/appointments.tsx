import { useState } from "react";
import { useListAppointments, useConfirmAppointment, useCreateAppointment, useListDoctors, getListAppointmentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calendar as CalendarIcon, Check, CreditCard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { openRazorpayCheckout } from "@/lib/paymentUtils";

export default function Appointments() {
  const { data: appointments, isLoading } = useListAppointments();
  const confirmAppointment = useConfirmAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { patient } = useAuth();
  const [paymentState, setPaymentState] = useState<{ appointmentId: number; email: string; phone: string } | null>(null);
  const [confirmingId, setConfirmingId] = useState<number | null>(null);

  const handleInitiatePayment = async (appointmentId: number, email: string = "", phone: string = "") => {
    setConfirmingId(appointmentId);
    try {
      // Get patient info from local storage or context
      const userEmail = email || patient?.email || "";
      const userPhone = phone || patient?.phone || "";

      if (!userEmail || !userPhone) {
        toast({ 
          variant: "destructive", 
          title: "Missing Information", 
          description: "Please provide email and phone number" 
        });
        setConfirmingId(null);
        return;
      }

      // Call backend to initiate payment
      const response = await fetch(`/api/appointments/${appointmentId}/initiate-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, phone: userPhone }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({ 
          variant: "destructive", 
          title: "Payment Failed", 
          description: error.error || "Failed to initiate payment" 
        });
        setConfirmingId(null);
        return;
      }

      const paymentData = await response.json();

      if (!paymentData.success) {
        toast({ 
          variant: "destructive", 
          title: "Payment Failed", 
          description: paymentData.error || "Failed to initiate payment" 
        });
        setConfirmingId(null);
        return;
      }

      setPaymentState({ appointmentId, email: userEmail, phone: userPhone });

      // Open Razorpay checkout
      openRazorpayCheckout({
        key: paymentData.keyId,
        orderId: paymentData.orderId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        email: userEmail,
        phone: userPhone,
        appointmentId,
        patientName: patient?.name || "Patient",
        onSuccess: handlePaymentSuccess,
        onFailure: handlePaymentFailure,
      });
    } catch (err: any) {
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: err.message || "An error occurred" 
      });
      setConfirmingId(null);
    }
  };

  const handlePaymentSuccess = async (paymentDetails: any) => {
    if (!paymentState) return;

    try {
      // Verify payment on backend
      const response = await fetch(`/api/appointments/${paymentState.appointmentId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpayOrderId: paymentDetails.razorpayOrderId,
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Payment verification failed");
      }

      const result = await response.json();

      toast({
        title: "Payment Successful",
        description: "Your appointment has been confirmed and paid",
      });
      
      queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
      setPaymentState(null);
      setConfirmingId(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Verification Failed",
        description: err.message || "Payment verification failed",
      });
      setConfirmingId(null);
    }
  };

  const handlePaymentFailure = (error: any) => {
    toast({
      variant: "destructive",
      title: "Payment Failed",
      description: error.message || "Payment was not completed",
    });
    setPaymentState(null);
    setConfirmingId(null);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-1">Manage doctor appointments.</p>
        </div>
        <BookAppointmentDialog />
      </div>

      <Card className="border-slate-200 shadow-sm flex-1 flex flex-col min-h-0">
        <CardContent className="p-0 flex-1 overflow-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <CalendarIcon className="h-12 w-12 text-slate-300 mb-4" />
              <p>No appointments scheduled.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50/50 sticky top-0 z-10 shadow-sm">
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-slate-50">
                    <TableCell className="font-medium">
                      {format(new Date(appointment.scheduledAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell>{appointment.patientName || `Patient #${appointment.patientId}`}</TableCell>
                    <TableCell>{appointment.doctorName || `Doctor #${appointment.doctorId}`}</TableCell>
                    <TableCell><StatusBadge status={appointment.status} /></TableCell>
                    <TableCell>
                      {appointment.paymentStatus ? (
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          appointment.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {appointment.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {appointment.status === 'pending' && appointment.paymentStatus !== 'completed' && (
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => handleInitiatePayment(appointment.id)}
                          disabled={confirmingId === appointment.id}
                        >
                          {confirmingId === appointment.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          ) : (
                            <CreditCard className="h-3 w-3 mr-2" />
                          )}
                          Pay & Confirm
                        </Button>
                      )}
                      {appointment.paymentStatus === 'completed' && (
                        <div className="flex items-center text-green-600 text-sm">
                          <Check className="h-4 w-4 mr-1" />
                          <span>Confirmed</span>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BookAppointmentDialog() {
  const [open, setOpen] = useState(false);
  const { data: doctors } = useListDoctors();
  const createAppointment = useCreateAppointment();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { patient } = useAuth();
  
  const [doctorId, setDoctorId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [patientIdStr, setPatientIdStr] = useState(patient?.id ? String(patient.id) : "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !scheduledAt || !patientIdStr) return;
    
    createAppointment.mutate({
      data: {
        patientId: parseInt(patientIdStr, 10),
        doctorId: parseInt(doctorId, 10),
        scheduledAt: new Date(scheduledAt).toISOString()
      }
    }, {
      onSuccess: () => {
        toast({ title: "Appointment Created", description: "Successfully scheduled." });
        queryClient.invalidateQueries({ queryKey: getListAppointmentsQueryKey() });
        setOpen(false);
        setDoctorId("");
        setScheduledAt("");
      },
      onError: (err: any) => {
        toast({ variant: "destructive", title: "Error", description: err.message || "Failed to create appointment." });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><CalendarIcon className="mr-2 h-4 w-4" /> Book Appointment</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Book Appointment</DialogTitle>
            <DialogDescription>
              Schedule a new visit with a doctor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="patientId">Patient ID</Label>
              <Input 
                id="patientId" 
                type="number" 
                value={patientIdStr} 
                onChange={(e) => setPatientIdStr(e.target.value)} 
                required 
                disabled={!!patient}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="doctor">Doctor</Label>
              <Select value={doctorId} onValueChange={setDoctorId} required>
                <SelectTrigger id="doctor">
                  <SelectValue placeholder="Select a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors?.map(doc => (
                    <SelectItem key={doc.id} value={String(doc.id)}>
                      {doc.name} - {doc.specialization}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="datetime">Date and Time</Label>
              <Input 
                id="datetime" 
                type="datetime-local" 
                value={scheduledAt} 
                onChange={(e) => setScheduledAt(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={createAppointment.isPending}>
              {createAppointment.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
