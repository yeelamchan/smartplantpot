import Head from "next/head";
import { Inter } from "@next/font/google";
import styles from "@/styles/Home.module.css";
import { useEffect, useState } from "react";
import React from "react";
import * as Slider from "@radix-ui/react-slider";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

const inter = Inter({ subsets: ["latin"] });

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  query,
  onValue,
  limitToLast,
} from "firebase/database";
import { scales } from "chart.js/auto";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

const firebaseConfig = {
  apiKey: "AIzaSyBkhAublGaFV2yjuY1M0nfx3QA4bTFXCWs",
  authDomain: "aistfypgp0.firebaseapp.com",
  databaseURL: "https://aistfypgp0-default-rtdb.firebaseio.com",
  projectId: "aistfypgp0",
  storageBucket: "aistfypgp0.appspot.com",
  messagingSenderId: "911309123203",
  appId: "1:911309123203:web:26c88ea0d94debcb7c35b6",
  measurementId: "G-YQEJXNNM8M",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default function Home() {
  const [hum, setHum] = useState(0);
  const [temp, setTemp] = useState(0);
  const [time, setTime] = useState("N/A");
  const [water, setWater] = useState(0);
  const [moisture, setMoisture] = useState(0);
  const [recordNo, setRecordNo] = useState(24);
  const humList = [];
  const tempList = [];
  const timeList = [];
  const waterList = [];
  const moistureList = [];
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const lastRecordRef = query(ref(db, "ESP32_APP/"), limitToLast(1));
    onValue(lastRecordRef, (snapshot) => {
      const lastRecord = snapshot.val();

      for (var value in lastRecord) {
        setHum(lastRecord[value].humidity);
        setTemp(lastRecord[value].temperature);
        setTime(
          new Date(Number(lastRecord[value].timestamp * 1000)).toLocaleString(
            "en-GB",
            { dateStyle: "medium", timeStyle: "medium" }
          )
        );
        setWater(lastRecord[value].water);
        setMoisture(lastRecord[value].moisture);
      }

      if (lastRecord[value].water <= 1100) {
        setOpen(true)
      } else {
        setOpen(false)
      }
    });
  }, []);

  const dataRef = query(ref(db, "ESP32_APP/"), limitToLast(24));
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();

    for (var value in data) {
      humList.push(data[value].humidity);
      tempList.push(data[value].temperature);
      timeList.push(
        new Date(Number(data[value].timestamp * 1000)).toLocaleString("en-GB", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      );
      waterList.push(data[value].water);
      moistureList.push(data[value].moisture);
    }
  });

  const timeData = timeList.slice(timeList.length - recordNo);
  const humData = humList.slice(humList.length - recordNo);
  const tempData = tempList.slice(tempList.length - recordNo);
  const waterData = waterList.slice(waterList.length - recordNo);
  const moistureData = moistureList.slice(moistureList.length - recordNo);

  const humChart = {
    labels: timeData,
    datasets: [
      {
        label: "Humidity",
        data: humData,
        borderColor: "#3ac9a4",
        backgroundColor: "#a8e3d4",
      },
    ],
  };

  const tempChart = {
    labels: timeData,
    datasets: [
      {
        label: "Temperature",
        data: tempData,
        borderColor: "#FF6384",
        backgroundColor: "#FFB1C1",
      },
    ],
  };

  const waterChart = {
    labels: timeData,
    datasets: [
      {
        label: "Water Level",
        data: waterData,
      },
    ],
  };

  const moistureChart = {
    labels: timeData,
    datasets: [
      {
        label: "Soil Moisture",
        data: moistureData,
        borderColor: "#fad73c",
        backgroundColor: "#f7eaad",
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <>
      <Head>
        <title>Smart Plant Pot</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <p>Smart Plant Pot</p>
        </div>

        <div className={styles.chartGrid}>
          <div className={styles.chart}>
            <h2>Humidity (%)</h2>
            <Line data={humChart} options={chartOptions} />
          </div>

          <div className={styles.chart}>
            <h2>Temperature (°C)</h2>
            <Line data={tempChart} options={chartOptions} />
          </div>

          <div className={styles.chart}>
            <h2>Water Level</h2>
            <Line data={waterChart} options={chartOptions} />
          </div>

          <div className={styles.chart}>
            <h2>Soil Moisture</h2>
            <Line data={moistureChart} options={chartOptions} />
          </div>
        </div>

        <AlertDialog.Root open={open} onOpenChange={setOpen}>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className={styles.AlertDialogOverlay} />
            <AlertDialog.Content className={styles.AlertDialogContent}>
              <AlertDialog.Title className={styles.AlertDialogTitle}>
                Water Level Alert
              </AlertDialog.Title>
              <AlertDialog.Description
                className={styles.AlertDialogDescription}
              >
                Water level is at {water}. Please add more water to the tank.
              </AlertDialog.Description>
              <AlertDialog.Action asChild>
                <button
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  Understood
                </button>
              </AlertDialog.Action>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>

        <form>
          <Slider.Root
            className={styles.SliderRoot}
            defaultValue={[recordNo]}
            min={2}
            max={24}
            step={1}
            aria-label="Records"
            onValueChange={(e) => setRecordNo(e[0])}
          >
            <Slider.Track className={styles.SliderTrack}>
              <Slider.Range className={styles.SliderRange} />
            </Slider.Track>
            <Slider.Thumb className={styles.SliderThumb} />
          </Slider.Root>

          <label className={inter.className}>
            Showing last {recordNo} records
          </label>
        </form>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2 className={inter.className}>Time of Last Record</h2>
            <p className={inter.className}>{time}</p>
          </div>

          <div className={styles.card}>
            <h2 className={inter.className}>Humidity</h2>
            <p className={inter.className}>{hum}</p>
          </div>

          <div className={styles.card}>
            <h2 className={inter.className}>Temperature</h2>
            <p className={inter.className}>{temp}</p>
          </div>

          <div className={styles.card}>
            <h2 className={inter.className}>Water Level</h2>
            <p className={inter.className}>{water}</p>
          </div>

          <div className={styles.card}>
            <h2 className={inter.className}>Soil Moisture</h2>
            <p className={inter.className}>{moisture}</p>
          </div>
        </div>
      </main>
    </>
  );
}
