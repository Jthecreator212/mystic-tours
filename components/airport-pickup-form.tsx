"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, PlaneLanding, PlaneTakeoff } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { createAirportPickupBooking } from "@/app/actions/airport-pickup-actions"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { airportPickupSchema } from "@/lib/form-schemas"
import { AirportPickupConfirmationDialog } from "./airport-pickup-confirmation-dialog"

export function AirportPickupForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")
  const [isError, setIsError] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [bookingResult, setBookingResult] = useState<any>(null)
  const [currentFormValues, setCurrentFormValues] = useState<any>(null)

  const form = useForm<z.infer<typeof airportPickupSchema>>({
    resolver: zodResolver(airportPickupSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    defaultValues: {
      customer_name: "",
      customer_email: "",
      customer_phone: "",
      service_type: "pickup",
      flight_number: "",
      arrival_date: undefined,
      arrival_time: "14:00",
      dropoff_location: "",
      departure_flight_number: "",
      departure_date: undefined,
      departure_time: "10:00",
      pickup_location: "",
      passengers: 1,
    },
  })

  // Debug: Watch form state changes
  const formValues = form.watch();
  const formErrors = form.formState.errors;
  
  useEffect(() => {
    console.log("🔄 Form Values Changed:", formValues);
  }, [formValues]);
  
  useEffect(() => {
    console.log("❌ Form Errors Changed:", formErrors);
  }, [formErrors]);

  const selectedServiceType = form.watch("service_type")

  const handleServiceTypeChange = (newType: "pickup" | "dropoff" | "both") => {
    // Only clear service-specific fields, preserve customer information
    form.setValue("service_type", newType);
    form.setValue("flight_number", "");
    form.setValue("arrival_date", undefined);
    form.setValue("arrival_time", "14:00");
    form.setValue("dropoff_location", "");
    form.setValue("departure_flight_number", "");
    form.setValue("departure_date", undefined);
    form.setValue("departure_time", "10:00");
    form.setValue("pickup_location", "");
    // Keep customer_name, customer_email, customer_phone, passengers intact
  }

  const getPrice = () => {
    switch (selectedServiceType) {
      case "pickup": return 75.00;
      case "dropoff": return 75.00;
      case "both": return 140.00;
      default: return 0;
    }
  }

  async function onSubmit(values: z.infer<typeof airportPickupSchema>) {
    console.log("🚀 Form submission started");
    console.log("📝 Form values:", values);
    
    // Test email validation directly
    console.log("🧪 Direct email validation test:");
    const emailValidation = airportPickupSchema.safeParse(values);
    console.log("📊 Validation result:", emailValidation);
    
    setIsSubmitting(true)
    setSubmitMessage("")
    setIsError(false)

    try {
      console.log("📞 Calling createAirportPickupBooking...");
      const result = await createAirportPickupBooking(values);
      console.log("📥 Server response:", result);

      if (result.success) {
        console.log("✅ Success!");
        setCurrentFormValues(values);
        setBookingResult(result);
        setShowConfirmation(true);
        // Reset fields individually to maintain type safety
        const currentServiceType = form.getValues("service_type");
        form.setValue("customer_name", "");
        form.setValue("customer_email", "");
        form.setValue("customer_phone", "");
        form.setValue("service_type", currentServiceType);
        form.setValue("flight_number", "");
        form.setValue("arrival_date", undefined);
        form.setValue("arrival_time", "14:00");
        form.setValue("dropoff_location", "");
        form.setValue("departure_flight_number", "");
        form.setValue("departure_date", undefined);
        form.setValue("departure_time", "10:00");
        form.setValue("pickup_location", "");
        form.setValue("passengers", 1);
      } else {
        console.log("❌ Error:", result.message);
        setSubmitMessage(result.message || "An unexpected error occurred.");
        setIsError(true);
      }
    } catch (error) {
      console.error("Network error:", error);
      setSubmitMessage("Network error. Please check your connection and try again.");
      setIsError(true);
    }

    setIsSubmitting(false)
    console.log("🏁 Form submission completed");
  }

  return (
    <>
      <div className="bg-white/50 p-8 rounded-2xl shadow-lg border border-black/10 backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          {/* Customer Information Section */}
          <div className="space-y-6">
            <h2 className="text-2xl font-playfair text-[#1a5d1a] border-b border-yellow-300/80 pb-3">
              Your Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => {
                  // Debug logging for email field
                  console.log("🔍 Email Field Debug:", {
                    value: field.value,
                    formState: form.formState.errors.customer_email,
                    isDirty: form.formState.dirtyFields.customer_email,
                    isTouched: form.formState.touchedFields.customer_email,
                    isValid: !form.formState.errors.customer_email,
                    allErrors: form.formState.errors
                  });
                  
                  return (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="john.doe@example.com" 
                          {...field}
                          onChange={(e) => {
                            console.log("📧 Email onChange:", e.target.value);
                            field.onChange(e);
                          }}
                          onBlur={(e) => {
                            console.log("📧 Email onBlur:", e.target.value);
                            const trimmedValue = e.target.value.trim();
                            console.log("📧 Email trimmed:", trimmedValue);
                            field.onChange(trimmedValue);
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="customer_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="So we can contact you if needed" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="passengers"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Passengers</FormLabel>
                  <FormControl>
                    <Input type="number" min="1" max="10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Service Selection Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-playfair text-[#1a5d1a] border-b border-yellow-300/80 pb-3">
              Select Service
            </h2>
            <FormField
              control={form.control}
              name="service_type"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup 
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleServiceTypeChange(value as "pickup" | "dropoff" | "both");
                      }}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      <FormItem>
                        <FormControl>
                          <RadioGroupItem value="pickup" className="sr-only" />
                        </FormControl>
                        <FormLabel className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                          field.value === 'pickup' && "border-[#d83f31] bg-yellow-50/50"
                        )}>
                          <PlaneLanding className="mb-3 h-6 w-6" />
                          Airport Pickup
                          <span className="font-bold text-sm mt-1">$75</span>
                        </FormLabel>
                      </FormItem>
                       <FormItem>
                        <FormControl>
                          <RadioGroupItem value="dropoff" className="sr-only" />
                        </FormControl>
                        <FormLabel className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                          field.value === 'dropoff' && "border-[#d83f31] bg-yellow-50/50"
                        )}>
                          <PlaneTakeoff className="mb-3 h-6 w-6" />
                          Airport Drop-off
                          <span className="font-bold text-sm mt-1">$75</span>
                        </FormLabel>
                      </FormItem>
                       <FormItem>
                        <FormControl>
                          <RadioGroupItem value="both" className="sr-only" />
                        </FormControl>
                        <FormLabel className={cn(
                          "flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all",
                          field.value === 'both' && "border-[#d83f31] bg-yellow-50/50"
                        )}>
                          <div className="flex gap-2 mb-3"><PlaneLanding className="h-6 w-6" /><PlaneTakeoff className="h-6 w-6" /></div>
                          Round Trip
                          <span className="font-bold text-sm mt-1">$140</span>
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Conditional Details Sections */}
          <div className="space-y-6">
            {(selectedServiceType === 'pickup' || selectedServiceType === 'both') && (
              <div className="space-y-4 p-5 border border-yellow-300/80 rounded-lg bg-yellow-50/30 shadow-sm transition-all duration-500 ease-in-out">
                <h3 className="font-playfair text-xl text-[#1a5d1a] flex items-center gap-3 border-b border-yellow-300/80 pb-2">
                  <PlaneLanding className="w-6 h-6 text-[#e9b824]" />
                  Arrival Details
                </h3>
                {form.formState.errors.flight_number?.message?.includes('arrival') && (
                  <div className="text-sm font-medium text-destructive bg-red-100 p-3 rounded-md">
                    {form.formState.errors.flight_number.message}
                  </div>
                )}
                <FormField control={form.control} name="flight_number" render={({ field }) => (<FormItem><FormLabel>Arrival Flight Number</FormLabel><FormControl><Input placeholder="e.g., AA1234" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="arrival_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Arrival Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value && field.value instanceof Date ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(0, 0, 0, 0);
                          return date < tomorrow;
                        }} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="arrival_time" render={({ field }) => (<FormItem><FormLabel>Arrival Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="dropoff_location" render={({ field }) => (<FormItem><FormLabel>Drop-off Location</FormLabel><FormControl><Input placeholder="e.g., Villa, Airbnb, Private Residence" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
            
            {(selectedServiceType === 'dropoff' || selectedServiceType === 'both') && (
              <div className="space-y-4 p-5 border border-yellow-300/80 rounded-lg bg-yellow-50/30 shadow-sm transition-all duration-500 ease-in-out">
                <h3 className="font-playfair text-xl text-[#1a5d1a] flex items-center gap-3 border-b border-yellow-300/80 pb-2">
                  <PlaneTakeoff className="w-6 h-6 text-[#e9b824]" />
                  Departure Details
                </h3>
                {form.formState.errors.departure_flight_number?.message?.includes('departure') && (
                  <div className="text-sm font-medium text-destructive bg-red-100 p-3 rounded-md">
                    {form.formState.errors.departure_flight_number.message}
                  </div>
                )}
                <FormField control={form.control} name="departure_flight_number" render={({ field }) => (<FormItem><FormLabel>Departure Flight Number</FormLabel><FormControl><Input placeholder="e.g., DL5678" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="departure_date" render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild><FormControl><Button variant={"outline"} className={cn("w-full justify-start text-left font-normal",!field.value && "text-muted-foreground")}><CalendarIcon className="mr-2 h-4 w-4" />{field.value && field.value instanceof Date ? format(field.value, "PPP") : (<span>Pick a date</span>)}</Button></FormControl></PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => {
                          const tomorrow = new Date();
                          tomorrow.setDate(tomorrow.getDate() + 1);
                          tomorrow.setHours(0, 0, 0, 0);
                          return date < tomorrow;
                        }} initialFocus />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="departure_time" render={({ field }) => (<FormItem><FormLabel>Departure Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="pickup_location" render={({ field }) => (<FormItem><FormLabel>Pickup Location</FormLabel><FormControl><Input placeholder="e.g., Villa, Airbnb, Private Residence" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full text-lg vintage-button" disabled={isSubmitting}>
            {isSubmitting ? "Booking..." : `Book Now ($${getPrice().toFixed(2)})`}
          </Button>

          {submitMessage && (
             <div className={`text-center p-4 mt-4 rounded-md ${isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                {submitMessage}
            </div>
          )}
        </form>
      </Form>
    </div>
    
    {/* Confirmation Dialog */}
    {showConfirmation && bookingResult && currentFormValues && (
      <AirportPickupConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        bookingDetails={{
          customerName: currentFormValues.customer_name,
          customerEmail: currentFormValues.customer_email,
          customerPhone: currentFormValues.customer_phone,
          serviceType: currentFormValues.service_type,
          passengers: currentFormValues.passengers,
          flightNumber: currentFormValues.flight_number,
          arrivalDate: currentFormValues.arrival_date,
          arrivalTime: currentFormValues.arrival_time,
          departureFlightNumber: currentFormValues.departure_flight_number,
          departureDate: currentFormValues.departure_date,
          departureTime: currentFormValues.departure_time,
          dropoffLocation: currentFormValues.dropoff_location,
          pickupLocation: currentFormValues.pickup_location,
          totalAmount: getPrice(),
          bookingId: bookingResult.bookingId || 'N/A'
        }}
      />
    )}
    </>
  )
} 