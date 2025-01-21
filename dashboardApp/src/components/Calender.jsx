import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { FiCheckCircle } from "react-icons/fi";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

import {
  Phone,
  Mail,
  CalendarCheck2,
  CircleUser,
  HandPlatter,
  Info,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
export default function Calendar() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const dialogRef = useRef();
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [editedDescription, setEditedDescription] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (!user) {
      navigate("/");
    } else {
      setIsLoading(false);
      fetchReservations();
    }
  }, [navigate]);

  const fetchReservations = async () => {
    try {
      const response = await fetch(
        "https://beautyfrenchhm-55cg.onrender.com/reserve"
      ); // Assurez-vous que l'URL correspond à votre configuration backend
      const data = await response.json();
      const formattedEvents = data.reservations.map((reservation) => ({
        title: `${reservation.service} - ${reservation.client_firstname}`,
        start: `${reservation.date}T${reservation.time_slot}`,
        time: `${reservation.time_slot}`,
        service: reservation.service,
        description: reservation.description,
        clientName: `${reservation.client_firstname} ${reservation.client_name}`,
        clientEmail: reservation.client_email,
        clientPhone: reservation.client_phone,
        id: reservation.id,
        last_reservation:
          reservation.last_reservation !== null
            ? reservation.last_reservation
            : false,
      }));
      setEvents(formattedEvents);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des réservations:", error);
    }
  };

  const handleEventClick = (arg) => {
    const event = arg.event;
    setSelectedEvent(event);

    const isFinished = event.extendedProps.last_reservation;
    setIsFinished(isFinished);
    setEditedDescription(event.extendedProps.description || "");
    showDialog();
  };

  const showDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.click();
    }
  };

  const handleFinishClick = async () => {
    if (!selectedEvent?.id) {
      console.error("Error: Event ID is missing.");
      return;
    }

    try {
      const response = await axios.post(
        `https://beautyfrenchhm-55cg.onrender.com/reserve/${selectedEvent.id}/finish`,
        {
          last_reservation: !isFinished,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedEvent = {
          ...selectedEvent,
          last_reservation: !isFinished,
        };

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        setIsFinished(!isFinished);
        fetchReservations();
      } else {
        console.error("Error updating reservation:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  const handleEditDescriptionClick = async () => {
    if (!selectedEvent?.id) {
      console.error("Error: Event ID is missing.");
      return;
    }

    try {
      const response = await axios.patch(
        `https://beautyfrenchhm-55cg.onrender.com/reserve/${selectedEvent.id}/description`,
        {
          description: editedDescription,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const updatedEvent = {
          ...selectedEvent,
          extendedProps: {
            ...selectedEvent.extendedProps,
            description: editedDescription,
          },
        };

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === updatedEvent.id ? updatedEvent : event
          )
        );
        fetchReservations();
        toast({
          title: "Description updated successfully!",
          status: "success",
          className: "bg-[#008000]",
        });
      } else {
        console.error("Error updating description:", response.statusText);
      }
    } catch (error) {
      console.error("Error:", error.message);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const eventDetails = selectedEvent
    ? {
        title: selectedEvent.title,
        start: selectedEvent.start ? selectedEvent.start.toLocaleString() : "",
        end: selectedEvent.end ? selectedEvent.end.toLocaleString() : "",
        time: selectedEvent.extendedProps.time,
        service: selectedEvent.extendedProps.service,
        clientName: selectedEvent.extendedProps.clientName,
        clientEmail: selectedEvent.extendedProps.clientEmail,
        clientPhone: selectedEvent.extendedProps.clientPhone,
        description: selectedEvent.extendedProps.description,
      }
    : null;

  return (
    <div style={{ width: "100%", height: "98vh" }} className="text-white m-5">
      <Toaster />
      <AlertDialog>
        <AlertDialogTrigger
          ref={dialogRef}
          style={{ display: "none" }}
        ></AlertDialogTrigger>
        <AlertDialogContent className="bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-black text-2xl  mb-5">
              {eventDetails && <strong>{eventDetails.title}</strong>}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {eventDetails && (
                <>
                  <ul className="list-none pl-0 space-y-3">
                    <li className="flex items-start">
                      <span className="flex font-bold	 text-black min-w-[120px] text-lg">
                        <CalendarCheck2 /> &nbsp; Time:
                      </span>
                      <span className="font-bold text-black text-lg">
                        {eventDetails.time}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex font-bold	 text-black min-w-[120px] text-lg">
                        <HandPlatter /> &nbsp; Service:
                      </span>
                      <span className="font-bold text-black text-lg">
                        {eventDetails.service}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex font-bold text-black min-w-[120px] text-lg">
                        <Info /> &nbsp; Info:
                      </span>
                      <textarea
                        className="font-bold text-black text-lg"
                        value={editedDescription}
                        onChange={(e) => setEditedDescription(e.target.value)}
                        rows="3"
                      />
                    </li>
                    <li className="flex items-start">
                      <span className="flex font-bold	 text-black min-w-[120px] text-lg">
                        <CircleUser /> &nbsp; Name:
                      </span>
                      <span className="font-bold text-black text-lg">
                        {eventDetails.clientName}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex font-bold	 text-black min-w-[120px] text-lg">
                        <Mail /> &nbsp; Email:&nbsp;
                      </span>
                      <span className="font-bold text-black text-lg">
                        {eventDetails.clientEmail}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="flex font-bold	 text-black min-w-[120px] text-lg">
                        <Phone /> &nbsp; Phone:
                      </span>
                      <span className="font-bold text-black text-lg">
                        {eventDetails.clientPhone}
                      </span>
                    </li>
                  </ul>
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={handleEditDescriptionClick}
              className="transition-all duration-300 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save Description
            </Button>
            <Button
              onClick={handleFinishClick}
              className={`transition-all duration-300 ${
                isFinished
                  ? "!bg-red-500 text-white"
                  : "!bg-green-500 text-white transform scale-105"
              } px-4 py-2 rounded`}
            >
              {isFinished ? (
                <>Cancel Package Finished</>
              ) : (
                <>
                  <FiCheckCircle /> &nbsp; Package Finished
                </>
              )}
            </Button>
            <AlertDialogAction>Close</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FullCalendar */}
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
        initialView="listWeek"
        slotLabelFormat={{
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          meridiem: false,
        }}
        headerToolbar={{
          start: "today prev,next",
          center: "title",
          end: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        events={events}
        height="100%"
        selectable={true}
        eventClick={handleEventClick}
        eventContent={(eventInfo) => (
          <div className="flex items-center">
            <span
              className={`fc-event-dot ${
                eventInfo.event.extendedProps.last_reservation
                  ? "bg-red-500"
                  : "bg-blue-500"
              }`}
              style={{
                marginRight: "10px",
                borderRadius: "50%",
                width: "10px",
                height: "10px",
              }}
            ></span>
            <span
              className={`fc-event-title ${
                eventInfo.event.extendedProps.last_reservation
                  ? "text-white"
                  : ""
              }`}
            >
              {eventInfo.event.title}
            </span>
          </div>
        )}
      />
    </div>
  );
}
