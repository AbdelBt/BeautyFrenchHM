import { useState, useEffect } from "react";
import axios from "axios";
import { Doughnut, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { DatePickerWithRange } from "./datePickerRange";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartDataLabels
);

const Statistics = () => {
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [userData, setUserData] = useState(null);
  const [serviceData, setServiceData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer les données des réservations avec axios
  const fetchReservationData = async () => {
    try {
      const response = await axios.get(
        "https://beautyfrenchhm-55cg.onrender.com/reserve"
      );
      const reservations = response.data.reservations;

      const filteredReservations = reservations.filter((res) => {
        const reservationDate = new Date(res.date);
        const fromDate = dateRange.from ? new Date(dateRange.from) : null;
        const toDate = dateRange.to ? new Date(dateRange.to) : null;

        if (!fromDate || !toDate) {
          return false;
        }

        return reservationDate >= fromDate && reservationDate <= toDate;
      });

      console.log("Filtered Reservations:", filteredReservations);

      const allPhones = filteredReservations
        .filter((res) => res.client_phone)
        .map((res) => res.client_phone);

      const newUsers = allPhones.filter(
        (phone, index, self) => self.indexOf(phone) === self.lastIndexOf(phone)
      );
      const newUsersCount = newUsers.length;

      const returningUsersSet = new Set(
        allPhones.filter(
          (phone, index, self) =>
            self.indexOf(phone) !== self.lastIndexOf(phone)
        )
      );
      const returningUsersCount = returningUsersSet.size;

      console.log(
        "New Users:",
        newUsersCount,
        "Returning sers:",
        returningUsersCount
      );

      // Mettre à jour les données du graphique des utilisateurs
      setUserData({
        labels: ["New Clients", "Returning Clients"],
        datasets: [
          {
            data: [newUsersCount, returningUsersCount],
            backgroundColor: ["#4caf50", "#2196f3"],
            hoverBackgroundColor: ["#66bb6a", "#64b5f6"],
          },
        ],
      });

      // Traitement des données des services les plus réservés
      const serviceReservations = filteredReservations.reduce((acc, res) => {
        acc[res.service] = acc[res.service] ? acc[res.service] + 1 : 1;
        return acc;
      }, {});

      const serviceLabels = Object.keys(serviceReservations);
      const serviceCounts = Object.values(serviceReservations);

      // Mettre à jour les données du graphique des services
      setServiceData({
        labels: serviceLabels,
        datasets: [
          {
            data: serviceCounts,
            backgroundColor: ["#2196F3", "#4CAF50", "#FF5722", "#FFC107"],
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error(
        "Erreur lors de la récupération des données des réservations",
        error
      );
    }
  };

  useEffect(() => {
    fetchReservationData();
  }, [dateRange]);

  if (loading || !userData || !serviceData) {
    return <div className="p-6 text-center">Loading statistics...</div>;
  }

  const totalCustomers =
    userData.datasets[0].data.reduce((sum, val) => sum + val, 0) || 0;

  return (
    <div className="flex w-full flex-col text-white max-h-max mt-3 px-3">
      <div>
        <h1 className="text-4xl font-bold mb-5">Clients Statistics</h1>
      </div>
      <DatePickerWithRange className="mr-5" onSelect={setDateRange} />

      <div className="charts grid grid-cols-1 md:grid-cols-2 gap-8 mt-5 items-center">
        <div className="chart shadow-md rounded-lg p-6 w-4/4 border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Most Appointments</h3>
          <Bar
            data={serviceData}
            options={{
              responsive: true,
              plugins: {
                legend: false,
                datalabels: {
                  color: "white",
                },
              },
            }}
          />
        </div>
        <div className="chart shadow-md rounded-lg p-6 w-3/6 border border-gray-300">
          <h3 className="text-lg font-semibold mb-4">Clients</h3>
          <Doughnut
            data={userData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "bottom" },
                datalabels: {
                  formatter: (value, ctx) => {
                    const total = ctx.dataset.data.reduce(
                      (acc, val) => acc + val,
                      0
                    );
                    const percentage = ((value / total) * 100).toFixed(2);
                    return percentage + "%";
                  },
                  color: "white",
                },
              },
            }}
          />
          <div className="text-center text-lg mt-3 text-white">
            <p>Total Clients: {totalCustomers}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
