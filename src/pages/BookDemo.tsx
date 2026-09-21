import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar, Clock, Mail, User, Phone, CheckCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Link } from "react-router";

const bookingOptions = [
  {
    id: "ai",
    title: "Wanting AI",
    description: "You're looking to acquire or implement AI solutions for your business",
    icon: "🤖",
  },
  {
    id: "testing_ai",
    title: "Testing AI",
    description: "You want to test and evaluate AI agents before deploying them in production",
    icon: "🧪",
  },
  {
    id: "recruitment",
    title: "Recruitment",
    description: "You're looking to hire AI talent or build an AI team",
    icon: "👥",
  },
];

const timeSlots = [
  { time: "9:00 AM", value: "09:00" },
  { time: "10:00 AM", value: "10:00" },
  { time: "11:00 AM", value: "11:00" },
  { time: "1:00 PM", value: "13:00" },
  { time: "2:00 PM", value: "14:00" },
  { time: "3:00 PM", value: "15:00" },
  { time: "4:00 PM", value: "16:00" },
  { time: "5:00 PM", value: "17:00" },
];

export default function BookDemo() {
  const navigate = useNavigate();
  const createBooking = useMutation(api.bookings.createBooking);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [bookingType, setBookingType] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");

  // Generate a date for demo (today or tomorrow)
  const DemoDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!bookingType) {
      newErrors.bookingType = "Please select a booking type";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!selectedDate) {
      newErrors.date = "Please select a date";
    }
    if (!selectedTime) {
      newErrors.time = "Please select a time";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBookDemo = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createBooking({
        name,
        email,
        phone: phone || undefined,
        bookingType: bookingType as "ai" | "testing_ai" | "recruitment",
        preferredTime: `${selectedDate}T${selectedTime}:00`,
        notes: notes || undefined,
      });

      setBookingId(result.bookingId);
      setSubmitted(true);

      // In production, send confirmation email here
      console.log("Booking created:", {
        bookingId: result.bookingId,
        name,
        email,
        phone,
        bookingType,
        preferredTime: `${selectedDate}T${selectedTime}:00`,
        notes,
      });

      // Show confirmation email content in console for demo
      console.log(`
        ===== BOOKING CONFIRMATION EMAIL (Demo) =====
        To: ${email}
        Subject: Your Streamscale Demo is Confirmed

        Hi ${name},

        Thank you for booking a demo with Streamscale!

        Booking Details:
        - Type: ${bookingOptions.find(o => o.id === bookingType)?.title}
        - Date: ${new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        - Time: ${selectedTime}
        - Notes: ${notes || "None"}

        We'll send a calendar invite shortly.

        Best regards,
        Streamscale Team
        =========================================
      `);
    } catch (err: any) {
      setErrors({ submit: err.message });
    }
  };

  const resetForm = () => {
    setStep(1);
    setBookingType("");
    setSelectedTime("");
    setSelectedDate("");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");
    setErrors({});
    setSubmitted(false);
    setBookingId("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-gray-900 hover:text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <svg
                width="24"
                height="24"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect width="64" height="64" rx="14" fill="#09090B" />
                <path d="M14 46L32 20L50 46H14Z" fill="#FFFFFF" />
                <path d="M32 20L32 52" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
                <path d="M24 30H40" stroke="#09090B" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <span className="text-base font-medium text-gray-900">Streamscale</span>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-2">
              Book a Demo
            </h1>
            <p className="text-lg text-gray-500">
              Schedule a time to discuss how Streamscale can help you
            </p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                1
              </div>
              <div className={`w-12 h-0.5 ${step > 1 ? "bg-gray-900" : "bg-gray-200"}`} />
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                2
              </div>
              <div className={`w-12 h-0.5 ${step > 2 ? "bg-gray-900" : "bg-gray-200"}`} />
            </div>
            <div className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-500"}`}>
                3
              </div>
            </div>
          </div>

          {!submitted ? (
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                {/* Step 1: Select Booking Type */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium text-gray-900 mb-2">What brings you to Streamscale?</h2>
                      <p className="text-gray-500">Select the option that best describes your needs</p>
                    </div>

                    <RadioGroup
                      value={bookingType}
                      onValueChange={setBookingType}
                      className="space-y-3"
                    >
                      {bookingOptions.map((option) => (
                        <label
                          key={option.id}
                          className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                            bookingType === option.id
                              ? "border-gray-900 bg-gray-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{option.icon}</span>
                              <span className="font-medium text-gray-900">{option.title}</span>
                            </div>
                            <p className="text-sm text-gray-500">{option.description}</p>
                          </div>
                        </label>
                      ))}
                    </RadioGroup>

                    {errors.bookingType && (
                      <p className="text-sm text-red-500">{errors.bookingType}</p>
                    )}

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <Button
                        onClick={handleNextStep}
                        className="gap-2 bg-gray-900 hover:bg-gray-800"
                        disabled={!bookingType}
                      >
                        Continue
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Info & Schedule */}
                {step === 2 && (
                  <form onSubmit={handleBookDemo} className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium text-gray-900 mb-2">
                        Tell us about yourself
                      </h2>
                      <p className="text-gray-500">We'll use this to prepare for our conversation</p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-700">Full Name <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="pl-10 border-gray-300"
                          />
                        </div>
                        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-700">Email <span className="text-red-500">*</span></Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10 border-gray-300"
                          />
                        </div>
                        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">Phone (Optional)</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Preferred Date <span className="text-red-500">*</span></Label>
                      <Input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        className="border-gray-300"
                      />
                      {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-700">Preferred Time <span className="text-red-500">*</span></Label>
                      <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map((slot) => (
                          <button
                            key={slot.value}
                            type="button"
                            onClick={() => setSelectedTime(slot.value)}
                            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                              selectedTime === slot.value
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            {slot.time}
                          </button>
                        ))}
                      </div>
                      {errors.time && <p className="text-sm text-red-500">{errors.time}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-gray-700">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Anything specific you'd like us to know or prepare for?"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="border-gray-300"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 bg-gray-900 hover:bg-gray-800"
                      >
                        Review
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                )}

                {/* Step 3: Review & Confirm */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-medium text-gray-900 mb-2">Review Your Booking</h2>
                      <p className="text-gray-500">Please confirm the details below</p>
                    </div>

                    <div className="space-y-4 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-white">
                          {bookingOptions.find(o => o.id === bookingType)?.icon}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Demo Type</p>
                          <p className="font-medium text-gray-900">
                            {bookingOptions.find(o => o.id === bookingType)?.title}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Date & Time</p>
                          <p className="font-medium text-gray-900">
                            {selectedDate && (
                              <>
                                {new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                                {" at "}
                                {timeSlots.find(s => s.value === selectedTime)?.time}
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Name</p>
                          <p className="font-medium text-gray-900">{name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium text-gray-900">{email}</p>
                        </div>
                      </div>

                      {phone && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Phone className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium text-gray-900">{phone}</p>
                          </div>
                        </div>
                      )}

                      {notes && (
                        <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <span className="text-lg">📝</span>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Notes</p>
                            <p className="text-gray-900">{notes}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1 border-gray-300 hover:bg-gray-50"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        onClick={handleBookDemo}
                        className="flex-1 gap-2 bg-gray-900 hover:bg-gray-800"
                      >
                        Confirm Booking
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            // Success State
            <Card className="border-gray-200 text-center">
              <CardContent className="pt-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  Thank you for booking a demo with Streamscale. We've sent a confirmation email with all the details.
                </p>

                <div className="p-4 rounded-lg bg-gray-50 border border-gray-200 text-left mb-6">
                  <h3 className="font-medium text-gray-900 mb-3">Confirmation Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Reference ID:</span>
                      <span className="font-mono text-gray-900">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type:</span>
                      <span className="text-gray-900">{bookingOptions.find(o => o.id === bookingType)?.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-900">
                        {selectedDate && new Date(selectedDate).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Time:</span>
                      <span className="text-gray-900">{timeSlots.find(s => s.value === selectedTime)?.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900">{email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50"
                  >
                    Book Another Time
                  </Button>
                  <Button
                    onClick={() => navigate("/")}
                    className="bg-gray-900 hover:bg-gray-800"
                  >
                    Back to Home
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
